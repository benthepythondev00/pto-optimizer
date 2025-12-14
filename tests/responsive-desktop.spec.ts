import { test, expect } from '@playwright/test';

// Configure desktop viewport at top level
test.use({ viewport: { width: 1920, height: 1080 } });

test('homepage uses full width on desktop', async ({ page }) => {
	await page.goto('/');
	
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
});

test('three-column layout for inputs on desktop', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
	
	// All three inputs should be visible in a row
	const countrySelect = page.getByLabel('Country');
	const yearSelect = page.getByLabel('Year');
	const ptoInput = page.getByLabel('PTO Days Available');
	
	await expect(countrySelect).toBeVisible();
	await expect(yearSelect).toBeVisible();
	await expect(ptoInput).toBeVisible();
});

test('calendar shows 3 columns on desktop', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('Recommended Vacation Periods')).toBeVisible({ timeout: 10000 });
	
	await page.getByRole('button', { name: /Show Full Year Calendar/i }).click();
	
	// All months should be visible
	await expect(page.getByText('January', { exact: true })).toBeVisible();
	await expect(page.getByText('December', { exact: true })).toBeVisible();
});
