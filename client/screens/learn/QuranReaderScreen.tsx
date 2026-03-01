import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import * as Sentry from "@sentry/react-native";
import { useTheme } from "@/hooks/useTheme";
import { useQuranSurahs, Surah } from "@/hooks/useQuranData";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SurahCardProps {
  surah: Surah;
  onPress: () => void;
  index: number;
}

const SurahCard = React.memo(function SurahCard({
  surah,
  onPress,
  index,
}: SurahCardProps) {
  const { theme } = useTheme();

  return (
    <Animated.View
      testID={`surah-item-${surah.id}`}
      entering={FadeInUp.duration(350).delay(index * 50)}
    >
      <GlassCard
        onPress={onPress}
        style={styles.surahCard}
        elevated
        accessibilityLabel={`Surah ${surah.id}, ${surah.transliteration}, ${surah.translation}, ${surah.numberOfVerses} verses`}
      >
        <View style={styles.surahContent}>
          <View style={styles.surahNumber}>
            <ThemedText style={styles.surahNumberText}>{surah.id}</ThemedText>
          </View>

          <View style={styles.surahInfo}>
            <ThemedText
              style={[styles.surahNameArabic, { fontFamily: "Amiri-Bold" }]}
            >
              {surah.name}
            </ThemedText>
            <ThemedText style={styles.surahNameEnglish}>
              {surah.transliteration}
            </ThemedText>
            <ThemedText
              style={[styles.surahTranslation, { color: theme.textSecondary }]}
            >
              {surah.translation}
            </ThemedText>
          </View>

          <View style={styles.surahMeta}>
            <View
              style={[
                styles.revelationBadge,
                {
                  backgroundColor:
                    surah.revelationPlace === "Makkah"
                      ? "rgba(212, 175, 55, 0.15)"
                      : "rgba(0, 150, 136, 0.15)",
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.revelationText,
                  {
                    color:
                      surah.revelationPlace === "Makkah"
                        ? theme.primary
                        : theme.accent,
                  },
                ]}
              >
                {surah.revelationPlace}
              </ThemedText>
            </View>
            <ThemedText
              style={[styles.versesCount, { color: theme.textSecondary }]}
            >
              {surah.numberOfVerses} verses
            </ThemedText>
          </View>
        </View>

        <Feather
          name="chevron-right"
          size={20}
          color={theme.textSecondary}
          style={styles.chevron}
        />
      </GlassCard>
    </Animated.View>
  );
});

export default function QuranReaderScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { data: surahs, isLoading, error } = useQuranSurahs();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter surahs based on search query
  const filteredSurahs = React.useMemo(() => {
    if (!surahs) return [];
    if (!searchQuery.trim()) return surahs;

    const query = searchQuery.toLowerCase();
    return surahs.filter(
      (surah) =>
        surah.transliteration.toLowerCase().includes(query) ||
        surah.translation.toLowerCase().includes(query) ||
        surah.name.includes(query),
    );
  }, [surahs, searchQuery]);

  const handleSurahPress = useCallback(
    (surah: Surah) => {
      // Track surah opened metric
      Sentry.startSpan(
        {
          name: "quran.surah_opened",
          op: "ui.action",
          attributes: { "quran.surah_id": surah.id },
        },
        () => {},
      );
      navigation.navigate("VerseReader", { surahId: surah.id });
    },
    [navigation],
  );

  const renderSurahItem = useCallback(
    ({ item, index }: { item: Surah; index: number }) => (
      <SurahCard
        surah={item}
        onPress={() => handleSurahPress(item)}
        index={index}
      />
    ),
    [handleSurahPress],
  );

  if (isLoading) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText
            style={[styles.loadingText, { color: theme.textSecondary }]}
          >
            Loading Quran...
          </ThemedText>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={theme.error} />
          <ThemedText style={[styles.errorText, { color: theme.error }]}>
            Failed to load Quran
          </ThemedText>
          <ThemedText
            style={[styles.errorSubtext, { color: theme.textSecondary }]}
          >
            Please check your connection and try again
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          {
            paddingTop: insets.top + 16,
            backgroundColor: theme.backgroundRoot,
          },
        ]}
      >
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: theme.inputBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <Feather name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search surahs..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Search surahs"
            accessibilityHint="Filter surahs by name or translation"
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery("")}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Feather name="x" size={20} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Surahs List */}
      <FlatList
        testID="surah-list"
        data={filteredSurahs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSurahItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        windowSize={5}
        maxToRenderPerBatch={8}
        removeClippedSubviews={true}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="book" size={48} color={theme.textSecondary} />
            <ThemedText
              style={[styles.emptyText, { color: theme.textSecondary }]}
            >
              {searchQuery ? "No surahs found" : "No surahs available"}
            </ThemedText>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter-Regular",
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  surahCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  surahContent: {
    flex: 1,
    gap: 8,
  },
  surahNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  surahNumberText: {
    fontSize: 14,
    fontWeight: "600",
  },
  surahInfo: {
    gap: 2,
  },
  surahNameArabic: {
    fontSize: 24,
    lineHeight: 32,
    textAlign: "left",
    writingDirection: "rtl",
  },
  surahNameEnglish: {
    fontSize: 18,
    fontWeight: "600",
  },
  surahTranslation: {
    fontSize: 14,
  },
  surahMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  revelationBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  revelationText: {
    fontSize: 12,
    fontWeight: "600",
  },
  versesCount: {
    fontSize: 12,
  },
  chevron: {
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
  },
});
