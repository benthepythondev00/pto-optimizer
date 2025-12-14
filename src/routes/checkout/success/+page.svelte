<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Subscription Successful - PTO Optimizer</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center py-12 px-4">
	<div class="max-w-md w-full text-center">
		<div class="bg-white rounded-2xl shadow-xl p-8">
			<div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
				<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
				</svg>
			</div>

			<h1 class="text-2xl font-bold text-gray-900 mb-2">Welcome to Pro!</h1>
			<p class="text-gray-600 mb-6">{data.message}</p>

			<div class="space-y-4 text-left mb-8">
				<div class="flex items-center gap-3">
					<span class="text-green-500">✓</span>
					<span class="text-gray-700">All 6 countries unlocked</span>
				</div>
				<div class="flex items-center gap-3">
					<span class="text-green-500">✓</span>
					<span class="text-gray-700">Unlimited optimizations</span>
				</div>
				<div class="flex items-center gap-3">
					<span class="text-green-500">✓</span>
					<span class="text-gray-700">Calendar export (.ics)</span>
				</div>
				<div class="flex items-center gap-3">
					<span class="text-green-500">✓</span>
					<span class="text-gray-700">Priority support</span>
				</div>
			</div>

			<a
				href="/"
				class="inline-block w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all"
			>
				Start Optimizing
			</a>
		</div>
	</div>
</div>
