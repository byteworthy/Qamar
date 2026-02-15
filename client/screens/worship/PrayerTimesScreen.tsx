import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import * as Location from "expo-location";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { reschedulePrayerNotifications } from "@/services/notifications";
import {
  calculatePrayerTimes,
  getNextPrayer,
  getCurrentPrayer,
  formatPrayerTime,
  formatCountdown,
  getPrayerStatus,
  CALCULATION_METHODS,
  type PrayerTimesResult,
} from "@/services/prayerTimes";

interface PrayerCardProps {
  name: string;
  time: Date;
  icon: keyof typeof Feather.glyphMap;
  status: "past" | "current" | "upcoming";
  delay: number;
}

function PrayerCard({ name, time, icon, status, delay }: PrayerCardProps) {
  const { theme, isDark } = useTheme();

  const getPrayerColors = () => {
    if (status === "current") {
      return {
        background: isDark
          ? "rgba(212, 175, 55, 0.15)"
          : "rgba(240, 212, 115, 0.2)",
        border: isDark ? "rgba(212, 175, 55, 0.3)" : "rgba(212, 175, 55, 0.4)",
        iconColor: isDark ? "#f0d473" : "#D4AF37",
        textColor: theme.text,
        timeColor: isDark ? "#f0d473" : "#D4AF37",
      };
    } else if (status === "past") {
      return {
        background: "transparent",
        border: theme.border,
        iconColor: theme.textSecondary,
        textColor: theme.textSecondary,
        timeColor: theme.textSecondary,
      };
    } else {
      return {
        background: "transparent",
        border: theme.border,
        iconColor: theme.primary,
        textColor: theme.text,
        timeColor: theme.text,
      };
    }
  };

  const colors = getPrayerColors();

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(delay)}>
      <View
        style={[
          styles.prayerCard,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.prayerCardLeft}>
          <View
            style={[
              styles.prayerIconContainer,
              {
                backgroundColor: isDark
                  ? "rgba(212, 175, 55, 0.1)"
                  : "rgba(240, 212, 115, 0.15)",
              },
            ]}
          >
            <Feather name={icon} size={24} color={colors.iconColor} />
          </View>
          <View>
            <ThemedText style={[styles.prayerName, { color: colors.textColor }]}>
              {name}
            </ThemedText>
            {status === "current" && (
              <ThemedText style={[styles.statusText, { color: colors.iconColor }]}>
                Current Prayer
              </ThemedText>
            )}
          </View>
        </View>
        <ThemedText style={[styles.prayerTime, { color: colors.timeColor }]}>
          {formatPrayerTime(time)}
        </ThemedText>
      </View>
    </Animated.View>
  );
}

