# Noor CBT Application Architecture

## Overview

Noor is a React Native/Expo mobile application with an Express.js backend that provides Islamic-integrated Cognitive Behavioral Therapy (CBT). The application follows a **client-server monorepo architecture** with shared TypeScript definitions across both layers.

**Key Characteristics:**
- **Fully isomorphic type system** (TypeScript across client and server)
- **Islamic epistemology** as the foundational framework for therapeutic interventions
- **Session-based authentication** with signed cookies
- **AI-powered cognitive assistance** via Anthropic Claude API
- **Real-time state management** with React Query (TanStack)
- **Progressive profiling** through multi-step therapeutic workflows

---

## Architecture Pattern

### Overall Design: Layered Client-Server Monorepo

```
Monorepo Root (C:\Dev\Noor-CBT)
├── client/          [React Native/Expo Frontend]
├── server/          [Express.js Backend]
├── shared/          [Type Definitions & Shared Logic]
└── package.json     [Root Workspace]
```

**Pattern Type:** Multi-package monorepo with:
- Single `package.json` (no workspace config but shared node_modules)
- Separate TypeScript compilation contexts
- Integrated CI/CD and testing pipelines

### Architectural Principles

1. **Authentication as a Service**: Session middleware handles user identity
2. **AI as Infrastructure**: Anthropic integration abstracted from UI concerns
3. **Islamic Integration**: Not a plugin—embedded in system prompts and data models
4. **Progressive Disclosure**: Complexity revealed through navigational flow, not overwhelming UX
5. **Data Retention & Privacy**: Active cleanup service, user consent framework

---

## Layer Structure

### 1. Presentation Layer (Client)

**Entry Point:** `client/App.tsx`

**Core Responsibilities:**
- Navigation and routing via React Navigation
- UI rendering with React Native components
- Local state management with React Query (remote state)
- Async storage for offline persistence
- Error boundaries and error recovery

**Key Components:**
- **Navigation:** Tab-based (Home/Explore/Profile) + Modal stack overlays
- **Screens:** 14 unique therapeutic screens + 3 onboarding screens
- **Components:** Reusable UI primitives (Button, Card, Screen, etc.)
- **Hooks:** Custom hooks for theme, notifications, API calls
- **Provider Tree:**
  ```
  ErrorBoundary
    → QueryClientProvider (React Query)
      → SafeAreaProvider
        → GestureHandlerRootView
          → KeyboardProvider
            → NavigationContainer
              → RootStackNavigator + TabNavigator
  ```

### 2. Business Logic Layer (Server)

**Entry Point:** `server/index.ts`

**Core Responsibilities:**
- HTTP request routing and validation
- AI integration orchestration
- User state inference and safety checks
- Session/authentication management
- Data persistence and retrieval
- Webhook handling (Stripe billing)
- Rate limiting and DDoS protection

**Key Modules:**
- `routes.ts` - Main API endpoint definitions
- `conversational-ai.ts` - AI interaction patterns and context builders
- `ai-safety.ts` - Crisis detection, scrupulosity checks, validation
- `canonical-orchestrator.ts` - Coordinates multi-step therapeutic flows
- `stateInference.ts` - Detects emotional/psychological state from text
- `toneClassifier.ts` - Analyzes user tone for therapeutic adaptation
- `islamic-content-mapper.ts` - Routes user states to relevant Islamic guidance
- `billing/index.ts` - Stripe subscription management

### 3. Data Layer (Server)

**Database:** PostgreSQL via Drizzle ORM

**Data Access Pattern:**
```typescript
// Database connection pool with production settings
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

export const db = drizzle(pool);
```

**Key Entities:**
- User sessions (session middleware maintains in-memory state)
- Reflection history (past CBT sessions)
- Billing/subscription data (synced with Stripe)
- System logs (audit trail for safety)

**Access Pattern:** Drizzle ORM provides type-safe queries

---

## Data Flow

### Request-Response Cycle

```
CLIENT REQUEST
    ↓
[Express Middleware Pipeline]
  1. CORS Setup
  2. Request ID + Rate Limiting
  3. Body Parsing (JSON/urlencoded)
  4. Cookie Parser
  5. Session Middleware → req.auth.userId
  6. Request Logging
    ↓
[Route Handler]
  1. Input Validation (Zod schemas)
  2. Check rate limits (per-user or per-endpoint)
  3. Fetch/update database
  4. Invoke AI (if needed)
  5. Safety checks (crisis, scrupulosity)
    ↓
[Response]
  1. Capture response data
  2. Log (excluding sensitive routes)
  3. Send JSON
    ↓
CLIENT RECEIVES & UPDATES
  1. React Query caches response
  2. UI re-renders with new data
  3. Optimistic updates (mutations)
```

