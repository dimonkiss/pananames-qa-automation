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

test.describe('Contacts - edit', () => {
  test('should edit an existing contact and persist changes after reload', async ({ page }) => {
    const contacts = new ContactsPage(page);
    const name = uniqueContactName('QA Edit');
    const email = uniqueEmail('qa.edit');
    const updatedEmail = uniqueEmail('qa.edit.updated');

    await contacts.goto();
    await contacts.createContact({
      name,
      firstName: 'Before',
      lastName: 'Edit',
      email,
      phoneCountry: 'Ukraine',
      phoneNumber: '501234567',
    });

    await contacts.editContact(name, { lastName: 'Updated', email: updatedEmail });

    await page.reload();
    const row = contacts.getRow(name);
    await expect(row).toContainText(updatedEmail);
  });
});

test.describe('Contacts - delete', () => {
  test('should delete an existing contact', async ({ page }) => {
    const contacts = new ContactsPage(page);
    const name = uniqueContactName('QA Delete');

    await contacts.goto();
    await contacts.createContact({
      name,
      firstName: 'To',
      lastName: 'Delete',
      email: uniqueEmail('qa.delete'),
      phoneCountry: 'Ukraine',
      phoneNumber: '501234567',
    });
    await expect(contacts.getRow(name)).toBeVisible();

    await contacts.deleteContact(name);

    await page.reload();
    await expect(contacts.getRow(name)).toHaveCount(0);
  });
});
