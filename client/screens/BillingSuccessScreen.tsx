import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/hooks/useTheme";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import {
  Spacing,
  QamarColors,
  Fonts,
  BorderRadius,
  Gradients,
} from "@/constants/theme";
import { syncBillingStatus, isPaidStatus } from "@/lib/billing";
import { useQueryClient } from "@tanstack/react-query";

const GOLD = QamarColors.gold;

const UNLOCKED_FEATURES = [
  { icon: "message-circle" as const, label: "Unlimited conversations" },
  { icon: "headphones" as const, label: "Full Quran audio recitations" },
  { icon: "globe" as const, label: "All Arabic learning scenarios" },
  { icon: "book-open" as const, label: "Hadith library access" },
  { icon: "bar-chart-2" as const, label: "Pattern insights & analytics" },
  { icon: "download" as const, label: "Export reflections" },
];

export default function BillingSuccessScreen() {
  const { theme } = useTheme();
  const colorScheme = useColorScheme() ?? "dark";
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animations
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkRotate = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.5)).current;
  const ringOpacity = useRef(new Animated.Value(0.8)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(30)).current;
  const featureAnims = useRef(
    UNLOCKED_FEATURES.map(() => new Animated.Value(0)),
  ).current;
  const buttonFade = useRef(new Animated.Value(0)).current;

  const runSuccessAnimation = () => {
    // Starburst ring
    Animated.parallel([
      Animated.timing(ringScale, {
        toValue: 2.2,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(ringOpacity, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // Check icon bounce
    Animated.spring(checkScale, {
      toValue: 1,
      friction: 4,
      tension: 80,
      useNativeDriver: true,
    }).start();

    // Subtle rotation
    Animated.timing(checkRotate, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    }).start();

    // Title
    Animated.parallel([
      Animated.timing(titleFade, {
        toValue: 1,
        duration: 400,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(titleSlide, {
        toValue: 0,
        duration: 400,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Feature items stagger
    featureAnims.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: 500 + i * 80,
        useNativeDriver: true,
      }).start();
    });

    // Button
    Animated.timing(buttonFade, {
      toValue: 1,
      duration: 400,
      delay: 500 + UNLOCKED_FEATURES.length * 80 + 100,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    const sync = async () => {
      try {
        const result = await syncBillingStatus();
        if (isPaidStatus(result.status)) {
          setSuccess(true);
          queryClient.invalidateQueries({ queryKey: ["/api/billing/status"] });
          queryClient.invalidateQueries({
            queryKey: ["/api/reflection/can-reflect"],
          });
          // Trigger success animation after state update
          setTimeout(runSuccessAnimation, 50);
        } else {
          setError(
            "Your subscription is still processing. This can take a minute -- please wait and try again.",
          );
        }
      } catch (err) {
        setError(
          "We couldn't verify your subscription. Check your connection and try again.",
        );
      } finally {
        setSyncing(false);
      }
    };

    sync();
  }, [queryClient]);

  const handleContinue = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }],
      }),
    );
  };

  const handleRetry = async () => {
    setSyncing(true);
    setError(null);
    try {
      const result = await syncBillingStatus();
      if (isPaidStatus(result.status)) {
        setSuccess(true);
        queryClient.invalidateQueries({ queryKey: ["/api/billing/status"] });
        queryClient.invalidateQueries({
          queryKey: ["/api/reflection/can-reflect"],
        });
        setTimeout(runSuccessAnimation, 50);
      } else {
        setError(
          "Your subscription is still being processed. Please try again in a moment.",
        );
      }
    } catch (err) {
      setError(
        "We couldn't verify your subscription. Check your connection and try again.",
      );
    } finally {
      setSyncing(false);
    }
  };

  const gradientColors =
    colorScheme === "dark"
      ? Gradients.dark.buttonGradient.colors
      : Gradients.light.buttonGradient.colors;

  const rotateInterpolation = checkRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-15deg", "0deg"],
  });

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: insets.top + Spacing["4xl"],
          paddingBottom: insets.bottom + Spacing["4xl"],
        },
      ]}
    >
      {syncing ? (
        <View style={styles.content}>
          <View style={[styles.loadingCircle, { borderColor: GOLD + "30" }]}>
            <ActivityIndicator size="large" color={GOLD} />
          </View>
          <ThemedText
            type="body"
            style={[styles.message, { color: theme.textSecondary }]}
          >
            Verifying your subscription...
          </ThemedText>
        </View>
      ) : success ? (
        <View style={styles.content}>
          {/* Animated ring burst */}
          <View style={styles.iconArea}>
            <Animated.View
              style={[
                styles.burstRing,
                {
                  borderColor: GOLD + "40",
                  transform: [{ scale: ringScale }],
                  opacity: ringOpacity,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.checkCircle,
                {
                  backgroundColor: GOLD,
                  transform: [
                    { scale: checkScale },
                    { rotate: rotateInterpolation },
                  ],
                },
              ]}
            >
              <Feather name="check" size={48} color="#1a1a2e" />
            </Animated.View>
          </View>

          {/* Title */}
          <Animated.View
            style={{
              opacity: titleFade,
              transform: [{ translateY: titleSlide }],
            }}
          >
            <ThemedText
              type="h2"
              style={[
                styles.title,
                { fontFamily: Fonts?.serifBold, color: theme.text },
              ]}
            >
              Welcome to Qamar Plus!
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.subtitle, { color: theme.textSecondary }]}
            >
              Your spiritual journey just expanded. Here{"'"}s what you{"'"}ve
              unlocked:
            </ThemedText>
          </Animated.View>

          {/* Unlocked features */}
          <View style={styles.featuresList}>
            {UNLOCKED_FEATURES.map((feat, i) => (
              <Animated.View
                key={feat.label}
                style={[
                  styles.featureItem,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                    opacity: featureAnims[i],
                    transform: [
                      {
                        translateX: featureAnims[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: [-20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View
                  style={[
                    styles.featureIconCircle,
                    { backgroundColor: GOLD + "15" },
                  ]}
                >
                  <Feather name={feat.icon} size={16} color={GOLD} />
                </View>
                <ThemedText
                  style={[styles.featureLabel, { color: theme.text }]}
                >
                  {feat.label}
                </ThemedText>
              </Animated.View>
            ))}
          </View>

          {/* CTA button */}
          <Animated.View
            style={[styles.buttonContainer, { opacity: buttonFade }]}
          >
            <LinearGradient
              colors={[...gradientColors]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Button
                onPress={handleContinue}
                variant="primary"
                style={styles.ctaButton}
                accessibilityHint="Returns to home screen to start using Qamar Plus features"
              >
                Start Exploring
              </Button>
            </LinearGradient>
          </Animated.View>
        </View>
      ) : (
        <View style={styles.content}>
          <View
            style={[
              styles.checkCircleStatic,
              { backgroundColor: theme.warning },
            ]}
          >
            <Feather name="clock" size={48} color="#fff" />
          </View>
          <ThemedText
            type="h2"
            style={[styles.title, { fontFamily: Fonts?.serifBold }]}
          >
            Almost There
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.message, { color: theme.textSecondary }]}
          >
            {error}
          </ThemedText>
          <View style={styles.buttonContainer}>
            <Button
              onPress={handleRetry}
              variant="primary"
              accessibilityHint="Attempts to verify your subscription again"
            >
              Try Again
            </Button>
            <View style={styles.buttonSpacer} />
            <Button
              onPress={handleContinue}
              variant="secondary"
              accessibilityHint="Returns to home screen"
            >
              Continue to Home
            </Button>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  content: {
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
  },

  // Loading state
  loadingCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },

  // Success state
  iconArea: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["2xl"],
  },
  burstRing: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  checkCircleStatic: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },

  // Text
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
    fontSize: 26,
    lineHeight: 34,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing["2xl"],
  },
  message: {
    textAlign: "center",
    marginTop: Spacing.lg,
    lineHeight: 24,
  },

  // Features list
  featuresList: {
    width: "100%",
    gap: Spacing.sm,
    marginBottom: Spacing["3xl"],
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  featureIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  featureLabel: {
    fontSize: 14,
    flex: 1,
  },

  // Buttons
  buttonContainer: {
    width: "100%",
  },
  ctaGradient: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  ctaButton: {
    backgroundColor: "transparent",
  },
  buttonSpacer: {
    height: Spacing.md,
  },
});
