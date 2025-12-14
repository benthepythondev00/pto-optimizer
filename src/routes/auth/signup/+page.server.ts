import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import { createUser, createSession, sessionCookie, validateRedirectUrl } from '$lib/server/auth';

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
		
		const email = formData.get('email')?.toString()?.trim().toLowerCase() || '';
		const password = formData.get('password')?.toString();
		const confirmPassword = formData.get('confirmPassword')?.toString();
		const name = formData.get('name')?.toString()?.trim();

		// Validation
		if (!email || !password) {
			return fail(400, { message: 'Email and password are required', email });
		}

		// Email validation - basic format check
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email) || email.length > 254) {
			return fail(400, { message: 'Please enter a valid email address', email });
		}

		// Password requirements
		if (password.length < 8) {
			return fail(400, { message: 'Password must be at least 8 characters', email });
		}

		if (password.length > 128) {
			return fail(400, { message: 'Password is too long', email });
		}

		if (password !== confirmPassword) {
			return fail(400, { message: 'Passwords do not match', email });
		}

		// Name validation (optional but sanitize)
		const sanitizedName = name && name.length <= 100 ? name : undefined;

		try {
			// Create user with sanitized inputs
			const user = await createUser(db, email, password, sanitizedName);
			
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
			if (error instanceof Response) throw error; // Re-throw redirects
			// Generic error message to prevent user enumeration
			const message = error instanceof Error && error.message.includes('already exists') 
				? 'An account with this email already exists'
				: 'Failed to create account. Please try again.';
			return fail(400, { message, email });
		}
	}
};
