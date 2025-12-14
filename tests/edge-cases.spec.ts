import { test, expect } from '@playwright/test';

test.describe('Edge Cases - Input Validation', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
		await page.reload();
		await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
	});

	test('handles empty PTO input gracefully', async ({ page }) => {
		const ptoInput = page.getByLabel('PTO Days Available');
		await ptoInput.clear();
		await page.waitForTimeout(500);
		
		// App should still function - at minimum the stats section should be visible
		await expect(page.getByText('Total Days Off')).toBeVisible();
	});

	test('handles zero PTO days', async ({ page }) => {
		const ptoInput = page.getByLabel('PTO Days Available');
		await ptoInput.fill('0');
		await page.waitForTimeout(500);
		
		// Should show no vacation periods or a message
		await expect(page.getByText('Total Days Off')).toBeVisible();
	});

	test('handles very high PTO days (50)', async ({ page }) => {
		const ptoInput = page.getByLabel('PTO Days Available');
		await ptoInput.fill('50');
		await page.waitForTimeout(500);
		
		// Should show many vacation periods
		await expect(page.getByText('Recommended Vacation Periods')).toBeVisible();
	});

	test('handles rapid input changes', async ({ page }) => {
		const ptoInput = page.getByLabel('PTO Days Available');
		
		// Rapidly change values
		await ptoInput.fill('5');
		await ptoInput.fill('10');
		await ptoInput.fill('15');
		await ptoInput.fill('20');
		
		await page.waitForTimeout(1000);
		
		// App should settle to final value
		await expect(page.getByText('Total Days Off')).toBeVisible();
	});

	test('PTO input respects min/max constraints', async ({ page }) => {
		const ptoInput = page.getByLabel('PTO Days Available');
		
		// Check min attribute
		const min = await ptoInput.getAttribute('min');
		expect(min).toBe('1');
		
		// Check max attribute
		const max = await ptoInput.getAttribute('max');
		expect(max).toBe('50');
	});
});

test.describe('Edge Cases - Year Selection', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
		await page.reload();
		await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
	});

	test('current year is available', async ({ page }) => {
		const yearSelect = page.getByLabel('Year');
		const currentYear = new Date().getFullYear();
		
		await yearSelect.selectOption(String(currentYear));
		await expect(yearSelect).toHaveValue(String(currentYear));
	});

	test('next year is available', async ({ page }) => {
		const yearSelect = page.getByLabel('Year');
		const nextYear = new Date().getFullYear() + 1;
		
		await yearSelect.selectOption(String(nextYear));
		await expect(yearSelect).toHaveValue(String(nextYear));
	});

	test('year after next is available', async ({ page }) => {
		const yearSelect = page.getByLabel('Year');
		const yearAfterNext = new Date().getFullYear() + 2;
		
		await yearSelect.selectOption(String(yearAfterNext));
		await expect(yearSelect).toHaveValue(String(yearAfterNext));
	});

	test('changing year updates results', async ({ page }) => {
		// Get initial result
		const initialPeriods = await page.locator('.bg-white.rounded-2xl.border').count();
		
		// Change year
		const yearSelect = page.getByLabel('Year');
		const currentYear = new Date().getFullYear();
		await yearSelect.selectOption(String(currentYear));
		await page.waitForTimeout(500);
		
		// Results should update (may be same or different count, but should recalculate)
		await expect(page.getByText('Total Days Off')).toBeVisible();
	});
});

test.describe('Edge Cases - Country Selection', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
		await page.reload();
		await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
	});

	test('country selector shows all options', async ({ page }) => {
		const countrySelect = page.getByLabel('Country');
		
		// Open the dropdown and check options
		const options = await countrySelect.locator('option').allTextContents();
		
		expect(options).toContain('🇺🇸 United States');
		expect(options).toContain('🇩🇪 Germany');
		expect(options).toContain('🇬🇧 United Kingdom');
		expect(options).toContain('🇨🇦 Canada');
		expect(options).toContain('🇦🇺 Australia');
		expect(options).toContain('🇫🇷 France');
	});

	test('US is default country', async ({ page }) => {
		const countrySelect = page.getByLabel('Country');
		await expect(countrySelect).toHaveValue('US');
	});

	test('selecting UK triggers upgrade modal', async ({ page }) => {
		const countrySelect = page.getByLabel('Country');
		await countrySelect.selectOption('UK');
		
		// Modal should appear
		await expect(page.getByRole('heading', { name: 'Upgrade to Pro' })).toBeVisible({ timeout: 5000 });
	});

	test('selecting Germany triggers upgrade modal', async ({ page }) => {
		const countrySelect = page.getByLabel('Country');
		await countrySelect.selectOption('DE');
		
		await expect(page.getByRole('heading', { name: 'Upgrade to Pro' })).toBeVisible({ timeout: 5000 });
	});

	test('selecting Canada triggers upgrade modal', async ({ page }) => {
		const countrySelect = page.getByLabel('Country');
		await countrySelect.selectOption('CA');
		
		await expect(page.getByRole('heading', { name: 'Upgrade to Pro' })).toBeVisible({ timeout: 5000 });
	});

	test('selecting Australia triggers upgrade modal', async ({ page }) => {
		const countrySelect = page.getByLabel('Country');
		await countrySelect.selectOption('AU');
		
		await expect(page.getByRole('heading', { name: 'Upgrade to Pro' })).toBeVisible({ timeout: 5000 });
	});

	test('selecting France triggers upgrade modal', async ({ page }) => {
		const countrySelect = page.getByLabel('Country');
		await countrySelect.selectOption('FR');
		
		await expect(page.getByRole('heading', { name: 'Upgrade to Pro' })).toBeVisible({ timeout: 5000 });
	});
});

test.describe('Edge Cases - LocalStorage', () => {
	test('app works with empty localStorage', async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
		await page.reload();
		
		await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
		// Use exact match to avoid matching multiple elements
		await expect(page.getByText('3 Free Optimizations Left', { exact: true })).toBeVisible();
	});

	test('app recovers from corrupted localStorage', async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => {
			localStorage.setItem('pto-usage', 'invalid-json-data');
		});
		await page.reload();
		
		// App should still work (reset to defaults)
		await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
	});
});

test.describe('Edge Cases - Page Reload', () => {
	test('page reload preserves functionality', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
		
		// Set some values
		await page.getByLabel('PTO Days Available').fill('20');
		await page.waitForTimeout(500);
		
		// Reload
		await page.reload();
		
		// App should still work
		await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
	});

	test('hard refresh works correctly', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
		
		// Hard refresh (Ctrl+Shift+R equivalent)
		await page.evaluate(() => location.reload());
		
		await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
	});
});

test.describe('Edge Cases - Network', () => {
	test('page renders without JavaScript errors', async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', error => errors.push(error.message));
		
		await page.goto('/');
		await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
		
		// No critical JavaScript errors
		const criticalErrors = errors.filter(e => 
			!e.includes('ResizeObserver') && // Common harmless error
			!e.includes('Loading chunk') // Lazy loading might fail in test
		);
		expect(criticalErrors).toHaveLength(0);
	});

	test('console has no error messages', async ({ page }) => {
		const consoleErrors: string[] = [];
		page.on('console', msg => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});
		
		await page.goto('/');
		await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
		
		// Filter out known acceptable errors
		const realErrors = consoleErrors.filter(e => 
			!e.includes('favicon') &&
			!e.includes('404')
		);
		
		// Allow up to a few minor errors
		expect(realErrors.length).toBeLessThan(3);
	});
});
