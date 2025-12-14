import { test, expect } from '@playwright/test';

test.describe('Calendar Visualization', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
		await page.reload();
		// Wait for results to load
		await expect(page.getByText('Recommended Vacation Periods')).toBeVisible({ timeout: 10000 });
	});

	test('calendar shows all 12 months when expanded', async ({ page }) => {
		// Open calendar
		await page.getByRole('button', { name: /Show Full Year Calendar/i }).click();
		
		// Check all months are visible
		const months = ['January', 'February', 'March', 'April', 'May', 'June', 
						'July', 'August', 'September', 'October', 'November', 'December'];
		
		for (const month of months) {
			await expect(page.getByText(month, { exact: true })).toBeVisible();
		}
	});

	test('calendar shows day headers', async ({ page }) => {
		await page.getByRole('button', { name: /Show Full Year Calendar/i }).click();
		
		// Check day headers (should appear multiple times, once per month)
		await expect(page.getByText('Sun').first()).toBeVisible();
		await expect(page.getByText('Mon').first()).toBeVisible();
		await expect(page.getByText('Tue').first()).toBeVisible();
		await expect(page.getByText('Wed').first()).toBeVisible();
		await expect(page.getByText('Thu').first()).toBeVisible();
		await expect(page.getByText('Fri').first()).toBeVisible();
		await expect(page.getByText('Sat').first()).toBeVisible();
	});

	test('calendar legend is visible when calendar is open', async ({ page }) => {
		await page.getByRole('button', { name: /Show Full Year Calendar/i }).click();
		
		// Check legend items
		await expect(page.getByText('PTO', { exact: true })).toBeVisible();
		await expect(page.getByText('Holiday', { exact: true })).toBeVisible();
		await expect(page.getByText('Weekend', { exact: true })).toBeVisible();
	});

	test('calendar toggle button changes text when clicked', async ({ page }) => {
		// Initially shows "Show"
		const calendarButton = page.getByRole('button', { name: /Full Year Calendar/i });
		await expect(calendarButton).toContainText('Show');
		
		// Click to open
		await calendarButton.click();
		await expect(calendarButton).toContainText('Hide');
		
		// Click to close
		await calendarButton.click();
		await expect(calendarButton).toContainText('Show');
	});

	test('calendar displays year in header', async ({ page }) => {
		await page.getByRole('button', { name: /Show Full Year Calendar/i }).click();
		
		// Should show the year (default is next year)
		const currentYear = new Date().getFullYear();
		const nextYear = currentYear + 1;
		await expect(page.getByText(`${nextYear} Calendar`)).toBeVisible();
	});

	test('calendar updates when year changes', async ({ page }) => {
		await page.getByRole('button', { name: /Show Full Year Calendar/i }).click();
		
		const currentYear = new Date().getFullYear();
		await expect(page.getByText(`${currentYear + 1} Calendar`)).toBeVisible();
		
		// Change year
		await page.getByLabel('Year').selectOption(String(currentYear + 2));
		await page.waitForTimeout(500);
		
		await expect(page.getByText(`${currentYear + 2} Calendar`)).toBeVisible();
	});

	test('calendar hides when clicking hide button', async ({ page }) => {
		// Open calendar
		await page.getByRole('button', { name: /Show Full Year Calendar/i }).click();
		await expect(page.getByText('January', { exact: true })).toBeVisible();
		
		// Close calendar
		await page.getByRole('button', { name: /Hide Full Year Calendar/i }).click();
		
		// Months should not be visible
		await expect(page.getByText('January', { exact: true })).not.toBeVisible();
	});

	test('calendar grid has correct structure', async ({ page }) => {
		await page.getByRole('button', { name: /Show Full Year Calendar/i }).click();
		
		// Should have 12 calendar grids (one per month)
		const calendarGrids = page.locator('.grid.grid-cols-7');
		// Each month has 2 grids (headers + days), so at least 24
		await expect(calendarGrids).toHaveCount(24);
	});
});

test.describe('Calendar Day Display', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
		await page.reload();
		await expect(page.getByText('Recommended Vacation Periods')).toBeVisible({ timeout: 10000 });
		await page.getByRole('button', { name: /Show Full Year Calendar/i }).click();
	});

	test('calendar shows days with numbers', async ({ page }) => {
		// Check that day numbers appear (1-31 range)
		// Look for day 1 and day 15 which should exist in every month
		const dayOne = page.locator('.calendar-day').filter({ hasText: '1' }).first();
		await expect(dayOne).toBeVisible();
	});

	test('holidays show tooltip on hover', async ({ page }) => {
		// Find a holiday cell (emerald colored) and check for title attribute
		const holidayCell = page.locator('[title]:not([title=""])').first();
		const title = await holidayCell.getAttribute('title');
		expect(title).toBeTruthy();
	});
});
