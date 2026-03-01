import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { RootStackParamList } from "@/navigation/types";
import { OfflineBanner } from "@/components/OfflineBanner";

import TabNavigator from "@/navigation/TabNavigator";
import WelcomeScreen from "@/screens/onboarding/WelcomeScreen";
import PrivacyScreen from "@/screens/onboarding/PrivacyScreen";
import SafetyScreen from "@/screens/onboarding/SafetyScreen";
import ThoughtCaptureScreen from "@/screens/ThoughtCaptureScreen";
import DistortionScreen from "@/screens/DistortionScreen";
import BeliefInspectionScreen from "@/screens/BeliefInspectionScreen";
import ReframeScreen from "@/screens/ReframeScreen";
import RegulationScreen from "@/screens/RegulationScreen";
import IntentionScreen from "@/screens/IntentionScreen";
import SessionCompleteScreen from "@/screens/SessionCompleteScreen";
import HistoryScreen from "@/screens/HistoryScreen";
import PricingScreen from "@/screens/PricingScreen";
import BillingSuccessScreen from "@/screens/BillingSuccessScreen";
import CalmingPracticeScreen from "@/screens/CalmingPracticeScreen";
import DuaScreen from "@/screens/DuaScreen";
import InsightsScreen from "@/screens/InsightsScreen";
import QuranReaderScreen from "@/screens/learn/QuranReaderScreen";
import VerseReaderScreen from "@/screens/learn/VerseReaderScreen";
import VerseDiscussionScreen from "@/screens/learn/VerseDiscussionScreen";
import PrayerTimesScreen from "@/screens/worship/PrayerTimesScreen";
import QiblaFinderScreen from "@/screens/worship/QiblaFinderScreen";
import IslamicCalendarScreen from "@/screens/worship/IslamicCalendarScreen";
import ArabicLearningScreen from "@/screens/learn/ArabicLearningScreen";
import FlashcardReviewScreen from "@/screens/learn/FlashcardReviewScreen";
import HadithLibraryScreen from "@/screens/learn/HadithLibraryScreen";
import HadithListScreen from "@/screens/learn/HadithListScreen";
import HadithDetailScreen from "@/screens/learn/HadithDetailScreen";
import AdhkarListScreen from "@/screens/adhkar/AdhkarListScreen";
import AlphabetGridScreen from "@/screens/arabic/AlphabetGridScreen";
import ProgressDashboardScreen from "@/screens/progress/ProgressDashboardScreen";
import AskAmarScreen from "@/screens/learn/AskAmarScreen";
import DailyNoorScreen from "@/screens/DailyNoorScreen";
import AchievementsScreen from "@/screens/AchievementsScreen";
import RamadanHubScreen from "@/screens/RamadanHubScreen";
import FastingTrackerScreen from "@/screens/FastingTrackerScreen";
import ArabicTutorScreen from "@/screens/learn/ArabicTutorScreen";
import PronunciationCoachScreen from "@/screens/learn/PronunciationCoachScreen";
import TranslatorScreen from "@/screens/learn/TranslatorScreen";
import TajweedGuideScreen from "@/screens/learn/TajweedGuideScreen";
import DuaFinderScreen from "@/screens/learn/DuaFinderScreen";
import StudyPlanScreen from "@/screens/learn/StudyPlanScreen";
import TravelTranslatorScreen from "@/screens/learn/TravelTranslatorScreen";
import HifzDashboardScreen from "@/screens/learn/HifzDashboardScreen";
import HifzRecitationScreen from "@/screens/learn/HifzRecitationScreen";

