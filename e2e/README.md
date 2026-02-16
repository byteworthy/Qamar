# E2E Testing with Detox

End-to-end testing for the Noor mobile app using Detox.

## Prerequisites

### iOS
- macOS with Xcode installed
- Xcode Command Line Tools
- iOS Simulator
- CocoaPods (`brew install cocoapods`)

### Android
- Android Studio
- Android SDK
- Android Emulator
- JDK 11 or later

### Detox CLI
```bash
npm install -g detox-cli
```

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the App

#### iOS Debug
```bash
detox build --configuration ios.sim.debug
```

#### Android Debug
```bash
detox build --configuration android.emu.debug
```

## Running Tests

### Run All E2E Tests

#### iOS
```bash
npm run test:e2e:ios
```

#### Android
```bash
npm run test:e2e:android
```

### Run Specific Test File
```bash
detox test e2e/reflectionFlow.test.js --configuration ios.sim.debug
```

### Run in Debug Mode
```bash
detox test --configuration ios.sim.debug --loglevel trace
```

### Run with Specific Device
```bash
detox test --configuration ios.sim.debug --device-name="iPhone 15 Pro"
```

## Test Structure

```
e2e/
├── jest.config.js          # Jest configuration for Detox
├── setup.js                # Test setup and lifecycle hooks
├── reflectionFlow.test.js  # Reflection flow E2E tests
├── navigation.test.js      # Navigation and home screen tests
├── subscription.test.js    # Subscription and pricing tests
└── README.md              # This file
```

## Test Scenarios

### Reflection Flow (`reflectionFlow.test.js`)
- Complete thought capture and analysis journey
- Thought input validation
- Emotional intensity selection
- Distortion analysis with AI
- Reframe generation
- Session completion and saving
- Crisis detection
- Exit confirmation dialogs

### Navigation (`navigation.test.js`)
- Home screen display
- Tab navigation
- History screen and reflection viewing
- Learn screen and distortion types
- Settings screen
- Pricing screen navigation
- Accessibility features
- Network error handling

### Subscription (`subscription.test.js`)
- Free plan display
- Pricing screen
- Subscription purchase flow
- Purchase cancellation
- Error handling
- Restore purchases
- Subscription management
- Plus feature access

## Configuration

### Device Settings

The default test devices are configured in `.detoxrc.js`:

**iOS:**
- Simulator: iPhone 15 Pro
- OS: Latest available

**Android:**
- Emulator: Pixel_5_API_34
- OS: Android 14 (API 34)

To change devices, edit `.detoxrc.js`:

```js
devices: {
  simulator: {
    type: 'ios.simulator',
    device: {
      type: 'iPhone 14 Pro', // Change here
    },
  },
  emulator: {
    type: 'android.emulator',
    device: {
      avdName: 'Pixel_7_API_33', // Change here
    },
  },
}
```

### Timeout Configuration

Default timeout is 120 seconds. To change:

```js
// e2e/jest.config.js
module.exports = {
  testTimeout: 180000, // 3 minutes
  // ...
};
```

## Test IDs

Components should include `testID` props for reliable element selection:

```jsx
// Good - use testID
<TextInput testID="thought-input" />
<TouchableOpacity testID="intensity-3" />

// Also good - combine with text
<Button testID="continue-button" title="Continue" />
```

### Accessing Elements

```js
// By test ID (preferred)
element(by.id('thought-input'))

// By text
element(by.text('Continue'))

// By label (accessibility)
element(by.label('Home'))

// Combined selectors
element(by.id('reflection-item').withDescendant(by.text('Today')))
```

## Debugging

### View Element Hierarchy
```bash
detox test --configuration ios.sim.debug --debug-synchronization 500
```

### Take Screenshots
```js
await device.takeScreenshot('test-failure');
```

### Enable Verbose Logging
```bash
detox test --loglevel trace
```

### Inspect React Native State
```bash
# Use React DevTools
react-devtools
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run E2E Tests (iOS)
  run: |
    detox build --configuration ios.sim.release
    detox test --configuration ios.sim.release --cleanup

- name: Upload Test Artifacts
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: detox-artifacts
    path: artifacts/
```

## Troubleshooting

### iOS Simulator Not Found
```bash
xcrun simctl list devices
detox test --device-name="<simulator-name>"
```

### Android Emulator Not Running
```bash
# List available AVDs
emulator -list-avds

# Start emulator
emulator -avd Pixel_5_API_34
```

### App Not Installing
```bash
# Clean build
detox clean-framework-cache
detox build --configuration ios.sim.debug
```

### Tests Timing Out
- Increase timeout in `e2e/jest.config.js`
- Check network connectivity for API-dependent tests
- Verify device performance (allocate more resources to emulator)

### Element Not Found
- Add proper `testID` to component
- Use `waitFor()` for async elements
- Check element visibility and hierarchy

## Best Practices

1. **Use testID over text matching** - More reliable, less brittle
2. **Add proper wait conditions** - Use `waitFor()` for async operations
3. **Clean state between tests** - Use `beforeEach` to reset app state
4. **Test user journeys, not implementation** - Focus on what users do
5. **Keep tests independent** - Each test should run in isolation
6. **Use descriptive test names** - Clear intent and purpose
7. **Handle async properly** - Always await Detox actions
8. **Mock external dependencies** - Don't rely on external APIs for tests

## Performance Tips

1. **Use release builds for CI** - Faster execution
2. **Run tests in parallel** - Multiple devices/simulators
3. **Disable animations** - Faster test execution
4. **Use device.reloadReactNative()** - Faster than full app relaunch
5. **Optimize test setup** - Minimize app restarts

## Resources

- [Detox Documentation](https://wix.github.io/Detox/)
- [Jest Expect API](https://jestjs.io/docs/expect)
- [React Native Testing Guide](https://reactnative.dev/docs/testing-overview)
- [iOS Simulator CLI](https://developer.apple.com/documentation/xcode/running-your-app-in-the-simulator-or-on-a-device)
- [Android Emulator CLI](https://developer.android.com/studio/run/emulator-commandline)
