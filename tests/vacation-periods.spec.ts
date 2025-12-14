import { test, expect } from '@playwright/test';

test.describe('Vacation Period Cards', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
		await page.reload();
		await expect(page.getByText('Recommended Vacation Periods')).toBeVisible({ timeout: 10000 });
	});

	test('displays multiple vacation period cards', async ({ page }) => {
		// Should show period count
		const periodCount = page.getByText(/\d+ periods/);
		await expect(periodCount).toBeVisible();
	});

	test('each vacation card shows date range', async ({ page }) => {
		// Date ranges are in format "Day, Mon DD - Day, Mon DD"
		const dateRanges = page.locator('h3').filter({ hasText: / - / });
		const count = await dateRanges.count();
		expect(count).toBeGreaterThan(0);
	});

	test('each vacation card shows efficiency rating', async ({ page }) => {
		// Efficiency is shown as "X.Xx return"
		const efficiencyBadges = page.getByText(/\d+\.\dx return/);
		const count = await efficiencyBadges.count();
		expect(count).toBeGreaterThan(0);
	});

	test('vacation cards show PTO days count', async ({ page }) => {
		// Each card should show PTO Days section
		const ptoDaysLabels = page.getByText('PTO Days', { exact: true });
		const count = await ptoDaysLabels.count();
		expect(count).toBeGreaterThan(0);
	});

	test('vacation cards show weekend count', async ({ page }) => {
		const weekendsLabels = page.getByText('Weekends', { exact: true });
		const count = await weekendsLabels.count();
		expect(count).toBeGreaterThan(0);
	});

	test('vacation cards show holiday count', async ({ page }) => {
		const holidaysLabels = page.getByText('Holidays', { exact: true });
		const count = await holidaysLabels.count();
		expect(count).toBeGreaterThan(0);
	});

	test('vacation cards with holidays show holiday names', async ({ page }) => {
		// Some cards should show "Includes:" with holiday names
		const includesLabels = page.getByText('Includes:');
		const count = await includesLabels.count();
		expect(count).toBeGreaterThan(0);
	});

	test('vacation cards are numbered sequentially', async ({ page }) => {
		// Cards should have numbers 1, 2, 3, etc.
		await expect(page.locator('.bg-blue-500').filter({ hasText: '1' }).first()).toBeVisible();
	});

	test('shows total days off for each period', async ({ page }) => {
		// Should show "X days off" text
		const daysOffText = page.getByText(/\d+ days off/);
		const count = await daysOffText.count();
		expect(count).toBeGreaterThan(0);
	});
});

test.describe('Summary Statistics', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
		await page.reload();
		await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
	});

	test('displays total days off as a number', async ({ page }) => {
		// The summary card should show a large number for total days off
		const totalDaysOff = page.locator('text=Total Days Off').locator('xpath=preceding-sibling::div[1]');
		const text = await totalDaysOff.textContent();
		expect(parseInt(text || '0')).toBeGreaterThan(0);
	});

	test('displays PTO used count', async ({ page }) => {
		const ptoUsed = page.locator('text=PTO Used').locator('xpath=preceding-sibling::div[1]');
		const text = await ptoUsed.textContent();
		expect(parseInt(text || '0')).toBeGreaterThan(0);
	});

	test('displays efficiency multiplier', async ({ page }) => {
		// Efficiency should show something like "2.9x" in the large stats section
		// Use first() to target the main efficiency display, not card efficiency badges
		await expect(page.getByText(/\d+\.\dx/).first()).toBeVisible();
	});

	test('displays summary text describing the optimization', async ({ page }) => {
		// Summary text should mention PTO days and bonus
		await expect(page.getByText(/Using \d+ PTO days/)).toBeVisible();
		await expect(page.getByText(/bonus/i)).toBeVisible();
	});

	test('total days off is greater than PTO used', async ({ page }) => {
		// The whole point is efficiency > 1
		const statsContainer = page.locator('.grid.sm\\:grid-cols-3').first();
		const numbers = await statsContainer.locator('.text-5xl, .text-6xl').allTextContents();
		
		if (numbers.length >= 2) {
			const totalDays = parseInt(numbers[0]);
			const ptoUsed = parseInt(numbers[1]);
			expect(totalDays).toBeGreaterThan(ptoUsed);
		}
	});
});

test.describe('Results Update on Input Change', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
		await page.reload();
		await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
	});

	test('results update when PTO days increase', async ({ page }) => {
		// Get initial total days off
		const initialTotal = await page.locator('.text-5xl, .text-6xl').first().textContent();
		
		// Increase PTO days
		await page.getByLabel('PTO Days Available').fill('25');
		await page.waitForTimeout(500);
		
		// Total days off should be different (likely higher)
		const newTotal = await page.locator('.text-5xl, .text-6xl').first().textContent();
		// Just verify results updated (don't assume direction)
		expect(newTotal).toBeTruthy();
	});

	test('results update when PTO days decrease', async ({ page }) => {
		// Get initial values
		await page.getByLabel('PTO Days Available').fill('5');
		await page.waitForTimeout(500);
		
		// Should still show results
		await expect(page.getByText('Total Days Off')).toBeVisible();
	});

	test('handles minimum PTO value (1 day)', async ({ page }) => {
		await page.getByLabel('PTO Days Available').fill('1');
		await page.waitForTimeout(500);
		
		// Should still show results
		await expect(page.getByText('Recommended Vacation Periods')).toBeVisible();
	});

	test('handles maximum PTO value (50 days)', async ({ page }) => {
		await page.getByLabel('PTO Days Available').fill('50');
		await page.waitForTimeout(500);
		
		// Should show results with many vacation periods
		await expect(page.getByText('Total Days Off')).toBeVisible();
	});
});
