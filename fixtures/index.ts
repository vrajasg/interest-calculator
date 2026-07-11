import { test as pageFixtures } from '@fixtures/page.fixture';
import { mergeTests } from '@playwright/test';

export const test = mergeTests(pageFixtures);

export { expect } from '@playwright/test';
