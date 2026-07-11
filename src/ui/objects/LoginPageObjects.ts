import { Page, Locator } from '@playwright/test';

export class LoginPageObjects {

  readonly emailLocator: Locator;
  readonly passwordLocator: Locator;
  readonly loginButtonLocator: Locator;

constructor(private readonly page: Page) {
  this.emailLocator = page.getByLabel('Email');
  this.passwordLocator = page.getByLabel('Password');
  this.loginButtonLocator = page.getByRole('button', { name: 'Log in' });
}
}