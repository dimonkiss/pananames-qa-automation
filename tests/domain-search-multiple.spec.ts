import { test, expect } from '../fixtures/cart.fixture';
import { uniqueSld } from '../utils/random';

test.describe('Domain search - multiple domains add to cart', () => {
  test('should add 3 available domains from an SLD-only search and match the total price', async ({
    page,
    domainSearchPage,
    cartPage,
  }) => {
    const sld = uniqueSld('qamulti');

    await domainSearchPage.goto();
    await domainSearchPage.search(sld);

    const domains = await domainSearchPage.getAvailableDomains(3);
    expect(domains).toHaveLength(3);

    let expectedTotal = 0;
    for (const domain of domains) {
      expectedTotal += await domainSearchPage.getPrice(domain);
      await domainSearchPage.addToCart(domain);
    }

    await domainSearchPage.proceedToCart();
    await expect(page).toHaveURL(/\/cart/);

    const cartTotal = await cartPage.getTotal();
    expect(cartTotal).toBeCloseTo(expectedTotal, 2);
  });
});
