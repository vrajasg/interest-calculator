import { Duration } from 'src/types/Duration';

export const MAX_PRINCIPAL = 15_000;
export const MAX_INTEREST_RATE_PERCENT = 15;

export function calculateExpectedInterest(
  principal: number,
  ratePercent: number,
  duration: Duration,
  value: number = 1
): { interest: number; total: number } {
  
  const periodMap: Record<Duration, number> = {
    Yearly:  value,
    Monthly: value / 12,
    Daily:   value / 365, 
  };

  const interest = Math.round(principal * (ratePercent / 100) * periodMap[duration] * 100) / 100;
  const total    = Math.round((principal + interest) * 100) / 100;

  return { interest, total };
}

/** Shared calculation scenarios used in parameterised tests */
export const CALCULATION_SCENARIOS: Array<{
  description: string;
  principal: number;
  rate: string;
  ratePercent: number;
  duration: Duration;
}> = [
  {
    description: 'AC-01: Yearly calculation',
    principal: 5000,
    rate: '5%',
    ratePercent: 5,
    duration: 'Yearly' as Duration,
  },
  {
    description: 'AC-02: Monthly calculation',
    principal: 5000,
    rate: '5%',
    ratePercent: 5,
    duration: 'Monthly' as Duration,
  },
  {
    description: 'AC-03: Daily calculation',
    principal: 5000,
    rate: '5%',
    ratePercent: 5,
    duration: 'Daily' as Duration,
  },
  {
    description: 'AC-04: Rounding — rate that produces many decimals',
    principal: 1000,
    rate: '7%',
    ratePercent: 7,
    duration: 'Yearly' as Duration,
  },
  {
    description: 'AC-05: Maximum rate 15% accepted — Yearly',
    principal: 10000,
    rate: '15%',
    ratePercent: 15,
    duration: 'Yearly' as Duration,
  },
];
