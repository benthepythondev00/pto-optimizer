<script lang="ts">
	import { usageStore } from '$lib/stores/usage.svelte.js';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	
	interface Props {
		open?: boolean;
		onclose?: () => void;
	}
	
	let { open = false, onclose }: Props = $props();
	
	let loading = $state(false);
	let error = $state('');
	let selectedPlan = $state<'monthly' | 'yearly'>('monthly');
	
	// Get user from page data
	let user = $derived($page.data.user);
	
	const features = [
		{ icon: '♾️', title: 'Unlimited Optimizations', desc: 'No monthly limits' },
		{ icon: '🌍', title: 'All 6 Countries', desc: 'US, UK, DE, CA, AU, FR' },
		{ icon: '📅', title: 'Calendar Export', desc: 'Sync with Google/Outlook' },
		{ icon: '💾', title: 'Save Scenarios', desc: 'Compare different plans' },
		{ icon: '📧', title: 'Email Reminders', desc: 'Never forget your PTO' },
		{ icon: '📊', title: 'Multi-Year Planning', desc: 'Plan 3 years ahead' },
	];
	
	async function handleUpgrade() {
		// If not logged in, redirect to signup with return URL
		if (!user) {
			const returnUrl = encodeURIComponent('/?upgrade=true');
			goto(`/auth/signup?redirect=${returnUrl}`);
			onclose?.();
			return;
		}
		
		loading = true;
		error = '';
		
		try {
			const response = await fetch('/api/stripe/checkout', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ plan: selectedPlan })
			});
			
			const data = await response.json();
			
			if (!response.ok) {
				throw new Error(data.message || 'Failed to create checkout session');
			}
			
			// Redirect to Stripe checkout
			if (data.url) {
				window.location.href = data.url;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Something went wrong';
		} finally {
			loading = false;
		}
	}
	
	function handleClose() {
		error = '';
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
		<div class="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
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
			
			<!-- Plan selection -->
			<div class="mb-6 space-y-3">
				<button
					onclick={() => selectedPlan = 'monthly'}
					class="w-full rounded-xl border-2 p-4 text-left transition-all {selectedPlan === 'monthly' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}"
				>
					<div class="flex items-center justify-between">
						<div>
							<p class="font-semibold text-gray-900">Monthly</p>
							<p class="text-sm text-gray-500">Billed monthly</p>
						</div>
						<div class="text-right">
							<span class="text-2xl font-bold text-gray-900">$4.99</span>
							<span class="text-gray-500">/mo</span>
						</div>
					</div>
				</button>
				
				<button
					onclick={() => selectedPlan = 'yearly'}
					class="relative w-full rounded-xl border-2 p-4 text-left transition-all {selectedPlan === 'yearly' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}"
				>
					<div class="absolute -top-3 right-4 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
						Save 35%
					</div>
					<div class="flex items-center justify-between">
						<div>
							<p class="font-semibold text-gray-900">Yearly</p>
							<p class="text-sm text-gray-500">Billed annually</p>
						</div>
						<div class="text-right">
							<span class="text-2xl font-bold text-gray-900">$39</span>
							<span class="text-gray-500">/year</span>
							<p class="text-xs text-gray-400">($3.25/mo)</p>
						</div>
					</div>
				</button>
			</div>
			
			<!-- Error message -->
			{#if error}
				<div class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
					{error}
				</div>
			{/if}
			
			<!-- CTA buttons -->
			<div class="space-y-3">
				<button 
					onclick={handleUpgrade}
					disabled={loading}
					class="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 font-semibold text-white shadow-lg transition-all hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if loading}
						<span class="inline-flex items-center gap-2">
							<svg class="h-5 w-5 animate-spin" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Processing...
						</span>
					{:else if !user}
						Sign Up to Upgrade
					{:else}
						Upgrade Now
					{/if}
				</button>
				<button 
					onclick={handleClose}
					class="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
				>
					Maybe later
				</button>
			</div>
			
			<!-- Login link for non-logged in users -->
			{#if !user}
				<p class="mt-4 text-center text-sm text-gray-500">
					Already have an account? 
					<a href="/auth/login?redirect={encodeURIComponent('/?upgrade=true')}" class="text-indigo-600 hover:underline">
						Log in
					</a>
				</p>
			{/if}
			
			<!-- Trust badges -->
			<div class="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
				<span>Secure payment</span>
				<span>|</span>
				<span>Cancel anytime</span>
				<span>|</span>
				<span>7-day refund</span>
			</div>
		</div>
	</div>
{/if}
