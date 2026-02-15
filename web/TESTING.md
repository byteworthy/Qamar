# Testing Guide for Noor Web App

This document describes the testing infrastructure and best practices for the Noor web application.

## Test Stack

- **Unit Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright
- **Test Environment**: jsdom for unit tests, real browsers for E2E

## Directory Structure

```
web/
├── __tests__/
│   ├── e2e/                    # Playwright E2E tests
│   │   ├── landing-page.spec.ts
│   │   ├── login-flow.spec.ts
│   │   └── navigation.spec.ts
│   ├── unit/                   # Vitest unit tests
│   │   ├── api-client.test.ts
│   │   └── theme.test.ts
│   └── setup.ts                # Test setup file
├── playwright.config.ts        # Playwright configuration
└── vitest.config.ts           # Vitest configuration
```

## Running Tests

### Unit Tests

Run all unit tests with Vitest:

```bash
npm run test
```

Run unit tests once (CI mode):

```bash
npm run test:unit
```

Run with coverage:

```bash
npm run test:coverage
```

### E2E Tests

Run Playwright E2E tests (requires dev server running):

```bash
npm run test:e2e
```

Run in headed mode (see browser):

```bash
npx playwright test --headed
```

Run specific test file:

```bash
npx playwright test landing-page.spec.ts
```

Run in debug mode:

```bash
npx playwright test --debug
```

## Test Organization

### Unit Tests

Located in `__tests__/unit/`, these test individual functions and modules in isolation.

**Example: Testing API Client**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeThought } from '@/lib/api';

global.fetch = vi.fn();

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should include credentials in request', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ distortions: [] })
    });

    await analyzeThought('test thought');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/analyze'),
      expect.objectContaining({
        credentials: 'include'
      })
    );
  });
});
```

### E2E Tests

Located in `__tests__/e2e/`, these test complete user flows in real browsers.

**Example: Testing Landing Page**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display Noor branding', async ({ page }) => {
    await page.goto('/');

    const heading = page.locator('h1').first();
    await expect(heading).toContainText('Clarity');

    const fontFamily = await heading.evaluate(el =>
      window.getComputedStyle(el).fontFamily
    );
    expect(fontFamily.toLowerCase()).toContain('cormorant');
  });
});
```

## Writing New Tests

### Best Practices

1. **Use Semantic Locators**: Prefer `getByRole`, `getByText` over CSS selectors
2. **Test User Behavior**: Test what users see and do, not implementation details
3. **Clean Test Data**: Use `beforeEach` to reset state between tests
4. **Descriptive Names**: Test names should clearly describe what they verify
5. **Deterministic Tests**: Avoid random data or timing issues

### Unit Test Template

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { functionToTest } from '@/lib/module';

describe('Module Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  describe('functionToTest', () => {
    it('should do expected behavior', () => {
      const result = functionToTest('input');
      expect(result).toBe('expected output');
    });

    it('should handle edge cases', () => {
      expect(() => functionToTest(null)).toThrow();
    });
  });
});
```

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should complete user flow', async ({ page }) => {
    await page.goto('/path');

    // Interact with page
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');

    // Assert results
    await expect(page).toHaveURL(/\/success/);
    await expect(page.locator('h1')).toContainText('Success');
  });

  test('should handle errors gracefully', async ({ page }) => {
    await page.goto('/path');

    // Test error case
    await page.fill('input', 'invalid');
    await page.click('button');

    // Assert error shown
    await expect(page.locator('.error')).toBeVisible();
  });
});
```

## CI Integration

Tests run automatically on GitHub Actions:

```yaml
- name: Run unit tests
  run: npm run test:unit

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
```

## Testing Checklist

Before submitting a PR, ensure:

- [ ] All unit tests pass (`npm run test:unit`)
- [ ] All E2E tests pass (`npm run test:e2e`)
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] Code coverage maintained or improved
- [ ] New features have corresponding tests
- [ ] Tests are deterministic (no flaky tests)

## Test Coverage

Current coverage targets:

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

View coverage report:

```bash
npm run test:coverage
```

## Debugging Tests

### Vitest

Use `test.only` to run a single test:

```typescript
test.only('should focus on this test', () => {
  // test code
});
```

Use `console.log` or `vi.spyOn` to debug:

```typescript
it('should debug', () => {
  const spy = vi.spyOn(console, 'log');
  functionToTest();
  expect(spy).toHaveBeenCalled();
});
```

### Playwright

Use `--debug` flag to step through tests:

```bash
npx playwright test --debug landing-page.spec.ts
```

Take screenshots for debugging:

```typescript
await page.screenshot({ path: 'debug.png' });
```

Pause execution:

```typescript
await page.pause();
```

## Common Issues

### Issue: Playwright browser not found

**Solution**: Install browsers:

```bash
npx playwright install chromium
```

### Issue: Tests timeout

**Solution**: Increase timeout in config or test:

```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // test code
});
```

### Issue: Vitest can't find module

**Solution**: Check `vitest.config.ts` aliases match `tsconfig.json`:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './'),
  },
}
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Best Practices](https://testing-library.com/docs/queries/about/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## Contact

For questions about testing:
- Review this guide
- Check existing test examples
- Ask in team chat

---

**Last Updated**: 2026-02-11
**Maintained By**: QA & Testing Specialist
