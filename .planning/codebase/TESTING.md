# Testing Strategy & Patterns

## Overview

The Noor CBT codebase uses a multi-layered testing approach:
- **Unit Tests**: Jest with React Testing Library for components and utilities
- **Integration Tests**: Jest for server routes and API integration
- **E2E Tests**: Detox for full application workflows on iOS and Android
- **Coverage Targets**: 70% threshold for branches, functions, lines, and statements

---

## 1. Testing Frameworks

### Jest

Jest is the primary testing framework for both client and server.

**Configuration Files**:
- **Server Tests**: `C:\Dev\Noor-CBT\jest.config.js`
- **Client Tests**: `C:\Dev\Noor-CBT\jest.config.mobile.js`

### Jest Server Configuration

**File**: `C:\Dev\Noor-CBT\jest.config.js`

```javascript
/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/server"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverageFrom: [
    "server/**/*.ts",
    "!server/**/*.test.ts",
    "!server/__tests__/**",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: {
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },
};
```

**Features**:
- TypeScript support via `ts-jest`
- Node.js test environment
- Automatic code coverage collection
- Excludes test files from coverage reports

### Jest Mobile Configuration

**File**: `C:\Dev\Noor-CBT\jest.config.mobile.js`

```javascript
/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  testEnvironment: "node",
  roots: ["<rootDir>/client"],
  testMatch: ["**/__tests__/**/*.test.{ts,tsx,js,jsx}"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Transform settings for React Native
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],

  // Module name mapping for absolute imports
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },

  // Setup files
  setupFilesAfterEnv: [
    "@testing-library/jest-native/extend-expect",
    "<rootDir>/client/__tests__/setup.ts",
  ],

  // Coverage settings
  collectCoverageFrom: [
    "client/**/*.{ts,tsx}",
    "!client/**/*.test.{ts,tsx}",
    "!client/__tests__/**",
    "!client/index.js",
    "!client/**/*.d.ts",
  ],

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Globals
  globals: {
    "ts-jest": {
      tsconfig: {
        jsx: "react",
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    },
  },
};
```

**Features**:
- `jest-expo` preset for React Native/Expo support
- Configured transform ignore patterns for third-party React Native libraries
- `@testing-library/jest-native` for component testing
- 70% coverage threshold enforcement
- Path alias mapping for imports

### React Testing Library

React Testing Library is used for component unit tests with React Native semantics.

**Capabilities**:
- Query elements by text, role, and accessibility hints
- Fire user events (tap, press, type)
- Test accessibility props and states
- Mock and assert component behavior

---

## 2. Test File Organization & Structure

### Directory Structure

```
client/
├── components/
│   ├── Button.tsx
│   ├── ThemedText.tsx
│   └── __tests__/
│       ├── Button.test.tsx
│       ├── ThemedText.test.tsx
│       └── Screen.test.tsx
├── screens/
│   ├── HomeScreen.tsx
│   ├── ThoughtCaptureScreen.tsx
│   └── __tests__/
│       ├── HomeScreen.test.tsx
│       ├── DistortionScreen.test.tsx
│       ├── ReframeScreen.test.tsx
│       ├── PricingScreen.test.tsx
│       ├── SessionCompleteScreen.test.tsx
│       └── ThoughtCaptureScreen.test.tsx
└── __tests__/
    └── setup.ts

server/
├── __tests__/
│   ├── safety-system.test.ts
│   └── e2e-journey.test.ts
├── middleware/
├── routes.ts
└── config.ts

e2e/
├── setup.js
├── jest.config.js
├── reflectionFlow.test.js
├── navigation.test.js
└── subscription.test.js
```

### Test File Naming

All test files follow the pattern `*.test.{ts,tsx,js}` and are located in `__tests__` directories adjacent to the code being tested.

**Pattern**:
```
Source:  client/components/Button.tsx
Test:    client/components/__tests__/Button.test.tsx

Source:  server/routes.ts
Test:    server/__tests__/routes.test.ts
```

---

## 3. Test Setup & Configuration

### Client Test Setup

**File**: `C:\Dev\Noor-CBT\client\__tests__\setup.ts`

