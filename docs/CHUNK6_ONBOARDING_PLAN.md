# Chunk 6: Onboarding Flow Implementation Plan

## Goal
Add a minimal one-time onboarding flow that is store-safe and routes into the existing app with no changes to existing CBT screens.

## App Architecture Analysis

### Entry Point
- **File**: `client/index.js`
- **Purpose**: Registers the root component using `expo`
- **Flow**: `index.js` → `App.tsx`

### Navigation Root
- **File**: `client/navigation/RootStackNavigator.tsx`
- **Current First Screen**: `Main` (TabNavigator)
- **Navigation Library**: `@react-navigation/native-stack`

### Storage System
- **File**: `client/lib/storage.ts`
- **Library**: `@react-native-async-storage/async-storage` (already in dependencies)
- **Pattern**: Simple async functions with try-catch error handling

## Implementation Plan

### 1. Onboarding Gate Location
The gate will be inserted in `RootStackNavigator.tsx`:
- Add new onboarding screens to the stack
- Use React state to check if onboarding is completed
- Conditionally render onboarding screens OR existing app based on completion flag
- **Critical**: Use `initialRouteName` prop to control which screen shows first

### 2. Storage Flag
- **Key**: `@noor_onboarding_completed`
- **Value**: `"true"` (string) when completed
- **Functions to add to `client/lib/storage.ts`**:
  - `getOnboardingCompleted(): Promise<boolean>`
  - `setOnboardingCompleted(): Promise<void>`

### 3. Onboarding Screens (New Directory: `client/screens/onboarding/`)
Three screens following existing patterns:

#### Screen 1: WelcomeScreen
- **Purpose**: Welcome and app boundaries
- **Content**:
  - Noor brand introduction
  - What the app does (CBT + Islamic framework)
  - What it doesn't do (not crisis intervention, not therapy replacement)
- **Button**: "Continue" → Next screen

#### Screen 2: PrivacyScreen
- **Purpose**: Privacy and data summary
- **Content**:
  - Local-first storage approach
  - What data stays on device
  - Optional analytics (if any)
  - Link to full privacy policy
- **Buttons**: "Back" | "Continue" → Next screen

#### Screen 3: SafetyScreen
- **Purpose**: Safety, crisis guidance, and begin
- **Content**:
  - Crisis resources reminder (links to existing docs)
  - When to seek professional help
  - Theological safety boundaries
  - Ready to begin
- **Buttons**: "Back" | "Get Started" → Complete onboarding & enter app

### 4. Navigation Wiring

#### Update RootStackNavigator.tsx
```typescript
// Pseudo-code structure:
- Add state: const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null)
- Add useEffect to check storage on mount
- If null (loading), show nothing or splash
- If false, show onboarding screens as initialRouteName
- If true, show Main as initialRouteName
```

#### Onboarding Param List
```typescript
Onboarding_Welcome: undefined
Onboarding_Privacy: undefined
Onboarding_Safety: undefined
```

### 5. Testing Strategy
Since there's no UI test framework for React Native in this project:
- Create `docs/CHUNK6_ONBOARDING_TEST_CHECKLIST.md`
- Manual test steps for:
  1. Fresh install → shows onboarding
  2. Complete onboarding → goes to Home
  3. Restart app → bypasses onboarding
  4. (Dev) Clear storage → shows onboarding again

### 6. Analytics/Logging
- **Approach**: Skip (per task instructions)
- No new analytics SDK
- No expansion of existing logging

## Acceptance Criteria

✅ App boots successfully
✅ Fresh launch shows onboarding welcome screen
✅ User can navigate through all 3 onboarding screens
✅ Completing onboarding stores flag and shows main app
✅ Subsequent launches bypass onboarding (go directly to Main/Home)
✅ No changes to existing CBT flow screens
✅ No changes to backend
✅ `npm run typecheck` passes
✅ `npm test` passes

## Files to Create
1. `docs/CHUNK6_ONBOARDING_PLAN.md` ✅ (this file)
2. `client/screens/onboarding/WelcomeScreen.tsx`
3. `client/screens/onboarding/PrivacyScreen.tsx`
4. `client/screens/onboarding/SafetyScreen.tsx`
5. `docs/CHUNK6_ONBOARDING_TEST_CHECKLIST.md`

## Files to Modify
1. `client/navigation/RootStackNavigator.tsx` (add gate logic)
2. `client/lib/storage.ts` (add onboarding flag functions)

## Commit Message
```
feat: chunk6 onboarding flow

- Add three-screen onboarding (Welcome, Privacy, Safety)
- Gate app entry with AsyncStorage completion flag
- No changes to existing CBT screens
- Store-safe content focused on boundaries and safety
```

## Store Safety Considerations
- All content emphasizes boundaries and appropriate use
- Clear disclaimer about crisis resources
- Privacy-first messaging
- Professional help guidance
- Theological safety framing consistent with app charter
