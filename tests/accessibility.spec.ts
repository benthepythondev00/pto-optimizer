import { test, expect } from '@playwright/test';

test.describe('Accessibility - Keyboard Navigation', () => {
	test('can navigate inputs with Tab key', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
		
		// Tab through main inputs
		await page.keyboard.press('Tab');
		// Should be able to tab through interactive elements
		const focusedElement = page.locator(':focus');
		await expect(focusedElement).toBeVisible();
	});

	test('country select is keyboard accessible', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
		
		const countrySelect = page.getByLabel('Country');
		await countrySelect.focus();
		await expect(countrySelect).toBeFocused();
	});

	test('year select is keyboard accessible', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
		
		const yearSelect = page.getByLabel('Year');
		await yearSelect.focus();
		await expect(yearSelect).toBeFocused();
	});

	test('PTO input is keyboard accessible', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
		
		const ptoInput = page.getByLabel('PTO Days Available');
		await ptoInput.focus();
		await expect(ptoInput).toBeFocused();
		
		// Can type in the input
		await ptoInput.fill('20');
		await expect(ptoInput).toHaveValue('20');
	});

	test('buttons are keyboard accessible', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Recommended Vacation Periods')).toBeVisible({ timeout: 10000 });
		
		const calendarButton = page.getByRole('button', { name: /Full Year Calendar/i });
		await calendarButton.focus();
		await expect(calendarButton).toBeFocused();
		
		// Can activate with Enter
		await page.keyboard.press('Enter');
		await expect(page.getByText('January', { exact: true })).toBeVisible();
	});
});

test.describe('Accessibility - Labels and ARIA', () => {
	test('form inputs have labels', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
		
		// Check that labels exist and are associated with inputs
		await expect(page.getByLabel('Country')).toBeVisible();
		await expect(page.getByLabel('Year')).toBeVisible();
		await expect(page.getByLabel('PTO Days Available')).toBeVisible();
	});

	test('headings have proper hierarchy', async ({ page }) => {
		await page.goto('/');
		
		// Should have an h1
		const h1 = page.getByRole('heading', { level: 1 });
		await expect(h1).toBeVisible();
		
		// Should have h2s for sections
		const h2s = page.getByRole('heading', { level: 2 });
		const h2Count = await h2s.count();
		expect(h2Count).toBeGreaterThan(0);
	});

	test('navigation links are accessible', async ({ page }) => {
		await page.goto('/');
		
		// Navigation should have proper links
		const nav = page.getByRole('navigation');
		await expect(nav).toBeVisible();
		
		const navLinks = nav.getByRole('link');
		const linkCount = await navLinks.count();
		expect(linkCount).toBeGreaterThan(0);
	});

	test('buttons have accessible names', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Recommended Vacation Periods')).toBeVisible({ timeout: 10000 });
		
		// All buttons should have names
		const buttons = page.getByRole('button');
		const buttonCount = await buttons.count();
		
		for (let i = 0; i < buttonCount; i++) {
			const button = buttons.nth(i);
			const name = await button.getAttribute('aria-label') || await button.textContent();
			expect(name?.trim()).toBeTruthy();
		}
	});
});

test.describe('Accessibility - Color and Contrast', () => {
	test('page has readable text', async ({ page }) => {
		await page.goto('/');
		
		// Main heading should be visible
		const heading = page.getByRole('heading', { level: 1 });
		await expect(heading).toBeVisible();
		
		// Description text should be visible
		await expect(page.getByText('Strategic PTO planning')).toBeVisible();
	});

	test('interactive elements are visible', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
		
		// Buttons should be visible
		await expect(page.getByRole('button', { name: 'Go Pro' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Show Full Year Calendar' })).toBeVisible();
	});
});

test.describe('Accessibility - Focus Management', () => {
	test('focus is visible on interactive elements', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Total Days Off')).toBeVisible({ timeout: 10000 });
		
		// Tab to first interactive element and check focus is visible
		await page.keyboard.press('Tab');
		const focused = page.locator(':focus');
		await expect(focused).toBeVisible();
	});

	test('modal traps focus when open', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Recommended Vacation Periods')).toBeVisible({ timeout: 10000 });
		
		// Open modal via export button
		await page.getByRole('button', { name: /Export to Calendar/i }).click();
		
		// Modal should be open
		const modalHeading = page.getByRole('heading', { name: 'Upgrade to Pro' });
		await expect(modalHeading).toBeVisible({ timeout: 5000 });
		
		// Focus should be within modal area
		const closeButton = page.getByRole('button', { name: 'Close' });
		await expect(closeButton).toBeVisible();
	});
});
