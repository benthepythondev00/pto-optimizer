<script lang="ts">
	import { enhance } from '$app/forms';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	
	let { data } = $props();
	
	// Format date for display
	function formatDate(date: Date | string | null): string {
		if (!date) return 'N/A';
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
	
	// Get status badge color
	function getStatusColor(status: string): string {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800';
			case 'canceled':
			case 'cancelled':
				return 'bg-red-100 text-red-800';
			case 'past_due':
				return 'bg-yellow-100 text-yellow-800';
			case 'trialing':
				return 'bg-blue-100 text-blue-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<svelte:head>
	<title>Account | PTO Optimizer</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
	<Header />
	
	<main class="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>
		
		<!-- Profile Section -->
		<section class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">Profile</h2>
			<div class="space-y-4">
				<div>
					<span class="block text-sm font-medium text-gray-500">Email</span>
					<p class="text-gray-900">{data.user?.email}</p>
				</div>
				{#if data.user?.name}
					<div>
						<span class="block text-sm font-medium text-gray-500">Name</span>
						<p class="text-gray-900">{data.user.name}</p>
					</div>
				{/if}
			</div>
		</section>
		
		<!-- Subscription Section -->
		<section class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">Subscription</h2>
			
			{#if data.subscription}
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<div>
							<p class="font-medium text-gray-900">Pro Plan</p>
							<p class="text-sm text-gray-500">
								{data.subscription.cancelAtPeriodEnd 
									? 'Cancels on ' + formatDate(data.subscription.currentPeriodEnd)
									: 'Renews on ' + formatDate(data.subscription.currentPeriodEnd)
								}
							</p>
						</div>
						<span class="px-3 py-1 rounded-full text-sm font-medium {getStatusColor(data.subscription.status)}">
							{data.subscription.status}
						</span>
					</div>
					
					{#if data.subscription.cancelAtPeriodEnd}
						<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
							<p class="text-sm text-yellow-800">
								Your subscription is set to cancel at the end of the current billing period. 
								You'll continue to have Pro access until {formatDate(data.subscription.currentPeriodEnd)}.
							</p>
						</div>
					{/if}
					
					<form method="POST" action="?/portal" use:enhance>
						<button 
							type="submit"
							class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
						>
							<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
							Manage Subscription
						</button>
					</form>
					<p class="text-xs text-gray-500">
						Update payment method, view invoices, or cancel your subscription
					</p>
				</div>
			{:else}
				<div class="text-center py-8">
					<div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
						<svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<h3 class="text-lg font-medium text-gray-900 mb-2">Free Plan</h3>
					<p class="text-gray-500 mb-4">You're currently on the free plan with 3 optimizations per month.</p>
					<a 
						href="/?upgrade=true"
						class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all"
					>
						Upgrade to Pro
					</a>
				</div>
			{/if}
		</section>
		
		<!-- Danger Zone -->
		<section class="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
			<h2 class="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
			<div class="flex items-center justify-between">
				<div>
					<p class="font-medium text-gray-900">Sign Out</p>
					<p class="text-sm text-gray-500">Sign out of your account on this device</p>
				</div>
				<a 
					href="/auth/logout"
					class="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
				>
					Sign Out
				</a>
			</div>
		</section>
	</main>
	
	<Footer />
</div>
