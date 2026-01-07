# Siraat

## Overview

Siraat is an Islamic cognitive behavioral therapy (CBT) mobile application built with React Native/Expo. The app helps Muslim users process troubling thoughts through a structured 5-step flow: Thought Capture → Distortion Identification → Islamic Cognitive Reframe → Regulation Practice → Intention Reset. Sessions are designed to be completed in under 5 minutes.

The core philosophy is that Islam provides the cognitive framework while CBT serves as the method - this is not Western CBT with Islamic quotes added, but a fundamentally Islamic approach to mental wellness.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK 54
- **Navigation**: React Navigation with native stack navigator for a linear session flow
- **State Management**: TanStack React Query for server state, React useState for local UI state
- **Styling**: StyleSheet-based theming with a custom theme system supporting light/dark modes
- **Animations**: React Native Reanimated for subtle, contemplative motion effects
- **Local Storage**: AsyncStorage for persisting completed session history

### Design System
- **Visual Identity**: Earth tones inspired by Yemeni masjid geometry (sand, clay, indigo, emerald, charcoal)
- **Typography**: Serif for headings (contemplative), sans-serif for body (readable)
- **Motion**: Minimal, slow fades only - designed to support reflection, not distraction
- **Components**: Custom Button, Card, ThemedText, ThemedView components with consistent theming

### Backend Architecture
- **Runtime**: Express.js server with TypeScript
- **AI Integration**: OpenAI API for analyzing thoughts, generating Islamic reframes, and creating regulation practices
- **Database**: PostgreSQL with Drizzle ORM (schema defined in shared/schema.ts)
- **API Pattern**: RESTful endpoints (/api/analyze, /api/reframe, /api/practice)

### Islamic Epistemological Framework
The AI prompts are grounded in a comprehensive Islamic framework (see attached_assets for full document):
- **Tawhid as cognitive center**: Allah is source of meaning; balance effort and trust
- **Islamic anthropology**: Qalb (heart), Aql (reason), Nafs (ego), Ruh (spirit)
- **Meaningful suffering**: Hardship serves growth/purification, never framed as punishment
- **Emotions vs truth**: Validate feelings, test cognitive interpretations
- **CBT as method, not worldview**: Islamic truth is the standard, not personal preference
- **Tone**: Calm, grounded, compassionate, non-preachy, non-clinical

### Reflection Flow Implementation (FROZEN v1 - DO NOT MODIFY WITHOUT REVIEW)
The core CBT loop has been stress-tested with 6 edge case prompts and validated for theological safety and clinical accuracy. Each screen receives data from the previous step via navigation params:
1. ThoughtCaptureScreen → captures user's troubling thought
2. DistortionScreen → AI identifies cognitive distortions using Islamic-aligned language
3. ReframeScreen → AI generates Quran/Sunnah-grounded reframe that DISPUTES beliefs
4. RegulationScreen (Calming Practice) → AI provides 2-minute calming practice (dhikr, breathing)
5. IntentionScreen → User sets a niyyah (intention)
6. SessionCompleteScreen (Reflection Complete) → Saves reflection, returns to home

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

### Home Screen Features
- Daily grounding reminder: Shows one concept per day from whitelist
- Disclaimer: "Siraat is a guided reflection tool, not a replacement for therapy..."

### History Screen
- Shows date, distortion type tags, one-line intention preview (collapsed)
- Full details available on expand

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