The setup file configures mocks for React Native modules and third-party libraries before tests run.

**Mocks Included**:

#### AsyncStorage Mock
```typescript
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
```

#### React Native Reanimated Mock
```typescript
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});
```

#### Expo Modules Mocks
```typescript
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy",
  },
}));

jest.mock("expo-linking", () => ({
  openURL: jest.fn(() => Promise.resolve()),
  createURL: jest.fn((path) => `exp://localhost/${path}`),
}));

jest.mock("expo-constants", () => ({
  expoConfig: {
    extra: {
      privacyPolicyUrl: "https://example.com/privacy",
      termsOfServiceUrl: "https://example.com/terms",
      supportEmail: "support@example.com",
    },
  },
}));
```

#### React Navigation Mock
```typescript
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
    useFocusEffect: jest.fn(),
  };
});
```

#### React Query Mock
```typescript
jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useQuery: jest.fn(() => ({
    data: undefined,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
  })),
}));
```

#### Safe Area Context Mock
```typescript
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
}));
```

#### React Native IAP Mock
```typescript
jest.mock("react-native-iap", () => ({
  initConnection: jest.fn(() => Promise.resolve(true)),
  endConnection: jest.fn(() => Promise.resolve()),
  getProducts: jest.fn(() => Promise.resolve([])),
  requestPurchase: jest.fn(() => Promise.resolve({ transactionId: "test" })),
  finishTransaction: jest.fn(() => Promise.resolve()),
  purchaseUpdatedListener: jest.fn(),
  purchaseErrorListener: jest.fn(),
}));
```

#### Keyboard Controller Mock
```typescript
jest.mock("react-native-keyboard-controller", () => ({
  KeyboardAwareScrollView: require("react-native").ScrollView,
  KeyboardProvider: ({ children }: any) => children,
  KeyboardController: {
    setInputMode: jest.fn(),
    setDefaultMode: jest.fn(),
  },
}));
```

#### Component Mocks
```typescript
jest.mock("@/components/ReflectionProgress", () => ({
  ReflectionProgressCompact: () => null,
}));

jest.mock("@/components/ExitConfirmationModal", () => ({
  ExitConfirmationModal: () => null,
}));
```

#### Console Management
```typescript
beforeAll(() => {
  console.warn = jest.fn((...args) => {
    const message = args[0];
    if (
      typeof message === "string" &&
      (message.includes("Animated:") ||
        message.includes("VirtualizedLists") ||
        message.includes("componentWillReceiveProps"))
    ) {
      return;
    }
    originalWarn(...args);
  });

  console.error = jest.fn((...args) => {
    const message = args[0];
    if (
      typeof message === "string" &&
      (message.includes("Warning: ReactDOM.render") ||
        message.includes("Not implemented: HTMLFormElement"))
    ) {
      return;
    }
    originalError(...args);
  });
});
```

#### Global Settings
```typescript
jest.setTimeout(10000); // 10 second timeout for async operations
```

---

## 4. Unit Test Examples

### Component Test Pattern

**File**: `C:\Dev\Noor-CBT\client\components\__tests__\Button.test.tsx`

```typescript
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { Button } from "../Button";

