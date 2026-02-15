import React, { useState } from "react";
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

import { useTheme } from "@/hooks/useTheme";
import {
  useHadithCollections,
  useHadithSearch,
  useDailyHadith,
  HadithCollection,
  Hadith,
} from "@/hooks/useHadithData";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ============================================================================
// Daily Hadith Card
// ============================================================================

function DailyHadithCard() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { data: dailyHadith, isLoading } = useDailyHadith();

  if (isLoading || !dailyHadith) return null;

  const gradeColor =
    dailyHadith.grade === "Sahih"
      ? "#4CAF50"
      : dailyHadith.grade === "Hasan"
        ? "#FF9800"
        : "#f44336";

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(0)}>
      <GlassCard
        onPress={() =>
          navigation.navigate("HadithDetail", { hadithId: dailyHadith.id })
        }
        style={styles.dailyCard}
        elevated
        accessibilityLabel="Daily hadith. Tap to read full hadith"
      >
        <View style={styles.dailyHeader}>
          <View style={styles.dailyBadge}>
            <Feather name="sun" size={14} color="#D4AF37" />
            <ThemedText style={styles.dailyBadgeText}>
              Daily Hadith
            </ThemedText>
          </View>
          <View
            style={[
              styles.gradeBadgeSmall,
              { backgroundColor: `${gradeColor}20` },
            ]}
          >
            <ThemedText
              style={[styles.gradeBadgeSmallText, { color: gradeColor }]}
            >
              {dailyHadith.grade}
            </ThemedText>
          </View>
        </View>

        {dailyHadith.textArabic ? (
          <ThemedText
            style={[styles.dailyArabic, { fontFamily: "Amiri-Bold" }]}
            numberOfLines={2}
          >
            {dailyHadith.textArabic}
          </ThemedText>
        ) : null}

        <ThemedText
          style={[styles.dailyEnglish, { color: theme.text }]}
          numberOfLines={3}
        >
          {dailyHadith.textEnglish}
        </ThemedText>

        <ThemedText
          style={[styles.dailyNarrator, { color: theme.textSecondary }]}
          numberOfLines={1}
        >
          {dailyHadith.narrator}
        </ThemedText>

        <View style={styles.dailyFooter}>
          <ThemedText
            style={[styles.dailyTap, { color: theme.textSecondary }]}
          >
            Tap to read full hadith
          </ThemedText>
          <Feather name="arrow-right" size={14} color={theme.textSecondary} />
        </View>
      </GlassCard>
    </Animated.View>
  );
}

// ============================================================================
// Collection Card
// ============================================================================

interface CollectionCardProps {
  collection: HadithCollection;
  onPress: () => void;
  index: number;
}

function CollectionCard({ collection, onPress, index }: CollectionCardProps) {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInUp.duration(350).delay(100 + index * 50)}>
      <GlassCard onPress={onPress} style={styles.collectionCard} elevated accessibilityLabel={`${collection.name} by ${collection.compiler}, ${collection.totalHadiths} hadiths`}>
        <View style={styles.collectionContent}>
          <View style={styles.collectionIcon}>
            <Feather name="book" size={20} color={theme.primary} />
          </View>

          <View style={styles.collectionInfo}>
            <ThemedText
              style={[
                styles.collectionNameArabic,
                { fontFamily: "Amiri-Bold" },
              ]}
            >
              {collection.nameArabic}
            </ThemedText>
            <ThemedText style={styles.collectionNameEnglish}>
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
                styles.collectionDescription,
                { color: theme.textSecondary },
              ]}
              numberOfLines={2}
            >
              {collection.description}
            </ThemedText>
          </View>

          <View style={styles.collectionMeta}>
            <View
              style={[
                styles.hadithCountBadge,
                { backgroundColor: "rgba(212, 175, 55, 0.15)" },
              ]}
            >
              <ThemedText
                style={[styles.hadithCountText, { color: theme.primary }]}
              >
                {collection.totalHadiths.toLocaleString()}
              </ThemedText>
            </View>
            <ThemedText
              style={[styles.hadithCountLabel, { color: theme.textSecondary }]}
            >
              hadiths
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
}

// ============================================================================
// Search Result Card
// ============================================================================

interface HadithSearchResultProps {
  hadith: Hadith;
  onPress: () => void;
  index: number;
}

