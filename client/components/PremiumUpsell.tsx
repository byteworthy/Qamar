/**
 * Premium Upsell Component
 *
 * Shows an attractive upgrade prompt when users encounter locked features.
 * Displays feature benefits and upgrade CTA with themed styling.
 */

import React, { useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { PremiumFeature } from "@/lib/premium-features";
import { logPaywallDismissed } from "@/lib/analytics";
import { useOfferings, usePurchase, useRestorePurchases } from "@/hooks/useRevenueCat";
import { useTheme } from "@/hooks/useTheme";
import { useColorScheme } from "@/hooks/useColorScheme";
import { VALIDATION_MODE } from "@/lib/config";
import { GlassCard } from "./GlassCard";
import { Button } from "./Button";
import {
  NoorColors,
  Fonts,
  Spacing,
  BorderRadius,
  Gradients,
} from "@/constants/theme";

const GOLD = NoorColors.gold;
const GOLD_LIGHT = NoorColors.goldLight;

interface PremiumUpsellProps {
  /** The feature that is locked */
  feature: PremiumFeature;
  /** Required subscription tier (plus/pro) */
  requiredTier: "plus" | "pro" | null;
  /** Callback when user taps upgrade button */
  onUpgrade: () => void;
  /** Callback when user dismisses the upsell */
  onDismiss?: () => void;
}

/**
 * Feature benefit descriptions for the paywall
 */
const FEATURE_BENEFITS: Record<PremiumFeature, {
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  benefits: string[];
}> = {
  // Quran features
  [PremiumFeature.QURAN_OFFLINE]: {
    title: "Offline Quran Access",
    description: "Read the Quran anytime, anywhere -- even without internet.",
    icon: "download-cloud",
    benefits: [
      "Download all 114 surahs",
      "Access translations offline",
      "Perfect for travel and commute",
      "No data usage",
    ],
  },
  [PremiumFeature.QURAN_ALL_TRANSLATIONS]: {
    title: "All Quran Translations",
    description: "Understand the Quran in your preferred language.",
    icon: "globe",
    benefits: [
      "20+ translations in multiple languages",
      "Compare translations side-by-side",
      "Includes Tafsir (commentary)",
      "Regular updates with new translations",
    ],
  },
  [PremiumFeature.QURAN_AUDIO]: {
    title: "Quran Audio Recitations",
    description: "Listen to beautiful recitations by renowned Qaris.",
    icon: "headphones",
    benefits: [
      "10+ famous reciters",
      "High-quality audio",
      "Verse-by-verse playback",
      "Background playback support",
    ],
  },
  [PremiumFeature.QURAN_ADVANCED_SEARCH]: {
    title: "Advanced Quran Search",
    description: "Find verses quickly with powerful search filters.",
    icon: "search",
    benefits: [
      "Search by keyword, topic, or theme",
      "Filter by surah or juz",
      "Save favorite searches",
      "Intelligent suggestions",
    ],
  },

  // Arabic learning features
  [PremiumFeature.ARABIC_ALL_SCENARIOS]: {
    title: "All Conversation Scenarios",
    description: "Master everyday Arabic conversations.",
    icon: "message-circle",
    benefits: [
      "50+ real-world scenarios",
      "From greetings to complex discussions",
      "Cultural context included",
      "Regular new scenarios added",
    ],
  },
  [PremiumFeature.ARABIC_UNLIMITED_REVIEWS]: {
    title: "Unlimited Flashcard Reviews",
    description: "Practice as much as you want, whenever you want.",
    icon: "layers",
    benefits: [
      "No daily review limits",
      "Accelerate your learning",
      "Custom study schedules",
      "Optimized spaced repetition",
    ],
  },
  [PremiumFeature.ARABIC_PRONUNCIATION]: {
    title: "Pronunciation Feedback",
    description: "Perfect your Arabic pronunciation with expert coaching.",
    icon: "mic",
    benefits: [
      "Real-time pronunciation analysis",
      "Detailed feedback and tips",
      "Compare with native speakers",
      "Track improvement over time",
    ],
  },
  [PremiumFeature.ARABIC_CUSTOM_LISTS]: {
    title: "Custom Vocabulary Lists",
    description: "Create personalized word lists for focused learning.",
    icon: "list",
    benefits: [
      "Unlimited custom lists",
      "Import/export word lists",
      "Track progress per list",
      "Share lists with friends",
    ],
  },

  // Prayer features
  [PremiumFeature.PRAYER_CUSTOM_ADHAN]: {
    title: "Custom Adhan Sounds",
    description: "Wake up to your favorite call to prayer.",
    icon: "volume-2",
    benefits: [
      "20+ beautiful adhan options",
      "Reciters from Mecca and Medina",
      "Volume and fade controls",
      "Custom adhan for each prayer",
    ],
  },
  [PremiumFeature.PRAYER_WIDGET]: {
    title: "Prayer Times Widget",
    description: "See prayer times at a glance on your home screen.",
    icon: "clock",
    benefits: [
      "Beautiful home screen widget",
      "Next prayer countdown",
      "Customizable design",
      "Auto-updates with location",
    ],
  },
  [PremiumFeature.PRAYER_QIBLA]: {
    title: "Qibla Direction Finder",
    description: "Never miss the direction of prayer.",
    icon: "compass",
    benefits: [
      "Accurate compass-based Qibla",
      "Works anywhere in the world",
      "AR view for precise alignment",
      "Distance to Kaaba displayed",
    ],
  },
  [PremiumFeature.PRAYER_HISTORY]: {
    title: "Prayer History & Streaks",
    description: "Track your prayer consistency and build habits.",
    icon: "bar-chart-2",
    benefits: [
      "Complete prayer history",
      "Streak tracking and goals",
      "Monthly insights and reports",
      "Motivational reminders",
    ],
  },

  // Reflection features
  [PremiumFeature.REFLECTION_EXERCISES]: {
    title: "Islamic Reflection Tools",
    description: "Access guided reflection and spiritual growth exercises.",
    icon: "heart",
    benefits: [
      "Evidence-based reflection techniques",
      "Guided thought records",
      "Mood tracking",
      "Guided exercises",
    ],
  },
  [PremiumFeature.REFLECTION_ADVANCED]: {
    title: "Advanced Reflection Analytics",
    description: "Deep insights into your personal growth journey.",
    icon: "trending-up",
    benefits: [
      "Detailed progress analytics",
      "Pattern recognition",
      "Personalized recommendations",
      "Export reflection notes",
    ],
  },
  [PremiumFeature.AI_TUTOR_UNLIMITED]: {
    title: "Unlimited Arabic Tutor",
    description: "Get unlimited Arabic language lessons from your personal tutor.",
    icon: "message-square",
    benefits: [
      "Unlimited tutor conversations",
      "4 learning modes",
      "Personalized feedback",
      "Quran word analysis",
    ],
  },
  [PremiumFeature.AI_TRANSLATION_EXPLAIN]: {
    title: "Translation Explanations",
    description: "Get unlimited word and phrase breakdowns.",
    icon: "globe",
    benefits: [
      "Root word analysis",
      "Morphology breakdowns",
      "Usage examples",
      "Unlimited explanations",
    ],
  },
  [PremiumFeature.HIFZ_UNLIMITED]: {
    title: "Unlimited Hifz Reviews",
    description: "Memorize the Quran at your own pace with unlimited daily reviews.",
    icon: "book",
    benefits: [
      "Review 50+ verses per day",
      "No daily review limits",
      "Flexible scheduling",
      "Progress at your own speed",
    ],
  },
  [PremiumFeature.HIFZ_AI_ANALYSIS]: {
    title: "AI Tajweed Coaching",
    description: "Get advanced pronunciation feedback with AI-powered Tajweed analysis.",
    icon: "mic",
    benefits: [
      "Advanced Tajweed feedback",
      "Rule-specific correction tips",
      "Pronunciation scoring",
      "Unlimited AI analysis",
    ],
  },
  [PremiumFeature.HIFZ_CIRCLES]: {
    title: "Memorization Circles",
    description: "Join group memorization circles and share progress with others.",
    icon: "users",
    benefits: [
      "Create or join circles",
      "Shared progress tracking",
      "Group motivation",
      "Accountability partners",
    ],
  },

  // Phase 6B: Tafsir & Verse Discussion
  [PremiumFeature.TAFSIR_UNLIMITED]: {
    title: "Unlimited AI Tafsir",
    description: "Get unlimited access to AI-powered Tafsir explanations with classical sources.",
    icon: "book-open",
    benefits: [
      "Unlimited verse explanations",
      "Classical scholar citations",
      "Context and key terms",
      "Cross-reference connections",
    ],
  },
  [PremiumFeature.VERSE_DISCUSSION_UNLIMITED]: {
    title: "Unlimited Verse Discussions",
    description: "Have unlimited conversations with AI about any Quranic verse.",
    icon: "message-square",
    benefits: [
      "Unlimited verse Q&A",
      "Multi-turn discussions",
      "Persistent chat history",
      "Deep understanding",
    ],
  },

  // Phase 6C: Dua Recommender
  [PremiumFeature.DUA_UNLIMITED]: {
    title: "Unlimited Dua Recommendations",
    description: "Get unlimited AI-powered dua recommendations for any situation.",
    icon: "compass",
    benefits: [
      "Unlimited dua searches",
      "Authentic Quran and Hadith sources",
      "Context-aware recommendations",
      "Save unlimited favorites",
    ],
  },

  // Phase 6D: Study Plan
  [PremiumFeature.STUDY_PLAN_REGENERATE]: {
    title: "Regenerate Study Plans",
    description: "Regenerate your weekly study plan as many times as needed.",
    icon: "refresh-cw",
    benefits: [
      "Unlimited plan regeneration",
      "Adjust to your schedule",
      "Try different approaches",
      "Optimize for your pace",
    ],
  },
  [PremiumFeature.STUDY_PLAN_ADAPT]: {
    title: "Adaptive Study Plans",
    description: "Let AI adapt your study plan based on your progress and performance.",
    icon: "trending-up",
    benefits: [
      "AI-powered adaptation",
      "Progress-based adjustments",
      "Difficulty optimization",
      "Personalized pacing",
    ],
  },
  [PremiumFeature.STUDY_PLAN_MULTIPLE]: {
    title: "Multiple Study Plans",
    description: "Run multiple concurrent study plans for different goals.",
    icon: "layers",
    benefits: [
      "Up to 3 concurrent plans",
      "Different goals per plan",
      "Track multiple objectives",
      "Comprehensive learning",
    ],
  },
};

/**
 * Premium Upsell Component
 *
 * Shows a themed paywall with feature benefits, gold accents, and animated entrance.
 */
export function PremiumUpsell({
  feature,
  requiredTier,
  onUpgrade,
  onDismiss,
}: PremiumUpsellProps): React.JSX.Element {
  const { theme } = useTheme();
  const colorScheme = useColorScheme() ?? "dark";
  const benefit = FEATURE_BENEFITS[feature];
  const { offerings, isLoading: offeringsLoading } = useOfferings();
  const { purchase, isLoading: purchaseLoading } = usePurchase();
  const { restore, isLoading: restoreLoading } = useRestorePurchases();

  const isLoading = purchaseLoading || restoreLoading;

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Resolve the correct package from offerings
  const targetPackage = useMemo(() => {
    if (!offerings?.current) return null;
    const packages = offerings.current.availablePackages;
    const tierKey = requiredTier === "pro" ? "$rc_annual" : "$rc_monthly";
    return (
      packages.find((p) => p.identifier === tierKey) ||
      packages.find((p) =>
        p.identifier.toLowerCase().includes(requiredTier || "plus"),
      ) ||
      packages[0] ||
      null
    );
  }, [offerings, requiredTier]);

  const priceLabel = targetPackage?.product?.priceString;

  const handleDismiss = () => {
    logPaywallDismissed(feature);
    onDismiss?.();
  };

  const handleUpgrade = async () => {
    if (VALIDATION_MODE) {
      Alert.alert("Coming Soon", "Subscriptions are not yet available.");
      return;
    }

    if (!targetPackage) {
      Alert.alert("Unavailable", "Unable to load subscription options. Please try again later.");
      return;
    }

    const result = await purchase(targetPackage);
    if (result.success) {
      onUpgrade();
    } else if (result.error) {
      Alert.alert("Purchase Error", result.error);
    }
  };

  const handleRestore = async () => {
    const result = await restore();
    if (result.success) {
      Alert.alert("Restored", "Your subscription has been restored.");
      onUpgrade();
    } else {
      Alert.alert(
        "No Subscription Found",
        "We couldn't find an active subscription for this account.",
      );
    }
  };

  const gradientColors =
    colorScheme === "dark"
      ? Gradients.dark.buttonGradient.colors
      : Gradients.light.buttonGradient.colors;

  const tierLabel = requiredTier === "pro" ? "Pro" : "Plus";

  return (
    <View style={[styles.container, { backgroundColor: "rgba(0, 0, 0, 0.6)" }]}>
      <Animated.View
        style={{
          width: "100%",
          maxWidth: 400,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <GlassCard style={styles.card}>
          {/* Dismiss button */}
          {onDismiss && (
            <Pressable
              onPress={handleDismiss}
              style={styles.dismissButton}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Feather name="x" size={20} color={theme.textSecondary} />
            </Pressable>
          )}

          {/* Premium badge */}
          <LinearGradient
            colors={[...gradientColors]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.badge}
          >
            <Text style={styles.badgeText}>{tierLabel.toUpperCase()}</Text>
          </LinearGradient>

          {/* Feature icon */}
          <View style={[styles.featureIcon, { backgroundColor: GOLD + "15" }]}>
            <Feather name={benefit.icon} size={24} color={GOLD} />
          </View>

          {/* Feature title */}
          <Text
            style={[
              styles.title,
              { color: theme.text, fontFamily: Fonts?.serifBold },
            ]}
          >
            {benefit.title}
          </Text>

          {/* Description */}
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {benefit.description}
          </Text>

          {/* Benefits list */}
          <View style={styles.benefitsList}>
            {benefit.benefits.map((item, index) => (
              <View key={index} style={styles.benefitItem}>
                <Feather name="check" size={14} color={GOLD} style={{ marginTop: 3 }} />
                <Text style={[styles.benefitText, { color: theme.text }]}>
                  {item}
                </Text>
              </View>
            ))}
          </View>

          {/* Upgrade button */}
          <Pressable
            onPress={handleUpgrade}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.upgradeButtonOuter,
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <LinearGradient
              colors={[...gradientColors]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upgradeButton}
            >
              {isLoading ? (
                <ActivityIndicator color="#1a1a2e" size="small" />
              ) : (
                <Text
                  style={[
                    styles.upgradeButtonText,
                    { fontFamily: Fonts?.sansBold },
                  ]}
                >
                  {offeringsLoading
                    ? "Loading..."
                    : priceLabel
                      ? `Upgrade to ${tierLabel} -- ${priceLabel}`
                      : `Upgrade to ${tierLabel}`}
                </Text>
              )}
            </LinearGradient>
          </Pressable>

          {/* Restore link */}
          <Pressable onPress={handleRestore} disabled={isLoading}>
            <Text style={[styles.restoreText, { color: theme.textSecondary }]}>
              Restore Purchases
            </Text>
          </Pressable>

          {/* Footer */}
          <Text style={[styles.footer, { color: theme.textSecondary + "80" }]}>
            Cancel anytime  |  7-day free trial
          </Text>
        </GlassCard>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  card: {
    padding: Spacing["2xl"],
    width: "100%",
    position: "relative",
  },
  dismissButton: {
    position: "absolute",
    top: Spacing.lg,
    right: Spacing.lg,
    zIndex: 10,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1a1a2e",
    letterSpacing: 1.5,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 22,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: 15,
    marginBottom: Spacing["2xl"],
    lineHeight: 22,
  },
  benefitsList: {
    marginBottom: Spacing["2xl"],
    gap: Spacing.md,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  benefitText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  upgradeButtonOuter: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  upgradeButton: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.lg,
  },
  upgradeButtonText: {
    color: "#1a1a2e",
    fontSize: 15,
    letterSpacing: 0.3,
  },
  restoreText: {
    fontSize: 13,
    textAlign: "center",
    textDecorationLine: "underline",
    marginBottom: Spacing.md,
  },
  footer: {
    fontSize: 12,
    textAlign: "center",
  },
});
