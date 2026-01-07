import React, { useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp, CommonActions } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts, SiraatColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { saveSession } from "@/lib/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "SessionComplete">;
type RouteType = RouteProp<RootStackParamList, "SessionComplete">;

export default function SessionCompleteScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { thought, distortions, reframe, intention, practice } = route.params;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    saveSession({
      thought,
      distortions,
      reframe,
      intention,
      practice,
      timestamp: Date.now(),
    });
  }, []);

  const handleGoHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: insets.top + Spacing["4xl"],
          paddingBottom: insets.bottom + Spacing["4xl"],
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={[styles.checkCircle, { backgroundColor: SiraatColors.emerald }]}>
          <Feather name="check" size={40} color={SiraatColors.cream} />
        </View>
        <ThemedText type="h2" style={[styles.title, { fontFamily: Fonts?.serif }]}>
          Session Complete
        </ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          You have walked the straight path today
        </ThemedText>
      </View>

      <View style={styles.summarySection}>
        <View style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            Your Intention
          </ThemedText>
          <ThemedText type="bodyLarge" style={[styles.intentionText, { fontFamily: Fonts?.serif }]}>
            {intention}
          </ThemedText>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            The Reframe
          </ThemedText>
          <ThemedText type="body" style={[styles.reframeText, { fontFamily: Fonts?.serif }]}>
            {reframe}
          </ThemedText>
        </View>
      </View>

      <View style={styles.closingSection}>
        <ThemedText type="body" style={[styles.closingText, { color: theme.textSecondary, fontFamily: Fonts?.serif }]}>
          "Verily, with hardship comes ease."
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.accent }}>
          Quran 94:6
        </ThemedText>
      </View>

      <View style={styles.buttonSection}>
        <Button
          onPress={handleGoHome}
          style={{ backgroundColor: theme.primary }}
        >
          Return Home
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["4xl"],
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
  },
  summarySection: {
    gap: Spacing.lg,
    marginBottom: Spacing["3xl"],
  },
  summaryCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  intentionText: {
    marginTop: Spacing.sm,
    lineHeight: 28,
  },
  reframeText: {
    marginTop: Spacing.sm,
    lineHeight: 24,
    fontStyle: "italic",
  },
  closingSection: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  closingText: {
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: Spacing.xs,
  },
  buttonSection: {
    marginTop: "auto",
  },
});
