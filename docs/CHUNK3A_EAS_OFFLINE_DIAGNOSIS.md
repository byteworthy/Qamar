# Chunk 3A: EAS Offline Diagnosis

## Files Inspected

- **eas.json** (path: `eas.json`)
- **app config** (path: `app.json`)

## EAS Profiles

From `eas.json`:
- `development`
- `preview`
- `production`

## Expected Build Commands (offline scaffolding)

These commands map directly to the profiles above:
- `eas build --profile development`
- `eas build --profile preview`
- `eas build --profile production`

## Expected Submit Commands (offline scaffolding)

No submit profiles are defined in `eas.json`, so submit commands are set to use default behavior with platform flags:
- `eas submit --profile production --platform ios`
- `eas submit --profile production --platform android`

## App Config Notes

From `app.json`:
- `expo.slug`: `noor-cbt`
- `ios.bundleIdentifier`: `com.noorcbt.app`
- `android.package`: `com.noorcbt.app`
