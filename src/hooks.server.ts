import type { Handle } from '@sveltejs/kit';
import { createDb } from '$lib/server/db';
import { validateSession, sessionCookie, getUserSubscription } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	// Initialize defaults
	event.locals.user = null;
	event.locals.session = null;
	event.locals.subscription = null;
	event.locals.isPro = false;

	// Get platform environment (Cloudflare bindings)
	const platform = event.platform;
	if (!platform?.env?.DB) {
		// No database binding - skip auth (local dev without DB)
		return resolve(event);
	}

	// Create database connection
	const db = createDb(platform.env.DB);

	// Get session cookie
	const sessionToken = event.cookies.get(sessionCookie.name);

	if (sessionToken) {
		try {
			const result = await validateSession(db, sessionToken);
			
			if (result) {
				event.locals.user = result.user;
				event.locals.session = {
					id: result.session.id,
					expiresAt: result.session.expiresAt
				};

				// Check subscription status
				const subscription = await getUserSubscription(db, result.user.id);
				if (subscription) {
					event.locals.subscription = subscription;
					event.locals.isPro = subscription.status === 'active';
				}
			} else {
				// Invalid session - clear cookie
				event.cookies.delete(sessionCookie.name, { path: '/' });
			}
		} catch (error) {
			console.error('Session validation error:', error);
			// Clear potentially corrupted session
			event.cookies.delete(sessionCookie.name, { path: '/' });
		}
	}

	const response = await resolve(event);
	return response;
};
