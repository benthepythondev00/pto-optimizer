import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createDb } from '$lib/server/db';
import { verifyWebhookSignature, syncStripeDataToDb } from '$lib/server/stripe';

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
		console.error('Invalid webhook signature');
		throw error(400, 'Invalid signature');
	}

	// Parse the event
	let event: {
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
		console.error('Failed to parse webhook payload:', err);
		throw error(400, 'Invalid payload');
	}

	console.log(`Received Stripe webhook: ${event.type}`);

	// Only process relevant events
	if (!RELEVANT_EVENTS.includes(event.type)) {
		return json({ received: true, processed: false });
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
		console.error(`No customer ID found for event ${event.type}`);
		return json({ received: true, processed: false, reason: 'no_customer_id' });
	}

	// Sync all Stripe data for this customer to our database
	// This is the key insight from t3's recommendations - always sync everything
	// to avoid split states and race conditions
	try {
		await syncStripeDataToDb(db, secretKey, customerId);
		console.log(`Successfully synced data for customer ${customerId}`);
	} catch (err) {
		console.error(`Failed to sync data for customer ${customerId}:`, err);
		// Don't throw - we want to acknowledge the webhook even if sync fails
		// Stripe will retry failed webhooks
	}

	return json({ received: true, processed: true });
};
