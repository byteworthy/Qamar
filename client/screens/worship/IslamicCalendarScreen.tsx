import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";

// ============================================================================
// Hijri Calendar Conversion (Tabular Islamic Calendar - offline)
// ============================================================================

const HIJRI_MONTH_NAMES_EN = [
  "Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani",
  "Jumada al-Ula", "Jumada al-Thani", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhul Qi'dah", "Dhul Hijjah",
];

const HIJRI_MONTH_NAMES_AR = [
  "\u0645\u062D\u0631\u0651\u0645",
  "\u0635\u0641\u0631",
  "\u0631\u0628\u064A\u0639 \u0627\u0644\u0623\u0648\u0651\u0644",
  "\u0631\u0628\u064A\u0639 \u0627\u0644\u062B\u0627\u0646\u064A",
  "\u062C\u0645\u0627\u062F\u0649 \u0627\u0644\u0623\u0648\u0644\u0649",
  "\u062C\u0645\u0627\u062F\u0649 \u0627\u0644\u062B\u0627\u0646\u064A\u0629",
  "\u0631\u062C\u0628",
  "\u0634\u0639\u0628\u0627\u0646",
  "\u0631\u0645\u0636\u0627\u0646",
  "\u0634\u0648\u0651\u0627\u0644",
  "\u0630\u0648 \u0627\u0644\u0642\u0639\u062F\u0629",
  "\u0630\u0648 \u0627\u0644\u062D\u062C\u0651\u0629",
];

const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Tabular Islamic Calendar (Type IIa - civil/astronomical variant).
 * This uses a 30-year cycle with 11 leap years.
 * Accuracy: within 1-2 days of actual moon sighting.
 */
const HIJRI_EPOCH_JD = 1948439.5; // Julian Day of 1 Muharram 1 AH (July 16, 622 CE)

// Leap years in the 30-year cycle (years where Dhul Hijjah has 30 days)
const LEAP_YEARS = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];

function isHijriLeapYear(year: number): boolean {
  return LEAP_YEARS.includes(((year - 1) % 30) + 1);
}

function hijriMonthLength(year: number, month: number): number {
  // Odd months = 30 days, even months = 29 days
  // Exception: month 12 in leap years = 30 days
  if (month % 2 === 1) return 30;
  if (month === 12 && isHijriLeapYear(year)) return 30;
  return 29;
}

function hijriYearLength(year: number): number {
  return isHijriLeapYear(year) ? 355 : 354;
}

/** Convert Hijri date to Julian Day Number */
function hijriToJD(year: number, month: number, day: number): number {
  return (
    day +
    Math.ceil(29.5001 * (month - 1)) +
    (year - 1) * 354 +
    Math.floor((3 + 11 * year) / 30) +
    HIJRI_EPOCH_JD -
    385
  );
}

/** Convert Julian Day Number to Hijri date */
function jdToHijri(jd: number): { year: number; month: number; day: number } {
  const jdn = Math.floor(jd) + 0.5;
  const l = Math.floor(jdn - HIJRI_EPOCH_JD + 10632);
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
    Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { year, month, day };
}

/** Convert Gregorian date to Julian Day Number */
function gregorianToJD(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day +
    B -
    1524.5
  );
}

/** Convert Julian Day Number to Gregorian date */
function jdToGregorian(jd: number): { year: number; month: number; day: number } {
  const z = Math.floor(jd + 0.5);
  const a = Math.floor((z - 1867216.25) / 36524.25);
  const aa = z + 1 + a - Math.floor(a / 4);
  const b = aa + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = b - d - Math.floor(30.6001 * e);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  return { year, month, day };
}

function gregorianToHijri(gYear: number, gMonth: number, gDay: number) {
  const jd = gregorianToJD(gYear, gMonth, gDay);
  return jdToHijri(jd);
}

