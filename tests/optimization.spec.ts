import { test, expect } from '@playwright/test';

test.describe('PTO Optimization Flow', () => {
	test.beforeEach(async ({ page }) => {
		// Clear localStorage before each test
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
		await page.reload();
	});

	test('homepage loads with correct title', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveTitle(/PTO Optimizer/);
	});

	test('displays hero section with main headline', async ({ page }) => {
		await page.goto('/');
		
		const headline = page.getByRole('heading', { level: 1 });
		await expect(headline).toContainText('Maximize Your');
		await expect(headline).toContainText('Vacation Days');
	});

	test('shows usage indicator for free users', async ({ page }) => {
		await page.goto('/');
		
		// Should show free optimizations remaining - use specific text
		await expect(page.getByText('3 Free Optimizations Left', { exact: true })).toBeVisible();
	});

	test('displays country selector with US as default', async ({ page }) => {
		await page.goto('/');
		
		const countrySelect = page.locator('select').first();
		await expect(countrySelect).toHaveValue('US');
	});

	test('shows optimization results on page load', async ({ page }) => {
		await page.goto('/');
		
		// Wait for results to appear
		await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
		await expect(page.getByText('PTO Used')).toBeVisible();
		await expect(page.getByText('Efficiency')).toBeVisible();
	});

	test('displays recommended vacation periods', async ({ page }) => {
		await page.goto('/');
		
		// Wait for optimization to complete
		await expect(page.getByText('Recommended Vacation Periods')).toBeVisible({ timeout: 10000 });
		
		// Should show at least one vacation period - use first() to get one element
		await expect(page.getByText(/days off/).first()).toBeVisible();
	});

	test('can change PTO days and see updated results', async ({ page }) => {
		await page.goto('/');
		
		// Wait for initial load
		await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
		
		// Change PTO days
		const ptoInput = page.getByLabel('PTO Days Available');
		await ptoInput.fill('20');
		
		// Wait for recalculation - results should update
		await page.waitForTimeout(500);
		
		// Verify results are still visible
		await expect(page.getByText('Total Days Off')).toBeVisible();
	});

	test('can change year and see results', async ({ page }) => {
		await page.goto('/');
		
		// Wait for initial load
		await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
		
		// Change year
		const yearSelect = page.getByLabel('Year');
		await yearSelect.selectOption('2027');
		
		// Wait for recalculation
		await page.waitForTimeout(500);
		
		// Results should still be visible
		await expect(page.getByText('Total Days Off')).toBeVisible();
	});

	test('can toggle full year calendar view', async ({ page }) => {
		await page.goto('/');
		
		// Wait for results
		await expect(page.getByText('Recommended Vacation Periods')).toBeVisible({ timeout: 10000 });
		
		// Click show calendar button
		const calendarButton = page.getByRole('button', { name: /Show Full Year Calendar/i });
		await calendarButton.click();
		
		// Calendar should be visible with month headers
		await expect(page.getByText('January')).toBeVisible();
		await expect(page.getByText('December')).toBeVisible();
		
		// Click to hide
		await page.getByRole('button', { name: /Hide Full Year Calendar/i }).click();
		
		// Calendar months should be hidden
		await expect(page.getByText('January')).not.toBeVisible();
	});

	test('shows "Pro" badge on export button for free users', async ({ page }) => {
		await page.goto('/');
		
		// Wait for results
		await expect(page.getByText('Recommended Vacation Periods')).toBeVisible({ timeout: 10000 });
		
		// Export button should show Pro badge
		const exportButton = page.getByRole('button', { name: /Export to Calendar/i });
		await expect(exportButton).toBeVisible();
		await expect(page.getByText('Pro').first()).toBeVisible();
	});

	test('shows features section', async ({ page }) => {
		await page.goto('/');
		
		await expect(page.getByText('Why Use PTO Optimizer?')).toBeVisible();
		await expect(page.getByText('Smart Algorithm')).toBeVisible();
		await expect(page.getByText('Multiple Countries')).toBeVisible();
		await expect(page.getByText('Privacy First')).toBeVisible();
	});
});
