import { test as base } from '@playwright/test';
import { DomainSearchPage } from '../pages/DomainSearchPage';
import { CartPage } from '../pages/CartPage';

interface CartFixtures {
  domainSearchPage: DomainSearchPage;
  cartPage: CartPage;
}

export const test = base.extend<CartFixtures>({
  domainSearchPage: async ({ page }, use) => {
    await use(new DomainSearchPage(page));
  },

  cartPage: async ({ page }, use) => {
    const cart = new CartPage(page);

    await use(cart);

    // Blanket cleanup: empty the cart after the test regardless of what was added,
    // so leftover domains never carry over into the next run.
    await cart.clear();
  },
});

export { expect } from '@playwright/test';
