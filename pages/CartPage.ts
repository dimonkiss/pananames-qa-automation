import { Page, Locator, expect } from '@playwright/test';
import { parsePrice } from '../utils/price';

export class CartPage {
  readonly page: Page;
  readonly totalLocator: Locator;
  readonly itemRows: Locator;
  readonly removeButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.totalLocator = page.getByText(/^TOTAL:/);
    this.itemRows = page.locator('table tr').filter({ has: page.locator('td') });
    this.removeButtons = page.locator('table tr td:last-child button');
  }

  async goto() {
    const cartLoaded = this.page.waitForResponse((response) => response.url().includes('/api/cart/get'));
    await this.page.goto('/cart');
    await cartLoaded;
  }

  async getTotal(): Promise<number> {
    const text = await this.totalLocator.textContent();
    return parsePrice(text ?? '');
  }

  async isEmpty(): Promise<boolean> {
    return (await this.page.getByText('Cart is empty').count()) > 0;
  }

  /** Removes every item currently in the cart, leaving it empty. */
  async clear() {
    await this.goto();
    let remaining = await this.removeButtons.count();
    while (remaining > 0) {
      await this.removeButtons.first().click();
      await expect(this.removeButtons).toHaveCount(remaining - 1);
      remaining = await this.removeButtons.count();
    }
  }
}
