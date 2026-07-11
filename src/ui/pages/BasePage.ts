import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {
    this.page = page;
  }

  async open(): Promise<void> {
    await this.goto('/');
  }

  async goto(path: string): Promise<void> {
    await this.page.goto(process.env.TEST_BASE_URL!);
  }

  async logout(): Promise<void> {
    await this.page.getByRole('button', { name: 'Logout' }).click();
  }
}
