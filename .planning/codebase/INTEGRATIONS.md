# External Integrations - Noor CBT App

## Anthropic Claude AI API

**Purpose**: Core AI engine for reflection analysis, cognitive reframing, and practice generation

**Configuration**:
- **API Key**: `ANTHROPIC_API_KEY` (required in production, placeholder in validation mode)
- **SDK Version**: @anthropic-ai/sdk ^0.71.2

**Implementation**:
- Located in: `server/routes.ts` (main AI endpoint)
- Client: Lazy-instantiated `getAnthropicClient()` function
- Validation Mode: Returns placeholder responses when `VALIDATION_MODE=true`

**API Endpoints Using Claude**:
- `POST /api/analyze`: Cognitive distortion analysis
- `POST /api/reframe`: Islamic perspective reframing
- `POST /api/reflection/practice`: Grounding practices
- `POST /api/insights`: Insight summary generation

**Key Files**:
- `server/routes.ts`: API route implementations with Claude client
- `server/conversational-ai.ts`: Conversation state machine and NLP transforms
- `server/canonical-orchestrator.ts`: Orchestrates Claude calls with safety checks
- `server/ai-safety.ts`: Safety validation, crisis detection, scrupulosity detection

**Features**:
- System prompt: 17KB+ Islamic epistemological framework
- Rate limiting: Configurable daily limits per user tier
- Response validation: Output sanitization before client delivery
- Safety checks: Crisis detection, content validation
- Prompt modifiers: Tone classification, emotional state inference

**Related Services**:
- `server/tone-compliance-checker.ts`: Validates tone of Claude responses
- `server/failure-language.ts`: Detects and prevents failure-language in outputs
- `server/islamic-content-mapper.ts`: Maps content to Islamic framework

---

## PostgreSQL Database

**Purpose**: Persistent storage for users, reflection sessions, subscription data

**Configuration**:
- **Connection**: `DATABASE_URL` environment variable
- **Dialect**: PostgreSQL
- **Driver**: pg ^8.16.3

**Schema Tables**:
- `users`: User accounts, Stripe customer IDs (archived), subscription status
- `sessions`: Reflection history (thoughts, distortions, reframes, practices)
- `insightSummaries`: Generated pattern insights per user
- `assumptionLibrary`: User's detected thought patterns
- `userSessions`: User authentication tokens (deprecated, moved to JWT)
- `processedStripeEvents`: Webhook event tracking (archived)

**Implementation**:
- ORM: Drizzle ORM ^0.39.3
- Schema: `shared/schema.ts`
- Migrations: `drizzle-kit` in `migrations/` directory
- Configuration: `drizzle.config.ts`

**Key Files**:
- `server/db.ts`: Database client initialization
- `shared/schema.ts`: Drizzle table definitions
- `server/storage.ts`: Data persistence layer

**Features**:
- Foreign key constraints with cascade delete
- Indexes on user_id and created_at for performance
- JSONb column for flexible data storage (distortions array)
- Timestamps for audit trail

**Related**:
- `server/data-retention.ts`: Automated cleanup (24-hour schedule)
- `server/storage.ts`: Higher-level persistence API

---

## Expo Push Notifications

**Purpose**: Server-side push notifications for inactivity reminders, feature announcements

**Configuration**:
- **SDK**: expo-server-sdk ^4.0.0
- **Client SDK**: expo-notifications ^0.32.16

**Implementation**:
- Server: `server/notifications.ts` (push message templates)
- Routes: `server/notificationRoutes.ts` (API endpoints)
- Client: `client/hooks/useNotifications.ts` (notification handling)
- Client Config: `client/lib/notifications.ts` (request handler)

**Notification Types**:
- **Inactivity Reminders**: 3-day, 7-day, 14-day templates
- **Weekly Insights**: Pattern summary notifications
- **Feature Announcements**: New feature alerts
- **Encouragement Messages**: Islamic-themed motivational messages

**API Endpoints**:
- `POST /api/notifications/register`: Register device push token
- `POST /api/notifications/send`: Send notification (admin only)
- `GET /api/notifications/status`: Notification delivery status

**Key Features**:
- Islamic-themed message templates
- Platform-specific handling (iOS/Android/Web)
- TTL (time-to-live) support
- Sound and badge customization
- Channel-based organization (Android)

**Files**:
- `server/notifications.ts`: Core push notification service
- `server/notificationRoutes.ts`: REST API routes
- `client/lib/notifications.ts`: Client-side notification request handler
- `client/hooks/useNotifications.ts`: React hook for notification lifecycle

---

## Apple App Store & Google Play Store (In-App Purchases)

**Purpose**: Monetization through mobile app subscriptions

