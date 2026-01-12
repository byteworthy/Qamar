# Noor CBT

## Overview

Noor CBT is an Islamic cognitive behavioral therapy (CBT) mobile application built with React Native/Expo. Powered by "The Siraat Method," the app helps Muslim users process troubling thoughts through a structured 5-step flow: Thought Capture → Distortion Identification → Islamic Cognitive Reframe → Regulation Practice → Intention Reset. Sessions are designed to be completed in under 5 minutes.

**Tagline**: "Light for the mind, rooted in Islam."

The core philosophy is that Islam provides the cognitive framework while CBT serves as the method - this is not Western CBT with Islamic quotes added, but a fundamentally Islamic approach to mental wellness.

## User Preferences

Preferred communication style: Simple, everyday language.

**Target Audience**: American Muslims, particularly in Texas and across the US. The app speaks in an Americanized style with natural Islamic terminology woven in - conversational, relatable, and grounded in Islamic wisdom without being preachy.

**Voice Guidelines**:
- Speak like a friend at the masjid after Jummah - warm, real, grounded
- Use everyday American English with Islamic terms Muslims know (dua, tawakkul, sabr, shukr)
- Say "Allah" not "God" - the audience knows and prefers it
- Be direct but gentle, like a wise older sibling
- Never lecture or use "as Muslims we should..."

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK 54
- **Navigation**: React Navigation with native stack navigator for a linear session flow
- **State Management**: TanStack React Query for server state, React useState for local UI state
- **Styling**: StyleSheet-based theming with a custom theme system supporting light/dark modes
- **Animations**: React Native Reanimated for subtle, contemplative motion effects
- **Local Storage**: AsyncStorage for persisting completed session history
- **Brand Copy**: Centralized in `client/constants/brand.ts`

### Design System
- **Visual Identity**: Earth tones inspired by Yemeni masjid geometry (sand, clay, indigo, emerald, charcoal)
- **Typography**: Serif for headings (contemplative), sans-serif for body (readable)
- **Motion**: Minimal, slow fades only - designed to support reflection, not distraction
- **Components**: Custom Button, Card, ThemedText, ThemedView components with consistent theming

### Backend Architecture
- **Runtime**: Express.js server with TypeScript
- **AI Integration**: OpenAI API for analyzing thoughts, generating Islamic reframes, and creating regulation practices
- **Database**: PostgreSQL with Drizzle ORM (schema defined in shared/schema.ts)
- **API Pattern**: RESTful endpoints with structured JSON responses

### API Response Formats

**POST /api/analyze** returns:
- distortions: array of 1-2 distortion names
- happening: one paragraph validating emotional experience
- pattern: array of bullet points explaining each distortion
- matters: one paragraph validating without affirming distortion

**POST /api/reframe** returns:
- beliefTested: one sentence naming the belief error
- perspective: 2-3 sentences with the truer perspective (core reframe)
- nextStep: one simple action for today
- anchors: array of 2-4 concept names from whitelist

**POST /api/practice** returns:
- title: short practice name
- steps: array of 3 numbered steps
- reminder: one closing sentence
- duration: estimated time

### Islamic Epistemological Framework
The AI prompts are grounded in a comprehensive Islamic framework:
- **Tawhid as cognitive center**: Allah is source of meaning; balance effort and trust
- **Islamic anthropology**: Qalb (heart), Aql (reason), Nafs (ego), Ruh (spirit)
- **Meaningful suffering**: Hardship serves growth/purification, never framed as punishment
- **Emotions vs truth**: Validate feelings, test cognitive interpretations
- **CBT as method, not worldview**: Islamic truth is the standard, not personal preference
- **Tone**: Calm, grounded, compassionate, non-preachy, non-clinical

