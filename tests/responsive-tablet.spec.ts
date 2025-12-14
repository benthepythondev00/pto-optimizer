import { test, expect } from '@playwright/test';

// Configure tablet viewport (iPad dimensions) using Chromium
test.use({ 
	viewport: { width: 768, height: 1024 },
	isMobile: true,
	hasTouch: true 
});

test('homepage renders correctly on tablet', async ({ page }) => {
	await page.goto('/');
	
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
});

test('grid layout adapts on tablet', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('Recommended Vacation Periods')).toBeVisible({ timeout: 10000 });
	
	// Features section should show properly
	await expect(page.getByText('Smart Algorithm')).toBeVisible();
	await expect(page.getByText('Multiple Countries')).toBeVisible();
	await expect(page.getByText('Privacy First')).toBeVisible();
});

test('calendar grid shows multiple columns on tablet', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('Recommended Vacation Periods')).toBeVisible({ timeout: 10000 });
	
	await page.getByRole('button', { name: /Show Full Year Calendar/i }).click();
	
	// Multiple months should be visible in a row
	await expect(page.getByText('January', { exact: true })).toBeVisible();
	await expect(page.getByText('February', { exact: true })).toBeVisible();
});
