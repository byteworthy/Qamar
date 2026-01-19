# Noor CBT Mobile Release Guide (EAS)

## What this enables
This repo supports three Expo EAS build tracks so releases are consistent and repeatable:
- **Development**: internal dev-client builds for local device testing.
- **Preview**: internal builds for stakeholders/testers (not app store).
- **Production**: store builds for App Store + Google Play.

## One-time setup
1) Install dependencies
```bash
npm ci
```

2) Install Expo + EAS tooling (no global install required)
```bash
npx expo --version
npx eas --version
```

3) Log in to EAS
```bash
npx eas login
npx eas whoami
```

4) Confirm the project is linked
```bash
npx eas project:info
```

## Secrets and environment configuration
The mobile client only uses **public** configuration at build time.
- **Public values** must be prefixed with `EXPO_PUBLIC_`.
- **Do not** commit secrets or include sensitive keys in the client.

### EXPO_PUBLIC_DOMAIN values (important)
- **development** uses your local network or dev server URL
- **preview** uses your staging API URL
- **production** uses your production API URL

> This prevents a production build from pointing to localhost.

### Set EAS build environment variables
Run these once per environment (replace values with your real API base domain):

```bash
# Development
npx eas secret:create --name EXPO_PUBLIC_DOMAIN --value "dev-api.yourdomain.com" --type string --scope project --environment development

# Preview
npx eas secret:create --name EXPO_PUBLIC_DOMAIN --value "staging-api.yourdomain.com" --type string --scope project --environment preview

# Production
npx eas secret:create --name EXPO_PUBLIC_DOMAIN --value "api.yourdomain.com" --type string --scope project --environment production
```

## Build and distribute
### Development client builds
```bash
npm run eas:build:dev
```

### Preview (internal distribution) builds
```bash
npm run eas:build:preview
```

### Production store builds
```bash
npm run eas:build:prod
```

## Submit to app stores
```bash
npm run eas:submit:prod
npm run eas:submit:ios
npm run eas:submit:android
```

## Offline vs login-required actions
- **Offline now:** update scripts, review configs, run typecheck/tests.
- **Login required later:** `eas build` and `eas submit` will require EAS login/EXPO_TOKEN.

## Store readiness checklist
- [ ] App Store/Play Store metadata and screenshots
- [ ] Privacy manifest strings (iOS)
- [ ] Store listing content and assets
- [ ] Production API domain set in `EXPO_PUBLIC_DOMAIN`
- [ ] EAS project linked (`eas init`)

## Troubleshooting
- **Missing bundle ID / package**: verify `app.json` has `com.noorcbt.app` for iOS and Android.
- **EAS prompts for credentials**: follow prompts or run `npx eas credentials` to manage them.
- **Icon/splash errors**: confirm the assets in `assets/images` exist and paths match `app.json`.
- **Build fails on config**: run `npm run release:check` locally.
- **Wrong API base URL**: confirm `EXPO_PUBLIC_DOMAIN` is set in EAS for the profile you are building.
