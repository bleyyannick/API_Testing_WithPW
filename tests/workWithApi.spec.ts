import { test, expect } from '@playwright/test';
import tags from '../test-data/test-data.json';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/tags', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(tags),
    });
  });

  await page.goto('https://conduit.bondaracademy.com/');

});

test('navbar brand displays conduit', async ({ page }) => {
  await expect(page.locator('a.navbar-brand')).toHaveText('conduit');
});

test('should display changed article titles', async ({ page }) => { 
  // 1. Définir la route
await page.route('*/**/api/articles*', async route => {
  const response = await route.fetch();
  const body = await response.json();
  body.articles[0].title = "Modification du titre du premier article";
  body.articles[1].title = "Modification du titre du second article";

  await route.fulfill({
    body: JSON.stringify(body),
    status: 200,
    contentType: 'application/json',
  });
});

const firstArticleTitle = page.locator('app-article-list h1').first();
const secondArticleTitle = page.locator('app-article-list h1').nth(1);

await Promise.all([
  page.waitForResponse('*/**/api/articles*'), 
  page.locator('a.nav-link').filter({ hasText: 'Global Feed' }).click()
]);

await expect(firstArticleTitle).toHaveText('Modification du titre du premier article');
await expect(secondArticleTitle).toHaveText('Modification du titre du second article');

await page.unrouteAll({ behavior: 'ignoreErrors' });
});

test('should delete an article', async ({ page, request }) => {
  const createArticleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles', { 
    data: {
      "article": {
        "title": "Article to subsequently delete",
        "description": "This other article will be deleted in this test right after creation",
        "body": "This is the body of the article to be deleted",
        "tagList": []
      }

    },
  })
   expect(createArticleResponse.status()).toBe(201);

   // 1. Définition des locateurs (plus lisible et réutilisable)
  const firstArticle = page.locator('app-article-list a.preview-link').first();
  const deleteBtn = page.getByRole('button', { name: 'Delete Article' }).first();
  const globalFeedTab = page.locator('a.nav-link').filter({ hasText: 'Global Feed' });
  const homeLink = page.getByRole('link', { name: 'Home' });


  await firstArticle.waitFor({ state: 'visible' });
  await firstArticle.click();

  await deleteBtn.waitFor({ state: 'visible' });
  await deleteBtn.click();
  await globalFeedTab.waitFor({ state: 'visible' });
  await globalFeedTab.click();

  // Rafraîchissement via UI
  await homeLink.waitFor({ state: 'visible' });
  await homeLink.click();
  
  await globalFeedTab.waitFor({ state: 'visible' });
  await globalFeedTab.click();

  await expect(page.locator('app-article-list')).toBeVisible();
  await expect(page.locator('app-article-list h1').first()).not.toHaveText('Article to subsequently delete');


});
  
test('should do something that AI dont know yet', async ({ page, request }) => {
    // Test implementation goes here
    await page.locator('a.nav-link').getByText('New Article').click();
    await page.getByPlaceholder('Article Title').fill('AI makes me unemployed now');
    await page.getByPlaceholder("What's this article about?").fill('AI is taking over the world');
    await page.getByPlaceholder('Write your article (in markdown)').fill('AI will replace all developers soon');
    await page.getByPlaceholder('Enter tags').fill('AI, automation');
    await page.getByRole('button', { name: 'Publish Article' }).click();
    const responseArticle = await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/'); 
    const responseArticleBody = await responseArticle.json();
    const slugArticleId = responseArticleBody.article.slug;

    await expect(page.locator('h1')).toHaveText('AI makes me unemployed now');

    await page.locator('a.nav-link').getByText('Home').click();
    await page.locator('a.nav-link').getByText('Global Feed').click();
  
  const deleteResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugArticleId}`);
  
  expect(deleteResponse.status()).toBe(204);
});

