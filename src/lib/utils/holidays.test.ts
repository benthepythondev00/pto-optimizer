import { describe, it, expect } from 'vitest';
import { getHolidaysForCountry, COUNTRIES, type CountryCode } from './holidays';

describe('Holidays Utility', () => {
	describe('COUNTRIES constant', () => {
		it('has all supported countries', () => {
			const countryCodes = COUNTRIES.map(c => c.code);
			
			expect(countryCodes).toContain('US');
			expect(countryCodes).toContain('DE');
			expect(countryCodes).toContain('UK');
			expect(countryCodes).toContain('CA');
			expect(countryCodes).toContain('AU');
			expect(countryCodes).toContain('FR');
		});

		it('each country has code and name', () => {
			for (const country of COUNTRIES) {
				expect(country.code).toBeDefined();
				expect(country.name).toBeDefined();
				expect(country.getHolidays).toBeTypeOf('function');
			}
		});
	});

	describe('getHolidaysForCountry', () => {
		it('returns holidays for US', () => {
			const holidays = getHolidaysForCountry('US', 2025);
			
			expect(holidays.length).toBeGreaterThan(0);
			
			// Check for some known US holidays
			const holidayNames = holidays.map(h => h.name);
			expect(holidayNames).toContain("New Year's Day");
			expect(holidayNames).toContain('Independence Day');
			expect(holidayNames).toContain('Thanksgiving');
			expect(holidayNames).toContain('Christmas Day');
		});

		it('returns holidays for Germany', () => {
			const holidays = getHolidaysForCountry('DE', 2025);
			
			expect(holidays.length).toBeGreaterThan(0);
			
			// German holidays are in German
			const holidayNames = holidays.map(h => h.name);
			expect(holidayNames).toContain('Neujahrstag'); // New Year's Day
			expect(holidayNames).toContain('Tag der Deutschen Einheit'); // German Unity Day
			expect(holidayNames).toContain('1. Weihnachtstag'); // Christmas Day
		});

		it('returns holidays for UK', () => {
			const holidays = getHolidaysForCountry('UK', 2025);
			
			expect(holidays.length).toBeGreaterThan(0);
			
			const holidayNames = holidays.map(h => h.name);
			expect(holidayNames).toContain("New Year's Day");
			expect(holidayNames).toContain('Christmas Day');
		});

		it('returns holidays for Canada', () => {
			const holidays = getHolidaysForCountry('CA', 2025);
			
			expect(holidays.length).toBeGreaterThan(0);
			
			const holidayNames = holidays.map(h => h.name);
			expect(holidayNames).toContain("New Year's Day");
			expect(holidayNames).toContain('Canada Day');
			expect(holidayNames).toContain('Christmas Day');
		});

		it('returns holidays for Australia', () => {
			const holidays = getHolidaysForCountry('AU', 2025);
			
			expect(holidays.length).toBeGreaterThan(0);
			
			const holidayNames = holidays.map(h => h.name);
			expect(holidayNames).toContain("New Year's Day");
			expect(holidayNames).toContain('Australia Day');
			expect(holidayNames).toContain('Christmas Day');
		});

		it('returns holidays for France', () => {
			const holidays = getHolidaysForCountry('FR', 2025);
			
			expect(holidays.length).toBeGreaterThan(0);
			
			// French holidays are in French
			const holidayNames = holidays.map(h => h.name);
			expect(holidayNames).toContain("Jour de l'an"); // New Year's Day
			expect(holidayNames).toContain('Fête Nationale'); // Bastille Day
			expect(holidayNames).toContain('Noël'); // Christmas Day
		});

		it('returns holidays with valid date strings', () => {
			const holidays = getHolidaysForCountry('US', 2025);
			
			for (const holiday of holidays) {
				// Date should be a string in YYYY-MM-DD format
				expect(typeof holiday.date).toBe('string');
				expect(holiday.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
				expect(holiday.date.startsWith('2025')).toBe(true);
			}
		});

		it('returns holidays with names', () => {
			const holidays = getHolidaysForCountry('US', 2025);
			
			for (const holiday of holidays) {
				expect(holiday.name).toBeDefined();
				expect(holiday.name.length).toBeGreaterThan(0);
			}
		});

		it('returns different holidays for different years', () => {
			const holidays2025 = getHolidaysForCountry('US', 2025);
			const holidays2026 = getHolidaysForCountry('US', 2026);
			
			// Same number of holidays but different dates
			expect(holidays2025.length).toBe(holidays2026.length);
			
			// Check that dates are actually different (years are different)
			expect(holidays2025[0].date.startsWith('2025')).toBe(true);
			expect(holidays2026[0].date.startsWith('2026')).toBe(true);
		});

		it('calculates moving holidays correctly (e.g., Thanksgiving)', () => {
			// Thanksgiving is 4th Thursday of November
			const holidays = getHolidaysForCountry('US', 2025);
			const thanksgiving = holidays.find(h => h.name === 'Thanksgiving');
			
			expect(thanksgiving).toBeDefined();
			if (thanksgiving) {
				// Parse date correctly with UTC to avoid timezone issues
				const [year, month, day] = thanksgiving.date.split('-').map(Number);
				const date = new Date(Date.UTC(year, month - 1, day));
				expect(date.getUTCMonth()).toBe(10); // November (0-indexed)
				expect(date.getUTCDay()).toBe(4); // Thursday
			}
		});
	});
});
