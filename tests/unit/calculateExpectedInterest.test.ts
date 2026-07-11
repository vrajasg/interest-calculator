import { test, expect } from '@playwright/test';
import { calculateExpectedInterest, CALCULATION_SCENARIOS } from '../testData/testData';

test.describe('calculateExpectedInterest', () => {

  for (const scenario of CALCULATION_SCENARIOS) {
    test(scenario.description, () => {
      const { interest, total } = calculateExpectedInterest(
        scenario.principal,
        scenario.ratePercent,
        scenario.duration
      );

      expect(isNaN(interest), `Interest should not be NaN for: ${scenario.description}`).toBe(false);

      expect(total, `Total should equal principal + interest for: ${scenario.description}`)
        .toBeCloseTo(scenario.principal + interest, 2);

      const interestDecimals = (interest.toString().split('.')[1] ?? '').length;
      const totalDecimals    = (total.toString().split('.')[1] ?? '').length;

      expect(interestDecimals, `Interest should have at most 2 decimal places`).toBeLessThanOrEqual(2);
      expect(totalDecimals, `Total should have at most 2 decimal places`).toBeLessThanOrEqual(2);
    });
  }

  test('Yearly: 1000 at 10% for 1 year = 100 interest, 1100 total', () => {
    const { interest, total } = calculateExpectedInterest(1000, 10, 'Yearly');
    expect(interest).toBe(100);
    expect(total).toBe(1100);
  });

  test('Monthly: 1200 at 12% for 1 month = 12 interest, 1212 total', () => {
    const { interest, total } = calculateExpectedInterest(1200, 12, 'Monthly');
    expect(interest).toBe(12);
    expect(total).toBe(1212);
  });

  test('Daily: 5200 at 10% for 1 day = 1.42 interest, 5201.42 total', () => {
    const { interest, total } = calculateExpectedInterest(5200, 10, 'Daily');
    expect(interest).toBe(1.42);
    expect(total).toBe(5201.42);
  });

  test('Zero principal returns zero interest and zero total', () => {
    const { interest, total } = calculateExpectedInterest(0, 5, 'Yearly');
    expect(interest).toBe(0);
    expect(total).toBe(0);
  });

  test('Maximum rate 15% — 10000 Yearly = 1500 interest', () => {
    const { interest, total } = calculateExpectedInterest(10000, 15, 'Yearly');
    expect(interest).toBe(1500);
    expect(total).toBe(11500);
  });

  test('Maximum principal 15000 at 15% Yearly = 2250 interest, 17250 total', () => {
    const { interest, total } = calculateExpectedInterest(15000, 15, 'Yearly');
    expect(interest).toBe(2250);
    expect(total).toBe(17250);
  });
});