// Re-export RootStackParamList for convenience
export type { RootStackParamList };

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const [onboardingCompleted, setOnboardingCompleted] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      const { getOnboardingCompleted } = await import("@/lib/storage");
      const completed = await getOnboardingCompleted();
      setOnboardingCompleted(completed);
    };
    checkOnboarding();
  }, []);

  // Show nothing while checking onboarding status
  if (onboardingCompleted === null) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <OfflineBanner />
      <Stack.Navigator
        screenOptions={screenOptions}
        initialRouteName={onboardingCompleted ? "Main" : "Onboarding_Welcome"}
      >
        {/* Onboarding Screens */}
        <Stack.Screen
          name="Onboarding_Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Onboarding_Privacy"
          component={PrivacyScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Onboarding_Safety"
          component={SafetyScreen}
          options={{ headerShown: false }}
        />

        {/* Main App Screens */}
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ThoughtCapture"
          component={ThoughtCaptureScreen}
          options={{ headerTitle: "Capture Your Thought" }}
        />
        <Stack.Screen
          name="Noticing"
          component={DistortionScreen}
          options={{ headerTitle: "Reflection", gestureEnabled: false }}
        />
        <Stack.Screen
          name="BeliefInspection"
          component={BeliefInspectionScreen}
          options={{ headerTitle: "Examine Belief", gestureEnabled: false }}
        />
        <Stack.Screen
          name="Reframe"
          component={ReframeScreen}
          options={{
            headerTitle: "Clearer Perspective",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="Regulation"
          component={RegulationScreen}
          options={{ headerTitle: "Calming Practice", gestureEnabled: false }}
        />
        <Stack.Screen
          name="Intention"
          component={IntentionScreen}
          options={{ headerTitle: "Set Intention", gestureEnabled: false }}
        />
        <Stack.Screen
          name="ReflectionComplete"
          component={SessionCompleteScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ headerTitle: "Past Reflections" }}
        />
        <Stack.Screen
          name="Pricing"
          component={PricingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BillingSuccess"
          component={BillingSuccessScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CalmingPractice"
          component={CalmingPracticeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Dua"
          component={DuaScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Insights"
          component={InsightsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="QuranReader"
          component={QuranReaderScreen}
          options={{ headerTitle: "Quran Reader" }}
        />
        <Stack.Screen
          name="VerseReader"
          component={VerseReaderScreen}
          options={{ headerTitle: "Verses" }}
        />
        <Stack.Screen
          name="VerseDiscussion"
          component={VerseDiscussionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PrayerTimes"
          component={PrayerTimesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="QiblaFinder"
          component={QiblaFinderScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="IslamicCalendar"
          component={IslamicCalendarScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ArabicLearning"
          component={ArabicLearningScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FlashcardReview"
          component={FlashcardReviewScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HadithLibrary"
          component={HadithLibraryScreen}
          options={{ headerTitle: "Hadith Library" }}
        />
        <Stack.Screen
          name="HadithList"
          component={HadithListScreen}
          options={{ headerTitle: "Hadiths" }}
        />
        <Stack.Screen
          name="HadithDetail"
          component={HadithDetailScreen}
          options={{ headerTitle: "Hadith" }}
        />
        <Stack.Screen
          name="AdhkarList"
          component={AdhkarListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AlphabetGrid"
          component={AlphabetGridScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProgressDashboard"
          component={ProgressDashboardScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AskAmar"
          component={AskAmarScreen}
          options={{ headerTitle: "Ask Amar" }}
        />
        <Stack.Screen
          name="DailyNoor"
          component={DailyNoorScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="Achievements"
          component={AchievementsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RamadanHub"
          component={RamadanHubScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FastingTracker"
          component={FastingTrackerScreen}
          options={{ headerTitle: "Fasting Tracker" }}
        />
        <Stack.Screen
          name="ArabicTutor"
          component={ArabicTutorScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PronunciationCoach"
          component={PronunciationCoachScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Translator"
          component={TranslatorScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TajweedGuide"
          component={TajweedGuideScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DuaFinder"
          component={DuaFinderScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="StudyPlan"
          component={StudyPlanScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TravelTranslator"
          component={TravelTranslatorScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HifzDashboard"
          component={HifzDashboardScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HifzRecitation"
          component={HifzRecitationScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </View>
  );
}
