import React, { useState, useLayoutEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Platform,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import Animated, { FadeInUp, FadeIn } from "react-native-reanimated";
import { hapticMedium } from "@/lib/haptics";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts, SiraatColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { ScreenCopy } from "@/constants/brand";
import { ExitConfirmationModal } from "@/components/ExitConfirmationModal";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Intention"
>;
type RouteType = RouteProp<RootStackParamList, "Intention">;

// Niyyah (intention) templates based on emotional states
interface NiyyahTemplate {
  id: string;
  starter: string;
  description: string;
  icon: string;
}

const NIYYAH_TEMPLATES: NiyyahTemplate[] = [
  {
    id: "tawakkul",
    starter: "I intend to trust Allah's plan, even when...",
    description: "Surrender & trust",
    icon: "🤲",
  },
  {
    id: "sabr",
    starter: "I intend to be patient with myself as I...",
    description: "Patience & self-compassion",
    icon: "🌱",
  },
  {
    id: "gratitude",
    starter: "I intend to notice the blessing in...",
    description: "Finding light",
    icon: "✨",
  },
  {
    id: "action",
    starter: "I intend to take one small step toward...",
    description: "Purposeful action",
    icon: "👣",
  },
  {
    id: "release",
    starter: "I intend to release my attachment to...",
    description: "Letting go",
    icon: "🍃",
  },
  {
    id: "connection",
    starter: "I intend to reconnect with my Lord through...",
    description: "Spiritual return",
    icon: "🌙",
  },
];

// Niyyah focus areas
const NIYYAH_PURPOSES = [
  { id: "dunya", label: "This life", description: "Practical change" },
  { id: "akhira", label: "The next life", description: "Spiritual growth" },
  { id: "both", label: "Both", description: "Integrated intention" },
];

// Niyyah sealing affirmations
const SEALING_AFFIRMATIONS = [
  "I make this intention solely for the pleasure of Allah",
  "I commit to this intention with sincerity in my heart",
  "I ask Allah to help me fulfill this intention",
  "I begin this journey with trust in His plan",
];

export default function IntentionScreen() {
  const [intention, setIntention] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedPurpose, setSelectedPurpose] = useState<string>("both");
  const [showBismillah, setShowBismillah] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const {
    thought,
    distortions,
    reframe,
    practice,
    anchor,
    detectedState,
    emotionalIntensity,
  } = route.params;

  // Add cancel button to header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => setShowExitModal(true)}
          style={{ marginRight: Spacing.sm }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Cancel reflection"
          accessibilityHint="Exits the reflection and returns to home screen"
        >
          <ThemedText style={{ color: theme.primary }}>Cancel</ThemedText>
        </Pressable>
      ),
    });
  }, [navigation, theme.primary]);

  const handleExit = () => {
    hapticMedium();
    setShowExitModal(false);
    navigation.navigate("Home");
  };

  const canContinue = intention.trim().length > 3;

  const handleTemplateSelect = (template: NiyyahTemplate) => {
    if (selectedTemplate === template.id) {
      setSelectedTemplate(null);
      setIntention("");
    } else {
      setSelectedTemplate(template.id);
      setIntention(template.starter);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePurposeSelect = (purposeId: string) => {
    setSelectedPurpose(purposeId);
    Haptics.selectionAsync();
  };

  const handleComplete = () => {
    if (canContinue) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Format intention with bismillah if enabled
      const finalIntention = showBismillah
        ? `بسم الله\n\n${intention.trim()}`
        : intention.trim();

      navigation.navigate("SessionComplete", {
        thought,
        distortions,
        reframe,
        intention: finalIntention,
        practice,
        anchor,
        detectedState,
        emotionalIntensity,
      });
    }
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing["3xl"],
        },
      ]}
    >
      {/* Header Section */}
      <Animated.View entering={FadeInUp.duration(400)} style={styles.section}>
        <ThemedText
          type="h3"
          style={[styles.heading, { fontFamily: Fonts?.serif }]}
        >
          {ScreenCopy.intention.title}
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.description, { color: theme.textSecondary }]}
        >
          In Islam, every action begins with intention (niyyah). What will you
          carry forward from this reflection?
        </ThemedText>
      </Animated.View>

      {/* Anchor Card - What you're building on */}
      <Animated.View
        entering={FadeInUp.duration(400).delay(100)}
        style={[
          styles.anchorCard,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        <View
          style={[
            styles.anchorAccent,
            { backgroundColor: SiraatColors.indigo },
          ]}
        />
        <View style={styles.anchorContent}>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {ScreenCopy.intention.anchorLabel}
          </ThemedText>
          <ThemedText
            type="small"
            style={[styles.anchorText, { fontFamily: Fonts?.serif }]}
          >
            {anchor}
          </ThemedText>
        </View>
      </Animated.View>

      {/* Bismillah Toggle */}
      <Animated.View entering={FadeInUp.duration(400).delay(150)}>
        <TouchableOpacity
          onPress={() => {
            setShowBismillah(!showBismillah);
            Haptics.selectionAsync();
          }}
          style={[
            styles.bismillahToggle,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <View style={styles.bismillahContent}>
            <ThemedText type="body" style={styles.bismillahArabic}>
              بسم الله
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Begin with the Name of Allah
            </ThemedText>
          </View>
          <View
            style={[
              styles.toggleIndicator,
              {
                backgroundColor: showBismillah
                  ? SiraatColors.emerald
                  : theme.border,
              },
            ]}
          >
            {showBismillah && (
              <ThemedText type="small" style={{ color: "#FFFFFF" }}>
                ✓
              </ThemedText>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Niyyah Templates */}
      <Animated.View
        entering={FadeInUp.duration(400).delay(200)}
        style={styles.templatesSection}
      >
        <ThemedText
          type="caption"
          style={[styles.sectionLabel, { color: theme.textSecondary }]}
        >
          CHOOSE AN INTENTION SEED
        </ThemedText>

        <View style={styles.templatesGrid}>
          {NIYYAH_TEMPLATES.map((template) => {
            const isSelected = selectedTemplate === template.id;
            return (
              <TouchableOpacity
                key={template.id}
                onPress={() => handleTemplateSelect(template)}
                style={[
                  styles.templateCard,
                  {
                    backgroundColor: isSelected
                      ? SiraatColors.emerald
                      : theme.backgroundDefault,
                    borderColor: isSelected
                      ? SiraatColors.emerald
                      : theme.border,
                  },
                ]}
              >
                <ThemedText type="h3" style={styles.templateIcon}>
                  {template.icon}
                </ThemedText>
                <ThemedText
                  type="small"
                  style={[
                    styles.templateLabel,
                    { color: isSelected ? "#FFFFFF" : theme.text },
                  ]}
                >
                  {template.description}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      {/* Intention Input */}
      <Animated.View
        entering={FadeInUp.duration(400).delay(300)}
        style={styles.inputSection}
      >
        <ThemedText
          type="caption"
          style={[styles.sectionLabel, { color: theme.textSecondary }]}
        >
          YOUR INTENTION
        </ThemedText>
        <TextInput
          value={intention}
          onChangeText={setIntention}
          placeholder={ScreenCopy.intention.placeholder}
          placeholderTextColor={theme.textSecondary}
          multiline
          style={[
            styles.textInput,
            {
              backgroundColor: theme.inputBackground,
              color: theme.text,
              fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
            },
          ]}
          textAlignVertical="top"
        />
      </Animated.View>

      {/* Purpose Selection */}
      <Animated.View
        entering={FadeIn.duration(300).delay(400)}
        style={styles.purposeSection}
      >
        <ThemedText
          type="caption"
          style={[styles.sectionLabel, { color: theme.textSecondary }]}
        >
          THIS INTENTION IS FOR
        </ThemedText>
        <View style={styles.purposeRow}>
          {NIYYAH_PURPOSES.map((purpose) => {
            const isSelected = selectedPurpose === purpose.id;
            return (
              <TouchableOpacity
                key={purpose.id}
                onPress={() => handlePurposeSelect(purpose.id)}
                style={[
                  styles.purposeButton,
                  {
                    backgroundColor: isSelected
                      ? theme.primary
                      : theme.backgroundDefault,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{
                    color: isSelected ? "#FFFFFF" : theme.text,
                    fontWeight: "600",
                  }}
                >
                  {purpose.label}
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={{
                    color: isSelected
                      ? "rgba(255,255,255,0.7)"
                      : theme.textSecondary,
                  }}
                >
                  {purpose.description}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      {/* Prophetic Reminder */}
      <Animated.View
        entering={FadeIn.duration(300).delay(500)}
        style={[
          styles.reminderCard,
          { backgroundColor: SiraatColors.indigoLight },
        ]}
      >
        <ThemedText type="small" style={styles.reminderText}>
          &ldquo;Actions are judged by intentions, and everyone will be rewarded
          according to their intention.&rdquo;
        </ThemedText>
        <ThemedText type="caption" style={styles.reminderSource}>
          — Prophet Muhammad ﷺ (Bukhari & Muslim)
        </ThemedText>
      </Animated.View>

      {/* Niyyah Preview - Shows complete intention before sealing */}
      {canContinue && (
        <Animated.View
          entering={FadeIn.duration(400)}
          style={[
            styles.niyyahPreview,
            {
              backgroundColor: SiraatColors.emerald + "15",
              borderColor: SiraatColors.emerald,
            },
          ]}
        >
          <View style={styles.niyyahPreviewHeader}>
            <ThemedText
              type="small"
              style={{ color: SiraatColors.emerald, fontWeight: "600" }}
            >
              🤲 YOUR SEALED NIYYAH
            </ThemedText>
          </View>
          {showBismillah && (
            <ThemedText type="body" style={styles.previewBismillah}>
              بسم الله
            </ThemedText>
          )}
          <ThemedText
            type="body"
            style={[styles.previewIntention, { fontFamily: Fonts?.serif }]}
          >
            {intention.trim()}
          </ThemedText>
          <View
            style={[
              styles.previewPurpose,
              { backgroundColor: SiraatColors.emerald + "20" },
            ]}
          >
            <ThemedText type="caption" style={{ color: SiraatColors.emerald }}>
              For{" "}
              {NIYYAH_PURPOSES.find(
                (p) => p.id === selectedPurpose,
              )?.label.toLowerCase()}{" "}
              •{" "}
              {
                NIYYAH_PURPOSES.find((p) => p.id === selectedPurpose)
                  ?.description
              }
            </ThemedText>
          </View>
        </Animated.View>
      )}

      {/* Complete Button */}
      <Animated.View
        entering={FadeIn.duration(300).delay(600)}
        style={styles.buttonSection}
      >
        <Button
          onPress={handleComplete}
          disabled={!canContinue}
          style={{
            backgroundColor: canContinue ? theme.primary : theme.border,
          }}
        >
          {ScreenCopy.intention.complete}
        </Button>
      </Animated.View>

      <ExitConfirmationModal
        visible={showExitModal}
        onConfirm={handleExit}
        onCancel={() => setShowExitModal(false)}
      />
    </KeyboardAwareScrollViewCompat>
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
  section: {
    marginBottom: Spacing["2xl"],
  },
  heading: {
    marginBottom: Spacing.md,
  },
  description: {
    lineHeight: 26,
  },
  sectionLabel: {
    marginBottom: Spacing.md,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
  },
  // Anchor Card
  anchorCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    overflow: "hidden",
  },
  anchorAccent: {
    width: 4,
  },
  anchorContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  anchorText: {
    marginTop: Spacing.xs,
    lineHeight: 22,
    fontStyle: "italic",
  },
  // Bismillah Toggle
  bismillahToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  bismillahContent: {
    flex: 1,
  },
  bismillahArabic: {
    fontSize: 20,
    marginBottom: Spacing.xs,
  },
  toggleIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  // Templates
  templatesSection: {
    marginBottom: Spacing.xl,
  },
  templatesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  templateCard: {
    width: "31%",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  templateIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  templateLabel: {
    textAlign: "center",
    fontSize: 11,
  },
  // Input
  inputSection: {
    marginBottom: Spacing.xl,
  },
  textInput: {
    minHeight: 100,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    fontSize: 17,
    lineHeight: 26,
  },
  // Purpose
  purposeSection: {
    marginBottom: Spacing.xl,
  },
  purposeRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  purposeButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  // Reminder Card
  reminderCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  reminderText: {
    color: "#FFFFFF",
    lineHeight: 22,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  reminderSource: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
  // Button
  buttonSection: {
    marginTop: "auto",
    paddingTop: Spacing.lg,
  },
  // Niyyah Preview
  niyyahPreview: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    borderWidth: 2,
    borderStyle: "dashed",
  },
  niyyahPreviewHeader: {
    marginBottom: Spacing.md,
    alignItems: "center",
  },
  previewBismillah: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: Spacing.md,
    color: SiraatColors.emerald,
  },
  previewIntention: {
    lineHeight: 28,
    textAlign: "center",
    marginBottom: Spacing.md,
    fontStyle: "italic",
  },
  previewPurpose: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    alignSelf: "center",
  },
});
