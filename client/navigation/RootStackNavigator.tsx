import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "@/hooks/useScreenOptions";

import HomeScreen from "@/screens/HomeScreen";
import ThoughtCaptureScreen from "@/screens/ThoughtCaptureScreen";
import DistortionScreen from "@/screens/DistortionScreen";
import ReframeScreen from "@/screens/ReframeScreen";
import RegulationScreen from "@/screens/RegulationScreen";
import IntentionScreen from "@/screens/IntentionScreen";
import SessionCompleteScreen from "@/screens/SessionCompleteScreen";
import HistoryScreen from "@/screens/HistoryScreen";

export type RootStackParamList = {
  Home: undefined;
  ThoughtCapture: undefined;
  Distortion: { thought: string };
  Reframe: { thought: string; distortions: string[]; analysis: string };
  Regulation: { thought: string; distortions: string[]; reframe: string };
  Intention: { thought: string; distortions: string[]; reframe: string; practice: string };
  SessionComplete: { thought: string; distortions: string[]; reframe: string; intention: string };
  History: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
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
        options={{ headerTitle: "Understanding", gestureEnabled: false }}
      />
      <Stack.Screen
        name="Reframe"
        component={ReframeScreen}
        options={{ headerTitle: "Reframe", gestureEnabled: false }}
      />
      <Stack.Screen
        name="Regulation"
        component={RegulationScreen}
        options={{ headerTitle: "Regulate", gestureEnabled: false }}
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
        options={{ headerTitle: "Past Sessions" }}
      />
    </Stack.Navigator>
  );
}
