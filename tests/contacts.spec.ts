import { test, expect } from '../fixtures/contacts.fixture';
import { uniqueContactName, uniqueEmail } from '../utils/random';

test.describe.configure({ mode: 'serial' });

test.describe('Contacts - create', () => {
  test('should create a new contact with valid data', async ({ contactsPage }) => {
    const name = uniqueContactName('QA Create');
    const email = uniqueEmail('qa.create');

    await contactsPage.goto();
    await contactsPage.createContact({
      name,
      firstName: 'Automation',
      lastName: 'Tester',
      email,
      phoneCountry: 'Ukraine',
      phoneNumber: '501234567',
      checkboxes: { allowSupportRequests: true },
    });

    const row = contactsPage.getRow(name);
    await expect(row).toBeVisible();
    await expect(row).toContainText(email);
  });
});

test.describe('Contacts - edit', () => {
  test('should edit an existing contact and persist changes after reload', async ({ contactsPage }) => {
    const name = uniqueContactName('QA Edit');
    const email = uniqueEmail('qa.edit');
    const updatedEmail = uniqueEmail('qa.edit.updated');

    await contactsPage.goto();
    await contactsPage.createContact({
      name,
      firstName: 'Before',
      lastName: 'Edit',
      email,
      phoneCountry: 'Ukraine',
      phoneNumber: '501234567',
    });

    await contactsPage.editContact(name, { lastName: 'Updated', email: updatedEmail });

    await contactsPage.reload();
    const row = contactsPage.getRow(name);
    await expect(row).toContainText(updatedEmail);
  });
});

test.describe('Contacts - checkbox state', () => {
  test('should persist checkbox state after creation and after an update', async ({ contactsPage }) => {
    const name = uniqueContactName('QA Checkbox');

    await contactsPage.goto();
    await contactsPage.createContact({
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

    const statesAfterCreate = await contactsPage.getCheckboxStates(name);
    expect(statesAfterCreate).toEqual({
      allowSupportRequests: true,
      sendPromotionalEmails: false,
      sendProductEmails: true,
      sendFinancialEmails: false,
    });

    await contactsPage.editContact(name, {
      checkboxes: {
        allowSupportRequests: false,
        sendPromotionalEmails: true,
        sendProductEmails: false,
        sendFinancialEmails: true,
      },
    });

    const statesAfterUpdate = await contactsPage.getCheckboxStates(name);
    expect(statesAfterUpdate).toEqual({
      allowSupportRequests: false,
      sendPromotionalEmails: true,
      sendProductEmails: false,
      sendFinancialEmails: true,
    });
  });
});

test.describe('Contacts - delete', () => {
  test('should delete an existing contact', async ({ contactsPage }) => {
    const name = uniqueContactName('QA Delete');

    await contactsPage.goto();
    await contactsPage.createContact({
      name,
      firstName: 'To',
      lastName: 'Delete',
      email: uniqueEmail('qa.delete'),
      phoneCountry: 'Ukraine',
      phoneNumber: '501234567',
    });
    await expect(contactsPage.getRow(name)).toBeVisible();

    await contactsPage.deleteContact(name);

    await contactsPage.reload();
    await expect(contactsPage.getRow(name)).toHaveCount(0);
  });
});
