import React, { useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp, CommonActions } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useQuery } from "@tanstack/react-query";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts, SiraatColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { saveSession } from "@/lib/storage";
import { ScreenCopy } from "@/constants/brand";
import { getBillingStatus, isPaidStatus } from "@/lib/billing";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "SessionComplete">;
type RouteType = RouteProp<RootStackParamList, "SessionComplete">;

export default function SessionCompleteScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { thought, distortions, reframe, intention, practice, anchor } = route.params;

  const { data: billingStatus } = useQuery({
    queryKey: ["/api/billing/status"],
    queryFn: getBillingStatus,
    staleTime: 60000,
  });

  const isPaid = billingStatus ? isPaidStatus(billingStatus.status) : false;

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
          {ScreenCopy.complete.title}
        </ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          {ScreenCopy.complete.subtitle}
        </ThemedText>
      </View>

      <View style={styles.cardsSection}>
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {ScreenCopy.complete.cards.niyyah}
          </ThemedText>
          <ThemedText type="bodyLarge" style={[styles.cardText, { fontFamily: Fonts?.serif }]}>
            {intention}
          </ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {ScreenCopy.complete.cards.anchor}
          </ThemedText>
          <ThemedText type="body" style={[styles.cardText, { fontFamily: Fonts?.serif, fontStyle: "italic" }]}>
            {anchor}
          </ThemedText>
        </View>
      </View>

      <View style={styles.buttonSection}>
        <Button
          onPress={handleGoHome}
          style={{ backgroundColor: theme.primary }}
        >
          {ScreenCopy.complete.returnHome}
        </Button>
      </View>

      {!isPaid ? (
        <View style={[styles.upgradeCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="bodyLarge" style={[styles.upgradeTitle, { fontFamily: Fonts?.serif }]}>
            Continue with Noor Plus
          </ThemedText>
          <ThemedText type="body" style={[styles.upgradeBody, { color: theme.textSecondary }]}>
            More reflections, deeper pattern recognition, and calmer continuity.
          </ThemedText>
          <Pressable
            onPress={() => navigation.navigate("Pricing")}
            style={({ pressed }) => [
              styles.upgradeButton,
              { backgroundColor: SiraatColors.indigo, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <ThemedText type="body" style={{ color: "#fff" }}>
              Upgrade to Noor Plus
            </ThemedText>
          </Pressable>
          <ThemedText type="caption" style={[styles.upgradeFootnote, { color: theme.textSecondary }]}>
            Free plan includes 1 reflection per day.
          </ThemedText>
        </View>
      ) : null}
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
    marginBottom: Spacing["3xl"],
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
  cardsSection: {
    gap: Spacing.xl,
    marginBottom: Spacing["4xl"],
  },
  card: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.md,
  },
  cardText: {
    marginTop: Spacing.md,
    lineHeight: 28,
  },
  buttonSection: {
    marginTop: "auto",
  },
  upgradeCard: {
    marginTop: Spacing["3xl"],
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  upgradeTitle: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  upgradeBody: {
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  upgradeButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing["2xl"],
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  upgradeFootnote: {
    textAlign: "center",
    opacity: 0.7,
  },
});
