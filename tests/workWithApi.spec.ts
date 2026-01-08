import { test, expect } from '@playwright/test';


test.beforeEach( async ({ page }) => {
    await page.goto('https://conduit.bondaracademy.com/');
  })

test('has text', async ({ page }) => {
  await expect(page.locator('a.navbar-brand')).toHaveText('conduit');
});
