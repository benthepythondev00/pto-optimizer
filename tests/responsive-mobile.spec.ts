import { test, expect } from '@playwright/test';

// Configure mobile viewport (iPhone 12 dimensions) using Chromium
test.use({ 
	viewport: { width: 390, height: 844 },
	isMobile: true,
	hasTouch: true 
});

test('homepage renders correctly on mobile', async ({ page }) => {
	await page.goto('/');
	
	// Main elements should be visible
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
});

test('inputs are usable on mobile', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
	
	// All inputs should be visible and interactable
	const countrySelect = page.getByLabel('Country');
	await expect(countrySelect).toBeVisible();
	
	const yearSelect = page.getByLabel('Year');
	await expect(yearSelect).toBeVisible();
	
	const ptoInput = page.getByLabel('PTO Days Available');
	await expect(ptoInput).toBeVisible();
});

test('navigation works on mobile', async ({ page }) => {
	await page.goto('/');
	
	// Header should be visible
	await expect(page.getByRole('link', { name: /PTO/i }).first()).toBeVisible();
});

test('vacation cards are visible on mobile', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('Recommended Vacation Periods')).toBeVisible({ timeout: 10000 });
	
	// Cards should be visible
	const cards = page.locator('.bg-white.rounded-2xl');
	const count = await cards.count();
	expect(count).toBeGreaterThan(0);
});

test('calendar toggle works on mobile', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('Recommended Vacation Periods')).toBeVisible({ timeout: 10000 });
	
	// Toggle calendar
	await page.getByRole('button', { name: /Show Full Year Calendar/i }).click();
	await expect(page.getByText('January', { exact: true })).toBeVisible();
});

test('footer is visible on mobile', async ({ page }) => {
	await page.goto('/');
	
	await expect(page.getByText('Built with')).toBeVisible();
});
