/**
 * Email service using Resend API
 * Free tier: 3,000 emails/month
 * 
 * Setup:
 * 1. Create account at https://resend.com
 * 2. Add API key to Cloudflare Pages environment variables as RESEND_API_KEY
 * 3. (Optional) Verify your domain for custom "from" address
 */

import { logger } from './logger';

const RESEND_API_URL = 'https://api.resend.com/emails';

// Default sender - uses Resend's test domain until you verify your own
const DEFAULT_FROM = 'PTO Optimizer <onboarding@resend.dev>';

interface SendEmailOptions {
	to: string;
	subject: string;
	html: string;
	text?: string;
	from?: string;
}

interface ResendResponse {
	id?: string;
	error?: {
		message: string;
		name: string;
	};
}

/**
 * Send an email using Resend API
 * Works in Cloudflare Workers (uses fetch, no Node.js dependencies)
 */
export async function sendEmail(
	apiKey: string,
	options: SendEmailOptions
): Promise<{ success: boolean; id?: string; error?: string }> {
	const { to, subject, html, text, from = DEFAULT_FROM } = options;

	try {
		const response = await fetch(RESEND_API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				from,
				to: [to],
				subject,
				html,
				text: text || stripHtml(html)
			})
		});

		const data: ResendResponse = await response.json();

		if (!response.ok || data.error) {
			logger.error('Email send failed', new Error(data.error?.message || 'Unknown error'), {
				to: to.substring(0, 3) + '***',
				subject
			});
			return { 
				success: false, 
				error: data.error?.message || 'Failed to send email' 
			};
		}

		logger.info('Email sent successfully', { 
			id: data.id, 
			to: to.substring(0, 3) + '***',
			subject 
		});
		
		return { success: true, id: data.id };
	} catch (error) {
		logger.error('Email send error', error, { to: to.substring(0, 3) + '***' });
		return { 
			success: false, 
			error: error instanceof Error ? error.message : 'Unknown error' 
		};
	}
}

/**
 * Strip HTML tags for plain text version
 */
function stripHtml(html: string): string {
	return html
		.replace(/<[^>]*>/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
	apiKey: string,
	email: string,
	resetUrl: string,
	userName?: string
): Promise<{ success: boolean; error?: string }> {
	const greeting = userName ? `Hi ${userName}` : 'Hi';
	
	const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #4F46E5; margin: 0; font-size: 28px;">&#127958; PTO Optimizer</h1>
  </div>
  
  <div style="background: #f9fafb; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
    <h2 style="margin-top: 0; color: #111827;">Reset Your Password</h2>
    <p>${greeting},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(to right, #4F46E5, #7C3AED); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password</a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">This link will expire in <strong>1 hour</strong>.</p>
    <p style="color: #6b7280; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
  </div>
  
  <div style="text-align: center; color: #9ca3af; font-size: 12px;">
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <p>&copy; ${new Date().getFullYear()} PTO Optimizer. All rights reserved.</p>
  </div>
</body>
</html>
`;

	const text = `
${greeting},

We received a request to reset your password for PTO Optimizer.

Reset your password by visiting this link:
${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

---
PTO Optimizer
https://pto-optimizer.pages.dev
`;

	return sendEmail(apiKey, {
		to: email,
		subject: 'Reset Your Password - PTO Optimizer',
		html,
		text
	});
}

/**
 * Send welcome email after signup (optional - for future use)
 */
export async function sendWelcomeEmail(
	apiKey: string,
	email: string,
	userName?: string
): Promise<{ success: boolean; error?: string }> {
	const greeting = userName ? `Hi ${userName}` : 'Hi there';
	
	const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to PTO Optimizer</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #4F46E5; margin: 0; font-size: 28px;">&#127958; PTO Optimizer</h1>
  </div>
  
  <div style="background: #f9fafb; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
    <h2 style="margin-top: 0; color: #111827;">Welcome!</h2>
    <p>${greeting},</p>
    <p>Thanks for signing up for PTO Optimizer! You're now ready to maximize your vacation days.</p>
    
    <h3 style="color: #374151;">Here's what you can do:</h3>
    <ul style="color: #4b5563;">
      <li>Get <strong>3 free optimizations</strong> per month</li>
      <li>See exactly how to turn your PTO into longer vacations</li>
      <li>Plan around holidays in 50+ countries</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://pto-optimizer.pages.dev" style="display: inline-block; background: linear-gradient(to right, #4F46E5, #7C3AED); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Start Optimizing</a>
    </div>
  </div>
  
  <div style="text-align: center; color: #9ca3af; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} PTO Optimizer. All rights reserved.</p>
  </div>
</body>
</html>
`;

	return sendEmail(apiKey, {
		to: email,
		subject: 'Welcome to PTO Optimizer!',
		html
	});
}
