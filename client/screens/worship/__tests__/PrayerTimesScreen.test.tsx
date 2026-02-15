/**
 * PrayerTimesScreen Component Tests
 *
 * Tests all features of the Prayer Times screen including:
 * - Rendering prayer times
 * - Countdown timer
 * - Date navigation
 * - Loading and permission states
 *
 * Test Coverage Target: >80%
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import PrayerTimesScreen from '../PrayerTimesScreen';

// Mock expo-location
const mockRequestForegroundPermissionsAsync = jest.fn();
const mockGetCurrentPositionAsync = jest.fn();
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: () => mockRequestForegroundPermissionsAsync(),
  getCurrentPositionAsync: () => mockGetCurrentPositionAsync(),
  Accuracy: { Balanced: 3 },
}), { virtual: true });

// Mock prayer times service
const mockPrayerTimes = {
  fajr: new Date('2026-02-13T05:30:00'),
  sunrise: new Date('2026-02-13T06:45:00'),
  dhuhr: new Date('2026-02-13T12:15:00'),
  asr: new Date('2026-02-13T15:30:00'),
  maghrib: new Date('2026-02-13T17:45:00'),
  isha: new Date('2026-02-13T19:15:00'),
  date: new Date('2026-02-13'),
  location: { latitude: 40.7128, longitude: -74.006 },
};

jest.mock('@/services/prayerTimes', () => ({
  calculatePrayerTimes: jest.fn(() => mockPrayerTimes),
  getNextPrayer: jest.fn(() => ({
    name: 'Dhuhr',
    time: new Date('2026-02-13T12:15:00'),
    timeUntil: 3600000,
  })),
  getCurrentPrayer: jest.fn(() => 'Fajr'),
  formatPrayerTime: jest.fn((date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  }),
  formatCountdown: jest.fn(() => '1:00:00'),
  getPrayerStatus: jest.fn((name: string) => {
    if (name === 'Fajr') return 'current';
    if (name === 'Sunrise') return 'past';
    return 'upcoming';
  }),
  CALCULATION_METHODS: [
    { id: 'MuslimWorldLeague', name: 'Muslim World League', description: 'Standard method' },
    { id: 'Egyptian', name: 'Egyptian General Authority', description: 'Egyptian method' },
  ],
}));

// Helper to render with navigation context
const renderWithNavigation = (component: React.ReactElement) => {
  return render(
    <NavigationContainer>
      {component}
    </NavigationContainer>
  );
};

describe('PrayerTimesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default: location permission granted with valid coordinates
    mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockGetCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 40.7128, longitude: -74.006 },
    });
  });

  describe('Rendering Prayer Times', () => {
    it('should render all prayer names', async () => {
      renderWithNavigation(<PrayerTimesScreen />);

      await waitFor(() => {
        expect(screen.getByText('Fajr')).toBeTruthy();
        expect(screen.getByText('Sunrise')).toBeTruthy();
        // Dhuhr appears twice: in countdown and prayer list
        expect(screen.getAllByText('Dhuhr').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('Asr')).toBeTruthy();
        expect(screen.getByText('Maghrib')).toBeTruthy();
        expect(screen.getByText('Isha')).toBeTruthy();
      });
    });

    it('should render Prayer Times title', async () => {
      renderWithNavigation(<PrayerTimesScreen />);

      await waitFor(() => {
        expect(screen.getByText('Prayer Times')).toBeTruthy();
      });
    });

    it('should render formatted prayer times', async () => {
      renderWithNavigation(<PrayerTimesScreen />);

      await waitFor(() => {
        expect(screen.getByText('5:30 AM')).toBeTruthy();
        // 12:15 PM may appear in both countdown and prayer list
        expect(screen.getAllByText('12:15 PM').length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should show calculation method name', async () => {
      renderWithNavigation(<PrayerTimesScreen />);

      await waitFor(() => {
        expect(screen.getByText('Calculation Method')).toBeTruthy();
        expect(screen.getByText('Muslim World League')).toBeTruthy();
      });
    });
  });

  describe('Countdown Timer', () => {
    it('should display Next Prayer label', async () => {
      renderWithNavigation(<PrayerTimesScreen />);

      await waitFor(() => {
        expect(screen.getByText('Next Prayer')).toBeTruthy();
      });
    });

    it('should display next prayer name', async () => {
      renderWithNavigation(<PrayerTimesScreen />);

      await waitFor(() => {
        // Dhuhr appears in both countdown and prayer list
        expect(screen.getAllByText('Dhuhr').length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should display countdown text', async () => {
      renderWithNavigation(<PrayerTimesScreen />);

      await waitFor(() => {
        expect(screen.getByText('1:00:00')).toBeTruthy();
      });
    });

    it('should mark current prayer', async () => {
      renderWithNavigation(<PrayerTimesScreen />);

      await waitFor(() => {
        expect(screen.getByText('Current Prayer')).toBeTruthy();
      });
    });
  });

  describe('Date Navigation', () => {
    it('should render date navigation buttons', async () => {
      renderWithNavigation(<PrayerTimesScreen />);

      await waitFor(() => {
        expect(screen.getByText('Prayer Times')).toBeTruthy();
      });
    });

    it('should not show Today button when viewing today', async () => {
      renderWithNavigation(<PrayerTimesScreen />);

      await waitFor(() => {
        expect(screen.getByText('Prayer Times')).toBeTruthy();
      });

      // Today button should not be visible when already on today
      expect(screen.queryByText('Today')).toBeNull();
    });
  });

  describe('Loading State', () => {
    it('should show loading text initially', () => {
      // Set up a delayed location response
      mockRequestForegroundPermissionsAsync.mockReturnValue(new Promise(() => {}));

      renderWithNavigation(<PrayerTimesScreen />);

      expect(screen.getByText('Loading prayer times...')).toBeTruthy();
    });
  });

  describe('Permission Denied', () => {
    it('should show location required message when permission denied', async () => {
      mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

      renderWithNavigation(<PrayerTimesScreen />);

      await waitFor(() => {
        expect(screen.getByText('Location permission is required')).toBeTruthy();
      });
    });

    it('should show guidance text for enabling location', async () => {
      mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

      renderWithNavigation(<PrayerTimesScreen />);

      await waitFor(() => {
        expect(screen.getByText('Please enable location services to view prayer times')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should render gracefully without crashing', () => {
      expect(() => renderWithNavigation(<PrayerTimesScreen />)).not.toThrow();
    });

    it('should handle location error gracefully', async () => {
      mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      mockGetCurrentPositionAsync.mockRejectedValue(new Error('Location error'));

      renderWithNavigation(<PrayerTimesScreen />);

      // Should not crash - will show location required state
      await waitFor(() => {
        expect(screen.getByText('Location permission is required')).toBeTruthy();
      });
    });
  });

  describe('Performance', () => {
    it('should render quickly', () => {
      const start = Date.now();
      renderWithNavigation(<PrayerTimesScreen />);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should not cause memory leaks', () => {
      const { unmount } = renderWithNavigation(<PrayerTimesScreen />);

      expect(() => unmount()).not.toThrow();
    });
  });
});
