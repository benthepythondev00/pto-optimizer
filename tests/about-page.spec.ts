import { test, expect } from '@playwright/test';

test.describe('About Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/about');
	});

	test('page loads with correct title', async ({ page }) => {
		await expect(page).toHaveTitle(/About.*How.*Works|PTO Optimizer/i);
	});

	test('displays main heading', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'How It Works' })).toBeVisible();
	});

	test('displays strategy section', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'The Strategy' })).toBeVisible();
		await expect(page.getByText('Thanksgiving Week')).toBeVisible();
	});

	test('displays algorithm section', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'The Algorithm' })).toBeVisible();
		await expect(page.getByText(/bridge opportunities/i)).toBeVisible();
	});

	test('displays supported countries section', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Supported Countries' })).toBeVisible();
		
		// Check all countries are listed
		await expect(page.getByText('United States')).toBeVisible();
		await expect(page.getByText('United Kingdom')).toBeVisible();
		await expect(page.getByText('Germany')).toBeVisible();
		await expect(page.getByText('Canada')).toBeVisible();
		await expect(page.getByText('Australia')).toBeVisible();
		await expect(page.getByText('France')).toBeVisible();
	});

	test('displays privacy section', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Privacy' })).toBeVisible();
		await expect(page.getByText(/calculations happen in your browser/i)).toBeVisible();
	});

	test('displays open source section', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Open Source' })).toBeVisible();
		await expect(page.getByText('MIT license')).toBeVisible();
	});

	test('has GitHub link', async ({ page }) => {
		const githubLink = page.getByRole('link', { name: /View on GitHub/i });
		await expect(githubLink).toBeVisible();
		await expect(githubLink).toHaveAttribute('href', /github\.com/);
	});

	test('displays questions section', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Questions?' })).toBeVisible();
		await expect(page.getByText(/Open an issue on GitHub/i)).toBeVisible();
	});

	test('example shows 9 days calculation', async ({ page }) => {
		// The example shows how 3 PTO days can give 9 days off
		await expect(page.getByText('9 days off using only 3 PTO days')).toBeVisible();
	});

	test('country flags are displayed', async ({ page }) => {
		// Check for flag emojis
		const flagContainer = page.locator('.grid-cols-2, .grid-cols-3').first();
		await expect(flagContainer).toBeVisible();
	});

	test('navigation back to home works', async ({ page }) => {
		await page.getByRole('link', { name: /PTO/i }).first().click();
		await expect(page).toHaveURL('/');
	});
});

test.describe('About Page SEO', () => {
	test('has proper meta description', async ({ page }) => {
		await page.goto('/about');
		
		const metaDescription = page.locator('meta[name="description"]');
		await expect(metaDescription).toHaveAttribute('content', /PTO Optimizer|vacation days/i);
	});
});
