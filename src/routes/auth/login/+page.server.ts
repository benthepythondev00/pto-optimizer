import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import { authenticateUser, createSession, sessionCookie } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals, url }) => {
	// Redirect if already logged in
	if (locals.user) {
		const redirectTo = url.searchParams.get('redirectTo') || '/';
		throw redirect(302, redirectTo);
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, platform, cookies, url }) => {
		if (!platform?.env?.DB) {
			return fail(500, { message: 'Database not available' });
		}

		const db = createDb(platform.env.DB);
		const formData = await request.formData();
		
		const email = formData.get('email')?.toString();
		const password = formData.get('password')?.toString();

		// Validation
		if (!email || !password) {
			return fail(400, { message: 'Email and password are required', email });
		}

		try {
			// Authenticate user
			const user = await authenticateUser(db, email, password);
			
			if (!user) {
				return fail(400, { message: 'Invalid email or password', email });
			}
			
			// Create session
			const session = await createSession(db, user.id);
			
			// Set session cookie
			cookies.set(sessionCookie.name, session.id, {
				...sessionCookie.options,
				expires: session.expiresAt
			});

			// Redirect to intended page or home
			const redirectTo = url.searchParams.get('redirectTo') || '/';
			throw redirect(302, redirectTo);
		} catch (error) {
			if (error instanceof Response) throw error; // Re-throw redirects
			const message = error instanceof Error ? error.message : 'Failed to sign in';
			return fail(400, { message, email });
		}
	}
};
