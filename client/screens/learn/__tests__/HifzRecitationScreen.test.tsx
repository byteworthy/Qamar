/**
 * Tests for HifzRecitationScreen
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import HifzRecitationScreen from '../HifzRecitationScreen';
import { useHifzRecitation } from '../../../hooks/useHifzRecitation';
import { useRoute, useNavigation } from '@react-navigation/native';

// =============================================================================
// MOCKS
// =============================================================================

jest.mock('@react-navigation/native', () => ({
  useRoute: jest.fn(),
  useNavigation: jest.fn(),
}));

jest.mock('../../../hooks/useHifzRecitation', () => ({
  useHifzRecitation: jest.fn(),
}));

jest.mock('../../../components/HifzMistakeFeedback', () => ({
  HifzMistakeFeedback: ({ result }: { result: any }) => {
    const { View, Text } = require('react-native');
    return (
      <View testID="hifz-mistake-feedback">
        <Text>Feedback: {result ? 'Has result' : 'No result'}</Text>
      </View>
    );
  },
}));

jest.mock('../../../components/HifzPeekOverlay', () => ({
  HifzPeekOverlay: ({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) => {
    const { Modal, View, Text, Pressable } = require('react-native');
    if (!visible) return null;
    return (
      <Modal visible={visible} testID="hifz-peek-overlay">
        <View>
          <Text>Peek Overlay</Text>
          <Pressable testID="peek-dismiss" onPress={onDismiss}>
            <Text>Dismiss</Text>
          </Pressable>
        </View>
      </Modal>
    );
  },
}));

const mockNavigation = {
  goBack: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
};

const mockUseRoute = useRoute as jest.MockedFunction<typeof useRoute>;
const mockUseNavigation = useNavigation as jest.MockedFunction<typeof useNavigation>;
const mockUseHifzRecitation = useHifzRecitation as jest.MockedFunction<typeof useHifzRecitation>;

// =============================================================================
// TESTS
// =============================================================================

describe('HifzRecitationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigation.mockReturnValue(mockNavigation as any);

    // Default route params
    mockUseRoute.mockReturnValue({
      params: {
        surahNumber: '1',
        verseNumber: '1',
        mode: 'review',
      },
    } as any);

    // Default hook return value
    mockUseHifzRecitation.mockReturnValue({
      isRecording: false,
      isProcessing: false,
      transcription: null,
      result: null,
      error: null,
      startRecitation: jest.fn(),
      stopRecitation: jest.fn(),
      rateAndSave: jest.fn(),
      reset: jest.fn(),
    });
  });

  // ============================================================
  // Render Tests
  // ============================================================

  it('renders verse reference from route params', () => {
    render(<HifzRecitationScreen />);
    expect(screen.getByText(/Surah 1:1/i)).toBeTruthy();
  });

  it('displays mode indicator for review', () => {
    render(<HifzRecitationScreen />);
    expect(screen.getByText(/Review/i)).toBeTruthy();
  });

  it('displays mode indicator for new memorization', () => {
    mockUseRoute.mockReturnValue({
      params: {
        surahNumber: '2',
        verseNumber: '5',
        mode: 'memorize',
      },
    } as any);

    render(<HifzRecitationScreen />);
    expect(screen.getByText(/New Memorization/i)).toBeTruthy();
  });

  it('shows hidden verse notice', () => {
    render(<HifzRecitationScreen />);
    expect(screen.getByText(/Verse hidden/i)).toBeTruthy();
  });

  // ============================================================
  // Record Button Tests
  // ============================================================

  it('shows record button in initial state', () => {
    render(<HifzRecitationScreen />);
    expect(screen.getByTestId('record-button')).toBeTruthy();
  });

  it('calls startRecitation when record button pressed', () => {
    const mockStartRecitation = jest.fn();
    mockUseHifzRecitation.mockReturnValue({
      isRecording: false,
      isProcessing: false,
      transcription: null,
      result: null,
      error: null,
      startRecitation: mockStartRecitation,
      stopRecitation: jest.fn(),
      rateAndSave: jest.fn(),
      reset: jest.fn(),
    });

    render(<HifzRecitationScreen />);
    fireEvent.press(screen.getByTestId('record-button'));
    expect(mockStartRecitation).toHaveBeenCalledTimes(1);
  });

  it('calls stopRecitation when record button pressed while recording', () => {
    const mockStopRecitation = jest.fn();
    mockUseHifzRecitation.mockReturnValue({
      isRecording: true,
      isProcessing: false,
      transcription: null,
      result: null,
      error: null,
      startRecitation: jest.fn(),
      stopRecitation: mockStopRecitation,
      rateAndSave: jest.fn(),
      reset: jest.fn(),
    });

    render(<HifzRecitationScreen />);
    fireEvent.press(screen.getByTestId('record-button'));
    expect(mockStopRecitation).toHaveBeenCalledTimes(1);
  });

  it('shows processing state after stopRecitation', () => {
    mockUseHifzRecitation.mockReturnValue({
      isRecording: false,
      isProcessing: true,
      transcription: null,
      result: null,
      error: null,
      startRecitation: jest.fn(),
      stopRecitation: jest.fn(),
      rateAndSave: jest.fn(),
      reset: jest.fn(),
    });

    render(<HifzRecitationScreen />);
    expect(screen.getByText(/Processing/i)).toBeTruthy();
  });

  // ============================================================
  // Feedback Display Tests
  // ============================================================

  it('displays HifzMistakeFeedback when result available', () => {
    mockUseHifzRecitation.mockReturnValue({
      isRecording: false,
      isProcessing: false,
      transcription: 'test transcription',
      result: {
        verseKey: '1:1',
        surahNumber: 1,
        verseNumber: 1,
        expectedText: 'test',
        transcribedText: 'test',
        score: 100,
        accuracy: 1.0,
        wordResults: [],
      },
      error: null,
      startRecitation: jest.fn(),
      stopRecitation: jest.fn(),
      rateAndSave: jest.fn(),
      reset: jest.fn(),
    });

    render(<HifzRecitationScreen />);
    expect(screen.getByTestId('hifz-mistake-feedback')).toBeTruthy();
  });

  // ============================================================
  // Rating Buttons Tests
  // ============================================================

  it('shows rating buttons after feedback', () => {
    mockUseHifzRecitation.mockReturnValue({
      isRecording: false,
      isProcessing: false,
      transcription: 'test',
      result: {
        verseKey: '1:1',
        surahNumber: 1,
        verseNumber: 1,
        expectedText: 'test',
        transcribedText: 'test',
        score: 100,
        accuracy: 1.0,
        wordResults: [],
      },
      error: null,
      startRecitation: jest.fn(),
      stopRecitation: jest.fn(),
      rateAndSave: jest.fn(),
      reset: jest.fn(),
    });

    render(<HifzRecitationScreen />);
    expect(screen.getByTestId('rating-again')).toBeTruthy();
    expect(screen.getByTestId('rating-hard')).toBeTruthy();
    expect(screen.getByTestId('rating-good')).toBeTruthy();
    expect(screen.getByTestId('rating-easy')).toBeTruthy();
  });

  it('calls rateAndSave with correct rating when Again pressed', () => {
    const mockRateAndSave = jest.fn();
    mockUseHifzRecitation.mockReturnValue({
      isRecording: false,
      isProcessing: false,
      transcription: 'test',
      result: {
        verseKey: '1:1',
        surahNumber: 1,
        verseNumber: 1,
        expectedText: 'test',
        transcribedText: 'test',
        score: 100,
        accuracy: 1.0,
        wordResults: [],
      },
      error: null,
      startRecitation: jest.fn(),
      stopRecitation: jest.fn(),
      rateAndSave: mockRateAndSave,
      reset: jest.fn(),
    });

    render(<HifzRecitationScreen />);
    fireEvent.press(screen.getByTestId('rating-again'));
    expect(mockRateAndSave).toHaveBeenCalledWith('again');
  });

  it('calls rateAndSave with correct rating when Hard pressed', () => {
    const mockRateAndSave = jest.fn();
    mockUseHifzRecitation.mockReturnValue({
      isRecording: false,
      isProcessing: false,
      transcription: 'test',
      result: {
        verseKey: '1:1',
        surahNumber: 1,
        verseNumber: 1,
        expectedText: 'test',
        transcribedText: 'test',
        score: 100,
        accuracy: 1.0,
        wordResults: [],
      },
      error: null,
      startRecitation: jest.fn(),
      stopRecitation: jest.fn(),
      rateAndSave: mockRateAndSave,
      reset: jest.fn(),
    });

    render(<HifzRecitationScreen />);
    fireEvent.press(screen.getByTestId('rating-hard'));
    expect(mockRateAndSave).toHaveBeenCalledWith('hard');
  });

  it('calls rateAndSave with correct rating when Good pressed', () => {
    const mockRateAndSave = jest.fn();
    mockUseHifzRecitation.mockReturnValue({
      isRecording: false,
      isProcessing: false,
      transcription: 'test',
      result: {
        verseKey: '1:1',
        surahNumber: 1,
        verseNumber: 1,
        expectedText: 'test',
        transcribedText: 'test',
        score: 100,
        accuracy: 1.0,
        wordResults: [],
      },
      error: null,
      startRecitation: jest.fn(),
      stopRecitation: jest.fn(),
      rateAndSave: mockRateAndSave,
      reset: jest.fn(),
    });

    render(<HifzRecitationScreen />);
    fireEvent.press(screen.getByTestId('rating-good'));
    expect(mockRateAndSave).toHaveBeenCalledWith('good');
  });

  it('calls rateAndSave with correct rating when Easy pressed', () => {
    const mockRateAndSave = jest.fn();
    mockUseHifzRecitation.mockReturnValue({
      isRecording: false,
      isProcessing: false,
      transcription: 'test',
      result: {
        verseKey: '1:1',
        surahNumber: 1,
        verseNumber: 1,
        expectedText: 'test',
        transcribedText: 'test',
        score: 100,
        accuracy: 1.0,
        wordResults: [],
      },
      error: null,
      startRecitation: jest.fn(),
      stopRecitation: jest.fn(),
      rateAndSave: mockRateAndSave,
      reset: jest.fn(),
    });

    render(<HifzRecitationScreen />);
    fireEvent.press(screen.getByTestId('rating-easy'));
    expect(mockRateAndSave).toHaveBeenCalledWith('easy');
  });

  // ============================================================
  // Peek Overlay Tests
  // ============================================================

  it('opens HifzPeekOverlay when hint button pressed', () => {
    render(<HifzRecitationScreen />);
    fireEvent.press(screen.getByTestId('hint-button'));
    expect(screen.getByTestId('hifz-peek-overlay')).toBeTruthy();
  });

  it('closes peek overlay when dismissed', () => {
    render(<HifzRecitationScreen />);
    fireEvent.press(screen.getByTestId('hint-button'));
    expect(screen.getByTestId('hifz-peek-overlay')).toBeTruthy();

    fireEvent.press(screen.getByTestId('peek-dismiss'));

    // Overlay should not be visible anymore
    expect(screen.queryByTestId('hifz-peek-overlay')).toBeNull();
  });

  // ============================================================
  // Error Handling Tests
  // ============================================================

  it('displays error message when error occurs', () => {
    mockUseHifzRecitation.mockReturnValue({
      isRecording: false,
      isProcessing: false,
      transcription: null,
      result: null,
      error: 'Recording failed',
      startRecitation: jest.fn(),
      stopRecitation: jest.fn(),
      rateAndSave: jest.fn(),
      reset: jest.fn(),
    });

    render(<HifzRecitationScreen />);
    expect(screen.getByText(/Recording failed/i)).toBeTruthy();
  });

  it('shows retry button when error occurs', () => {
    mockUseHifzRecitation.mockReturnValue({
      isRecording: false,
      isProcessing: false,
      transcription: null,
      result: null,
      error: 'Recording failed',
      startRecitation: jest.fn(),
      stopRecitation: jest.fn(),
      rateAndSave: jest.fn(),
      reset: jest.fn(),
    });

    render(<HifzRecitationScreen />);
    expect(screen.getByTestId('retry-button')).toBeTruthy();
  });

  it('calls reset when retry button pressed', () => {
    const mockReset = jest.fn();
    mockUseHifzRecitation.mockReturnValue({
      isRecording: false,
      isProcessing: false,
      transcription: null,
      result: null,
      error: 'Recording failed',
      startRecitation: jest.fn(),
      stopRecitation: jest.fn(),
      rateAndSave: jest.fn(),
      reset: mockReset,
    });

    render(<HifzRecitationScreen />);
    fireEvent.press(screen.getByTestId('retry-button'));
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  // ============================================================
  // Navigation Tests
  // ============================================================

  it('navigates back after rating', async () => {
    const mockRateAndSave = jest.fn();
    mockUseHifzRecitation.mockReturnValue({
      isRecording: false,
      isProcessing: false,
      transcription: 'test',
      result: {
        verseKey: '1:1',
        surahNumber: 1,
        verseNumber: 1,
        expectedText: 'test',
        transcribedText: 'test',
        score: 100,
        accuracy: 1.0,
        wordResults: [],
      },
      error: null,
      startRecitation: jest.fn(),
      stopRecitation: jest.fn(),
      rateAndSave: mockRateAndSave,
      reset: jest.fn(),
    });

    render(<HifzRecitationScreen />);
    fireEvent.press(screen.getByTestId('rating-good'));

    await waitFor(() => {
      expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
    });
  });
});
