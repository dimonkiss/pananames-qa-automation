import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('form input[name="email"]');
    this.passwordInput = page.locator('form input[name="password"]');
    this.loginButton = page.locator('form').getByRole('button', { name: 'Login' });
  }

  async goto(loginUrl: string) {
    await this.page.goto(loginUrl);
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
