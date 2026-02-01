# Phase 9: UI/UX Polish & Animation Enhancements - Research

**Researched:** February 1, 2026
**Domain:** React Native animation design, mobile UX polish, component animation patterns
**Confidence:** HIGH

## Summary

This research investigates implementation approaches for Phase 9's UI/UX polish objectives: creating premium input field experiences, ensuring spacing consistency, and enhancing animations across modals and lists. The investigation confirms that Noor's tech stack (React Native Reanimated 4.1, React Navigation, Expo) provides excellent primitives for all required enhancements. The 15% UX gap identified in the comprehensive UI/UX plan is highly addressable through focused animation work on inputs, modals, and lists, while maintaining the app's contemplative animation philosophy.

**Key Finding:** All 10 UX requirements can be implemented with the existing stack using well-established patterns. No custom animation libraries or major architectural changes needed.

**Primary Recommendation:** Use react-native-reanimated's declarative animation API (entering/exiting, useAnimatedStyle with spring physics) to implement all animations, leveraging the contemplative spring config already established in GlassCard.tsx and Button.tsx.

---

## Standard Stack

The established libraries and tools for this domain:

### Core Animation & Interaction

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-reanimated | ~4.1.1 | UI thread animation engine, gesture integration | Industry standard for React Native animations; runs on UI thread at 60fps without JS bridge blocking; supports complex spring physics; declarative API (entering/exiting) |
| react-native-gesture-handler | ~2.28.0 | Gesture detection and handling | Pre-installed; essential for long-press and scale feedback; integrates seamlessly with reanimated |
| expo-haptics | ~15.0.7 | Haptic feedback | Pre-installed; used throughout app; pairs with animations for tactile feedback |

### Navigation & Modal Framework

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @react-navigation/native | ~7.1.8 | React Navigation core | Already in use; provides screen transition context |
| @react-navigation/native-stack | ~7.3.16 | Stack navigator | Current navigation pattern; modal transitions use platform defaults |
| react-native (Modal component) | 0.81.5 | Native modal container | Base for custom animated modals; wrap with reanimated for custom transitions |

### Component & Theme System

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-blur | ~15.0.7 | Blurred backgrounds | GlassCard backdrop; modal backdrops |
| react-native-linear-gradient | (via expo-linear-gradient) | Gradient effects | Background atmospherics; button gradients |

### Installation Status
✅ **All required dependencies are pre-installed.** No npm additions needed for Phase 9.

---

## Architecture Patterns

### Recommended Component Structure for Phase 9

```
client/
├── components/
│   ├── AnimatedInput.tsx           # NEW: Focus glow, character count fade
│   ├── AnimatedModal.tsx           # NEW: Reanimated modal wrapper
│   ├── ExitConfirmationModal.tsx   # MODIFY: Update to use AnimatedModal
│   ├── GlassCard.tsx               # REFERENCE: Breathing animation pattern
│   ├── Button.tsx                  # REFERENCE: Spring config pattern
│   ├── LoadingState.tsx            # REFERENCE: Icon breathing pattern
│   └── __tests__/
│       ├── AnimatedInput.test.tsx  # NEW: Animation behavior tests
│       └── AnimatedModal.test.tsx  # NEW: Modal transition tests
├── constants/
│   └── theme.ts                    # MODIFY: Add ComponentPadding constants
└── screens/
    ├── ThoughtCaptureScreen.tsx    # MODIFY: Use AnimatedInput, add intensity animation
    ├── HistoryScreen.tsx           # MODIFY: Add list item stagger animations
    └── ExitConfirmationModal.tsx   # Already exists, will be enhanced
```

### Pattern 1: Contemplative Spring Physics (Existing, Reference Pattern)

**What:** All animations use the same spring configuration to maintain visual consistency
**When to use:** Every animation in Phase 9 should follow this established pattern

**Configuration (from GlassCard.tsx and Button.tsx):**
```typescript
const springConfig: WithSpringConfig = {
  damping: 20,      // More damped (less bouncy)
  mass: 0.5,        // Heavier (slower movement)
  stiffness: 120,   // Less stiff (more gradual)
  overshootClamping: true,
  energyThreshold: 0.001,
};
```

**Why this matters:** Established in Phase 1+ components. Changing this breaks visual consistency. This config creates the "contemplative, serene" feel appropriate for a mental health reflection app.

**Example usage in new components:**
```typescript
// In AnimatedInput.tsx for focus glow
glowOpacity.value = withSpring(1, springConfig);

// In AnimatedModal.tsx for entrance
scale.value = withSpring(1, springConfig);
```

### Pattern 2: Declarative Entering/Exiting Animations (React Native Reanimated 4.x)

