import { eq, and, gt } from 'drizzle-orm';
import type { Database } from './db';
import { users, sessions, subscriptions, type User, type Session } from './db/schema';

// Constants
const SESSION_DURATION_DAYS = 30;
const SESSION_COOKIE_NAME = 'session';

// OWASP 2024 recommends 600,000 iterations for PBKDF2-SHA256
// See: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
const PBKDF2_ITERATIONS = 600000;

// Generate a secure random token
export function generateSessionToken(): string {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

// Generate a UUID
export function generateId(): string {
	return crypto.randomUUID();
}

// Hash password using Web Crypto API (Cloudflare Workers compatible)
// Uses PBKDF2-SHA256 with OWASP recommended iterations
export async function hashPassword(password: string): Promise<string> {
	const encoder = new TextEncoder();
	// Use 16 bytes (128 bits) of random salt - NIST recommended minimum
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const saltHex = Array.from(salt, (b) => b.toString(16).padStart(2, '0')).join('');
	
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		encoder.encode(password),
		'PBKDF2',
		false,
		['deriveBits']
	);
	
	const derivedBits = await crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			salt: salt,
			iterations: PBKDF2_ITERATIONS,
			hash: 'SHA-256'
		},
		keyMaterial,
		256
	);
	
	const hashHex = Array.from(new Uint8Array(derivedBits), (b) => b.toString(16).padStart(2, '0')).join('');
	return `${saltHex}:${hashHex}`;
}

// Timing-safe string comparison to prevent timing attacks
function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) {
		// Compare against itself to maintain constant time even on length mismatch
		b = a;
	}
	
	let result = 0;
	for (let i = 0; i < a.length; i++) {
		result |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	
	return result === 0 && a.length === b.length;
}

// Verify password with timing-safe comparison
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
	const [saltHex, expectedHashHex] = storedHash.split(':');
	if (!saltHex || !expectedHashHex) return false;
	
	// Validate salt format
	const saltMatch = saltHex.match(/.{2}/g);
	if (!saltMatch || saltMatch.length !== 16) return false;
	
	const salt = new Uint8Array(saltMatch.map((byte) => parseInt(byte, 16)));
	const encoder = new TextEncoder();
	
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		encoder.encode(password),
		'PBKDF2',
		false,
		['deriveBits']
	);
	
	const derivedBits = await crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			salt: salt,
			iterations: PBKDF2_ITERATIONS,
			hash: 'SHA-256'
		},
		keyMaterial,
		256
	);
	
	const hashHex = Array.from(new Uint8Array(derivedBits), (b) => b.toString(16).padStart(2, '0')).join('');
	
	// Use timing-safe comparison to prevent timing attacks
	return timingSafeEqual(hashHex, expectedHashHex);
}

// Create a new user
export async function createUser(
	db: Database,
	email: string,
	password: string,
	name?: string
): Promise<User> {
	const existingUser = await db.query.users.findFirst({
		where: eq(users.email, email.toLowerCase())
	});
	
	if (existingUser) {
		throw new Error('User with this email already exists');
	}
	
	const passwordHash = await hashPassword(password);
	const id = generateId();
	
	await db.insert(users).values({
		id,
		email: email.toLowerCase(),
		passwordHash,
		name
	});
	
	const user = await db.query.users.findFirst({
		where: eq(users.id, id)
	});
	
	if (!user) {
		throw new Error('Failed to create user');
	}
	
	return user;
}

// Create a session for a user
export async function createSession(db: Database, userId: string): Promise<Session> {
	const token = generateSessionToken();
	const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);
	
	await db.insert(sessions).values({
		id: token,
		userId,
		expiresAt
	});
	
	const session = await db.query.sessions.findFirst({
		where: eq(sessions.id, token)
	});
	
	if (!session) {
		throw new Error('Failed to create session');
	}
	
	return session;
}

// Validate session and return user if valid
export async function validateSession(
	db: Database,
	sessionToken: string
): Promise<{ user: User; session: Session } | null> {
	const session = await db.query.sessions.findFirst({
		where: and(
			eq(sessions.id, sessionToken),
			gt(sessions.expiresAt, new Date())
		)
	});
	
	if (!session) {
		return null;
	}
	
	const user = await db.query.users.findFirst({
		where: eq(users.id, session.userId)
	});
	
	if (!user) {
		// Session exists but user doesn't - clean up orphaned session
		await db.delete(sessions).where(eq(sessions.id, sessionToken));
		return null;
	}
	
	// Extend session if it's close to expiring (within 7 days)
	const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
	if (session.expiresAt < sevenDaysFromNow) {
		const newExpiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);
		await db.update(sessions)
			.set({ expiresAt: newExpiresAt })
			.where(eq(sessions.id, sessionToken));
		session.expiresAt = newExpiresAt;
	}
	
	return { user, session };
}

// Authenticate user with email and password
export async function authenticateUser(
	db: Database,
	email: string,
	password: string
): Promise<User | null> {
	const user = await db.query.users.findFirst({
		where: eq(users.email, email.toLowerCase())
	});
	
	if (!user) {
		return null;
	}
	
	const isValid = await verifyPassword(password, user.passwordHash);
	if (!isValid) {
		return null;
	}
	
	return user;
}

// Invalidate a session (logout)
export async function invalidateSession(db: Database, sessionToken: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.id, sessionToken));
}

// Invalidate all sessions for a user
export async function invalidateAllUserSessions(db: Database, userId: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.userId, userId));
}

// Get user's subscription status
export async function getUserSubscription(db: Database, userId: string) {
	const subscription = await db.query.subscriptions.findFirst({
		where: and(
			eq(subscriptions.userId, userId),
			eq(subscriptions.status, 'active')
		)
	});
	
	return subscription;
}

// Check if user has active subscription
export async function isUserSubscribed(db: Database, userId: string): Promise<boolean> {
	const subscription = await getUserSubscription(db, userId);
	return subscription !== undefined;
}

// Session cookie helpers
export const sessionCookie = {
	name: SESSION_COOKIE_NAME,
	options: {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax' as const,
		maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60
	}
};

/**
 * Validates a redirect URL to prevent open redirect attacks.
 * Only allows relative paths starting with '/' and without protocol.
 * @param url - The URL to validate
 * @param fallback - Fallback URL if validation fails (default: '/')
 * @returns Safe redirect URL
 */
export function validateRedirectUrl(url: string | null, fallback: string = '/'): string {
	if (!url) return fallback;
	
	// Decode URL to catch encoded attacks
	let decoded: string;
	try {
		decoded = decodeURIComponent(url);
	} catch {
		return fallback;
	}
	
	// Must start with a single forward slash (relative path)
	// Reject double slashes (//example.com), backslashes, and protocol handlers
	if (
		!decoded.startsWith('/') ||
		decoded.startsWith('//') ||
		decoded.startsWith('/\\') ||
		decoded.includes(':') ||
		decoded.includes('@') ||
		/^\/[^/]*[.]/.test(decoded) // Reject /example.com patterns
	) {
		return fallback;
	}
	
	// Additional check: ensure it's a valid relative path
	try {
		const testUrl = new URL(decoded, 'http://localhost');
		// If the hostname changed, it's an open redirect attempt
		if (testUrl.hostname !== 'localhost') {
			return fallback;
		}
	} catch {
		return fallback;
	}
	
	return decoded;
}
