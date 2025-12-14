<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	
	const lastUpdated = 'December 14, 2025';
	const contactEmail = 'support@ptooptimizer.com';
</script>

<SEO 
	title="Terms of Service - PTO Optimizer"
	description="Terms of Service for PTO Optimizer. Read our terms for using the vacation planning service."
/>

<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
	<article class="prose prose-gray prose-lg max-w-none">
		<h1 class="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
		<p class="text-sm text-gray-500 mb-8">Last updated: {lastUpdated}</p>
		
		<p class="text-xl text-gray-600 leading-relaxed mb-12">
			Welcome to PTO Optimizer. By using our service, you agree to these terms. 
			Please read them carefully.
		</p>

		<section class="mb-10">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
			<p class="text-gray-600 mb-4">
				By accessing or using PTO Optimizer ("Service"), you agree to be bound by these 
				Terms of Service ("Terms"). If you disagree with any part of these terms, you 
				may not access the Service.
			</p>
			<p class="text-gray-600">
				These Terms apply to all visitors, users, and others who access or use the Service, 
				whether using the free tier or a paid subscription.
			</p>
		</section>

		<section class="mb-10">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
			<p class="text-gray-600 mb-4">
				PTO Optimizer is a vacation planning tool that helps users maximize their time off 
				by strategically planning PTO around public holidays. The Service includes:
			</p>
			<ul class="text-gray-600 space-y-2 list-disc list-inside">
				<li>PTO optimization algorithm and recommendations</li>
				<li>Calendar visualization of vacation periods</li>
				<li>Public holiday data for supported countries</li>
				<li>Account management (for registered users)</li>
				<li>Premium features (for paying subscribers)</li>
			</ul>
		</section>

		<section class="mb-10">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
			
			<h3 class="text-xl font-medium text-gray-800 mt-6 mb-3">3.1 Account Creation</h3>
			<p class="text-gray-600 mb-4">
				To access certain features, you may need to create an account. You agree to:
			</p>
			<ul class="text-gray-600 space-y-2 list-disc list-inside">
				<li>Provide accurate, current, and complete information</li>
				<li>Maintain and update your information as needed</li>
				<li>Keep your password secure and confidential</li>
				<li>Notify us immediately of any unauthorized account access</li>
				<li>Accept responsibility for all activities under your account</li>
			</ul>

			<h3 class="text-xl font-medium text-gray-800 mt-6 mb-3">3.2 Account Termination</h3>
			<p class="text-gray-600">
				You may delete your account at any time through your account settings. We may 
				suspend or terminate your account if you violate these Terms or engage in 
				fraudulent or illegal activity.
			</p>
		</section>

		<section class="mb-10">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">4. Free and Paid Services</h2>
			
			<h3 class="text-xl font-medium text-gray-800 mt-6 mb-3">4.1 Free Tier</h3>
			<p class="text-gray-600 mb-4">
				The free tier includes:
			</p>
			<ul class="text-gray-600 space-y-2 list-disc list-inside">
				<li>3 optimizations per month</li>
				<li>1 country (US)</li>
				<li>Current year planning</li>
			</ul>

			<h3 class="text-xl font-medium text-gray-800 mt-6 mb-3">4.2 Pro Subscription</h3>
			<p class="text-gray-600 mb-4">
				Pro subscribers receive additional features including unlimited optimizations, 
				all supported countries, multi-year planning, and calendar export. Pro subscription 
				details:
			</p>
			<ul class="text-gray-600 space-y-2 list-disc list-inside">
				<li><strong>Billing</strong> - Monthly ($4.99) or Annual ($39) subscription</li>
				<li><strong>Automatic renewal</strong> - Subscriptions renew automatically</li>
				<li><strong>Cancellation</strong> - Cancel anytime; access continues until period end</li>
				<li><strong>Refunds</strong> - 7-day refund policy for new subscriptions</li>
			</ul>
		</section>

		<section class="mb-10">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">5. Payment Terms</h2>
			<p class="text-gray-600 mb-4">
				For paid subscriptions:
			</p>
			<ul class="text-gray-600 space-y-2 list-disc list-inside">
				<li>Payments are processed securely by Stripe</li>
				<li>Prices are in USD and may be subject to applicable taxes</li>
				<li>You authorize us to charge your payment method for recurring fees</li>
				<li>Failed payments may result in service suspension</li>
				<li>We may change pricing with 30 days notice to existing subscribers</li>
			</ul>

			<h3 class="text-xl font-medium text-gray-800 mt-6 mb-3">5.1 Refund Policy</h3>
			<p class="text-gray-600">
				New subscribers may request a full refund within 7 days of their initial purchase. 
				After 7 days, or for renewal payments, refunds are not available but you may 
				cancel to prevent future charges. Contact <a href="mailto:{contactEmail}" class="text-blue-600 hover:underline">{contactEmail}</a> for refund requests.
			</p>
		</section>

		<section class="mb-10">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">6. Acceptable Use</h2>
			<p class="text-gray-600 mb-4">
				You agree not to:
			</p>
			<ul class="text-gray-600 space-y-2 list-disc list-inside">
				<li>Use the Service for any illegal purpose</li>
				<li>Attempt to gain unauthorized access to any part of the Service</li>
				<li>Interfere with or disrupt the Service or servers</li>
				<li>Use automated systems (bots, scrapers) without permission</li>
				<li>Circumvent usage limits or security measures</li>
				<li>Share your account credentials with others</li>
				<li>Resell or redistribute the Service without authorization</li>
			</ul>
		</section>

		<section class="mb-10">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
			<p class="text-gray-600 mb-4">
				The Service and its original content, features, and functionality are owned by 
				PTO Optimizer and are protected by international copyright, trademark, and other 
				intellectual property laws.
			</p>
			<p class="text-gray-600">
				The PTO Optimizer software is open source under the MIT License. You may view, 
				fork, and modify the source code in accordance with that license. However, the 
				"PTO Optimizer" name and branding remain our property.
			</p>
		</section>

		<section class="mb-10">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">8. Disclaimer of Warranties</h2>
			<div class="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
				<p class="text-yellow-800 mb-4">
					THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF 
					ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED 
					WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND 
					NON-INFRINGEMENT.
				</p>
				<p class="text-yellow-800">
					We do not warrant that:
				</p>
				<ul class="text-yellow-800 list-disc list-inside mt-2 space-y-1">
					<li>The Service will be uninterrupted, secure, or error-free</li>
					<li>Results from using the Service will be accurate or reliable</li>
					<li>The Service will meet your specific requirements</li>
					<li>Holiday data will be complete or accurate for your jurisdiction</li>
				</ul>
			</div>
		</section>

		<section class="mb-10">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
			<div class="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
				<p class="text-yellow-800">
					IN NO EVENT SHALL PTO OPTIMIZER, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, 
					SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
					CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF 
					PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
				</p>
				<ul class="text-yellow-800 list-disc list-inside mt-4 space-y-1">
					<li>Your access to or use of (or inability to use) the Service</li>
					<li>Any conduct or content of any third party on the Service</li>
					<li>Unauthorized access, use, or alteration of your content</li>
					<li>Decisions made based on the Service's recommendations</li>
				</ul>
				<p class="text-yellow-800 mt-4">
					Our total liability shall not exceed the amount you paid us in the 12 months 
					preceding the claim.
				</p>
			</div>
		</section>

		<section class="mb-10">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
			<p class="text-gray-600">
				You agree to defend, indemnify, and hold harmless PTO Optimizer and its officers, 
				directors, employees, and agents from any claims, damages, obligations, losses, 
				liabilities, costs, or expenses arising from: (a) your use of the Service; 
				(b) your violation of these Terms; (c) your violation of any third party rights.
			</p>
		</section>

		<section class="mb-10">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
			<p class="text-gray-600">
				We reserve the right to modify these Terms at any time. We will provide notice 
				of significant changes by posting on the website or sending email to registered 
				users. Continued use of the Service after changes constitutes acceptance of the 
				new Terms.
			</p>
		</section>

		<section class="mb-10">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
			<p class="text-gray-600">
				These Terms shall be governed by and construed in accordance with the laws of 
				the European Union. Any disputes arising from these Terms or the Service shall 
				be resolved in the courts of the EU jurisdiction where the Service operator 
				is established.
			</p>
		</section>

		<section class="mb-10">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">13. Severability</h2>
			<p class="text-gray-600">
				If any provision of these Terms is found to be unenforceable or invalid, that 
				provision shall be limited or eliminated to the minimum extent necessary, and 
				the remaining provisions shall remain in full force and effect.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">14. Contact Us</h2>
			<p class="text-gray-600 mb-4">
				For questions about these Terms:
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
