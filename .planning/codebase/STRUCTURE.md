# Noor CBT Application Directory Structure

## Root Directory Layout

```
C:\Dev\Noor-CBT
├── client/                    # React Native/Expo frontend application
├── server/                    # Express.js backend application
├── shared/                    # Shared type definitions and constants
├── e2e/                       # End-to-end tests (Detox)
├── assets/                    # Static assets (images, fonts)
├── scripts/                   # Build and deployment scripts
├── .planning/                 # Documentation and planning artifacts
├── .vscode/                   # VS Code workspace configuration
├── .github/                   # GitHub CI/CD workflows
├── package.json              # Root package.json (main workspace)
├── tsconfig.json             # Root TypeScript configuration
├── babel.config.js           # Babel configuration for Expo
├── jest.config.js            # Jest configuration (server tests)
├── jest.config.mobile.js     # Jest configuration (client tests)
├── .detoxrc.js              # Detox E2E test configuration
└── app.json                  # Expo app configuration
```

---

## Client Directory (`client/`)

**Purpose:** React Native/Expo frontend application

```
client/
├── App.tsx                           # Root application component
│                                     # - Initializes Sentry, fonts, providers
│                                     # - Wraps app in ErrorBoundary
│                                     # - Sets up React Query, navigation
│
├── components/                       # Reusable UI components
│   ├── Button.tsx                   # Primary action button
│   ├── Card.tsx                     # Container card component
│   ├── EmptyState.tsx               # Empty state placeholder
│   ├── ErrorBoundary.tsx            # App-level error boundary
│   ├── ErrorFallback.tsx            # Error fallback UI
│   ├── ExitConfirmationModal.tsx    # Confirm before exiting flow
│   ├── GeometricPattern.tsx         # Decorative geometric background
│   ├── GradientBackground.tsx       # Gradient overlay component
│   ├── HeaderTitle.tsx              # Custom header title
│   ├── KeyboardAwareScrollViewCompat.tsx # Keyboard-aware scrolling
│   ├── LoadingSkeleton.tsx          # Skeleton loading state
│   ├── LoadingState.tsx             # Loading spinner/state
│   ├── ReflectionProgress.tsx       # Step progress indicator
│   ├── Screen.tsx                   # Base screen wrapper
│   ├── ScreenErrorBoundary.tsx      # Per-screen error boundary
│   ├── Spacer.tsx                   # Vertical spacing component
│   ├── ThemedText.tsx               # Themed text with colors/fonts
│   ├── ThemedView.tsx               # Themed view with colors
│   ├── Toast.tsx                    # Toast notification component
│   └── __tests__/
│       ├── Button.test.tsx
│       ├── Screen.test.tsx
│       └── ThemedText.test.tsx
│
├── constants/                        # Application constants
│   ├── brand.ts                     # Brand colors and fonts
│   ├── layout.ts                    # Layout dimensions/spacing
│   └── theme.ts                     # Complete theme definition (dark/light)
│
├── hooks/                            # Custom React hooks
│   ├── useColorScheme.ts            # Color scheme detection (mobile)
│   ├── useColorScheme.web.ts        # Color scheme detection (web)
│   ├── useNotifications.ts          # Notification permission/scheduling
│   ├── useScreenOptions.ts          # Consistent screen header options
│   └── useTheme.ts                  # Theme context hook
│
├── lib/                              # Utility libraries and helpers
│   ├── api.ts                       # API request helper functions
│   │                                # - getApiUrl() - base URL
│   │                                # - apiRequest() - fetch wrapper
│   │                                # - getQueryFn() - React Query adapter
│   │
│   ├── billing.ts                   # Billing/IAP client (in-app purchases)
│   ├── billingConfig.ts             # Product IDs and pricing config
│   ├── billingProvider.ts           # Billing state provider
│   ├── config.ts                    # App configuration
│   ├── haptics.ts                   # Haptic feedback utilities
│   ├── notifications.ts             # Notification setup and handlers
│   ├── query-client.ts              # React Query client configuration
│   │                                # - Retry logic (network/server/client)
│   │                                # - Cache settings (staleTime, etc.)
│   │
│   ├── sentry.ts                    # Sentry error tracking init
│   └── storage.ts                   # AsyncStorage wrapper for persistence
│
├── navigation/                       # React Navigation configuration
│   ├── RootStackNavigator.tsx       # Main stack navigator
│   │                                # - Routes: Onboarding, Main, Modals
│   │                                # - Deep linking configuration
│   │                                # - Initial route based on onboarding
│   │
│   └── TabNavigator.tsx             # Bottom tab navigator
│                                     # - Tabs: Home, Explore, Profile
│                                     # - Animated tab icons
│
├── screens/                          # Application screens (full-page views)
│   ├── HomeScreen.tsx               # Home tab - latest sessions/quick start
│   ├── ExploreScreen.tsx            # Explore tab - content library/guidance
│   ├── ProfileScreen.tsx            # Profile tab - user settings/account
│   ├── HistoryScreen.tsx            # Past reflections/sessions
│   ├── InsightsScreen.tsx           # Aggregated insights and patterns
│   ├── PricingScreen.tsx            # Subscription pricing display
│   ├── BillingSuccessScreen.tsx     # Confirmation after purchase
│   │
│   ├── ThoughtCaptureScreen.tsx     # [Session Step 0] Capture initial thought
│   │                                # - Prompts user to express distressing thought
│   │                                # - Emotional intensity scale (1-5)
│   │                                # - Body awareness prompt (somatic)
│   │
│   ├── DistortionScreen.tsx         # [Session Step 1] Identify cognitive distortions
│   │                                # - Displays AI-identified distortions
│   │                                # - Shows pattern analysis
│   │                                # - Emotional intensity tracking
│   │
│   ├── BeliefInspectionScreen.tsx   # [Session Step 2] Examine belief strength
│   │                                # - Quantifies belief conviction (0-100%)
│   │                                # - Explores evidence for/against belief
│   │
│   ├── ReframeScreen.tsx            # [Session Step 3] Generate reframe
│   │                                # - Displays AI-generated perspective
│   │                                # - Islamic anchors/guidance
│   │                                # - Next practical steps
│   │
│   ├── RegulationScreen.tsx         # [Session Step 4] Calming practice
│   │                                # - Guided breathing/grounding practice
│   │                                # - Islamic invocations (duas)
│   │                                # - Body-based regulation
│   │
│   ├── IntentionScreen.tsx          # [Session Step 5] Set intention
│   │                                # - Reflects on lessons learned
│   │                                # - Establishes actionable intention
│   │                                # - Connects to Islamic niyyah (purpose)
│   │
│   ├── SessionCompleteScreen.tsx    # [Session Step 6] Summary and reflection
│   │                                # - Recap of entire session
│   │                                # - Option to save or discard
│   │                                # - Encouragement for follow-up
│   │
│   ├── CalmingPracticeScreen.tsx    # Standalone guided practice
│   │                                # - Breathing exercises
│   │                                # - Mindfulness/body scan
│   │
│   ├── DuaScreen.tsx                # Islamic invocations library
│   │                                # - Contextual duas by emotional state
│   │                                # - English and Arabic text
│   │                                # - Recitation guidance
│   │
│   ├── onboarding/
│   │   ├── WelcomeScreen.tsx        # Intro and app overview
│   │   ├── PrivacyScreen.tsx        # Privacy policy and data handling
│   │   └── SafetyScreen.tsx         # Safety information and crisis resources
│   │
│   └── __tests__/                   # Screen component tests
│       ├── DistortionScreen.test.tsx
│       ├── HomeScreen.test.tsx
│       ├── PricingScreen.test.tsx
│       ├── ReframeScreen.test.tsx
│       ├── SessionCompleteScreen.test.tsx
│       └── ThoughtCaptureScreen.test.tsx
│
└── __tests__/
    └── setup.ts                     # Jest setup and mocks
```

