import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import { authenticateUser, createSession, sessionCookie, validateRedirectUrl } from '$lib/server/auth';
import { checkRateLimit, getClientIP } from '$lib/server/rate-limit';
import { logger } from '$lib/server/logger';

export const load: PageServerLoad = async ({ locals, url }) => {
	// Validate redirect URL to prevent open redirect attacks
	const redirectTo = validateRedirectUrl(url.searchParams.get('redirect'));
	
	// Redirect if already logged in
	if (locals.user) {
		throw redirect(302, redirectTo);
	}
	return {
		redirect: redirectTo === '/' ? '' : redirectTo
	};
};

export const actions: Actions = {
	default: async ({ request, platform, cookies, url }) => {
		if (!platform?.env?.DB) {
			return fail(500, { message: 'Database not available', email: '' });
		}

		const db = createDb(platform.env.DB);
		const formData = await request.formData();
		
		const email = formData.get('email')?.toString() || '';
		const password = formData.get('password')?.toString();

		// Rate limiting
		const clientIP = getClientIP(request);
		const rateLimit = await checkRateLimit(db, clientIP, 'login');
		
		if (!rateLimit.allowed) {
			logger.warn('Login rate limit exceeded', { ip: clientIP });
			return fail(429, { 
				message: `Too many login attempts. Please try again after ${rateLimit.resetAt.toLocaleTimeString()}.`, 
				email 
			});
		}

		// Validation
		if (!email || !password) {
			return fail(400, { message: 'Email and password are required', email });
		}

		try {
			// Authenticate user
			const user = await authenticateUser(db, email, password);
			
			if (!user) {
				// Generic message to prevent user enumeration
				return fail(400, { message: 'Invalid email or password', email });
			}
			
			// Create session
			const session = await createSession(db, user.id);
			
			// Set session cookie
			cookies.set(sessionCookie.name, session.id, {
				...sessionCookie.options,
				expires: session.expiresAt
			});

			// Redirect to intended page or home (validated to prevent open redirect)
			const redirectTo = validateRedirectUrl(url.searchParams.get('redirect'));
			throw redirect(302, redirectTo);
		} catch (error) {
			// Re-throw SvelteKit redirect/error responses
			if (error && typeof error === 'object' && 'status' in error && 'location' in error) {
				throw error; // This is a redirect
			}
			if (error instanceof Response) throw error;
			
			// Log the actual error for debugging
			logger.error('Login error', error, { email: email.substring(0, 3) + '***' });
			// Generic error message
			return fail(400, { message: 'Failed to sign in. Please try again.', email });
		}
	}
};