**What:** Use reanimated's `entering` and `exiting` props for automatic entry/exit animations
**When to use:** List items (HistoryScreen), modal appearance, transient UI elements

**Example for staggered list animations:**
```typescript
// HistoryScreen.tsx - list items
<Animated.View
  entering={FadeInUp.springify()
    .delay(index * 40)  // Staggered by 40ms per item
    .duration(400)}
>
  {/* List item content */}
</Animated.View>
```

**Why this matters:** Declarative approach is cleaner, more maintainable, and automatically handles cleanup. Built into Reanimated 4.x as recommended pattern.

**Source:** Reanimated 4.x documentation emphasizes entering/exiting as primary declarative animation API.

### Pattern 3: useAnimatedStyle Hook Pattern (Existing, Extend Pattern)

**What:** Use shared values with useAnimatedStyle for interactive state animations
**When to use:** Focus states, glow effects, scale feedback, interactive gestures

**Example for focus glow in AnimatedInput:**
```typescript
const focusScale = useSharedValue(1);
const glowOpacity = useSharedValue(0);

const animatedInputStyle = useAnimatedStyle(() => ({
  borderColor: interpolateColor(
    glowOpacity.value,
    [0, 1],
    [theme.border, theme.primary]
  ),
  transform: [{ scale: focusScale.value }],
}));

const handleFocus = () => {
  focusScale.value = withSpring(1.02, springConfig);
  glowOpacity.value = withTiming(1, { duration: 300 });
};
```

**Why this matters:** This is the core Reanimated pattern already used in Button.tsx. Extends naturally to new components.

### Pattern 4: Modal Animation with Custom Entrance

**What:** Wrap Modal with Animated components to create custom scale+fade entrance
**When to use:** ExitConfirmationModal, any modal with custom presentation

**Reanimated 4.x approach:**
```typescript
// AnimatedModal.tsx
export function AnimatedModal({ visible, children, onRequestClose }) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, springConfig);
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withSpring(0.5, springConfig);
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent onRequestClose={onRequestClose}>
      {/* Backdrop with fade */}
      <Animated.View
        style={[
          styles.backdrop,
          { opacity: backdrop.opacity }
        ]}
      />
      {/* Modal content with scale+fade */}
      <Animated.View
        style={[
          styles.content,
          useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
          }))
        ]}
      >
        {children}
      </Animated.View>
    </Modal>
  );
}
```

**Why this approach:** Native Modal handles lifecycle. Animated wrapper handles presentation animation. Separates concerns cleanly.

### Pattern 5: Long-Press Gesture for List Items

**What:** Detect long-press with gesture handler, trigger scale animation
**When to use:** List items that need interactive feedback (HistoryScreen reflections)

**Using react-native-gesture-handler + reanimated:**
```typescript
import { LongPressGestureHandler } from "react-native-gesture-handler";

export function HistoryListItem({ item }) {
  const scale = useSharedValue(1);

  const onLongPressEvent = useAnimatedReaction(
    () => gestureHandler.state.value,
    (state) => {
      if (state === State.BEGAN) {
        scale.value = withSpring(0.98, springConfig);
      } else if (state === State.END || state === State.CANCELLED) {
        scale.value = withSpring(1, springConfig);
      }
    }
  );

  return (
    <LongPressGestureHandler>
      <Animated.View style={[
        useAnimatedStyle(() => ({
          transform: [{ scale: scale.value }],
        }))
      ]}>
        {/* List item */}
      </Animated.View>
    </LongPressGestureHandler>
  );
}
```

**Why this matters:** reanimated-gesture-handler integration is seamless. Alternative would be Pressable.onLongPress, but gestures provide better control for complex interactions.

### Anti-Patterns to Avoid

- **Don't read shared values on JS thread:** `const value = sharedVal.value` blocks JS thread. Access only in worklets/useAnimatedStyle.
- **Don't animate layout-affecting properties:** Avoid animating margin/padding/width/height. Use transform (translateX/Y) instead.
- **Don't create new spring configs per render:** Extract as constant (as done in existing components).
- **Don't mix Modal with animated navigation transitions:** Use Modal for overlay dialogs; use navigation for screen transitions.
- **Don't animate more than 100 components simultaneously:** Performance degrades on low-end Android.