describe("Button Component", () => {
  it("should render button with text", () => {
    render(<Button onPress={jest.fn()}>Click Me</Button>);

    expect(screen.getByText("Click Me")).toBeTruthy();
  });

  it("should call onPress when pressed", () => {
    const mockOnPress = jest.fn();

    render(<Button onPress={mockOnPress}>Press Me</Button>);

    const button = screen.getByText("Press Me");
    fireEvent.press(button);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it("should not call onPress when disabled", () => {
    const mockOnPress = jest.fn();

    render(
      <Button onPress={mockOnPress} disabled>
        Disabled Button
      </Button>,
    );

    const button = screen.getByText("Disabled Button");
    fireEvent.press(button);

    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it("should apply custom styles", () => {
    const customStyle = { backgroundColor: "red" };

    render(
      <Button onPress={jest.fn()} style={customStyle}>
        Styled Button
      </Button>,
    );

    const button = screen.getByText("Styled Button");
    expect(button).toBeTruthy();
  });

  it("should render with secondary variant", () => {
    render(
      <Button onPress={jest.fn()} variant="secondary">
        Secondary Button
      </Button>,
    );

    expect(screen.getByText("Secondary Button")).toBeTruthy();
  });

  it("should have accessibility role of button", () => {
    render(<Button onPress={jest.fn()}>Accessible Button</Button>);

    const button = screen.getByText("Accessible Button");
    expect(button).toBeTruthy();
  });

  it("should support accessibility hints", () => {
    render(
      <Button onPress={jest.fn()} accessibilityHint="This performs an action">
        Button with Hint
      </Button>,
    );

    const button = screen.getByA11yHint("This performs an action");
    expect(button).toBeTruthy();
  });
});
```

**Test Patterns**:
1. **Describe blocks**: Group related tests by component feature
2. **Clear test names**: `should [expected behavior]`
3. **Arrange-Act-Assert**: Setup → Interaction → Verification
4. **Mocking**: Mock callbacks with `jest.fn()`
5. **Accessibility**: Test a11y attributes (roles, hints, labels)

### Server Integration Test Pattern

**File**: `C:\Dev\Noor-CBT\server\__tests__\safety-system.test.ts`

```typescript
import { describe, test, expect } from "@jest/globals";
import {
  detectCrisis,
  detectScrupulosity,
  validateTheologicalSafety,
  validateAIOutput,
  type CrisisDetectionResult,
} from "../ai-safety";
import { CharterCompliance, validateOutput } from "../charter-compliance";
import {
  checkToneCompliance,
  isToneCompliant,
} from "../tone-compliance-checker";

describe("Crisis Detection System", () => {
  describe("Emergency Level Detection", () => {
    const emergencyInputs = [
      "I want to die",
      "I want to kill myself",
      "I'm going to end my life",
      "everyone would be better off without me and I want to die",
      "I can't take it anymore, I want to kill myself",
    ];

    test.each(emergencyInputs)('detects emergency crisis: "%s"', (input) => {
      const result = detectCrisis(input);

      expect(result.detected).toBe(true);
      expect(result.level).toBe("emergency");
      expect(result.requiresHumanReview).toBe(true);
      expect(result.indicators.length).toBeGreaterThan(0);
    });

    test("emergency crisis requires immediate action", () => {
      const result = detectCrisis("I want to end my life");

      expect(result.recommendedAction).toContain("crisis resources");
      expect(result.recommendedAction).toContain("immediately");
    });
  });

  describe("Urgent Level Detection", () => {
    const urgentInputs = [
      "there's no hope for me",
      "everyone would be better without me",
      "i've given up",
      "what's the point of living",
      "I can't do this anymore",
    ];

    test.each(urgentInputs)('detects urgent crisis: "%s"', (input) => {
      const result = detectCrisis(input);

      expect(result.detected).toBe(true);
      expect(result.level).toBe("urgent");
      expect(result.requiresHumanReview).toBe(true);
    });
  });

  describe("Concern Level Detection", () => {
    const concernInputs = [
      "I feel completely hopeless",
      "I'm utterly worthless",
      "I'll never be good enough",
      "Allah hates me",
      "I'm beyond redemption",
    ];

    test.each(concernInputs)('detects concerning language: "%s"', (input) => {
      const result = detectCrisis(input);

      expect(result.detected).toBe(true);
      expect(result.level).toBe("concern");
      expect(result.requiresHumanReview).toBe(false);
    });
  });

  describe("No Crisis Detection", () => {
    const safeInputs = [
      "I'm feeling anxious about my exam",
      "I struggle with prayer consistency",
      "I feel overwhelmed by my responsibilities",
      "I worry about the future",
    ];

    test.each(safeInputs)('no crisis detected: "%s"', (input) => {
      const result = detectCrisis(input);
      expect(result.detected).toBe(false);
    });
  });
});
```

**Test Patterns**:
1. **Test suites**: Organized with `describe()` blocks
2. **Parameterized tests**: `test.each()` for multiple inputs
3. **Clear expectations**: Specific assertions for behavior
4. **Domain-specific**: Tests business logic (crisis detection, compliance)
5. **Documentation**: Comments explain test categories

---

## 5. Mocking Patterns

### Function Mocking

```typescript
const mockCallback = jest.fn();
const mockCallback = jest.fn().mockReturnValue(true);
const mockCallback = jest.fn().mockResolvedValue({ data: "test" });
const mockCallback = jest.fn().mockRejectedValue(new Error("test error"));
```

### Module Mocking

```typescript
jest.mock("@/lib/api", () => ({
  getBillingStatus: jest.fn(() =>
    Promise.resolve({ status: "active", tier: "pro" }),
  ),
}));
```

### Partial Module Mocking

```typescript
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
  };
});
```

### Mock Assertions

```typescript
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith("argument");
expect(mockFn).toHaveBeenCalledTimes(1);
expect(mockFn).toHaveBeenLastCalledWith("argument");
expect(mockFn).not.toHaveBeenCalled();
```

---

## 6. E2E Testing with Detox

### Detox Configuration

Detox is used for end-to-end testing on iOS and Android simulators.

**E2E Test Setup**: `C:\Dev\Noor-CBT\e2e\setup.js`

```javascript
beforeAll(async () => {
  await device.launchApp({
    newInstance: true,
    permissions: {
      notifications: 'YES',
    },
  });
});

beforeEach(async () => {
  await device.reloadReactNative();
});

afterAll(async () => {
  await device.terminateApp();
});
```

### E2E Test Example

**File**: `C:\Dev\Noor-CBT\e2e\reflectionFlow.test.js`

```javascript
describe('Reflection Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Thought Capture', () => {
    it('should complete thought capture flow', async () => {
      // Wait for home screen to load
      await waitFor(element(by.text('Begin Reflection')))
        .toBeVisible()
        .withTimeout(5000);

      // Tap begin reflection button
      await element(by.text('Begin Reflection')).tap();

      // Wait for thought capture screen
      await waitFor(element(by.text("What's Weighing on Your Heart?")))
        .toBeVisible()
        .withTimeout(3000);

      // Enter a thought
      await element(by.id('thought-input')).typeText(
        'I am worried about my upcoming presentation at work'
      );

      // Select emotional intensity
      await element(by.id('intensity-3')).tap();

      // Tap continue
      await element(by.text('Continue')).tap();

      // Should navigate to distortion analysis screen
      await waitFor(element(by.text('Continue')))
        .toBeVisible()
        .withTimeout(30000);
    });

    it('should not allow empty thoughts', async () => {
      await element(by.text('Begin Reflection')).tap();

      const continueButton = element(by.text('Continue'));
      await expect(continueButton).toBeVisible();

      await element(by.id('thought-input')).typeText('Short');

      await expect(element(by.id('thought-input'))).toHaveText('Short');
    });

    it('should allow selecting different emotional intensities', async () => {
      await element(by.text('Begin Reflection')).tap();

      await element(by.id('intensity-1')).tap();
      await element(by.id('intensity-3')).tap();
      await element(by.id('intensity-5')).tap();

      await expect(element(by.id('intensity-5'))).toBeVisible();
    });
  });
});
```

**Test Patterns**:
1. **Device lifecycle**: `beforeAll()`, `beforeEach()`, `afterAll()`
2. **Element selection**: `by.text()`, `by.id()`, `by.type()`
3. **Waitfor conditions**: `.toBeVisible()`, `.withTimeout()`
4. **User interactions**: `.tap()`, `.typeText()`, `.swipe()`
5. **Assertions**: `.expect()` with conditions

### Detox Commands

```bash
# Build E2E app
npm run build:e2e:ios      # iOS debug build
npm run build:e2e:android  # Android debug build

