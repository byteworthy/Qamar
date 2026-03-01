import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { QamarColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import type { KhalilWaswasaBlock } from "@/lib/khalil-api";

interface Props {
  data: KhalilWaswasaBlock;
}

export function WaswasaCard({ data }: Props) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <Animated.View entering={FadeInUp.duration(300)}>
      <Pressable
        onPress={() => setExpanded(!expanded)}
        style={[
          styles.card,
          {
            backgroundColor: theme.glassSurface,
            borderColor: QamarColors.gold + "30",
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Waswasa detected — tap to expand"
      >
        <View style={styles.header}>
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: QamarColors.gold + "18" },
            ]}
          >
            <Feather name="alert-circle" size={16} color={QamarColors.gold} />
          </View>
          <View style={styles.headerText}>
            <ThemedText style={[styles.title, { color: theme.text }]}>
              Shaytan might be whispering...
            </ThemedText>
          </View>
          <Feather
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={theme.textSecondary}
          />
        </View>

        {expanded && (
          <>
            <View style={styles.whispersList}>
              {data.whispers.map((whisper, i) => (
                <View key={i} style={styles.whisperRow}>
                  <ThemedText
                    style={[styles.whisperBullet, { color: QamarColors.gold }]}
                  >
                    {"\u2022"}
                  </ThemedText>
                  <ThemedText
                    style={[styles.whisperText, { color: theme.text }]}
                  >
                    {whisper}
                  </ThemedText>
                </View>
              ))}
            </View>

            <View
              style={[
                styles.insightBox,
                { backgroundColor: QamarColors.gold + "0A" },
              ]}
            >
              <ThemedText
                style={[styles.insightText, { color: theme.textSecondary }]}
              >
                {data.insight}
              </ThemedText>
            </View>
          </>
        )}
      </Pressable>
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
    fontSize: 14,
    fontWeight: "600",
  },
  whispersList: {
    marginTop: 12,
    gap: 6,
  },
  whisperRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingLeft: 4,
  },
  whisperBullet: {
    fontSize: 16,
    lineHeight: 20,
  },
  whisperText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  insightBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
  },
  insightText: {
    fontSize: 13,
    lineHeight: 19,
    fontStyle: "italic",
  },
});