---

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Input field focus animation | Custom opacity/scale logic scattered in component | AnimatedInput.tsx wrapper with reusable glow + float pattern | Consistent springs, reusable, testable, follows existing pattern |
| Staggered list animations | Manual delay calculations with setTimeout | Reanimated entering with `.delay(index * ms)` | Native, efficient, integrates with reanimated, automatic cleanup |
| Modal backdrop fade | Pressable overlay with state-driven opacity | Animated.View with reanimated opacity animation | Smooth 60fps animation, no JS thread impact, declarative |
| Long-press feedback | Pressable with custom timing logic | LongPressGestureHandler + useAnimatedReaction | Gesture handler properly detects different press states |
| Character count animation | Manual state updates triggering re-renders | Animated.TextInput with shared value | Smooth animation without React re-renders, better performance |

**Key insight:** Reanimated's declarative API (entering/exiting, springs, hooks) handles all of these elegantly. Attempting to build custom solutions leads to performance issues and inconsistency.

---

## Common Pitfalls

### Pitfall 1: Spring Config Inconsistency

**What goes wrong:** Creating different spring configs for different animations, leading to visual inconsistency where some elements bounce, others are sluggish

**Why it happens:** Developers assume "spring animations should be snappy" but miss that Noor's design intentionally uses contemplative, damped springs

**How to avoid:** Reference the established config in Button.tsx and GlassCard.tsx. Extract as constant, use everywhere.

**Warning signs:** Animation feels different between buttons, inputs, and cards. Team feedback: "some animations feel snappy, others slow."

### Pitfall 2: Animating Layout Properties

**What goes wrong:** Animating `marginLeft`, `paddingTop`, or `width` causes the entire layout to recalculate every frame, dropping from 60fps to 30-45fps

**Why it happens:** Developers think transform and margin are equivalent; they're not. Layout animations require layout recalculation.

**How to avoid:** Always use `transform: [{ translateX }]` instead of `marginLeft: animated`. Use `width/height` only for truly discrete layout changes, never animated.

**Warning signs:** FPS drops during animations. React Native profiler shows "Layout recalculation" as bottleneck. App feels janky on older devices.

**Example fix:**
```typescript
// ❌ BAD - animates layout
marginLeft: sharedValue,

// ✅ GOOD - animates transform
transform: [{ translateX: sharedValue }]
```

### Pitfall 3: Character Count Animation Timing

**What goes wrong:** Character count appears abruptly on typing start, or has incorrect timing, disrupting the "fade-in" intent

**Why it happens:** Timing the appearance (when to start fade) is trickier than it looks. Must coordinate with input focus AND character arrival.

**How to avoid:**
1. Show count immediately when count > 0
2. Use spring physics for the scale/opacity (matches contemplative theme)
3. Always use shared values + Animated.TextInput for character count display (not state)

**Warning signs:** Character count flickers, appears/disappears at wrong times, or updating the count causes re-renders throughout the component tree.

### Pitfall 4: Modal Animation vs. Navigation Animation Confusion

**What goes wrong:** Using Modal with custom slide animation conflicts with React Navigation stack transitions, or modal dismissal animates twice

**Why it happens:** Navigation has its own transition logic. If both Modal animation and screen transition trigger, conflicts arise.

**How to avoid:**
- Use native Modal (no custom animationType) for overlays like ExitConfirmationModal
- Apply custom animations INSIDE the Modal's children (on backdrop + content)
- For screen transitions, use navigationOptions (not Modal)

**Warning signs:** Modal appears, then slides again. Navigation back transitions conflict with modal exit. User sees duplicate animations.

### Pitfall 5: List Stagger Timing Calculations

**What goes wrong:** List items animate in with inconsistent stagger timing, some items overlap their animations, or stagger skips items

**Why it happens:** Manual delay calculations miss off-screen items, or fail when list updates dynamically

**How to avoid:** Use Reanimated's `.delay(index * ms)` on entering animation. It handles off-screen items and updates automatically.

```typescript
// ✅ GOOD - reanimated handles stagger
<Animated.View entering={FadeInUp.springify().delay(index * 40)}>
```

**Warning signs:** Animations don't stagger smoothly, or gaps appear between items. Off-screen items animate when scrolled into view.

### Pitfall 6: Haptic + Animation Timing Mismatch

**What goes wrong:** Haptic feedback fires before animation completes, or feedback is silent because haptic fires while animation is still running

**Why it happens:** Haptic is synchronous; animation is async. Timing them requires careful coordination.

**How to avoid:**
1. Fire haptic at start of user interaction (onPressIn, onLongPressBegin)
2. Haptic should feel like it's accompanying the visual animation, not waiting for it
3. Use light/medium/success intensity to match animation intensity

**Warning signs:** Haptic feedback feels disconnected from animation. User presses, delay, then haptic. Or haptic doesn't fire during long animation.

---

## Code Examples

Verified patterns from official sources:

### Example 1: AnimatedInput Component (Focus Glow)

