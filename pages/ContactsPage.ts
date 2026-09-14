import { Page, Locator, expect } from '@playwright/test';

export interface ContactCheckboxes {
  allowSupportRequests?: boolean;
  sendPromotionalEmails?: boolean;
  sendProductEmails?: boolean;
  sendFinancialEmails?: boolean;
}

export interface ContactData {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneCountry: string;
  phoneNumber: string;
  comment?: string;
  checkboxes?: ContactCheckboxes;
}

const CHECKBOX_LABELS: Record<keyof ContactCheckboxes, string> = {
  allowSupportRequests: 'Allow Support Requests',
  sendPromotionalEmails: 'Send promotional emails',
  sendProductEmails: 'Send product emails',
  sendFinancialEmails: 'Send financial emails',
};

export class ContactsPage {
  readonly page: Page;
  readonly addNewContactButton: Locator;
  readonly rows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addNewContactButton = page.getByRole('button', { name: '+ Add New Contact' });
    this.rows = page.locator('table tr');
  }

  async goto() {
    await this.page.goto('/contacts');
    await this.showMaxContactsPerPage();
  }

  private async showMaxContactsPerPage() {
    const refetched = this.page.waitForResponse(
      (response) => response.url().includes('/api/contacts') && response.url().includes('per_page=100'),
    );
    await this.page.locator('.va-select').click();
    await this.page.getByRole('option', { name: '100' }).click();
    await refetched;
  }

  async reload() {
    await this.page.reload();
    await this.showMaxContactsPerPage();
  }

  getRow(name: string): Locator {
    return this.rows.filter({ has: this.page.locator('td').first().getByText(name, { exact: true }) });
  }

  private field(label: string): Locator {
    return this.page.locator('div.relative').filter({ hasText: label }).locator('input');
  }

  private async selectPhoneCountry(country: string) {
    await this.field('Phone prefix').click();
    await this.page.locator('.country-intl-input').fill(country);
    await this.page.locator('.vue-country-item').filter({ hasText: country }).first().click();
  }

  private async setCheckboxes(checkboxes?: ContactCheckboxes) {
    if (!checkboxes) return;
    for (const key of Object.keys(checkboxes) as (keyof ContactCheckboxes)[]) {
      const shouldBeChecked = checkboxes[key];
      if (shouldBeChecked === undefined) continue;
      const checkbox = this.page.getByLabel(CHECKBOX_LABELS[key]);
      if ((await checkbox.isChecked()) !== shouldBeChecked) {
        await this.page.locator('label.va-checkbox__label').filter({ hasText: CHECKBOX_LABELS[key] }).click();
      }
    }
  }

  private async fillForm(data: Partial<ContactData>) {
    if (data.name !== undefined) await this.field('Contact type/NAME').fill(data.name);
    if (data.firstName !== undefined) await this.field('First Name').fill(data.firstName);
    if (data.lastName !== undefined) await this.field('Last Name').fill(data.lastName);
    if (data.email !== undefined) await this.field('Email').fill(data.email);
    if (data.phoneCountry !== undefined) await this.selectPhoneCountry(data.phoneCountry);
    if (data.phoneNumber !== undefined) await this.field('Phone number').fill(data.phoneNumber);
    if (data.comment !== undefined) await this.field('Comment (optional)').fill(data.comment);
    await this.setCheckboxes(data.checkboxes);
  }

  async createContact(data: ContactData) {
    await this.addNewContactButton.click();
    await expect(this.page).toHaveURL(/\/contacts\/add/);
    await this.fillForm(data);
    await this.page.getByRole('button', { name: 'Create' }).click();
    await expect(this.page).toHaveURL(/\/contacts$/);
    await this.showMaxContactsPerPage();
  }

  /** The edit form loads existing contact data asynchronously; filling too early gets overwritten once it arrives. */
  private async waitForEditFormLoaded() {
    await expect(this.field('Contact type/NAME')).not.toHaveValue('');
  }

  async editContact(name: string, data: Partial<ContactData>) {
    await this.getRow(name).locator('td').nth(2).locator('button').click();
    await expect(this.page).toHaveURL(/\/contacts\/edit\/\d+/);
    await this.waitForEditFormLoaded();
    await this.fillForm(data);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await expect(this.page).toHaveURL(/\/contacts$/);
    await this.showMaxContactsPerPage();
  }

  async deleteContact(name: string) {
    await this.getRow(name).locator('td').nth(3).locator('button').click();
    await this.page.getByRole('button', { name: 'OK' }).click();
    await expect(this.getRow(name)).toHaveCount(0);
  }

  async deleteAllContacts(attempt = 1) {
    await this.goto();
    const deleteButtons = this.page.locator('table tr td:nth-child(4) button');

    let remaining = await deleteButtons.count();
    while (remaining > 0) {
      await deleteButtons.first().click();
      await this.page.getByRole('button', { name: 'OK' }).click();
      await expect(deleteButtons).toHaveCount(remaining - 1);
      remaining = await deleteButtons.count();
    }

    await this.reload();
    const leftAfterReload = await deleteButtons.count();
    if (leftAfterReload > 0) {
      if (attempt >= 5) {
        throw new Error(`deleteAllContacts: ${leftAfterReload} contact(s) still present after ${attempt} attempts`);
      }
      await this.deleteAllContacts(attempt + 1);
    }
  }

  async getCheckboxStates(name: string): Promise<ContactCheckboxes> {
    await this.getRow(name).locator('td').nth(2).locator('button').click();
    await expect(this.page).toHaveURL(/\/contacts\/edit\/\d+/);
    await this.waitForEditFormLoaded();

    const states: ContactCheckboxes = {};
    for (const key of Object.keys(CHECKBOX_LABELS) as (keyof ContactCheckboxes)[]) {
      states[key] = await this.page.getByLabel(CHECKBOX_LABELS[key]).isChecked();
    }

    await this.goto();
    return states;
  }
}
