import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createDb } from '$lib/server/db';
import { createBillingPortalSession } from '$lib/server/stripe';

export const load: PageServerLoad = async ({ locals }) => {
	// Require authentication
	if (!locals.user) {
		throw redirect(302, '/auth/login?redirect=/account');
	}

	return {
		user: locals.user,
		subscription: locals.subscription,
		isPro: locals.isPro
	};
};

export const actions: Actions = {
	// Open Stripe billing portal
	portal: async ({ locals, platform, url }) => {
		if (!locals.user) {
			throw error(401, 'You must be logged in');
		}

		if (!platform?.env?.DB || !platform?.env?.STRIPE_SECRET_KEY) {
			throw error(500, 'Server configuration error');
		}

		const db = createDb(platform.env.DB);
		const secretKey = platform.env.STRIPE_SECRET_KEY;

		// Get user's Stripe customer ID
		const user = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, locals.user!.id)
		});

		if (!user?.stripeCustomerId) {
			throw error(400, 'No billing information found. Please subscribe first.');
		}

		try {
			const session = await createBillingPortalSession(
				secretKey,
				user.stripeCustomerId,
				url.origin + '/account'
			);

			throw redirect(303, session.url);
		} catch (err) {
			if (err instanceof Response) throw err; // Re-throw redirect
			console.error('Portal error:', err);
			throw error(500, 'Failed to open billing portal');
		}
	}
};
