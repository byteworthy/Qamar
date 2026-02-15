import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { NoorColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import type { KhalilBasiraBlock } from "@/lib/khalil-api";

interface Props {
  data: KhalilBasiraBlock;
}

export function BasiraCard({ data }: Props) {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInUp.duration(300)}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.glassSurface,
            borderColor: NoorColors.emerald + "30",
          },
        ]}
        accessibilityLabel="Basira — seeing with clarity"
      >
        <View style={styles.header}>
          <View style={[styles.iconBadge, { backgroundColor: NoorColors.emerald + "18" }]}>
            <Feather name="eye" size={16} color={NoorColors.emerald} />
          </View>
          <ThemedText style={[styles.title, { color: theme.text }]}>
            Seeing with Basira
          </ThemedText>
        </View>

        {/* The whisper */}
        <View style={[styles.section, { backgroundColor: NoorColors.gold + "08" }]}>
          <ThemedText style={[styles.sectionLabel, { color: NoorColors.gold }]}>
            The Whisper
          </ThemedText>
          <ThemedText style={[styles.sectionText, { color: theme.text }]}>
            {data.whisper}
          </ThemedText>
        </View>

        {/* The truth */}
        <View style={[styles.section, { backgroundColor: NoorColors.emerald + "08" }]}>
          <ThemedText style={[styles.sectionLabel, { color: NoorColors.emerald }]}>
            The Truth
          </ThemedText>
          <ThemedText style={[styles.sectionText, { color: theme.text }]}>
            {data.clarity}
          </ThemedText>
        </View>

        {/* Supporting evidence */}
        {data.ayahOrHadith && (
          <View style={[styles.evidenceBox, { borderLeftColor: NoorColors.emerald }]}>
            <ThemedText style={[styles.evidenceText, { color: theme.textSecondary }]}>
              {data.ayahOrHadith}
            </ThemedText>
          </View>
        )}
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
  title: {
    fontSize: 15,
    fontWeight: "700",
  },
  section: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  evidenceBox: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  evidenceText: {
    fontSize: 13,
    lineHeight: 19,
    fontStyle: "italic",
  },
});
