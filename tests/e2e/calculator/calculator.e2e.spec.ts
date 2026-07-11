/**
 * E2E Tests — Interest Calculator
 *
 * One test per Acceptance Criterion.
 * Tests call page actions; assertions stay in the test.
 * Pages call locators; locators hold only selectors.
 *
 * AC-01: Yearly interest calculation
 * AC-02: Monthly interest calculation
 * AC-03: Weekly interest calculation
 * AC-04: Rounding to two decimal places
 * AC-05: Interest rate options ≤ 15%
 * AC-06: All fields required — calculate blocked if any missing
 * AC-07: Principal slider max is 15,000
 * AC-08: Interest rate not selected → error shown
 * AC-09: Duration not selected → error shown
 * AC-10: Consent not checked → error shown
 */

import { test, expect } from '@fixtures/index';
import {
  CALCULATION_SCENARIOS,
  calculateExpectedInterest,
  MAX_INTEREST_RATE_PERCENT,
  MAX_PRINCIPAL,
} from 'tests/testData/testData';

test.describe('Simple Interest Calculator — E2E', () => {

// ─── AC-01, AC-02, AC-03, AC-04, AC-05 (happy path) ─────────────────────────
// Parameterised across all calculation scenarios

for (const scenario of CALCULATION_SCENARIOS) {
  test(scenario.description, async ({ loginPage, envConfig }) => {
    const calculatorPage = await loginPage.login(envConfig.email, envConfig.password);

    // 1. Fill the form inputs on the UI
    await calculatorPage.fillAndCalculate({
      principal: scenario.principal,
      rate: scenario.rate,
      duration: scenario.duration,
    });

    // 2. Fetch the updated math expectations
    const expected = calculateExpectedInterest(
      scenario.principal,
      scenario.ratePercent,
      scenario.duration
    );

    // 3. Extract actual values displayed on the screen
    const displayedInterest = await calculatorPage.getInterestAmount();
    const displayedTotal = await calculatorPage.getTotalAmount();

    // 4. Assert calculated amounts align within two-decimal limits
    expect(
      displayedInterest,
      `[${scenario.description}] Expected interest ${expected.interest}, got ${displayedInterest}`
    ).toBeCloseTo(expected.interest, 2);

    expect(
      displayedTotal,
      `[${scenario.description}] Expected total ${expected.total}, got ${displayedTotal}`
    ).toBeCloseTo(expected.total, 2);

    // 5. AC-04: Enforce that neither value contains long precision trails
    // Multiplying by 100 and checking for integers guarantees 2 decimal spots maximum
    expect(Number.isInteger(displayedInterest * 100), `Interest "${displayedInterest}" has more than 2 decimal places`).toBeTruthy();
    expect(Number.isInteger(displayedTotal * 100), `Total "${displayedTotal}" has more than 2 decimal places`).toBeTruthy();
  });
}


test('AC-05: Interest rate dropdown contains only options ≤ 15%', async ({ loginPage, envConfig }) => {

  const calculatorPage = await loginPage.login(envConfig.email, envConfig.password);

  const options = await calculatorPage.getInterestRateOptions();

  console.log(`📋 Found Options: ${options.join(', ')}`);
  
  // 1. One-line calculations to find all breaking values
  const badOptions = options.filter(o => parseFloat(o) <= 0 || parseFloat(o) > MAX_INTEREST_RATE_PERCENT);
  const missingOptions = Array.from({ length: MAX_INTEREST_RATE_PERCENT }, (_, i) => `${i + 1}%`).filter(o => !options.includes(o));

  // 2. Build a completely custom, crystal-clear message
  const failureExplanation = [
    ...(badOptions.length ? [`Out-of-Bounds Options Found: [${badOptions.join(', ')}]`] : []),
    ...(missingOptions.length ? [`Missing Interest Rate Options: [${missingOptions.join(', ')}]`] : [])
  ].join('\n');

  // 3. Single assertion checks for any failures and prints the explanation perfectly
  expect(badOptions.length + missingOptions.length, `\n❌ AC-05 Specification Failures:\n${failureExplanation}\n`).toBe(0);
});

test('AC-06: Clicking Calculate with no inputs shows errors for all fields', async ({ loginPage, envConfig }) => {
  const calculatorPage = await loginPage.login(envConfig.email, envConfig.password);
  const alertMessage = await calculatorPage.clickCalculateExpectingAlert();
  expect(alertMessage).toBe('Please fill in all fields.');
});


test('AC-07: Principal slider allows values up to 15,000', async ({ loginPage, envConfig }) => {

  const calculatorPage = await loginPage.login(envConfig.email, envConfig.password);
  const selectedValueBeforeSlider = await calculatorPage.getPrincipalSelectedValue();
  await calculatorPage.setPrincipalAmount(MAX_PRINCIPAL);
  const selectedValue = await calculatorPage.getPrincipalSelectedValue();

  expect(selectedValue > selectedValueBeforeSlider, 
    `Principal slider should increase when moved, but got ${selectedValueBeforeSlider} → ${selectedValue}`).toBeTruthy();

  expect(
    selectedValue,
    `Principal slider max should be ${MAX_PRINCIPAL}, got ${selectedValue}`
  ).toBe(MAX_PRINCIPAL);
});

test('AC-07: Principal slider doesn\'t allow values above 15,000', async ({ loginPage, envConfig }) => {

  const calculatorPage = await loginPage.login(envConfig.email, envConfig.password);
  await calculatorPage.fillAndCalculate({
    principal: 20000,
    rate: '5%',
    duration: 'Yearly',
  });

      // 2. Fetch the updated math expectations
    const expected = calculateExpectedInterest(
      15000, // Use the max value for calculation but not what was inputted
      5,
      'Yearly'
    );

    // 3. Extract actual values displayed on the screen
    const displayedInterest = await calculatorPage.getInterestAmount();
    const displayedTotal = await calculatorPage.getTotalAmount();

    // 4. Assert calculated amounts align within two-decimal limits
    expect(
      displayedInterest,
      `When greater than maximum slider value, Expected interest ${expected.interest}, got ${displayedInterest}`
    ).toBeCloseTo(expected.interest, 2);

    expect(
      displayedTotal,
      `When greater than maximum slider value, Expected total ${expected.total}, got ${displayedTotal}`
    ).toBeCloseTo(expected.total, 2);

    // 5. AC-04: Enforce that neither value contains long precision trails
    // Multiplying by 100 and checking for integers guarantees 2 decimal spots maximum
    expect(Number.isInteger(displayedInterest * 100), `Interest "${displayedInterest}" has more than 2 decimal places`).toBeTruthy();
    expect(Number.isInteger(displayedTotal * 100), `Total "${displayedTotal}" has more than 2 decimal places`).toBeTruthy();
});


test('AC-08: Not selecting interest rate shows an error and blocks calculation', async ({ loginPage, envConfig }) => {
  const calculatorPage = await loginPage.login(envConfig.email, envConfig.password);
  await calculatorPage.setPrincipalAmount(5000);
  await calculatorPage.selectDuration('Yearly');
  await calculatorPage.acceptConsent();
  
  const alertMessage = await calculatorPage.clickCalculateExpectingAlert();
  expect(alertMessage).toBe('Please fill in all fields.');
});

test('AC-09: Not selecting duration shows an error and blocks calculation', async ({ loginPage, envConfig }) => {

  const calculatorPage = await loginPage.login(envConfig.email, envConfig.password);
  await calculatorPage.setPrincipalAmount(5000);
  await calculatorPage.selectInterestRate('5%');
  await calculatorPage.acceptConsent();

  const alertMessage = await calculatorPage.clickCalculateExpectingAlert();
  expect(alertMessage).toBe('Please fill in all fields.');
});

test('AC-10: Not checking consent shows an error and blocks calculation', async ({ loginPage, envConfig }) => {

  const calculatorPage = await loginPage.login(envConfig.email, envConfig.password);
  
  calculatorPage.setPrincipalAmount(5000);
  await calculatorPage.selectInterestRate('5%');
  await calculatorPage.selectDuration('Yearly');

  const alertMessage = await calculatorPage.clickCalculateExpectingAlert();
  expect(alertMessage).toBe('Please fill in all fields.');
}
);
});
