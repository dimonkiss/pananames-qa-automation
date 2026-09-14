import { chromium, FullConfig, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

async function globalSetup(config: FullConfig) {
  const { baseURL, storageState } = config.projects[0].use;

  const email = process.env.USER_EMAIL;
  const password = process.env.USER_PASSWORD;

  if (!email || !password) {
    throw new Error('USER_EMAIL and USER_PASSWORD must be set in .env');
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL });

  const loginPage = new LoginPage(page);
  await loginPage.goto(process.env.LOGIN_URL ?? '/login');
  await loginPage.login(email, password);

  await expect(page).toHaveURL(/\/domains/);

  await page.context().storageState({ path: storageState as string });
  await browser.close();
}

export default globalSetup;
