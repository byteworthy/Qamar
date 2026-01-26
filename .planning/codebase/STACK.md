# Technology Stack - Noor CBT App

## Runtime Environment

- **Node.js**: v24.12.0 (runtime)
- **npm**: 11.6.2 (package manager)
- **TypeScript**: ~5.9.2 (language transpiler)

## Frontend - React Native / Expo

### Core Frameworks
- **React**: 19.1.0 (UI library)
- **React Native**: 0.81.5 (mobile framework)
- **Expo**: ~54.0.32 (managed React Native platform)
- **React DOM**: 19.1.0 (web rendering)
- **React Native Web**: ~0.21.0 (React Native components on web)

### Navigation & UI
- **React Navigation**: ^7.1.8 (core navigation)
  - `@react-navigation/native`: ^7.1.8
  - `@react-navigation/native-stack`: ^7.3.16
  - `@react-navigation/bottom-tabs`: ^7.4.0
  - `@react-navigation/elements`: ^2.6.3

- **React Native Gesture Handler**: ~2.28.0 (gesture recognition)
- **React Native Reanimated**: ~4.1.1 (animation library)
- **React Native Keyboard Controller**: 1.18.5 (keyboard management)
- **React Native Safe Area Context**: ~5.6.0 (safe area insets)
- **React Native Screens**: ~4.16.0 (screen native driver)

### UI Components & Styling
- **Expo Blur**: ^15.0.7 (blur effect component)
- **Expo Glass Effect**: ~0.1.6 (glass morphism effects)
- **Expo Linear Gradient**: ^15.0.8 (gradient backgrounds)
- **Expo Symbols**: ~1.0.7 (SF Symbols on iOS)
- **React Native SVG**: 15.12.1 (SVG rendering)
- **Expo Icons**: `@expo/vector-icons` ^15.0.2 (Material, Feather icons)

### Typography & Fonts
- **Expo Font**: ~14.0.11 (custom font loading)
- **@expo-google-fonts/inter**: ^0.4.2
- **@expo-google-fonts/cormorant-garamond**: ^0.4.1
- **@expo-google-fonts/amiri**: ^0.4.1 (Arabic font)

### Data & State Management
- **@tanstack/react-query**: ^5.90.7 (server state management, caching)
- **Zod**: ^3.25.76 (schema validation)
- **zod-validation-error**: ^3.5.4 (validation error formatting)

### Storage & Async
- **@react-native-async-storage/async-storage**: ^2.2.0 (persistent local storage)
- **Drizzle ORM**: ^0.39.3 (server-side ORM for PostgreSQL)

### Native Modules
- **Expo Device**: ^8.0.10 (device info)
- **Expo Linking**: ~8.0.8 (deep linking)
- **Expo Notifications**: ^0.32.16 (push notifications)
- **Expo Status Bar**: ~3.0.8 (status bar control)
- **Expo Splash Screen**: ~31.0.10 (splash screen)
- **Expo Web Browser**: ~15.0.9 (web browser integration)
- **Expo Constants**: ~18.0.9 (app constants)
- **Expo Image**: ~3.0.10 (optimized image component)
- **Expo Haptics**: ~15.0.7 (vibration/haptic feedback)

### In-App Purchases & Billing
- **react-native-iap**: ^14.7.6 (Apple IAP & Google Play Billing client-side)

### Development Tools
- **Expo Dev Client**: ~6.0.20 (custom development client)

## Backend - Express.js / Node.js

### Web Framework
- **Express**: ^4.21.2 (HTTP server framework)
- **tsx**: ^4.20.6 (TypeScript executor for Node.js)

### Database
- **pg**: ^8.16.3 (PostgreSQL client driver)
- **Drizzle ORM**: ^0.39.3 (type-safe ORM)
- **Drizzle Kit**: ^0.31.4 (migration & schema tools)
- **Database Dialect**: PostgreSQL

### API & Middleware
- **cookie-parser**: ^1.4.7 (cookie parsing middleware)
- **@types/cookie-parser**: ^1.4.10 (TypeScript types)
- **express-rate-limit**: ^8.2.1 (rate limiting)
- **http-proxy-middleware**: ^3.0.5 (HTTP proxying)

### External APIs & Services
- **@anthropic-ai/sdk**: ^0.71.2 (Anthropic Claude AI API)
- **stripe**: ^20.0.0 (Stripe API - server-side, archived for web/admin only)
- **stripe-replit-sync**: ^1.0.0 (Stripe Replit integration)
- **expo-server-sdk**: ^4.0.0 (Expo push notifications server API)

### Error Tracking & Monitoring
- **@sentry/node**: ^10.36.0 (Sentry error tracking)
- **@sentry/profiling-node**: ^10.36.0 (Sentry performance profiling)
- **@sentry/react-native**: ~7.2.0 (Sentry mobile error tracking)

### Utilities
- **ws**: ^8.18.0 (WebSocket implementation)
- **p-limit**: ^7.2.0 (concurrency control)
- **p-retry**: ^7.1.1 (retry logic)