# Run E2E tests
npm run test:e2e:ios       # Run on iOS simulator
npm run test:e2e:android   # Run on Android emulator

# Release builds
npm run build:e2e:ios:release
npm run test:e2e:ios:release
```

---

## 7. Coverage Status

### Coverage Configuration

**Mobile Jest Config** (`C:\Dev\Noor-CBT\jest.config.mobile.js`):

```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
},

collectCoverageFrom: [
  "client/**/*.{ts,tsx}",
  "!client/**/*.test.{ts,tsx}",
  "!client/__tests__/**",
  "!client/index.js",
  "!client/**/*.d.ts",
],
```

### Coverage Goals

- **Branches**: 70% - Decision points in conditionals
- **Functions**: 70% - Exported functions are tested
- **Lines**: 70% - Code lines executed
- **Statements**: 70% - Individual statements executed

### Generating Coverage Reports

```bash
# Client coverage
npm run test:client -- --coverage

# Server coverage
npm run test:server -- --coverage

# Coverage reports generated in:
# coverage/
# ├── index.html        # HTML coverage report
# ├── lcov-report/      # Detailed per-file reports
# └── coverage-summary.json
```

---

## 8. Testing Commands

### Run All Tests

```bash
npm run verify           # TypeCheck + all tests (local)
npm run verify:local    # Same as verify
npm run release:check   # Types + lint + tests (CI equivalent)
```

### Run Specific Test Suites

```bash
npm test                    # Default: server tests
npm run test:server         # Server tests
npm run test:client         # Client/mobile tests
npm run test:watch          # Watch mode for development
```

### E2E Testing

```bash
# iOS
npm run build:e2e:ios       # Build test app
npm run test:e2e:ios        # Run on simulator

