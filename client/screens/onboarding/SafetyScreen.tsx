import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { NiyyahColors } from "@/constants/theme";
import { setOnboardingCompleted } from "@/lib/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SafetyScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const handleGetStarted = async () => {
    await setOnboardingCompleted();
    // Navigate to Main which is the TabNavigator containing Home
    navigation.reset({
      index: 0,
      routes: [{ name: "Main" }],
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.header}
        >
          <View style={styles.iconContainer}>
            <Feather name="book-open" size={48} color={NiyyahColors.accent} />
          </View>
          <ThemedText style={styles.title}>Before You Begin</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Please read this carefully
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(400).delay(100)}
          style={styles.content}
        >
          <View
            style={[styles.card, { backgroundColor: theme.cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <Feather name="compass" size={20} color={NiyyahColors.accent} />
              <ThemedText style={styles.cardTitle}>
                Theological Boundaries
              </ThemedText>
            </View>
            <View style={styles.cardContent}>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • This app uses Islamic concepts as anchors for reflection
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • It does not provide religious rulings or scholarly guidance
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • AI can make theological mistakes—verify with scholars
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • For religious questions, consult qualified Islamic scholars
              </ThemedText>
            </View>
          </View>

          <View
            style={[styles.card, { backgroundColor: theme.cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <Feather
                name="alert-circle"
                size={20}
                color={theme.textSecondary}
              />
              <ThemedText style={styles.cardTitle}>What This Is Not</ThemedText>
            </View>
            <View style={styles.cardContent}>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • Not therapy
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • Not medical care
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • Not diagnosis
              </ThemedText>
            </View>
          </View>

          <View
            style={[
              styles.readyCard,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <Feather
              name="check-circle"
              size={32}
              color={NiyyahColors.accent}
            />
            <ThemedText style={[styles.readyTitle, { color: theme.text }]}>
              Ready to Begin?
            </ThemedText>
            <ThemedText
              style={[styles.readyText, { color: theme.textSecondary }]}
            >
              This is an AI companion for structured reflection. Use your own
              discernment and consult professionals when needed.
            </ThemedText>
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View
        entering={FadeInUp.duration(400).delay(200)}
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 20,
            backgroundColor: theme.backgroundRoot,
          },
        ]}
      >
        <View style={styles.buttonRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor: theme.backgroundDefault,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Feather name="arrow-left" size={20} color={theme.text} />
            <ThemedText style={styles.backButtonText}>Back</ThemedText>
          </Pressable>

          <Pressable
            onPress={handleGetStarted}
            style={({ pressed }) => [
              styles.getStartedButton,
              {
                backgroundColor: NiyyahColors.accent,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <ThemedText style={styles.getStartedButtonText}>
              Get Started
            </ThemedText>
            <Feather name="check" size={20} color={NiyyahColors.background} />
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: NiyyahColors.accent + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  content: {
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  cardContent: {
    gap: 12,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 22,
  },
  readyCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  readyTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  readyText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  backButtonText: {
    fontSize: 17,
    fontWeight: "600",
  },
  getStartedButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  getStartedButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: NiyyahColors.background,
  },
});
