import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import { validatePasswordResetToken, resetPassword } from '$lib/server/auth';
import { logger } from '$lib/server/logger';

export const load: PageServerLoad = async ({ url, platform }) => {
	const token = url.searchParams.get('token');
	
	if (!token) {
		return { valid: false, error: 'Missing reset token' };
	}
	
	if (!platform?.env?.DB) {
		return { valid: false, error: 'Service temporarily unavailable' };
	}
	
	const db = createDb(platform.env.DB);
	
	// Validate the token
	const user = await validatePasswordResetToken(db, token);
	
	if (!user) {
		return { valid: false, error: 'Invalid or expired reset link' };
	}
	
	return { valid: true, token };
};

export const actions: Actions = {
	default: async ({ request, platform }) => {
		if (!platform?.env?.DB) {
			return fail(500, { message: 'Database not available' });
		}

		const db = createDb(platform.env.DB);
		const formData = await request.formData();
		
		const token = formData.get('token')?.toString() || '';
		const password = formData.get('password')?.toString();
		const confirmPassword = formData.get('confirmPassword')?.toString();

		// Validation
		if (!token) {
			return fail(400, { message: 'Reset token is missing' });
		}

		if (!password) {
			return fail(400, { message: 'Password is required' });
		}

		// Password requirements
		if (password.length < 8) {
			return fail(400, { message: 'Password must be at least 8 characters' });
		}

		if (password.length > 128) {
			return fail(400, { message: 'Password is too long' });
		}

		if (password !== confirmPassword) {
			return fail(400, { message: 'Passwords do not match' });
		}

		try {
			const success = await resetPassword(db, token, password);
			
			if (!success) {
				return fail(400, { message: 'Invalid or expired reset link. Please request a new one.' });
			}

			logger.info('Password reset successful');
			
			// Redirect to login with success message
			throw redirect(302, '/auth/login?reset=success');
		} catch (error) {
			// Re-throw SvelteKit redirect
			if (error && typeof error === 'object' && 'status' in error && 'location' in error) {
				throw error;
			}
			if (error instanceof Response) throw error;
			
			logger.error('Password reset failed', error);
			return fail(400, { message: 'Failed to reset password. Please try again.' });
		}
	}
};
