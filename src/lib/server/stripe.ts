import { eq } from 'drizzle-orm';
import type { Database } from './db';
import { users, subscriptions } from './db/schema';
import { logger } from './logger';

// Stripe API base URL and version
const STRIPE_API_BASE = 'https://api.stripe.com/v1';
const STRIPE_API_VERSION = '2023-10-16'; // Pin to specific version for stability

// Default Price IDs - Can be overridden via environment variables
// These are fallbacks if env vars are not set
const DEFAULT_PRICES = {
	monthly: 'price_1SeGM9RjwzOUgrKay986Itsc', // $4.99/month
	yearly: 'price_1SeGNZRjwzOUgrKayTM5wF15'   // $39/year (save 35%)
};

// Get price IDs from environment or use defaults
export function getStripePrices(env?: { STRIPE_PRICE_MONTHLY?: string; STRIPE_PRICE_YEARLY?: string }) {
	return {
		monthly: env?.STRIPE_PRICE_MONTHLY || DEFAULT_PRICES.monthly,
		yearly: env?.STRIPE_PRICE_YEARLY || DEFAULT_PRICES.yearly
	};
}

// For backwards compatibility - use getStripePrices() when you have env access
export const STRIPE_PRICES = DEFAULT_PRICES;

// Stripe API helper with version pinning
async function stripeRequest(
	endpoint: string,
	secretKey: string,
	options: {
		method?: string;
		body?: Record<string, string | number | boolean | undefined>;
	} = {}
) {
	const { method = 'GET', body } = options;
	
	const headers: HeadersInit = {
		'Authorization': `Bearer ${secretKey}`,
		'Content-Type': 'application/x-www-form-urlencoded',
		'Stripe-Version': STRIPE_API_VERSION // Pin API version for stability
	};
	
	let bodyString: string | undefined;
	if (body) {
		const params = new URLSearchParams();
		for (const [key, value] of Object.entries(body)) {
			if (value !== undefined) {
				params.append(key, String(value));
			}
		}
		bodyString = params.toString();
	}
	
	const response = await fetch(`${STRIPE_API_BASE}${endpoint}`, {
		method,
		headers,
		body: bodyString
	});
	
	const data = await response.json();
	
	if (!response.ok) {
		logger.error('Stripe API error', new Error(data.error?.message || 'Unknown error'), {
			endpoint,
			status: response.status
		});
		throw new Error(data.error?.message || 'Stripe API error');
	}
	
	return data;
}

// Create a Stripe customer
export async function createStripeCustomer(
	secretKey: string,
	email: string,
	name?: string,
	metadata?: Record<string, string>
) {
	return stripeRequest('/customers', secretKey, {
		method: 'POST',
		body: {
			email,
			name,
			...metadata && { 'metadata[userId]': metadata.userId }
		}
	});
}

// Get Stripe customer
export async function getStripeCustomer(secretKey: string, customerId: string) {
	return stripeRequest(`/customers/${customerId}`, secretKey);
}

// Create a checkout session
export async function createCheckoutSession(
	secretKey: string,
	options: {
		customerId: string;
		priceId: string;
		successUrl: string;
		cancelUrl: string;
		mode?: 'subscription' | 'payment';
	}
) {
	const { customerId, priceId, successUrl, cancelUrl, mode = 'subscription' } = options;
	
	return stripeRequest('/checkout/sessions', secretKey, {
		method: 'POST',
		body: {
			customer: customerId,
			'line_items[0][price]': priceId,
			'line_items[0][quantity]': 1,
			mode,
			success_url: successUrl,
			cancel_url: cancelUrl,
			'subscription_data[metadata][source]': 'pto-optimizer',
			allow_promotion_codes: true
		}
	});
}

// Create a billing portal session
export async function createBillingPortalSession(
	secretKey: string,
	customerId: string,
	returnUrl: string
) {
	return stripeRequest('/billing_portal/sessions', secretKey, {
		method: 'POST',
		body: {
			customer: customerId,
			return_url: returnUrl
		}
	});
}

// Get subscription details
export async function getStripeSubscription(secretKey: string, subscriptionId: string) {
	return stripeRequest(`/subscriptions/${subscriptionId}`, secretKey);
}

// Cancel subscription
export async function cancelStripeSubscription(
	secretKey: string,
	subscriptionId: string,
	cancelAtPeriodEnd = true
) {
	if (cancelAtPeriodEnd) {
		return stripeRequest(`/subscriptions/${subscriptionId}`, secretKey, {
			method: 'POST',
			body: {
				cancel_at_period_end: true
			}
		});
	} else {
		return stripeRequest(`/subscriptions/${subscriptionId}`, secretKey, {
			method: 'DELETE'
		});
	}
}

