# Interest Calculator — Automation Suite

Playwright + TypeScript automation suite for the web-based Interest Calculator.

---
## Prerequisites

| Software | Minimum Version          | Check                             |
|----------|--------------------------|---------------------------------- |
| Node.js  | 18.x                     | `node --version`                  |
| npm      | 9.x                      | `npm --version`                   |
| Chromium | installed via Playwright | `npx playwright install chromium` |

> Node.js 18 is the minimum required by `@playwright/test@1.44+`. Node.js 20 LTS is recommended.

## Quick Start

### 1. Install dependencies

```bash
npm install
npx playwright install chromium
```

### 2. Environment configuration

Create a `.env` file in the project root (same level as `package.json`):

```env
# Target URL
TEST_BASE_URL=http://paste.application.url.here

# Test user credentials
TEST_EMAIL="name@example.com"
TEST_PASSWORD="SuperSecretPassword123"
```

> **Security:** `.env` contains sensitive credentials and must never be committed to version control. It is listed in `.gitignore`.

### 3. Run tests

```bash
npm test                                 # full suite
npx playwright test tests/unit           # unit tests only
npx playwright test tests/e2e            # e2e tests only
npx playwright show-report reports/html  # open HTML report
```

---

## Test Coverage

| AC    | Description                                              | Approach           | Test Result  |
|-------|----------------------------------------------------------|--------------------|--------------|
| AC-01 | Yearly interest calculation                              | Parameterised      | Passed       |  
| AC-02 | Monthly interest calculation                             | Parameterised      | Failed - Bug |
| AC-03 | Daily calculation (ACs stated Weekly)                    | Parameterised      | Passed       |
| AC-04 | Results rounded to 2 decimal places                      | Inline in AC-01–03 | Passed       |
| AC-05 | Rate dropdown options ≤ 15%, 15% accepted                | Dedicated test     | Failed - Bug |
| AC-06 | All fields required — calculation blocked if any missing | Dedicated test     | Passed       |
| AC-07 | Principal slider max 15,000, accepts 15,000              | Two tests          | Passed       |
| AC-08 | No rate selected → blocked                               | Dedicated test     | Passed       |
| AC-09 | No duration selected → blocked                           | Dedicated test     | Failed - Bug |
| AC-10 | Consent unchecked → blocked                              | Dedicated test     | Failed - Bug |

AC-01–05 share `CALCULATION_SCENARIOS` in `testData.ts` — adding a new scenario is one entry in that file.

---

## Architecture Decisions
```
Test
  ↓  what to verify (all expect() calls live here only)
Page
  ↓  how to do it (actions, navigation)
Locators
  ↓  where things are (selectors, HTTP transport)
Playwright
  ↓
Application
```

**Test → Page → Locators** — each layer has one responsibility:
- `expect()` never appears inside a page or locator class — tests own all assertions
- Locators use Playwright's recommended semantic selectors (`getByRole`, `getByLabel`) with ID-based selectors only as a last resort
- Slider value is set programmatically via `evaluate()` — drag interactions are brittle and platform-dependent, and test the same underlying state less reliably

---

## Assumptions

- **Simple interest assumed** — the ACs or requriments do not specify the formula. So assumed a simple interest calculation, otherwise update `calculateExpectedInterest()` in `testData.ts` and the fixed-value unit test assertions accordingly.
- **Daily used instead of Weekly** — tests cover Daily duration as shown in the real application; ACs referenced Weekly which does not exist in the UI. Also, for expected results calculation, 365 days is considered and it's same for leap and non-leap years. 
---

## Bugs Found

| # | Findings                                                                                                    |
|---|-------------------------------------------------------------------------------------------------------------|
| 1 | **AC-05 13% missing** from the interest rate dropdown — list jumps from 12% to 14%                          |
| 2 | **Weekly vs Daily mismatch** — ACs reference Weekly duration but the app only offers Daily, Monthly, Yearly |
| 3 | **AC-06 validation behaviour** — ACs describe inline field errors; the app shows a browser `alert()` dialog instead. Requirements do not mention alert behaviour |
| 4 | **AC-09 Duration always defaults to Daily** — there is no way to leave duration unselected, making the mandatory field validation for duration untestable as written |
| 5 | **AC-10 Consent not enforced** — the consent checkbox is not mandatory; calculation proceeds without it, contradicting the AC (also requirements) |
| 6 | Monthly calculation is incorrect |