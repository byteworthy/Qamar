import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { QamarColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import type { KhalilMuhasabaBlock } from "@/lib/khalil-api";

interface Props {
  data: KhalilMuhasabaBlock;
}

export function MuhasabaCard({ data }: Props) {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInUp.duration(350)}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.glassSurface,
            borderColor: QamarColors.gold + "40",
          },
        ]}
        accessibilityLabel="Muhasaba summary"
      >
        <View style={styles.header}>
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: QamarColors.gold + "18" },
            ]}
          >
            <Feather name="star" size={16} color={QamarColors.gold} />
          </View>
          <ThemedText style={[styles.title, { color: theme.text }]}>
            Your Muhasaba
          </ThemedText>
        </View>

        {/* Summary */}
        <ThemedText style={[styles.summary, { color: theme.text }]}>
          {data.summary}
        </ThemedText>

        {/* Whispers found */}
        {data.whispersFound.length > 0 && (
          <View style={styles.section}>
            <ThemedText
              style={[styles.sectionLabel, { color: QamarColors.gold }]}
            >
              Whispers We Noticed
            </ThemedText>
            {data.whispersFound.map((w, i) => (
              <View key={i} style={styles.bulletRow}>
                <ThemedText
                  style={[styles.bullet, { color: QamarColors.gold }]}
                >
                  {"\u2022"}
                </ThemedText>
                <ThemedText style={[styles.bulletText, { color: theme.text }]}>
                  {w}
                </ThemedText>
              </View>
            ))}
          </View>
        )}

        {/* Clarity gained */}
        <View
          style={[
            styles.clarityBox,
            { backgroundColor: QamarColors.emerald + "0A" },
          ]}
        >
          <ThemedText
            style={[styles.sectionLabel, { color: QamarColors.emerald }]}
          >
            Clarity Gained
          </ThemedText>
          <ThemedText style={[styles.clarityText, { color: theme.text }]}>
            {data.clarity}
          </ThemedText>
        </View>

        {/* Closing dua */}
        <View style={[styles.duaBox, { borderTopColor: theme.glassStroke }]}>
          <ThemedText style={[styles.duaLabel, { color: theme.textSecondary }]}>
            Dua for Moving Forward
          </ThemedText>
          <ThemedText style={[styles.duaText, { color: theme.text }]}>
            {data.duaForNext}
          </ThemedText>
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
    marginBottom: 12,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  section: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingLeft: 4,
    marginBottom: 4,
  },
  bullet: {
    fontSize: 16,
    lineHeight: 20,
  },
  bulletText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  clarityBox: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  clarityText: {
    fontSize: 14,
    lineHeight: 20,
  },
  duaBox: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
  },
  duaLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  duaText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: "italic",
  },
});
