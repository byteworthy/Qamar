import React, { useState } from "react";
import { View, StyleSheet, TextInput, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts, SiraatColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { ScreenCopy } from "@/constants/brand";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Intention">;
type RouteType = RouteProp<RootStackParamList, "Intention">;

export default function IntentionScreen() {
  const [intention, setIntention] = useState("");
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { thought, distortions, reframe, practice, anchor, detectedState } = route.params;

  const canContinue = intention.trim().length > 3;

  const handleComplete = () => {
    if (canContinue) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate("SessionComplete", { 
        thought, 
        distortions, 
        reframe, 
        intention: intention.trim(),
        practice,
        anchor,
        detectedState,
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
      <View style={styles.section}>
        <ThemedText type="h3" style={[styles.heading, { fontFamily: Fonts?.serif }]}>
          {ScreenCopy.intention.title}
        </ThemedText>
        <ThemedText type="body" style={[styles.description, { color: theme.textSecondary }]}>
          {ScreenCopy.intention.subtitle}
        </ThemedText>
      </View>

      <View style={[styles.anchorCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={[styles.anchorAccent, { backgroundColor: SiraatColors.indigo }]} />
        <View style={styles.anchorContent}>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {ScreenCopy.intention.anchorLabel}
          </ThemedText>
          <ThemedText type="small" style={[styles.anchorText, { fontFamily: Fonts?.serif }]}>
            {anchor}
          </ThemedText>
        </View>
      </View>

      <View style={styles.inputSection}>
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
      </View>

      <View style={styles.buttonSection}>
        <Button
          onPress={handleComplete}
          disabled={!canContinue}
          style={{ backgroundColor: canContinue ? theme.primary : theme.border }}
        >
          {ScreenCopy.intention.complete}
        </Button>
      </View>
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
  anchorCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    marginBottom: Spacing["2xl"],
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
  inputSection: {
    flex: 1,
    marginBottom: Spacing.xl,
  },
  textInput: {
    minHeight: 120,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    fontSize: 17,
    lineHeight: 26,
  },
  buttonSection: {
    marginTop: "auto",
    paddingTop: Spacing.lg,
  },
});
