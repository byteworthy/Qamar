# Coding Conventions

## Overview

This document defines the coding standards, patterns, and conventions used in the Noor CBT codebase, a React Native/Expo frontend with an Express backend. The project emphasizes type safety, functional components, and clear architectural separation.

---

## 1. Code Style & Tooling

### TypeScript Strict Mode

All files use TypeScript with strict mode enabled (`"strict": true` in `tsconfig.json`).

**Configuration** (`C:\Dev\Noor-CBT\tsconfig.json`):
```json
{
  "extends": "expo/tsconfig.base.json",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "paths": {
      "@/*": ["./client/*"],
      "@shared/*": ["./shared/*"]
    },
    "types": ["node"]
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": [
    "node_modules",
    "build",
    "dist",
    "archive",
    "scripts",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/__tests__/**",
    "jest.config.*.js"
  ]
}
```

### ESLint Configuration

Uses Expo's ESLint configuration with Prettier integration.

**Configuration** (`C:\Dev\Noor-CBT\eslint.config.js`):
```javascript
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = defineConfig([
  {
    ignores: [
      "dist/**",
      "build/**",
      "static-build/**",
      "server_dist/**",
      ".agents/**",
      ".claude/**",
      ".gemini/**",
      ".opencode/**",
      "anthropic-cookbook/**",
      "archive/**",
      "node_modules/**",
    ],
  },
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    rules: {
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },
]);
```

### Prettier Configuration

Minimal configuration with `endOfLine: "auto"` for cross-platform compatibility.

**File** (`C:\Dev\Noor-CBT\.prettierrc`):
```json
{
  "endOfLine": "auto"
}
```

### Lint Commands

- `npm run lint` - Check for linting issues
- `npm run lint:fix` - Automatically fix linting issues
- `npm run check:format` - Verify code formatting
- `npm run format` - Auto-format all files

---

## 2. Naming Conventions

### File Naming

| Category | Pattern | Example |
|----------|---------|---------|
| React Components | PascalCase.tsx | `Button.tsx`, `HomeScreen.tsx` |
| TypeScript/JavaScript | camelCase.ts | `query-client.ts`, `haptics.ts` |
| Screens | PascalCase + Screen suffix | `ThoughtCaptureScreen.tsx` |
| Hooks | use + PascalCase | `useTheme.ts`, `useNotifications.ts` |
| Constants | SCREAMING_SNAKE_CASE (values) | `theme.ts`, `brand.ts` |
| Test files | *.test.{ts,tsx} in `__tests__` | `Button.test.tsx` |

### Component Naming

All components use PascalCase and are typically functional components.

**Example** (`C:\Dev\Noor-CBT\client\components\Button.tsx`):
```typescript
export function Button({
  onPress,
  children,
  style,
  disabled = false,
  variant = "primary",
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  // Component logic
}
```

### Hook Naming

All hooks follow the `use` + PascalCase convention.

**Example** (`C:\Dev\Noor-CBT\client\hooks\useTheme.ts`):
```typescript
export function useTheme(): { theme: Theme; isDark: boolean } {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = Colors[colorScheme ?? "light"];

  return {
    theme,
    isDark,
  };
}
```

### Function/Variable Naming

- **Functions**: camelCase
- **Constants**: UPPER_CASE for config values
- **State variables**: camelCase
- **Event handlers**: handle + PascalCase (e.g., `handlePressIn`, `handlePressOut`)

**Example** (`C:\Dev\Noor-CBT\client\components\Button.tsx`):
```typescript
const handlePressIn = () => {
  if (!disabled) {
    scale.value = withSpring(0.97, springConfig);
    hapticMedium();
  }
};

const handlePressOut = () => {
  if (!disabled) {
    scale.value = withSpring(1, springConfig);
  }
};
```

### Type/Interface Naming

All types and interfaces use PascalCase.

**Example** (`C:\Dev\Noor-CBT\client\lib\api.ts`):
```typescript
export interface CrisisResource {
  name: string;
  contact: string;
  description: string;
}

export interface AnalysisResult {
  distortions: string[];
  happening: string;
  pattern: string[];
  matters: string;
  crisis?: boolean;
  level?: "emergency" | "urgent" | "concern";
  resources?: CrisisData;
}
```