# Android
npm run build:e2e:android   # Build test app
npm run test:e2e:android    # Run on emulator

# Release builds
npm run build:e2e:ios:release
npm run test:e2e:ios:release
```

---

## 9. Test Naming Conventions

### Test Suite Names

```typescript
describe("Component Name", () => {
  describe("Feature or Behavior Group", () => {
    test("should [specific behavior]", () => {
      // Test code
    });
  });
});
```

**Examples**:
```typescript
describe("Button Component", () => {
  describe("Press Behavior", () => {
    test("should call onPress when pressed", () => {
      // Test
    });
  });

  describe("Accessibility", () => {
    test("should have accessibility role of button", () => {
      // Test
    });
  });
});
```

### Test Naming Pattern

- Start with `should` for clarity
- Be specific about expected behavior
- Include context about preconditions

**Good Names**:
- ✅ `should call onPress when button is pressed`
- ✅ `should not call onPress when disabled`
- ✅ `should render error message when API fails`

**Bad Names**:
- ❌ `test button`
- ❌ `works correctly`
- ❌ `api test`

---

## 10. Best Practices

### Unit Testing

1. **One assertion per test** (or related assertions)
2. **Test behavior, not implementation**
3. **Use descriptive test names**
4. **Mock external dependencies**
5. **Test edge cases and error conditions**

### Integration Testing

1. **Test complete workflows**
2. **Verify data persistence**
3. **Test API contracts**
4. **Validate error handling**

### E2E Testing

1. **Focus on critical user journeys**
2. **Use meaningful wait times**
3. **Test across platforms (iOS/Android)**
4. **Avoid brittle selectors** (prefer IDs over text)
5. **Clean up state between tests**

### Coverage

1. **Aim for 70%+ coverage**
2. **Prioritize testing public APIs**
3. **Test error paths and edge cases**
4. **Don't chase 100% coverage blindly**

---

## Summary

The Noor CBT testing strategy provides:

| Layer | Framework | Files | Focus |
|-------|-----------|-------|-------|
| **Unit** | Jest + React Testing Library | `__tests__/*.test.tsx` | Components, utilities, logic |
| **Integration** | Jest | `server/__tests__/*.test.ts` | Routes, API, business logic |
| **E2E** | Detox | `e2e/*.test.js` | User workflows, cross-platform |
| **Coverage** | Jest | Reports | 70% threshold enforcement |

**Key Files**:
- `jest.config.js` - Server test configuration
- `jest.config.mobile.js` - Client test configuration
- `client/__tests__/setup.ts` - Test environment setup
- `e2e/setup.js` - E2E test setup
- `e2e/*.test.js` - End-to-end test suites

This multi-layered approach ensures code quality, prevents regressions, and validates complete user journeys.
