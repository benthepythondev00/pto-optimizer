import { test, expect } from '@playwright/test';

// Configure small mobile viewport (iPhone SE dimensions) using Chromium
test.use({ 
	viewport: { width: 375, height: 667 },
	isMobile: true,
	hasTouch: true 
});

test('content fits on small screen', async ({ page }) => {
	await page.goto('/');
	
	// Content should still be readable
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
});

test('no horizontal scroll on small screen', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
	
	// Check that body doesn't have horizontal overflow
	const hasHorizontalScroll = await page.evaluate(() => {
		return document.body.scrollWidth > document.body.clientWidth;
	});
	expect(hasHorizontalScroll).toBe(false);
});
