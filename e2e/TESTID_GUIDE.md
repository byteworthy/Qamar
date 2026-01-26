# Test ID Guidelines for Detox E2E Testing

This guide explains how to add testIDs to React Native components for reliable E2E testing with Detox.

## Why Use testIDs?

- **Reliability**: Text and accessibility labels can change; testIDs remain stable
- **Localization**: Works across all languages
- **Performance**: Faster element lookup than text matching
- **Maintainability**: Clear intent for what's being tested

## Adding testIDs to Components

### Basic Components

```jsx
// TextInput
<TextInput
  testID="thought-input"
  placeholder="Write what's on your mind..."
  value={thought}
  onChangeText={setThought}
/>

// Button / TouchableOpacity
<TouchableOpacity testID="continue-button" onPress={handleContinue}>
  <Text>Continue</Text>
</TouchableOpacity>

// View containers
<View testID="stats-card">
  <Text>Stats content</Text>
</View>
```

### Lists and Repeated Items

Use dynamic testIDs with indices:

```jsx
// FlatList items
<FlatList
  data={reflections}
  renderItem={({ item, index }) => (
    <TouchableOpacity
      testID={`reflection-item-${index}`}
      onPress={() => viewReflection(item)}
    >
      <Text testID={`reflection-title-${index}`}>{item.thought}</Text>
      <Text testID={`reflection-date-${index}`}>{item.date}</Text>
    </TouchableOpacity>
  )}
/>
```

### Conditional Rendering

```jsx
// Different states
{isLoading ? (
  <View testID="loading-state">
    <ActivityIndicator />
  </View>
) : error ? (
  <View testID="error-state">
    <Text testID="error-message">{error}</Text>
    <Button testID="retry-button" title="Try Again" />
  </View>
) : (
  <View testID="content-loaded">
    {/* Main content */}
  </View>
)}
```

### Tab Navigation

```jsx
// Tab bar items
<Tab.Screen
  name="Home"
  component={HomeScreen}
  options={{
    tabBarTestID: 'tab-home',
    tabBarLabel: 'Home',
  }}
/>

<Tab.Screen
  name="History"
  component={HistoryScreen}
  options={{
    tabBarTestID: 'tab-history',
    tabBarLabel: 'History',
  }}
/>
```

### Modal/Dialog Components

```jsx
<Modal visible={showExitConfirm} testID="exit-confirmation-modal">
  <View testID="modal-content">
    <Text testID="modal-title">Leave Reflection?</Text>
    <Text testID="modal-message">Your progress will be lost.</Text>
    <Button testID="modal-cancel" title="Keep Reflecting" />
    <Button testID="modal-confirm" title="Leave" />
  </View>
</Modal>
```

### Form Elements

```jsx
// Radio buttons / Selection
{[1, 2, 3, 4, 5].map((level) => (
  <TouchableOpacity
    key={level}
    testID={`intensity-${level}`}
    onPress={() => setIntensity(level)}
    style={intensity === level ? styles.selected : styles.unselected}
  >
    <Text>{level}</Text>
  </TouchableOpacity>
))}

// Checkbox
<TouchableOpacity
  testID="terms-checkbox"
  onPress={() => setAcceptedTerms(!acceptedTerms)}
>
  <Icon name={acceptedTerms ? 'check-box' : 'check-box-outline-blank'} />
</TouchableOpacity>
```

### Nested Components

```jsx
// Parent container
<View testID="reflection-card">
  <Text testID="reflection-card-title">{title}</Text>
  <Text testID="reflection-card-date">{date}</Text>
  <Text testID="reflection-card-distortions">{distortions.join(', ')}</Text>
  <TouchableOpacity testID="reflection-card-action">
    <Text>View Details</Text>
  </TouchableOpacity>
</View>
```

## Naming Conventions

### Pattern: `component-descriptor-[modifier]`

**Good Examples:**
- `thought-input` - The main thought text input
- `intensity-3` - Intensity level 3 button
- `continue-button` - Primary continue action
- `reflection-item-0` - First reflection in list
- `stats-card` - Statistics display card
- `cancel-button` - Cancel/close action
- `error-message` - Error text display
- `loading-state` - Loading indicator

**Bad Examples:**
- `btn1` - Not descriptive
- `TextInput123` - Generic, no context
- `myButton` - Vague purpose
- `temp` - Unclear meaning

### Component-Specific Patterns

#### Buttons
- `{action}-button` - e.g., `continue-button`, `retry-button`, `cancel-button`
- `{feature}-action` - e.g., `reflection-action`, `subscribe-action`

#### Inputs
- `{field}-input` - e.g., `thought-input`, `email-input`
- `{field}-picker` - e.g., `date-picker`, `category-picker`

#### Lists
- `{type}-list` - e.g., `reflection-list`, `distortions-list`
- `{type}-item-{index}` - e.g., `reflection-item-0`, `distortion-item-2`