---

## 3. Component Patterns

### Functional Components with Hooks

All components are functional components using React hooks. Class components are only used for Error Boundaries (required for React error handling).

**Pattern** (`C:\Dev\Noor-CBT\client\components\Button.tsx`):
```typescript
interface ButtonProps {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Button({
  onPress,
  children,
  style,
  disabled = false,
  variant = "primary",
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Handler functions
  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.97, springConfig);
      hapticMedium();
    }
  };

  return (
    <AnimatedPressable
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      style={[styles.button, animatedStyle]}
    >
      <ThemedText>{children}</ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
});
```

### Hook Usage

Hooks follow React best practices:
- Hooks are called at the top level
- Custom hooks encapsulate reusable logic
- No conditional hook calls

**Pattern** (`C:\Dev\Noor-CBT\client\screens\HomeScreen.tsx`):
```typescript
export function HomeScreen() {
  const [userName, setUserName] = useState<string>("");
  const [journeyStats, setJourneyStats] = useState<JourneyStats>(initialStats);
  const { theme } = useTheme();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { data: billingStatus } = useQuery({
    queryKey: ["billingStatus"],
    queryFn: getBillingStatus,
  });

  useEffect(() => {
    // Initialize component
  }, []);

  return (
    // Component JSX
  );
}
```

### Props Interface Pattern

All components have a dedicated `Props` interface, placed at the component level or exported.

**Pattern**:
```typescript
interface ButtonProps {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Button(props: ButtonProps) {
  // Implementation
}
```

### Error Boundary Implementation

Error Boundary is a class component (required by React) that catches rendering errors.

**Example** (`C:\Dev\Noor-CBT\client\components\ErrorBoundary.tsx`):
```typescript
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }): void {
    if (typeof this.props.onError === "function") {
      this.props.onError(error, info.componentStack);
    }
  }

  resetError = (): void => {
    this.setState({ error: null });
  };

  render() {
    const { FallbackComponent } = this.props;
    return this.state.error && FallbackComponent ? (
      <FallbackComponent
        error={this.state.error}
        resetError={this.resetError}
      />
    ) : (
      this.props.children
    );
  }
}
```

### Styled Components Pattern

All styling uses React Native's `StyleSheet.create()` with TypeScript.

**Pattern** (`C:\Dev\Noor-CBT\client\components\Button.tsx`):
```typescript
const styles = StyleSheet.create({
  button: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  buttonText: {
    fontWeight: "600",
  },
});
```

---

## 4. Import Patterns

### Path Aliases

The project uses TypeScript path aliases defined in `tsconfig.json`:

```typescript
// Instead of:
import { Button } from "../../components/Button";

// Use:
import { Button } from "@/components/Button";
import { someUtil } from "@shared/utils";
```

### Import Organization

Imports are organized in the following order:

1. External libraries (React, React Native, third-party)
2. Absolute imports using aliases (`@/`, `@shared/`)
3. Relative imports (if necessary)
4. Type imports

**Example** (`C:\Dev\Noor-CBT\client\screens\HomeScreen.tsx`):
```typescript
import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { useTheme } from "@/hooks/useTheme";
import { Fonts, NiyyahColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Brand } from "@/constants/brand";
import { getBillingStatus, isPaidStatus } from "@/lib/billing";
```

### Type Imports

Type imports are explicitly marked with `type` keyword:

**Pattern** (`C:\Dev\Noor-CBT\server\middleware\auth.ts`):
```typescript
import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { db } from "../db";
```

---

## 5. Error Handling

### Server-Side Error Handling

Express middleware includes error handling with typed error checks.

**Pattern** (`C:\Dev\Noor-CBT\server\index.ts`):
```typescript
/**
 * HTTP Error with optional status code
 */
interface HTTPError extends Error {
  status?: number;
  statusCode?: number;
}

/**
 * Type guard to check if error is HTTPError
 */
function isHTTPError(error: unknown): error is HTTPError {
  return (
    error instanceof Error &&
    (typeof (error as HTTPError).status === "number" ||
      typeof (error as HTTPError).statusCode === "number" ||
      error instanceof Error)
  );
}
```

