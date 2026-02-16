import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  FadeInUp,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { NoorColors } from "@/constants/theme/colors";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { IslamicPattern } from "@/components/IslamicPattern";
import { hapticLight, hapticSuccess, hapticMedium } from "@/lib/haptics";
import { useGamification } from "@/stores/gamification-store";
import type { RootStackNavigationProp } from "@/navigation/types";

// =============================================================================
// TYPES
// =============================================================================

type Step = 1 | 2 | 3 | 4 | "complete";

interface Verse {
  arabic: string;
  translation: string;
  reference: string;
}

interface FlashcardWord {
  arabic: string;
  transliteration: string;
  english: string;
}

interface DhikrItem {
  arabic: string;
  transliteration: string;
  english: string;
}

// =============================================================================
// DATA
// =============================================================================

const CURATED_VERSES: Verse[] = [
  { arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", translation: "In the name of Allah, the Most Gracious, the Most Merciful.", reference: "1:1" },
  { arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", translation: "You alone we worship, and You alone we ask for help.", reference: "1:5" },
  { arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", translation: "Guide us to the straight path.", reference: "1:6" },
  { arabic: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ", translation: "This is the Book about which there is no doubt, a guidance for those conscious of Allah.", reference: "2:2" },
  { arabic: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ", translation: "And seek help through patience and prayer.", reference: "2:45" },
  { arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "For indeed, with hardship will be ease.", reference: "94:5" },
  { arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "Indeed, with hardship will be ease.", reference: "94:6" },
  { arabic: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ", translation: "And your Lord is going to give you, and you will be satisfied.", reference: "93:5" },
  { arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", translation: "Verily, in the remembrance of Allah do hearts find rest.", reference: "13:28" },
  { arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", translation: "And whoever relies upon Allah, then He is sufficient for him.", reference: "65:3" },
  { arabic: "رَبِّ اشْرَحْ لِي صَدْرِي", translation: "My Lord, expand for me my chest.", reference: "20:25" },
  { arabic: "رَبِّ زِدْنِي عِلْمًا", translation: "My Lord, increase me in knowledge.", reference: "20:114" },
  { arabic: "وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ", translation: "And We are closer to him than his jugular vein.", reference: "50:16" },
  { arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", translation: "Indeed, Allah is with the patient.", reference: "2:153" },
  { arabic: "وَقُل رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا", translation: "And say: My Lord, have mercy upon them as they brought me up when I was small.", reference: "17:24" },
  { arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ", translation: "So remember Me; I will remember you.", reference: "2:152" },
  { arabic: "وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ", translation: "And We have certainly made the Quran easy for remembrance.", reference: "54:17" },
  { arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ", translation: "Say: He is Allah, the One.", reference: "112:1" },
  { arabic: "وَإِلَٰهُكُمْ إِلَٰهٌ وَاحِدٌ", translation: "And your god is one God.", reference: "2:163" },
  { arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا", translation: "O you who have believed, persevere and endure.", reference: "3:200" },
];

const FLASHCARD_WORDS: FlashcardWord[] = [
  { arabic: "بِسْمِ اللَّهِ", transliteration: "Bismillah", english: "In the name of Allah" },
  { arabic: "إِنْ شَاءَ اللَّهُ", transliteration: "In sha Allah", english: "If Allah wills" },
  { arabic: "مَا شَاءَ اللَّهُ", transliteration: "Ma sha Allah", english: "Allah has willed it" },
  { arabic: "جَزَاكَ اللَّهُ خَيْرًا", transliteration: "Jazak Allahu khayran", english: "May Allah reward you with good" },
  { arabic: "بَارَكَ اللَّهُ فِيكَ", transliteration: "Baarak Allahu feek", english: "May Allah bless you" },
  { arabic: "تَوَكُّل", transliteration: "Tawakkul", english: "Trust in Allah / Reliance on God" },
  { arabic: "صَبْر", transliteration: "Sabr", english: "Patience" },
  { arabic: "شُكْر", transliteration: "Shukr", english: "Gratitude" },
  { arabic: "تَقْوَى", transliteration: "Taqwa", english: "God-consciousness" },
  { arabic: "إِحْسَان", transliteration: "Ihsan", english: "Excellence in worship" },
  { arabic: "رَحْمَة", transliteration: "Rahmah", english: "Mercy" },
  { arabic: "نُور", transliteration: "Noor", english: "Light" },
  { arabic: "هِدَايَة", transliteration: "Hidayah", english: "Guidance" },
  { arabic: "تَوْبَة", transliteration: "Tawbah", english: "Repentance" },
  { arabic: "دُعَاء", transliteration: "Dua", english: "Supplication / Prayer" },
];

const DHIKR_OPTIONS: DhikrItem[] = [
  { arabic: "سُبْحَانَ اللَّهِ", transliteration: "SubhanAllah", english: "Glory be to Allah" },
  { arabic: "الْحَمْدُ لِلَّهِ", transliteration: "Alhamdulillah", english: "All praise is due to Allah" },
  { arabic: "اللَّهُ أَكْبَرُ", transliteration: "Allahu Akbar", english: "Allah is the Greatest" },
];

const REFLECTION_PROMPTS: string[] = [
  "What is one blessing you noticed today that you usually overlook?",
  "How did you see Allah's mercy in your life this week?",
  "What is one thing you can do tomorrow to strengthen your connection with Allah?",
  "Reflect on a moment of patience you showed recently. How did it feel?",
  "What Quranic verse or hadith has been on your mind lately? Why?",
  "How can you be a source of light (noor) for someone in your life?",
  "What is one habit you want to build that brings you closer to Allah?",
  "Think about a difficulty you faced recently. What lesson did it carry?",
  "Who is someone you want to make dua for today, and why?",
  "What does gratitude (shukr) look like in your daily life right now?",
];

const DHIKR_TARGET = 33;
const AUTO_ADVANCE_SECONDS = 30;
const REFLECTIONS_STORAGE_KEY = "@noor_daily_reflections";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getDateSeed(): number {
  const today = new Date().toISOString().split("T")[0];
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = (hash << 5) - hash + today.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getDailyItem<T>(items: T[]): T {
  const seed = getDateSeed();
  return items[seed % items.length];
}

async function saveReflection(prompt: string, text: string): Promise<void> {
  const existing = await AsyncStorage.getItem(REFLECTIONS_STORAGE_KEY);
  const reflections = existing ? JSON.parse(existing) : [];
  reflections.push({
    prompt,
    text,
    date: new Date().toISOString(),
  });
  await AsyncStorage.setItem(REFLECTIONS_STORAGE_KEY, JSON.stringify(reflections));
}

// =============================================================================
// STEP COMPONENTS
// =============================================================================

interface StepHeaderProps {
  step: 1 | 2 | 3 | 4;
  onBack: () => void;
  theme: ReturnType<typeof useTheme>["theme"];
}

function StepHeader({ step, onBack, theme }: StepHeaderProps) {
  const progress = step / 4;
  const stepLabels = ["Daily Verse", "Arabic Flashcard", "Dhikr Practice", "Reflection"];

  return (
    <View style={styles.stepHeader}>
      <View style={styles.stepHeaderRow}>
        <Pressable
          onPress={onBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={22} color={theme.text} />
        </Pressable>
        <ThemedText
          type="caption"
          style={[styles.stepLabel, { color: theme.textSecondary }]}
        >
          {step}/4 — {stepLabels[step - 1]}
        </ThemedText>
        <View style={styles.backButton} />
      </View>

      <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: `${progress * 100}%`,
              backgroundColor: NoorColors.gold,
            },
          ]}
        />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Step 1: Daily Verse
// ---------------------------------------------------------------------------

interface DailyVerseStepProps {
  onContinue: () => void;
  theme: ReturnType<typeof useTheme>["theme"];
}

function DailyVerseStep({ onContinue, theme }: DailyVerseStepProps) {
  const verse = useMemo(() => getDailyItem(CURATED_VERSES), []);
  const [secondsLeft, setSecondsLeft] = useState(AUTO_ADVANCE_SECONDS);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onContinue]);

  return (
    <Animated.View entering={FadeInUp.duration(400).springify().damping(18)} style={styles.stepContent}>
      <IslamicPattern variant="moonstar" opacity={0.04} />

      <GlassCard style={styles.verseCard} breathing>
        <ThemedText
          style={[styles.verseArabic, { fontFamily: Fonts?.spiritual }]}
          accessibilityLabel={`Arabic verse: ${verse.arabic}`}
        >
          {verse.arabic}
        </ThemedText>

        <View style={[styles.verseDivider, { backgroundColor: theme.border }]} />

        <ThemedText
          type="body"
          style={[styles.verseTranslation, { fontFamily: Fonts?.serif }]}
        >
          {verse.translation}
        </ThemedText>

        <ThemedText
          type="caption"
          style={[styles.verseReference, { color: theme.textSecondary }]}
        >
          Surah {verse.reference}
        </ThemedText>
      </GlassCard>

      <ThemedText
        type="caption"
        style={[styles.autoAdvanceHint, { color: theme.textSecondary }]}
      >
        Auto-advancing in {secondsLeft}s
      </ThemedText>

      <Pressable
        onPress={() => {
          hapticMedium();
          onContinue();
        }}
        style={({ pressed }) => [
          styles.continueButton,
          {
            backgroundColor: theme.primary,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Continue to Arabic flashcard"
      >
        <ThemedText
          type="body"
          style={[styles.continueButtonText, { color: theme.buttonText }]}
        >
          Continue
        </ThemedText>
        <Feather name="arrow-right" size={18} color={theme.buttonText} />
      </Pressable>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Arabic Flashcard
// ---------------------------------------------------------------------------

interface FlashcardStepProps {
  onContinue: () => void;
  theme: ReturnType<typeof useTheme>["theme"];
}

function FlashcardStep({ onContinue, theme }: FlashcardStepProps) {
  const word = useMemo(() => getDailyItem(FLASHCARD_WORDS), []);
  const [isFlipped, setIsFlipped] = useState(false);
  const recordActivity = useGamification((s) => s.recordActivity);

  const flipScale = useSharedValue(1);
  const flipOpacity = useSharedValue(1);

  const handleFlip = useCallback(() => {
    hapticLight();
    flipScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 120 }),
    );
    setIsFlipped(true);
  }, [flipScale]);

  const handleResponse = useCallback(
    (knew: boolean) => {
      hapticMedium();
      if (knew) {
        recordActivity("flashcard_reviewed");
      }
      flipOpacity.value = withTiming(0, { duration: 200 });
      setTimeout(onContinue, 250);
    },
    [recordActivity, flipOpacity, onContinue],
  );

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flipScale.value }],
    opacity: flipOpacity.value,
  }));

  return (
    <Animated.View entering={FadeInUp.duration(400).springify().damping(18)} style={styles.stepContent}>
      <IslamicPattern variant="corner" opacity={0.03} />

      <Animated.View style={cardAnimatedStyle}>
        <GlassCard elevated style={styles.flashcardContainer}>
          <ThemedText
            style={[styles.flashcardArabic, { fontFamily: Fonts?.spiritual }]}
            accessibilityLabel={`Arabic word: ${word.arabic}`}
          >
            {word.arabic}
          </ThemedText>

          <ThemedText
            type="body"
            style={[styles.flashcardTransliteration, { color: theme.textSecondary }]}
          >
            {word.transliteration}
          </ThemedText>

          {isFlipped ? (
            <Animated.View entering={FadeIn.duration(300)} style={styles.flashcardAnswer}>
              <View style={[styles.flashcardDivider, { backgroundColor: theme.border }]} />
              <ThemedText
                type="h3"
                style={[styles.flashcardEnglish, { fontFamily: Fonts?.serif }]}
              >
                {word.english}
              </ThemedText>
            </Animated.View>
          ) : (
            <Pressable
              onPress={handleFlip}
              style={[styles.tapToReveal, { backgroundColor: theme.overlayLight }]}
              accessibilityRole="button"
              accessibilityLabel="Tap to reveal the English meaning"
            >
              <Feather name="eye" size={16} color={theme.textSecondary} />
              <ThemedText
                type="caption"
                style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}
              >
                Tap to reveal
              </ThemedText>
            </Pressable>
          )}
        </GlassCard>
      </Animated.View>

      {isFlipped && (
        <Animated.View entering={FadeInUp.duration(300).delay(100)} style={styles.flashcardActions}>
          <Pressable
            onPress={() => handleResponse(true)}
            style={({ pressed }) => [
              styles.flashcardButton,
              {
                backgroundColor: theme.success,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="I knew this word"
          >
            <Feather name="check" size={18} color="#fff" />
            <ThemedText style={styles.flashcardButtonText}>I knew this</ThemedText>
          </Pressable>

          <Pressable
            onPress={() => handleResponse(false)}
            style={({ pressed }) => [
              styles.flashcardButton,
              {
                backgroundColor: theme.cardSurface,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Still learning this word"
          >
            <Feather name="refresh-cw" size={18} color={theme.text} />
            <ThemedText style={[styles.flashcardButtonText, { color: theme.text }]}>
              Still learning
            </ThemedText>
          </Pressable>
        </Animated.View>
      )}
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Step 3: Dhikr Practice
// ---------------------------------------------------------------------------

interface DhikrStepProps {
  onContinue: () => void;
  theme: ReturnType<typeof useTheme>["theme"];
}

function DhikrStep({ onContinue, theme }: DhikrStepProps) {
  const dhikr = useMemo(() => getDailyItem(DHIKR_OPTIONS), []);
  const [count, setCount] = useState(0);
  const recordActivity = useGamification((s) => s.recordActivity);

  const tapScale = useSharedValue(1);
  const progressWidth = (count / DHIKR_TARGET) * 100;
  const isComplete = count >= DHIKR_TARGET;

  useEffect(() => {
    if (isComplete) {
      hapticSuccess();
      recordActivity("dhikr_completed");
      const timer = setTimeout(onContinue, 1200);
      return () => clearTimeout(timer);
    }
  }, [isComplete, onContinue, recordActivity]);

  const handleTap = useCallback(() => {
    if (count >= DHIKR_TARGET) return;
    hapticLight();
    tapScale.value = withSequence(
      withTiming(0.92, { duration: 60 }),
      withSpring(1, { damping: 12, stiffness: 200 }),
    );
    setCount((prev) => prev + 1);
  }, [count, tapScale]);

  const tapAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tapScale.value }],
  }));

  return (
    <Animated.View entering={FadeInUp.duration(400).springify().damping(18)} style={styles.stepContent}>
      <View style={styles.dhikrHeader}>
        <ThemedText
          type="caption"
          style={[styles.dhikrLabel, { color: theme.textSecondary }]}
        >
          {dhikr.english}
        </ThemedText>
        <ThemedText
          style={[styles.dhikrArabicTitle, { fontFamily: Fonts?.spiritual }]}
        >
          {dhikr.arabic}
        </ThemedText>
        <ThemedText
          type="small"
          style={[styles.dhikrTransliteration, { color: theme.textSecondary }]}
        >
          {dhikr.transliteration}
        </ThemedText>
      </View>

      <Animated.View style={tapAnimatedStyle}>
        <Pressable
          onPress={handleTap}
          disabled={isComplete}
          style={({ pressed }) => [
            styles.dhikrTapCircle,
            {
              backgroundColor: isComplete ? theme.success : theme.primary,
              opacity: pressed && !isComplete ? 0.9 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Dhikr counter: ${count} of ${DHIKR_TARGET}. Tap to increment.`}
        >
          {isComplete ? (
            <Feather name="check" size={40} color={theme.onPrimary} />
          ) : (
            <ThemedText
              style={[styles.dhikrCount, { color: theme.onPrimary }]}
            >
              {count}
            </ThemedText>
          )}
        </Pressable>
      </Animated.View>

      <View style={styles.dhikrProgressContainer}>
        <View style={[styles.dhikrProgressTrack, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.dhikrProgressFill,
              {
                width: `${Math.min(progressWidth, 100)}%`,
                backgroundColor: isComplete ? theme.success : NoorColors.gold,
              },
            ]}
          />
        </View>
        <ThemedText
          type="caption"
          style={[styles.dhikrProgressText, { color: theme.textSecondary }]}
        >
          {count} / {DHIKR_TARGET}
        </ThemedText>
      </View>

      {isComplete && (
        <Animated.View entering={FadeIn.duration(400)}>
          <ThemedText
            type="body"
            style={[styles.dhikrCompleteText, { color: theme.success, fontFamily: Fonts?.serif }]}
          >
            Ma sha Allah — well done.
          </ThemedText>
        </Animated.View>
      )}
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Step 4: Quick Reflection
// ---------------------------------------------------------------------------

interface ReflectionStepProps {
  onComplete: (prompt: string, text: string) => void;
  theme: ReturnType<typeof useTheme>["theme"];
}

function ReflectionStep({ onComplete, theme }: ReflectionStepProps) {
  const prompt = useMemo(() => getDailyItem(REFLECTION_PROMPTS), []);
  const [text, setText] = useState("");
  const hasText = text.trim().length > 0;

  const handleComplete = useCallback(() => {
    if (!hasText) return;
    hapticMedium();
    onComplete(prompt, text.trim());
  }, [hasText, onComplete, prompt, text]);

  return (
    <Animated.View entering={FadeInUp.duration(400).springify().damping(18)} style={styles.stepContent}>
      <IslamicPattern variant="accent" opacity={0.03} />

      <GlassCard style={styles.reflectionCard}>
        <Feather
          name="feather"
          size={24}
          color={NoorColors.gold}
          style={styles.reflectionIcon}
        />
        <ThemedText
          type="bodyLarge"
          style={[styles.reflectionPrompt, { fontFamily: Fonts?.serif }]}
        >
          {prompt}
        </ThemedText>
      </GlassCard>

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Write your reflection..."
        placeholderTextColor={theme.textSecondary}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
        style={[
          styles.reflectionInput,
          {
            backgroundColor: theme.inputBackground,
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
        accessibilityLabel="Reflection text input"
        accessibilityHint="Write your personal reflection here"
      />

      <Pressable
        onPress={handleComplete}
        disabled={!hasText}
        style={({ pressed }) => [
          styles.continueButton,
          {
            backgroundColor: hasText ? theme.primary : theme.border,
            opacity: pressed && hasText ? 0.85 : hasText ? 1 : 0.5,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Complete daily noor"
        accessibilityState={{ disabled: !hasText }}
      >
        <ThemedText
          type="body"
          style={[
            styles.continueButtonText,
            { color: hasText ? theme.buttonText : theme.textSecondary },
          ]}
        >
          Complete
        </ThemedText>
        <Feather
          name="check"
          size={18}
          color={hasText ? theme.buttonText : theme.textSecondary}
        />
      </Pressable>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Completion Screen
// ---------------------------------------------------------------------------

interface CompletionViewProps {
  streak: number;
  onDone: () => void;
  theme: ReturnType<typeof useTheme>["theme"];
}

function CompletionView({ streak, onDone, theme }: CompletionViewProps) {
  const checkScale = useSharedValue(0);

  useEffect(() => {
    hapticSuccess();
    checkScale.value = withDelay(
      200,
      withSequence(
        withSpring(1.2, { damping: 10, stiffness: 100 }),
        withSpring(1, { damping: 15, stiffness: 150 }),
      ),
    );
  }, [checkScale]);

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  return (
    <Animated.View entering={FadeIn.duration(500)} style={styles.completionContainer}>
      <IslamicPattern variant="full" opacity={0.04} />

      <Animated.View
        style={[
          styles.completionCheckCircle,
          { backgroundColor: theme.success },
          checkAnimatedStyle,
        ]}
      >
        <Feather name="check" size={40} color="#fff" />
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(400).delay(400)}>
        <ThemedText
          type="h2"
          style={[styles.completionTitle, { fontFamily: Fonts?.serifBold }]}
        >
          Ma sha Allah
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(400).delay(550)}>
        <ThemedText
          type="body"
          style={[styles.completionSubtitle, { color: theme.textSecondary }]}
        >
          You completed your Daily Noor.
        </ThemedText>
      </Animated.View>

      {streak > 0 && (
        <Animated.View entering={FadeInUp.duration(400).delay(700)}>
          <GlassCard style={styles.streakCard}>
            <Feather name="zap" size={24} color={NoorColors.gold} />
            <View style={styles.streakInfo}>
              <ThemedText type="h3" style={styles.streakNumber}>
                {streak}
              </ThemedText>
              <ThemedText
                type="caption"
                style={{ color: theme.textSecondary }}
              >
                day streak
              </ThemedText>
            </View>
          </GlassCard>
        </Animated.View>
      )}

      <Animated.View entering={FadeInUp.duration(400).delay(900)} style={styles.completionButtonWrapper}>
        <Pressable
          onPress={onDone}
          style={({ pressed }) => [
            styles.continueButton,
            {
              backgroundColor: theme.primary,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Return to home screen"
        >
          <ThemedText
            type="body"
            style={[styles.continueButtonText, { color: theme.buttonText }]}
          >
            Done
          </ThemedText>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

// =============================================================================
// MAIN SCREEN
// =============================================================================

export default function DailyNoorScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<RootStackNavigationProp>();
  const recordActivity = useGamification((s) => s.recordActivity);
  const incrementStat = useGamification((s) => s.incrementStat);
  const currentStreak = useGamification((s) => s.currentStreak);

  const [step, setStep] = useState<Step>(1);

  const handleBack = useCallback(() => {
    if (step === 1) {
      navigation.goBack();
      return;
    }
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
    if (step === 4) setStep(3);
  }, [step, navigation]);

  const handleReflectionComplete = useCallback(
    async (prompt: string, text: string) => {
      await saveReflection(prompt, text);
      recordActivity("reflection_submitted");
      recordActivity("daily_noor_completed");
      incrementStat("totalReflections");
      setStep("complete");
    },
    [recordActivity, incrementStat],
  );

  const handleDone = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ height: insets.top }} />

      {step !== "complete" && (
        <StepHeader step={step} onBack={handleBack} theme={theme} />
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing["4xl"] },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 && (
          <DailyVerseStep
            onContinue={() => setStep(2)}
            theme={theme}
          />
        )}
        {step === 2 && (
          <FlashcardStep
            onContinue={() => setStep(3)}
            theme={theme}
          />
        )}
        {step === 3 && (
          <DhikrStep
            onContinue={() => setStep(4)}
            theme={theme}
          />
        )}
        {step === 4 && (
          <ReflectionStep
            onComplete={handleReflectionComplete}
            theme={theme}
          />
        )}
        {step === "complete" && (
          <CompletionView
            streak={currentStreak}
            onDone={handleDone}
            theme={theme}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },

  // Step Header
  stepHeader: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  stepHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  stepLabel: {
    textAlign: "center",
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },

  // Step Content (shared)
  stepContent: {
    flex: 1,
    paddingTop: Spacing["2xl"],
  },

  // Step 1: Daily Verse
  verseCard: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
    paddingHorizontal: Spacing.xl,
  },
  verseArabic: {
    fontSize: 28,
    lineHeight: 48,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  verseDivider: {
    width: 40,
    height: 1,
    marginBottom: Spacing.xl,
  },
  verseTranslation: {
    textAlign: "center",
    lineHeight: 28,
    fontStyle: "italic",
    marginBottom: Spacing.lg,
  },
  verseReference: {
    textAlign: "center",
  },
  autoAdvanceHint: {
    textAlign: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },

  // Step 2: Flashcard
  flashcardContainer: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
    paddingHorizontal: Spacing.xl,
    minHeight: 260,
  },
  flashcardArabic: {
    fontSize: 40,
    lineHeight: 60,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  flashcardTransliteration: {
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: Spacing.xl,
  },
  flashcardAnswer: {
    alignItems: "center",
    width: "100%",
  },
  flashcardDivider: {
    width: 40,
    height: 1,
    marginBottom: Spacing.lg,
  },
  flashcardEnglish: {
    textAlign: "center",
  },
  tapToReveal: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  flashcardActions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing["2xl"],
  },
  flashcardButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  flashcardButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },

  // Step 3: Dhikr
  dhikrHeader: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  dhikrLabel: {
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  dhikrArabicTitle: {
    fontSize: 32,
    lineHeight: 48,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  dhikrTransliteration: {
    fontStyle: "italic",
  },
  dhikrTapCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  dhikrCount: {
    fontSize: 48,
    fontWeight: "700",
  },
  dhikrProgressContainer: {
    marginTop: Spacing["2xl"],
    alignItems: "center",
    gap: Spacing.sm,
  },
  dhikrProgressTrack: {
    width: "80%",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  dhikrProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  dhikrProgressText: {
    textAlign: "center",
  },
  dhikrCompleteText: {
    textAlign: "center",
    marginTop: Spacing.xl,
    fontStyle: "italic",
  },

  // Step 4: Reflection
  reflectionCard: {
    marginBottom: Spacing.xl,
  },
  reflectionIcon: {
    marginBottom: Spacing.md,
  },
  reflectionPrompt: {
    lineHeight: 28,
  },
  reflectionInput: {
    minHeight: 120,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    fontSize: 17,
    lineHeight: 26,
    marginBottom: Spacing.xl,
  },

  // Shared: Continue Button
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing["2xl"],
  },
  continueButtonText: {
    fontWeight: "600",
  },

  // Completion
  completionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing["5xl"],
  },
  completionCheckCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  completionTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  completionSubtitle: {
    textAlign: "center",
    marginBottom: Spacing["3xl"],
  },
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing["2xl"],
  },
  streakInfo: {
    alignItems: "flex-start",
  },
  streakNumber: {
    fontWeight: "700",
  },
  completionButtonWrapper: {
    width: "100%",
    marginTop: Spacing["3xl"],
  },
});
