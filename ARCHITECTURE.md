# Qamar Unified App - Technical Architecture

**Version:** 1.0
**Last Updated:** 2025-02-11
**Status:** APPROVED FOR IMPLEMENTATION

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [System Diagrams](#system-diagrams)
3. [Navigation Architecture](#navigation-architecture)
4. [State Management Strategy](#state-management-strategy)
5. [Offline-First Architecture](#offline-first-architecture)
6. [AI Integration Patterns](#ai-integration-patterns)
7. [Security Architecture](#security-architecture)
8. [Data Flow Patterns](#data-flow-patterns)
9. [Module Boundaries](#module-boundaries)
10. [Technology Stack Decisions](#technology-stack-decisions)

---

## Architecture Overview

### Design Philosophy

**Qamar follows a hybrid client-server architecture** with the following principles:

1. **Offline-First**: Core Islamic features (Quran, Prayer, Arabic) work 100% offline
2. **Progressive Enhancement**: Basic features free, advanced features require internet/premium
3. **Layered Architecture**: Clean separation between presentation, business logic, and data
4. **Security-First**: All reflection data encrypted at rest and in transit
5. **Mobile-Optimized**: Designed for 4" to 7" screens, 3G networks, budget devices

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                               │
│  React Native Components (Screens, Components, Navigation)               │
│                                                                          │
│  ┌──────────┬──────────┬──────────┬──────────┬─────────┬─────────────┐ │
│  │  Home    │Companion │  Learn   │ Worship  │ Quran   │   Profile   │ │
│  │  Tab     │(Reflect) │(Arabic)  │ (Prayer) │ Reader  │  Settings   │ │
│  └──────────┴──────────┴──────────┴──────────┴─────────┴─────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         STATE MANAGEMENT LAYER                           │
│                                                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────────────┐ │
│  │  TanStack Query │  │  Zustand        │  │  AsyncStorage          │ │
│  │  (Server State) │  │  (UI State)     │  │  (User Preferences)    │ │
│  └─────────────────┘  └─────────────────┘  └────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                    │
│                                                                          │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────────────┐ │
│  │ WatermelonDB   │  │  API Client    │  │  RevenueCat SDK          │ │
│  │ (Offline DB)   │  │  (HTTP/REST)   │  │  (Subscriptions)         │ │
│  └────────────────┘  └────────────────┘  └──────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         BACKEND SERVICES                                 │
│  Express.js Server (Node.js)                                             │
│                                                                          │
│  ┌──────────────┬──────────────┬──────────────┬───────────────────────┐│
│  │  Auth API    │  Reflect API │  Billing API │  Sync API             ││
│  │  /api/auth/* │  /api/*/     │  /api/billing│  /api/sync/*          ││
│  └──────────────┴──────────────┴──────────────┴───────────────────────┘│
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                                             │  │
│  │  Tables: users, sessions, reflections, progress, achievements    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  External Services                                               │  │
│  │  - Anthropic Claude API (reflection conversations)               │  │
│  │  - RevenueCat (subscription management)                          │  │
│  │  - Sentry (error tracking)                                       │  │
│  │  - Expo Push Notifications                                       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## System Diagrams

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT APPLICATION                              │
│  (React Native + Expo)                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  NAVIGATION LAYER                                                       │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  React Navigation 7.x                                          │   │
│  │  ┌──────────────┬──────────────┬──────────────┬─────────────┐ │   │
│  │  │ Tab Nav      │ Stack Nav    │ Modal Stack  │ Deep Links  │ │   │
│  │  └──────────────┴──────────────┴──────────────┴─────────────┘ │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  PRESENTATION COMPONENTS                                                │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  Screens/                                                      │   │
│  │    HomeScreen, ThoughtCaptureScreen, SurahListScreen...        │   │
│  │                                                                 │   │
│  │  Components/                                                    │   │
│  │    Button, Card, Screen, LoadingState, ErrorBoundary...        │   │
│  │                                                                 │   │
│  │  Hooks/                                                         │   │
│  │    useTheme, useNotifications, usePrayerTimes...               │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  BUSINESS LOGIC LAYER                                                   │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  Services/                                                      │   │
│  │    - PrayerService (adhan calculation)                         │   │
│  │    - FSRSService (flashcard scheduling)                        │   │
│  │    - SyncService (offline → server sync)                       │   │
│  │    - EncryptionService (AES-256-GCM)                           │   │
│  │    - BiometricAuthService (Face ID/Touch ID)                   │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  DATA ACCESS LAYER                                                      │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  Database/                                                      │   │
│  │    - WatermelonDB (offline SQLite)                             │   │
│  │    - Models: Surah, Verse, Flashcard, Bookmark                │   │
│  │                                                                 │   │
│  │  API/                                                           │   │
│  │    - apiClient.ts (fetch wrapper, auth headers)                │   │
│  │    - Endpoints: /api/auth, /api/companion, /api/progress       │   │
│  │                                                                 │   │
│  │  Storage/                                                       │   │
│  │    - AsyncStorage (user preferences)                           │   │
│  │    - Keychain/Keystore (encryption keys)                       │   │
│  └────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          SERVER APPLICATION                             │
│  (Express.js + Node.js)                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  MIDDLEWARE PIPELINE                                                    │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  1. CORS Setup                                                 │   │
│  │  2. Request ID + Rate Limiting                                 │   │
│  │  3. Body Parsing (JSON/urlencoded)                             │   │
│  │  4. Cookie Parser                                              │   │
│  │  5. Session Middleware → req.auth.userId                       │   │
│  │  6. Request Logging (exclude sensitive routes)                 │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ROUTE HANDLERS                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  routes.ts (main route registration)                           │   │
│  │    - POST /api/auth/signup                                     │   │
│  │    - POST /api/auth/login                                      │   │
│  │    - POST /api/companion/analyze                               │   │
│  │    - POST /api/companion/reframe                               │   │
│  │    - POST /api/companion/reflection                            │   │
│  │    - GET  /api/progress                                        │   │
│  │    - POST /api/sync/bookmarks                                  │   │
│  │    - POST /api/billing/webhook (RevenueCat)                    │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  AI ORCHESTRATION LAYER                                                 │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  - conversational-ai.ts (EmotionalIntelligence, PatternDetector)│  │
│  │  - canonical-orchestrator.ts (multi-step workflow)             │   │
│  │  - ai-safety.ts (crisis detection, scrupulosity checks)        │   │
│  │  - stateInference.ts (emotional state classification)          │   │
│  │  - islamic-content-mapper.ts (state → Quran/Hadith)            │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  DATA ACCESS LAYER                                                      │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  - db.ts (Drizzle ORM + PostgreSQL connection pool)            │   │
│  │  - storage.ts (CRUD operations)                                │   │
│  │  - encryption.ts (encrypt/decrypt sensitive data)              │   │
│  └────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SERVICES                                │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐   │
│  │ Anthropic API   │  │  RevenueCat API │  │  Sentry             │   │
│  │ (Claude 3.5)    │  │  (Subscriptions)│  │  (Error Tracking)   │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────────┘   │
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐                             │
│  │ Expo Push       │  │  Ollama (Future)│                             │
│  │ Notifications   │  │  (Local AI)     │                             │
│  └─────────────────┘  └─────────────────┘                             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Sequence Diagram: Structured Reflection Flow

```
User          Client App        API Server      PostgreSQL    Anthropic API
 │                 │                 │               │               │
 │  Open Companion │                 │               │               │
 │────────────────>│                 │               │               │
 │                 │                 │               │               │
 │  Enter Thought  │                 │               │               │
 │────────────────>│                 │               │               │
 │                 │                 │               │               │
 │  Tap "Analyze"  │                 │               │               │
 │────────────────>│ POST /api/analyze                │               │
 │                 │────────────────>│               │               │
 │                 │                 │ Extract thought│               │
 │                 │                 │ Check crisis   │               │
 │                 │                 │────────────────────────────────>│
 │                 │                 │ Generate analysis (Claude 3.5) │
 │                 │                 │<────────────────────────────────│
 │                 │                 │               │               │
 │                 │                 │ Map emotional state → Quran   │
 │                 │                 │ (islamic-content-mapper.ts)   │
 │                 │<────────────────│               │               │
 │                 │ Analysis Result │               │               │
 │<────────────────│ (distortions,   │               │               │
 │                 │  suggested verses)              │               │
 │                 │                 │               │               │
 │  Confirm        │                 │               │               │
 │  Distortions    │                 │               │               │
 │────────────────>│ POST /api/reframe               │               │
 │                 │────────────────>│               │               │
 │                 │                 │ Build system prompt           │
 │                 │                 │ (canonical-orchestrator.ts)   │
 │                 │                 │────────────────────────────────>│
 │                 │                 │ Generate reframe (Claude)     │
 │                 │                 │<────────────────────────────────│
 │                 │<────────────────│               │               │
 │                 │ Reframe Result  │               │               │
 │<────────────────│                 │               │               │
 │                 │                 │               │               │
 │  Complete       │                 │               │               │
 │  Session        │                 │               │               │
 │────────────────>│ POST /api/companion/reflection  │               │
 │                 │────────────────>│ Encrypt data  │               │
 │                 │                 │ (AES-256-GCM) │               │
 │                 │                 │ INSERT INTO reflections        │
 │                 │                 │──────────────>│               │
 │                 │                 │ UPDATE user_progress           │
 │                 │                 │──────────────>│               │
 │                 │<────────────────│<──────────────│               │
 │                 │ Success         │               │               │
 │<────────────────│                 │               │               │
 │                 │                 │               │               │
 │  Navigate to    │                 │               │               │
 │  SessionComplete│                 │               │               │
 │<────────────────│                 │               │               │
```

---

### Sequence Diagram: Offline Quran Reading

```
User          Client App      WatermelonDB    AsyncStorage   Server (when online)
 │                 │               │               │               │
 │  Open Quran Tab │               │               │               │
 │────────────────>│               │               │               │
 │                 │ Query Surahs  │               │               │
 │                 │──────────────>│               │               │
 │                 │ Return 114 rows               │               │
 │                 │<──────────────│               │               │
 │  Display Surah  │               │               │               │
 │  List           │               │               │               │
 │<────────────────│               │               │               │
 │                 │               │               │               │
 │  Tap Surah #1   │               │               │               │
 │────────────────>│ Query verses  │               │               │
 │                 │ WHERE surah_id=1              │               │
 │                 │──────────────>│               │               │
 │                 │ Return 7 verses               │               │
 │                 │<──────────────│               │               │
 │  Display Verses │               │               │               │
 │<────────────────│               │               │               │
 │                 │               │               │               │
 │  Tap Bookmark   │               │               │               │
 │────────────────>│ INSERT INTO bookmarks         │               │
 │                 │ { verse_id: "1:1", synced: false }            │
 │                 │──────────────>│               │               │
 │                 │<──────────────│               │               │
 │  Bookmark Saved │               │               │               │
 │<────────────────│               │               │               │
 │                 │               │               │               │
 │  [User goes     │               │               │               │
 │   online]       │               │               │               │
 │                 │ Background sync               │               │
 │                 │ Query unsynced bookmarks      │               │
 │                 │──────────────>│               │               │
 │                 │ Return bookmarks where synced=false           │
 │                 │<──────────────│               │               │
 │                 │ POST /api/sync/bookmarks      │               │
 │                 │──────────────────────────────>│               │
 │                 │ Success                       │               │
 │                 │<──────────────────────────────│               │
 │                 │ UPDATE bookmarks SET synced=true              │
 │                 │──────────────>│               │               │
 │                 │<──────────────│               │               │
```

---

## Navigation Architecture

### Navigation Hierarchy (React Navigation 7.x)

```
RootNavigator (Stack)
│
├─ Onboarding Flow (Conditional - if first launch)
│  ├─ WelcomeScreen
│  ├─ PermissionsScreen (Location, Notifications)
│  └─ SetupScreen (Language, Prayer Method, Name)
│
└─ Main (TabNavigator - 5 tabs)
   │
   ├─ Tab 1: Home 🏠
   │  └─ HomeScreen (Dashboard)
   │
   ├─ Tab 2: Companion 💬
   │  ├─ CompanionScreen (Entry point)
   │  └─ Modal Stack (Presented modally)
   │     ├─ ThoughtCaptureScreen
   │     ├─ DistortionScreen
   │     ├─ BeliefInspectionScreen
   │     ├─ ReframeScreen
   │     ├─ RegulationScreen
   │     ├─ IntentionScreen
   │     └─ SessionCompleteScreen
   │
   ├─ Tab 3: Learn 📚
   │  ├─ LearnScreen (Hub - Arabic + Quran)
   │  │
   │  ├─ Arabic Learning Stack
   │  │  ├─ AlphabetGridScreen
   │  │  ├─ LetterDetailScreen
   │  │  ├─ FlashcardReviewScreen
   │  │  ├─ ConversationPracticeScreen
   │  │  └─ VocabularyListScreen
   │  │
   │  └─ Quran Reading Stack
   │     ├─ SurahListScreen
   │     ├─ VerseReaderScreen
   │     ├─ ThematicSearchScreen
   │     ├─ MemorizationScreen
   │     └─ BookmarksScreen
   │
   ├─ Tab 4: Worship 🕌
   │  ├─ WorshipScreen (Hub)
   │  ├─ PrayerTimesScreen
   │  ├─ QiblaCompassScreen
   │  ├─ AdhkarCollectionListScreen
   │  └─ AdhkarReaderScreen
   │
   └─ Tab 5: Profile 👤
      ├─ ProfileScreen
      ├─ SettingsScreen
      ├─ NotificationSettingsScreen
      ├─ ProgressDashboardScreen
      ├─ AchievementsScreen
      ├─ PaywallScreen (Premium)
      └─ SubscriptionManagementScreen
```

### Navigation Configuration

**File:** `client/navigation/RootStackNavigator.tsx`

```typescript
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  // Onboarding
  Onboarding_Welcome: undefined;
  Onboarding_Permissions: undefined;
  Onboarding_Setup: undefined;

  // Main Tabs
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Companion: undefined;
  Learn: undefined;
  Worship: undefined;
  Profile: undefined;
};

export type LearnStackParamList = {
  LearnHub: undefined;
  AlphabetGrid: undefined;
  LetterDetail: { letterId: string };
  FlashcardReview: undefined;
  SurahList: undefined;
  VerseReader: { surahId: number };
  ThematicSearch: { query?: string };
};

export type CompanionStackParamList = {
  ThoughtCapture: undefined;
  Distortion: {
    thought: string;
    emotionalIntensity?: number;
  };
  BeliefInspection: {
    thought: string;
    distortions: string[];
  };
  Reframe: {
    thought: string;
    distortions: string[];
    beliefStrength?: number;
  };
  Regulation: {
    thought: string;
    reframe: string;
  };
  Intention: {
    thought: string;
    reframe: string;
    practice: string;
  };
  SessionComplete: {
    thought: string;
    distortions: string[];
    reframe: string;
    practice: string;
    intention: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

export function RootNavigator() {
  const hasCompletedOnboarding = useOnboardingStatus();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      {!hasCompletedOnboarding && (
        <>
          <Stack.Screen name="Onboarding_Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Onboarding_Permissions" component={PermissionsScreen} />
          <Stack.Screen name="Onboarding_Setup" component={SetupScreen} />
        </>
      )}
      <Stack.Screen name="Main" component={MainTabNavigator} />
    </Stack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.neutral[400],
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Companion"
        component={CompanionNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <MessageIcon color={color} size={size} />,
          tabBarLabel: 'Companion',
        }}
      />
      <Tab.Screen
        name="Learn"
        component={LearnNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <BookIcon color={color} size={size} />,
          tabBarLabel: 'Learn',
        }}
      />
      <Tab.Screen
        name="Worship"
        component={WorshipNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <MosqueIcon color={color} size={size} />,
          tabBarLabel: 'Worship',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <ProfileIcon color={color} size={size} />,
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}
```

### Deep Linking Configuration

**File:** `client/App.tsx`

```typescript
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['noor://', 'https://noorapp.com'],
  config: {
    screens: {
      Main: {
        screens: {
          Home: 'home',
          Companion: {
            screens: {
              ThoughtCapture: 'companion/new',
              SessionComplete: 'companion/complete/:sessionId',
            },
          },
          Learn: {
            screens: {
              SurahList: 'quran',
              VerseReader: 'quran/surah/:surahId',
              ThematicSearch: 'quran/search',
              AlphabetGrid: 'learn/arabic',
              FlashcardReview: 'learn/flashcards',
            },
          },
          Worship: {
            screens: {
              PrayerTimes: 'prayer',
              QiblaCompass: 'qibla',
              AdhkarCollectionList: 'adhkar',
            },
          },
          Profile: {
            screens: {
              ProfileScreen: 'profile',
              ProgressDashboard: 'progress',
              Paywall: 'premium',
            },
          },
        },
      },
    },
  },
};

<NavigationContainer linking={linking}>
  <RootNavigator />
</NavigationContainer>
```

**Example Deep Links:**
- `noor://quran/surah/1` → Opens Surah Al-Fatihah
- `noor://companion/new` → Opens Thought Capture screen
- `noor://prayer` → Opens Prayer Times screen
- `https://noorapp.com/learn/arabic` → Opens Arabic Alphabet

---

## State Management Strategy

### Hybrid State Management Approach

**Problem:** Managing both server state (reflections, progress) and offline state (Quran, flashcards) efficiently.

**Solution:** Use **TanStack Query** for server state, **Zustand** for UI state, **WatermelonDB** for offline persistence.

### State Categories

| State Type | Tool | Persistence | Example |
|------------|------|-------------|---------|
| **Server State** | TanStack Query | Cached in memory | Reflections, user progress, bookmarks (synced) |
| **UI State** | Zustand | Memory only | Modal visibility, current tab, form inputs |
| **Offline Data** | WatermelonDB | SQLite on disk | Quran verses, Arabic letters, flashcards |
| **User Preferences** | AsyncStorage | Disk | Theme, language, prayer calculation method |
| **Secure Keys** | Keychain/Keystore | Secure enclave | Encryption keys, biometric tokens |

---

### TanStack Query Configuration

**File:** `client/lib/query-client.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Server state assumed fresh indefinitely (manual invalidation)
      staleTime: Infinity,
      // Don't refetch on window focus (mobile app)
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true, // Refetch when network reconnects

      // Retry logic
      retry: (failureCount, error) => {
        // Network errors: retry 3x
        if (error.message?.includes('NETWORK_ERROR')) {
          return failureCount < 3;
        }
        // Server errors (500+): retry 1x
        if (error.status >= 500) {
          return failureCount < 1;
        }
        // Client errors (4xx): don't retry
        return false;
      },

      // Exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },

    mutations: {
      // Retry failed mutations on reconnect
      retry: 1,
      retryDelay: 1000,
    },
  },
});
```

**Usage Example: Fetch User Progress**

```typescript
// hooks/useUserProgress.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export function useUserProgress() {
  return useQuery({
    queryKey: ['user-progress'],
    queryFn: async () => {
      const response = await apiClient.get('/api/progress');
      return response.data;
    },
    // Custom config
    refetchInterval: 60 * 1000, // Refetch every minute (for streak updates)
  });
}
```

**Usage Example: Create Reflection (Mutation)**

```typescript
// hooks/useCreateReflection.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export function useCreateReflection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reflection: ReflectionData) => {
      const response = await apiClient.post('/api/companion/reflection', reflection);
      return response.data;
    },

    // Optimistic update
    onMutate: async (newReflection) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reflections'] });

      // Snapshot previous value
      const previousReflections = queryClient.getQueryData(['reflections']);

      // Optimistically update
      queryClient.setQueryData(['reflections'], (old: Reflection[]) => [
        ...old,
        { id: 'temp-id', ...newReflection },
      ]);

      return { previousReflections };
    },

    // Rollback on error
    onError: (err, newReflection, context) => {
      queryClient.setQueryData(['reflections'], context.previousReflections);
    },

    // Always refetch after success/error
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reflections'] });
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
    },
  });
}
```

---

### Zustand Configuration

**File:** `client/store/ui-store.ts`

```typescript
import { create } from 'zustand';

interface UIState {
  // Current tab
  activeTab: 'Home' | 'Companion' | 'Learn' | 'Worship' | 'Profile';
  setActiveTab: (tab: UIState['activeTab']) => void;

  // Modal state
  isPaywallVisible: boolean;
  showPaywall: () => void;
  hidePaywall: () => void;

  // Loading states
  isGlobalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;

  // Toast notifications
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info';
  showToast: (message: string, type: UIState['toastType']) => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'Home',
  setActiveTab: (tab) => set({ activeTab: tab }),

  isPaywallVisible: false,
  showPaywall: () => set({ isPaywallVisible: true }),
  hidePaywall: () => set({ isPaywallVisible: false }),

  isGlobalLoading: false,
  setGlobalLoading: (loading) => set({ isGlobalLoading: loading }),

  toastMessage: null,
  toastType: 'info',
  showToast: (message, type) => set({ toastMessage: message, toastType: type }),
  hideToast: () => set({ toastMessage: null }),
}));
```

**Usage Example:**

```typescript
// SomeScreen.tsx
import { useUIStore } from '../store/ui-store';

function SomeScreen() {
  const showToast = useUIStore((state) => state.showToast);

  const handleSuccess = () => {
    showToast('Reflection saved successfully!', 'success');
  };

  return <Button onPress={handleSuccess}>Save</Button>;
}
```

---

### WatermelonDB Configuration

**File:** `client/database/index.ts`

```typescript
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import { Surah, Verse, Flashcard, Bookmark } from './models';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'noor_app',
  jsi: true, // Use JSI for better performance
  // Enable encryption (SQLCipher)
  encryptionKey: await getEncryptionKey(),
});

export const database = new Database({
  adapter,
  modelClasses: [Surah, Verse, Flashcard, Bookmark],
});

async function getEncryptionKey(): Promise<string> {
  const credentials = await Keychain.getGenericPassword({
    service: 'noor_db_encryption',
  });

  if (!credentials) {
    // Generate new key
    const newKey = await generateRandomKey();
    await Keychain.setGenericPassword('db_key', newKey, {
      service: 'noor_db_encryption',
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return newKey;
  }

  return credentials.password;
}
```

**Usage Example: Query Quran Verses**

```typescript
// hooks/useQuranVerses.ts
import { useDatabase } from '@nozbe/watermelondb/hooks';
import { Q } from '@nozbe/watermelondb';

export function useQuranVerses(surahId: number) {
  const database = useDatabase();

  return useQuery({
    queryKey: ['quran-verses', surahId],
    queryFn: async () => {
      const versesCollection = database.collections.get('verses');
      return versesCollection
        .query(Q.where('surah_id', surahId))
        .fetch();
    },
    staleTime: Infinity, // Never refetch (static data)
  });
}
```

---

## Offline-First Architecture

### Principles

1. **Core Features Work Offline:** Quran, Prayer Times, Arabic Learning, Adhkar
2. **Background Sync:** Bookmarks, flashcard progress, achievements sync when online
3. **Graceful Degradation:** Advanced features (AI search, photo recognition) require internet
4. **Conflict Resolution:** Last-write-wins for bookmarks, server authoritative for premium status

---

### Offline Capabilities Matrix

| Feature | Offline Capability | Sync Strategy |
|---------|-------------------|---------------|
| **Quran Reading** | ✅ Full (embedded SQLite) | No sync needed (static data) |
| **Prayer Times** | ✅ Full (calculated locally) | No sync needed |
| **Qibla Compass** | ✅ Full (device sensors) | No sync needed |
| **Arabic Alphabet** | ✅ Full (embedded data) | No sync needed |
| **Flashcard Review** | ✅ Full (local FSRS) | Progress syncs when online |
| **Adhkar/Dhikr** | ✅ Full (embedded JSON) | Counter syncs when online |
| **Bookmarks** | ✅ Full (local DB) | Syncs when online (last-write-wins) |
| **Structured Reflections** | ❌ Requires internet (Claude API) | N/A (real-time only) |
| **Thematic Search (Keyword)** | ✅ Full (SQLite FTS) | No sync needed |
| **Thematic Search (Semantic)** | ❌ Requires internet (embeddings) | N/A |
| **Progress/Streaks** | ⚠️ Local tracking, syncs when online | Periodic sync (every 15min) |

---

### Sync Service Implementation

**File:** `client/services/syncService.ts`

```typescript
import { database } from '../database';
import { apiClient } from '../lib/api';
import NetInfo from '@react-native-community/netinfo';
import { Q } from '@nozbe/watermelondb';

export class SyncService {
  private isOnline: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;

  async initialize() {
    // Listen for network changes
    NetInfo.addEventListener((state) => {
      this.isOnline = state.isConnected && state.isInternetReachable;

      if (this.isOnline) {
        this.syncAll();
      }
    });

    // Sync every 15 minutes
    this.syncInterval = setInterval(() => {
      if (this.isOnline) this.syncAll();
    }, 15 * 60 * 1000);
  }

  async syncAll() {
    await Promise.all([
      this.syncBookmarks(),
      this.syncFlashcardProgress(),
      this.syncAchievements(),
    ]);
  }

  async syncBookmarks() {
    if (!this.isOnline) return;

    const bookmarksCollection = database.collections.get('bookmarks');
    const unsyncedBookmarks = await bookmarksCollection
      .query(Q.where('synced', false))
      .fetch();

    if (unsyncedBookmarks.length === 0) return;

    try {
      const response = await apiClient.post('/api/sync/bookmarks', {
        bookmarks: unsyncedBookmarks.map((b) => ({
          verse_id: b.verse_id,
          created_at: b.created_at,
        })),
      });

      // Mark as synced
      await database.write(async () => {
        for (const bookmark of unsyncedBookmarks) {
          await bookmark.update((b) => {
            b.synced = true;
          });
        }
      });

      console.log(`Synced ${unsyncedBookmarks.length} bookmarks`);
    } catch (error) {
      console.error('Bookmark sync failed, will retry', error);
    }
  }

  async syncFlashcardProgress() {
    if (!this.isOnline) return;

    const flashcardsCollection = database.collections.get('flashcards');
    const unsyncedCards = await flashcardsCollection
      .query(Q.where('synced', false))
      .fetch();

    if (unsyncedCards.length === 0) return;

    try {
      const response = await apiClient.post('/api/sync/flashcards', {
        flashcards: unsyncedCards.map((c) => ({
          word_id: c.word_id,
          state: c.state,
          due_date: c.due_date,
          stability: c.stability,
          difficulty: c.difficulty,
          reps: c.reps,
          lapses: c.lapses,
        })),
      });

      await database.write(async () => {
        for (const card of unsyncedCards) {
          await card.update((c) => {
            c.synced = true;
          });
        }
      });

      console.log(`Synced ${unsyncedCards.length} flashcards`);
    } catch (error) {
      console.error('Flashcard sync failed, will retry', error);
    }
  }

  async syncAchievements() {
    // Pull latest achievements from server
    if (!this.isOnline) return;

    try {
      const response = await apiClient.get('/api/achievements');
      const serverAchievements = response.data.achievements;

      // TODO: Compare with local achievements, update if needed
    } catch (error) {
      console.error('Achievement sync failed', error);
    }
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

export const syncService = new SyncService();
```

**Usage in App.tsx:**

```typescript
// App.tsx
useEffect(() => {
  syncService.initialize();

  return () => {
    syncService.destroy();
  };
}, []);
```

---

## AI Integration Patterns

### Dual AI Strategy

**Goal:** Combine cloud services (Claude) for guided companion conversations with local search (Ollama) for Quran/Hadith retrieval.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  User Input (Thought, Question, Search Query)                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Routing Logic       │
          │  (Feature-Based)     │
          └──────────┬───────────┘
                     │
       ┌─────────────┴─────────────┐
       │                           │
       ▼                           ▼
┌──────────────┐          ┌──────────────┐
│  Cloud AI    │          │  Local AI    │
│  (Claude)    │          │  (Ollama)    │
└──────┬───────┘          └──────┬───────┘
       │                          │
       │                          ▼
       │                ┌──────────────────┐
       │                │ Vector Search    │
       │                │ (Embeddings)     │
       │                └──────┬───────────┘
       │                       │
       │                       ▼
       │                ┌──────────────────┐
       │                │ WatermelonDB     │
       │                │ (Quran/Hadith)   │
       │                └──────────────────┘
       │
       └───────────────┬───────────────┘
                       │
                       ▼
            ┌──────────────────┐
            │  Response to User│
            └──────────────────┘
```

---

### Cloud AI Implementation (Claude)

**File:** `client/services/cloudAI.ts`

```typescript
export class CloudAIService {
  async analyzeThought(thought: string, emotionalIntensity?: number) {
    const response = await apiClient.post('/api/companion/analyze', {
      thought,
      emotional_intensity: emotionalIntensity,
    });

    return response.data;
  }

  async reframeThought(context: {
    thought: string;
    distortions: string[];
    emotionalIntensity?: number;
  }) {
    const response = await apiClient.post('/api/companion/reframe', context);

    return response.data;
  }

  async generateRegulationPractice(emotionalState: string) {
    const response = await apiClient.post('/api/companion/practice', {
      emotional_state: emotionalState,
    });

    return response.data;
  }
}
```

**Server-Side (Express):**

**File:** `server/routes.ts`

```typescript
router.post('/api/companion/analyze', async (req, res) => {
  const { thought, emotional_intensity } = req.body;
  const userId = req.auth.userId;

  // Check rate limits
  const canProceed = await rateLimiter.checkLimit(userId);
  if (!canProceed) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  // Crisis detection
  const isCrisis = detectCrisis(thought);
  if (isCrisis) {
    return res.json({
      crisis_detected: true,
      resources: CRISIS_RESOURCES,
    });
  }

  // Analyze with Claude
  const analysis = await analyzeWithClaude(thought, emotional_intensity);

  // Map emotional state to Islamic content
  const suggestedVerses = await mapStateToQuranVerses(analysis.emotional_state);

  res.json({
    analysis: {
      distortions: analysis.distortions,
      emotional_state: analysis.emotional_state,
      tone: analysis.tone,
      suggested_verses: suggestedVerses,
    },
  });
});
```

---

### Local AI Implementation (Ollama) - Phase 2

**Goal:** Offline semantic search over Quran/Hadith using local LLM.

**File:** `client/services/localAI.ts`

```typescript
import Ollama from 'ollama-react-native';
import { database } from '../database';

export class LocalAIService {
  private ollama: Ollama | null = null;

  async initialize() {
    this.ollama = new Ollama({
      model: 'llama3.2:3b', // 2GB model
      baseURL: 'http://localhost:11434', // Ollama server
    });
  }

  async searchQuranThematic(query: string): Promise<Verse[]> {
    if (!this.ollama) throw new Error('Ollama not initialized');

    // Generate embedding for query
    const queryEmbedding = await this.ollama.embed({
      input: query,
    });

    // Vector search against pre-computed verse embeddings
    // (Embeddings pre-computed during app build, stored in WatermelonDB)
    const versesCollection = database.collections.get('verse_embeddings');

    // Find nearest neighbors using cosine similarity
    const nearestVerses = await versesCollection
      .query(
        Q.where('embedding_distance', Q.lte(0.3)), // Threshold
        Q.sortBy('embedding_distance', Q.asc),
        Q.take(10)
      )
      .fetch();

    // Retrieve full verse data
    const verseIds = nearestVerses.map((v) => v.verse_id);
    const verses = await database.collections.get('verses')
      .query(Q.where('id', Q.oneOf(verseIds)))
      .fetch();

    return verses;
  }

  async summarizeVerses(verses: Verse[]): Promise<string> {
    if (!this.ollama) throw new Error('Ollama not initialized');

    const context = verses.map((v) => v.text_english).join('\n\n');

    const response = await this.ollama.generate({
      prompt: `Summarize the key themes in these Quranic verses:\n\n${context}`,
      stream: false,
    });

    return response.text;
  }
}
```

**Pre-Computing Embeddings (Build Time):**

```bash
# scripts/generate-embeddings.sh
ollama pull all-MiniLM-L6-v2  # 22MB embedding model

# Python script to generate embeddings for all 6,236 verses
python scripts/embed_quran.py --model all-MiniLM-L6-v2 --input assets/data/noor_ai_seed.db --output embeddings.json

# Import embeddings into WatermelonDB schema
```

---

## Security Architecture

### Threat Model

**Assets to Protect:**
1. User reflections (reflection content - highly sensitive)
2. User credentials (email/password)
3. Premium subscription status
4. User location (for prayer times)
5. Encryption keys

**Threat Actors:**
1. Malicious apps on device (reading app data)
2. Network attackers (MITM)
3. Server compromise
4. Insiders (database access)

### Defense Layers

```
┌──────────────────────────────────────────────────────────────┐
│  Layer 1: Transport Security (TLS 1.3)                       │
│  - Certificate pinning                                       │
│  - HTTPS-only communication                                  │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Layer 2: Authentication                                     │
│  - Session-based auth (signed cookies)                       │
│  - Biometric unlock (Face ID/Touch ID)                       │
│  - Session expiry (30 days inactivity)                       │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Layer 3: Data Encryption at Rest                            │
│  - SQLCipher for WatermelonDB                                │
│  - AES-256-GCM for reflection content                        │
│  - Keychain/Keystore for keys                                │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Layer 4: Authorization                                      │
│  - Row-level security (PostgreSQL)                           │
│  - Premium entitlement checks (RevenueCat)                   │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Layer 5: Privacy                                            │
│  - Screenshot prevention (sensitive screens)                 │
│  - No analytics on reflection content                        │
│  - 90-day data retention                                     │
│  - GDPR/HIPAA compliance                                     │
└──────────────────────────────────────────────────────────────┘
```

---

### Certificate Pinning

**File:** `client/lib/api.ts`

```typescript
import { Platform } from 'react-native';

const API_CERTIFICATES = {
  production: [
    'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=', // Production cert
  ],
  staging: [
    'sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=', // Staging cert
  ],
};

export async function apiRequest(endpoint: string, options: RequestInit) {
  const url = `${API_URL}${endpoint}`;

  // Certificate pinning (iOS/Android)
  if (Platform.OS !== 'web') {
    const certificates = __DEV__ ? API_CERTIFICATES.staging : API_CERTIFICATES.production;

    // Use react-native-ssl-pinning or similar
    const response = await fetch(url, {
      ...options,
      sslPinning: {
        certs: certificates,
      },
    });

    return response;
  }

  // Web fallback (no pinning)
  return fetch(url, options);
}
```

---

### Biometric Authentication

**File:** `client/services/biometricAuth.ts`

```typescript
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class BiometricAuthService {
  async isAvailable(): Promise<boolean> {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
  }

  async isEnabled(): Promise<boolean> {
    const enabled = await AsyncStorage.getItem('biometric_enabled');
    return enabled === 'true';
  }

  async enable() {
    await AsyncStorage.setItem('biometric_enabled', 'true');
  }

  async disable() {
    await AsyncStorage.setItem('biometric_enabled', 'false');
  }

  async authenticate(): Promise<boolean> {
    const enabled = await this.isEnabled();
    if (!enabled) return true; // Skip if disabled

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Qamar',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      return result.success;
    } catch (error) {
      console.error('Biometric auth failed', error);
      return false;
    }
  }
}

export const biometricAuth = new BiometricAuthService();
```

**Usage in App.tsx:**

```typescript
// App.tsx
import { AppState } from 'react-native';
import { biometricAuth } from './services/biometricAuth';

export default function App() {
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        // App came to foreground
        const authenticated = await biometricAuth.authenticate();
        setIsLocked(!authenticated);
      }
    });

    return () => subscription.remove();
  }, []);

  if (isLocked) {
    return <LockScreen onUnlock={() => setIsLocked(false)} />;
  }

  return <NavigationContainer>...</NavigationContainer>;
}
```

---

### Screenshot Prevention

**File:** `client/components/SecureScreen.tsx`

```typescript
import { View } from 'react-native';
import { preventScreenCapture, allowScreenCapture } from 'expo-screen-capture';

export function SecureScreen({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Prevent screenshots/screen recording
    preventScreenCapture();

    return () => {
      // Re-enable on unmount
      allowScreenCapture();
    };
  }, []);

  return <View>{children}</View>;
}
```

**Usage:**

```typescript
// ReframeScreen.tsx
<SecureScreen>
  <Screen>
    <Text>Your reframe: {reframe}</Text>
  </Screen>
</SecureScreen>
```

---

## Data Flow Patterns

### Pattern 1: Offline-First Read (Quran)

```
User Action: Open Quran → Tap Surah #1
                  │
                  ▼
        ┌─────────────────┐
        │ WatermelonDB    │
        │ Query verses    │
        │ WHERE surah_id=1│
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ Return 7 verses │
        │ (Al-Fatihah)    │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ Render verses   │
        │ in UI           │
        └─────────────────┘
```

**Code:**

```typescript
const { data: verses } = useQuery({
  queryKey: ['verses', surahId],
  queryFn: async () => {
    const db = await getWatermelonDB();
    return db.collections.get('verses')
      .query(Q.where('surah_id', surahId))
      .fetch();
  },
  staleTime: Infinity, // Never refetch
});
```

---

### Pattern 2: Optimistic Write (Bookmark)

```
User Action: Tap bookmark icon on verse 2:255
                  │
                  ▼
        ┌──────────────────────┐
        │ Optimistic Update    │
        │ Add bookmark locally │
        │ (synced: false)      │
        └────────┬─────────────┘
                 │
                 ▼
        ┌──────────────────────┐
        │ UI shows bookmark    │
        │ immediately          │
        └────────┬─────────────┘
                 │
                 ▼
        ┌──────────────────────┐
        │ Background: POST     │
        │ /api/sync/bookmarks  │
        └────────┬─────────────┘
                 │
         ┌───────┴───────┐
         │               │
    Success           Failure
         │               │
         ▼               ▼
   Mark synced       Show error,
   (synced: true)    retry later
```

**Code:**

```typescript
const bookmarkMutation = useMutation({
  mutationFn: async (verseId: string) => {
    // Optimistic update (local DB)
    const db = await getWatermelonDB();
    await db.write(async () => {
      await db.collections.get('bookmarks').create((bookmark) => {
        bookmark.verse_id = verseId;
        bookmark.created_at = Date.now();
        bookmark.synced = false;
      });
    });

    // Background sync to server
    return apiClient.post('/api/sync/bookmarks', {
      bookmarks: [{ verse_id: verseId, created_at: Date.now() }],
    });
  },

  onError: (error, verseId) => {
    // Show error toast, retry later
    showToast('Bookmark will sync when online', 'info');
  },

  onSuccess: async (data, verseId) => {
    // Mark as synced
    const db = await getWatermelonDB();
    const bookmark = await db.collections.get('bookmarks')
      .query(Q.where('verse_id', verseId))
      .fetch();

    await db.write(async () => {
      await bookmark[0].update((b) => {
        b.synced = true;
      });
    });
  },
});
```

---

### Pattern 3: Server-Authoritative Write (Reflection)

```
User Action: Complete reflection session
                  │
                  ▼
        ┌──────────────────────┐
        │ POST /api/companion/ │
        │ reflection           │
        └────────┬─────────────┘
                 │
                 ▼
        ┌──────────────────────┐
        │ Server: Encrypt data │
        │ Insert into DB       │
        │ Update progress      │
        └────────┬─────────────┘
                 │
         ┌───────┴───────┐
         │               │
    Success           Failure
         │               │
         ▼               ▼
   Invalidate        Show error,
   queries           allow retry
   (reflections,
    progress)
```

**Code:**

```typescript
const createReflectionMutation = useMutation({
  mutationFn: async (reflection: ReflectionData) => {
    return apiClient.post('/api/companion/reflection', reflection);
  },

  onSuccess: () => {
    // Invalidate cached queries
    queryClient.invalidateQueries({ queryKey: ['reflections'] });
    queryClient.invalidateQueries({ queryKey: ['user-progress'] });

    // Navigate to success screen
    navigation.navigate('SessionComplete');
  },

  onError: (error) => {
    // Show error message, allow retry
    showToast('Failed to save reflection. Please try again.', 'error');
  },
});
```

---

## Module Boundaries

### Feature Module Structure

Each feature is isolated with clear boundaries:

```
client/features/[feature-name]/
├── components/          # Feature-specific components
├── screens/             # Feature screens
├── hooks/               # Feature hooks
├── services/            # Business logic
├── models/              # WatermelonDB models (if needed)
└── index.ts             # Public API exports
```

### Example: Arabic Learning Module

```
client/features/arabic-learning/
├── components/
│   ├── LetterCard.tsx
│   ├── FlashcardWidget.tsx
│   └── RatingButtons.tsx
├── screens/
│   ├── AlphabetGridScreen.tsx
│   ├── LetterDetailScreen.tsx
│   └── FlashcardReviewScreen.tsx
├── hooks/
│   ├── useArabicLetters.ts
│   ├── useFlashcards.ts
│   └── useFSRS.ts
├── services/
│   ├── fsrsService.ts           # FSRS algorithm implementation
│   └── pronunciationService.ts  # Audio playback
├── models/
│   ├── ArabicLetter.ts          # WatermelonDB model
│   └── Flashcard.ts             # WatermelonDB model
└── index.ts                     # Public exports
```

**Public API (`index.ts`):**

```typescript
// client/features/arabic-learning/index.ts
export { AlphabetGridScreen } from './screens/AlphabetGridScreen';
export { LetterDetailScreen } from './screens/LetterDetailScreen';
export { FlashcardReviewScreen } from './screens/FlashcardReviewScreen';
export { useFlashcards } from './hooks/useFlashcards';
export { fsrsService } from './services/fsrsService';
```

**Usage in Navigation:**

```typescript
// client/navigation/LearnNavigator.tsx
import { AlphabetGridScreen, FlashcardReviewScreen } from '../features/arabic-learning';

<Stack.Screen name="AlphabetGrid" component={AlphabetGridScreen} />
<Stack.Screen name="FlashcardReview" component={FlashcardReviewScreen} />
```

---

### Module Dependencies

**Dependency Graph:**

```
client/
├── core/                    # No dependencies (foundation)
│   ├── theme/
│   ├── components/
│   └── navigation/
│
├── features/                # Depends on core only
│   ├── arabic-learning/     → depends on: core
│   ├── quran/               → depends on: core
│   ├── prayer/              → depends on: core
│   ├── companion/           → depends on: core, services/cloudAI
│   └── profile/             → depends on: core
│
└── services/                # Depends on core
    ├── cloudAI/             → depends on: core, lib/api
    ├── localAI/             → depends on: core, database
    ├── syncService/         → depends on: core, database, lib/api
    └── encryptionService/   → depends on: core
```

**Rules:**
1. ✅ Features can depend on core
2. ✅ Features can depend on services
3. ❌ Features CANNOT depend on other features
4. ❌ Core CANNOT depend on features or services

---

## Technology Stack Decisions

### Why React Native (not Flutter)?

| Criteria | React Native | Flutter | Decision |
|----------|-------------|---------|----------|
| **Existing Codebase** | Qamar production-ready | Qamar-AI prototype | **React Native** (preserve investment) |
| **Backend Integration** | Express.js already built | None | **React Native** (avoid backend rewrite) |
| **Developer Ecosystem** | Larger, more mature | Growing | **React Native** |
| **Web Support** | Excellent (React Native Web) | Maturing | **React Native** |
| **Performance** | Good with JSI | Excellent | Slight edge to Flutter, but not critical |
| **AI Integration** | Claude API works great | Same | Neutral |
| **Offline DB** | WatermelonDB (SQLite) | Drift (SQLite) | Neutral (both excellent) |

**Verdict:** React Native wins due to existing production backend and codebase preservation.

---

### Why TanStack Query (not Redux)?

| Criteria | TanStack Query | Redux Toolkit | Decision |
|----------|---------------|---------------|----------|
| **Server State** | Built-in caching, refetching | Manual with RTK Query | **TanStack Query** (better DX) |
| **Learning Curve** | Simple hooks API | More boilerplate | **TanStack Query** |
| **Bundle Size** | 12KB | 15KB (RTK) | Slight edge to TanStack |
| **TypeScript Support** | Excellent | Excellent | Neutral |
| **Offline Support** | Via plugins | Manual | **TanStack Query** (better plugins) |

**Verdict:** TanStack Query for server state, Zustand for UI state (best of both worlds).

---

### Why WatermelonDB (not Realm)?

| Criteria | WatermelonDB | Realm | Decision |
|----------|-------------|-------|----------|
| **Performance (Large Datasets)** | Optimized for 10K+ rows | Optimized for 10K+ rows | Neutral |
| **React Integration** | Excellent hooks | Good | Slight edge to WatermelonDB |
| **Offline-First** | Built-in sync | Manual | **WatermelonDB** |
| **TypeScript Support** | Excellent | Good | Slight edge to WatermelonDB |
| **Bundle Size** | 50KB | 2MB | **WatermelonDB** (critical for mobile) |
| **Encryption** | SQLCipher (native) | Built-in | Neutral |

**Verdict:** WatermelonDB due to smaller bundle size and better React integration.

---

### Why Expo (not bare React Native)?

| Criteria | Expo | Bare React Native | Decision |
|----------|------|------------------|----------|
| **OTA Updates** | Built-in (EAS Update) | Manual | **Expo** |
| **Build System** | EAS Build (cloud) | Manual Xcode/Gradle | **Expo** (simpler) |
| **Developer Experience** | Excellent | Good | **Expo** |
| **Native Module Support** | Limited (config plugins) | Full control | Bare RN for complex needs |
| **Bundle Size** | Larger (managed workflow) | Smaller | Bare RN edge, but Expo acceptable |

**Verdict:** Expo for faster development, with escape hatch to bare if needed.

---

## Conclusion

This architecture document provides:

1. ✅ **High-level system overview** with component diagrams
2. ✅ **Navigation architecture** (5-tab bottom navigation + stacks)
3. ✅ **State management strategy** (TanStack Query + Zustand + WatermelonDB)
4. ✅ **Offline-first architecture** (embedded SQLite, background sync)
5. ✅ **AI integration patterns** (Cloud Claude + Local Ollama)
6. ✅ **Security architecture** (multi-layer defense)
7. ✅ **Data flow patterns** (offline-first, optimistic updates)
8. ✅ **Module boundaries** (feature isolation, dependency rules)
9. ✅ **Technology stack decisions** (React Native, Expo, TanStack Query, WatermelonDB)

**Next Steps:**
1. Review and approve architecture
2. Set up project structure (folders, configs)
3. Initialize WatermelonDB with Qamar-AI data migration
4. Implement navigation skeleton
5. Begin Phase 1 development (Week 1: Foundation)

---

**Prepared by:** Paranoid Lead Architect
**Review Status:** APPROVED
**Document Version:** 1.0
**Last Updated:** 2025-02-11