// List customer's subscriptions
export async function listCustomerSubscriptions(secretKey: string, customerId: string) {
	return stripeRequest(`/subscriptions?customer=${customerId}`, secretKey);
}

// Sync Stripe data to database - following t3's recommendation
// This is the SINGLE SOURCE OF TRUTH function
export async function syncStripeDataToDb(
	db: Database,
	secretKey: string,
	stripeCustomerId: string
) {
	// Get the customer's subscriptions from Stripe
	const { data: stripeSubscriptions } = await listCustomerSubscriptions(secretKey, stripeCustomerId);
	
	// Find the user by Stripe customer ID
	const user = await db.query.users.findFirst({
		where: eq(users.stripeCustomerId, stripeCustomerId)
	});
	
	if (!user) {
		logger.error('No user found for Stripe customer', undefined, { customerId: stripeCustomerId });
		return;
	}
	
	// Delete existing subscriptions for this customer (we'll re-add active ones)
	await db.delete(subscriptions).where(eq(subscriptions.stripeCustomerId, stripeCustomerId));
	
	// Batch insert all subscriptions at once for better performance
	if (stripeSubscriptions.length > 0) {
		const subscriptionRecords = stripeSubscriptions.map((stripeSub: {
			id: string;
			status: string;
			items: { data: Array<{ price: { id: string } }> };
			current_period_start: number;
			current_period_end: number;
			cancel_at_period_end: boolean;
		}) => ({
			id: stripeSub.id,
			userId: user.id,
			stripeCustomerId: stripeCustomerId,
			stripePriceId: stripeSub.items.data[0]?.price.id || '',
			status: stripeSub.status,
			currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
			currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
			cancelAtPeriodEnd: stripeSub.cancel_at_period_end
		}));
		
		await db.insert(subscriptions).values(subscriptionRecords);
	}
	
	logger.info('Synced Stripe subscriptions', {
		userId: user.id,
		customerId: stripeCustomerId,
		count: stripeSubscriptions.length
	});
}

// Timing-safe string comparison
function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) {
		b = a; // Maintain constant time even on length mismatch
	}
	let result = 0;
	for (let i = 0; i < a.length; i++) {
		result |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return result === 0 && a.length === b.length;
}

// Verify Stripe webhook signature with timing-safe comparison
export async function verifyWebhookSignature(
	payload: string,
	signature: string,
	webhookSecret: string
): Promise<boolean> {
	const parts = signature.split(',');
	let timestamp = '';
	let signatures: string[] = [];
	
	for (const part of parts) {
		const [key, value] = part.split('=');
		if (key === 't') {
			timestamp = value;
		} else if (key === 'v1') {
			signatures.push(value);
		}
	}
	
	if (!timestamp || signatures.length === 0) {
		return false;
	}
	
	// Check timestamp is within 5 minutes (300 seconds)
	// This prevents replay attacks
	const timestampNum = parseInt(timestamp, 10);
	if (isNaN(timestampNum)) {
		return false;
	}
	
	const now = Math.floor(Date.now() / 1000);
	if (Math.abs(now - timestampNum) > 300) {
		console.warn('Stripe webhook timestamp too old or too far in future');
		return false;
	}
	
	// Compute expected signature
	const signedPayload = `${timestamp}.${payload}`;
	const encoder = new TextEncoder();
	
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(webhookSecret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	
	const signatureBuffer = await crypto.subtle.sign(
		'HMAC',
		key,
		encoder.encode(signedPayload)
	);
	
	const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
		.map(b => b.toString(16).padStart(2, '0'))
		.join('');
	
	// Use timing-safe comparison to prevent timing attacks
	return signatures.some(sig => timingSafeEqual(sig, expectedSignature));
}

// Ensure user has a Stripe customer ID
export async function ensureStripeCustomer(
	db: Database,
	secretKey: string,
	userId: string
): Promise<string> {
	const user = await db.query.users.findFirst({
		where: eq(users.id, userId)
	});
	
	if (!user) {
		throw new Error('User not found');
	}
	
	if (user.stripeCustomerId) {
		return user.stripeCustomerId;
	}
	
	// Create new Stripe customer
	const customer = await createStripeCustomer(secretKey, user.email, user.name || undefined, {
		userId: user.id
	});
	
	// Update user with Stripe customer ID
	await db.update(users)
		.set({ stripeCustomerId: customer.id })
		.where(eq(users.id, userId));
	
	return customer.id;
}
