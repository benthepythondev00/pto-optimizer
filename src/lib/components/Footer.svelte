<script lang="ts">
	const currentYear = new Date().getFullYear();
</script>

<footer class="w-full py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-100 mt-auto">
	<div class="max-w-5xl mx-auto">
		<div class="flex flex-col sm:flex-row items-center justify-between gap-4">
			<div class="flex items-center gap-2 text-gray-500 text-sm">
				<span>Built with</span>
				<svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
				</svg>
				<span>for people who value their time</span>
			</div>
			
			<div class="flex items-center gap-6 text-sm">
				<a
					href="/about"
					class="text-gray-500 hover:text-gray-900 transition-colors"
				>
					About
				</a>
				<a
					href="/auth/login"
					class="text-gray-500 hover:text-gray-900 transition-colors"
				>
					Sign In
				</a>
				<span class="text-gray-400">
					&copy; {currentYear}
				</span>
			</div>
		</div>
		
		<!-- Powered by note -->
		<div class="mt-6 pt-6 border-t border-gray-100 text-center">
			<p class="text-xs text-gray-400">
				Powered by SvelteKit & Cloudflare Pages
			</p>
		</div>
	</div>
</footer>
