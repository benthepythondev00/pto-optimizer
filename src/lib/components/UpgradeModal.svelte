<script lang="ts">
	import { usageStore } from '$lib/stores/usage.svelte.js';
	
	interface Props {
		open?: boolean;
		onclose?: () => void;
	}
	
	let { open = false, onclose }: Props = $props();
	
	const features = [
		{ icon: '♾️', title: 'Unlimited Optimizations', desc: 'No monthly limits' },
		{ icon: '🌍', title: 'All 6 Countries', desc: 'US, UK, DE, CA, AU, FR' },
		{ icon: '📅', title: 'Calendar Export', desc: 'Sync with Google/Outlook' },
		{ icon: '💾', title: 'Save Scenarios', desc: 'Compare different plans' },
		{ icon: '📧', title: 'Email Reminders', desc: 'Never forget your PTO' },
		{ icon: '📊', title: 'Multi-Year Planning', desc: 'Plan 3 years ahead' },
	];
	
	function handleUpgrade() {
		// TODO: Integrate with Lemon Squeezy
		window.open('https://pto-optimizer.lemonsqueezy.com/checkout', '_blank');
	}
	
	function handleClose() {
		onclose?.();
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
		onclick={(e) => e.target === e.currentTarget && handleClose()}
	>
		<div class="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
			<!-- Close button -->
			<button 
				onclick={handleClose}
				class="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
				aria-label="Close"
			>
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
			
			<!-- Header -->
			<div class="mb-6 text-center">
				<div class="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
					<svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				</div>
				<h2 class="text-2xl font-bold text-gray-900">Upgrade to Pro</h2>
				<p class="mt-1 text-gray-600">
					You've used {usageStore.count} of {usageStore.limit} free optimizations this month
				</p>
			</div>
			
			<!-- Usage bar -->
			<div class="mb-6">
				<div class="h-2 w-full overflow-hidden rounded-full bg-gray-200">
					<div 
						class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
						style="width: {usageStore.usagePercentage}%"
					></div>
				</div>
			</div>
			
			<!-- Features grid -->
			<div class="mb-6 grid grid-cols-2 gap-3">
				{#each features as feature}
					<div class="flex items-start gap-2 rounded-lg bg-gray-50 p-3">
						<span class="text-xl">{feature.icon}</span>
						<div>
							<p class="font-medium text-gray-900">{feature.title}</p>
							<p class="text-xs text-gray-500">{feature.desc}</p>
						</div>
					</div>
				{/each}
			</div>
			
			<!-- Pricing -->
			<div class="mb-6 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-gray-600">Pro Plan</p>
						<div class="flex items-baseline gap-1">
							<span class="text-3xl font-bold text-gray-900">$4.99</span>
							<span class="text-gray-500">/month</span>
						</div>
					</div>
					<div class="text-right">
						<p class="text-sm font-medium text-indigo-600">Save 35%</p>
						<p class="text-sm text-gray-500">$39/year</p>
					</div>
				</div>
			</div>
			
			<!-- CTA buttons -->
			<div class="space-y-3">
				<button 
					onclick={handleUpgrade}
					class="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 font-semibold text-white shadow-lg transition-all hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl"
				>
					Upgrade Now
				</button>
				<button 
					onclick={handleClose}
					class="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
				>
					Maybe later
				</button>
			</div>
			
			<!-- Trust badges -->
			<div class="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
				<span>🔒 Secure payment</span>
				<span>•</span>
				<span>Cancel anytime</span>
				<span>•</span>
				<span>7-day refund</span>
			</div>
		</div>
	</div>
{/if}