### Therapeutic Session Data Flow

```
User Input (ThoughtCaptureScreen)
    ↓
POST /api/analyze
    ├─ Extract distortions (AI)
    ├─ Classify tone
    ├─ Infer emotional state
    ├─ Detect crisis/scrupulosity
    └─ Return AnalysisResult
    ↓
Navigation to DistortionScreen (with analysis data)
    ↓
User confirms → POST /api/reframe
    ├─ Generate reframe (AI)
    ├─ Apply emotional intensity scaling
    ├─ Insert Islamic anchors
    └─ Return ReframeResult
    ↓
Sequential flow through Regulation → Intention → SessionComplete
    ↓
Data persisted to database (session_history)
    ↓
History screen retrieves via React Query caching
```

---

## Key Abstractions and Patterns

### 1. State Inference Engine
**Module:** `stateInference.ts`

Analyzes user input to infer psychological state:
```typescript
export async function inferInnerState(
  thought: string,
  emotionalIntensity?: number
): Promise<EmotionalState> {
  // Uses Claude to categorize: anxiety, depression, doubt, overwhelm, etc.
  // Feeds into DISTRESS_RESPONSE_MATRIX for targeted guidance
}
```

**Mapping:** Each detected state → relevant Islamic verses/hadith via `QURAN_BY_STATE` and `HADITH_BY_STATE`

### 2. Canonical Orchestrator
**Module:** `canonical-orchestrator.ts`

Manages multi-step therapeutic workflows:
```typescript
export class CanonicalOrchestrator {
  validateWorkflow()    // Ensure data continuity
  buildSystemPrompt()   // Context-aware prompting
  logAuditTrail()      // Non-repudiation logging
}
```

Ensures each step (analyze → reframe → regulate → intend) receives proper context without information loss.

### 3. AI Safety Integration
**Module:** `ai-safety.ts`

Multi-layer safety checks:
```typescript
// Crisis detection (suicidal ideation, self-harm)
if (detectCrisis(userThought)) {
  return CRISIS_RESOURCES with immediate help contacts
}

// Scrupulosity detection (OCD-like religious obsession)
if (detectScrupulosity(userThought)) {
  return SCRUPULOSITY_RESPONSE (reassurance against harm)
}

// Validation of AI outputs
validateAIOutput(aiResponse) // Ensures output matches format
```

### 4. Islamic Content Integration
**Module:** `islamic-content-mapper.ts`

Maps emotional states to contextual Islamic guidance:
```typescript
export const QURAN_BY_STATE: Record<EmotionalState, Ayah[]> = {
  anxiety: [
    { surah: 94, ayah: 5, text: "...with difficulty comes ease" }
  ],
  grief: [ ... ],
  doubt: [ ... ]
}
```

**Not decorative:** Islamic concepts are integrated into prompt modifiers and system foundation.

### 5. Tone Classifier
**Module:** `toneClassifier.ts`

Detects user emotional tone to adapt AI responses:
```typescript
export async function classifyTone(userInput: string): Promise<Tone> {
  // harsh, defensive, hopeful, resigned, etc.
  // Returns prompt modifier to adjust AI warmth/directness
}
```

### 6. Emoji-Safe Validation
**Module:** `ai-safety.ts`

Sanitizes and validates user input:
```typescript
export function validateAndSanitizeInput(
  input: string,
  maxLength: number = 2000
): { valid: boolean; sanitized: string; issues: string[] } {
  // Remove emojis (can trigger crisis detection false positives)
  // Check length
  // Flag rapid submissions (rate limiting)
}
```

---

## Entry Points

### Client Entry Point: `client/App.tsx`

1. **Initialization:**
   - Initializes Sentry error tracking (no-op if not configured)
   - Loads custom fonts (Inter, Cormorant Garamond, Amiri for Arabic)
   - Initializes notifications system

2. **Provider Wrapping:**
   - Wraps entire app in ErrorBoundary
   - QueryClientProvider for React Query (remote state)
   - SafeAreaProvider for notch/safe area handling
   - GestureHandlerRootView for touch gestures
   - KeyboardProvider for keyboard awareness

