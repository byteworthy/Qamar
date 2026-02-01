# Build Commands Reference - Noor

Quick reference for all build, test, and deployment commands.

---

## Development

```bash
# Start development server
npm start

# Start with QR code for physical device testing
npm start --clear

# Start iOS simulator
npm run ios

# Start Android emulator
npm run android

# Run TypeScript type checking
npm run check:types

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Clear Metro bundler cache
npm start -- --reset-cache
```

---

## EAS Build (Production)

### iOS Production Build (App Store)

```bash
# Build for App Store submission
eas build --platform ios --profile production

# Check build status
eas build:list

# View specific build details
eas build:view [BUILD_ID]
```

### iOS Preview Build (TestFlight)

```bash
# Build for internal testing
eas build --platform ios --profile preview

# Automatically submit to TestFlight after build
eas build --platform ios --profile preview --auto-submit
```

### Development Build (for Expo Go alternative)

```bash
# Build development client (includes dev tools)
eas build --platform ios --profile development
```

---

## EAS Submit (App Store Connect)

### Submit to App Store

```bash
# Submit latest production build to App Store Connect
eas submit --platform ios --latest

# Submit specific build
eas submit --platform ios --id [BUILD_ID]

# Submit to TestFlight for internal testing
eas build --platform ios --profile preview --auto-submit
```

---

## Code Quality

### Type Checking

```bash
# Check TypeScript types (no emit)
npm run check:types

# Watch mode (continuous checking)
tsc --noEmit --watch
```

### Linting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### Formatting

```bash
# Check formatting (if using Prettier)
npm run format:check

# Auto-format files
npm run format
```

---

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- path/to/test.test.ts

# Run with coverage report
npm test -- --coverage
```

### E2E Tests (if configured)

```bash
# Run E2E tests (Detox)
npm run test:e2e

# Build E2E app
npm run test:e2e:build
```

---

## Environment Management

### Check Environment Variables

```bash
# Print environment variables (development)
npx expo config --type introspect

# Validate production config
NODE_ENV=production npx expo config --type introspect
```

### Switch Environments

```bash
# Development (default)
npm start

# Production (uses .env.production)
NODE_ENV=production npm start

# Preview (uses .env.preview if exists)
NODE_ENV=preview npm start
```

---

## EAS Configuration

### View Project Configuration

```bash
# Show current EAS project
eas whoami

# Show project details
eas project:info

# List all builds
eas build:list --limit 10
```

### Update EAS

```bash
# Update EAS CLI
npm install -g eas-cli@latest

# Re-authenticate
eas login

# Link project (if needed)
eas init
```

---

## Debugging

### View Logs

```bash
# Metro bundler logs (real-time)
npm start

# EAS Build logs
eas build:view [BUILD_ID]

# Backend logs (if deployed to Railway)
railway logs --tail
```

### Clear Caches

```bash
# Clear Metro cache
npm start -- --reset-cache

# Clear Expo cache
expo start --clear

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Database (Backend)

### Migrations

```bash
# Run migrations (Railway)
railway run npm run db:migrate

# Create new migration
npm run db:migrate:create -- name_of_migration

# Rollback last migration
npm run db:migrate:undo
```

### Seed Data

```bash
# Seed development database
npm run db:seed

# Seed production (use carefully!)
railway run npm run db:seed:production
```

---

## Common Workflows

### Full Production Build & Submit

```bash
# 1. Type check
npm run check:types

# 2. Run tests
npm test

# 3. Build for App Store
eas build --platform ios --profile production

# 4. Wait for build to complete...

# 5. Submit to App Store Connect
eas submit --platform ios --latest
```

### Quick TestFlight Release

```bash
# Build and auto-submit to TestFlight
eas build --platform ios --profile preview --auto-submit
```

### Local Development Iteration

```bash
# 1. Start dev server
npm start

# 2. Make code changes

# 3. Check types (in separate terminal)
npm run check:types

# 4. Run affected tests
npm test -- path/to/changed/file.test.ts

# 5. App auto-reloads in simulator/device
```

---

## Troubleshooting Commands

### Build Failures

```bash
# View detailed build logs
eas build:view [BUILD_ID]

# Re-run failed build
eas build --platform ios --profile production --no-wait
```

### Type Errors

```bash
# Check types with verbose output
tsc --noEmit --pretty

# Find specific type error
tsc --noEmit | grep "error TS"
```

### Dependency Issues

```bash
# Verify package.json integrity
npm audit

# Update dependencies
npm update

# Force clean install
rm -rf node_modules package-lock.json
npm install
```

---

## Environment Variable Commands

### Development

```bash
# Check if env vars are loaded
node -e "console.log(process.env.EXPO_PUBLIC_API_URL)"
```

### Production (EAS Build)

Environment variables for production builds are set in:
1. `eas.json` → `build.production.env`
2. `.env.production` file (auto-loaded by EAS)
3. EAS Secrets (for sensitive values)

```bash
# Create EAS secret
eas secret:create --scope project --name OPENAI_API_KEY --value sk-...

# List secrets
eas secret:list

# Delete secret
eas secret:delete --name OPENAI_API_KEY
```

---

## CI/CD (Future)

### GitHub Actions (when configured)

```bash
# Trigger build via GitHub Actions
git push origin main

# View workflow runs
gh workflow list
gh run list
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Start dev server | `npm start` |
| Type check | `npm run check:types` |
| Run tests | `npm test` |
| Build for App Store | `eas build --platform ios --profile production` |
| Build for TestFlight | `eas build --platform ios --profile preview` |
| Submit to App Store | `eas submit --platform ios --latest` |
| View build status | `eas build:list` |
| Clear cache | `npm start -- --reset-cache` |
| Backend logs | `railway logs` |
| Database migrations | `railway run npm run db:migrate` |

---

**Tip:** Bookmark this file for quick command lookup during development.
