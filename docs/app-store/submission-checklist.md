# App Store Submission Checklist

## Pre-Submission Requirements

### iOS App Store Connect
- [ ] App name registered: "Noor"
- [ ] Bundle ID confirmed: com.byteworthy.noor
- [ ] Version: 2.0.0 (build number incremented from last submission)
- [ ] Screenshots uploaded:
  - [ ] 6.7" iPhone (1290 x 2796): 6-8 screenshots
  - [ ] iPad Pro 12.9" (optional): 4 screenshots
- [ ] App preview video uploaded (optional but recommended)
- [ ] Description written (copy from docs/app-store/ios/description.md)
- [ ] Keywords entered (copy from docs/app-store/ios/keywords.txt)
- [ ] Promotional text entered
- [ ] Privacy policy URL: https://byteworthy.github.io/Noor/legal/privacy.html
- [ ] Support URL: https://byteworthy.github.io/Noor
- [ ] Support email: scale@getbyteworthy.com
- [ ] Age rating: 4+
- [ ] Content rights: Confirmed
- [ ] In-app purchases configured: Noor Plus ($2.99/mo)
- [ ] Privacy nutrition labels: All "No" (no data collection)
- [ ] Export compliance: No encryption (already configured in app.json)

### iOS Build
- [ ] Production build created: `npm run build:ios`
- [ ] Build uploaded to App Store Connect (via EAS Submit or Transporter)
- [ ] Build tested on TestFlight internally before submission
- [ ] No crashes on launch
- [ ] All permissions work correctly
- [ ] Deep links work

### Google Play Console
- [ ] App name: "Noor"
- [ ] Package name: com.byteworthy.noor
- [ ] Version: 2.0.0 (version code incremented)
- [ ] Screenshots: 2-8 phone screenshots
- [ ] Feature graphic: 1024 x 500 px (create in Figma)
- [ ] App icon: Already in app.json
- [ ] Short description (copy from android/short-description.txt)
- [ ] Full description (copy from android/description.md)
- [ ] App category: Lifestyle
- [ ] Content rating questionnaire: Everyone
- [ ] Target audience: Everyone
- [ ] Privacy policy URL: https://byteworthy.github.io/Noor/legal/privacy.html
- [ ] Data safety section: All data collected = None

### Android Build
- [ ] Production build created: `npm run build:android`
- [ ] Build uploaded to Play Console
- [ ] Tested on Android 14 internal testing track
- [ ] No crashes on launch

## Submission Commands

```bash
# Build and submit iOS
npm run build:ios
npm run submit:ios

# Build and submit Android
npm run build:android
npm run submit:android

# Or use EAS
npm run eas:build:prod
npm run eas:submit:prod
```

## App Store Review Notes (add in submission)
"Noor is an Islamic companion app for Muslims. It includes a Quran reader with audio playback, prayer times based on user location, Arabic learning tools, and Quran memorization features. The microphone permission is used only for pronunciation recording to give users feedback on their recitation. Location is used only for prayer time calculation and is never sent to our servers."

## Expected Review Time
- iOS: 24-48 hours (first submission may take up to 7 days)
- Android: 3-7 days (first submission)

## After Approval
- [ ] Announce on social media
- [ ] Send to beta testers for feedback
- [ ] Monitor crash reports in Sentry
- [ ] Respond to App Store reviews promptly
