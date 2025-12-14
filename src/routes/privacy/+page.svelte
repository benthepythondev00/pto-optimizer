<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	
	const lastUpdated = 'December 14, 2025';
	const contactEmail = 'privacy@ptooptimizer.com';
</script>

<SEO 
	title="Privacy Policy - PTO Optimizer"
	description="Learn how PTO Optimizer handles your data. We're committed to protecting your privacy with minimal data collection and no tracking."
/>

<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
	<article class="prose prose-gray prose-lg max-w-none">
		<h1 class="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
		<p class="text-sm text-gray-500 mb-8">Last updated: {lastUpdated}</p>
		
		<p class="text-xl text-gray-600 leading-relaxed mb-12">
			Your privacy matters. PTO Optimizer is designed with privacy as a core principle. 
			This policy explains what data we collect, why, and how we protect it.
		</p>

		<section class="mb-10">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">1. Our Privacy Commitment</h2>
			<p class="text-gray-600 mb-4">
				PTO Optimizer is built to respect your privacy:
			</p>
			<ul class="text-gray-600 space-y-2 list-disc list-inside">
				<li><strong>No tracking cookies</strong> - We don't use cookies for tracking or advertising</li>
				<li><strong>No third-party trackers</strong> - No Google Analytics, Facebook Pixel, or similar services</li>
				<li><strong>Minimal data collection</strong> - We only collect what's necessary for the service</li>
				<li><strong>No data selling</strong> - We never sell your personal information</li>
				<li><strong>EU-based infrastructure</strong> - Data is processed within the European Union</li>
			</ul>
		</section>

		<section class="mb-10">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">2. Data We Collect</h2>
			
			<h3 class="text-xl font-medium text-gray-800 mt-6 mb-3">2.1 For Free Users (No Account)</h3>
			<p class="text-gray-600 mb-4">
				When using PTO Optimizer without an account:
			</p>
			<ul class="text-gray-600 space-y-2 list-disc list-inside">
				<li><strong>Optimization calculations</strong> - Performed entirely in your browser; no data sent to our servers</li>
				<li><strong>Usage counter</strong> - Stored in your browser's local storage to track free tier limits</li>
				<li><strong>Anonymous analytics</strong> - Page views only, no personal data (via Plausible Analytics)</li>
			</ul>

			<h3 class="text-xl font-medium text-gray-800 mt-6 mb-3">2.2 For Registered Users</h3>
			<p class="text-gray-600 mb-4">
				When you create an account, we collect:
			</p>
			<ul class="text-gray-600 space-y-2 list-disc list-inside">
				<li><strong>Email address</strong> - For account identification and important notifications</li>
				<li><strong>Password</strong> - Stored securely using PBKDF2 with 600,000 iterations (OWASP recommended)</li>
				<li><strong>Name</strong> (optional) - For personalization if you provide it</li>
			</ul>

			<h3 class="text-xl font-medium text-gray-800 mt-6 mb-3">2.3 For Paying Subscribers</h3>
			<p class="text-gray-600 mb-4">
				In addition to registered user data:
			</p>
			<ul class="text-gray-600 space-y-2 list-disc list-inside">
				<li><strong>Payment information</strong> - Processed by Stripe; we never see your full card number</li>
				<li><strong>Subscription status</strong> - To provide Pro features</li>
				<li><strong>Billing history</strong> - Managed by Stripe for your records</li>
			</ul>
		</section>

		<section class="mb-10">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Data</h2>
			<p class="text-gray-600 mb-4">
				We use your data only for:
			</p>
			<ul class="text-gray-600 space-y-2 list-disc list-inside">
				<li><strong>Providing the service</strong> - Account management, authentication, Pro features</li>
				<li><strong>Processing payments</strong> - Subscription billing through Stripe</li>
				<li><strong>Service communications</strong> - Password resets, important account notifications</li>
				<li><strong>Improving the product</strong> - Anonymous, aggregated usage statistics</li>
			</ul>
			<p class="text-gray-600 mt-4">
				We do <strong>not</strong> use your data for advertising, profiling, or selling to third parties.
			</p>
		</section>

		<section class="mb-10">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">4. Data Storage & Security</h2>
			<ul class="text-gray-600 space-y-2 list-disc list-inside">
				<li><strong>Hosting</strong> - Cloudflare Pages (global CDN with EU data processing)</li>
				<li><strong>Database</strong> - Cloudflare D1 (SQLite, EU region)</li>
				<li><strong>Payments</strong> - Stripe (PCI-DSS Level 1 certified)</li>
				<li><strong>Encryption</strong> - All data transmitted over HTTPS/TLS 1.3</li>
				<li><strong>Password security</strong> - PBKDF2-SHA256 with 600,000 iterations and unique salt</li>
			</ul>
		</section>

		<section class="mb-10">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">5. Third-Party Services</h2>
			<p class="text-gray-600 mb-4">
				We use these carefully selected third-party services:
			</p>
			
			<div class="bg-gray-50 rounded-xl p-6 mb-4">
				<h4 class="font-semibold text-gray-900 mb-2">Stripe (Payments)</h4>
				<p class="text-gray-600 text-sm">
					Processes payments securely. They receive your payment details directly - we never see your full card number.
					<a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Stripe Privacy Policy</a>
				</p>
			</div>

			<div class="bg-gray-50 rounded-xl p-6 mb-4">
				<h4 class="font-semibold text-gray-900 mb-2">Cloudflare (Infrastructure)</h4>
				<p class="text-gray-600 text-sm">
					Hosts our application and database. GDPR compliant with EU data processing.
					<a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Cloudflare Privacy Policy</a>
				</p>
			</div>

			<div class="bg-gray-50 rounded-xl p-6">
				<h4 class="font-semibold text-gray-900 mb-2">Cloudflare Web Analytics (Analytics)</h4>
				<p class="text-gray-600 text-sm">
					Privacy-friendly analytics built into Cloudflare. No cookies, no personal data, GDPR compliant.
					<a href="https://www.cloudflare.com/web-analytics/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Cloudflare Web Analytics</a>
				</p>
			</div>
		</section>

		<section class="mb-10">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights (GDPR/CCPA)</h2>
			<p class="text-gray-600 mb-4">
				You have the right to:
			</p>
			<ul class="text-gray-600 space-y-2 list-disc list-inside">
				<li><strong>Access</strong> - Request a copy of your personal data</li>
				<li><strong>Rectification</strong> - Correct inaccurate personal data</li>
				<li><strong>Erasure</strong> - Request deletion of your account and data</li>
				<li><strong>Portability</strong> - Export your data in a machine-readable format</li>
				<li><strong>Objection</strong> - Object to processing of your data</li>
				<li><strong>Withdraw consent</strong> - Withdraw consent at any time</li>
			</ul>
			<p class="text-gray-600 mt-4">
				To exercise any of these rights, contact us at <a href="mailto:{contactEmail}" class="text-blue-600 hover:underline">{contactEmail}</a>
			</p>
		</section>

		<section class="mb-10">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
			<ul class="text-gray-600 space-y-2 list-disc list-inside">
				<li><strong>Account data</strong> - Retained while your account is active</li>
				<li><strong>Deleted accounts</strong> - Data erased within 30 days of account deletion</li>
				<li><strong>Payment records</strong> - Retained as required by law (typically 7 years)</li>
				<li><strong>Analytics data</strong> - Aggregated, anonymous, no personal data retained</li>
			</ul>
		</section>

		<section class="mb-10">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">8. Cookies</h2>
			<p class="text-gray-600 mb-4">
				We use only <strong>essential cookies</strong> required for the service to function:
			</p>
			<ul class="text-gray-600 space-y-2 list-disc list-inside">
				<li><strong>Session cookie</strong> - Keeps you logged in (if you have an account)</li>
			</ul>
			<p class="text-gray-600 mt-4">
				We do <strong>not</strong> use cookies for tracking, advertising, or analytics.
			</p>
		</section>

		<section class="mb-10">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
			<p class="text-gray-600">
				PTO Optimizer is not intended for children under 16. We do not knowingly collect 
				personal data from children. If you believe a child has provided us with personal data, 
				please contact us immediately.
			</p>
		</section>

		<section class="mb-10">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
			<p class="text-gray-600">
				We may update this privacy policy from time to time. We will notify you of significant 
				changes by posting a notice on our website or sending you an email. Continued use of 
				the service after changes constitutes acceptance of the updated policy.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
			<p class="text-gray-600 mb-4">
				For privacy-related questions or to exercise your rights:
			</p>
			<div class="bg-blue-50 rounded-xl p-6">
				<p class="text-blue-900">
					<strong>Email:</strong> <a href="mailto:{contactEmail}" class="text-blue-600 hover:underline">{contactEmail}</a>
				</p>
				<p class="text-blue-900 mt-2">
					<strong>GitHub:</strong> <a href="https://github.com/benthepythondev00/pto-optimizer/issues" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Open an issue</a>
				</p>
			</div>
		</section>
	</article>
</div>
