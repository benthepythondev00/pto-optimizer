import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import { createUser, createSession, sessionCookie } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect if already logged in
	if (locals.user) {
		throw redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, platform, cookies }) => {
		if (!platform?.env?.DB) {
			return fail(500, { message: 'Database not available' });
		}

		const db = createDb(platform.env.DB);
		const formData = await request.formData();
		
		const email = formData.get('email')?.toString();
		const password = formData.get('password')?.toString();
		const confirmPassword = formData.get('confirmPassword')?.toString();
		const name = formData.get('name')?.toString();

		// Validation
		if (!email || !password) {
			return fail(400, { message: 'Email and password are required', email });
		}

		if (!email.includes('@') || email.length < 5) {
			return fail(400, { message: 'Please enter a valid email address', email });
		}

		if (password.length < 8) {
			return fail(400, { message: 'Password must be at least 8 characters', email });
		}

		if (password !== confirmPassword) {
			return fail(400, { message: 'Passwords do not match', email });
		}

		try {
			// Create user
			const user = await createUser(db, email, password, name);
			
			// Create session
			const session = await createSession(db, user.id);
			
			// Set session cookie
			cookies.set(sessionCookie.name, session.id, {
				...sessionCookie.options,
				expires: session.expiresAt
			});

			// Redirect to home page
			throw redirect(302, '/');
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to create account';
			return fail(400, { message, email });
		}
	}
};
