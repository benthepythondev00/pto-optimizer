<script lang="ts">
	import { COUNTRIES, type CountryCode } from '$lib/utils/holidays';

	interface Props {
		value: CountryCode;
		onchange: (value: CountryCode) => void;
	}

	const { value, onchange }: Props = $props();

	// Country flag emojis
	const flags: Record<string, string> = {
		US: '🇺🇸',
		DE: '🇩🇪',
		UK: '🇬🇧',
		CA: '🇨🇦',
		AU: '🇦🇺',
		FR: '🇫🇷',
	};
</script>

<div class="relative">
	<label for="country" class="block text-sm font-medium text-gray-700 mb-2">
		Country
	</label>
	<div class="relative">
		<select
			id="country"
			{value}
			onchange={(e) => onchange(e.currentTarget.value as CountryCode)}
			class="block w-full pl-4 pr-10 py-3 text-base bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer transition-shadow hover:shadow-md"
		>
			{#each COUNTRIES as country}
				<option value={country.code}>
					{flags[country.code]} {country.name}
				</option>
			{/each}
		</select>
		<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
			<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
				<path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
			</svg>
		</div>
	</div>
</div>
