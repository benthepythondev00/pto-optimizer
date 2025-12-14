import { json, error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createDb } from '$lib/server/db';
import { ensureStripeCustomer, createCheckoutSession, STRIPE_PRICES } from '$lib/server/stripe';

export const POST: RequestHandler = async ({ request, locals, platform, url }) => {
	// Require authentication
	if (!locals.user) {
		throw error(401, 'You must be logged in to subscribe');
	}

	if (!platform?.env?.DB || !platform?.env?.STRIPE_SECRET_KEY) {
		throw error(500, 'Server configuration error');
	}

	const db = createDb(platform.env.DB);
	const secretKey = platform.env.STRIPE_SECRET_KEY;

	try {
		const body = await request.json();
		const plan = body.plan as 'monthly' | 'yearly';

		if (!plan || !['monthly', 'yearly'].includes(plan)) {
			throw error(400, 'Invalid plan selected');
		}

		// Ensure user has a Stripe customer ID
		const customerId = await ensureStripeCustomer(db, secretKey, locals.user.id);

		// Create checkout session
		const priceId = STRIPE_PRICES[plan];
		const baseUrl = url.origin;

		const session = await createCheckoutSession(secretKey, {
			customerId,
			priceId,
			successUrl: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
			cancelUrl: `${baseUrl}/?checkout=canceled`
		});

		return json({ url: session.url });
	} catch (err) {
		console.error('Checkout error:', err);
		const message = err instanceof Error ? err.message : 'Failed to create checkout session';
		throw error(500, message);
	}
};
