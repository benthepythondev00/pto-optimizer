import type { Handle } from '@sveltejs/kit';
import { createDb } from '$lib/server/db';
import { validateSession, sessionCookie, getUserSubscription } from '$lib/server/auth';

/**
 * SECURITY NOTE: Rate Limiting
 * 
 * For production, consider implementing rate limiting for:
 * - Login attempts (prevent brute force)
 * - Signup (prevent spam accounts)
 * - API endpoints (prevent abuse)
 * 
 * Options for Cloudflare:
 * 1. Cloudflare Rate Limiting Rules (dashboard)
 * 2. Cloudflare Workers Rate Limiting (KV-based)
 * 3. D1-based rate limiting with sliding window
 * 
 * Recommended limits:
 * - Login: 5 attempts per 15 minutes per IP
 * - Signup: 3 accounts per hour per IP
 * - API: 100 requests per minute per user
 */

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
	
	// Add security headers
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	
	return response;
};
