import { Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { LoginPageObjects } from '@locators/LoginPageObjects';
import { CalculatorPage } from './CalculatorPage';

export class LoginPage extends BasePage {
  readonly locators: LoginPageObjects;

  constructor(page: Page) {
    super(page);
    this.locators = new LoginPageObjects(page);
  }

  async login(email: string, password: string): Promise<CalculatorPage> {
    const { emailLocator, passwordLocator, loginButtonLocator } = this.locators;
    
    await emailLocator.fill(email);
    await passwordLocator.fill(password);
    
    await loginButtonLocator.click();

    const calculatorPage = new CalculatorPage(this.page);
    await calculatorPage.waitForPageLoaded();
    return calculatorPage;
  }
}
