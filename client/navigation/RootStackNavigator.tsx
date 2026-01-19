import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "@/hooks/useScreenOptions";

import TabNavigator from "@/navigation/TabNavigator";
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

  return (
    <Stack.Navigator screenOptions={screenOptions}>
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
