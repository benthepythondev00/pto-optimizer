/**
 * Rate limiting implementation using D1 database
 * Uses a sliding window approach with configurable limits
 */

import { sql } from 'drizzle-orm';
import type { Database } from './db';
import { logger } from './logger';

export interface RateLimitConfig {
	/** Maximum number of requests allowed in the window */
	limit: number;
	/** Window size in seconds */
	windowSeconds: number;
}

export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	resetAt: Date;
}

// Default rate limit configurations
export const RATE_LIMITS = {
	login: { limit: 5, windowSeconds: 900 }, // 5 attempts per 15 minutes
	signup: { limit: 3, windowSeconds: 3600 }, // 3 signups per hour
	passwordReset: { limit: 3, windowSeconds: 3600 }, // 3 reset requests per hour
	api: { limit: 100, windowSeconds: 60 }, // 100 requests per minute
	checkout: { limit: 10, windowSeconds: 60 }, // 10 checkout attempts per minute
} as const;

/**
 * Check and update rate limit for a given key
 * Uses D1 with UPSERT for atomic operations
 */
export async function checkRateLimit(
	db: Database,
	key: string,
	action: keyof typeof RATE_LIMITS
): Promise<RateLimitResult> {
	const config = RATE_LIMITS[action];
	const now = Math.floor(Date.now() / 1000);
	const windowStart = now - config.windowSeconds;
	const fullKey = `${action}:${key}`;

	try {
		// Use raw SQL for UPSERT with conditional reset
		// This atomically handles the sliding window
		const result = await db.run(sql`
			INSERT INTO rate_limits (key, count, window_start, updated_at)
			VALUES (${fullKey}, 1, ${now}, ${now})
			ON CONFLICT(key) DO UPDATE SET
				count = CASE 
					WHEN window_start < ${windowStart} THEN 1 
					ELSE count + 1 
				END,
				window_start = CASE 
					WHEN window_start < ${windowStart} THEN ${now}
					ELSE window_start 
				END,
				updated_at = ${now}
		`);

		// Get current state after update
		const current = await db.run(sql`
			SELECT count, window_start FROM rate_limits WHERE key = ${fullKey}
		`);

		const row = (current as { rows?: Array<{ count: number; window_start: number }> }).rows?.[0];
		const count = row?.count ?? 1;
		const windowStartTime = row?.window_start ?? now;

		const allowed = count <= config.limit;
		const remaining = Math.max(0, config.limit - count);
		const resetAt = new Date((windowStartTime + config.windowSeconds) * 1000);

		if (!allowed) {
			logger.warn('Rate limit exceeded', {
				action,
				key: key.substring(0, 20) + '...', // Truncate for privacy
				count,
				limit: config.limit
			});
		}

		return { allowed, remaining, resetAt };
	} catch (error) {
		// If rate limiting fails, allow the request but log the error
		logger.error('Rate limit check failed', error, { action, key: key.substring(0, 20) });
		return { 
			allowed: true, 
			remaining: config.limit, 
			resetAt: new Date(Date.now() + config.windowSeconds * 1000) 
		};
	}
}

/**
 * Get the client IP address from the request
 * Handles Cloudflare's CF-Connecting-IP header
 */
export function getClientIP(request: Request): string {
	// Cloudflare provides the real client IP in CF-Connecting-IP
	const cfIP = request.headers.get('CF-Connecting-IP');
	if (cfIP) return cfIP;

	// Fallback to X-Forwarded-For
	const forwardedFor = request.headers.get('X-Forwarded-For');
	if (forwardedFor) {
		return forwardedFor.split(',')[0].trim();
	}

	// Fallback to X-Real-IP
	const realIP = request.headers.get('X-Real-IP');
	if (realIP) return realIP;

	// Default fallback
	return 'unknown';
}

/**
 * Clean up old rate limit entries (call periodically)
 */
export async function cleanupRateLimits(db: Database): Promise<number> {
	const cutoff = Math.floor(Date.now() / 1000) - 86400; // 24 hours ago
	
	try {
		const result = await db.run(sql`
			DELETE FROM rate_limits WHERE updated_at < ${cutoff}
		`);
		
		const deleted = (result as { changes?: number }).changes ?? 0;
		if (deleted > 0) {
			logger.info('Cleaned up rate limit entries', { deleted });
		}
		return deleted;
	} catch (error) {
		logger.error('Rate limit cleanup failed', error);
		return 0;
	}
}
