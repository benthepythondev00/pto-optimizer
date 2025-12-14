import { describe, it, expect } from 'vitest';
import { optimizePTO, getCalendarData } from './optimizer';
import { getHolidaysForCountry } from './holidays';

describe('PTO Optimizer', () => {
	describe('optimizePTO', () => {
		it('returns valid optimization result structure', () => {
			const holidays = getHolidaysForCountry('US', 2025);
			const result = optimizePTO(2025, holidays, 15);

			expect(result).toHaveProperty('periods');
			expect(result).toHaveProperty('totalDaysOff');
			expect(result).toHaveProperty('ptoDaysUsed');
			expect(result).toHaveProperty('efficiency');
			expect(result).toHaveProperty('summary');
		});

		it('does not use more PTO days than available', () => {
			const holidays = getHolidaysForCountry('US', 2025);
			const result = optimizePTO(2025, holidays, 10);

			expect(result.ptoDaysUsed).toBeLessThanOrEqual(10);
		});

		it('calculates efficiency correctly', () => {
			const holidays = getHolidaysForCountry('US', 2025);
			const result = optimizePTO(2025, holidays, 15);

			// Efficiency = totalDaysOff / ptoDaysUsed
			if (result.ptoDaysUsed > 0) {
				const expectedEfficiency = result.totalDaysOff / result.ptoDaysUsed;
				expect(result.efficiency).toBeCloseTo(expectedEfficiency, 1);
			}
		});

		it('returns periods with valid date strings', () => {
			const holidays = getHolidaysForCountry('US', 2025);
			const result = optimizePTO(2025, holidays, 15);

			for (const period of result.periods) {
				// Dates are strings in YYYY-MM-DD format
				expect(typeof period.startDate).toBe('string');
				expect(typeof period.endDate).toBe('string');
				expect(period.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
				expect(period.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
				expect(period.startDate <= period.endDate).toBe(true);
			}
		});

		it('returns efficiency greater than 1 (more days off than PTO used)', () => {
			const holidays = getHolidaysForCountry('US', 2025);
			const result = optimizePTO(2025, holidays, 15);

			// The whole point of the optimizer is to get more days off than PTO used
			expect(result.efficiency).toBeGreaterThan(1);
		});

		it('handles zero PTO days', () => {
			const holidays = getHolidaysForCountry('US', 2025);
			const result = optimizePTO(2025, holidays, 0);

			expect(result.ptoDaysUsed).toBe(0);
			expect(result.periods).toHaveLength(0);
		});

		it('handles very few PTO days', () => {
			const holidays = getHolidaysForCountry('US', 2025);
			const result = optimizePTO(2025, holidays, 1);

			expect(result.ptoDaysUsed).toBeLessThanOrEqual(1);
		});

		it('works with different countries', () => {
			const countries = ['US', 'DE', 'UK', 'CA', 'AU', 'FR'] as const;
			
			for (const country of countries) {
				const holidays = getHolidaysForCountry(country, 2025);
				const result = optimizePTO(2025, holidays, 15);

				expect(result.periods).toBeDefined();
				expect(result.totalDaysOff).toBeGreaterThan(0);
			}
		});

		it('works with different years', () => {
			const years = [2025, 2026, 2027];
			
			for (const year of years) {
				const holidays = getHolidaysForCountry('US', year);
				const result = optimizePTO(year, holidays, 15);

				expect(result.periods).toBeDefined();
				expect(result.totalDaysOff).toBeGreaterThan(0);
			}
		});
	});

	describe('getCalendarData', () => {
		it('returns 365 or 366 days for a year', () => {
			const holidays = getHolidaysForCountry('US', 2025);
			const result = optimizePTO(2025, holidays, 15);
			const calendarData = getCalendarData(2025, holidays, result);

			// 2025 is not a leap year, so 365 days
			expect(calendarData.length).toBe(365);
		});

		it('returns 366 days for leap year', () => {
			const holidays = getHolidaysForCountry('US', 2024);
			const result = optimizePTO(2024, holidays, 15);
			const calendarData = getCalendarData(2024, holidays, result);

			// 2024 is a leap year, so 366 days
			expect(calendarData.length).toBe(366);
		});

		it('marks holidays correctly', () => {
			const holidays = getHolidaysForCountry('US', 2025);
			const result = optimizePTO(2025, holidays, 15);
			const calendarData = getCalendarData(2025, holidays, result);

			const holidayDays = calendarData.filter(day => day.isHoliday);
			expect(holidayDays.length).toBeGreaterThan(0);
		});

		it('marks weekends correctly', () => {
			const holidays = getHolidaysForCountry('US', 2025);
			const result = optimizePTO(2025, holidays, 15);
			const calendarData = getCalendarData(2025, holidays, result);

			const weekendDays = calendarData.filter(day => day.isWeekend);
			// Roughly 52 weeks * 2 days = 104 weekend days
			expect(weekendDays.length).toBeGreaterThan(100);
			expect(weekendDays.length).toBeLessThan(110);
		});

		it('returns valid day info structure', () => {
			const holidays = getHolidaysForCountry('US', 2025);
			const result = optimizePTO(2025, holidays, 15);
			const calendarData = getCalendarData(2025, holidays, result);

			const firstDay = calendarData[0];
			expect(firstDay).toHaveProperty('date');
			expect(firstDay).toHaveProperty('isWeekend');
			expect(firstDay).toHaveProperty('isHoliday');
			expect(firstDay).toHaveProperty('isPto'); // lowercase 'to'
			expect(firstDay).toHaveProperty('isBridge');
		});
	});
});
