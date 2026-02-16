/**
 * Tests for HifzDashboardScreen
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import HifzDashboardScreen from '../HifzDashboardScreen';
import { useHifzProgress } from '../../../hooks/useHifzProgress';
import { useHifzReviewQueue } from '../../../hooks/useHifzReviewQueue';

// =============================================================================
// MOCKS
// =============================================================================

jest.mock('../../../hooks/useHifzProgress', () => ({
  useHifzProgress: jest.fn(),
}));

jest.mock('../../../hooks/useHifzReviewQueue', () => ({
  useHifzReviewQueue: jest.fn(),
}));

jest.mock('../../../components/JuzProgressMap', () => ({
  JuzProgressMap: ({ onJuzPress }: { onJuzPress?: (juz: number) => void }) => {
    const { View, Text, Pressable } = require('react-native');
    return (
      <View testID="juz-progress-map">
        <Text>JuzProgressMap</Text>
        <Pressable testID="juz-cell-1" onPress={() => onJuzPress?.(1)}>
          <Text>Juz 1</Text>
        </Pressable>
      </View>
    );
  },
}));

jest.mock('../../../components/GlassCard', () => ({
  GlassCard: ({ children, style }: any) => {
    const { View } = require('react-native');
    return <View style={style}>{children}</View>;
  },
}));

jest.mock('../../../components/Screen', () => ({
  Screen: ({ children }: any) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
}));

const mockUseHifzProgress = useHifzProgress as jest.MockedFunction<typeof useHifzProgress>;
const mockUseHifzReviewQueue = useHifzReviewQueue as jest.MockedFunction<typeof useHifzReviewQueue>;

// Mock console.log to spy on navigation calls
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

// Helper to render with navigation context
const renderWithNavigation = (component: React.ReactElement) => {
  return render(<NavigationContainer>{component}</NavigationContainer>);
};

// =============================================================================
// TESTS
// =============================================================================

describe('HifzDashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockClear();

    // Default mock data
    mockUseHifzProgress.mockReturnValue({
      allJuzProgress: [],
      juzProgress: null,
      totalVerses: 0,
      memorizedVerses: 0,
      percentageComplete: 0,
      status: 'not-started',
      overallStats: {
        totalMemorized: 0,
        totalVerses: 6236,
        percentageComplete: 0,
      },
    });

    mockUseHifzReviewQueue.mockReturnValue({
      dueVerses: [],
      dueCount: 0,
      upcomingReviews: {
        today: 0,
        tomorrow: 0,
        thisWeek: 0,
      },
      refreshQueue: jest.fn(),
    });
  });

  // ============================================================
  // Render Tests
  // ============================================================

  it('renders screen title', () => {
    renderWithNavigation(<HifzDashboardScreen />);
    expect(screen.getByText('Hifz')).toBeTruthy();
    expect(screen.getByText('Quran Memorization')).toBeTruthy();
  });

  it('shows JuzProgressMap component', () => {
    renderWithNavigation(<HifzDashboardScreen />);
    expect(screen.getByTestId('juz-progress-map')).toBeTruthy();
  });

  it('displays overall stats with memorized count', () => {
    mockUseHifzProgress.mockReturnValue({
      allJuzProgress: [],
      juzProgress: null,
      totalVerses: 0,
      memorizedVerses: 0,
      percentageComplete: 0,
      status: 'not-started',
      overallStats: {
        totalMemorized: 150,
        totalVerses: 6236,
        percentageComplete: 2.4,
      },
    });

    renderWithNavigation(<HifzDashboardScreen />);
    expect(screen.getByText(/150.*6236/)).toBeTruthy();
    expect(screen.getByText(/2\.4%/)).toBeTruthy();
  });

  it('displays overall stats with percentage complete', () => {
    mockUseHifzProgress.mockReturnValue({
      allJuzProgress: [],
      juzProgress: null,
      totalVerses: 0,
      memorizedVerses: 0,
      percentageComplete: 0,
      status: 'not-started',
      overallStats: {
        totalMemorized: 3118,
        totalVerses: 6236,
        percentageComplete: 50,
      },
    });

    renderWithNavigation(<HifzDashboardScreen />);
    expect(screen.getByText(/50%/)).toBeTruthy();
  });

  // ============================================================
  // Review Queue Tests
  // ============================================================

  it('shows review queue when verses are due', () => {
    mockUseHifzReviewQueue.mockReturnValue({
      dueVerses: [
        {
          surahNumber: 1,
          verseNumber: 1,
          memorizedAt: '2024-01-01',
          lastReviewedAt: '2024-01-02',
          nextReviewDate: '2024-01-03',
          fsrsState: {
            difficulty: 0.5,
            stability: 2,
            reviewCount: 3,
            state: 'review',
          },
          mistakeCount: 0,
          lastMistakes: [],
        },
        {
          surahNumber: 2,
          verseNumber: 5,
          memorizedAt: '2024-01-01',
          lastReviewedAt: '2024-01-02',
          nextReviewDate: '2024-01-03',
          fsrsState: {
            difficulty: 0.5,
            stability: 2,
            reviewCount: 3,
            state: 'review',
          },
          mistakeCount: 0,
          lastMistakes: [],
        },
      ],
      dueCount: 2,
      upcomingReviews: {
        today: 2,
        tomorrow: 0,
        thisWeek: 0,
      },
      refreshQueue: jest.fn(),
    });

    renderWithNavigation(<HifzDashboardScreen />);
    expect(screen.getByText(/Reviews Due Today/i)).toBeTruthy();
    expect(screen.getByText(/2.*verse/i)).toBeTruthy();
  });

  it('hides review section when no verses due', () => {
    mockUseHifzReviewQueue.mockReturnValue({
      dueVerses: [],
      dueCount: 0,
      upcomingReviews: {
        today: 0,
        tomorrow: 0,
        thisWeek: 0,
      },
      refreshQueue: jest.fn(),
    });

    renderWithNavigation(<HifzDashboardScreen />);
    expect(screen.queryByText(/Reviews Due Today/i)).toBeFalsy();
  });

  it('shows "no reviews due" message when dueCount is 0', () => {
    mockUseHifzReviewQueue.mockReturnValue({
      dueVerses: [],
      dueCount: 0,
      upcomingReviews: {
        today: 0,
        tomorrow: 0,
        thisWeek: 0,
      },
      refreshQueue: jest.fn(),
    });

    renderWithNavigation(<HifzDashboardScreen />);
    expect(screen.getByText(/No reviews due today/i)).toBeTruthy();
  });

  // ============================================================
  // Navigation Tests
  // ============================================================

  it('calls navigation handler when "Start Memorizing" is pressed', () => {
    renderWithNavigation(<HifzDashboardScreen />);
    const button = screen.getByText('Start Memorizing');
    fireEvent.press(button);
    expect(consoleLogSpy).toHaveBeenCalledWith('Navigate to /hifz/memorize');
  });

  it('calls navigation handler when juz cell is pressed', () => {
    renderWithNavigation(<HifzDashboardScreen />);
    const juzCell = screen.getByTestId('juz-cell-1');
    fireEvent.press(juzCell);
    expect(consoleLogSpy).toHaveBeenCalledWith('Navigate to /hifz/juz/1');
  });

  it('calls navigation handler when "Review Now" is pressed', () => {
    mockUseHifzReviewQueue.mockReturnValue({
      dueVerses: [
        {
          surahNumber: 1,
          verseNumber: 1,
          memorizedAt: '2024-01-01',
          lastReviewedAt: '2024-01-02',
          nextReviewDate: '2024-01-03',
          fsrsState: {
            difficulty: 0.5,
            stability: 2,
            reviewCount: 3,
            state: 'review',
          },
          mistakeCount: 0,
          lastMistakes: [],
        },
      ],
      dueCount: 1,
      upcomingReviews: {
        today: 1,
        tomorrow: 0,
        thisWeek: 0,
      },
      refreshQueue: jest.fn(),
    });

    renderWithNavigation(<HifzDashboardScreen />);
    const button = screen.getByText('Review Now');
    fireEvent.press(button);
    expect(consoleLogSpy).toHaveBeenCalledWith('Navigate to /hifz/review');
  });

  // ============================================================
  // Empty State Tests
  // ============================================================

  it('shows empty state when no verses memorized', () => {
    mockUseHifzProgress.mockReturnValue({
      allJuzProgress: [],
      juzProgress: null,
      totalVerses: 0,
      memorizedVerses: 0,
      percentageComplete: 0,
      status: 'not-started',
      overallStats: {
        totalMemorized: 0,
        totalVerses: 6236,
        percentageComplete: 0,
      },
    });

    renderWithNavigation(<HifzDashboardScreen />);
    expect(screen.getByText(/Begin your Quran memorization journey/i)).toBeTruthy();
  });

  // ============================================================
  // Upcoming Reviews Tests
  // ============================================================

  it('displays upcoming reviews (today, tomorrow, this week)', () => {
    mockUseHifzReviewQueue.mockReturnValue({
      dueVerses: [],
      dueCount: 0,
      upcomingReviews: {
        today: 5,
        tomorrow: 3,
        thisWeek: 10,
      },
      refreshQueue: jest.fn(),
    });

    renderWithNavigation(<HifzDashboardScreen />);
    expect(screen.getByText(/today/i)).toBeTruthy();
    expect(screen.getByText(/tomorrow/i)).toBeTruthy();
    expect(screen.getByText(/this week/i)).toBeTruthy();
  });
});
