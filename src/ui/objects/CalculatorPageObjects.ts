import { Page, Locator } from '@playwright/test';

/**
 * Locators for the Interest Calculator page.
 * Selectors are based on the real HTML inspected from the application.
 *
 */
export class CalculatorPageObjects {
  
  readonly principalSlider: Locator;
  readonly principalSelectedValue: Locator;
  readonly interestRateDropdownMenu: Locator;
  readonly interestRateDropdownBtn: Locator;
  readonly interestRateCheckboxes: Locator;
  readonly durationDaily: Locator;
  readonly durationMonthly: Locator;
  readonly durationYearly: Locator;
  readonly durationItems: Locator;
  readonly consentCheckbox: Locator;
  readonly calculateBtn: Locator;
  readonly interestResult: Locator;
  readonly totalAmountResult: Locator;

constructor(private readonly page: Page) {
  this.principalSlider        = page.getByLabel('Principal Amount:');
  this.principalSelectedValue = page.locator('#selectedValue');

  // Interest rate — button opens the dropdown
  this.interestRateDropdownBtn = page.getByRole('button', { name: 'Select Interest Rate' });
  this.interestRateDropdownMenu = page.getByLabel('Select Interest Rate');
  this.interestRateCheckboxes = this.interestRateDropdownMenu.locator('label');

  // Duration — list of links
  this.durationDaily   = page.getByRole('link', { name: 'Daily' });
  this.durationMonthly = page.getByRole('link', { name: 'Monthly' });
  this.durationYearly  = page.getByRole('link', { name: 'Yearly' });
  this.durationItems   = page.locator('#durationList a.list-group-item');

  // Consent — use label text
  this.consentCheckbox = page.getByLabel('Please accept this mandatory consent*');

  // Calculate button
  this.calculateBtn = page.getByRole('button', { name: 'Calculate' });

  // Results — no semantic role, IDs are the cleanest option here
  this.interestResult    = page.locator('#interestAmount');
  this.totalAmountResult = page.locator('#totalAmount');
}

/** Individual rate checkbox by value e.g. rateCheckbox('5%') */
rateCheckbox(rate: string) {
  return this.page.getByRole('checkbox', { name: rate, exact: true });
}
}
