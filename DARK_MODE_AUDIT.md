# Dark Mode Audit Report

**Date**: January 24, 2026
**Status**: Issues found - requires fixes before launch
**Priority**: HIGH (Apple requires dark mode support)

---

## 🔍 Audit Summary

**Method**: Scanned all 16 screens for hardcoded color usage
**Finding**: 8 screens using hardcoded `SiraatColors` (light theme palette) instead of semantic `theme` tokens
**Impact**: These colors won't adapt to dark mode, causing poor contrast and broken UI

---

## 🚨 CRITICAL ISSUES FOUND

### Issue Pattern
Components are using `SiraatColors.X` directly instead of `theme.X` tokens:

```typescript
// ❌ WRONG: Hardcoded light theme color
style={{ backgroundColor: SiraatColors.emerald }}

// ✅ CORRECT: Semantic theme token (adapts to dark mode)
style={{ backgroundColor: theme.highlightAccent }}
```

---

## 📋 SCREEN-BY-SCREEN BREAKDOWN

### 1. **RegulationScreen.tsx** 🔴 HIGH PRIORITY

**Lines with issues**: 337, 346, 358, 366, 377, 389, 399, 458

**Problems**:
```typescript
// Line 337: Hardcoded emeraldDark
backgroundColor: isActive ? SiraatColors.emeraldDark : theme.backgroundDefault

// Line 346: Hardcoded cream
color: isActive ? SiraatColors.cream : theme.textSecondary

// Line 366: Hardcoded white
color: isActive ? SiraatColors.emeraldDark : "#FFFFFF"
```

**Fix**: Replace with theme tokens
- `SiraatColors.emeraldDark` → `theme.accent` or `theme.highlightAccent`
- `SiraatColors.cream` → `theme.onPrimary`
- `"#FFFFFF"` → `theme.onPrimary`

**Impact**: Dhikr counter and practice cards won't display correctly in dark mode

---

### 2. **BeliefInspectionScreen.tsx** 🟡 MEDIUM PRIORITY

**Lines with issues**: 142-145, 232, 239, 365, 549

**Problems**:
```typescript
// Lines 142-145: Intensity color function
if (beliefStrength <= 30) return SiraatColors.emerald;
if (beliefStrength <= 60) return SiraatColors.sand;
if (beliefStrength <= 80) return SiraatColors.clay;
return SiraatColors.clayDark;

// Line 232: Pro badge
backgroundColor: SiraatColors.emerald + "20"

// Line 365: Banner background
backgroundColor: SiraatColors.indigoLight
```

**Fix**: Use theme intensity tokens
- `SiraatColors.emerald` → `theme.intensityMild`
- `SiraatColors.sand` → `theme.intensityModerate`
- `SiraatColors.clay` → `theme.intensityHeavy`
- `SiraatColors.clayDark` → `theme.intensityIntense`
- `SiraatColors.indigoLight` → `theme.bannerBackground`

**Impact**: Belief strength slider colors won't adapt to dark mode

---

### 3. **IntentionScreen.tsx** 🟡 MEDIUM PRIORITY

**Lines with issues**: 220, 265, 302, 305, 425, 444-445, 452, 471, 474, 669

**Problems**:
```typescript
// Line 220: Bismillah toggle
backgroundColor: SiraatColors.indigo

// Lines 265, 302, 305: Template card borders
borderColor: isSelected ? SiraatColors.emerald : "transparent"

// Line 425: Banner background
backgroundColor: SiraatColors.indigoLight

// Lines 444-445: Suggestions card
backgroundColor: SiraatColors.emerald + "15",
borderColor: SiraatColors.emerald,
```

**Fix**: Use theme tokens
- `SiraatColors.indigo` → `theme.pillBackground`
- `SiraatColors.emerald` → `theme.highlightAccent`
- `SiraatColors.indigoLight` → `theme.bannerBackground`

**Impact**: Bismillah toggle, template cards, and suggestions won't adapt to dark mode

---