### Reflection Flow Implementation (FROZEN v1 - DO NOT MODIFY WITHOUT REVIEW)
The core CBT loop has been stress-tested with 6 edge case prompts and validated for theological safety and clinical accuracy. Each screen receives data from the previous step via navigation params:
1. ThoughtCaptureScreen → captures user's troubling thought
2. DistortionScreen → Shows "What is happening" / "Thinking pattern" / "What matters"
3. ReframeScreen → Shows 3 blocks: belief tested, truer perspective, next step, plus anchors
4. RegulationScreen → Shows numbered steps with reminder
5. IntentionScreen → User sets niyyah with anchor card displayed
6. SessionCompleteScreen → Shows only Niyyah and Anchor cards

### Islamic Concept Whitelist (16 vetted concepts in server/routes.ts)
The AI can ONLY reference these concepts to prevent theological drift:
- Allah's mercy exceeds sin
- Effort is required, outcomes belong to Allah
- Hearts fluctuate and return is always open
- Hardship carries wisdom even when unseen
- Intention precedes action
- Reliance does not cancel effort
- Allah is closer than perceived distance
- Patience is illumination
- Gratitude increases blessing
- This world is a test, not a destination
- Repentance erases what came before
- No soul carries another's burden
- Allah does not burden beyond capacity
- The heart finds rest in remembrance of Allah
- Good opinion of Allah is worship
- Certainty brings peace, doubt brings anxiety

### Daily Anchor Concepts (10 short phrases in brand.ts)
Shown on home screen, rotates daily:
- Mercy exceeds sin.
- Effort is required, outcomes belong to Allah.
- Hearts fluctuate and return remains open.
- Hardship can carry wisdom you cannot yet see.
- Trust does not cancel action.
- No soul is burdened beyond capacity.
- Delay is not denial.
- Allah is closer than perceived distance.
- Patience illuminates the path.
- Gratitude opens unexpected doors.

### Home Screen Features
- Daily grounding reminder from anchor concepts
- Disclaimer: "Noor CBT is a guided reflection tool. It does not diagnose, treat, or cure any condition."
- "Powered by the Siraat Method" callout

### History Screen
- Shows date, distortion type tags, one-line intention preview (collapsed)
- Full details available on expand

### Billing API Endpoints
- **GET /api/billing/status**: Returns subscription status for a user
- **GET /api/billing/config**: Returns Stripe publishable key and price ID
- **POST /api/billing/create-checkout-session**: Creates Stripe Checkout session for upgrade
- **POST /api/billing/create-portal-session**: Creates Stripe Customer Portal session
- **GET /api/reflection/can-reflect**: Checks if user can create a reflection (limit enforcement)
- **POST /api/reflection/save**: Saves a completed reflection (with limit enforcement)
- **GET /api/reflection/history**: Returns user's reflection history (limited for free tier)

### Path Aliases
- `@/` maps to `./client/`
- `@shared/` maps to `./shared/`

## External Dependencies

### AI Services
- **OpenAI API**: Used for all AI-powered analysis and content generation
  - Environment variables: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`
  - Model: gpt-5.1

### Database
- **PostgreSQL**: Primary data store
  - Environment variable: `DATABASE_URL`
  - ORM: Drizzle with drizzle-zod for validation

### Stripe Subscriptions
- **Noor Plus**: $9.99/month subscription plan
  - Price ID: `price_1SmrDT4tVSVFoBgm4lhd0idY` (environment variable: `STRIPE_PRICE_ID`)
  - Free tier: 1 reflection/day, last 3 history entries
  - Paid tier: Unlimited reflections, full history
- **Billing Flow**: Email-based Stripe Checkout for upgrades, Customer Portal for management
- **Server-side enforcement**: Routes check subscription status before allowing reflections

### Key NPM Packages
- **expo**: Core mobile framework
- **react-native-reanimated**: Animation library
- **@tanstack/react-query**: Data fetching and caching
- **expo-haptics**: Haptic feedback for session milestones
- **@react-native-async-storage/async-storage**: Local session history storage

### Development Tools
- **tsx**: TypeScript execution for development server
- **drizzle-kit**: Database migrations
- **esbuild**: Production server bundling
