import { test as setup } from '@playwright/test'

const authFile = '.auth/user.json'


setup('setup', async ({ page }) => { 
  await page.goto('https://conduit.bondaracademy.com/');
  await page.locator('a.nav-link').getByText('Sign in').click();
  await page.getByPlaceholder('Email').fill('yussuf@gmail.com');
  await page.getByPlaceholder('Password').fill('yannick92');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.waitForResponse("https://conduit-api.bondaracademy.com/api/tags");
  await page.context().storageState({ path: authFile });

}); 