### Client-Side Error Handling

Uses Error Boundary for rendering errors and try-catch for API calls.

**Pattern**:
```typescript
try {
  const response = await apiRequest.get("/api/endpoint");
  setData(response.data);
} catch (error) {
  console.error("Error fetching data:", error);
  setError(error instanceof Error ? error.message : "Unknown error");
}
```

### Validation Mode Errors

The codebase includes a VALIDATION_MODE pattern for development/testing without external services.

**Example** (`C:\Dev\Noor-CBT\server\config.ts`):
```typescript
export const VALIDATION_MODE =
  process.env.VALIDATION_MODE === "true" || process.env.NODE_ENV === "test";

export function getValidationModeAnalyzeResponse(): {
  distortions: string[];
  happening: string;
  pattern: string[];
  matters: string;
} {
  return {
    distortions: ["Emotional reasoning"],
    happening:
      "[VALIDATION MODE] This is a placeholder response. Configure ANTHROPIC_API_KEY for real analysis.",
    pattern: [
      "This would identify cognitive patterns in your thought.",
      "Real responses require Claude API configuration.",
    ],
    matters:
      "In production, this section provides grounded Islamic perspective on your situation.",
  };
}
```

---

## 6. Type Definitions & Zod Schemas

### Database Schema with Drizzle

Database tables are defined using Drizzle ORM with TypeScript inference.

**Example** (`C:\Dev\Noor-CBT\shared\schema.ts`):
```typescript
import { z } from "zod";
import {
  pgTable,
  text,
  timestamp,
  serial,
  jsonb,
  integer,
  index,
  foreignKey,
} from "drizzle-orm/pg-core";

export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    thought: text("thought").notNull(),
    distortions: jsonb("distortions").notNull().$type<string[]>(),
    reframe: text("reframe").notNull(),
    intention: text("intention").notNull(),
    practice: text("practice").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "sessions_user_fk",
    }).onDelete("cascade"),
    userIdIdx: index("sessions_user_id_idx").on(table.userId),
    createdAtIdx: index("sessions_created_at_idx").on(table.createdAt),
  }),
);

// Inferred types from table schema
export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;
```

### Zod Validation Schemas

Runtime validation is performed using Zod, with types inferred from schemas.

**Example** (`C:\Dev\Noor-CBT\shared\schema.ts`):
```typescript
export const sessionSchema = z.object({
  thought: z.string(),
  distortions: z.array(z.string()),
  reframe: z.string(),
  intention: z.string(),
  practice: z.string(),
  timestamp: z.number(),
});

export type SessionLocal = z.infer<typeof sessionSchema>;
```

### API Request Types

API request/response types are defined as TypeScript interfaces with documentation.

**Example** (`C:\Dev\Noor-CBT\client\lib\api.ts`):
```typescript
// =============================================================================
// ANALYSIS TYPES
// =============================================================================

export interface AnalysisResult {
  distortions: string[];
  happening: string;
  pattern: string[];
  matters: string;
  crisis?: boolean;
  level?: "emergency" | "urgent" | "concern";
  resources?: CrisisData;
}

export interface AnalyzeParams {
  thought: string;
  emotionalIntensity?: number; // 1-5 scale from emotional anchoring
  somaticAwareness?: string; // Body sensation from somatic prompt
}

// =============================================================================
// REFRAME TYPES
// =============================================================================

export interface ReframeResult {
  beliefTested: string;
  perspective: string;
  nextStep: string;
  anchors: string[];
}

export interface ReframeParams {
  thought: string;
  distortions: string[];
  analysis: string;
  emotionalIntensity?: number;
  emotionalState?: string;
}
```

---

## 7. Code Documentation

### Comments

- Use `//` for inline comments
- Use `/** */` for JSDoc style documentation on functions and types
- Include section headers with `// =============================================================================`

