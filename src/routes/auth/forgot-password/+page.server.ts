import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import { createPasswordResetToken } from '$lib/server/auth';
import { checkRateLimit, getClientIP } from '$lib/server/rate-limit';
import { logger } from '$lib/server/logger';
import { sendPasswordResetEmail } from '$lib/server/email';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect if already logged in
	if (locals.user) {
		return { redirect: '/' };
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, platform, url }) => {
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
				const siteUrl = url.origin || 'https://pto-optimizer.pages.dev';
				const resetUrl = `${siteUrl}/auth/reset-password?token=${token}`;
				
				// Get user's name for personalized email
				const user = await db.query.users.findFirst({
					where: eq(users.email, email)
				});
				
				// Send email if Resend API key is configured
				if (platform.env.RESEND_API_KEY) {
					const result = await sendPasswordResetEmail(
						platform.env.RESEND_API_KEY,
						email,
						resetUrl,
						user?.name || undefined
					);
					
					if (!result.success) {
						logger.error('Failed to send password reset email', new Error(result.error), {
							email: email.substring(0, 3) + '***'
						});
						// Don't reveal email send failure to user
					}
				} else {
					// No email service configured - log the URL for development
					logger.warn('RESEND_API_KEY not configured - password reset email not sent', {
						email: email.substring(0, 3) + '***',
						resetUrl
					});
				}
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