### Client Naming Conventions

| Pattern | Example | Purpose |
|---------|---------|---------|
| Component files | `Button.tsx` | PascalCase, one component per file |
| Hook files | `useColorScheme.ts` | camelCase, use prefix |
| Library files | `api.ts` | lowercase, descriptive names |
| Screens | `HomeScreen.tsx` | `[Name]Screen.tsx` pattern |
| Constants | `theme.ts` | lowercase, descriptive |
| Types | Inline in files | Exported near where used |
| Tests | `Component.test.tsx` | Same name as file being tested |

---

## Server Directory (`server/`)

**Purpose:** Express.js backend application

### Core Entry Point and Middleware

```
server/
├── index.ts                         # Main server entry point
│                                     # - Express app initialization
│                                     # - Middleware pipeline setup
│                                     # - Server startup (port 5000)
│
├── middleware/
│   ├── auth.ts                      # Session authentication middleware
│   │                                # - Creates/validates signed session cookies
│   │                                # - Extracts userId to req.auth.userId
│   │
│   ├── production.ts                # Production middleware
│   │                                # - Request ID generation/correlation
│   │                                # - Request/response logging
│   │
│   ├── rate-limit.ts                # Generic rate limiting
│   │                                # - Admin endpoint limiter
│   │
│   └── ai-rate-limiter.ts           # AI-specific rate limiting
│                                     # - Per-user daily limits
│                                     # - Inference-specific limits
│
└── templates/
    └── landing-page.html            # Static HTML landing page
                                      # - Served at /
                                      # - Dynamic manifest routing
```