### 4. **DuaScreen.tsx** 🟡 MEDIUM PRIORITY

**Lines with issues**: 399, 405, 518, 524, 530

**Problems**:
```typescript
// Line 399: Lock overlay
backgroundColor: SiraatColors.indigo + "10"

// Line 405: Lock icon circle
backgroundColor: SiraatColors.indigo

// Lines 518, 524, 530: Dua display card
backgroundColor: SiraatColors.indigo
borderColor: SiraatColors.indigo + "15"
color: SiraatColors.indigo
```

**Fix**: Use theme tokens
- `SiraatColors.indigo` → `theme.pillBackground`

**Impact**: Locked state overlay and dua display cards won't adapt to dark mode

---

### 5. **PricingScreen.tsx** 🟡 MEDIUM PRIORITY

**Lines with issues**: 140, 171, 218

**Problems**:
```typescript
// Line 140: Premium plan border
borderColor: isPremium ? SiraatColors.indigo : theme.border

// Line 171: Feature checkmark
color: feature.included ? SiraatColors.emerald : theme.textSecondary

// Line 218: Select button background
backgroundColor: isPremium ? SiraatColors.indigo : theme.primary
```

**Fix**: Use theme tokens
- `SiraatColors.indigo` → `theme.pillBackground` or `theme.accent`
- `SiraatColors.emerald` → `theme.success`

**Impact**: Premium plan highlighting and feature checkmarks won't adapt to dark mode

---

### 6. **HistoryScreen.tsx** 🟢 LOW PRIORITY

**Lines with issues**: 239, 255

**Problems**:
```typescript
// Line 239: Pro badge border
borderColor: SiraatColors.indigo

// Line 255: Pro badge background
backgroundColor: SiraatColors.indigo
```

**Fix**: Use theme token
- `SiraatColors.indigo` → `theme.pillBackground`

**Impact**: Pro badges in history items won't adapt to dark mode

---

### 7. **InsightsScreen.tsx** 🟢 LOW PRIORITY

**Lines with issues**: 109, 112, 128

**Problems**:
```typescript
// Line 109: Lock state background
backgroundColor: SiraatColors.indigo + "15"

// Line 112: Lock icon
color={SiraatColors.indigo}

// Line 128: Upgrade button
backgroundColor: SiraatColors.indigo
```

**Fix**: Use theme token
- `SiraatColors.indigo` → `theme.pillBackground` or `theme.accent`

**Impact**: Locked state display won't adapt to dark mode

---

### 8. **BillingSuccessScreen.tsx** 🟢 LOW PRIORITY

**Lines with issues**: 105, 132, (125, 147 are correct - using SiraatColors but for success/warning semantic colors)

**Problems**:
```typescript
// Line 105: Success checkmark circle
backgroundColor: SiraatColors.emerald

// Line 132: Warning clock circle
backgroundColor: SiraatColors.clay
```

**Fix**: Use theme tokens
- `SiraatColors.emerald` → `theme.success`
- `SiraatColors.clay` → `theme.warning` or `theme.primary`

**Impact**: Success/warning visual feedback won't adapt to dark mode properly

---

### 9. **CalmingPracticeScreen.tsx** 🟢 LOW PRIORITY

**Lines with issues**: 125, 147, 206

**Problems**:
```typescript
// Lines 125, 147, 206: Breathing timer circles
backgroundColor: SiraatColors.emerald
```

**Fix**: Use theme token
- `SiraatColors.emerald` → `theme.highlightAccent` or `theme.success`

**Impact**: Breathing practice timer visuals won't adapt to dark mode

---

## ✅ SCREENS WITH NO ISSUES (8/16)

These screens correctly use theme tokens only:
1. ✅ **ThoughtCaptureScreen.tsx**
2. ✅ **DistortionScreen.tsx**
3. ✅ **ReframeScreen.tsx**
4. ✅ **HomeScreen.tsx**
5. ✅ **SessionCompleteScreen.tsx**
6. ✅ **ExploreScreen.tsx**
7. ✅ **ProfileScreen.tsx**
8. ✅ **BeliefInspectionScreen.tsx** (needs fixes but mostly good)

