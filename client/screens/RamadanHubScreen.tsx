import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useTheme } from "@/hooks/useTheme";
import { Fonts, QamarColors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { GlassCard } from "@/components/GlassCard";
import { IslamicPattern } from "@/components/IslamicPattern";
import { RamadanCountdown } from "@/components/RamadanCountdown";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useAppState, selectUserLocation } from "@/stores/app-state";
import { calculatePrayerTimes, formatPrayerTime } from "@/services/prayerTimes";
import { getHijriDate } from "@/services/islamicCalendar";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FASTING_LOG_KEY = "@noor_ramadan_fasting_log";
const RAMADAN_YEAR_KEY = "@noor_ramadan_year";
const RAMADAN_MONTH = 9;

const RAMADAN_GOLD = QamarColors.gold;
const RAMADAN_EMERALD = QamarColors.emerald;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type FastingStatus = "fasted" | "missed" | "excused" | "none";

interface DayLog {
  status: FastingStatus;
  excuseReason?: string;
}

type FastingLog = Record<number, DayLog>;

// ─────────────────────────────────────────────────────────────────────────────
// Daily Ramadan Content (30 entries, one per day)
// ─────────────────────────────────────────────────────────────────────────────

const DAILY_CONTENT: {
  day: number;
  type: string;
  text: string;
  source?: string;
}[] = [
  {
    day: 1,
    type: "Hadith",
    text: "When Ramadan begins, the gates of Paradise are opened and the gates of Hell are closed, and the devils are chained.",
    source: "Bukhari & Muslim",
  },
  {
    day: 2,
    type: "Dhikr",
    text: "SubhanAllah wa bihamdihi, SubhanAllah al-Azeem. (Glory be to Allah and His praise, Glory be to Allah the Supreme.)",
  },
  {
    day: 3,
    type: "Hadith",
    text: "Whoever fasts Ramadan out of faith and seeking reward, his previous sins will be forgiven.",
    source: "Bukhari & Muslim",
  },
  {
    day: 4,
    type: "Dhikr",
    text: "La hawla wa la quwwata illa billah. (There is no power nor strength except through Allah.)",
  },
  {
    day: 5,
    type: "Hadith",
    text: "The supplication of the fasting person is not rejected.",
    source: "Ibn Majah",
  },
  {
    day: 6,
    type: "Dhikr",
    text: "Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'anni. (O Allah, You are forgiving and love forgiveness, so forgive me.)",
  },
  {
    day: 7,
    type: "Hadith",
    text: "Fasting is a shield; so when one of you is fasting, let him not behave obscenely or foolishly.",
    source: "Bukhari",
  },
  {
    day: 8,
    type: "Dhikr",
    text: "Astaghfirullah al-Azeem wa atubu ilayh. (I seek forgiveness from Allah the Supreme and repent to Him.)",
  },
  {
    day: 9,
    type: "Hadith",
    text: "Whoever gives food to a fasting person to break his fast shall have a reward equal to his, without diminishing anything from the fasting person's reward.",
    source: "Tirmidhi",
  },
  {
    day: 10,
    type: "Dhikr",
    text: "HasbunAllahu wa ni'mal wakeel. (Allah is sufficient for us and He is the best disposer of affairs.)",
  },
  {
    day: 11,
    type: "Hadith",
    text: "There is a gate in Paradise called Ar-Rayyan, through which only those who fast will enter.",
    source: "Bukhari & Muslim",
  },
  {
    day: 12,
    type: "Dhikr",
    text: "SubhanAllahi wa bihamdihi, 'adada khalqihi. (Glory be to Allah and His praise, as numerous as His creation.)",
  },
  {
    day: 13,
    type: "Hadith",
    text: "The best charity is that given in Ramadan.",
    source: "Tirmidhi",
  },
  {
    day: 14,
    type: "Dhikr",
    text: "Allahumma barik lana fi Ramadan. (O Allah, bless us in Ramadan.)",
  },
  {
    day: 15,
    type: "Hadith",
    text: "Whoever stands in prayer during Ramadan out of faith and seeking reward, his previous sins will be forgiven.",
    source: "Bukhari & Muslim",
  },
  {
    day: 16,
    type: "Dhikr",
    text: "Ya Hayyu Ya Qayyum, bi rahmatika astaghith. (O Ever-Living, O Self-Sustaining, in Your mercy I seek relief.)",
  },
  {
    day: 17,
    type: "Hadith",
    text: "The Quran was revealed in the month of Ramadan as a guide for humanity and clear proofs of guidance.",
    source: "Quran 2:185",
  },
  {
    day: 18,
    type: "Dhikr",
    text: "Allahumma taqabbal minna, innaka antas-Sami'ul 'Aleem. (O Allah, accept from us, You are the All-Hearing, All-Knowing.)",
  },
  {
    day: 19,
    type: "Hadith",
    text: "Every act of the son of Adam is for himself except fasting. It is for Me, and I shall reward it.",
    source: "Bukhari & Muslim",
  },
  {
    day: 20,
    type: "Dhikr",
    text: "Rabbi zidni 'ilma. (My Lord, increase me in knowledge.)",
  },
  {
    day: 21,
    type: "Hadith",
    text: "Search for Laylat al-Qadr in the odd nights of the last ten nights of Ramadan.",
    source: "Bukhari",
  },
  {
    day: 22,
    type: "Dhikr",
    text: "Allahumma inna nas'aluka al-jannah wa na'udhu bika minan-nar. (O Allah, we ask You for Paradise and seek refuge from the Fire.)",
  },
  {
    day: 23,
    type: "Hadith",
    text: "Whoever stands in prayer on Laylat al-Qadr out of faith and seeking reward, his previous sins will be forgiven.",
    source: "Bukhari & Muslim",
  },
  {
    day: 24,
    type: "Dhikr",
    text: "La ilaha illAllahu wahdahu la sharika lahu, lahul mulku wa lahul hamdu wa huwa 'ala kulli shay'in Qadeer.",
  },
  {
    day: 25,
    type: "Hadith",
    text: "Laylat al-Qadr is better than a thousand months.",
    source: "Quran 97:3",
  },
  {
    day: 26,
    type: "Dhikr",
    text: "Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'anni. (O Allah, You are the Pardoner and love pardoning, so pardon me.)",
  },
  {
    day: 27,
    type: "Hadith",
    text: "The Prophet (PBUH) used to exert himself in worship during the last ten nights more than any other time.",
    source: "Muslim",
  },
  {
    day: 28,
    type: "Dhikr",
    text: "Allahumma a'inna 'ala dhikrika wa shukrika wa husni 'ibadatik. (O Allah, help us remember You, be grateful to You, and worship You well.)",
  },
  {
    day: 29,
    type: "Hadith",
    text: "Whoever fasts Ramadan and follows it with six days of Shawwal, it is as if he fasted the entire year.",
    source: "Muslim",
  },
  {
    day: 30,
    type: "Dhikr",
    text: "Alhamdulillah alladhi balaghna Ramadan. Allahumma taqabbal minna. (Praise be to Allah who allowed us to reach Ramadan. O Allah, accept from us.)",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Khalil Reflection Prompts
// ─────────────────────────────────────────────────────────────────────────────

const REFLECTION_PROMPTS: {
  title: string;
  prompt: string;
  icon: keyof typeof Feather.glyphMap;
}[] = [
  {
    title: "Gratitude",
    prompt:
      "What is one blessing you noticed today that you might have overlooked before Ramadan?",
    icon: "heart",
  },
  {
    title: "Patience",
    prompt:
      "What moment today tested your patience, and how did fasting help you respond differently?",
    icon: "shield",
  },
  {
    title: "Generosity",
    prompt:
      "How did you give today -- whether time, attention, or wealth -- and how did it feel?",
    icon: "gift",
  },
  {
    title: "Tawbah",
    prompt:
      "Is there a habit or pattern you are ready to leave behind this Ramadan? What would freedom from it look like?",
    icon: "refresh-cw",
  },
  {
    title: "Connection",
    prompt:
      "How has Ramadan changed the way you relate to those around you -- family, community, or the ummah?",
    icon: "users",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getCurrentRamadanDay(): number {
  const hijri = getHijriDate();
  if (hijri.monthNumber === RAMADAN_MONTH) {
    return hijri.day;
  }
  return 0;
}

function isRamadan(): boolean {
  return getHijriDate().monthNumber === RAMADAN_MONTH;
}

function computeMissedCount(log: FastingLog): number {
  let count = 0;
  for (const entry of Object.values(log)) {
    if (entry.status === "missed" || entry.status === "excused") {
      count++;
    }
  }
  return count;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function RamadanHubScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  // ── State ─────────────────────────────────────────────────────────────
  const [fastingLog, setFastingLog] = useState<FastingLog>({});

  const userLocation = useAppState(selectUserLocation);
  const currentDay = useMemo(() => getCurrentRamadanDay(), []);
  const ramadanActive = useMemo(() => isRamadan(), []);
  const hijriYear = useMemo(() => getHijriDate().year, []);

  const todayStatus = fastingLog[currentDay]?.status ?? "none";
  const missedCount = useMemo(
    () => computeMissedCount(fastingLog),
    [fastingLog],
  );

  // ── Suhoor / Iftar Times ──────────────────────────────────────────────
  const mealTimes = useMemo(() => {
    if (!userLocation) return null;
    const times = calculatePrayerTimes(
      userLocation.latitude,
      userLocation.longitude,
    );
    // Suhoor = Fajr - 10 minutes
    const suhoor = new Date(times.fajr.getTime() - 10 * 60 * 1000);
    return {
      suhoor,
      iftar: times.maghrib,
    };
  }, [userLocation]);

  // ── Daily content based on current Ramadan day ────────────────────────
  const dailyContent = useMemo(() => {
    const dayIndex = currentDay > 0 ? currentDay : 1;
    return DAILY_CONTENT[(dayIndex - 1) % DAILY_CONTENT.length];
  }, [currentDay]);

  // ── Load persisted fasting log ────────────────────────────────────────
  useEffect(() => {
    async function loadLog(): Promise<void> {
      const [savedLog, savedYear] = await Promise.all([
        AsyncStorage.getItem(FASTING_LOG_KEY),
        AsyncStorage.getItem(RAMADAN_YEAR_KEY),
      ]);

      if (savedYear && parseInt(savedYear, 10) !== hijriYear) {
        await AsyncStorage.removeItem(FASTING_LOG_KEY);
        await AsyncStorage.setItem(RAMADAN_YEAR_KEY, String(hijriYear));
        return;
      }

      if (!savedYear) {
        await AsyncStorage.setItem(RAMADAN_YEAR_KEY, String(hijriYear));
      }

      if (savedLog) {
        const parsed = JSON.parse(savedLog) as FastingLog;
        setFastingLog(parsed);
      }
    }
    loadLog().catch(() => {});
  }, [hijriYear]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleToggleFasting = useCallback(
    async (status: FastingStatus) => {
      if (currentDay === 0) return;

      const newLog: FastingLog = { ...fastingLog };
      if (todayStatus === status) {
        // Toggle off
        delete newLog[currentDay];
      } else {
        newLog[currentDay] = { status };
      }

      setFastingLog(newLog);
      await AsyncStorage.setItem(FASTING_LOG_KEY, JSON.stringify(newLog));
    },
    [currentDay, fastingLog, todayStatus],
  );

  const handleNavigateTracker = useCallback(
    () => navigation.navigate("FastingTracker" as any),
    [navigation],
  );

  const handleNavigateKhalil = useCallback(
    () => navigation.navigate("Main", { screen: "Khalil" } as any),
    [navigation],
  );

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <AtmosphericBackground variant="atmospheric">
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + 16,
              paddingBottom: 100 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={styles.header}
          >
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={styles.backButton}
            >
              <Feather name="arrow-left" size={24} color={theme.text} />
            </Pressable>
            <View style={styles.headerTextContainer}>
              <ThemedText
                style={[
                  styles.headerTitle,
                  { color: theme.text, fontFamily: Fonts?.serifBold },
                ]}
              >
                Ramadan Hub
              </ThemedText>
              <ThemedText
                style={[styles.headerSubtitle, { color: theme.textSecondary }]}
              >
                Ramadan {hijriYear} AH
              </ThemedText>
            </View>
          </Animated.View>

          {/* Countdown / Progress */}
          <RamadanCountdown />

          {/* Suhoor / Iftar Times */}
          {mealTimes && ramadanActive && (
            <Animated.View
              entering={FadeInUp.duration(350).delay(100)}
              style={styles.sectionSpacing}
            >
              <GlassCard style={styles.mealTimesCard} elevated>
                <IslamicPattern variant="moonstar" opacity={0.03} />
                <View style={styles.mealTimesRow}>
                  <View style={styles.mealTimeItem}>
                    <View
                      style={[
                        styles.mealTimeBadge,
                        { backgroundColor: QamarColors.twilight + "20" },
                      ]}
                    >
                      <Feather
                        name="moon"
                        size={18}
                        color={QamarColors.twilightLight}
                      />
                    </View>
                    <ThemedText
                      style={[
                        styles.mealTimeLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Suhoor ends
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.mealTimeValue,
                        {
                          color: theme.text,
                          fontFamily: Fonts?.sansBold,
                        },
                      ]}
                    >
                      {formatPrayerTime(mealTimes.suhoor)}
                    </ThemedText>
                  </View>

                  <View
                    style={[
                      styles.mealTimeDivider,
                      { backgroundColor: theme.textSecondary + "20" },
                    ]}
                  />

                  <View style={styles.mealTimeItem}>
                    <View
                      style={[
                        styles.mealTimeBadge,
                        { backgroundColor: RAMADAN_GOLD + "20" },
                      ]}
                    >
                      <Feather name="sunset" size={18} color={RAMADAN_GOLD} />
                    </View>
                    <ThemedText
                      style={[
                        styles.mealTimeLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Iftar
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.mealTimeValue,
                        {
                          color: theme.text,
                          fontFamily: Fonts?.sansBold,
                        },
                      ]}
                    >
                      {formatPrayerTime(mealTimes.iftar)}
                    </ThemedText>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>
          )}

          {!mealTimes && ramadanActive && (
            <Animated.View
              entering={FadeInUp.duration(350).delay(100)}
              style={styles.sectionSpacing}
            >
              <GlassCard style={styles.mealTimesCard} elevated>
                <ThemedText
                  style={[
                    styles.noLocationText,
                    { color: theme.textSecondary },
                  ]}
                >
                  Set your location in Prayer Times to see Suhoor and Iftar
                  times
                </ThemedText>
              </GlassCard>
            </Animated.View>
          )}

          {/* Today's Fasting Status */}
          {ramadanActive && (
            <Animated.View
              entering={FadeInUp.duration(350).delay(160)}
              style={styles.sectionSpacing}
            >
              <ThemedText
                style={[styles.sectionLabel, { color: theme.textSecondary }]}
                accessibilityRole="header"
              >
                {"Today's Fast"}
              </ThemedText>
              <View style={styles.fastingToggleRow}>
                <Pressable
                  onPress={() => handleToggleFasting("fasted")}
                  accessibilityRole="button"
                  accessibilityLabel="Mark as fasted"
                  accessibilityState={{ selected: todayStatus === "fasted" }}
                  style={[
                    styles.fastingToggle,
                    {
                      backgroundColor:
                        todayStatus === "fasted"
                          ? RAMADAN_EMERALD + "25"
                          : theme.backgroundRoot,
                      borderColor:
                        todayStatus === "fasted"
                          ? RAMADAN_EMERALD
                          : "transparent",
                      borderWidth: todayStatus === "fasted" ? 1.5 : 0,
                    },
                  ]}
                >
                  <Feather
                    name="check-circle"
                    size={22}
                    color={
                      todayStatus === "fasted"
                        ? RAMADAN_EMERALD
                        : theme.textSecondary
                    }
                  />
                  <ThemedText
                    style={[
                      styles.fastingToggleText,
                      {
                        color:
                          todayStatus === "fasted"
                            ? RAMADAN_EMERALD
                            : theme.textSecondary,
                        fontFamily: Fonts?.sansMedium,
                      },
                    ]}
                  >
                    Fasted
                  </ThemedText>
                </Pressable>

                <Pressable
                  onPress={() => handleToggleFasting("missed")}
                  accessibilityRole="button"
                  accessibilityLabel="Mark as not fasted"
                  accessibilityState={{ selected: todayStatus === "missed" }}
                  style={[
                    styles.fastingToggle,
                    {
                      backgroundColor:
                        todayStatus === "missed"
                          ? "#D4756B25"
                          : theme.backgroundRoot,
                      borderColor:
                        todayStatus === "missed" ? "#D4756B" : "transparent",
                      borderWidth: todayStatus === "missed" ? 1.5 : 0,
                    },
                  ]}
                >
                  <Feather
                    name="x-circle"
                    size={22}
                    color={
                      todayStatus === "missed" ? "#D4756B" : theme.textSecondary
                    }
                  />
                  <ThemedText
                    style={[
                      styles.fastingToggleText,
                      {
                        color:
                          todayStatus === "missed"
                            ? "#D4756B"
                            : theme.textSecondary,
                        fontFamily: Fonts?.sansMedium,
                      },
                    ]}
                  >
                    Not Fasted
                  </ThemedText>
                </Pressable>

                <Pressable
                  onPress={() => handleToggleFasting("excused")}
                  accessibilityRole="button"
                  accessibilityLabel="Mark as excused"
                  accessibilityState={{ selected: todayStatus === "excused" }}
                  style={[
                    styles.fastingToggle,
                    {
                      backgroundColor:
                        todayStatus === "excused"
                          ? QamarColors.moonlightMuted + "25"
                          : theme.backgroundRoot,
                      borderColor:
                        todayStatus === "excused"
                          ? QamarColors.moonlightMuted
                          : "transparent",
                      borderWidth: todayStatus === "excused" ? 1.5 : 0,
                    },
                  ]}
                >
                  <Feather
                    name="minus-circle"
                    size={22}
                    color={
                      todayStatus === "excused"
                        ? QamarColors.moonlightMuted
                        : theme.textSecondary
                    }
                  />
                  <ThemedText
                    style={[
                      styles.fastingToggleText,
                      {
                        color:
                          todayStatus === "excused"
                            ? QamarColors.moonlightMuted
                            : theme.textSecondary,
                        fontFamily: Fonts?.sansMedium,
                      },
                    ]}
                  >
                    Excused
                  </ThemedText>
                </Pressable>
              </View>

              {/* Missed counter + full tracker link */}
              <View style={styles.fastingSummaryRow}>
                {missedCount > 0 && (
                  <ThemedText
                    style={[styles.missedCounter, { color: RAMADAN_GOLD }]}
                  >
                    {missedCount} {missedCount === 1 ? "day" : "days"} to make
                    up
                  </ThemedText>
                )}
                <Pressable
                  onPress={handleNavigateTracker}
                  accessibilityRole="button"
                  accessibilityLabel="View full month fasting tracker"
                  style={styles.trackerLink}
                >
                  <ThemedText
                    style={[styles.trackerLinkText, { color: RAMADAN_EMERALD }]}
                  >
                    Full Month View
                  </ThemedText>
                  <Feather
                    name="chevron-right"
                    size={16}
                    color={RAMADAN_EMERALD}
                  />
                </Pressable>
              </View>
            </Animated.View>
          )}

          {/* Daily Ramadan Content */}
          <Animated.View
            entering={FadeInUp.duration(350).delay(220)}
            style={styles.sectionSpacing}
          >
            <GlassCard style={styles.dailyContentCard} elevated breathing>
              <IslamicPattern variant="moonstar" opacity={0.04} />
              <View style={styles.dailyContentHeader}>
                <View
                  style={[
                    styles.dailyContentBadge,
                    { backgroundColor: RAMADAN_GOLD + "20" },
                  ]}
                >
                  <Feather name="book-open" size={14} color={RAMADAN_GOLD} />
                </View>
                <ThemedText
                  style={[
                    styles.dailyContentLabel,
                    { color: theme.textSecondary },
                  ]}
                >
                  Day {dailyContent.day} - {dailyContent.type}
                </ThemedText>
              </View>
              <ThemedText
                style={[
                  styles.dailyContentText,
                  { color: theme.text, fontFamily: Fonts?.serif },
                ]}
              >
                {dailyContent.text}
              </ThemedText>
              {dailyContent.source && (
                <ThemedText
                  style={[
                    styles.dailyContentSource,
                    { color: theme.textSecondary },
                  ]}
                >
                  {dailyContent.source}
                </ThemedText>
              )}
            </GlassCard>
          </Animated.View>

          {/* Khalil Reflection Prompts */}
          <Animated.View
            entering={FadeInUp.duration(350).delay(280)}
            style={styles.sectionSpacing}
          >
            <View style={styles.sectionHeaderRow}>
              <ThemedText
                style={[styles.sectionLabel, { color: theme.textSecondary }]}
                accessibilityRole="header"
              >
                Ramadan Reflections
              </ThemedText>
              <Pressable
                onPress={handleNavigateKhalil}
                accessibilityRole="button"
                accessibilityLabel="Open Khalil for deeper reflection"
              >
                <ThemedText
                  style={[styles.seeAllLink, { color: RAMADAN_GOLD }]}
                >
                  Talk to Khalil
                </ThemedText>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.promptsScroll}
            >
              {REFLECTION_PROMPTS.map((prompt, index) => (
                <Animated.View
                  key={prompt.title}
                  entering={FadeInUp.duration(300).delay(300 + index * 60)}
                >
                  <Pressable
                    onPress={handleNavigateKhalil}
                    accessibilityRole="button"
                    accessibilityLabel={`Reflection prompt: ${prompt.title}. ${prompt.prompt}`}
                  >
                    <GlassCard style={styles.promptCard}>
                      <View
                        style={[
                          styles.promptIconCircle,
                          { backgroundColor: RAMADAN_EMERALD + "15" },
                        ]}
                      >
                        <Feather
                          name={prompt.icon}
                          size={18}
                          color={RAMADAN_EMERALD}
                        />
                      </View>
                      <ThemedText
                        style={[
                          styles.promptTitle,
                          {
                            color: RAMADAN_GOLD,
                            fontFamily: Fonts?.sansMedium,
                          },
                        ]}
                      >
                        {prompt.title}
                      </ThemedText>
                      <ThemedText
                        style={[styles.promptText, { color: theme.text }]}
                        numberOfLines={4}
                      >
                        {prompt.prompt}
                      </ThemedText>
                    </GlassCard>
                  </Pressable>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>
        </ScrollView>
      </AtmosphericBackground>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  backButton: {
    padding: Spacing.sm,
    marginLeft: -Spacing.sm,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 34,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  // Spacing between sections
  sectionSpacing: {
    marginTop: Spacing.lg,
  },

  // Section label
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: Spacing.md,
    paddingHorizontal: 4,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
    paddingHorizontal: 4,
  },
  seeAllLink: {
    fontSize: 13,
    fontWeight: "500",
  },

  // Meal times card
  mealTimesCard: {
    paddingVertical: Spacing.lg,
  },
  mealTimesRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  mealTimeItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  mealTimeBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  mealTimeLabel: {
    fontSize: 12,
  },
  mealTimeValue: {
    fontSize: 20,
    lineHeight: 26,
  },
  mealTimeDivider: {
    width: 1,
    height: 48,
  },
  noLocationText: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: Spacing.sm,
  },

  // Fasting toggle
  fastingToggleRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  fastingToggle: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  fastingToggleText: {
    fontSize: 12,
  },
  fastingSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.md,
    paddingHorizontal: 4,
  },
  missedCounter: {
    fontSize: 13,
    fontWeight: "500",
  },
  trackerLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trackerLinkText: {
    fontSize: 13,
    fontWeight: "500",
  },

  // Daily content card
  dailyContentCard: {
    padding: Spacing.lg,
  },
  dailyContentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dailyContentBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  dailyContentLabel: {
    fontSize: 12,
    letterSpacing: 0.3,
  },
  dailyContentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  dailyContentSource: {
    fontSize: 12,
    marginTop: Spacing.sm,
    fontStyle: "italic",
  },

  // Reflection prompts
  promptsScroll: {
    paddingRight: Spacing.lg,
    gap: Spacing.md,
  },
  promptCard: {
    width: 220,
    padding: Spacing.lg,
  },
  promptIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  promptTitle: {
    fontSize: 14,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  promptText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