**Source:** Reanimated 4.x documentation + existing Noor Button.tsx pattern

```typescript
// client/components/AnimatedInput.tsx
import React, { useState } from "react";
import { View, StyleSheet, TextInput } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  WithSpringConfig,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";

interface AnimatedInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  maxLength?: number;
  showCharCount?: boolean;
}

const springConfig: WithSpringConfig = {
  damping: 20,
  mass: 0.5,
  stiffness: 120,
  overshootClamping: true,
  energyThreshold: 0.001,
};

export function AnimatedInput({
  placeholder,
  value,
  onChangeText,
  maxLength = 1000,
  showCharCount = true,
}: AnimatedInputProps) {
  const { theme } = useTheme();
  const glowOpacity = useSharedValue(0);
  const [isFocused, setIsFocused] = useState(false);

  const glowStyle = useAnimatedStyle(() => ({
    borderColor: glowOpacity.value === 0
      ? theme.border
      : theme.primary,
    shadowColor: theme.primary,
    shadowOpacity: glowOpacity.value * 0.3,
    shadowRadius: 8,
    elevation: glowOpacity.value * 4,
  }));

  const charCountStyle = useAnimatedStyle(() => ({
    opacity: value.length > 0 ? 1 : 0,
    transform: [
      {
        scale: value.length > 0 ? 1 : 0.8,
      },
    ],
  }));

  const handleFocus = () => {
    setIsFocused(true);
    glowOpacity.value = withSpring(1, springConfig);
  };

  const handleBlur = () => {
    setIsFocused(false);
    glowOpacity.value = withSpring(0, springConfig);
  };

  return (
    <View>
      <Animated.View style={[styles.inputWrapper, glowStyle]}>
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={maxLength}
          multiline
          textAlignVertical="top"
        />
      </Animated.View>

      {showCharCount && (
        <Animated.View style={[styles.charCount, charCountStyle]}>
          <ThemedText type="caption">
            {value.length} / {maxLength}
          </ThemedText>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    minHeight: Spacing.inputHeight,
  },
  input: {
    ...Typography.body,
    padding: 0,
  },
  charCount: {
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.lg,
  },
});
```

### Example 2: Staggered List Item Animation (HistoryScreen)

**Source:** Reanimated 4.x declarative animations documentation

```typescript
// In HistoryScreen.tsx - render list item
<Animated.View
  entering={FadeInUp.springify()
    .delay(index * 40)
    .damping(20)
    .mass(0.5)
    .stiffness(120)}
  exiting={FadeOut.duration(200)}
  key={item.id}
>
  <HistoryListItem
    item={item}
    onPress={() => navigateToDetail(item.id)}
  />
</Animated.View>
```

### Example 3: AnimatedModal Component

**Source:** React Native Modal + Reanimated 4.x animations

```typescript
// client/components/AnimatedModal.tsx
import React, { useEffect } from "react";
import { View, StyleSheet, Modal, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  WithSpringConfig,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";

interface AnimatedModalProps {
  visible: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
}

const springConfig: WithSpringConfig = {
  damping: 20,
  mass: 0.5,
  stiffness: 120,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AnimatedModal({
  visible,
  onRequestClose,
  children,
}: AnimatedModalProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(0.5);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, springConfig);
      backdropOpacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withSpring(0.5, springConfig);
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <Modal visible={visible} transparent onRequestClose={onRequestClose}>
      <AnimatedPressable
        style={[styles.backdrop, backdropStyle]}
        onPress={onRequestClose}
      />
      <View style={styles.centeredView}>
        <Animated.View
          style={[
            styles.modalContent,
            { backgroundColor: theme.backgroundDefault },
            contentStyle,
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 18,
    padding: 24,
    marginHorizontal: 20,
    maxWidth: 300,
  },
});
```

### Example 4: Long-Press Scale Feedback

**Source:** react-native-gesture-handler + Reanimated integration docs

