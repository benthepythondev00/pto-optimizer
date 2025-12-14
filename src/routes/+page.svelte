<script lang="ts">
	import { onMount } from 'svelte';
	import SEO from '$lib/components/SEO.svelte';
	import CountrySelect from '$lib/components/CountrySelect.svelte';
	import ResultCard from '$lib/components/ResultCard.svelte';
	import Calendar from '$lib/components/Calendar.svelte';
	import UpgradeModal from '$lib/components/UpgradeModal.svelte';
	import UsageIndicator from '$lib/components/UsageIndicator.svelte';
	import { COUNTRIES, type CountryCode, getHolidaysForCountry } from '$lib/utils/holidays';
	import { optimizePTO, getCalendarData, type OptimizationResult, type DayInfo } from '$lib/utils/optimizer';
	import { usageStore } from '$lib/stores/usage.svelte.js';

	// State
	let selectedCountry: CountryCode = $state('US');
	let selectedYear: number = $state(new Date().getFullYear() + 1);
	let ptoDays: number = $state(15);
	let result: OptimizationResult | null = $state(null);
	let calendarData: DayInfo[] = $state([]);
	let isCalculating: boolean = $state(false);
	let showCalendar: boolean = $state(false);
	let showUpgradeModal: boolean = $state(false);
	let hasCalculatedOnce: boolean = $state(false);

	// Available years (current year + next 5 years)
	const currentYear = new Date().getFullYear();
	const availableYears = Array.from({ length: 6 }, (_, i) => currentYear + i);

	// Premium countries (free users only get US)
	const freeCountries: CountryCode[] = ['US'];
	const isPremiumCountry = $derived(!freeCountries.includes(selectedCountry) && !usageStore.isPro);

	// Initialize store on mount
	onMount(() => {
		usageStore.init();
	});

	// Calculate optimization
	function calculateOptimization() {
		// Check if user can optimize (has remaining uses or is Pro)
		if (!usageStore.canOptimize && hasCalculatedOnce) {
			showUpgradeModal = true;
			return;
		}

		// Check if trying to use premium country
		if (isPremiumCountry) {
			showUpgradeModal = true;
			return;
		}

		isCalculating = true;
		
		// Use setTimeout to allow UI to update
		setTimeout(() => {
			const holidays = getHolidaysForCountry(selectedCountry, selectedYear);
			result = optimizePTO(selectedYear, holidays, ptoDays);
			calendarData = getCalendarData(selectedYear, holidays, result);
			isCalculating = false;
			
			// Increment usage count (only after first calculation)
			if (hasCalculatedOnce) {
				usageStore.incrementUsage();
			}
			hasCalculatedOnce = true;
		}, 100);
	}

	// Recalculate when inputs change
	$effect(() => {
		// Track dependencies
		selectedCountry;
		selectedYear;
		ptoDays;
		// Recalculate
		calculateOptimization();
	});

	// Handle country change with premium check
	function handleCountryChange(code: CountryCode) {
		if (!freeCountries.includes(code) && !usageStore.isPro) {
			showUpgradeModal = true;
			return;
		}
		selectedCountry = code;
	}

	function openUpgradeModal() {
		showUpgradeModal = true;
	}
</script>

<SEO 
	title="PTO Optimizer - Maximize Your Vacation Days"
	description="Free tool to maximize your time off by strategically planning PTO around holidays. Get more vacation days without using more PTO. Works for US, UK, Germany, Canada, Australia & France."
/>

<!-- Upgrade Modal -->
<UpgradeModal 
	open={showUpgradeModal} 
	onclose={() => showUpgradeModal = false} 
/>

