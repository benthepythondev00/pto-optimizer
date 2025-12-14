<script lang="ts">
	import type { VacationPeriod } from '$lib/utils/optimizer';

	interface Props {
		period: VacationPeriod;
		index: number;
	}

	const { period, index }: Props = $props();

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		});
	}

	function formatDateRange(start: string, end: string): string {
		return `${formatDate(start)} - ${formatDate(end)}`;
	}

	const efficiencyColor = $derived(
		period.efficiency >= 3 ? 'text-emerald-600' :
		period.efficiency >= 2 ? 'text-blue-600' :
		'text-gray-600'
	);

	const efficiencyBg = $derived(
		period.efficiency >= 3 ? 'bg-emerald-50' :
		period.efficiency >= 2 ? 'bg-blue-50' :
		'bg-gray-50'
	);
</script>

<div class="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
	<!-- Header -->
	<div class="px-5 py-4 border-b border-gray-50">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
					{index + 1}
				</div>
				<div>
					<h3 class="font-semibold text-gray-900">{formatDateRange(period.startDate, period.endDate)}</h3>
					<p class="text-sm text-gray-500">{period.totalDays} days off</p>
				</div>
			</div>
			<div class="{efficiencyBg} px-3 py-1.5 rounded-full">
				<span class="{efficiencyColor} text-sm font-semibold">
					{period.efficiency.toFixed(1)}x return
				</span>
			</div>
		</div>
	</div>

	<!-- Stats -->
	<div class="px-5 py-4 grid grid-cols-3 gap-4">
		<div class="text-center">
			<div class="text-2xl font-bold text-blue-600">{period.ptoDays}</div>
			<div class="text-xs text-gray-500 uppercase tracking-wide mt-1">PTO Days</div>
		</div>
		<div class="text-center border-x border-gray-100">
			<div class="text-2xl font-bold text-gray-400">{period.weekendDays}</div>
			<div class="text-xs text-gray-500 uppercase tracking-wide mt-1">Weekends</div>
		</div>
		<div class="text-center">
			<div class="text-2xl font-bold text-emerald-600">{period.holidayDays}</div>
			<div class="text-xs text-gray-500 uppercase tracking-wide mt-1">Holidays</div>
		</div>
	</div>

	<!-- Holidays -->
	{#if period.holidays.length > 0}
		<div class="px-5 py-3 bg-gray-50/50 border-t border-gray-100">
			<div class="flex items-center gap-2 flex-wrap">
				<span class="text-xs text-gray-500">Includes:</span>
				{#each period.holidays as holiday}
					<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
						{holiday}
					</span>
				{/each}
			</div>
		</div>
	{/if}
</div>