## Build Tools & Configuration

### Bundlers & Builders
- **Babel**: babel-preset-expo, @babel/core (JavaScript transpilation)
  - **babel-plugin-module-resolver**: ^5.0.2 (path aliasing)
  - **react-native-reanimated/plugin**: (animation support)

- **Metro**: React Native's bundler (included in Expo)

### Build & Deployment
- **EAS CLI**: Expo Application Services (via `eas` commands)
- **EAS Config** (`eas.json`): Development, Preview, and Production profiles

### Testing & Quality Assurance

#### Unit & Integration Testing
- **Jest**: 29.7.0 (test runner)
- **jest-expo**: ^54.0.16 (Expo-compatible Jest configuration)
- **jest-circus**: ^30.2.0 (test circus runner)
- **ts-jest**: ^29.4.6 (TypeScript Jest integration)
- **react-test-renderer**: ^19.1.0 (React component testing)

#### Mobile E2E Testing
- **Detox**: ^20.47.0 (mobile E2E testing framework)
- **detox CLI** (`detox build`, `detox test` commands)

#### Component Testing
- **@testing-library/react-native**: ^13.3.3 (React Native testing utilities)
- **@testing-library/jest-native**: ^5.4.3 (Jest matchers for native)
- **@jest/globals**: ^30.2.0 (Jest global types)
- **@types/jest**: 29.5.14 (Jest TypeScript types)

### Code Quality & Linting
- **ESLint**: ^9.25.0 (linter)
  - **eslint-config-expo**: ~10.0.0 (Expo ESLint config)
  - **eslint-config-prettier**: ^10.1.8 (Prettier integration)
  - **eslint-plugin-prettier**: ^5.5.4 (ESLint Prettier plugin)
  - **eslint-import-resolver-node**: ^0.3.9 (import resolution)

- **Prettier**: 3.6.2 (code formatter)

### Type Checking
- **TypeScript**: ~5.9.2
- **@types/node**: 24.10.0 (Node.js types)
- **@types/express**: ^4.17.21 (Express types)
- **@types/pg**: ^8.16.0 (PostgreSQL driver types)
- **@types/react**: ~19.1.0 (React types)

## Configuration Files

### App Configuration
- **app.json**: Expo app metadata, plugins, configuration
  - App name: "Noor"
  - Bundle ID: `com.noor.app` (iOS/Android)
  - Expo Project ID: `b3e205eb-b119-4976-a275-df7bcef85275`

### Build & Development
- **tsconfig.json**: TypeScript compiler options (strict mode enabled)
- **babel.config.js**: Babel configuration with module resolution
- **jest.config.js**: Server-side Jest configuration
- **jest.config.mobile.js**: Mobile Jest configuration
- **.detoxrc.js**: Detox E2E testing configuration
- **eas.json**: EAS build profiles (development, preview, production)
- **drizzle.config.ts**: Drizzle ORM configuration (PostgreSQL dialect)

### Code Quality
- **.eslintrc.js**: ESLint configuration
- **.prettierrc**: Prettier formatting (default: 2-space indentation)

### Git & CI/CD
- **.gitignore**: Git ignore rules
- **.husky/**: Git hooks directory (pre-commit, etc.)
- **.github/workflows/**: GitHub Actions workflows

### Development
- **docker-compose.yml**: Docker Compose setup
- **Dockerfile**: Docker image definition
- **metro.config.js**: Metro bundler configuration (implicit)

## Environment Variables

Critical environment variables configured in `.env`:
- `VALIDATION_MODE`: Feature flag (true = use placeholder responses)
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `DATABASE_URL`: PostgreSQL connection string
- `ANTHROPIC_API_KEY`: Claude AI API key
- `STRIPE_SECRET_KEY`: Stripe server key (archived for mobile)
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
- `SENTRY_DSN`: Sentry error tracking DSN (backend)
- `EXPO_PUBLIC_SENTRY_DSN`: Sentry DSN (mobile, public)
- `ENCRYPTION_KEY`: Data encryption key
- `SESSION_SECRET`: Session authentication secret
- `REPLIT_DOMAINS`, `REPLIT_DEV_DOMAIN`: Replit deployment domains

## Key Architecture Decisions

### Mobile-First Billing
- Apple IAP and Google Play Billing handled **client-side** via `react-native-iap`
- Stripe server billing is archived (was used for web/admin only)
- No server-side subscription management required

### Database & ORM
- PostgreSQL primary database
- Drizzle ORM provides type-safe queries and migrations
- Schema defined in `shared/schema.ts`

### State Management
- React Query for server state and caching
- AsyncStorage for local persistence
- Redux/Zustand: Not used (React Query + AsyncStorage sufficient)

### New React Features
- **React 19** with new hooks API
- **React Compiler** enabled in app.json experiments
- New Architecture enabled in app.json

### Error Tracking
- **Sentry** integrated both backend and mobile (optional via DSN)
- PII scrubbing enabled by default
- All errors captured with request context