3. **Navigation Setup:**
   - Configures deep linking (expo://, https://)
   - Routes mapped in `RootStackNavigator`
   - Initial route determined by onboarding completion status

### Server Entry Point: `server/index.ts`

1. **Configuration:**
   - Validates environment variables
   - Logs configuration status (validation mode, Sentry, Anthropic)
   - Initializes Sentry for error tracking

2. **Middleware Pipeline:**
   ```typescript
   // Before body parsing (for Stripe webhook verification)
   registerBillingWebhookRoute()

   // Body parsing and serialization
   setupBodyParsing()
   app.use(cookieParser())

   // Authentication
   app.use(sessionMiddleware) // Creates/validates signed session

   // Logging and main routes
   setupRequestLogging()
   registerRoutes()

   // Error handling
   setupErrorHandler()
   ```

3. **Background Services:**
   - Data retention cleanup (every 24 hours)
   - Stripe sync (backfill and webhook handling)
   - Database migration (Drizzle migrations if needed)

---

## State Management Approach

### Client-Side State

**1. Remote State (React Query)**
- Server-synchronized data
- Cached with `staleTime: Infinity` (manual invalidation)
- Retry logic: 3x for network errors, 1x for server errors
- Exponential backoff: 1s → 2s → 4s → max 30s
- Used for: API responses, user data, session state

**2. Local State (useState)**
- UI-only state (form inputs, modal visibility)
- Navigation state (handled by React Navigation)
- Minimal in-component state (delegated to hooks)

**3. Async Storage (Persistent)**
- Onboarding completion flag
- User preferences (theme, notifications enabled)
- Optional: Offline reflection drafts
- Retrieved at app startup (blocking)

**Configuration:**
```typescript
// client/lib/query-client.ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => { /* smart retry */ }
    }
  }
});
```

### Server-Side State

**1. Session State (Signed Cookies)**
- User ID extracted from authenticated session
- Signed with secret to prevent tampering
- Passed as `req.auth.userId` in request handlers
- Set by `sessionMiddleware` in `server/middleware/auth.ts`

**2. Database State (PostgreSQL)**
- Persisted across server restarts
- Accessed via Drizzle ORM
- Connected through pooled connection (20 max)

**3. In-Memory State (Rate Limiters)**
- Rate limiter state (requests per window)
- Regenerates on server restart
- Redis could replace this in production

---

## Navigation Structure

### Navigation Hierarchy

```
RootStackNavigator (entry point)
├── Onboarding Screens (if not completed)
│   ├── Onboarding_Welcome
│   ├── Onboarding_Privacy
│   └── Onboarding_Safety
│
└── Main (TabNavigator, after onboarding)
    ├── HomeTab (Tab 1)
    │   └── HomeScreen
    │
    ├── Explore (Tab 2)
    │   └── ExploreScreen
    │
    └── Profile (Tab 3)
        └── ProfileScreen

    + Modal Stack (overlays on Main)
    ├── ThoughtCapture
    ├── Distortion (Session flow: Step 1)
    ├── BeliefInspection (Step 2)
    ├── Reframe (Step 3)
    ├── Regulation (Step 4)
    ├── Intention (Step 5)
    ├── SessionComplete (Step 6)
    ├── History
    ├── Pricing
    ├── BillingSuccess
    ├── CalmingPractice
    ├── Dua
    └── Insights
```

**Navigation Pattern:**
- Deep linking enabled for web/universal links
- Screen routes stored in `RootStackParamList` type
- Each step in therapeutic flow validates data from previous step via params
- Gesture-disabled on modal steps to prevent accidental dismissal

### Key Route Parameters

```typescript
// Distortion → BeliefInspection → Reframe → Regulation → Intention → SessionComplete
Distortion: {
  thought: string
  emotionalIntensity?: number (1-5)
  somaticAwareness?: string
}

Reframe: {
  thought: string
  distortions: string[]
  analysis: string
  emotionalIntensity?: number
  beliefStrength?: number (0-100%)
}

Intention: {
  thought: string
  distortions: string[]
  reframe: string
  practice: string
  anchor: string
  detectedState?: string
  emotionalIntensity?: number
}

SessionComplete: {
  [all previous data combined]
}
```

---

## API Endpoints (Server Routes)

**Defined in:** `server/routes.ts`

### Core Therapeutic Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/analyze` | POST | Extract distortions from thought |
| `/api/reframe` | POST | Generate therapeutic reframe |
| `/api/reflection` | POST | Capture full reflection session |
| `/api/practice` | POST | Generate calming/grounding practice |
| `/api/insights` | GET | Generate session insights |

### User Data Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/sessions` | GET | Retrieve session history |
| `/api/session/:id` | GET | Retrieve single session |
| `/api/user/state` | GET | Get user's current state summary |

### Billing Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/billing/products` | GET | List subscription products |
| `/api/billing/subscribe` | POST | Create subscription |
| `/api/billing/webhook` | POST | Stripe webhook (raw body) |

### Admin Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/cleanup` | POST | Manual data retention cleanup |
| `/api/health` | GET | Health check |

---

## Error Handling

### Client-Side Error Handling

1. **React Query Retry Logic**
   - Network errors: retry 3x with exponential backoff
   - Server errors (500+): retry 1x
   - Client errors (4xx): no retry

2. **Error Boundaries**
   - `ErrorBoundary` wraps entire app
   - `ScreenErrorBoundary` on each screen
   - Shows fallback UI instead of crashing

3. **Error Classification**
   ```typescript
   if (error.message?.includes("NETWORK_ERROR")) { /* handle offline */ }
   if (error.message?.includes("AUTH_ERROR")) { /* redirect to login */ }
   if (error.message?.includes("SERVER_ERROR")) { /* show error toast */ }
   ```

### Server-Side Error Handling

1. **Middleware Error Capturing**
   - Sentry integration logs unhandled errors
   - Request ID correlation for debugging
   - Sensitive routes excluded from response logging

2. **HTTP Error Normalization**
   ```typescript
   interface HTTPError extends Error {
     status?: number;
     statusCode?: number;
   }

   // All errors converted to consistent JSON response
   { message: string, requestId: string }
   ```

3. **Crisis Detection → Immediate Response**
   - Detected before returning response
   - Returns CRISIS_RESOURCES with helpline contacts
   - Logged separately for follow-up

---

## Configuration & Validation

**Module:** `server/config.ts`

```typescript
// Validation modes:
VALIDATION_MODE = process.env.NODE_ENV !== "production"

// Configuration checks:
validateProductionConfig() // Ensures secrets set in production
isAnthropicConfigured()   // Check ANTHROPIC_API_KEY
isStripeConfigured()      // Check STRIPE_API_KEY
logConfigStatus()         // Emit startup diagnostics
```

**Environment Variables:**
```
# Client
EXPO_PUBLIC_DOMAIN       # e.g., "app.example.com:5000"
EXPO_PUBLIC_SENTRY_DSN   # Optional error tracking

# Server
DATABASE_URL             # PostgreSQL connection string
ANTHROPIC_API_KEY        # Claude API access
STRIPE_API_KEY           # Subscription billing
STRIPE_WEBHOOK_SECRET    # Webhook signature verification
SENTRY_DSN              # Error tracking
SESSION_SECRET          # Signed cookie secret
```

---

## Technology Stack Summary

### Client
- **Framework:** React Native 0.81.5, Expo 54
- **Navigation:** React Navigation 7.x
- **State Management:** TanStack React Query 5.x
- **Styling:** React Native StyleSheet + custom theme system
- **Fonts:** Expo Google Fonts (Inter, Cormorant Garamond, Amiri)
- **Animations:** React Native Reanimated 4.1
- **Testing:** Jest, React Testing Library, Detox E2E
- **Error Tracking:** Sentry (optional)

### Server
- **Framework:** Express.js
- **Database:** PostgreSQL with Drizzle ORM
- **AI:** Anthropic Claude API
- **Authentication:** Signed session cookies
- **Rate Limiting:** express-rate-limit
- **Error Tracking:** Sentry (optional)
- **Billing:** Stripe API with stripe-replit-sync

### Shared
- **Type Safety:** TypeScript 5.9
- **Data Validation:** Zod schemas
- **Islamic Framework:** Shared type definitions and content maps

---

## Deployment Architecture

**Client:** Expo EAS Build (iOS & Android)
**Server:** Railway.app or similar Node.js hosting
**Database:** Railway PostgreSQL or Supabase
**Static Files:** Served from `static-build/` directory

---

## Summary

Noor is a **therapeutically-grounded, Islamic-centered monorepo** with:
- **Clear separation** of concerns (client/server/shared)
- **Type safety** across entire stack (TypeScript everywhere)
- **Progressive UI** that guides users through evidence-based CBT
- **AI-powered personalization** with Islamic integration
- **Multi-layer safety** (crisis detection, scrupulosity checks, validation)
- **Session-based authentication** with signed cookies
- **React Query** for efficient remote state management
- **Express middleware pipeline** for production-grade request handling
