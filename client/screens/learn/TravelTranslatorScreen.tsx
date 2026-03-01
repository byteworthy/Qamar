/**
 * TravelTranslatorScreen
 *
 * Offline-first travel translator with curated phrasebook (EN/ES ↔ AR)
 * and cached online translations for offline reuse.
 */

import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Animated, {
  FadeInUp,
  FadeInDown,
  FadeIn,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/hooks/useTheme";
import {
  useTravelTranslator,
  type SourceLanguage,
} from "@/hooks/useTravelTranslator";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { TTSButton } from "@/components/TTSButton";
import { QamarColors } from "@/constants/theme/colors";
import {
  type TravelCategory,
  type TravelPhrase,
  type TravelCategoryInfo,
} from "@/data/travel-phrasebook";

// =============================================================================
// TAB TYPE
// =============================================================================

type TabId = "phrases" | "translate" | "favorites";

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function LanguagePicker({
  sourceLang,
  setSourceLang,
  isArabicToSource,
  toggleDirection,
}: {
  sourceLang: SourceLanguage;
  setSourceLang: (lang: SourceLanguage) => void;
  isArabicToSource: boolean;
  toggleDirection: () => void;
}) {
  const { theme } = useTheme();

  const leftLabel = isArabicToSource
    ? "Arabic"
    : sourceLang === "en"
      ? "English"
      : "Español";
  const rightLabel = isArabicToSource
    ? sourceLang === "en"
      ? "English"
      : "Español"
    : "Arabic";

  return (
    <View style={styles.languageRow}>
      {/* Source language toggle (EN / ES) */}
      <View style={styles.langToggle}>
        <TouchableOpacity
          onPress={() => setSourceLang("en")}
          style={[
            styles.langChip,
            sourceLang === "en" && { backgroundColor: QamarColors.gold },
          ]}
          accessibilityLabel="English"
          testID="lang-en"
        >
          <ThemedText
            style={[
              styles.langChipText,
              { color: sourceLang === "en" ? "#fff" : theme.textSecondary },
            ]}
          >
            EN
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSourceLang("es")}
          style={[
            styles.langChip,
            sourceLang === "es" && { backgroundColor: QamarColors.gold },
          ]}
          accessibilityLabel="Spanish"
          testID="lang-es"
        >
          <ThemedText
            style={[
              styles.langChipText,
              { color: sourceLang === "es" ? "#fff" : theme.textSecondary },
            ]}
          >
            ES
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Direction labels + swap */}
      <ThemedText style={[styles.directionLabel, { color: QamarColors.gold }]}>
        {leftLabel}
      </ThemedText>
      <TouchableOpacity
        onPress={toggleDirection}
        style={[styles.swapButton, { borderColor: theme.border }]}
        accessibilityLabel="Swap translation direction"
        testID="swap-direction"
      >
        <Feather name="repeat" size={20} color={QamarColors.gold} />
      </TouchableOpacity>
      <ThemedText style={[styles.directionLabel, { color: QamarColors.gold }]}>
        {rightLabel}
      </ThemedText>
    </View>
  );
}

function CategoryCard({
  category,
  onPress,
  delay,
}: {
  category: TravelCategoryInfo;
  onPress: () => void;
  delay: number;
}) {
  return (
    <Animated.View
      entering={FadeInUp.duration(300).delay(delay)}
      style={styles.categoryCardWrapper}
    >
      <TouchableOpacity
        onPress={onPress}
        style={styles.categoryCard}
        activeOpacity={0.7}
        accessibilityLabel={category.label}
        testID={`travel-category-${category.id}`}
      >
        <View
          style={[
            styles.categoryIcon,
            { backgroundColor: category.color + "22" },
          ]}
        >
          <Feather
            name={category.icon as keyof typeof Feather.glyphMap}
            size={24}
            color={category.color}
          />
        </View>
        <ThemedText style={styles.categoryLabel} numberOfLines={2}>
          {category.label}
        </ThemedText>
      </TouchableOpacity>
    </Animated.View>
  );
}

