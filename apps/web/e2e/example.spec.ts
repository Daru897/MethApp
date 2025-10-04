import { test, expect } from '@playwright/test';

test('index page has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/MethAwarenessApp/);
});