**Example** (`C:\Dev\Noor-CBT\server\middleware\auth.ts`):
```typescript
/**
 * Type guard to check if error is HTTPError
 */
function isHTTPError(error: unknown): error is HTTPError {
  return (
    error instanceof Error &&
    (typeof (error as HTTPError).status === "number" ||
      typeof (error as HTTPError).statusCode === "number" ||
      error instanceof Error)
  );
}

/**
 * Update session email (encrypted before storage)
 */
export async function updateSessionEmail(
  token: string,
  email: string,
): Promise<void> {
  const encryptedEmail = encryptData(email);
  await db
    .update(userSessions)
    .set({ email: encryptedEmail })
    .where(eq(userSessions.token, token));
}
```

### Accessibility

All interactive components include accessibility attributes.

**Pattern** (`C:\Dev\Noor-CBT\client\components\Button.tsx`):
```typescript
<AnimatedPressable
  onPress={disabled ? undefined : onPress}
  onPressIn={handlePressIn}
  onPressOut={handlePressOut}
  disabled={disabled}
  accessibilityRole="button"
  accessibilityLabel={getAccessibilityLabel()}
  accessibilityHint={accessibilityHint}
  accessibilityState={{ disabled }}
  style={[styles.button, animatedStyle]}
>
  <ThemedText>{children}</ThemedText>
</AnimatedPressable>
```

---

## 8. Async/Promises

### Promise Handling

All async operations use `async/await` syntax.

**Pattern**:
```typescript
export async function sessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const signedToken = req.cookies?.[SESSION_COOKIE_NAME];

    if (signedToken) {
      const token = verifySignedToken(signedToken);
      if (token) {
        const [session] = await db
          .select()
          .from(userSessions)
          .where(eq(userSessions.token, token));

        if (session && new Date(session.expiresAt) > new Date()) {
          req.auth = {
            userId: session.userId,
            email: decryptedEmail,
            sessionToken: token,
          };
          return next();
        }
      }
    }
  } catch (error) {
    console.error("[AUTH] Session middleware error:", error);
  }
}
```

### React Query Integration

Data fetching uses React Query for caching, synchronization, and state management.

**Pattern** (`C:\Dev\Noor-CBT\client\screens\HomeScreen.tsx`):
```typescript
const { data: billingStatus } = useQuery({
  queryKey: ["billingStatus"],
  queryFn: getBillingStatus,
});
```

---

## 9. Configuration & Constants

### Environment Variables

Configuration is centralized in config files with validation.

**Example** (`C:\Dev\Noor-CBT\server\config.ts`):
```typescript
export const config = {
  // Server
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // Anthropic Claude
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,

  // Encryption
  encryptionKey: process.env.ENCRYPTION_KEY,

  // Replit
  replitDomains: process.env.REPLIT_DOMAINS,
  replitDevDomain: process.env.REPLIT_DEV_DOMAIN,
};
```

### Theme Constants

Theme and design tokens are centralized in constant files.

**Files**:
- `C:\Dev\Noor-CBT\client\constants\theme.ts` - Color and spacing tokens
- `C:\Dev\Noor-CBT\client\constants\brand.ts` - Brand constants
- `C:\Dev\Noor-CBT\client\constants\layout.ts` - Layout constants

**Usage**:
```typescript
import { Fonts, NiyyahColors } from "@/constants/theme";
import { Brand } from "@/constants/brand";
```

---

## 10. Key Principles

1. **Type Safety**: TypeScript strict mode, no implicit any
2. **Functional Components**: Use hooks for all React components (except Error Boundaries)
3. **Accessibility First**: All interactive elements include ARIA attributes
4. **Clear Naming**: Descriptive names for files, functions, and variables
5. **Single Responsibility**: Each function/component has one clear purpose
6. **Error Handling**: Explicit error handling with type guards
7. **Documentation**: JSDoc comments on public APIs and complex logic
8. **Configuration**: Centralized, environment-aware configuration
9. **Testing**: Patterns support unit and E2E testing
10. **Security**: Encryption for sensitive data, input validation, CSRF protection

---

## Summary

The Noor CBT codebase follows modern React/React Native conventions with emphasis on:
- **Type Safety**: Strict TypeScript throughout
- **Functional Programming**: Hooks-based architecture
- **Clear Organization**: Path aliases, organized imports, structured directories
- **Accessibility**: Built-in ARIA support for components
- **Testing**: Patterns designed for Jest and Detox testing
- **Security**: Validation modes, encryption, and strict error handling
