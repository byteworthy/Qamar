import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp, CommonActions } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useQuery, useMutation } from "@tanstack/react-query";
import Animated, { FadeIn, FadeInUp, BounceIn } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts, SiraatColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { saveSession } from "@/lib/storage";
import { ScreenCopy } from "@/constants/brand";
import { getBillingStatus, isPaidStatus } from "@/lib/billing";
import { apiRequest } from "@/lib/query-client";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "SessionComplete">;
type RouteType = RouteProp<RootStackParamList, "SessionComplete">;

interface ContextualDua {
  arabic: string;
  transliteration: string;
  meaning: string;
}

async function fetchContextualDua(state: string): Promise<{ dua: ContextualDua }> {
  const response = await apiRequest("POST", "/api/duas/contextual", { state });
  return response.json();
}

export default function SessionCompleteScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { thought, distortions, reframe, intention, practice, anchor } = route.params;

  const [detectedState, setDetectedState] = useState<string | null>(null);
  const [dua, setDua] = useState<ContextualDua | null>(null);
  const [duaLoading, setDuaLoading] = useState(false);
  const [duaError, setDuaError] = useState(false);

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

    const saveToServer = async () => {
      try {
        const response = await apiRequest("POST", "/api/reflection/save", { thought, distortions, reframe, intention, practice, anchor });
        const data = await response.json();
        if (data.detectedState) {
          setDetectedState(data.detectedState);
        }
      } catch (error) {
        console.error("Error saving reflection to server:", error);
      }
    };

    saveToServer();
  }, []);

  useEffect(() => {
    if (isPaid && detectedState) {
      setDuaLoading(true);
      setDuaError(false);
      fetchContextualDua(detectedState)
        .then((data) => {
          setDua(data.dua);
        })
        .catch((error) => {
          console.error("Error fetching dua:", error);
          setDuaError(true);
        })
        .finally(() => {
          setDuaLoading(false);
        });
    }
  }, [isPaid, detectedState]);

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
        <Animated.View 
          entering={BounceIn.duration(600).delay(100)} 
          style={[styles.checkCircle, { backgroundColor: SiraatColors.emerald }]}
        >
          <Feather name="check" size={40} color={SiraatColors.cream} />
        </Animated.View>
        <Animated.Text entering={FadeIn.duration(400).delay(300)}>
          <ThemedText type="h2" style={[styles.title, { fontFamily: Fonts?.serif }]}>
            {ScreenCopy.complete.title}
          </ThemedText>
        </Animated.Text>
        <Animated.View entering={FadeIn.duration(400).delay(400)}>
          <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
            {ScreenCopy.complete.subtitle}
          </ThemedText>
        </Animated.View>
        <Animated.View entering={FadeIn.duration(400).delay(500)}>
          <ThemedText type="body" style={[styles.encouragement, { color: theme.accent, fontFamily: Fonts?.serif }]}>
            {ScreenCopy.complete.encouragement}
          </ThemedText>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInUp.duration(400).delay(600)} style={styles.cardsSection}>
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <View style={[styles.cardAccent, { backgroundColor: SiraatColors.clay }]} />
          <View style={styles.cardContent}>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {ScreenCopy.complete.cards.niyyah}
            </ThemedText>
            <ThemedText type="bodyLarge" style={[styles.cardText, { fontFamily: Fonts?.serif }]}>
              {intention}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <View style={[styles.cardAccent, { backgroundColor: SiraatColors.emerald }]} />
          <View style={styles.cardContent}>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {ScreenCopy.complete.cards.anchor}
            </ThemedText>
            <ThemedText type="body" style={[styles.cardText, { fontFamily: Fonts?.serif, fontStyle: "italic" }]}>
              {anchor}
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      {isPaid && (dua || duaLoading || duaError) ? (
        <View style={[styles.duaCard, { backgroundColor: theme.backgroundDefault, borderColor: SiraatColors.indigo }]}>
          <View style={[styles.duaProBadge, { backgroundColor: SiraatColors.indigo }]}>
            <Feather name="star" size={12} color="#fff" />
            <ThemedText type="caption" style={{ color: "#fff", marginLeft: 4 }}>Noor Plus</ThemedText>
          </View>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            Dua for Your Heart
          </ThemedText>
          {duaLoading ? (
            <ActivityIndicator size="small" color={theme.primary} style={{ marginTop: Spacing.lg }} />
          ) : duaError ? (
            <ThemedText type="small" style={[styles.duaFallback, { color: theme.textSecondary }]}>
              Your reflection has been saved. May Allah bring you clarity and peace.
            </ThemedText>
          ) : dua ? (
            <>
              <ThemedText type="bodyLarge" style={[styles.duaArabic, { fontFamily: Fonts?.serif }]}>
                {dua.arabic}
              </ThemedText>
              <ThemedText type="body" style={[styles.duaTransliteration, { color: theme.textSecondary }]}>
                {dua.transliteration}
              </ThemedText>
              <ThemedText type="body" style={[styles.duaMeaning, { fontFamily: Fonts?.serif }]}>
                {dua.meaning}
              </ThemedText>
            </>
          ) : null}
        </View>
      ) : null}

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
  encouragement: {
    textAlign: "center",
    marginTop: Spacing.md,
    fontStyle: "italic",
  },
  cardsSection: {
    gap: Spacing.lg,
    marginBottom: Spacing["3xl"],
  },
  card: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  cardAccent: {
    width: 4,
    alignSelf: "stretch",
  },
  cardContent: {
    flex: 1,
    padding: Spacing["2xl"],
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
  duaCard: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  duaProBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.md,
  },
  duaArabic: {
    marginTop: Spacing.lg,
    textAlign: "right",
    fontSize: 24,
    lineHeight: 40,
  },
  duaTransliteration: {
    marginTop: Spacing.md,
    fontStyle: "italic",
  },
  duaMeaning: {
    marginTop: Spacing.sm,
    lineHeight: 26,
  },
  duaFallback: {
    marginTop: Spacing.lg,
    fontStyle: "italic",
    lineHeight: 22,
  },
});