### Routing and API Layer

```
├── routes.ts                        # Main route registration
│                                     # - Registers all endpoint handlers
│                                     # - POST /api/analyze
│                                     # - POST /api/reframe
│                                     # - POST /api/reflection
│                                     # - GET /api/sessions
│                                     # - GET /api/user/state
│                                     # - Returns HTTP server instance
│
├── health.ts                        # Health check route
│                                     # - GET /api/health
│                                     # - Returns { status: "ok" }
│
└── notificationRoutes.ts            # Push notification endpoints
                                      # - Registered via routes.ts
                                      # - Handles Expo notifications
```

### Therapeutic AI Logic Layer

```
├── conversational-ai.ts             # AI interaction patterns
│   │                                 # - EmotionalIntelligence class
│   │                                 # - PatternDetector for tracking themes
│   │                                 # - buildConversationalPromptModifier()
│   │
│   ├── canonical-orchestrator.ts    # Multi-step workflow orchestration
│   │                                 # - Ensures data continuity across steps
│   │                                 # - Builds system prompts with full context
│   │                                 # - Maintains audit trail of decisions
│   │
│   ├── ai-safety.ts                 # Safety validation and crisis detection
│   │                                 # - detectCrisis(text) → boolean
│   │                                 # - detectScrupulosity(text) → boolean
│   │                                 # - validateAIOutput(response) → boolean
│   │                                 # - validateAndSanitizeInput(text) → sanitized
│   │                                 # - CRISIS_RESOURCES constant with helplines
│   │                                 # - SCRUPULOSITY_RESPONSE for OCD-like patterns
│   │
│   ├── stateInference.ts            # Emotional/psychological state detection
│   │                                 # - inferInnerState(thought, intensity)
│   │                                 # - detectAssumptionPattern(thought)
│   │                                 # - getStatePromptModifier(state)
│   │                                 # - Maps states: anxiety, grief, doubt, etc.
│   │
│   ├── toneClassifier.ts            # User tone analysis
│   │                                 # - classifyTone(userInput)
│   │                                 # - getTonePromptModifier(tone)
│   │                                 # - Adapts AI warmth based on tone
│   │
│   ├── islamic-content-mapper.ts    # Routes states to Islamic guidance
│   │                                 # - Maps emotional state → relevant Quran/hadith
│   │                                 # - Retrieves from QURAN_BY_STATE / HADITH_BY_STATE
│   │                                 # - Provides cultural-spiritual anchors
│   │
│   ├── failure-language.ts          # Therapeutic language patterns
│   │                                 # - Reframes failures as learning
│   │                                 # - Compassionate error handling messages
│   │
│   └── charter-compliance.ts        # Islamic charter adherence checks
                                      # - Validates outputs align with safety charter
                                      # - Tone compliance checking
```

### State and Inference Modules

```
├── conversation-state-machine.ts    # State machine for session flow
│                                     # - Tracks step progression
│                                     # - Validates transitions
│
└── tone-compliance-checker.ts       # Validates tone appropriateness
                                      # - Ensures responses match user context
```

### Data and Storage Layer

