<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Sign In - PTO Optimizer</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center py-12 px-4">
	<div class="max-w-md w-full">
		<div class="text-center mb-8">
			<a href="/" class="inline-flex items-center gap-2 text-2xl font-bold text-gray-900">
				<span class="text-3xl">🏖️</span>
				PTO Optimizer
			</a>
			<h1 class="mt-6 text-3xl font-bold text-gray-900">Welcome back</h1>
			<p class="mt-2 text-gray-600">Sign in to your account</p>
		</div>

		<div class="bg-white rounded-2xl shadow-xl p-8">
			{#if form?.message}
				<div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
					{form.message}
				</div>
			{/if}

			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update();
					};
				}}
				class="space-y-5"
			>
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
						Email address
					</label>
					<input
						type="email"
						id="email"
						name="email"
						required
						autocomplete="email"
						value={form?.email ?? ''}
						class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
						placeholder="you@example.com"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-gray-700 mb-1">
						Password
					</label>
					<input
						type="password"
						id="password"
						name="password"
						required
						autocomplete="current-password"
						class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
						placeholder="••••••••"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if loading}
						<span class="flex items-center justify-center gap-2">
							<svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
							</svg>
							Signing in...
						</span>
					{:else}
						Sign in
					{/if}
				</button>
			</form>

			<div class="mt-6 text-center">
				<p class="text-sm text-gray-600">
					Don't have an account?
					<a href="/auth/signup" class="font-medium text-indigo-600 hover:text-indigo-500">
						Sign up for free
					</a>
				</p>
			</div>
		</div>
	</div>
</div>
