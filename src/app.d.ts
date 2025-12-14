/// <reference types="@cloudflare/workers-types" />

import type { User, Subscription } from '$lib/server/db/schema';

declare global {
	namespace App {
		interface Error {
			message: string;
			code?: string;
		}
		interface Locals {
			user: User | null;
			session: { id: string; expiresAt: Date } | null;
			subscription: Subscription | null;
			isPro: boolean;
		}
		interface PageData {
			user?: User | null;
			isPro?: boolean;
		}
		interface PageState {
			// Add any page state here
		}
		interface Platform {
			env: {
				DB: D1Database;
				STRIPE_SECRET_KEY: string;
				STRIPE_WEBHOOK_SECRET: string;
				STRIPE_PUBLISHABLE_KEY: string;
				RESEND_API_KEY?: string; // Optional - for password reset emails
				STRIPE_PRICE_MONTHLY?: string; // Optional - override default price ID
				STRIPE_PRICE_YEARLY?: string; // Optional - override default price ID
			};
			context: {
				waitUntil(promise: Promise<unknown>): void;
			};
			caches: CacheStorage;
		}
	}
}

export {};
