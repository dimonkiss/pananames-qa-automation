import { test, expect } from '../fixtures/cart.fixture';
import { uniqueSld } from '../utils/random';

const TLDS = ['.com', '.net', '.online'];

// The cart is shared account-wide state (like the contacts list), and cleanup empties
// it entirely, so these tests must not run concurrently against it.
test.describe.configure({ mode: 'serial' });

test.describe('Domain search - single domain add to cart', () => {
  for (const tld of TLDS) {
    test(`should add an available ${tld} domain to cart and match the search price`, async ({
      page,
      domainSearchPage,
      cartPage,
    }) => {
      const domain = `${uniqueSld('qatest')}${tld}`;

      await domainSearchPage.goto();
      await domainSearchPage.search(domain);

      expect(await domainSearchPage.isAvailable(domain)).toBe(true);
      const searchPrice = await domainSearchPage.getPrice(domain);

      await domainSearchPage.addToCart(domain);
      await domainSearchPage.proceedToCart();
      await expect(page).toHaveURL(/\/cart/);

      const cartTotal = await cartPage.getTotal();
      expect(cartTotal).toBe(searchPrice);
    });
  }
});
