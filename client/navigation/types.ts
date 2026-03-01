/**
 * Centralized navigation types for the Qamar app
 *
 * This file provides type-safe navigation types that can be imported
 * throughout the app to ensure proper navigation typing.
 */

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

/**
 * Root stack parameter list
 * Defines all screens and their route parameters
 */
export type RootStackParamList = {
  Onboarding_Welcome: undefined;
  Onboarding_Privacy: undefined;
  Onboarding_Safety: undefined;
  Main: undefined;
  Home: undefined;
  ThoughtCapture: undefined;
  Noticing: {
    thought: string;
    emotionalIntensity?: number; // 1-5 scale from emotional anchoring
    somaticAwareness?: string; // Body sensation from somatic prompt
  };
  BeliefInspection: {
    thought: string;
    distortions: string[];
    analysis: string;
    emotionalIntensity?: number;
  };
  Reframe: {
    thought: string;
    distortions: string[];
    analysis: string;
    emotionalIntensity?: number;
    beliefStrength?: number; // 0-100% from belief inspection
  };
  Regulation: {
    thought: string;
    distortions: string[];
    reframe: string;
    anchor: string;
    emotionalIntensity?: number;
  };
  Intention: {
    thought: string;
    distortions: string[];
    reframe: string;
    practice: string;
    anchor: string;
    detectedState?: string;
    emotionalIntensity?: number;
  };
  ReflectionComplete: {
    thought: string;
    distortions: string[];
    reframe: string;
    intention: string;
    practice: string;
    anchor: string;
    detectedState?: string;
    emotionalIntensity?: number;
    somaticAwareness?: string;
  };
  History: undefined;
  Pricing: undefined;
  BillingSuccess: undefined;
  CalmingPractice: undefined;
  Dua: { state?: string }; // For contextual duas based on emotional state
  Insights: undefined;
  QuranReader: undefined;
  VerseReader: { surahId: number };
  VerseDiscussion: {
    surahNumber: number;
    verseNumber: number;
  };
  PrayerTimes: undefined;
  QiblaFinder: undefined;
  ArabicLearning: undefined;
  FlashcardReview: undefined;
  HadithLibrary: undefined;
  HadithList: { collectionId: string };
  HadithDetail: { hadithId: string };
  AdhkarList: undefined;
  AlphabetGrid: undefined;
  ProgressDashboard: undefined;
  IslamicCalendar: undefined;
  AskKarim: undefined;
  DailyNoor: undefined;
  Achievements: undefined;
  RamadanHub: undefined;
  FastingTracker: undefined;
  ArabicTutor: undefined;
  PronunciationCoach: { surahNumber?: number; verseNumber?: number };
  Translator: undefined;
  TajweedGuide: undefined;
  DuaFinder: undefined;
  StudyPlan: undefined;
  TravelTranslator: undefined;
  HifzDashboard: undefined;
  HifzRecitation: {
    surahNumber: number;
    verseNumber: number;
    mode?: "review" | "memorize";
  };
};

/**
 * Generic navigation prop for any screen in the root stack
 * Use this when you need navigation without specifying the current screen
 */
export type RootStackNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

/**
 * Navigation prop for a specific screen
 * Example: NavigationProp<'ReflectionComplete'>
 */
export type NavigationProp<T extends keyof RootStackParamList> =
  NativeStackNavigationProp<RootStackParamList, T>;

/**
 * Route prop for a specific screen
 * Example: RouteType<'ReflectionComplete'>
 */
export type RouteType<T extends keyof RootStackParamList> = RouteProp<
  RootStackParamList,
  T
>;
