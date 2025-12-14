import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { syncStripeDataToDb } from '$lib/server/stripe';

export const load: PageServerLoad = async ({ url, locals, platform }) => {
	// Require authentication
	if (!locals.user) {
		throw redirect(302, '/auth/login?redirectTo=/checkout/success');
	}

	const sessionId = url.searchParams.get('session_id');
	
	if (!sessionId) {
		throw redirect(302, '/');
	}

	if (!platform?.env?.DB || !platform?.env?.STRIPE_SECRET_KEY) {
		return {
			success: false,
			message: 'Server configuration error'
		};
	}

	const db = createDb(platform.env.DB);
	const secretKey = platform.env.STRIPE_SECRET_KEY;

	try {
		// Get user's Stripe customer ID
		const user = await db.query.users.findFirst({
			where: eq(users.id, locals.user.id)
		});

		if (user?.stripeCustomerId) {
			// Eagerly sync Stripe data to avoid race condition with webhook
			// This is t3's recommendation - sync on success page arrival
			await syncStripeDataToDb(db, secretKey, user.stripeCustomerId);
		}

		return {
			success: true,
			message: 'Thank you for subscribing!'
		};
	} catch (error) {
		console.error('Error syncing after checkout:', error);
		return {
			success: true, // Still show success - webhook will handle sync
			message: 'Thank you for subscribing!'
		};
	}
};
