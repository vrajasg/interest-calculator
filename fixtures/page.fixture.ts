import { LoginPage } from '@pages/LoginPage';
import { test as base } from '@playwright/test';
import { EnvConfig } from 'src/utils/EnvConfig';

type TestFixtures = {
  loginPage: LoginPage;
};

type WorkerFixtures = {
  envConfig: EnvConfig;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  // Worker scope evaluates environemnt once per worker process
  envConfig: [async ({}, use) => {
    const config = new EnvConfig();
    await use(config);
  }, { scope: 'worker' }],

  // Isolated loginPage fixture
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await use(loginPage);
    await loginPage.logout();
  },
});

export { expect } from '@playwright/test';
