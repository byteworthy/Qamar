import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import {
  useHadiths,
  useHadithCollections,
  Hadith,
} from "@/hooks/useHadithData";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { RouteType } from "@/navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ============================================================================
// Hadith Card
// ============================================================================

interface HadithCardProps {
  hadith: Hadith;
  onPress: () => void;
  index: number;
}

function HadithCard({ hadith, onPress, index }: HadithCardProps) {
  const { theme } = useTheme();

  const gradeColor =
    hadith.grade === "Sahih"
      ? "#4CAF50"
      : hadith.grade === "Hasan"
        ? "#FF9800"
        : "#f44336";

  return (
    <Animated.View entering={FadeInUp.duration(350).delay(index * 40)}>
      <GlassCard onPress={onPress} style={styles.hadithCard} elevated>
        <View style={styles.hadithContent}>
          <View style={styles.hadithHeader}>
            <View style={styles.hadithNumber}>
              <ThemedText style={[styles.hadithNumberText, { color: theme.primary }]}>
                {hadith.hadithNumber}
              </ThemedText>
            </View>
            <View
              style={[
                styles.gradeBadge,
                { backgroundColor: `${gradeColor}20` },
              ]}
            >
              <ThemedText style={[styles.gradeText, { color: gradeColor }]}>
                {hadith.grade}
              </ThemedText>
            </View>
          </View>

          <ThemedText
            style={[styles.hadithArabic, { fontFamily: "Amiri-Bold" }]}
            numberOfLines={2}
          >
            {hadith.textArabic}
          </ThemedText>

          <ThemedText
            style={[styles.hadithEnglish, { color: theme.text }]}
            numberOfLines={3}
          >
            {hadith.textEnglish}
          </ThemedText>

          <ThemedText
            style={[styles.narratorText, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {hadith.narrator}
          </ThemedText>
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
}

// ============================================================================
// Main Screen
// ============================================================================

export default function HadithListScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType<"HadithList">>();
  const { collectionId } = route.params;
  const { data: hadiths, isLoading, error } = useHadiths(collectionId);
  const { data: collections } = useHadithCollections();
  const [searchQuery, setSearchQuery] = useState("");

  const collection = useMemo(
    () => collections?.find((c) => c.id === collectionId),
    [collections, collectionId]
  );

  const filteredHadiths = useMemo(() => {
    if (!hadiths) return [];
    if (!searchQuery.trim()) return hadiths;
    const q = searchQuery.toLowerCase();
    return hadiths.filter(
      (h) =>
        h.textEnglish.toLowerCase().includes(q) ||
        h.textArabic.includes(searchQuery) ||
        h.narrator.toLowerCase().includes(q) ||
        String(h.hadithNumber).includes(searchQuery)
    );
  }, [hadiths, searchQuery]);

  const handleHadithPress = (hadith: Hadith) => {
    navigation.navigate("HadithDetail", { hadithId: hadith.id });
  };

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
            Loading hadiths...
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
            Failed to load hadiths
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

  const ListHeader = () => (
    <View style={styles.listHeader}>
      {/* Collection Info */}
      {collection && (
        <Animated.View entering={FadeInDown.duration(350)}>
          <GlassCard style={styles.collectionHeader} elevated>
            <ThemedText
              style={[
                styles.collectionArabic,
                { fontFamily: "Amiri-Bold", color: theme.primary },
              ]}
            >
              {collection.nameArabic}
            </ThemedText>
            <ThemedText style={styles.collectionName}>
              {collection.name}
            </ThemedText>
            <ThemedText
              style={[
                styles.collectionCompiler,
                { color: theme.textSecondary },
              ]}
            >
              {collection.compiler}
            </ThemedText>
            <ThemedText
              style={[
                styles.collectionDesc,
                { color: theme.textSecondary },
              ]}
            >
              {collection.description}
            </ThemedText>
            <View style={styles.collectionStats}>
              <View
                style={[
                  styles.statBadge,
                  { backgroundColor: "rgba(212, 175, 55, 0.15)" },
                ]}
              >
                <ThemedText
                  style={[styles.statText, { color: theme.primary }]}
                >
                  {hadiths?.length ?? 0} hadiths loaded
                </ThemedText>
              </View>
            </View>
          </GlassCard>
        </Animated.View>
      )}

      {/* Search within collection */}
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: theme.inputBackground,
            borderColor: theme.border,
          },
        ]}
      >
        <Feather name="search" size={18} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search within collection..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Feather name="x" size={18} color={theme.textSecondary} />
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={filteredHadiths}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <HadithCard
            hadith={item}
            onPress={() => handleHadithPress(item)}
            index={Math.min(index, 10)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 100 + insets.bottom, paddingTop: 16 },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="file-text" size={48} color={theme.textSecondary} />
            <ThemedText
              style={[styles.emptyText, { color: theme.textSecondary }]}
            >
              {searchQuery
                ? "No hadiths match your search"
                : "No hadiths available"}
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
  listContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  listHeader: {
    gap: 12,
    marginBottom: 4,
  },
  // Collection Header
  collectionHeader: {
    padding: 20,
    alignItems: "center",
  },
  collectionArabic: {
    fontSize: 28,
    lineHeight: 40,
    textAlign: "center",
    marginBottom: 4,
  },
  collectionName: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 2,
  },
  collectionCompiler: {
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 8,
  },
  collectionDesc: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginBottom: 12,
  },
  collectionStats: {
    flexDirection: "row",
    justifyContent: "center",
  },
  statBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statText: {
    fontSize: 12,
    fontWeight: "600",
  },
  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter-Regular",
  },
  // Hadith Card
  hadithCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  hadithContent: {
    flex: 1,
    gap: 8,
  },
  hadithHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hadithNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  hadithNumberText: {
    fontSize: 14,
    fontWeight: "600",
  },
  gradeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gradeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  hadithArabic: {
    fontSize: 20,
    lineHeight: 30,
    textAlign: "right",
    writingDirection: "rtl",
  },
  hadithEnglish: {
    fontSize: 14,
    lineHeight: 20,
  },
  narratorText: {
    fontSize: 12,
    fontStyle: "italic",
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
