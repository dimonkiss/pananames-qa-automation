import { Page, Locator } from '@playwright/test';
import { parsePrice } from '../utils/price';

export class DomainSearchPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly results: Locator;
  readonly proceedToCartButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('.search-input input');
    this.searchButton = page.locator('.search-input .va-input-wrapper__append-inner i');
    this.results = page.locator('.list__item');
    this.proceedToCartButton = page.getByRole('button', { name: 'Proceed to Cart' });
  }

  async goto() {
    await this.page.goto('/register-domain');
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchButton.click();
  }

  getResult(domain: string): Locator {
    return this.results.filter({ has: this.page.locator('.domain-name', { hasText: domain }) });
  }

  async isAvailable(domain: string): Promise<boolean> {
    const buttonText = await this.getResult(domain).locator('button').textContent();
    return buttonText?.trim() === 'Add to cart';
  }

  async getPrice(domain: string): Promise<number> {
    const text = await this.getResult(domain).locator('.text-sm.font-medium').textContent();
    return parsePrice(text ?? '');
  }

  async addToCart(domain: string) {
    await this.getResult(domain).getByRole('button', { name: 'Add to cart' }).click();

    // Some TLDs (e.g. .net) show a "Registration notice" dialog that must be confirmed
    // before the domain is actually added; other TLDs skip it entirely.
    const agreeButton = this.page.getByRole('button', { name: 'I AGREE, ADD DOMAIN TO CART' });
    try {
      await agreeButton.waitFor({ state: 'visible', timeout: 3000 });
      await agreeButton.click();
    } catch {
      // no registration notice for this TLD, nothing to confirm
    }
  }

  async proceedToCart() {
    await this.proceedToCartButton.click();
  }
}
