import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";

interface HijriDate {
  date: string;
  format: string;
  day: string;
  weekday: {
    en: string;
    ar: string;
  };
  month: {
    number: number;
    en: string;
    ar: string;
  };
  year: string;
  designation: {
    abbreviated: string;
    expanded: string;
  };
  holidays: string[];
}

interface IslamicEvent {
  name: string;
  date: string; // Hijri date string
  month: number;
  day: number;
  description: string;
  icon: keyof typeof Feather.glyphMap;
}

// Major Islamic dates for the year
const ISLAMIC_EVENTS: IslamicEvent[] = [
  {
    name: "Islamic New Year",
    date: "1st Muharram",
    month: 1,
    day: 1,
    description: "Beginning of the Islamic calendar year",
    icon: "calendar",
  },
  {
    name: "Day of Ashura",
    date: "10th Muharram",
    month: 1,
    day: 10,
    description: "Day of fasting and remembrance",
    icon: "heart",
  },
  {
    name: "Mawlid al-Nabi",
    date: "12th Rabi al-Awwal",
    month: 3,
    day: 12,
    description: "Birth of Prophet Muhammad (PBUH)",
    icon: "star",
  },
  {
    name: "Laylat al-Mi'raj",
    date: "27th Rajab",
    month: 7,
    day: 27,
    description: "Night Journey and Ascension",
    icon: "moon",
  },
  {
    name: "Laylat al-Bara'ah",
    date: "15th Sha'ban",
    month: 8,
    day: 15,
    description: "Night of Forgiveness",
    icon: "heart",
  },
  {
    name: "First Day of Ramadan",
    date: "1st Ramadan",
    month: 9,
    day: 1,
    description: "Beginning of the blessed month",
    icon: "moon",
  },
  {
    name: "Laylat al-Qadr",
    date: "27th Ramadan",
    month: 9,
    day: 27,
    description: "Night of Power (last 10 nights)",
    icon: "star",
  },
  {
    name: "Eid al-Fitr",
    date: "1st Shawwal",
    month: 10,
    day: 1,
    description: "Festival of Breaking the Fast",
    icon: "sun",
  },
  {
    name: "Day of Arafah",
    date: "9th Dhul Hijjah",
    month: 12,
    day: 9,
    description: "Day of standing on Mount Arafat",
    icon: "heart",
  },
  {
    name: "Eid al-Adha",
    date: "10th Dhul Hijjah",
    month: 12,
    day: 10,
    description: "Festival of Sacrifice",
    icon: "sun",
  },
];

interface EventCardProps {
  event: IslamicEvent;
  currentMonth: number;
  currentDay: number;
  currentYear: number;
  delay: number;
}

