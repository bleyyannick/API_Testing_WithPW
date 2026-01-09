import { test, expect } from '@playwright/test';
import tags from '../test-data/test-data.json';

test.use({
  serviceWorkers: 'block',
});

test.beforeEach(async ({ page }) => {
  await page.route('**/api/tags', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(tags),
    });
  });


  await page.route('*/**/api/articles*', async route => {
    const response = await route.fetch();
    const body = await response.json();
      body.articles[0].title = "Wesh marche";
      body.articles[1].title = "Ca marche aussi";

    await route.fulfill({
      body: JSON.stringify(body),
       status: 200,
      contentType: 'application/json',
    });
  });

  await page.goto('https://conduit.bondaracademy.com/');
});

test('navbar brand displays conduit', async ({ page }) => {
  await expect(page.locator('a.navbar-brand')).toHaveText('conduit');
});

test('should display changed article titles', async ({ page }) => {

  const firstArticleTitle = page.locator('app-article-list h1').first();
  const secondArticleTitle = page.locator('app-article-list h1').nth(1);

  await expect(firstArticleTitle).toContainText('Modification du titre du premier article');
  await expect(secondArticleTitle).toContainText('Modification du titre du second article');

  await page.waitForTimeout(1000);
});