```
├── db.ts                            # Database initialization
│                                     # - PostgreSQL connection pool
│                                     # - Drizzle ORM instance
│                                     # - Graceful shutdown on SIGTERM
│
├── storage.ts                       # Data persistence layer
│                                     # - Database queries for sessions
│                                     # - User data retrieval
│
├── data-retention.ts                # Data lifecycle management
│                                     # - initializeDataRetention() - 24h cleanup
│                                     # - runManualCleanup() - on-demand cleanup
│                                     # - verifyAdminToken() - admin verification
│                                     # - isAdminEndpointEnabled() - feature flag
│
└── encryption.ts                    # Data encryption utilities
                                      # - encryptData(plaintext)
                                      # - decryptData(ciphertext)
                                      # - Protects sensitive fields
```

### Billing and Payments

```
├── billing/
│   └── index.ts                     # Stripe integration
│                                     # - registerBillingRoutes()
│                                     # - registerBillingWebhookRoute()
│                                     # - getStripeSync()
│                                     # - Handles subscriptions and webhooks
│
└── notificationRoutes.ts            # Notification delivery (push/email)
```

### Configuration and Initialization

```
├── config.ts                        # Environment configuration
│                                     # - VALIDATION_MODE check
│                                     # - logConfigStatus()
│                                     # - validateProductionConfig()
│                                     # - isAnthropicConfigured()
│                                     # - isStripeConfigured()
│
├── sentry.ts                        # Error tracking setup
│                                     # - initSentry()
│                                     # - setupSentryErrorHandler()
│                                     # - captureException()
│
└── returnSummaries.ts               # Generates session summaries
                                      # - Called after reflection completion
                                      # - Returns insights and next steps
```

### Utility and Helper Modules

```
├── utils/
│   └── promptLoader.ts              # Loads prompt templates from files
│                                     # - loadPrompt(filename)
│                                     # - Supports template variables
│
└── __tests__/
    ├── safety-system.test.ts        # Safety feature tests
    └── e2e-journey.test.ts          # End-to-end workflow tests
```

### Server Naming Conventions

| Pattern | Example | Purpose |
|---------|---------|---------|
| Routes | `routes.ts` | Lowercase, describes routing |
| Middleware | `auth.ts` | Lowercase, in `middleware/` dir |
| Modules | `conversational-ai.ts` | kebab-case for compound names |
| Functions | `detectCrisis()` | camelCase, action verbs |
| Classes | `CanonicalOrchestrator` | PascalCase for classes |
| Constants | `CRISIS_RESOURCES` | UPPERCASE for constants |
| Types | `EmotionalState` | PascalCase, exported at top |

---

## Shared Directory (`shared/`)

**Purpose:** Type definitions and constants shared between client and server

```
shared/
├── islamic-framework.ts             # Islamic psychological concepts
│                                     # - IslamicConcept type union
│                                     # - ConceptDefinition interface
│                                     # - ISLAMIC_CONCEPTS record (niyyah, sabr, etc.)
│                                     # - EmotionalState type (anxiety, grief, etc.)
│                                     # - DistressLevel type (emergency, urgent, concern)
│                                     # - QURAN_BY_STATE mapping
│                                     # - HADITH_BY_STATE mapping
│                                     # - DISTRESS_RESPONSE_MATRIX
│
├── schema.ts                        # Zod validation schemas
│                                     # - Input validation for all API endpoints
│                                     # - Sanitization rules
│                                     # - Type exports from schemas
│
├── islamic-content-expansion.ts    # Extended Islamic content
│                                     # - Additional duas and invocations
│                                     # - Contextual guidance by state
│                                     # - Quranic references with explanations
│
└── (Type definitions are inline in client/lib/api.ts and elsewhere)
```

### Shared Type Examples

```typescript
// islamic-framework.ts
export type IslamicConcept =
  | "niyyah"      // Intention
  | "sabr"        // Patience
  | "tawakkul"    // Trust/Reliance
  | "tazkiyah"    // Soul purification
  | "shukr"       // Gratitude
  | "tawbah"      // Repentance
  | "dhikr"       // Remembrance
  | "muraqaba"    // Mindfulness
  | "muhasaba"    // Self-accountability
  | "ridha"       // Contentment
  | "khushu"      // Humble presence
  | "ikhlas"      // Sincerity

export type EmotionalState =
  | "anxiety"
  | "depression"
  | "doubt"
  | "overwhelm"
  | "grief"
  | "shame"
  | "anger"
  | "hopelessness"

export const QURAN_BY_STATE: Record<EmotionalState, Ayah[]> = {
  anxiety: [
    { surah: 94, ayah: 5, meaning: "...with difficulty comes ease" },
    { surah: 2, ayah: 286, meaning: "Allah does not burden except within capacity" }
  ],
  // ... other states
}

export const HADITH_BY_STATE: Record<EmotionalState, Hadith[]> = {
  anxiety: [
    { text: "Worry is not from faith", source: "At-Tirmidhi" },
    // ...
  ],
  // ... other states
}
```

