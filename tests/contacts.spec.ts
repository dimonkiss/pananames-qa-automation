import { test, expect } from '@playwright/test';
import { ContactsPage } from '../pages/ContactsPage';
import { uniqueContactName, uniqueEmail } from '../utils/random';

test.describe('Contacts - create', () => {
  test('should create a new contact with valid data', async ({ page }) => {
    const contacts = new ContactsPage(page);
    const name = uniqueContactName('QA Create');
    const email = uniqueEmail('qa.create');

    await contacts.goto();
    await contacts.createContact({
      name,
      firstName: 'Automation',
      lastName: 'Tester',
      email,
      phoneCountry: 'Ukraine',
      phoneNumber: '501234567',
      checkboxes: { allowSupportRequests: true },
    });

    const row = contacts.getRow(name);
    await expect(row).toBeVisible();
    await expect(row).toContainText(email);
  });
});
