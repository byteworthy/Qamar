import React, { useState } from "react";
import { View, StyleSheet, TextInput, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography, Fonts } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { ScreenCopy } from "@/constants/brand";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "ThoughtCapture">;

export default function ThoughtCaptureScreen() {
  const [thought, setThought] = useState("");
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const canContinue = thought.trim().length > 10;

  const handleContinue = () => {
    if (canContinue) {
      navigation.navigate("Distortion", { thought: thought.trim() });
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
      <View style={styles.introSection}>
        <ThemedText type="h3" style={[styles.heading, { fontFamily: Fonts?.serif }]}>
          {ScreenCopy.thoughtCapture.title}
        </ThemedText>
        <ThemedText type="body" style={[styles.description, { color: theme.textSecondary, lineHeight: 26 }]}>
          {ScreenCopy.thoughtCapture.subtitle}
        </ThemedText>
      </View>

      <View style={styles.inputSection}>
        <TextInput
          value={thought}
          onChangeText={setThought}
          placeholder={ScreenCopy.thoughtCapture.placeholder}
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
        <ThemedText type="caption" style={[styles.hint, { color: theme.textSecondary }]}>
          {thought.length > 0 ? `${thought.length} characters` : ScreenCopy.thoughtCapture.hint}
        </ThemedText>
      </View>

      <View style={styles.buttonSection}>
        <Button
          onPress={handleContinue}
          disabled={!canContinue}
          style={{ backgroundColor: canContinue ? theme.primary : theme.border }}
        >
          {ScreenCopy.thoughtCapture.continue}
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
  introSection: {
    marginBottom: Spacing["3xl"],
  },
  heading: {
    marginBottom: Spacing.lg,
  },
  description: {
    lineHeight: 26,
  },
  inputSection: {
    flex: 1,
    marginBottom: Spacing.xl,
  },
  textInput: {
    flex: 1,
    minHeight: 200,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    fontSize: Typography.bodyLarge.fontSize,
    lineHeight: 28,
  },
  hint: {
    marginTop: Spacing.sm,
    textAlign: "right",
  },
  buttonSection: {
    paddingTop: Spacing.lg,
  },
});