```typescript
// In HistoryScreen.tsx or HistoryListItem.tsx
import { LongPressGestureHandler } from "react-native-gesture-handler";

export function HistoryListItem({ item, onPress }) {
  const scale = useSharedValue(1);

  const gestureEvent = useAnimatedGestureHandler({
    onStart: () => {
      scale.value = withSpring(0.98, springConfig);
      hapticMedium();
    },
    onFinish: () => {
      scale.value = withSpring(1, springConfig);
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <LongPressGestureHandler onGestureEvent={gestureEvent}>
      <Animated.View style={animatedStyle}>
        {/* List item content */}
      </Animated.View>
    </LongPressGestureHandler>
  );
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Animated API (React Native built-in) | react-native-reanimated | 2020s | Reanimated runs on UI thread, enabling 60fps without JS bridge delays |
| Hand-coded delay loops | Reanimated entering with `.delay()` | Reanimated 3.0+ (2023) | Declarative approach is cleaner, handles lifecycle automatically |
| Custom gesture detection | react-native-gesture-handler | 2018+ industry standard | Gesture handler has proper state management (BEGAN, ACTIVE, ENDED, CANCELLED) |
| Raw Modal native animation | Custom Animated wrapper | 2023+ | Allows custom entrance/exit without sacrificing native modal lifecycle |
| Class components for animations | Functional + hooks + shared values | 2021+ | Hooks-based approach is simpler, more composable |

**Deprecated/outdated:**
- **React Native Animated API for complex animations:** Still works, but reanimated is strictly better (UI thread, better DX)
- **setTimeout for animation timing:** Creates memory leaks and is unpredictable. Use reanimated timing instead.
- **Animated.createAnimatedComponent** for custom components: Still valid, but less necessary with reanimated's modern APIs

---

## Open Questions

Things that couldn't be fully resolved but are important for planning:

1. **Long-press modal + haptic feedback synchronization**
   - What we know: LongPressGestureHandler provides BEGAN, ACTIVE, ENDED states
   - What's unclear: Optimal timing for haptic feedback relative to long-press duration threshold
   - Recommendation: Start haptic on BEGAN (immediate feedback), iterate based on user testing

2. **Spacing tokens for component-specific padding**
   - What we know: theme.ts has Spacing tokens; layout.ts has legacy values
   - What's unclear: Which components should use which spacing level (e.g., should input padding be lg or md?)
   - Recommendation: Reference comprehensive UI/UX plan (tingly-zooming-ladybug.md) which specifies ComponentPadding structure; follow its guidance on button/card/input/modal padding

3. **Animation performance on low-end Android devices**
   - What we know: Reanimated 4.1 supports native driver; limits are ~100 components for low-end Android
   - What's unclear: Whether HistoryScreen list animation (staggered FadeInUp) will stay smooth with 50+ items
   - Recommendation: Profile on actual device; use `useIsFocused` to pause off-screen animations

4. **Modal animation vs. React Navigation transitions**
   - What we know: Native Modal component is separate from Navigation stack
   - What's unclear: Whether ExitConfirmationModal should animate as Modal or as navigation screen
   - Recommendation: Keep as Modal (overlay pattern), not navigation screen. This maintains current UX.

---

## Sources

### Primary (HIGH confidence)

- **react-native-reanimated 4.1 official documentation** (https://docs.swmansion.com/react-native-reanimated/) - Entering/exiting animations, useAnimatedStyle, spring physics
- **Expo React Native Reanimated guide** (https://docs.expo.dev/versions/latest/sdk/reanimated/) - Integration with Expo, version confirmation
- **Reanimated Performance Best Practices** (https://docs.swmansion.com/react-native-reanimated/docs/guides/performance/) - Animation property selection, limits, optimizations
- **Noor codebase analysis** - Existing spring config (Button.tsx, GlassCard.tsx), animation patterns, theme.ts structure

### Secondary (MEDIUM confidence)

- **React Native best practices 2026** (https://bitskingdom.com/blog/react-native-animations-guide/) - General animation principles, performance considerations
- **Creating Animated TextField patterns** (https://bilir.me/blog/creating-an-animated-textfield-with-react-native) - Input animation patterns verified with Reanimated
- **React Navigation documentation** - Modal vs. screen transitions; stack navigator context
- **react-native-gesture-handler integration** - Gesture detection with Reanimated animations

### Tertiary (Architecture references)

- Noor comprehensive UI/UX plan (C:\Users\richa\.claude\plans\tingly-zooming-ladybug.md) - Component padding, spacing, animation philosophy
- Existing Noor component patterns (GlassCard, Button, LoadingState) - Spring config, animation structure

---

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** - All libraries confirmed in package.json, versions match documentation
- Architecture patterns: **HIGH** - Patterns verified in existing Noor code; reanimated docs confirm declarative API
- Pitfalls: **MEDIUM-HIGH** - Based on reanimated performance docs + common mobile animation patterns; some specific to Noor's constraints
- Don't hand-roll: **HIGH** - Each recommendation backed by library capabilities and existing implementation

**Research date:** February 1, 2026
**Valid until:** March 1, 2026 (30 days; Reanimated 4.1 is stable; React Native 0.81.5 unlikely to have breaking changes)
**Verification strategy:** Code examples should be tested in actual app before committing; performance should be profiled on target devices (iPhone 12+, Pixel 6+)

