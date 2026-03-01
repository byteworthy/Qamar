import { useEffect, useRef, useState, useCallback } from "react";
import { Audio, AVPlaybackStatus } from "expo-av";

export interface AudioPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  currentPosition: number;
  duration: number;
  error: string | null;
}

export interface AudioPlayerControls {
  playAudio: (uri: string) => Promise<void>;
  pauseAudio: () => Promise<void>;
  resumeAudio: () => Promise<void>;
  stopAudio: () => Promise<void>;
  seekTo: (positionMillis: number) => Promise<void>;
}

export function useAudioPlayer(): AudioPlayerState & AudioPlayerControls {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const soundRef = useRef<Audio.Sound | null>(null);
  const currentUriRef = useRef<string | null>(null);

  // Configure audio mode on mount
  useEffect(() => {
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
      } catch (err) {
        console.error("Failed to configure audio mode:", err);
      }
    };

    configureAudio();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch((err) => {
          console.error("Failed to unload sound on unmount:", err);
        });
      }
    };
  }, []);

  // Update playback status
  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        setError(`Playback error: ${status.error}`);
        setIsLoading(false);
        setIsPlaying(false);
      }
      return;
    }

    setIsPlaying(status.isPlaying);
    setCurrentPosition(status.positionMillis);
    setDuration(status.durationMillis ?? 0);

    // Handle playback finish
    if (status.didJustFinish && !status.isLooping) {
      setIsPlaying(false);
      setCurrentPosition(0);
    }
  }, []);

  const playAudio = useCallback(
    async (uri: string) => {
      try {
        setIsLoading(true);
        setError(null);

        // If same URI and sound is already loaded, just replay
        if (currentUriRef.current === uri && soundRef.current) {
          await soundRef.current.setPositionAsync(0);
          await soundRef.current.playAsync();
          setIsLoading(false);
          return;
        }

        // Unload previous sound if exists
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }

        // Load and play new sound
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true },
          onPlaybackStatusUpdate,
        );

        soundRef.current = sound;
        currentUriRef.current = uri;
        setIsLoading(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to play audio";
        setError(errorMessage);
        setIsLoading(false);
        setIsPlaying(false);
        console.error("Error playing audio:", err);
      }
    },
    [onPlaybackStatusUpdate],
  );

  const pauseAudio = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.pauseAsync();
      }
    } catch (err) {
      console.error("Error pausing audio:", err);
      setError("Failed to pause audio");
    }
  }, []);

  const resumeAudio = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.playAsync();
      }
    } catch (err) {
      console.error("Error resuming audio:", err);
      setError("Failed to resume audio");
    }
  }, []);

  const stopAudio = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.setPositionAsync(0);
        setCurrentPosition(0);
        setIsPlaying(false);
      }
    } catch (err) {
      console.error("Error stopping audio:", err);
      setError("Failed to stop audio");
    }
  }, []);

  const seekTo = useCallback(async (positionMillis: number) => {
    try {
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(positionMillis);
      }
    } catch (err) {
      console.error("Error seeking audio:", err);
      setError("Failed to seek audio");
    }
  }, []);

  return {
    isPlaying,
    isLoading,
    currentPosition,
    duration,
    error,
    playAudio,
    pauseAudio,
    resumeAudio,
    stopAudio,
    seekTo,
  };
}
