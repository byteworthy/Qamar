import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/hooks/useTheme";
import { NoorColors } from "@/constants/theme/colors";
import { TafsirData } from "@/stores/tafsir-cache-store";

interface TafsirPanelProps {
  tafsir: TafsirData;
  onClose: () => void;
}

export function TafsirPanel({ tafsir, onClose }: TafsirPanelProps) {
  const { theme } = useTheme();

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      exiting={FadeOutDown.duration(200)}
      style={styles.container}
    >
      <GlassCard style={styles.panel}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Tafsir</ThemedText>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color={theme.text} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Context Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="book-open" size={16} color={NoorColors.gold} />
              <ThemedText
                style={[styles.sectionTitle, { color: NoorColors.gold }]}
              >
                Context
              </ThemedText>
            </View>
            <ThemedText style={[styles.sectionText, { color: theme.text }]}>
              {tafsir.context}
            </ThemedText>
          </View>

          {/* Key Terms Section */}
          {tafsir.keyTerms.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Feather name="search" size={16} color={NoorColors.gold} />
                <ThemedText
                  style={[styles.sectionTitle, { color: NoorColors.gold }]}
                >
                  Key Terms
                </ThemedText>
              </View>
              {tafsir.keyTerms.map((term, index) => (
                <View key={index} style={styles.termCard}>
                  <ThemedText style={styles.termArabic}>
                    {term.arabic}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.termTranslit,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {term.transliteration} (root: {term.root})
                  </ThemedText>
                  <ThemedText
                    style={[styles.termMeaning, { color: theme.text }]}
                  >
                    {term.meaning}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}

          {/* Scholarly Views Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="users" size={16} color={NoorColors.gold} />
              <ThemedText
                style={[styles.sectionTitle, { color: NoorColors.gold }]}
              >
                Scholarly Views
              </ThemedText>
            </View>
            <ThemedText style={[styles.sectionText, { color: theme.text }]}>
              {tafsir.scholarlyViews}
            </ThemedText>
          </View>

          {/* Cross References */}
          {tafsir.crossReferences.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Feather name="link" size={16} color={NoorColors.gold} />
                <ThemedText
                  style={[styles.sectionTitle, { color: NoorColors.gold }]}
                >
                  Related Verses
                </ThemedText>
              </View>
              <View style={styles.crossRefContainer}>
                {tafsir.crossReferences.map((ref, index) => (
                  <View
                    key={index}
                    style={[
                      styles.crossRefChip,
                      { borderColor: NoorColors.gold },
                    ]}
                  >
                    <ThemedText
                      style={[styles.crossRefText, { color: NoorColors.gold }]}
                    >
                      {ref}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Practical Takeaway */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="heart" size={16} color={NoorColors.gold} />
              <ThemedText
                style={[styles.sectionTitle, { color: NoorColors.gold }]}
              >
                Practical Takeaway
              </ThemedText>
            </View>
            <ThemedText style={[styles.takeawayText, { color: theme.text }]}>
              {tafsir.practicalTakeaway}
            </ThemedText>
          </View>
        </ScrollView>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: "75%",
  },
  panel: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    maxHeight: 500,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 24,
  },
  termCard: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212, 175, 55, 0.2)",
  },
  termArabic: {
    fontSize: 22,
    fontFamily: "Amiri",
    marginBottom: 4,
  },
  termTranslit: {
    fontSize: 13,
    fontStyle: "italic",
    marginBottom: 4,
  },
  termMeaning: {
    fontSize: 14,
    lineHeight: 20,
  },
  crossRefContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  crossRefChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  crossRefText: {
    fontSize: 13,
    fontWeight: "600",
  },
  takeawayText: {
    fontSize: 15,
    lineHeight: 24,
    fontStyle: "italic",
  },
});