#### Cards/Containers
- `{content}-card` - e.g., `stats-card`, `feature-card`
- `{section}-container` - e.g., `header-container`, `content-container`

#### States
- `{state}-state` - e.g., `loading-state`, `error-state`, `empty-state`
- `{message}-text` - e.g., `error-message`, `success-message`

## testID in Existing Components

### Key Components Needing testIDs

```jsx
// ThoughtCaptureScreen.tsx
<TextInput testID="thought-input" />
<TouchableOpacity testID="intensity-1" />
<TouchableOpacity testID="intensity-2" />
<TouchableOpacity testID="intensity-3" />
<TouchableOpacity testID="intensity-4" />
<TouchableOpacity testID="intensity-5" />
<TouchableOpacity testID="continue-button" />
<TouchableOpacity testID="cancel-button" />

// DistortionScreen.tsx
<View testID="analysis-content" />
<TouchableOpacity testID="continue-button" />
<TouchableOpacity testID="retry-button" />
<TouchableOpacity testID="cancel-button" />

// ReframeScreen.tsx
<View testID="reframe-content" />
<TouchableOpacity testID="belief-rating-1" />
<TouchableOpacity testID="belief-rating-2" />
<TouchableOpacity testID="belief-rating-3" />
<TouchableOpacity testID="belief-rating-4" />
<TouchableOpacity testID="belief-rating-5" />
<TouchableOpacity testID="continue-button" />

// SessionCompleteScreen.tsx
<View testID="completion-content" />
<TouchableOpacity testID="return-home-button" />

// HomeScreen.tsx
<View testID="stats-card" />
<TouchableOpacity testID="begin-reflection-button" />

// HistoryScreen.tsx
<FlatList testID="reflection-list" />
<View testID="reflection-item-{index}" />
<View testID="empty-state" />

// LearnScreen.tsx
<FlatList testID="distortions-list" />
<TouchableOpacity testID="distortion-catastrophizing" />
<TouchableOpacity testID="distortion-all-or-nothing" />

// SettingsScreen.tsx
<TouchableOpacity testID="upgrade-button" />
<TouchableOpacity testID="manage-subscription" />
<TouchableOpacity testID="privacy-policy" />
<TouchableOpacity testID="terms-of-service" />

// PricingScreen.tsx
<View testID="features-list" />
<TouchableOpacity testID="subscribe-button" />
<TouchableOpacity testID="restore-purchases" />
```

## Accessibility + testID

Combine testID with accessibility props for best results:

```jsx
<TouchableOpacity
  testID="continue-button"
  accessibilityLabel="Continue to next step"
  accessibilityHint="Proceeds to distortion analysis"
  accessibilityRole="button"
  onPress={handleContinue}
>
  <Text>Continue</Text>
</TouchableOpacity>
```

## Testing Checklist

When adding a new screen or feature:

- [ ] Add testID to all interactive elements (buttons, inputs, etc.)
- [ ] Add testID to key content containers
- [ ] Add testID to loading/error states
- [ ] Use descriptive, consistent naming
- [ ] Follow naming conventions
- [ ] Test element accessibility with testID

## Finding Elements in Detox

```js
// By testID (preferred)
await element(by.id('thought-input')).typeText('My thought');

// By text (fallback)
await element(by.text('Continue')).tap();

// By label (accessibility)
await element(by.label('Home')).tap();

// Waiting for elements
await waitFor(element(by.id('analysis-content')))
  .toBeVisible()
  .withTimeout(30000);

// Multiple matchers
await element(
  by.id('reflection-item-0').withDescendant(by.text('Today'))
).tap();
```

## Common Mistakes

### ❌ Don't Do This

```jsx
// Too generic
<Button testID="button1" />
<View testID="container" />
<Text testID="text" />

// Hardcoded indices without dynamic data
<TouchableOpacity testID="item-0" />  // Should use {index}

// Missing testID on interactive elements
<TouchableOpacity onPress={handlePress}>  // No testID!
  <Text>Important Action</Text>
</TouchableOpacity>

// Duplicate testIDs
<Button testID="submit-button" />
<Button testID="submit-button" />  // Duplicate!
```

### ✅ Do This Instead

```jsx
// Descriptive and unique
<Button testID="continue-button" />
<View testID="stats-container" />
<Text testID="error-message" />

// Dynamic with data
{items.map((item, index) => (
  <TouchableOpacity key={item.id} testID={`item-${index}`} />
))}

// Always add testID to interactive elements
<TouchableOpacity testID="primary-action-button" onPress={handlePress}>
  <Text>Important Action</Text>
</TouchableOpacity>

// Unique testIDs
<Button testID="form-submit-button" />
<Button testID="comment-submit-button" />
```

## Resources

- [Detox Test ID Documentation](https://wix.github.io/Detox/docs/guide/test-id)
- [React Native testID](https://reactnative.dev/docs/view#testid)
- [Accessibility Props](https://reactnative.dev/docs/accessibility)