function PhraseRow({
  phrase,
  sourceLang,
  isArabicToSource,
  isFavorite,
  onToggleFavorite,
}: {
  phrase: TravelPhrase;
  sourceLang: SourceLanguage;
  isArabicToSource: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const { theme } = useTheme();

  const sourceText = isArabicToSource
    ? phrase.ar
    : sourceLang === "en"
      ? phrase.en
      : phrase.es;
  const targetText = isArabicToSource
    ? sourceLang === "en"
      ? phrase.en
      : phrase.es
    : phrase.ar;
  const targetLang = isArabicToSource
    ? sourceLang === "en"
      ? "en-US"
      : "es-ES"
    : "ar-SA";
  const showTransliteration = !isArabicToSource;

  return (
    <GlassCard style={styles.phraseCard}>
      <View style={styles.phraseHeader}>
        <ThemedText
          style={[styles.phraseSource, { color: theme.textSecondary }]}
        >
          {sourceText}
        </ThemedText>
        <TouchableOpacity
          onPress={onToggleFavorite}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={
            isFavorite ? "Remove from favorites" : "Add to favorites"
          }
        >
          <Feather
            name={isFavorite ? "heart" : "heart"}
            size={18}
            color={isFavorite ? QamarColors.gold : theme.textSecondary}
            style={isFavorite ? { opacity: 1 } : { opacity: 0.5 }}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.phraseTargetRow}>
        <ThemedText
          style={[
            !isArabicToSource
              ? styles.phraseTargetArabic
              : styles.phraseTargetLatin,
            { color: theme.text, flex: 1 },
          ]}
        >
          {targetText}
        </ThemedText>
        <TTSButton text={targetText} language={targetLang} size={20} />
      </View>
      {showTransliteration && (
        <ThemedText
          style={[styles.transliteration, { color: theme.textSecondary }]}
        >
          {phrase.transliteration}
        </ThemedText>
      )}
    </GlassCard>
  );
}

// =============================================================================
// MAIN SCREEN
// =============================================================================

