import { Page } from '@playwright/test';
import { CalculatorPageObjects } from '@locators/CalculatorPageObjects';
import { BasePage } from '@pages/BasePage';
import { Duration } from 'src/types/Duration';

export class CalculatorPage extends BasePage {
  readonly locators: CalculatorPageObjects;

  constructor(page: Page) {
    super(page);
    this.locators = new CalculatorPageObjects(page);
  }

  async waitForPageLoaded(): Promise<void> {
    await this.locators.calculateBtn.waitFor({ state: 'visible' });
  }

  /**
   * Sets the principal amount via the slider.
   * Uses JS to set value directly — more reliable than dragging for range inputs.
   */
  async setPrincipalAmount(amount: number): Promise<void> {
    await this.locators.principalSlider.evaluate(
      (el: HTMLInputElement, value: number) => {
        el.value = String(value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      },
      amount
    );
  }

  /**
   * Selects an interest rate from the Bootstrap dropdown.
   * Opens the dropdown first, then checks the checkbox for the given rate.
   * Rate format: '5%', '10%', '15%' etc.
   */
  async selectInterestRate(rate: string): Promise<void> {
    await this.locators.interestRateDropdownBtn.click();
    await this.locators.rateCheckbox(rate).check();
  
    // Close dropdown by clicking outside
    await this.page.locator('body').click();
  }

  /**
   * Selects a duration by clicking the corresponding list-group item.
   * The active item gets the 'active' class applied by JS.
   */
  async selectDuration(duration: Duration): Promise<void> {
    const map: Record<Duration, typeof this.locators.durationDaily> = {
      Daily:   this.locators.durationDaily,
      Monthly: this.locators.durationMonthly,
      Yearly:  this.locators.durationYearly,
    };
    await map[duration].click();
  }

  async acceptConsent(): Promise<void> {
    await this.locators.consentCheckbox.check();
  }

  async calculate(): Promise<void> {
    await this.locators.calculateBtn.click();
  }

 /**
   * Full happy-path helper — fills all required fields and clicks Calculate.
   */
  async fillAndCalculate(input: {
    principal: number;
    rate: string;
    duration: Duration;
    consent?: boolean;
  }): Promise<void> {
    await this.setPrincipalAmount(input.principal);
    await this.selectInterestRate(input.rate);
    await this.selectDuration(input.duration);
    if (input.consent !== false) {
      await this.acceptConsent();
    }
    await this.calculate();
  }

  /**
   * Returns all rate checkbox values from the dropdown.
   * Opens dropdown, reads values, closes it.
   */
  async getInterestRateOptions(): Promise<string[]> {
    await this.locators.interestRateDropdownBtn.click();
    return await this.locators.interestRateCheckboxes.allTextContents();
  }

  /**
   * Returns the max attribute of the principal slider.
   */
  async getPrincipalSliderMax(): Promise<number> {
    const max = await this.locators.principalSlider.getAttribute('max');
    return Number(max);
  }

  async getPrincipalSelectedValue(): Promise<number> {
    const value = await this.locators.principalSelectedValue.textContent();
    return Number(value);
  }

  async getInterestAmount(): Promise<number> {
    const interestText = await this.locators.interestResult.textContent();
    return parseFloat(interestText?.replace(/[^0-9.]/g, '') ?? 'NaN');
  }

    async getTotalAmount(): Promise<number> {
    const totalText = await this.locators.totalAmountResult.textContent();
    return parseFloat(totalText?.replace(/[^0-9.]/g, '') ?? 'NaN');
  }

async clickCalculateExpectingAlert(): Promise<string> {
  // Create a promise that resolves with the alert message text
  const alertTextPromise = new Promise<string>((resolve) => {
    this.page.once('dialog', async (dialog) => {
      const message = dialog.message();
      await dialog.accept(); // Clicks 'OK' / 'Accept' automatically
      resolve(message);      // Sends the text back to the test
    });
  });

  // Trigger the click action that fires the alert
  await this.locators.calculateBtn.click();

  // Wait for the dialog event to finish processing and return the text
  return await alertTextPromise;
}
}
