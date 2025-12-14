import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
	test('can navigate to about page', async ({ page }) => {
		await page.goto('/');
		
		// Click on "How it works" link
		await page.getByRole('link', { name: 'How it works' }).click();
		
		// Should be on about page
		await expect(page).toHaveURL('/about');
		await expect(page.getByRole('heading', { name: /How.*Works/i })).toBeVisible();
	});

	test('can navigate back to home from about', async ({ page }) => {
		await page.goto('/about');
		
		// Click logo to go home
		await page.getByRole('link', { name: /PTO/i }).first().click();
		
		// Should be on home page
		await expect(page).toHaveURL('/');
	});

	test('header is visible on all pages', async ({ page }) => {
		await page.goto('/');
		
		// Header should have logo and navigation
		await expect(page.getByRole('link', { name: /PTO/i }).first()).toBeVisible();
		await expect(page.getByRole('link', { name: 'How it works' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'GitHub' })).toBeVisible();
	});

	test('footer is visible', async ({ page }) => {
		await page.goto('/');
		
		// Footer content
		await expect(page.getByText('Built with')).toBeVisible();
		await expect(page.getByText('for people who value their time')).toBeVisible();
	});

	test('GitHub link opens in correct URL', async ({ page }) => {
		await page.goto('/');
		
		const githubLink = page.getByRole('link', { name: 'GitHub' });
		await expect(githubLink).toHaveAttribute('href', /github\.com/);
	});
});
