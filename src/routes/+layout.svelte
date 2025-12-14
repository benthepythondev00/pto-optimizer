<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	interface Props {
		children: import('svelte').Snippet;
	}

	const { children }: Props = $props();
</script>

<div class="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
	<Header />
	<main class="flex-1">
		{@render children()}
	</main>
	<Footer />
</div>