export default function TravelTranslatorScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabId>("phrases");
  const [selectedCategory, setSelectedCategory] =
    useState<TravelCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    sourceLang,
    setSourceLang,
    isArabicToSource,
    toggleDirection,
    categories,
    getPhrases,
    searchPhrases,
    freeformText,
    setFreeformText,
    translateFreeform,
    isTranslating,
    freeformResult,
    error,
    clearFreeform,
    toggleFavorite,
    isFavorite,
    getFavoritePhrases,
    cachedTranslationCount,
  } = useTravelTranslator();

  // ==========================================================================
  // Derived state
  // ==========================================================================

  const displayPhrases = useMemo(() => {
    if (searchQuery.trim()) {
      return searchPhrases(searchQuery);
    }
    if (selectedCategory) {
      return getPhrases(selectedCategory);
    }
    return [];
  }, [searchQuery, selectedCategory, searchPhrases, getPhrases]);

  const favoritePhrases = useMemo(
    () => getFavoritePhrases(),
    [getFavoritePhrases],
  );

  const handleCategoryPress = useCallback((catId: TravelCategory) => {
    setSelectedCategory(catId);
    setSearchQuery("");
  }, []);

  const handleBackToCategories = useCallback(() => {
    setSelectedCategory(null);
    setSearchQuery("");
  }, []);

  const outputLang = isArabicToSource
    ? sourceLang === "en"
      ? "en-US"
      : "es-ES"
    : "ar-SA";

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.backgroundRoot }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[styles.container, { paddingTop: insets.top + 16 }]}
        testID="travel-translator-screen"
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.header}
        >
          <ThemedText style={styles.headerTitle}>Travel Translator</ThemedText>
          <ThemedText
            style={[styles.headerSubtitle, { color: theme.textSecondary }]}
          >
            Offline phrasebook + cached translations
          </ThemedText>
        </Animated.View>

        {/* Language Picker */}
        <LanguagePicker
          sourceLang={sourceLang}
          setSourceLang={setSourceLang}
          isArabicToSource={isArabicToSource}
          toggleDirection={toggleDirection}
        />

        {/* Tab Bar */}
        <View style={styles.tabRow} testID="travel-tab-bar">
          {(
            [
              { id: "phrases" as TabId, label: "Phrases", icon: "book" },
              { id: "translate" as TabId, label: "Translate", icon: "type" },
              { id: "favorites" as TabId, label: "Favorites", icon: "heart" },
            ] as const
          ).map((tab) => (
            <TouchableOpacity
              key={tab.id}
              testID={`travel-tab-${tab.id}`}
              onPress={() => setActiveTab(tab.id)}
              style={[
                styles.tab,
                activeTab === tab.id && {
                  borderBottomColor: QamarColors.gold,
                  borderBottomWidth: 2,
                },
              ]}
            >
              <Feather
                name={tab.icon as keyof typeof Feather.glyphMap}
                size={16}
                color={
                  activeTab === tab.id ? QamarColors.gold : theme.textSecondary
                }
              />
              <ThemedText
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === tab.id
                        ? QamarColors.gold
                        : theme.textSecondary,
                  },
                ]}
              >
                {tab.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* ================================================================= */}
        {/* TAB: PHRASES */}
        {/* ================================================================= */}
        {activeTab === "phrases" && (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[
              styles.tabContent,
              { paddingBottom: insets.bottom + 32 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Search */}
            <GlassCard style={styles.searchCard}>
              <Feather name="search" size={18} color={theme.textSecondary} />
              <TextInput
                testID="travel-search-input"
                style={[styles.searchInput, { color: theme.text }]}
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  if (text.trim()) setSelectedCategory(null);
                }}
                placeholder="Search phrases..."
                placeholderTextColor={theme.textSecondary}
                autoCorrect={false}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Feather
                    name="x-circle"
                    size={18}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </GlassCard>

            {/* Category Grid or Phrase List */}
            {!selectedCategory && !searchQuery.trim() ? (
              <View style={styles.categoryGrid} testID="travel-category-grid">
                {categories.map((cat, i) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    onPress={() => handleCategoryPress(cat.id)}
                    delay={50 + i * 40}
                  />
                ))}
              </View>
            ) : (
              <>
                {selectedCategory && !searchQuery.trim() && (
                  <TouchableOpacity
                    onPress={handleBackToCategories}
                    style={styles.backButton}
                  >
                    <Feather
                      name="arrow-left"
                      size={18}
                      color={QamarColors.gold}
                    />
                    <ThemedText
                      style={[styles.backText, { color: QamarColors.gold }]}
                    >
                      All categories
                    </ThemedText>
                  </TouchableOpacity>
                )}
                {displayPhrases.length === 0 ? (
                  <ThemedText
                    style={[styles.emptyText, { color: theme.textSecondary }]}
                  >
                    No phrases found
                  </ThemedText>
                ) : (
                  displayPhrases.map((phrase) => (
                    <PhraseRow
                      key={phrase.id}
                      phrase={phrase}
                      sourceLang={sourceLang}
                      isArabicToSource={isArabicToSource}
                      isFavorite={isFavorite(phrase.id)}
                      onToggleFavorite={() => toggleFavorite(phrase.id)}
                    />
                  ))
                )}
              </>
            )}
          </ScrollView>
        )}

        {/* ================================================================= */}
        {/* TAB: TRANSLATE (Free-form) */}
        {/* ================================================================= */}
        {activeTab === "translate" && (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[
              styles.tabContent,
              { paddingBottom: insets.bottom + 32 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Input */}
            <GlassCard style={styles.inputCard}>
              <TextInput
                testID="travel-translate-input"
                style={[
                  styles.textInput,
                  {
                    color: theme.text,
                    textAlign: isArabicToSource ? "right" : "left",
                  },
                ]}
                value={freeformText}
                onChangeText={setFreeformText}
                placeholder={
                  isArabicToSource
                    ? "اكتب نص عربي..."
                    : sourceLang === "en"
                      ? "Type English text..."
                      : "Escribe texto en español..."
                }
                placeholderTextColor={theme.textSecondary}
                multiline
                autoCorrect={false}
                returnKeyType="done"
                blurOnSubmit
              />
              {freeformText.length > 0 && (
                <TouchableOpacity
                  onPress={clearFreeform}
                  style={styles.clearButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather
                    name="x-circle"
                    size={20}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </GlassCard>

            {/* Translate Button */}
            <TouchableOpacity
              testID="travel-translate-button"
              onPress={translateFreeform}
              disabled={!freeformText.trim() || isTranslating}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  !freeformText.trim() || isTranslating
                    ? ["#8a7a50", "#6b5e3e"]
                    : [QamarColors.gold, "#c7a84e"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.translateButton,
                  (!freeformText.trim() || isTranslating) &&
                    styles.translateButtonDisabled,
                ]}
              >
                {isTranslating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText style={styles.translateButtonText}>
                    Translate
                  </ThemedText>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Error */}
            {error && (
              <Animated.View
                entering={FadeIn.duration(300)}
                style={styles.errorContainer}
              >
                <Feather name="alert-circle" size={16} color={theme.error} />
                <ThemedText style={[styles.errorText, { color: theme.error }]}>
                  {error}
                </ThemedText>
              </Animated.View>
            )}

            {/* Result */}
            {freeformResult && (
              <Animated.View entering={FadeInUp.duration(400)}>
                <GlassCard style={styles.resultCard}>
                  {/* Offline badge */}
                  {freeformResult.isOffline && (
                    <View style={styles.offlineBadge}>
                      <Feather name="wifi-off" size={12} color="#2ECC71" />
                      <ThemedText style={styles.offlineBadgeText}>
                        {freeformResult.source === "phrasebook"
                          ? "From phrasebook"
                          : "Cached offline"}
                      </ThemedText>
                    </View>
                  )}

                  <View style={styles.resultHeader}>
                    <ThemedText
                      style={[
                        !isArabicToSource
                          ? styles.resultTextArabic
                          : styles.resultTextLatin,
                        { color: theme.text, flex: 1 },
                      ]}
                    >
                      {freeformResult.translatedText}
                    </ThemedText>
                    <TTSButton
                      text={freeformResult.translatedText}
                      language={outputLang}
                      size={24}
                    />
                  </View>

                  {freeformResult.transliteration && (
                    <ThemedText
                      style={[
                        styles.transliteration,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {freeformResult.transliteration}
                    </ThemedText>
                  )}
                </GlassCard>
              </Animated.View>
            )}

            {/* Cache info */}
            <View style={styles.cacheInfo}>
              <Feather name="database" size={14} color={theme.textSecondary} />
              <ThemedText
                style={[styles.cacheInfoText, { color: theme.textSecondary }]}
              >
                {cachedTranslationCount} translations saved for offline use
              </ThemedText>
            </View>
          </ScrollView>
        )}

        {/* ================================================================= */}
        {/* TAB: FAVORITES */}
        {/* ================================================================= */}
        {activeTab === "favorites" && (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[
              styles.tabContent,
              { paddingBottom: insets.bottom + 32 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {favoritePhrases.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather
                  name="heart"
                  size={48}
                  color={theme.textSecondary}
                  style={{ opacity: 0.4 }}
                />
                <ThemedText
                  style={[styles.emptyTitle, { color: theme.textSecondary }]}
                >
                  No favorites yet
                </ThemedText>
                <ThemedText
                  style={[styles.emptySubtitle, { color: theme.textSecondary }]}
                >
                  Tap the heart icon on any phrase to save it here
                </ThemedText>
              </View>
            ) : (
              favoritePhrases.map((phrase) => (
                <PhraseRow
                  key={phrase.id}
                  phrase={phrase}
                  sourceLang={sourceLang}
                  isArabicToSource={isArabicToSource}
                  isFavorite={true}
                  onToggleFavorite={() => toggleFavorite(phrase.id)}
                />
              ))
            )}
          </ScrollView>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20 },

  // Header
  header: { marginBottom: 16 },
  headerTitle: { fontSize: 32, fontWeight: "700", marginBottom: 4 },
  headerSubtitle: { fontSize: 16 },

  // Language picker
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  langToggle: {
    flexDirection: "row",
    gap: 4,
    position: "absolute",
    left: 0,
  },
  langChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  langChipText: { fontSize: 13, fontWeight: "700" },
  directionLabel: {
    fontSize: 16,
    fontWeight: "600",
    minWidth: 60,
    textAlign: "center",
  },
  swapButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Tabs
  tabRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: { fontSize: 14, fontWeight: "600" },

  tabContent: { gap: 12 },

  // Search
  searchCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 8 },

  // Category grid
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryCardWrapper: { width: "47%" },
  categoryCard: {
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  categoryLabel: { fontSize: 13, fontWeight: "600", textAlign: "center" },

  // Back button
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  backText: { fontSize: 15, fontWeight: "600" },

  // Phrase card
  phraseCard: { marginBottom: 4 },
  phraseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  phraseSource: { fontSize: 15, flex: 1, marginRight: 8 },
  phraseTargetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  phraseTargetArabic: { fontSize: 24, fontWeight: "600", lineHeight: 36 },
  phraseTargetLatin: { fontSize: 18, fontWeight: "500", lineHeight: 26 },
  transliteration: { fontSize: 14, fontStyle: "italic", marginTop: 6 },

  // Free-form translate
  inputCard: { position: "relative" },
  textInput: {
    fontSize: 18,
    minHeight: 100,
    textAlignVertical: "top",
    paddingTop: 4,
    paddingRight: 32,
  },
  clearButton: { position: "absolute", top: 8, right: 8 },

  translateButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  translateButtonDisabled: { opacity: 0.6 },
  translateButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },

  // Error
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  errorText: { fontSize: 14, fontWeight: "500", flex: 1 },

  // Result
  resultCard: {},
  offlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(46, 204, 113, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  offlineBadgeText: { fontSize: 12, fontWeight: "600", color: "#2ECC71" },
  resultHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  resultTextArabic: { fontSize: 28, fontWeight: "600", lineHeight: 42 },
  resultTextLatin: { fontSize: 20, fontWeight: "500", lineHeight: 30 },

  // Cache info
  cacheInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  cacheInfoText: { fontSize: 13 },

  // Empty state
  emptyText: { fontSize: 15, textAlign: "center", marginTop: 24 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: "600" },
  emptySubtitle: { fontSize: 14, textAlign: "center", maxWidth: 260 },
});