**Configuration**:
- **SDK**: react-native-iap ^14.7.6 (client-side)
- **Platforms**: iOS (Apple IAP), Android (Google Play Billing)
- **No server-side integration**: Validation happens client-side

**Implementation**:
- `client/lib/billingProvider.ts`: Main billing provider (IAP abstraction)
- `client/lib/billingConfig.ts`: Product IDs and store configuration
- `client/lib/billing.ts`: Billing utility functions
- Routes: `POST /api/billing/status` (stub endpoint, returns free tier)

**Billing Tiers**:
- Free: No limit, no payment
- Plus: Monthly/yearly subscription
- Pro: Monthly/yearly subscription

**Key Files**:
- `server/billing/index.ts`: Billing stubs (IAP moved to client)
- `client/lib/billingProvider.ts`: Main IAP provider logic
- `client/lib/billingConfig.ts`: Product configuration

**Features**:
- Async Store initialization (lazy loading)
- Cross-platform billing profile
- Receipt validation (client-side)
- Subscription restoration
- Error handling for IAP failures

**Status**:
- **Stripe server-side billing**: Archived in `archive/stripe-billing/`
- **Current approach**: Mobile-only IAP via app stores
- **No server webhook processing**: IAP receipts validated on client

---

## Sentry Error Tracking

**Purpose**: Real-time error monitoring, crash reporting, performance tracing

### Backend Integration

**Configuration**:
- **DSN**: `SENTRY_DSN` environment variable
- **SDK**: @sentry/node ^10.36.0, @sentry/profiling-node ^10.36.0
- **Status**: Optional (no-op if DSN not configured)

**Implementation**:
- Core: `server/sentry.ts`
- Initialization: `server/index.ts` calls `initSentry()`
- Error Handler: `setupSentryErrorHandler(app)`
- Integration: Automatic Express error capture

**Features**:
- PII scrubbing (thought, reframe, intention, belief fields)
- Request body redaction
- Cookie removal before sending
- Breadcrumb tracking
- User context with hashed user ID
- Environment tagging (development/production)
- Sample rates: 100% in dev, 10% in production

**Key Files**:
- `server/sentry.ts`: Sentry initialization and PII scrubbing

### Mobile Integration

**Configuration**:
- **DSN**: `EXPO_PUBLIC_SENTRY_DSN` environment variable (public)
- **SDK**: @sentry/react-native ~7.2.0
- **Status**: Stub implementation (not yet installed)

**Implementation**:
- Core: `client/lib/sentry.ts`
- Initialization: `client/App.tsx` calls `initSentry()`
- Functions: `captureException()`, `captureMessage()`, `setUser()`, `addBreadcrumb()`

**Features**:
- No-op when DSN not configured
- Placeholder for future full Sentry integration
- Error context tracking
- User identification

**Key Files**:
- `client/lib/sentry.ts`: Mobile Sentry setup (stub)

---

## Authentication & Sessions

**Purpose**: User identity verification and session management

**Implementation**:
- **Session Tokens**: Signed cookies with JWT-like tokens
- **Session Middleware**: `server/middleware/auth.ts`
- **Session Table**: `sessions` table in PostgreSQL
- **Cookie Parser**: cookie-parser ^1.4.7

**Key Files**:
- `server/middleware/auth.ts`: Session creation and validation
- `shared/schema.ts`: userSessions table definition
- `server/index.ts`: Cookie and session middleware setup

**Features**:
- Signed session cookies for CSRF protection
- User ID extraction from session
- Token expiration handling
- Email verification support

---

## Rate Limiting & Security

**Purpose**: Protect API from abuse, enforce user quotas

**Implementation**:
- **express-rate-limit**: ^8.2.1 (global rate limiting)
- **AI-specific limiter**: `server/middleware/ai-rate-limiter.ts`
- **Admin limiter**: `server/middleware/rate-limit.ts`
- **Production middleware**: `server/middleware/production.ts`

**Configuration**:
- Global rate limit: Request ID tracking
- AI routes: Daily free tier limits (1 analysis/day default)
- Admin routes: Stricter limits with admin token validation
- Windows: 15-minute to 24-hour windows

**Key Files**:
- `server/middleware/ai-rate-limiter.ts`: AI endpoint rate limiting
- `server/middleware/rate-limit.ts`: Admin endpoint limiting
- `server/middleware/production.ts`: Request ID and global limiting
- `server/routes.ts`: Per-endpoint rate limiting application

---

## Stripe Payment Processing (Archived)

**Status**: Deprecated for mobile app

**Previous Configuration**:
- **Keys**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- **SDK**: stripe ^20.0.0 (installed but not used for mobile)
- **Sync**: stripe-replit-sync ^1.0.0 (for Replit deployments)

