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

### Session Flow Implementation
Each screen in the flow receives data from the previous step via navigation params:
1. ThoughtCaptureScreen → captures user's troubling thought
2. DistortionScreen → AI identifies cognitive distortions using Islamic-aligned language
3. ReframeScreen → AI generates Quran/Sunnah-grounded reframe
4. RegulationScreen → AI provides 2-minute calming practice (dhikr, breathing)
5. IntentionScreen → User sets a niyyah (intention)
6. SessionCompleteScreen → Saves session, returns to home

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