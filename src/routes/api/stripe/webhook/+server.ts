import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { eq } from 'drizzle-orm';
import { createDb } from '$lib/server/db';
import { webhookEvents } from '$lib/server/db/schema';
import { verifyWebhookSignature, syncStripeDataToDb } from '$lib/server/stripe';
import { logger } from '$lib/server/logger';

// Stripe events we care about
const RELEVANT_EVENTS = [
	'customer.subscription.created',
	'customer.subscription.updated',
	'customer.subscription.deleted',
	'customer.subscription.paused',
	'customer.subscription.resumed',
	'invoice.paid',
	'invoice.payment_failed',
	'checkout.session.completed'
];

export const POST: RequestHandler = async ({ request, platform }) => {
	if (!platform?.env?.DB || !platform?.env?.STRIPE_SECRET_KEY || !platform?.env?.STRIPE_WEBHOOK_SECRET) {
		throw error(500, 'Server configuration error');
	}

	const db = createDb(platform.env.DB);
	const secretKey = platform.env.STRIPE_SECRET_KEY;
	const webhookSecret = platform.env.STRIPE_WEBHOOK_SECRET;

	// Get the raw body and signature
	const payload = await request.text();
	const signature = request.headers.get('stripe-signature');

	if (!signature) {
		throw error(400, 'Missing stripe-signature header');
	}

	// Verify webhook signature
	const isValid = await verifyWebhookSignature(payload, signature, webhookSecret);
	if (!isValid) {
		logger.error('Invalid webhook signature');
		throw error(400, 'Invalid signature');
	}

	// Parse the event
	let event: {
		id: string;
		type: string;
		data: {
			object: {
				customer?: string;
				id?: string;
				subscription?: string;
			};
		};
	};

	try {
		event = JSON.parse(payload);
	} catch (err) {
		logger.error('Failed to parse webhook payload', err);
		throw error(400, 'Invalid payload');
	}

	logger.info('Received Stripe webhook', { eventId: event.id, eventType: event.type });

	// Idempotency check - have we already processed this event?
	const existingEvent = await db.query.webhookEvents.findFirst({
		where: eq(webhookEvents.eventId, event.id)
	});

	if (existingEvent) {
		logger.info('Webhook event already processed', { eventId: event.id });
		return json({ received: true, processed: false, reason: 'already_processed' });
	}

	// Only process relevant events
	if (!RELEVANT_EVENTS.includes(event.type)) {
		// Record non-relevant events too to prevent re-processing
		await db.insert(webhookEvents).values({
			eventId: event.id,
			eventType: event.type
		}).onConflictDoNothing();
		return json({ received: true, processed: false, reason: 'not_relevant' });
	}

	// Get customer ID from the event
	let customerId: string | undefined;

	switch (event.type) {
		case 'customer.subscription.created':
		case 'customer.subscription.updated':
		case 'customer.subscription.deleted':
		case 'customer.subscription.paused':
		case 'customer.subscription.resumed':
			customerId = event.data.object.customer as string;
			break;
		case 'invoice.paid':
		case 'invoice.payment_failed':
			customerId = event.data.object.customer as string;
			break;
		case 'checkout.session.completed':
			customerId = event.data.object.customer as string;
			break;
	}

	if (!customerId) {
		logger.warn('No customer ID found for event', { eventId: event.id, eventType: event.type });
		// Still record the event to prevent re-processing
		await db.insert(webhookEvents).values({
			eventId: event.id,
			eventType: event.type
		}).onConflictDoNothing();
		return json({ received: true, processed: false, reason: 'no_customer_id' });
	}

	// Sync all Stripe data for this customer to our database
	// This is the key insight from t3's recommendations - always sync everything
	// to avoid split states and race conditions
	try {
		await syncStripeDataToDb(db, secretKey, customerId);
		
		// Record successful processing
		await db.insert(webhookEvents).values({
			eventId: event.id,
			eventType: event.type
		}).onConflictDoNothing();
		
		logger.info('Successfully synced data for customer', { customerId, eventId: event.id });
	} catch (err) {
		logger.error('Failed to sync data for customer', err, { customerId, eventId: event.id });
		// Don't throw - we want to acknowledge the webhook even if sync fails
		// Stripe will retry failed webhooks
		// Don't record the event so it can be retried
	}

	return json({ received: true, processed: true });
};
