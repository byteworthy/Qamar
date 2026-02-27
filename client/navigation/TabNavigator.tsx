import React, { useEffect } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { NiyyahColors } from "@/constants/theme";
import { hapticLight } from "@/lib/haptics";

import HomeScreen from "@/screens/HomeScreen";
import KhalilScreen from "@/screens/KhalilScreen";
import LearnTabScreen from "@/screens/learn/LearnTabScreen";
import WorshipTabScreen from "@/screens/worship/WorshipTabScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import RamadanHubScreen from "@/screens/RamadanHubScreen";
import { getHijriDate } from "@/services/islamicCalendar";

export type TabParamList = {
  HomeTab: undefined;
  Khalil: undefined;
  Learn: undefined;
  Worship: undefined;
  Ramadan: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

/**
 * Animated tab icon with scale and color transitions
 * Provides visual feedback when switching tabs
 */
interface AnimatedTabIconProps {
  name: keyof typeof Feather.glyphMap;
  color: string;
  focused: boolean;
}

function AnimatedTabIcon({ name, color, focused }: AnimatedTabIconProps) {
  const scale = useSharedValue(focused ? 1 : 0.9);
  const colorProgress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    if (focused) {
      // Trigger haptic feedback when tab becomes focused
      hapticLight();
    }

    // Animate scale
    scale.value = withSpring(focused ? 1.1 : 0.95, {
      damping: 15,
      stiffness: 150,
    });

    // Animate color transition
    colorProgress.value = withTiming(focused ? 1 : 0, {
      duration: 200,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Feather name={name} size={22} color={color} />
    </Animated.View>
  );
}

function TabBarBackground() {
  if (Platform.OS === "ios") {
    return (
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
    );
  }

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: NiyyahColors.backgroundLight },
      ]}
    />
  );
}

export default function TabNavigator() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Show Ramadan tab during Ramadan month (Hijri month 9)
  const isRamadan = React.useMemo(() => {
    const hijri = getHijriDate();
    return hijri.monthNumber === 9;
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          height: 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom + 4,
        },
        tabBarBackground: TabBarBackground,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          // @ts-ignore tabBarTestID is valid at runtime for Detox E2E
          tabBarTestID: "tab-home",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Khalil"
        component={KhalilScreen}
        options={{
          tabBarLabel: "Khalil",
          // @ts-ignore tabBarTestID is valid at runtime for Detox E2E
          tabBarTestID: "tab-history",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="heart" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Learn"
        component={LearnTabScreen}
        options={{
          tabBarLabel: "Learn",
          // @ts-ignore tabBarTestID is valid at runtime for Detox E2E
          tabBarTestID: "tab-learn",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="book-open" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Worship"
        component={WorshipTabScreen}
        options={{
          tabBarLabel: "Worship",
          // @ts-ignore tabBarTestID is valid at runtime for Detox E2E
          tabBarTestID: "tab-worship",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="sun" color={color} focused={focused} />
          ),
        }}
      />
      {isRamadan && (
        <Tab.Screen
          name="Ramadan"
          component={RamadanHubScreen}
          options={{
            tabBarLabel: "Ramadan",
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon name="moon" color={color} focused={focused} />
            ),
          }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          // @ts-ignore tabBarTestID is valid at runtime for Detox E2E
          tabBarTestID: "tab-settings",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="user" color={color} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
