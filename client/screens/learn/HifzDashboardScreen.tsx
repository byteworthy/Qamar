/**
 * HifzDashboardScreen
 *
 * Main entry point for the Hifz (Quran memorization) feature.
 * Shows:
 * - Overall progress stats
 * - 30-juz progress map
 * - Review queue (due verses)
 * - Upcoming reviews
 * - Action buttons
 */

import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { Screen } from '../../components/Screen';
import { GlassCard } from '../../components/GlassCard';
import { JuzProgressMap } from '../../components/JuzProgressMap';
import { useHifzProgress } from '../../hooks/useHifzProgress';
import { useHifzReviewQueue } from '../../hooks/useHifzReviewQueue';
import { useTheme } from '../../hooks/useTheme';
import { NoorColors } from '../../constants/theme/colors';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function HifzDashboardScreen() {
  const { theme } = useTheme();
  const { overallStats } = useHifzProgress();
  const { dueVerses, dueCount, upcomingReviews } = useHifzReviewQueue();

  const hasMemorizedVerses = overallStats.totalMemorized > 0;

  // Placeholder navigation handlers (will be replaced with actual navigation)
  const handleStartMemorizing = () => {
    // TODO: Navigate to /hifz/memorize when screen is implemented
    console.log('Navigate to /hifz/memorize');
  };

  const handleReviewNow = () => {
    // TODO: Navigate to /hifz/review when screen is implemented
    console.log('Navigate to /hifz/review');
  };

  const handleJuzPress = (juz: number) => {
    // TODO: Navigate to /hifz/juz/:juz when screen is implemented
    console.log(`Navigate to /hifz/juz/${juz}`);
  };

  return (
    <Screen title="Hifz" scrollable={true}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ThemedText style={styles.title}>Hifz</ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          Quran Memorization
        </ThemedText>

        {/* Empty State */}
        {!hasMemorizedVerses && (
          <GlassCard style={styles.emptyStateCard}>
            <ThemedText style={styles.emptyStateTitle}>
              Begin your Quran memorization journey
            </ThemedText>
            <ThemedText style={[styles.emptyStateText, { color: theme.textSecondary }]}>
              Start with Juz 30 (short surahs), Al-Fatiha, or any verse that calls to you.
            </ThemedText>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: NoorColors.gold }]}
              onPress={handleStartMemorizing}
            >
              <ThemedText style={styles.buttonText}>Get Started</ThemedText>
            </Pressable>
          </GlassCard>
        )}

        {/* Overall Stats Card */}
        {hasMemorizedVerses && (
          <GlassCard style={styles.statsCard}>
            <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              Total Progress
            </ThemedText>
            <ThemedText style={styles.statsMainText}>
              {overallStats.totalMemorized} / {overallStats.totalVerses} verses
            </ThemedText>
            <ThemedText style={[styles.statsPercentage, { color: NoorColors.gold }]}>
              {overallStats.percentageComplete.toFixed(1)}% complete
            </ThemedText>

            {/* Progress Bar */}
            <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(overallStats.percentageComplete, 100)}%`,
                    backgroundColor: NoorColors.gold,
                  },
                ]}
              />
            </View>
          </GlassCard>
        )}

        {/* Juz Progress Map */}
        {hasMemorizedVerses && (
          <GlassCard style={styles.juzMapCard}>
            <ThemedText style={styles.sectionTitle}>Your Progress</ThemedText>
            <ThemedText style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              30 Juz Overview
            </ThemedText>
            <JuzProgressMap onJuzPress={handleJuzPress} />
          </GlassCard>
        )}

        {/* Review Queue Section */}
        {dueCount > 0 && (
          <GlassCard style={styles.reviewCard}>
            <ThemedText style={styles.sectionTitle}>Reviews Due Today</ThemedText>
            <View style={[styles.badge, { backgroundColor: 'rgba(212, 175, 55, 0.2)' }]}>
              <ThemedText style={[styles.badgeText, { color: NoorColors.gold }]}>
                {dueCount} {dueCount === 1 ? 'verse' : 'verses'}
              </ThemedText>
            </View>

            {/* List first 3-5 due verses */}
            <View style={styles.verseList}>
              {dueVerses.slice(0, 5).map((verse, index) => (
                <View key={`${verse.surahNumber}:${verse.verseNumber}`} style={styles.verseItem}>
                  <ThemedText style={styles.verseText}>
                    Surah {verse.surahNumber}:{verse.verseNumber}
                  </ThemedText>
                </View>
              ))}
            </View>

            {/* Review Now Button */}
            <Pressable
              style={[styles.primaryButton, { backgroundColor: NoorColors.gold }]}
              onPress={handleReviewNow}
            >
              <ThemedText style={styles.buttonText}>Review Now</ThemedText>
            </Pressable>
          </GlassCard>
        )}

        {/* No Reviews Due Message */}
        {dueCount === 0 && hasMemorizedVerses && (
          <GlassCard style={styles.noReviewCard}>
            <ThemedText style={[styles.noReviewText, { color: theme.textSecondary }]}>
              Great job! No reviews due today.
            </ThemedText>
          </GlassCard>
        )}

        {/* Upcoming Reviews */}
        {hasMemorizedVerses && (
          <GlassCard style={styles.upcomingCard}>
            <ThemedText style={styles.sectionTitle}>Upcoming Reviews</ThemedText>
            <View style={styles.upcomingList}>
              <View style={styles.upcomingItem}>
                <ThemedText style={styles.upcomingLabel}>Today:</ThemedText>
                <ThemedText style={[styles.upcomingCount, { color: NoorColors.gold }]}>
                  {upcomingReviews.today} reviews
                </ThemedText>
              </View>
              <View style={styles.upcomingItem}>
                <ThemedText style={styles.upcomingLabel}>Tomorrow:</ThemedText>
                <ThemedText style={[styles.upcomingCount, { color: NoorColors.gold }]}>
                  {upcomingReviews.tomorrow} reviews
                </ThemedText>
              </View>
              <View style={styles.upcomingItem}>
                <ThemedText style={styles.upcomingLabel}>This Week:</ThemedText>
                <ThemedText style={[styles.upcomingCount, { color: NoorColors.gold }]}>
                  {upcomingReviews.thisWeek} reviews
                </ThemedText>
              </View>
            </View>
          </GlassCard>
        )}

        {/* Action Buttons */}
        {hasMemorizedVerses && (
          <View style={styles.actionButtons}>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: NoorColors.gold }]}
              onPress={handleStartMemorizing}
            >
              <ThemedText style={styles.buttonText}>Start Memorizing</ThemedText>
            </Pressable>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 24,
  },

  // Stats Card
  statsCard: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  statsMainText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statsPercentage: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Juz Map Card
  juzMapCard: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },

  // Review Card
  reviewCard: {
    marginBottom: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  verseList: {
    marginBottom: 16,
  },
  verseItem: {
    paddingVertical: 8,
  },
  verseText: {
    fontSize: 16,
  },

  // No Review Card
  noReviewCard: {
    marginBottom: 20,
    alignItems: 'center',
  },
  noReviewText: {
    fontSize: 16,
    textAlign: 'center',
  },

  // Upcoming Reviews
  upcomingCard: {
    marginBottom: 20,
  },
  upcomingList: {
    marginTop: 12,
  },
  upcomingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  upcomingLabel: {
    fontSize: 16,
  },
  upcomingCount: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Buttons
  actionButtons: {
    marginBottom: 20,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },

  // Empty State
  emptyStateCard: {
    marginBottom: 20,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },

  bottomSpacer: {
    height: 40,
  },
});
