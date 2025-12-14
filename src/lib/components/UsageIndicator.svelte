<script lang="ts">
	import { usageStore } from '$lib/stores/usage.svelte.js';
	
	interface Props {
		onupgrade?: () => void;
	}
	
	let { onupgrade }: Props = $props();
</script>

{#if !usageStore.isPro}
	<div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
					<svg class="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
					</svg>
				</div>
				<div>
					<p class="text-sm font-medium text-gray-900">
						{usageStore.remaining} of {usageStore.limit} free optimizations left
					</p>
					<p class="text-xs text-gray-500">Resets monthly</p>
				</div>
			</div>
			
			{#if usageStore.isAtLimit}
				<button 
					onclick={() => onupgrade?.()}
					class="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
				>
					Upgrade
				</button>
			{:else}
				<button 
					onclick={() => onupgrade?.()}
					class="text-sm font-medium text-indigo-600 hover:text-indigo-700"
				>
					Go Pro
				</button>
			{/if}
		</div>
		
		<!-- Progress bar -->
		<div class="mt-3">
			<div class="h-2 w-full overflow-hidden rounded-full bg-gray-100">
				<div 
					class="h-full rounded-full transition-all duration-300"
					class:bg-green-500={usageStore.usagePercentage < 66}
					class:bg-yellow-500={usageStore.usagePercentage >= 66 && usageStore.usagePercentage < 100}
					class:bg-red-500={usageStore.usagePercentage >= 100}
					style="width: {usageStore.usagePercentage}%"
				></div>
			</div>
		</div>
	</div>
{:else}
	<div class="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2">
		<svg class="h-5 w-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
			<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
		</svg>
		<span class="text-sm font-medium text-indigo-700">Pro Plan Active</span>
	</div>
{/if}
