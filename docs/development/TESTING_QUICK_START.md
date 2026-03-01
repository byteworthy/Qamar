# 🚀 Quick Start: Mobile App Testing

**Goal**: Get testing environment running in 15 minutes

---

## Option 1: iOS Simulator (macOS Only) - FASTEST

### Prerequisites
- macOS with Xcode installed
- Node.js 18+ installed

### Steps

```bash
# 1. Start backend server (Terminal 1)
cd /path/to/qamar
npm run server:dev

# 2. Start Metro bundler (Terminal 2)
npm run expo:dev

# 3. Press 'i' to open iOS simulator
# Or scan QR code with Expo Go app
```

**First Test**: Complete one reflection journey (5 minutes)
1. Tap "Start a Reflection"
2. Enter: "I'm worried about my exam tomorrow"
3. Tap Continue through each screen
4. Verify all 5 screens work: Thought → Analysis → Reframe → Practice → Intention
5. ✅ If it completes without errors, core flow works!

---

## Option 2: Android Emulator (All Platforms)

### Prerequisites
- Android Studio installed with SDK
- AVD (Android Virtual Device) created

### Steps

```bash
# 1. Start Android emulator
# Open Android Studio → Device Manager → Start Pixel 8

# 2. Start backend server (Terminal 1)
npm run server:dev

# 3. Start Metro bundler (Terminal 2)
npm run expo:dev

# 4. Press 'a' to open Android emulator
```

**First Test**: Same as iOS - complete one reflection journey

---

## Option 3: Physical Device (Best for Real Testing)

### iOS Device

```bash
# 1. Install Expo Go from App Store
# 2. Ensure device on same WiFi as computer
# 3. Start servers:
npm run server:dev  # Terminal 1
npm run expo:dev    # Terminal 2

# 4. Scan QR code with iPhone camera
# Opens in Expo Go app
```

### Android Device

```bash
# 1. Install Expo Go from Google Play
# 2. Ensure device on same WiFi as computer
# 3. Start servers (same as iOS)
# 4. Scan QR code with Expo Go app
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
lsof -ti:5000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5000   # Windows

# Then restart
npm run server:dev
```

### Metro bundler errors
```bash
# Clear Metro cache
npx expo start --clear

# Or reset everything
rm -rf node_modules
npm install
npm run expo:dev
```

### Simulator/Emulator not showing app
- Press R in Metro terminal to reload
- Close and reopen Expo Go app
- Restart emulator/simulator

### Network errors in app
- Verify backend is running (visit http://localhost:5000/api/health)
- Check EXPO_PUBLIC_API_URL in app.json
- Ensure device on same WiFi network

---

## 📋 Quick Test Checklist (10 minutes)

After getting the app running, test these critical flows:

### ✅ Test 1: Complete Reflection (5 min)
- [ ] Start reflection
- [ ] Enter thought, see analysis
- [ ] See reframe with Islamic concepts
- [ ] See practice with dhikr
- [ ] Save with intention

### ✅ Test 2: View History (1 min)
- [ ] Navigate to History tab
- [ ] See saved reflection
- [ ] Tap to view details

### ✅ Test 3: Export Data (1 min)
- [ ] On History screen, tap Export button
- [ ] Verify share sheet appears
- [ ] Save to Files or Notes

### ✅ Test 4: Cancel Flow (1 min)
- [ ] Start reflection
- [ ] Tap "Cancel" on any screen
- [ ] Confirm exit
- [ ] Verify returns to Home

### ✅ Test 5: Error Handling (2 min)
- [ ] Stop backend server (Ctrl+C)
- [ ] Try starting new reflection
- [ ] Verify error message appears
- [ ] Restart backend
- [ ] Verify app recovers

---

## 🎯 What to Look For

### Good Signs ✅
- App loads in < 3 seconds
- Smooth transitions between screens
- AI responses appear in < 10 seconds
- Text is readable, not cut off
- No console errors in Metro terminal
- Arabic text displays correctly (if applicable)

### Red Flags 🚨
- App crashes or freezes
- Network requests timeout
- Blank/white screens
- Text overlapping or cut off
- "Failed to load" errors
- Excessive loading times (> 15s)

---

## 📞 Next Steps

After quick testing:

1. **If everything works**: Run full test suite from [MOBILE_TESTING_PLAN.md](./MOBILE_TESTING_PLAN.md)
2. **If bugs found**: Document in GitHub Issues with Bug Report Template
3. **If critical failures**: Report immediately for fixing

---

**Estimated Time**: 15 minutes setup + 10 minutes testing = 25 minutes total

Good luck! 🚀
