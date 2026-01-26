# Detox E2E Testing - Quick Start

Get up and running with E2E tests in 5 minutes.

## Prerequisites

### macOS (iOS)
```bash
# Install Xcode from App Store
# Install Xcode Command Line Tools
xcode-select --install

# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew tap wix/brew
brew install applesimutils
```

### Windows/Linux (Android only)
```bash
# Install Android Studio from https://developer.android.com/studio
# Install Android SDK, Platform Tools, and Emulator
# Install JDK 11+
```

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Install Detox CLI (optional, can use npx)
```bash
npm install -g detox-cli
```

### 3. Build App for Testing

#### iOS
```bash
npm run build:e2e:ios
```

#### Android
```bash
npm run build:e2e:android
```

**Note**: First build takes 5-15 minutes. Subsequent builds are faster.

### 4. Start Simulator/Emulator

#### iOS
The simulator starts automatically when running tests.

Or start manually:
```bash
open -a Simulator
```

#### Android
```bash
# List available AVDs
emulator -list-avds

# Start emulator
emulator -avd Pixel_5_API_34 &
```

### 5. Run Tests

#### iOS
```bash
npm run test:e2e:ios
```

#### Android
```bash
npm run test:e2e:android
```

## Expected Output

```
Detox Server Listening...
Running "com.myapp" on "iPhone 15 Pro"...

 PASS  e2e/reflectionFlow.test.js (45.2s)
  Reflection Flow
    Thought Capture
      ✓ should complete thought capture flow (8234ms)
      ✓ should not allow empty thoughts (1842ms)
      ✓ should allow selecting different emotional intensities (2103ms)
    Distortion Analysis
      ✓ should display distortion analysis (31204ms)
      ✓ should allow continuing to reframe (32891ms)
    ...

Test Suites: 3 passed, 3 total
Tests:       28 passed, 28 total
Time:        85.432s
```

## Troubleshooting Quick Fixes

### iOS Simulator Not Found
```bash
# List available simulators
xcrun simctl list devices

# Boot a specific simulator
xcrun simctl boot "iPhone 15 Pro"
```

### Android Emulator Not Starting
```bash
# Check if emulator is in PATH
emulator -version

# If not found, add to PATH (bash/zsh)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### App Not Installing
```bash
# Clean Detox cache
detox clean-framework-cache

# Rebuild app
npm run build:e2e:ios  # or android
```

### Tests Hanging
- Check that backend server is running (if needed for tests)
- Increase timeout in `e2e/jest.config.js`
- Use `--loglevel trace` for debugging

### Element Not Found
- Verify component has `testID` prop
- Use `waitFor()` for async elements
- Check element is visible (not hidden/off-screen)

## Next Steps

1. Read [e2e/README.md](./README.md) for detailed documentation
2. Review [e2e/TESTID_GUIDE.md](./TESTID_GUIDE.md) for adding testIDs
3. Add testIDs to components (see guide)
4. Write additional tests
5. Run tests in CI/CD pipeline

## Common Test Commands

```bash
# Run all E2E tests
npm run test:e2e:ios

# Run specific test file
detox test e2e/reflectionFlow.test.js --configuration ios.sim.debug

# Run with verbose logging
detox test --configuration ios.sim.debug --loglevel trace

# Run specific test
detox test --configuration ios.sim.debug --grep "should complete thought capture"

# Debug mode (keeps app open after test)
detox test --configuration ios.sim.debug --debug-synchronization 500

# Cleanup after failed tests
detox test --configuration ios.sim.debug --cleanup
```

## CI/CD Integration

### GitHub Actions
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: brew tap wix/brew && brew install applesimutils
      - run: npm run build:e2e:ios:release
      - run: npm run test:e2e:ios:release
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: detox-artifacts
          path: artifacts/
```

## Development Workflow

1. **Add Feature** → Write component code
2. **Add testIDs** → Add testID props to interactive elements
3. **Write E2E Test** → Create test in `e2e/` directory
4. **Run Tests Locally** → `npm run test:e2e:ios`
5. **Fix Issues** → Iterate on code and tests
6. **Commit** → Push changes with tests
7. **CI Validates** → Automated E2E tests run

## Performance Tips

- **Use release builds in CI**: Faster execution
- **Reuse app instance**: Use `device.reloadReactNative()` instead of full restart
- **Parallel execution**: Run tests on multiple simulators (advanced)
- **Disable animations**: Faster test execution in CI

## Support

- **Detox Docs**: https://wix.github.io/Detox/
- **GitHub Issues**: https://github.com/wix/Detox/issues
- **Stack Overflow**: Tag with `detox` and `react-native`

## Test Coverage Goals

- [x] Reflection flow (thought capture → completion)
- [x] Navigation (tabs, screens)
- [x] Subscription/pricing
- [ ] Settings and preferences
- [ ] History and reflection viewing
- [ ] Learn screen interactions
- [ ] Offline mode
- [ ] Push notifications (if applicable)

Add more tests as features are developed!
