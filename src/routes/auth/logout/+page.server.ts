import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createDb } from '$lib/server/db';
import { invalidateSession, sessionCookie } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ platform, cookies, locals }) => {
		const sessionToken = cookies.get(sessionCookie.name);
		
		if (sessionToken && platform?.env?.DB) {
			const db = createDb(platform.env.DB);
			await invalidateSession(db, sessionToken);
		}
		
		// Clear session cookie
		cookies.delete(sessionCookie.name, { path: '/' });
		
		// Clear locals
		locals.user = null;
		locals.session = null;
		locals.subscription = null;
		locals.isPro = false;
		
		throw redirect(302, '/');
	}
};
