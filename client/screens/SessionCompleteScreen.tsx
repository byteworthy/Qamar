import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useNavigation,
  useRoute,
  RouteProp,
  CommonActions,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { hapticSuccess, hapticLight, hapticMedium } from "@/lib/haptics";
import { useQuery } from "@tanstack/react-query";
import Animated, {
  FadeIn,
  FadeInUp,
  BounceIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { saveSession } from "@/lib/storage";
import { ScreenCopy } from "@/constants/brand";
import { getBillingStatus, isPaidStatus } from "@/lib/billing";
import { apiRequest } from "@/lib/query-client";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "SessionComplete"
>;
type RouteType = RouteProp<RootStackParamList, "SessionComplete">;

interface ContextualDua {
  arabic: string;
  transliteration: string;
  meaning: string;
}

async function fetchContextualDua(
  state: string,
): Promise<{ dua: ContextualDua }> {
  const response = await apiRequest("POST", "/api/duas/contextual", { state });
  return response.json();
}

/**
 * Celebration component with orchestrated animations
 * Creates a memorable moment with radial burst, particles, and haptics
 */
function CelebrationCheckmark({ theme }: { theme: any }) {
  const scale = useSharedValue(0);
  const burstOpacity = useSharedValue(0);
  const burstScale = useSharedValue(0.5);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    // Orchestrated sequence:
    // 1. Checkmark appears with bounce (0-600ms)
    scale.value = withSequence(
      withDelay(100, withSpring(1.2, { damping: 10, stiffness: 100 })),
      withSpring(1, { damping: 15, stiffness: 150 }),
    );

    // 2. Radial burst (300-1000ms)
    burstOpacity.value = withDelay(
      300,
      withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(
          300,
          withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }),
        ),
      ),
    );

    burstScale.value = withDelay(
      300,
      withTiming(2.5, { duration: 700, easing: Easing.out(Easing.cubic) }),
    );

    // 3. Persistent glow
    glowOpacity.value = withDelay(400, withSpring(0.3, { damping: 12 }));

    // Haptic symphony
    setTimeout(() => hapticSuccess(), 100); // Initial success
    setTimeout(() => hapticMedium(), 350); // Burst
    setTimeout(() => hapticLight(), 550); // Afterglow
  }, []);

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const burstStyle = useAnimatedStyle(() => ({
    opacity: burstOpacity.value,
    transform: [{ scale: burstScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.celebrationContainer}>
      {/* Radial burst effect */}
      <Animated.View style={[styles.burstRing, burstStyle]}>
        <View
          style={[
            styles.burstCircle,
            { backgroundColor: theme.highlightAccent, opacity: 0.3 },
          ]}
        />
      </Animated.View>

      {/* Persistent glow */}
      <Animated.View style={[styles.glowRing, glowStyle]}>
        <View
          style={[
            styles.glowCircle,
            { backgroundColor: theme.highlightAccent, opacity: 0.2 },
          ]}
        />
      </Animated.View>

      {/* Checkmark */}
      <Animated.View
        style={[
          styles.checkCircle,
          { backgroundColor: theme.highlightAccent },
          checkmarkStyle,
        ]}
      >
        <Feather name="check" size={40} color={theme.onPrimary} />
      </Animated.View>
    </View>
  );
}

export default function SessionCompleteScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { thought, distortions, reframe, intention, practice, anchor } =
    route.params;

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
    // Haptics are now handled by CelebrationCheckmark component

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
        const response = await apiRequest("POST", "/api/reflection/save", {
          thought,
          distortions,
          reframe,
          intention,
          practice,
          anchor,
        });
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
      }),
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
        <CelebrationCheckmark theme={theme} />

        <Animated.Text entering={FadeIn.duration(500).delay(600)}>
          <ThemedText
            type="h2"
            style={[styles.title, { fontFamily: Fonts?.serif }]}
          >
            {ScreenCopy.complete.title}
          </ThemedText>
        </Animated.Text>
        <Animated.View entering={FadeIn.duration(500).delay(750)}>
          <ThemedText
            type="body"
            style={[styles.subtitle, { color: theme.textSecondary }]}
          >
            {ScreenCopy.complete.subtitle}
          </ThemedText>
        </Animated.View>
        <Animated.View entering={FadeIn.duration(500).delay(900)}>
          <ThemedText
            type="body"
            style={[styles.affirmation, { color: theme.text }]}
          >
            {ScreenCopy.complete.affirmation}
          </ThemedText>
        </Animated.View>
        <Animated.View entering={FadeIn.duration(500).delay(1050)}>
          <ThemedText
            type="body"
            style={[
              styles.encouragement,
              { color: theme.accent, fontFamily: Fonts?.serif },
            ]}
          >
            {ScreenCopy.complete.encouragement}
          </ThemedText>
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInUp.duration(500).delay(1200).springify().damping(15)}
        style={styles.cardsSection}
      >
        <View
          style={[styles.card, { backgroundColor: theme.backgroundDefault }]}
        >
          <View
            style={[
              styles.cardAccent,
              { backgroundColor: theme.intensityHeavy },
            ]}
          />
          <View style={styles.cardContent}>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {ScreenCopy.complete.cards.niyyah}
            </ThemedText>
            <ThemedText
              type="bodyLarge"
              style={[styles.cardText, { fontFamily: Fonts?.serif }]}
            >
              {intention}
            </ThemedText>
          </View>
        </View>

        <View
          style={[styles.card, { backgroundColor: theme.backgroundDefault }]}
        >
          <View
            style={[
              styles.cardAccent,
              { backgroundColor: theme.highlightAccent },
            ]}
          />
          <View style={styles.cardContent}>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {ScreenCopy.complete.cards.anchor}
            </ThemedText>
            <ThemedText
              type="body"
              style={[
                styles.cardText,
                { fontFamily: Fonts?.serif, fontStyle: "italic" },
              ]}
            >
              {anchor}
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      {isPaid && (dua || duaLoading || duaError) ? (
        <View
          style={[
            styles.duaCard,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.pillBackground,
            },
          ]}
        >
          <View
            style={[
              styles.duaProBadge,
              { backgroundColor: theme.pillBackground },
            ]}
          >
            <Feather name="star" size={12} color={theme.onPrimary} />
            <ThemedText
              type="caption"
              style={{ color: theme.onPrimary, marginLeft: 4 }}
            >
              Noor Plus
            </ThemedText>
          </View>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            Dua for Your Heart
          </ThemedText>
          {duaLoading ? (
            <ActivityIndicator
              size="small"
              color={theme.primary}
              style={{ marginTop: Spacing.lg }}
            />
          ) : duaError ? (
            <ThemedText
              type="small"
              style={[styles.duaFallback, { color: theme.textSecondary }]}
            >
              Your reflection has been saved. May Allah bring you clarity and
              peace.
            </ThemedText>
          ) : dua ? (
            <>
              <ThemedText
                type="bodyLarge"
                style={[styles.duaArabic, { fontFamily: Fonts?.serif }]}
              >
                {dua.arabic}
              </ThemedText>
              <ThemedText
                type="body"
                style={[
                  styles.duaTransliteration,
                  { color: theme.textSecondary },
                ]}
              >
                {dua.transliteration}
              </ThemedText>
              <ThemedText
                type="body"
                style={[styles.duaMeaning, { fontFamily: Fonts?.serif }]}
              >
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
          accessibilityHint="Returns to home screen"
        >
          {ScreenCopy.complete.returnHome}
        </Button>
      </View>

      {!isPaid ? (
        <Animated.View
          entering={FadeInUp.duration(400).delay(800)}
          style={[
            styles.upgradeCard,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.accent + "20",
            },
          ]}
        >
          <View
            style={[
              styles.upgradeIconContainer,
              { backgroundColor: theme.accent + "20" },
            ]}
          >
            <Feather name="trending-up" size={24} color={theme.accent} />
          </View>
          <ThemedText
            type="bodyLarge"
            style={[styles.upgradeTitle, { fontFamily: Fonts?.serif }]}
          >
            Want to see your patterns?
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.upgradeBody, { color: theme.textSecondary }]}
          >
            Track how your thinking evolves over time with unlimited reflections
            and insights
          </ThemedText>
          <Pressable
            onPress={() => navigation.navigate("Pricing")}
            style={({ pressed }) => [
              styles.upgradeButton,
              {
                backgroundColor: theme.accent,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Upgrade to Noor Plus, $2.99 per month"
            accessibilityHint="Opens pricing options for Noor Plus subscription"
          >
            <ThemedText
              type="body"
              style={{ color: theme.onPrimary, fontWeight: "600" }}
            >
              Upgrade to Noor Plus - $2.99/month
            </ThemedText>
          </Pressable>
          <ThemedText
            type="caption"
            style={[styles.upgradeFootnote, { color: theme.textSecondary }]}
          >
            Lock in beta rate forever • Cancel anytime
          </ThemedText>
        </Animated.View>
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
  celebrationContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
    height: 140, // Extra space for burst effect
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius["3xl"],
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  burstRing: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  burstCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  glowRing: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  glowCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  title: {
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
  },
  affirmation: {
    textAlign: "center",
    marginTop: Spacing.md,
    fontStyle: "italic",
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
    borderWidth: 1,
    alignItems: "center",
  },
  upgradeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
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