---

## 🎯 THEME TOKEN REFERENCE

For quick reference when fixing:

| SiraatColors Usage | Theme Token | Purpose |
|-------------------|-------------|---------|
| `SiraatColors.emerald` | `theme.highlightAccent` | Success states, highlights |
| `SiraatColors.emerald` | `theme.success` | Success feedback |
| `SiraatColors.emerald` | `theme.intensityMild` | Low intensity indicator |
| `SiraatColors.sand` | `theme.intensityModerate` | Medium intensity indicator |
| `SiraatColors.clay` | `theme.intensityHeavy` | High intensity indicator |
| `SiraatColors.clayDark` | `theme.intensityIntense` | Very high intensity indicator |
| `SiraatColors.indigo` | `theme.pillBackground` | Premium badges, pills |
| `SiraatColors.indigoLight` | `theme.bannerBackground` | Banner backgrounds |
| `SiraatColors.cream` | `theme.onPrimary` | Text on colored backgrounds |
| `"#FFFFFF"` | `theme.onPrimary` | White text on dark backgrounds |

---

## 📊 PRIORITY MATRIX

| Priority | Screens | Reason |
|----------|---------|--------|
| 🔴 HIGH | RegulationScreen | Core flow, multiple hardcoded colors |
| 🟡 MEDIUM | BeliefInspection, Intention, Dua, Pricing | Secondary flows, visual feedback issues |
| 🟢 LOW | History, Insights, BillingSuccess, CalmingPractice | Minor visual inconsistencies |

---

## 🛠️ RECOMMENDED FIX APPROACH

### Batch 1: High Priority (1 hour)
1. Fix **RegulationScreen.tsx**
   - Replace all SiraatColors with theme tokens
   - Test dhikr counter in dark mode
   - Test breathing practice in dark mode

### Batch 2: Medium Priority (2 hours)
2. Fix **BeliefInspectionScreen.tsx**
   - Update intensity color function
   - Replace badge and banner colors
3. Fix **IntentionScreen.tsx**
   - Update Bismillah toggle
   - Update template cards
   - Update suggestions card
4. Fix **DuaScreen.tsx**
   - Update lock overlay and icon
   - Update dua display card
5. Fix **PricingScreen.tsx**
   - Update premium plan highlighting
   - Update feature checkmarks

### Batch 3: Low Priority (1 hour)
6. Fix **HistoryScreen.tsx** - Pro badges
7. Fix **InsightsScreen.tsx** - Lock state
8. Fix **BillingSuccessScreen.tsx** - Success/warning circles
9. Fix **CalmingPracticeScreen.tsx** - Timer circles

**Total time**: 4 hours

---

## 🧪 TESTING CHECKLIST

After fixes:
- [ ] Toggle dark mode in iOS Settings
- [ ] Navigate through all screens
- [ ] Verify all interactive elements visible
- [ ] Check text contrast (WCAG AA minimum)
- [ ] Verify no white/black text on light/dark backgrounds
- [ ] Test on physical device (OLED displays show true blacks)
- [ ] Screenshot each screen for documentation

---

## 📝 NOTES

**Why this matters**:
1. **Apple requirement**: Apps must support dark mode (iOS 13+)
2. **OLED battery**: Dark mode saves battery on iPhone 12+ (OLED displays)
3. **Accessibility**: Low vision users rely on dark mode for reduced eye strain
4. **User preference**: 70%+ of iOS users prefer dark mode

**Current status**: App won't be rejected, but dark mode will look broken in 8/16 screens

**Recommendation**: Fix all HIGH and MEDIUM priority issues before App Store submission (estimated 3 hours)

---

**Status**: ⚠️ INCOMPLETE - Fixes required
**Blockers**: None (theme tokens already exist)
**Ready for**: Implementation → Testing → App Store submission