---

## Key File Locations by Functionality

### How to Find Specific Functionality

| Functionality | Location | Key Files |
|---------------|----------|-----------|
| **User Authentication** | Server | `server/middleware/auth.ts` - Session middleware |
| | Client | `client/lib/query-client.ts` - API calls include credentials |
| **Crisis Detection** | Server | `server/ai-safety.ts` - `detectCrisis()` function |
| | Responses | Returns `CRISIS_RESOURCES` with helpline contacts |
| **CBT Cognitive Distortions** | Server | `server/routes.ts` - `/api/analyze` endpoint |
| | AI Logic | `server/conversational-ai.ts` - AI pattern detection |
| **Islamic Integration** | Shared | `shared/islamic-framework.ts` - Concepts and mappings |
| | Server | `server/islamic-content-mapper.ts` - State→Guidance routing |
| **Subscription/Billing** | Server | `server/billing/index.ts` - Stripe integration |
| | Client | `client/screens/PricingScreen.tsx` - Purchase UI |
| | Client | `client/lib/billingProvider.ts` - IAP provider |
| **Session Flow Navigation** | Client | `client/navigation/RootStackNavigator.tsx` - Route definitions |
| | Client | `client/screens/[Name]Screen.tsx` - Individual screens |
| **State Management (Remote)** | Client | `client/lib/query-client.ts` - React Query config |
| **State Inference** | Server | `server/stateInference.ts` - Emotional state detection |
| **Tone Classification** | Server | `server/toneClassifier.ts` - User tone → response adaptation |
| **Rate Limiting** | Server | `server/middleware/ai-rate-limiter.ts` - Daily/per-request limits |
| **Database** | Server | `server/db.ts` - Drizzle ORM + PostgreSQL pool |
| **Error Tracking** | Server | `server/sentry.ts` - Sentry initialization |
| | Client | `client/lib/sentry.ts` - Client Sentry setup |
| **Push Notifications** | Client | `client/lib/notifications.ts` - Setup and scheduling |
| | Client | `client/hooks/useNotifications.ts` - Notification hook |
| | Server | `server/notificationRoutes.ts` - Delivery routes |
| **Deep Linking** | Client | `client/App.tsx` - Linking configuration |
| | Client | `client/navigation/RootStackNavigator.tsx` - Route mapping |
| **Theme/Styling** | Client | `client/constants/theme.ts` - Color and style definitions |
| | Client | `client/hooks/useTheme.ts` - Theme context |
| **Haptic Feedback** | Client | `client/lib/haptics.ts` - Haptic utilities |
| | Client | `client/navigation/TabNavigator.tsx` - Used on tab press |
| **Data Retention/Cleanup** | Server | `server/data-retention.ts` - Lifecycle management |
| **Testing (Unit)** | Client | `client/__tests__/` and `client/**/__tests__/` |
| | Server | `server/__tests__/*.test.ts` |
| **Testing (E2E)** | Root | `e2e/` and `.detoxrc.js` |
| **Offline Persistence** | Client | `client/lib/storage.ts` - AsyncStorage wrapper |
| **API Types** | Client | `client/lib/api.ts` - Request/response interfaces |

---

## Module Organization Pattern

### Frontend Module Pattern
```
screens/[ScreenName]/
├── ScreenName.tsx           # Main component
├── hooks/                   # Screen-specific hooks
│   └── useFeature.ts
├── components/              # Screen-specific sub-components
│   └── SubComponent.tsx
└── __tests__/
    └── ScreenName.test.tsx
```

### Backend Module Pattern
```
[feature].ts                # Feature module
├── Types and interfaces    # At top of file
├── Constants              # Below types
├── Main logic function(s) # Core functionality
└── Exports                # At bottom
```

