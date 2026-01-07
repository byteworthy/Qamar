import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts, SiraatColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Brand, DailyAnchorConcepts, ScreenCopy } from "@/constants/brand";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const dailyAnchor = useMemo(() => {
    const today = new Date();
    const dayIndex = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % DailyAnchorConcepts.length;
    return DailyAnchorConcepts[dayIndex];
  }, []);

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
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
          contentFit="contain"
        />
        <ThemedText type="h1" style={[styles.title, { fontFamily: Fonts?.serif }]}>
          {Brand.name}
        </ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          {Brand.tagline}
        </ThemedText>
      </View>

      <View style={[styles.anchorCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={[styles.anchorAccent, { backgroundColor: SiraatColors.indigo }]} />
        <ThemedText type="body" style={[styles.anchorText, { fontFamily: Fonts?.serif }]}>
          {dailyAnchor}
        </ThemedText>
      </View>

      <View style={styles.mainContent}>
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <ThemedText type="h4" style={[styles.cardTitle, { fontFamily: Fonts?.serif }]}>
            Begin Your Reflection
          </ThemedText>
          <ThemedText type="body" style={[styles.cardDescription, { color: theme.textSecondary }]}>
            Take a moment to slow down, identify what troubles your mind, and find clarity through faith-grounded reflection.
          </ThemedText>
          <Button
            onPress={() => navigation.navigate("ThoughtCapture")}
            style={{ backgroundColor: theme.primary, marginTop: Spacing.xl }}
          >
            {ScreenCopy.home.cta}
          </Button>
          <ThemedText type="caption" style={[styles.methodCallout, { color: theme.textSecondary }]}>
            {Brand.methodCallout}
          </ThemedText>
        </View>

        <Pressable
          onPress={() => navigation.navigate("History")}
          style={({ pressed }) => [
            styles.historyButton,
            { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather name="clock" size={20} color={theme.textSecondary} />
          <ThemedText type="body" style={{ marginLeft: Spacing.sm, color: theme.textSecondary }}>
            {ScreenCopy.home.historyLink}
          </ThemedText>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} style={{ marginLeft: "auto" }} />
        </Pressable>
      </View>

      <View style={styles.footer}>
        <ThemedText type="caption" style={[styles.disclaimer, { color: theme.textSecondary }]}>
          {Brand.disclaimer}
        </ThemedText>
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
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    textAlign: "center",
  },
  anchorCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    overflow: "hidden",
  },
  anchorAccent: {
    width: 4,
    alignSelf: "stretch",
  },
  anchorText: {
    flex: 1,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    fontStyle: "italic",
    lineHeight: 22,
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    gap: Spacing.lg,
  },
  card: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.lg,
  },
  cardTitle: {
    marginBottom: Spacing.sm,
  },
  cardDescription: {
    lineHeight: 24,
  },
  methodCallout: {
    textAlign: "center",
    marginTop: Spacing.lg,
    fontStyle: "italic",
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  footer: {
    alignItems: "center",
    marginTop: Spacing["4xl"],
    gap: Spacing.xs,
  },
  disclaimer: {
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: Spacing.md,
  },
});