<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
	<!-- Hero Section -->
	<section class="text-center mb-12 sm:mb-16">
		<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
			</svg>
			{#if usageStore.isPro}
				Pro Plan Active
			{:else}
				{usageStore.remaining} Free Optimizations Left
			{/if}
		</div>
		
		<h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
			Maximize Your
			<span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
				Vacation Days
			</span>
		</h1>
		
		<p class="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
			Strategic PTO planning around holidays. Get more time off without using more vacation days.
		</p>
	</section>

	<!-- Usage Indicator -->
	<section class="mb-6">
		<UsageIndicator onupgrade={openUpgradeModal} />
	</section>

	<!-- Input Section -->
	<section class="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-8 mb-8">
		<div class="grid sm:grid-cols-3 gap-6">
			<!-- Country -->
			<div class="relative">
				<CountrySelect 
					value={selectedCountry}
					onchange={handleCountryChange}
				/>
				{#if !usageStore.isPro}
					<div class="mt-2 flex items-center gap-1 text-xs text-gray-500">
						<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
						</svg>
						Other countries require Pro
					</div>
				{/if}
			</div>

			<!-- Year -->
			<div>
				<label for="year" class="block text-sm font-medium text-gray-700 mb-2">
					Year
				</label>
				<select
					id="year"
					bind:value={selectedYear}
					class="block w-full px-4 py-3 text-base bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer transition-shadow hover:shadow-md"
				>
					{#each availableYears as year}
						<option value={year}>{year}</option>
					{/each}
				</select>
			</div>

			<!-- PTO Days -->
			<div>
				<label for="pto" class="block text-sm font-medium text-gray-700 mb-2">
					PTO Days Available
				</label>
				<input
					id="pto"
					type="number"
					bind:value={ptoDays}
					min="1"
					max="50"
					class="block w-full px-4 py-3 text-base bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow hover:shadow-md"
				/>
			</div>
		</div>
	</section>

	<!-- Results Section -->
	{#if isCalculating}
		<div class="text-center py-12">
			<div class="inline-flex items-center gap-3 text-gray-500">
				<svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
				Optimizing your vacation days...
			</div>
		</div>
	{:else if result}
		<!-- Summary Card -->
		<section class="mb-8">
			<div class="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-blue-500/25">
				<div class="grid sm:grid-cols-3 gap-6 sm:gap-8 mb-6">
					<div class="text-center sm:text-left">
						<div class="text-5xl sm:text-6xl font-bold mb-2">{result.totalDaysOff}</div>
						<div class="text-blue-100 text-sm uppercase tracking-wide">Total Days Off</div>
					</div>
					<div class="text-center border-y sm:border-y-0 sm:border-x border-white/20 py-4 sm:py-0">
						<div class="text-5xl sm:text-6xl font-bold mb-2">{result.ptoDaysUsed}</div>
						<div class="text-blue-100 text-sm uppercase tracking-wide">PTO Used</div>
					</div>
					<div class="text-center sm:text-right">
						<div class="text-5xl sm:text-6xl font-bold mb-2">{result.efficiency.toFixed(1)}x</div>
						<div class="text-blue-100 text-sm uppercase tracking-wide">Efficiency</div>
					</div>
				</div>
				<p class="text-blue-100 text-center sm:text-left">{result.summary}</p>
			</div>
		</section>

		<!-- Vacation Periods -->
		{#if result.periods.length > 0}
			<section class="mb-8">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-xl font-semibold text-gray-900">Recommended Vacation Periods</h2>
					<span class="text-sm text-gray-500">{result.periods.length} periods</span>
				</div>
				<div class="grid sm:grid-cols-2 gap-4">
					{#each result.periods as period, index}
						<ResultCard {period} {index} />
					{/each}
				</div>
			</section>
		{/if}

		<!-- Premium Feature: Export (Locked for free users) -->
		{#if !usageStore.isPro}
			<section class="mb-8">
				<button
					onclick={openUpgradeModal}
					class="w-full py-4 px-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all flex items-center justify-center gap-3 text-gray-500 font-medium group"
				>
					<svg class="w-5 h-5 text-gray-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
					</svg>
					<span class="group-hover:text-indigo-600">Export to Calendar</span>
					<span class="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">Pro</span>
				</button>
			</section>
		{/if}

		<!-- Calendar Toggle -->
		<section class="mb-8">
			<button
				onclick={() => showCalendar = !showCalendar}
				class="w-full py-4 px-6 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all flex items-center justify-center gap-3 text-gray-700 font-medium"
			>
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
				{showCalendar ? 'Hide' : 'Show'} Full Year Calendar
				<svg class="w-4 h-4 transition-transform {showCalendar ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
				</svg>
			</button>
		</section>

		<!-- Calendar View -->
		{#if showCalendar}
			<section class="animate-fade-in">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-xl font-semibold text-gray-900">{selectedYear} Calendar</h2>
					<div class="flex items-center gap-4 text-sm">
						<div class="flex items-center gap-2">
							<span class="w-4 h-4 rounded bg-blue-500"></span>
							<span class="text-gray-600">PTO</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="w-4 h-4 rounded bg-emerald-100 ring-1 ring-emerald-300"></span>
							<span class="text-gray-600">Holiday</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="w-4 h-4 rounded bg-gray-100"></span>
							<span class="text-gray-600">Weekend</span>
						</div>
					</div>
				</div>
				<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each Array(12) as _, month}
						<Calendar days={calendarData} {month} year={selectedYear} />
					{/each}
				</div>
			</section>
		{/if}
	{/if}

	<!-- Features Section -->
	<section class="mt-16 pt-16 border-t border-gray-100">
		<h2 class="text-2xl font-bold text-gray-900 text-center mb-12">Why Use PTO Optimizer?</h2>
		<div class="grid sm:grid-cols-3 gap-8">
			<div class="text-center">
				<div class="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
					<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
					</svg>
				</div>
				<h3 class="font-semibold text-gray-900 mb-2">Smart Algorithm</h3>
				<p class="text-gray-600 text-sm">Automatically finds the best days to take off, maximizing your time away from work.</p>
			</div>
			<div class="text-center">
				<div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
					<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<h3 class="font-semibold text-gray-900 mb-2">Multiple Countries</h3>
				<p class="text-gray-600 text-sm">Support for US, UK, Germany, Canada, Australia, and France holidays.</p>
			</div>
			<div class="text-center">
				<div class="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-4">
					<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
					</svg>
				</div>
				<h3 class="font-semibold text-gray-900 mb-2">Privacy First</h3>
				<p class="text-gray-600 text-sm">All calculations run in your browser. No data is sent to any server.</p>
			</div>
		</div>
	</section>

	<!-- Pro Features Section -->
	{#if !usageStore.isPro}
		<section class="mt-16 pt-16 border-t border-gray-100">
			<div class="text-center mb-8">
				<h2 class="text-2xl font-bold text-gray-900 mb-2">Unlock More with Pro</h2>
				<p class="text-gray-600">Get unlimited optimizations and premium features</p>
			</div>
			<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each [
					{ icon: '♾️', title: 'Unlimited Optimizations', desc: 'No monthly limits on calculations' },
					{ icon: '🌍', title: 'All 6 Countries', desc: 'US, UK, Germany, Canada, Australia, France' },
					{ icon: '📅', title: 'Calendar Export', desc: 'Export to Google Calendar, Outlook, Apple' },
					{ icon: '💾', title: 'Save Scenarios', desc: 'Save and compare different PTO plans' },
					{ icon: '📧', title: 'Email Reminders', desc: 'Get notified before your planned PTO' },
					{ icon: '📊', title: 'Advanced Analytics', desc: 'Detailed breakdown of your time off' },
				] as feature}
					<div class="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
						<span class="text-2xl">{feature.icon}</span>
						<div>
							<p class="font-medium text-gray-900">{feature.title}</p>
							<p class="text-sm text-gray-500">{feature.desc}</p>
						</div>
					</div>
				{/each}
			</div>
			<div class="mt-8 text-center">
				<button
					onclick={openUpgradeModal}
					class="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:from-indigo-700 hover:to-purple-700"
				>
					Upgrade to Pro - $4.99/month
					<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
					</svg>
				</button>
				<p class="mt-2 text-sm text-gray-500">or $39/year (save 35%)</p>
			</div>
		</section>
	{/if}
</div>
