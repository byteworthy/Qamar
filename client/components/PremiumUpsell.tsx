/**
 * Premium Upsell Component
 *
 * Shows an attractive upgrade prompt when users encounter locked features.
 * Displays feature benefits and upgrade CTA.
 */

import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { PremiumFeature } from "@/lib/premium-features";
import { logPaywallDismissed } from "@/lib/analytics";
import { GlassCard } from "./GlassCard";
import { Button } from "./Button";

interface PremiumUpsellProps {
  /**
   * The feature that is locked
   */
  feature: PremiumFeature;

  /**
   * Required subscription tier (plus/pro)
   */
  requiredTier: "plus" | "pro" | null;

  /**
   * Callback when user taps upgrade button
   */
  onUpgrade: () => void;

  /**
   * Callback when user dismisses the upsell
   */
  onDismiss?: () => void;
}

/**
 * Feature benefit descriptions for the paywall
 */
const FEATURE_BENEFITS: Record<PremiumFeature, {
  title: string;
  description: string;
  benefits: string[];
}> = {
  // Quran features
  [PremiumFeature.QURAN_OFFLINE]: {
    title: "Offline Quran Access",
    description: "Read the Quran anytime, anywhere - even without internet.",
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
    benefits: [
      "No daily review limits",
      "Accelerate your learning",
      "Custom study schedules",
      "Optimized spaced repetition",
    ],
  },
  [PremiumFeature.ARABIC_PRONUNCIATION]: {
    title: "AI Pronunciation Feedback",
    description: "Perfect your Arabic pronunciation with AI coaching.",
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
    benefits: [
      "Complete prayer history",
      "Streak tracking and goals",
      "Monthly insights and reports",
      "Motivational reminders",
    ],
  },

  // CBT features
  [PremiumFeature.CBT_EXERCISES]: {
    title: "CBT Therapy Tools",
    description: "Access professional cognitive behavioral therapy exercises.",
    benefits: [
      "Evidence-based CBT techniques",
      "Guided thought records",
      "Mood tracking",
      "Therapeutic exercises",
    ],
  },
  [PremiumFeature.CBT_ADVANCED]: {
    title: "Advanced CBT Analytics",
    description: "Deep insights into your mental health journey.",
    benefits: [
      "Detailed progress analytics",
      "Pattern recognition",
      "Personalized recommendations",
      "Export therapy notes",
    ],
  },
};

/**
 * Premium Upsell Component
 *
 * Shows a beautiful paywall with feature benefits.
 */
export function PremiumUpsell({
  feature,
  requiredTier,
  onUpgrade,
  onDismiss,
}: PremiumUpsellProps): React.JSX.Element {
  const benefit = FEATURE_BENEFITS[feature];

  const handleDismiss = () => {
    logPaywallDismissed(feature);
    onDismiss?.();
  };

  return (
    <View style={styles.container}>
      <GlassCard style={styles.card}>
        {/* Dismiss button */}
        {onDismiss && (
          <Pressable onPress={handleDismiss} style={styles.dismissButton}>
            <Text style={styles.dismissText}>✕</Text>
          </Pressable>
        )}

        {/* Premium badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {requiredTier === "pro" ? "PRO" : "PLUS"}
          </Text>
        </View>

        {/* Feature title */}
        <Text style={styles.title}>{benefit.title}</Text>

        {/* Description */}
        <Text style={styles.description}>{benefit.description}</Text>

        {/* Benefits list */}
        <View style={styles.benefitsList}>
          {benefit.benefits.map((item, index) => (
            <View key={index} style={styles.benefitItem}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.benefitText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Upgrade button */}
        <Button
          onPress={onUpgrade}
          style={styles.upgradeButton}
        >
          Upgrade to {requiredTier === "pro" ? "Pro" : "Plus"}
        </Button>

        {/* Secondary info */}
        <Text style={styles.footer}>
          Cancel anytime • 7-day free trial
        </Text>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  card: {
    padding: 24,
    width: "100%",
    maxWidth: 400,
    position: "relative",
  },
  dismissButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  dismissText: {
    fontSize: 24,
    color: "#666",
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFD700",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 24,
    lineHeight: 22,
  },
  benefitsList: {
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  checkmark: {
    fontSize: 18,
    color: "#4CAF50",
    marginRight: 12,
    marginTop: 2,
  },
  benefitText: {
    fontSize: 14,
    color: "#fff",
    flex: 1,
    lineHeight: 20,
  },
  upgradeButton: {
    marginBottom: 16,
  },
  footer: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});
