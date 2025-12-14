import { redirect, error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createDb } from '$lib/server/db';
import { createBillingPortalSession } from '$lib/server/stripe';
import { deleteUserAccount, sessionCookie, invalidateAllUserSessions } from '$lib/server/auth';
import { logger } from '$lib/server/logger';

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
	},

	// Delete user account (GDPR compliance)
	deleteAccount: async ({ locals, platform, cookies }) => {
		if (!locals.user) {
			throw error(401, 'You must be logged in');
		}

		if (!platform?.env?.DB) {
			throw error(500, 'Server configuration error');
		}

		const db = createDb(platform.env.DB);

		try {
			// Check if user has active subscription
			if (locals.subscription && ['active', 'trialing'].includes(locals.subscription.status)) {
				return fail(400, { 
					deleteError: 'Please cancel your subscription before deleting your account. You can do this from the Manage Subscription button above.'
				});
			}

			// Delete the user account (cascades to related data)
			const success = await deleteUserAccount(db, locals.user.id);

			if (!success) {
				return fail(500, { deleteError: 'Failed to delete account. Please try again.' });
			}

			logger.info('Account deleted by user', { userId: locals.user.id });

			// Clear session cookie
			cookies.delete(sessionCookie.name, { path: '/' });

			// Redirect to home
			throw redirect(302, '/?deleted=true');
		} catch (err) {
			// Re-throw redirects
			if (err && typeof err === 'object' && 'status' in err && 'location' in err) {
				throw err;
			}
			if (err instanceof Response) throw err;

			logger.error('Account deletion failed', err, { userId: locals.user.id });
			return fail(500, { deleteError: 'Failed to delete account. Please try again.' });
		}
	}
};