function HadithSearchResult({
  hadith,
  onPress,
  index,
}: HadithSearchResultProps) {
  const { theme } = useTheme();

  const gradeColor =
    hadith.grade === "Sahih"
      ? "#4CAF50"
      : hadith.grade === "Hasan"
        ? "#FF9800"
        : "#f44336";

  return (
    <Animated.View entering={FadeInUp.duration(350).delay(index * 50)}>
      <GlassCard onPress={onPress} style={styles.collectionCard} elevated accessibilityLabel={`Hadith: ${hadith.textEnglish}, grade: ${hadith.grade}`}>
        <View style={styles.collectionContent}>
          <View style={styles.collectionInfo}>
            <ThemedText
              style={[styles.searchResultText, { color: theme.text }]}
              numberOfLines={2}
            >
              {hadith.textEnglish}
            </ThemedText>
            <View style={styles.searchResultMeta}>
              <View
                style={[
                  styles.gradeBadgeSmall,
                  { backgroundColor: `${gradeColor}20` },
                ]}
              >
                <ThemedText
                  style={[styles.gradeBadgeSmallText, { color: gradeColor }]}
                >
                  {hadith.grade}
                </ThemedText>
              </View>
              <ThemedText
                style={[
                  styles.searchResultNarrator,
                  { color: theme.textSecondary },
                ]}
              >
                {hadith.narrator}
              </ThemedText>
            </View>
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
}

// ============================================================================
// Main Screen
// ============================================================================

export default function HadithLibraryScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const {
    data: collections,
    isLoading: collectionsLoading,
    error: collectionsError,
  } = useHadithCollections();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults, isLoading: searchLoading } =
    useHadithSearch(searchQuery);

  const isSearching = searchQuery.trim().length > 0;

  const filteredCollections = React.useMemo(() => {
    if (!collections) return [];
    if (!searchQuery.trim()) return collections;
    const query = searchQuery.toLowerCase();
    return collections.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.nameArabic.includes(searchQuery) ||
        c.compiler.toLowerCase().includes(query)
    );
  }, [collections, searchQuery]);

  const handleCollectionPress = (collection: HadithCollection) => {
    navigation.navigate("HadithList", { collectionId: collection.id });
  };

  const handleHadithPress = (hadith: Hadith) => {
    navigation.navigate("HadithDetail", { hadithId: hadith.id });
  };

  if (collectionsLoading) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText
            style={[styles.loadingText, { color: theme.textSecondary }]}
          >
            Loading Hadith Library...
          </ThemedText>
        </View>
      </View>
    );
  }

  if (collectionsError) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={theme.error} />
          <ThemedText style={[styles.errorText, { color: theme.error }]}>
            Failed to load Hadith Library
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
            placeholder="Search hadiths..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Search hadiths"
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

      {/* Search Results or Collection List */}
      {isSearching && searchResults && searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <HadithSearchResult
              hadith={item}
              onPress={() => handleHadithPress(item)}
              index={index}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 100 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            searchLoading ? (
              <View style={styles.searchLoadingContainer}>
                <ActivityIndicator size="small" color={theme.primary} />
              </View>
            ) : null
          }
        />
      ) : (
        <FlatList
          data={isSearching ? filteredCollections : collections}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <CollectionCard
              collection={item}
              onPress={() => handleCollectionPress(item)}
              index={index}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 100 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={!isSearching ? <DailyHadithCard /> : null}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather
                name="file-text"
                size={48}
                color={theme.textSecondary}
              />
              <ThemedText
                style={[styles.emptyText, { color: theme.textSecondary }]}
              >
                {searchQuery
                  ? "No collections found"
                  : "No collections available"}
              </ThemedText>
            </View>
          }
        />
      )}
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
  searchLoadingContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  // Daily Hadith Card
  dailyCard: {
    padding: 20,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#D4AF37",
  },
  dailyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dailyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dailyBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#D4AF37",
  },
  dailyArabic: {
    fontSize: 22,
    lineHeight: 36,
    textAlign: "right",
    writingDirection: "rtl",
    marginBottom: 10,
  },
  dailyEnglish: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  dailyNarrator: {
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: 12,
  },
  dailyFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(128, 128, 128, 0.2)",
    paddingTop: 10,
  },
  dailyTap: {
    fontSize: 12,
  },
  // Collection Card
  collectionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  collectionContent: {
    flex: 1,
    gap: 8,
  },
  collectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  collectionInfo: {
    gap: 2,
  },
  collectionNameArabic: {
    fontSize: 24,
    lineHeight: 32,
    textAlign: "left",
    writingDirection: "rtl",
  },
  collectionNameEnglish: {
    fontSize: 18,
    fontWeight: "600",
  },
  collectionCompiler: {
    fontSize: 13,
    fontStyle: "italic",
  },
  collectionDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  collectionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  hadithCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  hadithCountText: {
    fontSize: 12,
    fontWeight: "600",
  },
  hadithCountLabel: {
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
  searchResultText: {
    fontSize: 15,
    lineHeight: 22,
  },
  searchResultMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  gradeBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gradeBadgeSmallText: {
    fontSize: 11,
    fontWeight: "600",
  },
  searchResultNarrator: {
    fontSize: 12,
  },
});
