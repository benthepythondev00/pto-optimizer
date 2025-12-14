<script lang="ts">
	import type { DayInfo } from '$lib/utils/optimizer';

	interface Props {
		days: DayInfo[];
		month: number;
		year: number;
	}

	const { days, month, year }: Props = $props();

	const monthNames = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	];

	const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	// Filter days for this month
	const monthDays = $derived(
		days.filter(d => {
			const date = new Date(d.date);
			return date.getMonth() === month && date.getFullYear() === year;
		})
	);

	// Get the first day of the month to calculate offset
	const firstDayOfMonth = $derived(new Date(year, month, 1).getDay());
	
	// Create empty slots for days before the 1st
	const emptySlots = $derived(Array(firstDayOfMonth).fill(null));

	function getDayClasses(day: DayInfo): string {
		const classes = ['calendar-day', 'cursor-default'];
		
		if (day.isPto) {
			classes.push('bg-blue-500', 'text-white', 'font-semibold', 'shadow-md');
		} else if (day.isHoliday) {
			classes.push('bg-emerald-100', 'text-emerald-800', 'font-semibold', 'ring-1', 'ring-emerald-300');
		} else if (day.isWeekend) {
			classes.push('bg-gray-100', 'text-gray-400');
		} else {
			classes.push('bg-white', 'text-gray-700', 'hover:bg-gray-50');
		}
		
		return classes.join(' ');
	}

	function getDayNumber(dateStr: string): number {
		return new Date(dateStr).getDate();
	}
</script>

<div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
	<!-- Month Header -->
	<div class="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
		<h3 class="text-lg font-semibold text-gray-900">{monthNames[month]}</h3>
	</div>
	
	<!-- Day Headers -->
	<div class="grid grid-cols-7 gap-px bg-gray-100">
		{#each dayNames as dayName}
			<div class="bg-gray-50 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
				{dayName}
			</div>
		{/each}
	</div>
	
	<!-- Calendar Grid -->
	<div class="grid grid-cols-7 gap-px bg-gray-100 p-px">
		<!-- Empty slots before first day -->
		{#each emptySlots as _}
			<div class="bg-white h-10"></div>
		{/each}
		
		<!-- Actual days -->
		{#each monthDays as day}
			<div class="bg-white p-1 flex items-center justify-center" title={day.holidayName || ''}>
				<span class={getDayClasses(day)}>
					{getDayNumber(day.date)}
				</span>
			</div>
		{/each}
	</div>
</div>