**Current Location**:
- Archived code: `archive/stripe-billing/`
- Stub implementation: `server/billing/index.ts`

**Why Archived**:
- Mobile apps require Apple IAP / Google Play Billing
- Stripe was previously used for web/admin billing only
- Client-side IAP is now the sole billing mechanism

**Remaining Code**:
- `server/billing/index.ts`: Stub routes (return 400 with "use IAP" message)
- Migration initialization: `initStripe()` in `server/index.ts` (no-op safe)

---

## External Services & Infrastructure

### Replit Deployment Integration

**Purpose**: Hosting platform for Expo backend

**Configuration**:
- **Environment**: `REPLIT_DOMAINS`, `REPLIT_DEV_DOMAIN`
- **Proxy**: Configured in `expo:dev` script
- **CORS**: Dynamic origin validation in `setupCors()`

**Implementation**:
- CORS setup: Replit domain whitelisting
- Manifest serving: Dynamic Expo manifest delivery
- Landing page: Custom HTML template for Replit environment

**Related Files**:
- `server/index.ts`: Replit domain configuration
- `server/templates/landing-page.html`: Landing page template

---

## Data Encryption

**Purpose**: Encrypt sensitive user data at rest

**Configuration**:
- **Key**: `ENCRYPTION_KEY` environment variable (optional)
- **Algorithm**: AES-256-GCM (implied by standard encryption practices)

**Implementation**:
- `server/encryption.ts`: Encryption/decryption utilities
- Optional: Only applied if `ENCRYPTION_KEY` configured

**Key Files**:
- `server/encryption.ts`: `encryptData()`, `decryptData()` functions

---

## Data Retention & Compliance

**Purpose**: Automated cleanup of old user data, compliance with retention policies

**Configuration**:
- **Schedule**: 24-hour cleanup intervals
- **Triggers**: Manual cleanup via admin endpoint

**Implementation**:
- Core: `server/data-retention.ts`
- Scheduler: Automatic cleanup on server startup
- Admin Endpoint: `POST /api/admin/cleanup` (token-validated)

**Features**:
- Cascade delete via foreign key constraints
- User deletion (deletes all related data)
- Session cleanup (expired tokens)
- Configurable retention windows

**Key Files**:
- `server/data-retention.ts`: Retention policies and cleanup logic

---

## Export Formats & File Handling

**Purpose**: Data export and integration with external systems

**Current Status**:
- No active CSV/JSON export integrations
- Reflection data stored in PostgreSQL only
- Possible future integrations: Analytics platforms, backup services

---

## Development & Build Services

### Expo Application Services (EAS)

**Purpose**: Cloud builds and submission for iOS/Android

**Configuration**:
- **Project ID**: `b3e205eb-b119-4976-a275-df7bcef85275`
- **Profiles**: Development, Preview, Production (in `eas.json`)
- **CLI**: EAS CLI (via npm scripts)

**Build Scripts**:
- `eas:build:dev`: Development build (local testing)
- `eas:build:preview`: Preview APK/IPA (internal distribution)
- `eas:build:prod`: Production build (app store submission)
- `eas:submit:ios`: Submit to Apple App Store
- `eas:submit:android`: Submit to Google Play Store

---

## Summary of External Dependencies

| Service | Purpose | Status | SDK Version |
|---------|---------|--------|-------------|
| **Anthropic Claude** | AI analysis & reframing | ✅ Active | ^0.71.2 |
| **PostgreSQL** | Database | ✅ Active | pg ^8.16.3 |
| **Expo Push** | Push notifications | ✅ Active | ^4.0.0 |
| **Apple IAP** | iOS subscriptions | ✅ Active | via react-native-iap ^14.7.6 |
| **Google Play Billing** | Android subscriptions | ✅ Active | via react-native-iap ^14.7.6 |
| **Sentry** | Error tracking | ⚠️ Optional | @sentry/node ^10.36.0 |
| **Stripe** | Payment processing | ⚠️ Archived | ^20.0.0 (not used) |
| **Replit** | Hosting platform | ⚠️ Optional | n/a |
| **EAS** | App builds & submission | ✅ Active | CLI tool |

---

## Configuration Management

**Environment Variables Handling**:
- `server/config.ts`: Centralized configuration validation
- `VALIDATION_MODE`: Feature flag for testing without real keys
- Fail-fast checks in production
- Placeholder detection for incomplete configs

**Validation Responses**:
- When `VALIDATION_MODE=true` and API keys missing:
  - Claude API: Returns example analysis structure
  - Billing: Disabled
  - Notifications: Can still register tokens
  - Database: Uses in-memory persistence (if not configured)

