import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table - stores user accounts
export const users = sqliteTable('users', {
	id: text('id').primaryKey(), // UUID
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	name: text('name'),
	stripeCustomerId: text('stripe_customer_id').unique(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
}, (table) => ({
	emailIdx: index('users_email_idx').on(table.email),
	stripeCustomerIdx: index('users_stripe_customer_idx').on(table.stripeCustomerId),
}));

// Sessions table - manages user sessions
export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(), // Session token
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
}, (table) => ({
	userIdIdx: index('sessions_user_id_idx').on(table.userId),
	expiresAtIdx: index('sessions_expires_at_idx').on(table.expiresAt),
}));

// Subscriptions table - synced from Stripe
export const subscriptions = sqliteTable('subscriptions', {
	id: text('id').primaryKey(), // Stripe subscription ID
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	stripeCustomerId: text('stripe_customer_id').notNull(),
	stripePriceId: text('stripe_price_id').notNull(),
	status: text('status').notNull(), // 'active', 'canceled', 'past_due', 'trialing', etc.
	currentPeriodStart: integer('current_period_start', { mode: 'timestamp' }),
	currentPeriodEnd: integer('current_period_end', { mode: 'timestamp' }),
	cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }).default(false),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
}, (table) => ({
	userIdIdx: index('subscriptions_user_id_idx').on(table.userId),
	stripeCustomerIdx: index('subscriptions_stripe_customer_idx').on(table.stripeCustomerId),
	statusIdx: index('subscriptions_status_idx').on(table.status),
}));

// Usage tracking for free tier limits
export const usageRecords = sqliteTable('usage_records', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
	anonymousId: text('anonymous_id'), // For non-logged-in users (from cookie)
	action: text('action').notNull(), // 'optimize', 'export', etc.
	month: text('month').notNull(), // Format: 'YYYY-MM'
	count: integer('count').notNull().default(1),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
}, (table) => ({
	userMonthIdx: index('usage_user_month_idx').on(table.userId, table.month),
	anonymousMonthIdx: index('usage_anonymous_month_idx').on(table.anonymousId, table.month),
}));

// Saved optimization results (optional - for sharing/history)
export const optimizations = sqliteTable('optimizations', {
	id: text('id').primaryKey(), // UUID
	userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
	country: text('country').notNull(),
	year: integer('year').notNull(),
	ptoDays: integer('pto_days').notNull(),
	resultJson: text('result_json').notNull(), // JSON string of optimization result
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
}, (table) => ({
	userIdIdx: index('optimizations_user_id_idx').on(table.userId),
	countryYearIdx: index('country_year_idx').on(table.country, table.year),
	createdAtIdx: index('created_at_idx').on(table.createdAt),
}));

// Analytics (anonymous usage tracking)
export const analytics = sqliteTable('analytics', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	event: text('event').notNull(), // 'optimize', 'share', 'download', 'signup', 'subscribe'
	country: text('country'),
	ptoDays: integer('pto_days'),
	daysOff: integer('days_off'), // Result: total days off achieved
	userId: text('user_id'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
}, (table) => ({
	eventIdx: index('event_idx').on(table.event),
	createdAtIdx: index('analytics_created_at_idx').on(table.createdAt),
}));

// Rate limiting table - for tracking request counts per IP/action
export const rateLimits = sqliteTable('rate_limits', {
	key: text('key').primaryKey(), // Format: 'action:ip' e.g., 'login:192.168.1.1'
	count: integer('count').notNull().default(1),
	windowStart: integer('window_start').notNull(), // Unix timestamp
	updatedAt: integer('updated_at').notNull(),
}, (table) => ({
	updatedAtIdx: index('rate_limits_updated_at_idx').on(table.updatedAt),
}));

// Webhook events - for idempotency tracking
export const webhookEvents = sqliteTable('webhook_events', {
	eventId: text('event_id').primaryKey(), // Stripe event ID
	eventType: text('event_type').notNull(),
	processedAt: integer('processed_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
}, (table) => ({
	processedAtIdx: index('webhook_events_processed_at_idx').on(table.processedAt),
}));

// Password reset tokens
export const passwordResetTokens = sqliteTable('password_reset_tokens', {
	id: text('id').primaryKey(), // Secure random token
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	usedAt: integer('used_at', { mode: 'timestamp' }), // Null if not used
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
}, (table) => ({
	userIdIdx: index('password_reset_user_id_idx').on(table.userId),
	expiresAtIdx: index('password_reset_expires_at_idx').on(table.expiresAt),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type UsageRecord = typeof usageRecords.$inferSelect;
export type NewUsageRecord = typeof usageRecords.$inferInsert;
export type Optimization = typeof optimizations.$inferSelect;
export type NewOptimization = typeof optimizations.$inferInsert;
export type Analytics = typeof analytics.$inferSelect;
export type NewAnalytics = typeof analytics.$inferInsert;
export type RateLimit = typeof rateLimits.$inferSelect;
export type NewRateLimit = typeof rateLimits.$inferInsert;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type NewWebhookEvent = typeof webhookEvents.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;
