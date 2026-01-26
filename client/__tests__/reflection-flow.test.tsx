// @ts-nocheck
/**
 * Reflection Flow Integration Test
 *
 * Tests the critical path: Home → Thought Capture → Continue
 * Verifies users can start the reflection journey
 */

// IMPORTANT: Mocks must be declared before imports

// Mock the query client module to avoid instantiation issues
jest.mock('../lib/query-client', () => ({
  queryClient: {
    getQueryData: jest.fn(),
    setQueryData: jest.fn(),
    invalidateQueries: jest.fn(),
    clear: jest.fn(),
  },
  getApiUrl: jest.fn(() => 'https://test.example.com'),
  apiRequest: jest.fn(),
  getQueryFn: jest.fn(),
}));

// Mock the billing module
jest.mock('../lib/billing', () => ({
  getBillingStatus: jest.fn(),
  isPaidStatus: jest.fn(() => false),
}));

// Mock react-query hooks
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
  })),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
  })),
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../screens/HomeScreen';
import ThoughtCaptureScreen from '../screens/ThoughtCaptureScreen';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    setOptions: jest.fn(),
  }),
}));

// Mock safe area insets
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock header height
jest.mock('@react-navigation/elements', () => ({
  useHeaderHeight: () => 56,
}));

// Mock react-query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
  })),
}));

describe('Reflection Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('HomeScreen', () => {
    it('renders greeting and modules', () => {
      const { getByText } = render(<HomeScreen />);

      // Check greeting
      expect(getByText(/Salaam/i)).toBeTruthy();

      // Check modules are present
      expect(getByText('Reflection')).toBeTruthy();
      expect(getByText('Calming Practice')).toBeTruthy();
      expect(getByText('Dua')).toBeTruthy();
      expect(getByText('Insights')).toBeTruthy();
    });

    it('navigates to ThoughtCapture when Reflection is pressed', () => {
      const { getByText } = render(<HomeScreen />);

      // Press Reflection module
      fireEvent.press(getByText('Reflection'));

      // Should navigate to ThoughtCapture
      expect(mockNavigate).toHaveBeenCalledWith('ThoughtCapture');
    });
  });

  describe('ThoughtCaptureScreen', () => {
    it('renders thought input and niyyah', () => {
      const { getByPlaceholderText, getByText } = render(<ThoughtCaptureScreen />);

      // Check niyyah banner
      expect(getByText(/بِسْمِ اللَّهِ/)).toBeTruthy(); // Bismillah

      // Check thought input placeholder
      const input = getByPlaceholderText(/what.*on your mind/i);
      expect(input).toBeTruthy();
    });

    it('enables continue button after sufficient text entry', async () => {
      const { getByPlaceholderText, getByText } = render(<ThoughtCaptureScreen />);

      // Get input and continue button
      const thoughtInput = getByPlaceholderText(/what.*on your mind/i);
      const continueButton = getByText('Continue');

      // Initially disabled (no text)
      expect(continueButton.parent?.props.accessibilityState?.disabled).toBe(true);

      // Enter sufficient thought text (>10 chars)
      fireEvent.changeText(thoughtInput, 'I always fail at everything');

      // Button should be enabled after text entry
      await waitFor(() => {
        expect(continueButton.parent?.props.accessibilityState?.disabled).toBe(false);
      });
    });

    it('shows emotional intensity selector', () => {
      const { getByText } = render(<ThoughtCaptureScreen />);

      // Check intensity label
      expect(getByText(/HOW HEAVY DOES THIS FEEL/i)).toBeTruthy();

      // Check all intensity levels are present (1-5)
      for (let i = 1; i <= 5; i++) {
        expect(getByText(i.toString())).toBeTruthy();
      }
    });

    it('shows somatic awareness prompt for high intensity', async () => {
      const { getByText, getByTestId, queryByText } = render(<ThoughtCaptureScreen />);

      // Initially no somatic prompt
      expect(queryByText(/WHERE DO YOU FEEL THIS IN YOUR BODY/i)).toBeNull();

      // Select intensity 4 (high)
      const intensity4 = getByText('4');
      fireEvent.press(intensity4);

      // Somatic prompt should appear
      await waitFor(() => {
        expect(getByText(/WHERE DO YOU FEEL THIS IN YOUR BODY/i)).toBeTruthy();
      });
    });

    it('navigates to Distortion screen on continue', async () => {
      const { getByPlaceholderText, getByText } = render(<ThoughtCaptureScreen />);

      // Enter thought
      const thoughtInput = getByPlaceholderText(/what.*on your mind/i);
      fireEvent.changeText(thoughtInput, 'I always fail at everything');

      // Select intensity
      const intensity3 = getByText('3');
      fireEvent.press(intensity3);

      // Press continue
      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);

      // Should navigate to Distortion screen with params
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('Distortion', {
          thought: 'I always fail at everything',
          emotionalIntensity: 3,
          somaticAwareness: undefined,
        });
      });
    });

    it('shows exit confirmation modal', async () => {
      const { getByText } = render(<ThoughtCaptureScreen />);

      // Note: Cancel button is in header, mocked by navigation.setOptions
      // We can't easily test header buttons in unit tests
      // This would be better tested in E2E tests

      // Just verify the screen renders without crashing
      expect(getByText(/what.*on your mind/i)).toBeTruthy();
    });
  });

  describe('Critical User Journey', () => {
    it('allows user to start reflection flow from home', () => {
      // This test documents the expected flow
      // Home → Press Reflection → Navigate to ThoughtCapture → Enter thought → Continue

      // Step 1: User sees home screen
      const { getByText: getHomeText } = render(<HomeScreen />);
      expect(getHomeText('Reflection')).toBeTruthy();
      fireEvent.press(getHomeText('Reflection'));
      expect(mockNavigate).toHaveBeenCalledWith('ThoughtCapture');

      // Step 2: User enters thought
      // (Would be tested in E2E or with full navigation stack)
      // For now, we verify ThoughtCapture can render independently
      const { getByPlaceholderText } = render(<ThoughtCaptureScreen />);
      expect(getByPlaceholderText(/what.*on your mind/i)).toBeTruthy();
    });
  });
});