### Dependency Flow
```
Client:
  App.tsx
    ↓
  RootStackNavigator / TabNavigator
    ↓
  Screens
    ↓
  Components + Hooks
    ↓
  lib/ (API, storage, query-client)

Server:
  index.ts (middleware pipeline)
    ↓
  routes.ts
    ↓
  [feature-modules] (conversational-ai, stateInference, etc.)
    ↓
  db.ts (storage layer)
```

---

## Build and Output Directories

```
static-build/               # Pre-built Expo assets
├── ios/
│   └── manifest.json       # iOS Expo manifest
└── android/
    └── manifest.json       # Android Expo manifest

server_dist/                # Compiled server (after build)
└── index.js               # Bundled server code

coverage/                   # Test coverage reports
test-reports/               # Test output and reports
```

---

## Environment and Configuration Files

```
.env                        # Environment variables (git-ignored)
.env.example               # Template for .env
app.json                   # Expo app configuration
eas.json                   # EAS Build configuration
.detoxrc.js               # Detox E2E configuration
jest.config.js            # Jest config (server)
jest.config.mobile.js     # Jest config (client)
tsconfig.json             # TypeScript config (root)
babel.config.js           # Babel transpilation config
```

---

## Testing Structure

```
e2e/                        # End-to-end tests
├── [test-files].e2e.ts    # Detox test files
└── config.json            # E2E configuration

client/__tests__/           # Client unit tests
└── setup.ts               # Jest setup/mocks

client/**/__tests__/        # Component-level tests
├── Component.test.tsx
└── ...

server/__tests__/           # Server tests
├── safety-system.test.ts
├── e2e-journey.test.ts
└── ...
```

---

## Naming Conventions Summary

### TypeScript/JavaScript
- **Components:** PascalCase (`HomeScreen.tsx`)
- **Functions:** camelCase (`useColorScheme()`, `detectCrisis()`)
- **Classes:** PascalCase (`CanonicalOrchestrator`)
- **Constants:** UPPERCASE (`CRISIS_RESOURCES`, `FREE_DAILY_LIMIT`)
- **Types/Interfaces:** PascalCase (`EmotionalState`, `AnalysisResult`)
- **Variables:** camelCase (`emotionalIntensity`, `isLoading`)
- **Directories:** lowercase (`components/`, `middleware/`, `screens/`)

### Files
- **React Components:** `ComponentName.tsx`
- **Screens:** `ScreenNameScreen.tsx`
- **Hooks:** `useHookName.ts`
- **Tests:** `ComponentName.test.tsx` or `feature.test.ts`
- **Modules:** lowercase or kebab-case (`auth.ts`, `conversational-ai.ts`)

### Routes and Endpoints
- **REST endpoints:** `/api/[resource]/[action]` (kebab-case)
- **Screen names:** Descriptive with separators (`Onboarding_Welcome`, `Home`)

---

## Quick Navigation Reference

| Goal | Path |
|------|------|
| Add new screen | Create `client/screens/[Name]Screen.tsx` + add to `RootStackNavigator` |
| Add new component | Create in `client/components/` folder |
| Add new API endpoint | Add route to `server/routes.ts` |
| Add custom hook | Create in `client/hooks/useFeature.ts` |
| Add server logic | Create module in `server/[feature].ts` |
| Add shared types | Add to `shared/[domain].ts` or `client/lib/api.ts` |
| Update theme | Edit `client/constants/theme.ts` |
| Add tests | Create `.test.ts` file in same directory |
| Configure billing | Edit `client/lib/billingConfig.ts` or `server/billing/` |
| Update Islamic content | Edit `shared/islamic-framework.ts` or `server/islamic-content-mapper.ts` |
| Add rate limiting | Edit `server/middleware/ai-rate-limiter.ts` |

---

## Summary

The Noor codebase is organized as a **monorepo with clear separation** between:

1. **Client** (`client/`) - Expo/React Native UI with screens, navigation, and hooks
2. **Server** (`server/`) - Express backend with AI logic, safety checks, and data persistence
3. **Shared** (`shared/`) - Type definitions and Islamic framework constants
4. **Tests** (`e2e/`, `**/__tests__/`) - Unit and integration tests
5. **Configuration** (root) - Build configs, CI/CD, environment setup

**Navigation is simple:** Find what you need by file type and location, follow naming conventions, and use paths mentioned in this guide.
