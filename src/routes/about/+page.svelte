<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
</script>

<SEO 
	title="About - How PTO Optimizer Works"
	description="Learn how PTO Optimizer helps you maximize your vacation days by strategically planning time off around holidays. Free, open source, and privacy-focused."
/>

<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
	<article class="prose prose-gray prose-lg max-w-none">
		<h1 class="text-4xl font-bold text-gray-900 mb-8">How It Works</h1>
		
		<p class="text-xl text-gray-600 leading-relaxed mb-12">
			PTO Optimizer uses a smart algorithm to find the optimal days to take off, 
			maximizing your total vacation time by strategically bridging weekends and holidays.
		</p>

		<section class="mb-12">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">The Strategy</h2>
			<p class="text-gray-600 mb-4">
				The key insight is simple: by taking off just a few strategic days, you can turn 
				short weekends into extended vacations. For example:
			</p>
			<div class="bg-blue-50 rounded-2xl p-6 mb-6">
				<h3 class="font-semibold text-blue-900 mb-3">Example: Thanksgiving Week (US)</h3>
				<ul class="text-blue-800 space-y-2">
					<li>Take off Monday, Tuesday, Wednesday (3 PTO days)</li>
					<li>Thursday & Friday are holidays</li>
					<li>Saturday & Sunday are weekend</li>
					<li class="font-semibold">Result: 9 days off using only 3 PTO days!</li>
				</ul>
			</div>
		</section>

		<section class="mb-12">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">The Algorithm</h2>
			<p class="text-gray-600 mb-4">
				Our optimizer scans your entire year and identifies "bridge opportunities" - 
				gaps between free days (weekends and holidays) that can be efficiently filled with PTO.
			</p>
			<ol class="text-gray-600 space-y-3 list-decimal list-inside">
				<li>Maps all weekends and public holidays for your selected country and year</li>
				<li>Identifies gaps between free day clusters that are 1-5 days</li>
				<li>Calculates the "efficiency" of each opportunity (total days off / PTO used)</li>
				<li>Selects the highest-efficiency opportunities that fit your PTO budget</li>
				<li>Returns non-overlapping vacation periods optimized for maximum time off</li>
			</ol>
		</section>

		<section class="mb-12">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">Supported Countries</h2>
			<p class="text-gray-600 mb-4">
				We currently support public holidays for:
			</p>
			<div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
				<div class="flex items-center gap-2 text-gray-700">
					<span class="text-2xl">🇺🇸</span> United States
				</div>
				<div class="flex items-center gap-2 text-gray-700">
					<span class="text-2xl">🇬🇧</span> United Kingdom
				</div>
				<div class="flex items-center gap-2 text-gray-700">
					<span class="text-2xl">🇩🇪</span> Germany
				</div>
				<div class="flex items-center gap-2 text-gray-700">
					<span class="text-2xl">🇨🇦</span> Canada
				</div>
				<div class="flex items-center gap-2 text-gray-700">
					<span class="text-2xl">🇦🇺</span> Australia
				</div>
				<div class="flex items-center gap-2 text-gray-700">
					<span class="text-2xl">🇫🇷</span> France
				</div>
			</div>
		</section>

		<section class="mb-12">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">Privacy</h2>
			<p class="text-gray-600">
				All calculations happen in your browser. We don't collect, store, or transmit 
				any of your data. There are no accounts, no cookies, no tracking. Just a simple 
				tool that helps you plan better vacations.
			</p>
		</section>

		<section class="mb-12">
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">Open Source</h2>
			<p class="text-gray-600 mb-4">
				PTO Optimizer is completely free and open source under the MIT license. 
				You can:
			</p>
			<ul class="text-gray-600 space-y-2 list-disc list-inside">
				<li>View the source code on GitHub</li>
				<li>Self-host your own instance</li>
				<li>Contribute improvements</li>
				<li>Fork it for your own projects</li>
			</ul>
			<a
				href="https://github.com/yourusername/pto-optimizer"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors no-underline"
			>
				<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
					<path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
				</svg>
				View on GitHub
			</a>
		</section>

		<section>
			<h2 class="text-2xl font-semibold text-gray-900 mb-4">Questions?</h2>
			<p class="text-gray-600">
				Found a bug? Want to request a feature? Have a question? 
				<a 
					href="https://github.com/yourusername/pto-optimizer/issues"
					target="_blank"
					rel="noopener noreferrer"
					class="text-blue-600 hover:text-blue-700"
				>
					Open an issue on GitHub
				</a>
				 and we'll help you out.
			</p>
		</section>
	</article>
</div>
