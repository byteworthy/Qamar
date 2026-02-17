/**
 * DuaFinderScreen
 *
 * Provides personalized dua recommendations based on user's situation or category.
 * Features category chips for quick access and a search input for custom situations.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';

import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { DuaCard } from '@/components/DuaCard';
import { useTheme } from '@/hooks/useTheme';
import { useDuaRecommender } from '@/hooks/useDuaRecommender';
import { useDuaFavorites } from '@/stores/dua-favorites-store';
import { NoorColors } from '@/constants/theme/colors';
import { hapticLight } from '@/lib/haptics';

// =============================================================================
// CONSTANTS
// =============================================================================

const CATEGORY_CHIPS = [
  { label: 'Anxiety', icon: 'heart' as const },
  { label: 'Gratitude', icon: 'gift' as const },
  { label: 'Travel', icon: 'navigation' as const },
  { label: 'Before Eating', icon: 'coffee' as const },
  { label: 'Morning', icon: 'sunrise' as const },
  { label: 'Evening', icon: 'sunset' as const },
];

// =============================================================================
// MAIN SCREEN
// =============================================================================

export default function DuaFinderScreen() {
  const { theme } = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  const [inputText, setInputText] = useState('');

  const { recommend, isLoading, error, duas, remainingQuota } = useDuaRecommender();
  const { addFavorite, removeFavorite, isFavorite } = useDuaFavorites();

  // Scroll to top when results change
  useEffect(() => {
    if (duas.length > 0) {
      setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 100);
    }
  }, [duas.length]);

  const handleSearch = async () => {
    if (!inputText.trim() || isLoading) return;

    hapticLight();
    Keyboard.dismiss();
    await recommend(inputText.trim());
  };

  const handleCategoryPress = async (category: string) => {
    if (isLoading) return;

    hapticLight();
    setInputText(category);
    await recommend(category);
  };

  const handleToggleFavorite = (dua: typeof duas[0]) => {
    const duaId = `${dua.arabic}-${dua.source}`;

    if (isFavorite(duaId)) {
      removeFavorite(duaId);
    } else {
      addFavorite({
        arabic: dua.arabic,
        transliteration: dua.transliteration,
        translation: dua.translation,
        source: dua.source,
      });
    }
  };

  const isEmpty = duas.length === 0 && !error;

  return (
    <Screen title="Dua Finder" showBack scrollable={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        {/* Input Section */}
        <View style={styles.inputSection}>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
              },
            ]}
          >
            <TextInput
              style={[styles.textInput, { color: theme.text }]}
              placeholder="Describe your situation or need..."
              placeholderTextColor={theme.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isLoading}
              returnKeyType="default"
              blurOnSubmit={false}
              accessibilityLabel="Situation input"
              accessibilityHint="Describe what you need a dua for"
            />
            <Pressable
              onPress={handleSearch}
              disabled={!inputText.trim() || isLoading}
              style={({ pressed }) => [
                styles.searchButton,
                {
                  backgroundColor:
                    inputText.trim() && !isLoading
                      ? NoorColors.gold
                      : theme.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Search for duas"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={NoorColors.background} />
              ) : (
                <Feather
                  name="search"
                  size={20}
                  color={inputText.trim() ? NoorColors.background : theme.textSecondary}
                />
              )}
            </Pressable>
          </View>

          {/* Quota Badge */}
          {remainingQuota !== null && (
            <Animated.View entering={FadeIn.duration(200)}>
              <View
                style={[
                  styles.quotaBadge,
                  {
                    backgroundColor: theme.glassSurface,
                    borderColor: theme.glassStroke,
                  },
                ]}
              >
                <Feather name="zap" size={12} color={NoorColors.gold} />
                <ThemedText style={[styles.quotaText, { color: theme.textSecondary }]}>
                  {remainingQuota} searches remaining today
                </ThemedText>
              </View>
            </Animated.View>
          )}
        </View>

        {/* Results Section */}
        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            isEmpty && styles.scrollContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {isEmpty ? (
            // Empty State with Category Chips
            <View style={styles.emptyState}>
              <Animated.View entering={FadeIn.duration(400)} style={styles.emptyHeader}>
                <View style={[styles.emptyIcon, { backgroundColor: NoorColors.gold + '15' }]}>
                  <Feather name="compass" size={32} color={NoorColors.gold} />
                </View>
                <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
                  Find the Perfect Dua
                </ThemedText>
                <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  Search by situation or choose a category below to discover relevant supplications.
                </ThemedText>
              </Animated.View>

              <View style={styles.categoryGrid}>
                {CATEGORY_CHIPS.map((chip, index) => (
                  <Animated.View
                    key={chip.label}
                    entering={FadeInUp.duration(300).delay(150 + index * 80)}
                  >
                    <Pressable
                      onPress={() => handleCategoryPress(chip.label)}
                      disabled={isLoading}
                      style={({ pressed }) => [
                        styles.categoryChip,
                        {
                          backgroundColor: theme.glassSurface,
                          borderColor: NoorColors.gold + '40',
                          opacity: pressed ? 0.8 : 1,
                          transform: [{ scale: pressed ? 0.97 : 1 }],
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Search for ${chip.label} duas`}
                    >
                      <Feather
                        name={chip.icon}
                        size={18}
                        color={NoorColors.gold}
                        style={styles.categoryIcon}
                      />
                      <ThemedText style={[styles.categoryLabel, { color: theme.text }]}>
                        {chip.label}
                      </ThemedText>
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            </View>
          ) : (
            // Results Display
            <View style={styles.resultsContainer}>
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={NoorColors.gold} />
                  <ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>
                    Finding duas for you...
                  </ThemedText>
                </View>
              )}

              {error && !isLoading && (
                <Animated.View entering={FadeIn.duration(300)}>
                  <View
                    style={[
                      styles.errorCard,
                      {
                        backgroundColor: theme.glassSurface,
                        borderColor: '#EF4444' + '40',
                      },
                    ]}
                  >
                    <Feather name="alert-circle" size={20} color="#EF4444" />
                    <View style={styles.errorTextContainer}>
                      <ThemedText style={styles.errorTitle}>
                        Unable to Find Duas
                      </ThemedText>
                      <ThemedText style={[styles.errorMessage, { color: theme.textSecondary }]}>
                        {error}
                      </ThemedText>
                    </View>
                  </View>
                </Animated.View>
              )}

              {!isLoading && !error && duas.length > 0 && (
                <>
                  <Animated.View entering={FadeIn.duration(300)}>
                    <ThemedText style={[styles.resultsHeader, { color: theme.textSecondary }]}>
                      Found {duas.length} {duas.length === 1 ? 'dua' : 'duas'} for you
                    </ThemedText>
                  </Animated.View>

                  {duas.map((dua, index) => {
                    const duaId = `${dua.arabic}-${dua.source}`;
                    return (
                      <Animated.View
                        key={`${duaId}-${index}`}
                        entering={FadeInUp.duration(300).delay(index * 100)}
                      >
                        <View style={styles.duaCardWrapper}>
                          <DuaCard
                            arabic={dua.arabic}
                            transliteration={dua.transliteration}
                            translation={dua.translation}
                            source={dua.source}
                            isFavorite={isFavorite(duaId)}
                            onToggleFavorite={() => handleToggleFavorite(dua)}
                          />
                        </View>
                      </Animated.View>
                    );
                  })}
                </>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Input Section
  inputSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 20,
    borderWidth: 1,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 8,
    minHeight: 56,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    maxHeight: 100,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  quotaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  quotaText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  scrollContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  emptyHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },

  // Category Chips
  categoryGrid: {
    width: '100%',
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  categoryIcon: {
    flexShrink: 0,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },

  // Results
  resultsContainer: {
    gap: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  errorTextContainer: {
    flex: 1,
    gap: 4,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
  errorMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  resultsHeader: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  duaCardWrapper: {
    marginBottom: 4,
  },
});
