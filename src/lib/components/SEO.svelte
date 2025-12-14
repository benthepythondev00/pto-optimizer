<script lang="ts">
	interface Props {
		title?: string;
		description?: string;
		keywords?: string;
		canonical?: string;
		ogImage?: string;
		ogType?: string;
		twitterCard?: string;
		noindex?: boolean;
		jsonLd?: Record<string, unknown>;
	}

	const {
		title = 'PTO Optimizer - Maximize Your Vacation Days',
		description = 'Free tool to optimize your PTO days around holidays. Get more time off with strategic planning. Works for US, UK, Germany, Canada, Australia & France.',
		keywords = 'PTO optimizer, vacation planner, holiday optimizer, time off calculator, maximize vacation days, bridge days, long weekend planner',
		canonical = '',
		ogImage = '/og-image.png',
		ogType = 'website',
		twitterCard = 'summary_large_image',
		noindex = false,
		jsonLd,
	}: Props = $props();

	const siteName = 'PTO Optimizer';
	const siteUrl = 'https://pto-optimizer.pages.dev'; // Update with actual domain
	
	const fullTitle = $derived(title === siteName ? title : `${title} | ${siteName}`);
	const canonicalUrl = $derived(canonical || siteUrl);
	const fullOgImage = $derived(ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`);

	// Default JSON-LD structured data
	const defaultJsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: 'PTO Optimizer',
		description,
		url: siteUrl,
		applicationCategory: 'UtilityApplication',
		operatingSystem: 'Any',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD',
		},
		author: {
			'@type': 'Organization',
			name: 'PTO Optimizer',
		},
	});

	const structuredData = $derived(jsonLd || defaultJsonLd);
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{fullTitle}</title>
	<meta name="title" content={fullTitle} />
	<meta name="description" content={description} />
	<meta name="keywords" content={keywords} />
	<link rel="canonical" href={canonicalUrl} />
	
	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{:else}
		<meta name="robots" content="index, follow" />
	{/if}

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={ogType} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={fullOgImage} />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:locale" content="en_US" />

	<!-- Twitter -->
	<meta name="twitter:card" content={twitterCard} />
	<meta name="twitter:url" content={canonicalUrl} />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={fullOgImage} />

	<!-- Additional SEO -->
	<meta name="author" content="PTO Optimizer" />
	<meta name="generator" content="SvelteKit" />
	<meta name="theme-color" content="#3b82f6" />
	
	<!-- Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}
</svelte:head>