export default function PrayerTimesScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesResult | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [countdown, setCountdown] = useState("");
  const [loading, setLoading] = useState(true);
  const [calculationMethod, setCalculationMethod] = useState("MuslimWorldLeague");

  // Request location permission and get location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Location Permission Required",
            "Please enable location permissions to view accurate prayer times for your area.",
            [{ text: "OK" }]
          );
          setLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch (error) {
        console.error("Error getting location:", error);
        Alert.alert(
          "Location Error",
          "Could not get your location. Please check your settings.",
          [{ text: "OK" }]
        );
        setLoading(false);
      }
    })();
  }, []);

  // Calculate prayer times when location or date changes
  useEffect(() => {
    if (location) {
      try {
        const times = calculatePrayerTimes(
          location.latitude,
          location.longitude,
          selectedDate,
          calculationMethod
        );
        setPrayerTimes(times);
        setLoading(false);

        // Reschedule prayer notifications when times recalculate
        const isToday = selectedDate.toDateString() === new Date().toDateString();
        if (isToday) {
          reschedulePrayerNotifications().catch(() => {});
        }
      } catch (error) {
        console.error("Error calculating prayer times:", error);
        setLoading(false);
      }
    }
  }, [location, selectedDate, calculationMethod]);

  // Update countdown every second
  useEffect(() => {
    if (!prayerTimes) return;

    const updateCountdown = () => {
      const next = getNextPrayer(prayerTimes);
      setCountdown(formatCountdown(next.timeUntil));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [prayerTimes]);

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading prayer times...</ThemedText>
        </View>
      </View>
    );
  }

  if (!location || !prayerTimes) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={styles.loadingContainer}>
          <Feather
            name="map-pin"
            size={48}
            color={theme.textSecondary}
            style={{ marginBottom: 16 }}
          />
          <ThemedText style={styles.loadingText}>
            Location permission is required
          </ThemedText>
          <ThemedText style={[styles.loadingSubtext, { color: theme.textSecondary }]}>
            Please enable location services to view prayer times
          </ThemedText>
        </View>
      </View>
    );
  }

  const nextPrayer = getNextPrayer(prayerTimes);
  const prayers = [
    { name: "Fajr", time: prayerTimes.fajr, icon: "moon" as const },
    { name: "Sunrise", time: prayerTimes.sunrise, icon: "sunrise" as const },
    { name: "Dhuhr", time: prayerTimes.dhuhr, icon: "sun" as const },
    { name: "Asr", time: prayerTimes.asr, icon: "sunset" as const },
    { name: "Maghrib", time: prayerTimes.maghrib, icon: "sunset" as const },
    { name: "Isha", time: prayerTimes.isha, icon: "moon" as const },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Animated.View entering={FadeInDown.duration(300)}>
          <ThemedText style={styles.headerTitle}>Prayer Times</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
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
        {/* Date Navigation */}
        <Animated.View entering={FadeInUp.duration(400).delay(100)}>
          <View style={styles.dateNavigation}>
            <Pressable
              onPress={handlePreviousDay}
              style={({ pressed }) => [
                styles.dateButton,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Feather name="chevron-left" size={24} color={theme.text} />
            </Pressable>

            {!isToday && (
              <Pressable
                onPress={handleToday}
                style={({ pressed }) => [
                  styles.todayButton,
                  {
                    backgroundColor: theme.primary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <ThemedText
                  style={[styles.todayButtonText, { color: theme.onPrimary }]}
                >
                  Today
                </ThemedText>
              </Pressable>
            )}

            <Pressable
              onPress={handleNextDay}
              style={({ pressed }) => [
                styles.dateButton,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Feather name="chevron-right" size={24} color={theme.text} />
            </Pressable>
          </View>
        </Animated.View>

        {/* Next Prayer Countdown */}
        {isToday && (
          <Animated.View entering={FadeInUp.duration(400).delay(200)}>
            <GlassCard style={styles.countdownCard} elevated>
              <View style={styles.countdownHeader}>
                <Feather
                  name="clock"
                  size={24}
                  color={isDark ? "#f0d473" : "#D4AF37"}
                />
                <ThemedText style={styles.countdownLabel}>Next Prayer</ThemedText>
              </View>
              <ThemedText
                style={[
                  styles.countdownPrayer,
                  { color: isDark ? "#f0d473" : "#D4AF37" },
                ]}
              >
                {nextPrayer.name}
              </ThemedText>
              <ThemedText style={[styles.countdownTime, { color: theme.text }]}>
                {formatPrayerTime(nextPrayer.time)}
              </ThemedText>
              <ThemedText
                style={[
                  styles.countdownText,
                  { color: isDark ? "#f0d473" : "#D4AF37" },
                ]}
              >
                {countdown}
              </ThemedText>
            </GlassCard>
          </Animated.View>
        )}

        {/* Prayer Times List */}
        <View style={styles.prayersList}>
          {prayers.map((prayer, index) => (
            <PrayerCard
              key={prayer.name}
              name={prayer.name}
              time={prayer.time}
              icon={prayer.icon}
              status={getPrayerStatus(prayer.name, prayerTimes)}
              delay={300 + index * 50}
            />
          ))}
        </View>

        {/* Calculation Method Info */}
        <Animated.View entering={FadeInUp.duration(400).delay(800)}>
          <View style={styles.methodInfo}>
            <ThemedText style={[styles.methodLabel, { color: theme.textSecondary }]}>
              Calculation Method
            </ThemedText>
            <ThemedText style={[styles.methodName, { color: theme.text }]}>
              {CALCULATION_METHODS.find((m) => m.id === calculationMethod)?.name}
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
  },
  loadingSubtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  dateNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
  },
  dateButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  todayButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  todayButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  countdownCard: {
    marginBottom: 24,
    alignItems: "center",
  },
  countdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  countdownLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  countdownPrayer: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  countdownTime: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  countdownText: {
    fontSize: 32,
    fontWeight: "700",
  },
  prayersList: {
    gap: 12,
    marginBottom: 24,
  },
  prayerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  prayerCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  prayerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  prayerName: {
    fontSize: 18,
    fontWeight: "600",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  prayerTime: {
    fontSize: 18,
    fontWeight: "700",
  },
  methodInfo: {
    alignItems: "center",
    paddingVertical: 16,
  },
  methodLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  methodName: {
    fontSize: 14,
    fontWeight: "600",
  },
});
