import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createDb } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { createBillingPortalSession } from '$lib/server/stripe';

export const POST: RequestHandler = async ({ locals, platform, url }) => {
	// Require authentication
	if (!locals.user) {
		throw error(401, 'You must be logged in');
	}

	if (!platform?.env?.DB || !platform?.env?.STRIPE_SECRET_KEY) {
		throw error(500, 'Server configuration error');
	}

	const db = createDb(platform.env.DB);
	const secretKey = platform.env.STRIPE_SECRET_KEY;

	try {
		// Get user's Stripe customer ID
		const user = await db.query.users.findFirst({
			where: eq(users.id, locals.user.id)
		});

		if (!user?.stripeCustomerId) {
			throw error(400, 'No subscription found');
		}

		// Create billing portal session
		const session = await createBillingPortalSession(
			secretKey,
			user.stripeCustomerId,
			`${url.origin}/`
		);

		return json({ url: session.url });
	} catch (err) {
		console.error('Portal error:', err);
		const message = err instanceof Error ? err.message : 'Failed to create portal session';
		throw error(500, message);
	}
};
