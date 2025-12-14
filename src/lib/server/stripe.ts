import { eq } from 'drizzle-orm';
import type { Database } from './db';
import { users, subscriptions } from './db/schema';

// Stripe API base URL
const STRIPE_API_BASE = 'https://api.stripe.com/v1';

// Price IDs - these would be your actual Stripe price IDs
export const STRIPE_PRICES = {
	monthly: 'price_monthly_placeholder', // $4.99/month
	yearly: 'price_yearly_placeholder'    // $39.99/year (save 33%)
};

// Stripe API helper
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
		'Content-Type': 'application/x-www-form-urlencoded'
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
		console.error(`No user found for Stripe customer ${stripeCustomerId}`);
		return;
	}
	
	// Delete existing subscriptions for this customer (we'll re-add active ones)
	await db.delete(subscriptions).where(eq(subscriptions.stripeCustomerId, stripeCustomerId));
	
	// Add current subscriptions
	for (const stripeSub of stripeSubscriptions) {
		await db.insert(subscriptions).values({
			id: stripeSub.id,
			userId: user.id,
			stripeCustomerId: stripeCustomerId,
			stripePriceId: stripeSub.items.data[0]?.price.id || '',
			status: stripeSub.status,
			currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
			currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
			cancelAtPeriodEnd: stripeSub.cancel_at_period_end
		});
	}
	
	console.log(`Synced ${stripeSubscriptions.length} subscriptions for user ${user.id}`);
}

// Verify Stripe webhook signature
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
	
	// Check timestamp is within 5 minutes
	const timestampNum = parseInt(timestamp, 10);
	const now = Math.floor(Date.now() / 1000);
	if (Math.abs(now - timestampNum) > 300) {
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
	
	// Compare signatures
	return signatures.some(sig => sig === expectedSignature);
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
