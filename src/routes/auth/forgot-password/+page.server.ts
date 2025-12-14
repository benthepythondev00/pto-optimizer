import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import { createPasswordResetToken } from '$lib/server/auth';
import { checkRateLimit, getClientIP } from '$lib/server/rate-limit';
import { logger } from '$lib/server/logger';

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect if already logged in
	if (locals.user) {
		return { redirect: '/' };
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, platform }) => {
		if (!platform?.env?.DB) {
			return fail(500, { message: 'Database not available', email: '' });
		}

		const db = createDb(platform.env.DB);
		const formData = await request.formData();
		
		const email = formData.get('email')?.toString()?.trim().toLowerCase() || '';

		// Rate limiting - prevent enumeration attacks
		const clientIP = getClientIP(request);
		const rateLimit = await checkRateLimit(db, clientIP, 'passwordReset');
		
		if (!rateLimit.allowed) {
			logger.warn('Password reset rate limit exceeded', { ip: clientIP });
			return fail(429, { 
				message: `Too many requests. Please try again after ${rateLimit.resetAt.toLocaleTimeString()}.`, 
				email 
			});
		}

		// Validation
		if (!email) {
			return fail(400, { message: 'Email is required', email });
		}

		// Email validation - basic format check
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email) || email.length > 254) {
			return fail(400, { message: 'Please enter a valid email address', email });
		}

		try {
			// Create reset token (returns null if user doesn't exist, but we don't reveal that)
			const token = await createPasswordResetToken(db, email);
			
			if (token) {
				// In production, you would send an email here
				// For now, we log it (visible in Cloudflare dashboard)
				const resetUrl = `${platform.env.SITE_URL || 'https://pto-optimizer.pages.dev'}/auth/reset-password?token=${token}`;
				logger.info('Password reset link generated', { 
					email: email.substring(0, 3) + '***',
					// In development, log the URL; in production, send email
					resetUrl: process.env.NODE_ENV !== 'production' ? resetUrl : '[redacted]'
				});
				
				// TODO: Implement email sending here
				// await sendPasswordResetEmail(email, resetUrl);
			}

			// Always return success to prevent user enumeration
			return { 
				success: true, 
				message: 'If an account exists with this email, you will receive a password reset link shortly.' 
			};
		} catch (error) {
			logger.error('Password reset error', error, { email: email.substring(0, 3) + '***' });
			// Still return success to prevent enumeration
			return { 
				success: true, 
				message: 'If an account exists with this email, you will receive a password reset link shortly.' 
			};
		}
	}
};