function EventCard({
  event,
  currentMonth,
  currentDay,
  currentYear,
  delay,
}: EventCardProps) {
  const { theme, isDark } = useTheme();

  // Calculate days until this event
  const calculateDaysUntil = () => {
    // Simple calculation: if month hasn't passed, calculate days
    // If month passed, it's next year
    let daysUntil = 0;

    if (event.month > currentMonth) {
      // Event is later this year - rough estimate
      daysUntil = (event.month - currentMonth) * 30 + (event.day - currentDay);
    } else if (event.month === currentMonth) {
      if (event.day >= currentDay) {
        daysUntil = event.day - currentDay;
      } else {
        // Event passed this month, next year
        daysUntil = (12 - currentMonth + event.month) * 30 + (event.day - currentDay);
      }
    } else {
      // Event is next year
      daysUntil = (12 - currentMonth + event.month) * 30 + (event.day - currentDay);
    }

    return daysUntil;
  };

  const daysUntil = calculateDaysUntil();
  const isPast = daysUntil < 0;
  const isToday = daysUntil === 0;

  const getEventColors = () => {
    if (isToday) {
      return {
        background: isDark
          ? "rgba(212, 175, 55, 0.15)"
          : "rgba(240, 212, 115, 0.2)",
        border: isDark ? "rgba(212, 175, 55, 0.3)" : "rgba(212, 175, 55, 0.4)",
        iconColor: isDark ? "#f0d473" : "#D4AF37",
        textColor: theme.text,
        accentColor: isDark ? "#f0d473" : "#D4AF37",
      };
    } else if (daysUntil <= 7 && daysUntil > 0) {
      return {
        background: isDark
          ? "rgba(100, 150, 100, 0.1)"
          : "rgba(120, 180, 120, 0.15)",
        border: isDark ? "rgba(100, 150, 100, 0.3)" : "rgba(100, 150, 100, 0.4)",
        iconColor: theme.primary,
        textColor: theme.text,
        accentColor: theme.primary,
      };
    } else {
      return {
        background: "transparent",
        border: theme.border,
        iconColor: theme.textSecondary,
        textColor: theme.text,
        accentColor: theme.textSecondary,
      };
    }
  };

  const colors = getEventColors();

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(delay)}>
      <View
        style={[
          styles.eventCard,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
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
            <Feather name={event.icon} size={24} color={colors.iconColor} />
          </View>
          <View style={styles.eventDetails}>
            <ThemedText style={[styles.eventName, { color: colors.textColor }]}>
              {event.name}
            </ThemedText>
            <ThemedText
              style={[styles.eventDate, { color: theme.textSecondary }]}
            >
              {event.date}
            </ThemedText>
            <ThemedText
              style={[styles.eventDescription, { color: theme.textSecondary }]}
            >
              {event.description}
            </ThemedText>
          </View>
        </View>
        <View style={styles.eventCardRight}>
          {isToday ? (
            <View style={[styles.todayBadge, { backgroundColor: colors.accentColor }]}>
              <ThemedText style={[styles.todayText, { color: theme.onPrimary }]}>
                Today
              </ThemedText>
            </View>
          ) : daysUntil > 0 && daysUntil <= 30 ? (
            <View style={styles.daysContainer}>
              <ThemedText
                style={[styles.daysNumber, { color: colors.accentColor }]}
              >
                {daysUntil}
              </ThemedText>
              <ThemedText
                style={[styles.daysLabel, { color: theme.textSecondary }]}
              >
                {daysUntil === 1 ? "day" : "days"}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

export default function IslamicCalendarScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHijriDate();
  }, []);

  const fetchHijriDate = async () => {
    try {
      setLoading(true);
      setError(null);

      const today = new Date();
      const day = String(today.getDate()).padStart(2, "0");
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const year = today.getFullYear();

      const response = await fetch(
        `https://api.aladhan.com/v1/gToH/${day}-${month}-${year}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch Hijri date");
      }

      const data = await response.json();

      if (data.code === 200 && data.data && data.data.hijri) {
        setHijriDate(data.data.hijri);
      } else {
        throw new Error("Invalid response from API");
      }
    } catch (err) {
      console.error("Error fetching Hijri date:", err);
      setError("Unable to load Islamic calendar. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText style={styles.loadingText}>
            Loading Islamic calendar...
          </ThemedText>
        </View>
      </View>
    );
  }

  if (error || !hijriDate) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={styles.loadingContainer}>
          <Feather
            name="calendar"
            size={48}
            color={theme.textSecondary}
            style={{ marginBottom: 16 }}
          />
          <ThemedText style={styles.loadingText}>{error || "Error loading calendar"}</ThemedText>
        </View>
      </View>
    );
  }

  const gregorianDate = new Date();
  const currentMonth = parseInt(hijriDate.month.number.toString());
  const currentDay = parseInt(hijriDate.day);
  const currentYear = parseInt(hijriDate.year);

  // Sort events by proximity (upcoming first)
  const sortedEvents = [...ISLAMIC_EVENTS].sort((a, b) => {
    const getDaysUntil = (event: IslamicEvent) => {
      if (event.month > currentMonth) {
        return (event.month - currentMonth) * 30 + (event.day - currentDay);
      } else if (event.month === currentMonth) {
        if (event.day >= currentDay) {
          return event.day - currentDay;
        } else {
          return (12 - currentMonth + event.month) * 30 + (event.day - currentDay);
        }
      } else {
        return (12 - currentMonth + event.month) * 30 + (event.day - currentDay);
      }
    };

    return getDaysUntil(a) - getDaysUntil(b);
  });

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

            {/* Hijri Date */}
            <ThemedText
              style={[
                styles.hijriDate,
                { color: isDark ? "#f0d473" : "#D4AF37" },
              ]}
            >
              {hijriDate.day} {hijriDate.month.en} {hijriDate.year} {hijriDate.designation.abbreviated}
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

            {/* Weekday in Arabic */}
            <View style={styles.weekdayContainer}>
              <ThemedText style={[styles.weekdayArabic, { color: theme.text }]}>
                {hijriDate.weekday.ar}
              </ThemedText>
              <ThemedText style={[styles.weekdayEnglish, { color: theme.textSecondary }]}>
                {hijriDate.weekday.en}
              </ThemedText>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Important Islamic Events */}
        <Animated.View entering={FadeInUp.duration(400).delay(200)}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            Important Events
          </ThemedText>
        </Animated.View>

        <View style={styles.eventsList}>
          {sortedEvents.map((event, index) => (
            <EventCard
              key={event.name}
              event={event}
              currentMonth={currentMonth}
              currentDay={currentDay}
              currentYear={currentYear}
              delay={300 + index * 50}
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
              Islamic dates may vary by 1-2 days depending on moon sighting in your location.
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
  dateCard: {
    marginBottom: 24,
    alignItems: "center",
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  hijriDate: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  gregorianDate: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 16,
  },
  weekdayContainer: {
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.2)",
    width: "100%",
  },
  weekdayArabic: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  weekdayEnglish: {
    fontSize: 14,
    fontWeight: "500",
  },
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
  todayText: {
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
});
