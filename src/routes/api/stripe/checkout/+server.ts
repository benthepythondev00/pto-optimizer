import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createDb } from '$lib/server/db';
import { ensureStripeCustomer, createCheckoutSession, getStripePrices } from '$lib/server/stripe';
import { checkRateLimit, getClientIP } from '$lib/server/rate-limit';
import { logger } from '$lib/server/logger';

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

	// Rate limiting - prevent checkout abuse
	const clientIP = getClientIP(request);
	const rateLimit = await checkRateLimit(db, clientIP, 'checkout');
	
	if (!rateLimit.allowed) {
		logger.warn('Checkout rate limit exceeded', { ip: clientIP, userId: locals.user.id });
		throw error(429, 'Too many checkout attempts. Please try again later.');
	}

	try {
		const body = await request.json();
		const plan = body.plan as 'monthly' | 'yearly';

		if (!plan || !['monthly', 'yearly'].includes(plan)) {
			throw error(400, 'Invalid plan selected');
		}

		// Ensure user has a Stripe customer ID
		const customerId = await ensureStripeCustomer(db, secretKey, locals.user.id);

		// Create checkout session - use env vars if available, fallback to defaults
		const prices = getStripePrices(platform.env);
		const priceId = prices[plan];
		const baseUrl = url.origin;

		const session = await createCheckoutSession(secretKey, {
			customerId,
			priceId,
			successUrl: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
			cancelUrl: `${baseUrl}/?checkout=canceled`
		});

		return json({ url: session.url });
	} catch (err) {
		logger.error('Checkout error', err, { userId: locals.user.id });
		const message = err instanceof Error ? err.message : 'Failed to create checkout session';
		throw error(500, message);
	}
};
