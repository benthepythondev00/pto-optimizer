<script lang="ts">
	interface Props {
		minimal?: boolean;
	}

	const { minimal = false }: Props = $props();
</script>

<header class="w-full py-4 px-4 sm:px-6 lg:px-8">
	<nav class="max-w-5xl mx-auto flex items-center justify-between">
		<a href="/" class="flex items-center gap-2 group">
			<div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
				<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
			</div>
			<span class="text-xl font-bold text-gray-900 tracking-tight">
				PTO<span class="text-blue-600">.</span>
			</span>
		</a>

		{#if !minimal}
			<div class="flex items-center gap-6">
				<a
					href="/about"
					class="text-sm text-gray-600 hover:text-gray-900 transition-colors"
				>
					How it works
				</a>
				<a
					href="/about"
					class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
				>
					<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					About
				</a>
			</div>
		{/if}
	</nav>
</header>
