---
phase: 03-type-safety-code-quality
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - client/components/GradientBackground.tsx
  - client/components/LoadingSkeleton.tsx
  - client/components/ReflectionProgress.tsx
autonomous: true

must_haves:
  truths:
    - "Zero `any` types in GradientBackground.tsx"
    - "Zero `any` types in LoadingSkeleton.tsx"
    - "Zero `any` types in ReflectionProgress.tsx"
    - "All props properly typed with interfaces"
    - "TypeScript strict mode passes for these files"
  artifacts:
    - path: "client/components/GradientBackground.tsx"
      provides: "Type-safe gradient component"
      contains: "interface.*Props"
    - path: "client/components/LoadingSkeleton.tsx"
      provides: "Type-safe loading component"
      contains: "interface.*Props"
    - path: "client/components/ReflectionProgress.tsx"
      provides: "Type-safe progress component"
      contains: "interface.*Props"
  key_links:
    - from: "component props"
      to: "TypeScript interfaces"
      via: "explicit type definitions"
      pattern: "interface.*Props"
---

<objective>
Replace all `any` types in GradientBackground.tsx, LoadingSkeleton.tsx, and ReflectionProgress.tsx with proper TypeScript types.

Purpose: Eliminate type safety gaps in UI components to prevent runtime errors and improve developer experience.

Output: Three fully type-safe React Native components with zero `any` types and proper interface definitions.
</objective>

<context>
@.planning/ROADMAP.md
@client/components/GradientBackground.tsx
@client/components/LoadingSkeleton.tsx
@client/components/ReflectionProgress.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace `any` types in GradientBackground.tsx</name>
  <files>client/components/GradientBackground.tsx</files>
  <action>
1. Read the file to identify all `any` types
2. Create proper interfaces for component props
3. Replace `any` with specific types

Expected changes:

```typescript
// Add proper interface for props
interface GradientBackgroundProps {
  children: React.ReactNode;
  colors?: string[];
  style?: ViewStyle;
}

// Replace any function parameters with proper types
const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  colors = ['#667eea', '#764ba2'],
  style
}) => {
  // Replace any style types
  const containerStyle: ViewStyle = {
    flex: 1,
    ...style,
  };

  return (
    <LinearGradient
      colors={colors}
      style={containerStyle}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
};
```

Import required types at top of file:
```typescript
import { ViewStyle } from 'react-native';
```
  </action>
  <verify>
- No `any` types remain in file
- TypeScript compilation passes: `npx tsc --noEmit`
- Component still renders correctly
  </verify>
  <done>GradientBackground.tsx is fully type-safe with zero `any` types</done>
</task>

<task type="auto">
  <name>Task 2: Replace `any` types in LoadingSkeleton.tsx</name>
  <files>client/components/LoadingSkeleton.tsx</files>
  <action>
1. Read the file to identify all `any` types
2. Create proper interfaces for component props
3. Replace `any` with specific types

Expected changes:

```typescript
import { ViewStyle, TextStyle } from 'react-native';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'text' | 'circular' | 'rectangular';
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  variant = 'rectangular',
}) => {
  const skeletonStyle: ViewStyle = {
    width,
    height,
    borderRadius: variant === 'circular' ? 999 : borderRadius,
    backgroundColor: '#E1E9EE',
    ...style,
  };

  return (
    <Animated.View style={[skeletonStyle, animatedStyle]}>
      {/* skeleton content */}
    </Animated.View>
  );
};
```

If there are animation-related `any` types, replace with:
```typescript
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  SharedValue
} from 'react-native-reanimated';

const opacity: SharedValue<number> = useSharedValue(0.3);
```
  </action>
  <verify>
- No `any` types remain in file
- TypeScript compilation passes: `npx tsc --noEmit`
- Skeleton animation still works correctly
  </verify>
  <done>LoadingSkeleton.tsx is fully type-safe with zero `any` types</done>
</task>

<task type="auto">
  <name>Task 3: Replace `any` types in ReflectionProgress.tsx</name>
  <files>client/components/ReflectionProgress.tsx</files>
  <action>
1. Read the file to identify all `any` types
2. Create proper interfaces for component props and data structures
3. Replace `any` with specific types

Expected changes:

```typescript
import { ViewStyle, TextStyle } from 'react-native';

interface Reflection {
  id: string;
  emotionalState: string;
  distortions: string[];
  createdAt: string;
  thought: string;
  reframe: string;
}

interface ProgressData {
  totalSessions: number;
  emotionalTrends: Record<string, number>;
  commonDistortions: string[];
  weeklyProgress: number[];
}

interface ReflectionProgressProps {
  reflections: Reflection[];
  style?: ViewStyle;
  onPress?: () => void;
}

const ReflectionProgress: React.FC<ReflectionProgressProps> = ({
  reflections,
  style,
  onPress,
}) => {
  const progressData: ProgressData = calculateProgress(reflections);

  const containerStyle: ViewStyle = {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    ...style,
  };

  return (
    <View style={containerStyle}>
      {/* progress visualization */}
    </View>
  );
};

// Helper function with proper typing
const calculateProgress = (reflections: Reflection[]): ProgressData => {
  return {
    totalSessions: reflections.length,
    emotionalTrends: {},
    commonDistortions: [],
    weeklyProgress: [],
  };
};
```
  </action>
  <verify>
- No `any` types remain in file
- TypeScript compilation passes: `npx tsc --noEmit`
- Progress visualization still displays correctly
  </verify>
  <done>ReflectionProgress.tsx is fully type-safe with zero `any` types</done>
</task>

<task type="auto">
  <name>Task 4: Verify TypeScript compilation and run tests</name>
  <files>client/components/*.tsx</files>
  <action>
1. Run TypeScript type check:
   ```bash
   npx tsc --noEmit
   ```

2. Run component tests if they exist:
   ```bash
   npm test -- --testPathPattern=components
   ```

3. Build the project to ensure no runtime issues:
   ```bash
   npm run build
   ```

4. Verify no regression in component rendering by checking that:
   - All three components compile without errors
   - No new type errors introduced
   - Existing tests still pass
  </action>
  <verify>
- TypeScript compilation passes with zero errors
- All component tests pass
- Build succeeds without errors
  </verify>
  <done>All three components verified as type-safe with zero `any` types</done>
</task>

</tasks>

<verification>
1. Search for `any` in all three files - should return zero results
2. Run `npx tsc --noEmit` - should pass with zero errors
3. Run `npm test` - all tests should pass
4. Confirm each file has proper interface definitions for props
5. Verify imports include necessary types (ViewStyle, TextStyle, etc.)
</verification>

<success_criteria>
1. GradientBackground.tsx has zero `any` types
2. LoadingSkeleton.tsx has zero `any` types
3. ReflectionProgress.tsx has zero `any` types
4. All components have proper TypeScript interfaces for props
5. ViewStyle and TextStyle properly imported and used
6. TypeScript compilation passes in strict mode
7. All existing tests still pass
8. No runtime errors introduced
9. Code committed with clear commit message referencing TYPE-01, TYPE-02, TYPE-03
</success_criteria>

<output>
After completion, create `.planning/phases/03-type-safety-code-quality/01-SUMMARY.md`
</output>
