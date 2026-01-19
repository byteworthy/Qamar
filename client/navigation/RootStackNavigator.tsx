import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "@/hooks/useScreenOptions";

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

export type RootStackParamList = {
  Onboarding_Welcome: undefined;
  Onboarding_Privacy: undefined;
  Onboarding_Safety: undefined;
  Main: undefined;
  Home: undefined;
  ThoughtCapture: undefined;
  Distortion: {
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
  SessionComplete: {
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
};

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
        name="Distortion"
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
        options={{ headerTitle: "Clearer Perspective", gestureEnabled: false }}
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
        name="SessionComplete"
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
    </Stack.Navigator>
  );
}
