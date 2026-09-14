import { test as base } from '@playwright/test';
import { ContactsPage } from '../pages/ContactsPage';

interface ContactsFixtures {
  contactsPage: ContactsPage;
}

export const test = base.extend<ContactsFixtures>({
  contactsPage: async ({ page }, use) => {
    const contacts = new ContactsPage(page);
    await use(contacts);
    await contacts.deleteAllContacts();
  },
});

export { expect } from '@playwright/test';