function getTodayHijri() {
  const now = new Date();
  return gregorianToHijri(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/** Get the weekday (0=Sun) of the 1st of a Hijri month */
function getFirstDayOfHijriMonth(year: number, month: number): number {
  const jd = hijriToJD(year, month, 1);
  return Math.floor(jd + 1.5) % 7; // 0=Sun
}

// ============================================================================
// Islamic Events
// ============================================================================

interface IslamicEvent {
  name: string;
  date: string;
  month: number;
  day: number;
  description: string;
  icon: keyof typeof Feather.glyphMap;
}

const ISLAMIC_EVENTS: IslamicEvent[] = [
  { name: "Islamic New Year", date: "1st Muharram", month: 1, day: 1, description: "Beginning of the Islamic calendar year", icon: "calendar" },
  { name: "Day of Ashura", date: "10th Muharram", month: 1, day: 10, description: "Day of fasting and remembrance", icon: "heart" },
  { name: "Mawlid al-Nabi", date: "12th Rabi al-Awwal", month: 3, day: 12, description: "Birth of Prophet Muhammad (PBUH)", icon: "star" },
  { name: "Laylat al-Mi'raj", date: "27th Rajab", month: 7, day: 27, description: "Night Journey and Ascension", icon: "moon" },
  { name: "Laylat al-Bara'ah", date: "15th Sha'ban", month: 8, day: 15, description: "Night of Forgiveness", icon: "heart" },
  { name: "First Day of Ramadan", date: "1st Ramadan", month: 9, day: 1, description: "Beginning of the month of fasting", icon: "moon" },
  { name: "Laylat al-Qadr", date: "27th Ramadan", month: 9, day: 27, description: "Night of Power (last 10 nights)", icon: "star" },
  { name: "Eid al-Fitr", date: "1st Shawwal", month: 10, day: 1, description: "Festival of Breaking the Fast", icon: "gift" },
  { name: "Day of Arafah", date: "9th Dhul Hijjah", month: 12, day: 9, description: "Day of standing on Mount Arafat", icon: "heart" },
  { name: "Eid al-Adha", date: "10th Dhul Hijjah", month: 12, day: 10, description: "Festival of Sacrifice", icon: "gift" },
];

// ============================================================================
// Calendar Grid Component
// ============================================================================

interface CalendarGridProps {
  hijriYear: number;
  hijriMonth: number;
  todayDay: number;
  isTodayMonth: boolean;
  events: IslamicEvent[];
}

function CalendarGrid({ hijriYear, hijriMonth, todayDay, isTodayMonth, events }: CalendarGridProps) {
  const { theme, isDark } = useTheme();
  const daysInMonth = hijriMonthLength(hijriYear, hijriMonth);
  const firstWeekday = getFirstDayOfHijriMonth(hijriYear, hijriMonth);

  // Build the event day set for this month
  const eventDays = useMemo(() => {
    const set = new Set<number>();
    events.filter((e) => e.month === hijriMonth).forEach((e) => set.add(e.day));
    return set;
  }, [events, hijriMonth]);

  // Build rows of 7
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  return (
    <View style={styles.calendarGrid}>
      {/* Weekday headers */}
      <View style={styles.calendarRow}>
        {WEEKDAY_HEADERS.map((d) => (
          <View key={d} style={styles.calendarCell}>
            <ThemedText style={[styles.weekdayHeader, { color: theme.textSecondary }]}>
              {d}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Day rows */}
      {rows.map((row, ri) => (
        <View key={ri} style={styles.calendarRow}>
          {row.map((day, ci) => {
            const isToday = isTodayMonth && day === todayDay;
            const isEvent = day !== null && eventDays.has(day);
            const isFriday = ci === 5;

            return (
              <View key={ci} style={styles.calendarCell}>
                {day !== null ? (
                  <View
                    style={[
                      styles.dayCircle,
                      isToday && {
                        backgroundColor: isDark ? "#D4AF37" : "#D4AF37",
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.dayText,
                        {
                          color: isToday
                            ? "#0f1419"
                            : isFriday
                              ? "#009688"
                              : theme.text,
                        },
                        isToday && { fontWeight: "700" },
                      ]}
                    >
                      {day}
                    </ThemedText>
                    {isEvent && !isToday && (
                      <View style={styles.eventDot} />
                    )}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ============================================================================
// Event Card
// ============================================================================

interface EventCardProps {
  event: IslamicEvent;
  currentMonth: number;
  currentDay: number;
  delay: number;
}

function EventCard({ event, currentMonth, currentDay, delay }: EventCardProps) {
  const { theme, isDark } = useTheme();

  const calculateDaysUntil = () => {
    if (event.month > currentMonth) {
      return (event.month - currentMonth) * 30 + (event.day - currentDay);
    } else if (event.month === currentMonth) {
      if (event.day >= currentDay) return event.day - currentDay;
      return (12 - currentMonth + event.month) * 30 + (event.day - currentDay);
    }
    return (12 - currentMonth + event.month) * 30 + (event.day - currentDay);
  };

  const daysUntil = calculateDaysUntil();
  const isToday = daysUntil === 0;

  const colors = isToday
    ? {
        bg: isDark ? "rgba(212, 175, 55, 0.15)" : "rgba(240, 212, 115, 0.2)",
        border: isDark ? "rgba(212, 175, 55, 0.3)" : "rgba(212, 175, 55, 0.4)",
        icon: isDark ? "#f0d473" : "#D4AF37",
        accent: isDark ? "#f0d473" : "#D4AF37",
      }
    : daysUntil <= 7 && daysUntil > 0
      ? {
          bg: isDark ? "rgba(100, 150, 100, 0.1)" : "rgba(120, 180, 120, 0.15)",
          border: isDark ? "rgba(100, 150, 100, 0.3)" : "rgba(100, 150, 100, 0.4)",
          icon: theme.primary,
          accent: theme.primary,
        }
      : {
          bg: "transparent",
          border: theme.border,
          icon: theme.textSecondary,
          accent: theme.textSecondary,
        };

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(delay)}>
      <View
        style={[
          styles.eventCard,
          { backgroundColor: colors.bg, borderColor: colors.border },
        ]}
      >
        <View style={styles.eventCardLeft}>
          <View
            style={[
              styles.eventIconContainer,
              {
                backgroundColor: isDark
                  ? "rgba(212, 175, 55, 0.1)"
                  : "rgba(240, 212, 115, 0.15)",
              },
            ]}
          >
            <Feather name={event.icon} size={24} color={colors.icon} />
          </View>
          <View style={styles.eventDetails}>
            <ThemedText style={[styles.eventName, { color: theme.text }]}>
              {event.name}
            </ThemedText>
            <ThemedText style={[styles.eventDate, { color: theme.textSecondary }]}>
              {event.date}
            </ThemedText>
            <ThemedText style={[styles.eventDescription, { color: theme.textSecondary }]}>
              {event.description}
            </ThemedText>
          </View>
        </View>
        <View style={styles.eventCardRight}>
          {isToday ? (
            <View style={[styles.todayBadge, { backgroundColor: colors.accent }]}>
              <ThemedText style={[styles.todayBadgeText, { color: "#0f1419" }]}>
                Today
              </ThemedText>
            </View>
          ) : daysUntil > 0 && daysUntil <= 30 ? (
            <View style={styles.daysContainer}>
              <ThemedText style={[styles.daysNumber, { color: colors.accent }]}>
                {daysUntil}
              </ThemedText>
              <ThemedText style={[styles.daysLabel, { color: theme.textSecondary }]}>
                {daysUntil === 1 ? "day" : "days"}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

// ============================================================================
// Main Screen
// ============================================================================

export default function IslamicCalendarScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const todayHijri = useMemo(() => getTodayHijri(), []);
  const [viewYear, setViewYear] = useState(todayHijri.year);
  const [viewMonth, setViewMonth] = useState(todayHijri.month);

  const isTodayMonth = viewYear === todayHijri.year && viewMonth === todayHijri.month;

  const gregorianDate = new Date();

  const navigateMonth = (delta: number) => {
    let newMonth = viewMonth + delta;
    let newYear = viewYear;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    setViewMonth(newMonth);
    setViewYear(newYear);
  };

  const goToToday = () => {
    setViewYear(todayHijri.year);
    setViewMonth(todayHijri.month);
  };

  // Events for current viewed month
  const monthEvents = useMemo(
    () => ISLAMIC_EVENTS.filter((e) => e.month === viewMonth),
    [viewMonth]
  );

  // Sort all events by proximity
  const sortedEvents = useMemo(() => {
    return [...ISLAMIC_EVENTS].sort((a, b) => {
      const getDays = (e: IslamicEvent) => {
        if (e.month > todayHijri.month)
          return (e.month - todayHijri.month) * 30 + (e.day - todayHijri.day);
        if (e.month === todayHijri.month) {
          if (e.day >= todayHijri.day) return e.day - todayHijri.day;
          return (12 - todayHijri.month + e.month) * 30 + (e.day - todayHijri.day);
        }
        return (12 - todayHijri.month + e.month) * 30 + (e.day - todayHijri.day);
      };
      return getDays(a) - getDays(b);
    });
  }, [todayHijri]);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Animated.View entering={FadeInDown.duration(300)}>
          <ThemedText style={styles.headerTitle}>Islamic Calendar</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Hijri dates and important events
          </ThemedText>
        </Animated.View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Hijri Date Card */}
        <Animated.View entering={FadeInUp.duration(400).delay(100)}>
          <GlassCard style={styles.dateCard} elevated>
            <View style={styles.dateHeader}>
              <Feather
                name="calendar"
                size={28}
                color={isDark ? "#f0d473" : "#D4AF37"}
              />
              <ThemedText style={styles.dateLabel}>Today's Date</ThemedText>
            </View>

            {/* Arabic month name */}
            <ThemedText
              style={[
                styles.arabicMonthName,
                { fontFamily: "Amiri-Bold", color: isDark ? "#f0d473" : "#D4AF37" },
              ]}
            >
              {HIJRI_MONTH_NAMES_AR[todayHijri.month - 1]}
            </ThemedText>

            {/* Hijri Date */}
            <ThemedText
              style={[
                styles.hijriDate,
                { color: isDark ? "#f0d473" : "#D4AF37" },
              ]}
            >
              {todayHijri.day} {HIJRI_MONTH_NAMES_EN[todayHijri.month - 1]} {todayHijri.year} AH
            </ThemedText>

            {/* Gregorian Date */}
            <ThemedText style={[styles.gregorianDate, { color: theme.textSecondary }]}>
              {gregorianDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </ThemedText>
          </GlassCard>
        </Animated.View>

        {/* Month Calendar Grid */}
        <Animated.View entering={FadeInUp.duration(400).delay(200)}>
          <GlassCard style={styles.calendarCard} elevated>
            {/* Month Navigation */}
            <View style={styles.monthNav}>
              <Pressable onPress={() => navigateMonth(-1)} style={styles.navButton}>
                <Feather name="chevron-left" size={22} color={theme.text} />
              </Pressable>

              <Pressable onPress={goToToday} style={styles.monthTitleContainer}>
                <ThemedText
                  style={[
                    styles.monthTitleArabic,
                    { fontFamily: "Amiri-Bold", color: theme.primary },
                  ]}
                >
                  {HIJRI_MONTH_NAMES_AR[viewMonth - 1]}
                </ThemedText>
                <ThemedText style={[styles.monthTitleEnglish, { color: theme.text }]}>
                  {HIJRI_MONTH_NAMES_EN[viewMonth - 1]} {viewYear}
                </ThemedText>
              </Pressable>

              <Pressable onPress={() => navigateMonth(1)} style={styles.navButton}>
                <Feather name="chevron-right" size={22} color={theme.text} />
              </Pressable>
            </View>

            {/* Calendar Grid */}
            <CalendarGrid
              hijriYear={viewYear}
              hijriMonth={viewMonth}
              todayDay={todayHijri.day}
              isTodayMonth={isTodayMonth}
              events={ISLAMIC_EVENTS}
            />

            {/* Events in this month */}
            {monthEvents.length > 0 && (
              <View style={styles.monthEventsContainer}>
                {monthEvents.map((event) => (
                  <View
                    key={event.name}
                    style={[styles.monthEventRow, { borderColor: theme.border }]}
                  >
                    <View
                      style={[
                        styles.monthEventDot,
                        { backgroundColor: "#D4AF37" },
                      ]}
                    />
                    <ThemedText style={[styles.monthEventDay, { color: theme.primary }]}>
                      {event.day}
                    </ThemedText>
                    <ThemedText style={[styles.monthEventName, { color: theme.text }]}>
                      {event.name}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}
          </GlassCard>
        </Animated.View>

        {/* Important Islamic Events */}
        <Animated.View entering={FadeInUp.duration(400).delay(300)}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            Important Events
          </ThemedText>
        </Animated.View>

        <View style={styles.eventsList}>
          {sortedEvents.map((event, index) => (
            <EventCard
              key={event.name}
              event={event}
              currentMonth={todayHijri.month}
              currentDay={todayHijri.day}
              delay={350 + index * 50}
            />
          ))}
        </View>

        {/* Info Note */}
        <Animated.View entering={FadeInUp.duration(400).delay(800)}>
          <View style={styles.infoNote}>
            <Feather
              name="info"
              size={16}
              color={theme.textSecondary}
              style={{ marginRight: 8 }}
            />
            <ThemedText style={[styles.infoText, { color: theme.textSecondary }]}>
              Islamic dates are calculated using the tabular calendar and may vary by 1-2 days depending on moon sighting in your location.
            </ThemedText>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  // Date Card
  dateCard: {
    marginBottom: 16,
    alignItems: "center",
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  arabicMonthName: {
    fontSize: 36,
    lineHeight: 52,
    textAlign: "center",
    marginBottom: 4,
  },
  hijriDate: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  gregorianDate: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
  // Calendar Card
  calendarCard: {
    marginBottom: 24,
    padding: 16,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  monthTitleContainer: {
    alignItems: "center",
  },
  monthTitleArabic: {
    fontSize: 24,
    lineHeight: 34,
    textAlign: "center",
  },
  monthTitleEnglish: {
    fontSize: 14,
    fontWeight: "600",
  },
  // Calendar Grid
  calendarGrid: {
    gap: 2,
  },
  calendarRow: {
    flexDirection: "row",
  },
  calendarCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  weekdayHeader: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
  },
  eventDot: {
    position: "absolute",
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D4AF37",
  },
  // Month events legend
  monthEventsContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(128, 128, 128, 0.2)",
    gap: 8,
  },
  monthEventRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  monthEventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  monthEventDay: {
    fontSize: 13,
    fontWeight: "700",
    width: 24,
  },
  monthEventName: {
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  // Events Section
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  eventsList: {
    gap: 12,
    marginBottom: 24,
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  eventCardLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },
  eventIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  eventDetails: {
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  eventCardRight: {
    marginLeft: 12,
    alignItems: "center",
  },
  todayBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  todayBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  daysContainer: {
    alignItems: "center",
  },
  daysNumber: {
    fontSize: 20,
    fontWeight: "700",
  },
  daysLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  // Info
  infoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(128, 128, 128, 0.1)",
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  // Loading (kept for potential future use)
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 16,
  },
});
