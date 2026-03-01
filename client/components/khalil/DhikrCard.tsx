import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { NoorColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import type { KhalilDhikrBlock } from "@/lib/khalil-api";

interface Props {
  data: KhalilDhikrBlock;
}

export function DhikrCard({ data }: Props) {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInUp.duration(300)}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.glassSurface,
            borderColor: NoorColors.twilightLight + "30",
          },
        ]}
        accessibilityLabel={`Dhikr practice: ${data.title}`}
      >
        <View style={styles.header}>
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: NoorColors.twilightLight + "18" },
            ]}
          >
            <Feather name="heart" size={16} color={NoorColors.twilightLight} />
          </View>
          <View style={styles.headerText}>
            <ThemedText style={[styles.title, { color: theme.text }]}>
              {data.title}
            </ThemedText>
            <ThemedText
              style={[styles.duration, { color: theme.textSecondary }]}
            >
              {data.duration}
            </ThemedText>
          </View>
        </View>

        <View style={styles.stepsList}>
          {data.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View
                style={[
                  styles.stepNumber,
                  { backgroundColor: NoorColors.twilightLight + "18" },
                ]}
              >
                <ThemedText
                  style={[
                    styles.stepNumberText,
                    { color: NoorColors.twilightLight },
                  ]}
                >
                  {i + 1}
                </ThemedText>
              </View>
              <ThemedText style={[styles.stepText, { color: theme.text }]}>
                {step}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginVertical: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
  },
  duration: {
    fontSize: 12,
    marginTop: 2,
  },
  stepsList: {
    gap: 10,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: "700",
  },
  stepText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});
