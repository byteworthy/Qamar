# App Icon Generation Guide - Noor

**Source File:** `assets/images/icon-source.svg`
**Target:** 1024x1024 PNG with no transparency

---

## Quick Method: Online Converter

### Step 1: Use SVG to PNG Converter

**Recommended Tools:**
1. **Figma** (free, best quality)
   - https://www.figma.com
   - Import SVG → Export as PNG at 1024x1024

2. **CloudConvert** (online, no signup)
   - https://cloudconvert.com/svg-to-png
   - Upload `icon-source.svg`
   - Set width: 1024, height: 1024
   - Download PNG

3. **SVG to PNG Converter** (simple)
   - https://svgtopng.com
   - Upload SVG, set size to 1024x1024
   - Download

### Step 2: Verify Requirements

After converting, check:

- [ ] **Dimensions:** Exactly 1024x1024 pixels
- [ ] **Format:** PNG (not JPEG, not SVG)
- [ ] **Transparency:** NONE (should have solid background)
- [ ] **Color Space:** sRGB or Display P3
- [ ] **File Size:** Under 1 MB (typically 200-500 KB)

### Step 3: Preview at Multiple Sizes

Test how icon looks when scaled down:

```
Sizes to check:
- 1024x1024 (App Store)
- 180x180 (iPhone)
- 120x120 (iPad)
- 40x40 (Spotlight)
```

**Should be recognizable even at 40x40.**

### Step 4: Replace Placeholder

```bash
# From project root
cp /path/to/your/converted-icon.png assets/images/icon.png
```

---

## Method 2: Using Figma (Recommended for Best Quality)

### Step 1: Import to Figma

1. Create free Figma account at [figma.com](https://figma.com)
2. Create new file: **Noor App Icon**
3. Drag `icon-source.svg` into Figma canvas
4. Resize to 1024x1024 (lock aspect ratio)

### Step 2: Fine-tune (Optional)

Adjust if needed:
- Tweak gradient colors
- Adjust star positioning
- Refine crescent moon curve
- Add subtle effects

### Step 3: Export Settings

1. Select icon frame
2. Right panel → Export
3. Settings:
   - **Format:** PNG
   - **Size:** 1x (1024x1024)
   - **Suffix:** Leave blank
4. Click **Export**

### Step 4: Remove Transparency (If Any)

If icon has transparency, add background:

1. Create rectangle 1024x1024 behind icon
2. Fill with `#0f1419` (twilight blue)
3. Group with icon
4. Export group

---

## Method 3: Using Sketch (macOS)

### Step 1: Open in Sketch

1. Open Sketch
2. File → Open `icon-source.svg`
3. Artboard size: 1024x1024

### Step 2: Export

1. Select artboard
2. Make Exportable
3. Format: PNG
4. Size: 1x
5. Export

---

## App Store Connect Upload

### Step 1: Prepare Final Icon

```bash
# Verify dimensions
file assets/images/icon.png
# Should show: PNG image data, 1024 x 1024

# Check file size
ls -lh assets/images/icon.png
# Should be under 1 MB
```

### Step 2: Upload to App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to **My Apps → Noor → App Store**
3. Scroll to **App Icon**
4. Drag and drop `icon.png` (1024x1024)
5. Click **Save**

---

## Icon Design Checklist

Before uploading, verify:

- [ ] **Recognizable:** Clear at small sizes (40x40)
- [ ] **Simple:** Not too detailed or busy
- [ ] **Unique:** Distinct from other Islamic apps
- [ ] **Consistent:** Matches Noor's twilight/gold brand
- [ ] **No Text:** Icon should work without text
- [ ] **No Transparency:** Solid background color
- [ ] **Rounded Corners:** iOS applies automatically (don't add)
- [ ] **Safe Area:** Keep important elements away from edges

---

## Common Issues

### Issue: Icon looks blurry

**Solution:**
- Export at higher resolution (2048x2048) then downscale
- Use vector graphics software (Figma/Sketch)
- Avoid raster upscaling

### Issue: Colors look different on device

**Solution:**
- Use sRGB color space when exporting
- Test on actual device, not just simulator
- Avoid very saturated colors (they clip)

### Issue: Icon too dark/light

**Solution:**
- Noor uses dark theme (twilight blue)
- Ensure contrast with iOS background
- Gold crescent should be clearly visible

### Issue: Transparency shows as black

**Solution:**
- Remove alpha channel completely
- Add solid background color before export
- Use "Flatten Image" in image editor

---

## Android Icon (Future)

For Google Play Store (when ready):

**Adaptive Icon Requirements:**
- Foreground: 1024x1024 PNG
- Background: 1024x1024 PNG or solid color
- Monochrome: 1024x1024 PNG (for Android 13+ themed icons)

**Files:**
```
assets/images/android-icon-foreground.png (crescent + star)
assets/images/android-icon-background.png (twilight gradient)
assets/images/android-icon-monochrome.png (white crescent outline)
```

---

## Testing Icon

### On iOS Simulator

```bash
# Run app
npm start

# Icon appears in simulator home screen
```

### On Physical Device (TestFlight)

1. Build with EAS: `eas build --platform ios --profile preview`
2. Upload to TestFlight: `eas submit --platform ios`
3. Install on device via TestFlight
4. Check home screen icon

---

## Icon Variations (Future Enhancements)

Consider creating:

1. **Alternate Icons** (iOS 10.3+)
   - Light mode variant
   - Special event icons (Ramadan)
   - Premium user icons

2. **Notification Icon** (small size)
   - Simple silhouette
   - Monochrome safe

3. **Widget Icons**
   - If adding iOS widgets later

---

**Status:** Ready to convert. Use online converter or Figma for best results.

**Next:** Convert `icon-source.svg` → `icon.png` (1024x1024) and replace placeholder.
