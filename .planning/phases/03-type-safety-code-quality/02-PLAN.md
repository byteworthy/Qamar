---
phase: 03-type-safety-code-quality
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - client/screens/SessionCompleteScreen.tsx
  - client/components/ScreenErrorBoundary.tsx
autonomous: true

must_haves:
  truths:
    - "Zero `any` types in SessionCompleteScreen.tsx"
    - "All @ts-expect-error comments removed from ScreenErrorBoundary.tsx"
    - "Navigation types properly configured"
    - "TypeScript strict mode passes for both files"
  artifacts:
    - path: "client/screens/SessionCompleteScreen.tsx"
      provides: "Type-safe session complete screen"
      contains: "interface.*Props"
    - path: "client/components/ScreenErrorBoundary.tsx"
      provides: "Type-safe error boundary with navigation"
      contains: "NavigationProp"
  key_links:
    - from: "screen components"
      to: "navigation stack"
      via: "proper navigation types"
      pattern: "NavigationProp|RouteProp"
---

<objective>
Replace `any` types in SessionCompleteScreen.tsx and fix navigation type errors in ScreenErrorBoundary.tsx.

Purpose: Eliminate remaining type safety issues in screen components and establish proper navigation typing patterns.

Output: Two fully type-safe screen components with proper navigation types and zero suppressions.
</objective>

<context>
@.planning/ROADMAP.md
@client/screens/SessionCompleteScreen.tsx
@client/components/ScreenErrorBoundary.tsx
@client/navigation/RootStackNavigator.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace `any` types in SessionCompleteScreen.tsx</name>
  <files>client/screens/SessionCompleteScreen.tsx</files>
  <action>
1. Read the file to identify all `any` types
2. Define proper navigation and route types
3. Create interfaces for all data structures
4. Replace `any` with specific types

Expected changes:

```typescript
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ViewStyle, TextStyle } from 'react-native';

// Define navigation stack param list
type RootStackParamList = {
  SessionComplete: {
    reflectionId: string;
    emotionalState: string;
    distortions: string[];
    reframe: string;
    intention: string;
  };
  Home: undefined;
  History: undefined;
};

type SessionCompleteNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SessionComplete'
>;

type SessionCompleteRouteProp = RouteProp<
  RootStackParamList,
  'SessionComplete'
>;

interface SessionCompleteScreenProps {
  navigation: SessionCompleteNavigationProp;
  route: SessionCompleteRouteProp;
}

interface CompletionData {
  reflectionId: string;
  emotionalState: string;
  distortions: string[];
  reframe: string;
  intention: string;
  completedAt: string;
}

const SessionCompleteScreen: React.FC<SessionCompleteScreenProps> = ({
  navigation,
  route,
}) => {
  const { reflectionId, emotionalState, distortions, reframe, intention } = route.params;

  const handleContinue = (): void => {
    navigation.navigate('Home');
  };

  const handleViewHistory = (): void => {
    navigation.navigate('History');
  };

  const completionData: CompletionData = {
    reflectionId,
    emotionalState,
    distortions,
    reframe,
    intention,
    completedAt: new Date().toISOString(),
  };

  return (
    <View style={styles.container}>
      {/* component JSX */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  } as ViewStyle,
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  } as TextStyle,
});
```
  </action>
  <verify>
- No `any` types remain in file
- Navigation types properly imported and used
- TypeScript compilation passes: `npx tsc --noEmit`
- Screen still navigates correctly
  </verify>
  <done>SessionCompleteScreen.tsx is fully type-safe with zero `any` types</done>
</task>

<task type="auto">
  <name>Task 2: Fix navigation type errors in ScreenErrorBoundary.tsx</name>
  <files>client/components/ScreenErrorBoundary.tsx</files>
  <action>
1. Read the file to identify all @ts-expect-error comments
2. Define proper navigation types for error boundary
3. Remove all @ts-expect-error suppressions
4. Implement proper type-safe navigation

Expected changes:

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Button, ViewStyle } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

interface ErrorBoundaryProps {
  children: ReactNode;
  navigation?: NavigationProp<ParamListBase>;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ScreenErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    // Log to error reporting service
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  handleGoHome = (): void => {
    const { navigation } = this.props;
    if (navigation) {
      this.handleReset();
      // Type-safe navigation call
      navigation.navigate('Home' as never);
    }
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      if (fallback) {
        return fallback(error, this.handleReset);
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{error.message}</Text>
          <Button title="Try Again" onPress={this.handleReset} />
          <Button title="Go Home" onPress={this.handleGoHome} />
        </View>
      );
    }

    return children;
  }
}

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  } as ViewStyle,
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
};

