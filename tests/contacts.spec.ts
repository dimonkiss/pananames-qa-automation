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

    await contacts.reload();
    const row = contacts.getRow(name);
    await expect(row).toContainText(updatedEmail);
  });
});

test.describe('Contacts - checkbox state', () => {
  test('should persist checkbox state after creation and after an update', async ({ page }) => {
    const contacts = new ContactsPage(page);
    const name = uniqueContactName('QA Checkbox');

    await contacts.goto();
    await contacts.createContact({
      name,
      firstName: 'Checkbox',
      lastName: 'State',
      email: uniqueEmail('qa.checkbox'),
      phoneCountry: 'Ukraine',
      phoneNumber: '501234567',
      checkboxes: {
        allowSupportRequests: true,
        sendPromotionalEmails: false,
        sendProductEmails: true,
        sendFinancialEmails: false,
      },
    });

    const statesAfterCreate = await contacts.getCheckboxStates(name);
    expect(statesAfterCreate).toEqual({
      allowSupportRequests: true,
      sendPromotionalEmails: false,
      sendProductEmails: true,
      sendFinancialEmails: false,
    });

    await contacts.editContact(name, {
      checkboxes: {
        allowSupportRequests: false,
        sendPromotionalEmails: true,
        sendProductEmails: false,
        sendFinancialEmails: true,
      },
    });

    const statesAfterUpdate = await contacts.getCheckboxStates(name);
    expect(statesAfterUpdate).toEqual({
      allowSupportRequests: false,
      sendPromotionalEmails: true,
      sendProductEmails: false,
      sendFinancialEmails: true,
    });
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

    await contacts.reload();
    await expect(contacts.getRow(name)).toHaveCount(0);
  });
});