export default ScreenErrorBoundary;
```

Note: The `as never` cast for navigation.navigate is a known workaround for React Navigation type limitations when the exact navigation type is not available. This is preferable to @ts-expect-error and is documented in the code.

Alternative approach if we can access the root navigation type:

```typescript
import { RootStackParamList } from '../navigation/types';

interface ErrorBoundaryProps {
  children: ReactNode;
  navigation?: NavigationProp<RootStackParamList>;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

// Then navigate without cast
navigation.navigate('Home');
```
  </action>
  <verify>
- No @ts-expect-error comments remain in file
- TypeScript compilation passes: `npx tsc --noEmit`
- Error boundary still catches and displays errors correctly
- Navigation from error screen works
  </verify>
  <done>ScreenErrorBoundary.tsx has proper navigation types with zero suppressions</done>
</task>

<task type="auto">
  <name>Task 3: Create shared navigation types file</name>
  <files>client/navigation/types.ts</files>
  <action>
Create a centralized navigation types file to be used across all screens:

```typescript
// client/navigation/types.ts
export type RootStackParamList = {
  // Onboarding
  Welcome: undefined;
  Privacy: undefined;
  Safety: undefined;

  // Main tabs
  Home: undefined;
  Explore: undefined;
  History: undefined;
  Profile: undefined;

  // Session flow
  ThoughtCapture: undefined;
  Distortion: {
    thought: string;
    emotionalState: string;
  };
  Reframe: {
    thought: string;
    emotionalState: string;
    distortions: string[];
  };
  Intention: {
    thought: string;
    reframe: string;
    emotionalState: string;
  };
  SessionComplete: {
    reflectionId: string;
    emotionalState: string;
    distortions: string[];
    reframe: string;
    intention: string;
  };

  // Other screens
  CalmingPractice: {
    emotionalState: string;
    intensity: number;
  };
  BeliefInspection: {
    reflectionId: string;
  };
  Regulation: {
    emotionalState: string;
  };
  Dua: {
    context?: string;
  };
  Insights: undefined;
  Pricing: undefined;
  BillingSuccess: {
    sessionId: string;
  };
};

// Export common navigation prop types
export type RootStackNavigationProp<T extends keyof RootStackParamList> =
  import('@react-navigation/native-stack').NativeStackNavigationProp<
    RootStackParamList,
    T
  >;

export type RootStackRouteProp<T extends keyof RootStackParamList> =
  import('@react-navigation/native').RouteProp<RootStackParamList, T>;
```

Then update SessionCompleteScreen.tsx and ScreenErrorBoundary.tsx to import from this file:

```typescript
import { RootStackNavigationProp, RootStackRouteProp, RootStackParamList } from '../navigation/types';
```
  </action>
  <verify>
- Navigation types file created
- Both screen files import from centralized types
- TypeScript compilation passes
- No type errors related to navigation
  </verify>
  <done>Centralized navigation types established and used across screens</done>
</task>

<task type="auto">
  <name>Task 4: Verify TypeScript compilation and test navigation</name>
  <files>client/screens/*.tsx, client/components/*.tsx</files>
  <action>
1. Run TypeScript type check:
   ```bash
   npx tsc --noEmit
   ```

2. Search for remaining suppressions:
   ```bash
   grep -r "@ts-expect-error" client/
   grep -r "@ts-ignore" client/
   grep -r "any" client/screens/SessionCompleteScreen.tsx
   ```

3. Run tests:
   ```bash
   npm test -- --testPathPattern="SessionCompleteScreen|ScreenErrorBoundary"
   ```

4. Verify navigation works correctly by checking:
   - SessionCompleteScreen navigates to Home and History
   - ScreenErrorBoundary can navigate to Home from error state
  </action>
  <verify>
- Zero @ts-expect-error comments in production code
- Zero `any` types in SessionCompleteScreen.tsx
- TypeScript compilation passes
- All tests pass
- Navigation works correctly
  </verify>
  <done>Both screens verified as type-safe with proper navigation types</done>
</task>

</tasks>

<verification>
1. Search for `any` in SessionCompleteScreen.tsx - should return zero results
2. Search for @ts-expect-error in ScreenErrorBoundary.tsx - should return zero results
3. Run `npx tsc --noEmit` - should pass with zero errors
4. Confirm client/navigation/types.ts exists with comprehensive param list
5. Verify both files import and use proper navigation types
</verification>

<success_criteria>
1. SessionCompleteScreen.tsx has zero `any` types
2. ScreenErrorBoundary.tsx has zero @ts-expect-error suppressions
3. Centralized navigation types file created (client/navigation/types.ts)
4. All navigation calls are type-safe
5. TypeScript compilation passes in strict mode
6. All existing tests still pass
7. Navigation works correctly in both components
8. Code committed with clear commit message referencing TYPE-04, TYPE-05
</success_criteria>

<output>
After completion, create `.planning/phases/03-type-safety-code-quality/02-SUMMARY.md`
</output>
