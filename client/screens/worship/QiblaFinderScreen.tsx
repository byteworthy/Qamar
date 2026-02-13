import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  FadeInUp,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as Location from "expo-location";
import { Magnetometer } from "expo-sensors";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { getQiblaDirection } from "@/services/prayerTimes";

const { width } = Dimensions.get("window");
const COMPASS_SIZE = width * 0.75;

// Makkah coordinates for distance calculation
const MAKKAH_LAT = 21.4225;
const MAKKAH_LNG = 39.8262;

// Magnetometer accuracy thresholds
const ACCURACY_THRESHOLD_HIGH = 50; // Good reading
const ACCURACY_THRESHOLD_MEDIUM = 30; // Acceptable
const VARIANCE_THRESHOLD = 15; // Variance threshold for stability

export default function QiblaFinderScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [magnetometerData, setMagnetometerData] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [calibrationNeeded, setCalibrationNeeded] = useState(false);
  const [lastHapticTime, setLastHapticTime] = useState(0);
  const [accuracy, setAccuracy] = useState<"high" | "medium" | "low">("low");
  const [distanceToMakkah, setDistanceToMakkah] = useState<number>(0);

  // Refs for accuracy calculation
  const magnetometerHistory = useRef<Array<{ x: number; y: number; z: number }>>([]);
  const lastRotation = useRef<number>(0);

  const rotation = useSharedValue(0);
  const accuracyOpacity = useSharedValue(0);

  /**
   * Calculate distance to Makkah using Haversine formula
   * Returns distance in kilometers
   */
  const calculateDistanceToMakkah = (lat: number, lng: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((MAKKAH_LAT - lat) * Math.PI) / 180;
    const dLng = ((MAKKAH_LNG - lng) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((MAKKAH_LAT * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  /**
   * Calculate magnetometer accuracy based on magnitude and variance
   */
  const calculateAccuracy = (
    x: number,
    y: number,
    z: number
  ): "high" | "medium" | "low" => {
    // Calculate magnitude
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    // Add to history (keep last 10 readings)
    magnetometerHistory.current.push({ x, y, z });
    if (magnetometerHistory.current.length > 10) {
      magnetometerHistory.current.shift();
    }

    // Need at least 5 readings for accuracy assessment
    if (magnetometerHistory.current.length < 5) {
      return "low";
    }

    // Calculate variance
    const magnitudes = magnetometerHistory.current.map((reading) =>
      Math.sqrt(reading.x * reading.x + reading.y * reading.y + reading.z * reading.z)
    );
    const avgMagnitude =
      magnitudes.reduce((sum, val) => sum + val, 0) / magnitudes.length;
    const variance =
      magnitudes.reduce((sum, val) => sum + Math.pow(val - avgMagnitude, 2), 0) /
      magnitudes.length;

    // Determine accuracy
    // High variance = unstable = needs calibration
    // Low magnitude = weak signal = needs calibration
    if (magnitude > ACCURACY_THRESHOLD_HIGH && variance < VARIANCE_THRESHOLD) {
      return "high";
    } else if (
      magnitude > ACCURACY_THRESHOLD_MEDIUM &&
      variance < VARIANCE_THRESHOLD * 1.5
    ) {
      return "medium";
    } else {
      return "low";
    }
  };

  // Request location permission and get location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Location Permission Required",
            "Please enable location permissions to find the Qibla direction.",
            [{ text: "OK" }]
          );
          setLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const locData = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setLocation(locData);

        // Calculate Qibla direction
        const qibla = getQiblaDirection(locData.latitude, locData.longitude);
        setQiblaDirection(qibla);

        // Calculate distance to Makkah
        const distance = calculateDistanceToMakkah(
          locData.latitude,
          locData.longitude
        );
        setDistanceToMakkah(distance);

        setLoading(false);
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

  // Subscribe to magnetometer
  useEffect(() => {
    let subscription: any;

    const startMagnetometer = async () => {
      try {
        // Check if magnetometer is available
        const isAvailable = await Magnetometer.isAvailableAsync();
        if (!isAvailable) {
          Alert.alert(
            "Compass Not Available",
            "Your device does not have a magnetometer sensor.",
            [{ text: "OK" }]
          );
          return;
        }

        // Set update interval (50ms = 20Hz for smoother updates)
        Magnetometer.setUpdateInterval(50);

        subscription = Magnetometer.addListener(
          (data: { x: number; y: number; z: number }) => {
            // Calculate accuracy based on magnetometer data quality
            const accuracyLevel = calculateAccuracy(data.x, data.y, data.z);
            setAccuracy(accuracyLevel);

            // Determine if calibration is needed
            const needsCalibration = accuracyLevel === "low";
            setCalibrationNeeded(needsCalibration);

            // Animate accuracy indicator opacity
            accuracyOpacity.value = withTiming(1, {
              duration: 300,
              easing: Easing.out(Easing.ease),
            });

            // Calculate compass heading from magnetometer data
            let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
            // Normalize to 0-360
            angle = (angle + 360) % 360;

            // Apply simple low-pass filter for smoother rotation
            // This reduces jitter from noisy magnetometer readings
            const alpha = 0.15; // Smoothing factor (lower = smoother but more lag)
            const smoothedAngle =
              lastRotation.current +
              alpha * ((angle - lastRotation.current + 540) % 360 - 180);
            lastRotation.current = smoothedAngle;

            setMagnetometerData(smoothedAngle);
          }
        );
      } catch (error) {
        console.error("Error starting magnetometer:", error);
      }
    };

    startMagnetometer();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Update compass rotation
  useEffect(() => {
    if (qiblaDirection !== null) {
      // Calculate the angle difference between current heading and Qibla
      let targetRotation = qiblaDirection - magnetometerData;
      // Normalize to -180 to 180 for shortest rotation path
      while (targetRotation > 180) targetRotation -= 360;
      while (targetRotation < -180) targetRotation += 360;

      // Use spring animation for smooth, natural rotation
      // Higher damping = less bouncy, higher stiffness = faster response
      rotation.value = withSpring(-targetRotation, {
        damping: 25,
        stiffness: 100,
        mass: 0.8,
        overshootClamping: false,
      });

      // Haptic feedback when pointing in the right direction (within 5 degrees)
      const isAligned = Math.abs(targetRotation) < 5;
      if (isAligned && accuracy !== "low") {
        const now = Date.now();
        // Only trigger haptic every 2 seconds to avoid spam
        if (now - lastHapticTime > 2000) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setLastHapticTime(now);
        }
      }
    }
  }, [magnetometerData, qiblaDirection, accuracy]);

  const compassRotationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const arrowRotationStyle = useAnimatedStyle(() => {
    // Arrow always points up (to Qibla) when compass is correctly aligned
    return {
      transform: [{ rotate: "0deg" }],
    };
  });

  const accuracyIndicatorStyle = useAnimatedStyle(() => {
    return {
      opacity: accuracyOpacity.value,
    };
  });

  // Get accuracy color and label
  const getAccuracyInfo = () => {
    switch (accuracy) {
      case "high":
        return {
          color: theme.success,
          label: "High Accuracy",
          icon: "check-circle" as const,
        };
      case "medium":
        return {
          color: theme.warning,
          label: "Medium Accuracy",
          icon: "alert-circle" as const,
        };
      case "low":
        return {
          color: theme.error,
          label: "Low Accuracy",
          icon: "x-circle" as const,
        };
    }
  };

  const accuracyInfo = getAccuracyInfo();

  // Format distance to Makkah
  const formatDistance = (km: number): string => {
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    } else if (km < 10) {
      return `${km.toFixed(1)} km`;
    } else {
      return `${Math.round(km).toLocaleString()} km`;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Finding Qibla direction...</ThemedText>
        </View>
      </View>
    );
  }

  if (!location) {
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
            Please enable location services to find the Qibla
          </ThemedText>
        </View>
      </View>
    );
  }

  const degreesToQibla = Math.round(qiblaDirection);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Animated.View entering={FadeInDown.duration(300)}>
          <ThemedText style={styles.headerTitle}>Qibla Finder</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Point your device toward Makkah
          </ThemedText>
        </Animated.View>
      </View>

      <View style={styles.content}>
        {/* Accuracy Indicator */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(100)}
          style={accuracyIndicatorStyle}
        >
          <GlassCard
            style={[
              styles.accuracyCard,
              {
                borderColor: accuracyInfo.color + "40",
                backgroundColor: isDark
                  ? accuracyInfo.color + "15"
                  : accuracyInfo.color + "10",
              },
            ] as ViewStyle}
          >
            <View style={styles.accuracyRow}>
              <Feather
                name={accuracyInfo.icon}
                size={20}
                color={accuracyInfo.color}
                style={{ marginRight: 8 }}
              />
              <ThemedText
                style={[styles.accuracyLabel, { color: accuracyInfo.color }]}
              >
                {accuracyInfo.label}
              </ThemedText>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Calibration Warning */}
        {calibrationNeeded && (
          <Animated.View entering={FadeInUp.duration(400).delay(200)}>
            <GlassCard style={styles.calibrationCard}>
              <Feather
                name="rotate-cw"
                size={20}
                color={theme.warning}
                style={{ marginRight: 8 }}
              />
              <View style={{ flex: 1 }}>
                <ThemedText
                  style={[styles.calibrationTitle, { color: theme.warning }]}
                >
                  Calibration Needed
                </ThemedText>
                <ThemedText
                  style={[
                    styles.calibrationText,
                    { color: theme.textSecondary },
                  ]}
                >
                  Move your device in a figure-8 pattern to improve accuracy
                </ThemedText>
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Compass */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(200)}
          style={styles.compassContainer}
        >
          <View
            style={[
              styles.compassOuter,
              {
                width: COMPASS_SIZE,
                height: COMPASS_SIZE,
                backgroundColor: isDark
                  ? "rgba(212, 175, 55, 0.05)"
                  : "rgba(240, 212, 115, 0.1)",
                borderColor: isDark
                  ? "rgba(212, 175, 55, 0.2)"
                  : "rgba(212, 175, 55, 0.3)",
              },
            ]}
          >
            {/* Compass Rose (rotates with device heading) */}
            <Animated.View style={[styles.compass, compassRotationStyle]}>
              {/* Cardinal directions */}
              <View style={styles.cardinalContainer}>
                <View style={styles.cardinalMark}>
                  <ThemedText
                    style={[styles.cardinalText, { color: theme.textSecondary }]}
                  >
                    N
                  </ThemedText>
                </View>
                <View style={[styles.cardinalMark, styles.cardinalEast]}>
                  <ThemedText
                    style={[styles.cardinalText, { color: theme.textSecondary }]}
                  >
                    E
                  </ThemedText>
                </View>
                <View style={[styles.cardinalMark, styles.cardinalSouth]}>
                  <ThemedText
                    style={[styles.cardinalText, { color: theme.textSecondary }]}
                  >
                    S
                  </ThemedText>
                </View>
                <View style={[styles.cardinalMark, styles.cardinalWest]}>
                  <ThemedText
                    style={[styles.cardinalText, { color: theme.textSecondary }]}
                  >
                    W
                  </ThemedText>
                </View>
              </View>

              {/* Degree markers */}
              {[...Array(36)].map((_, i) => {
                const angle = i * 10;
                const isCardinal = angle % 90 === 0;
                return (
                  <View
                    key={i}
                    style={[
                      styles.degreeMark,
                      {
                        transform: [{ rotate: `${angle}deg` }],
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.degreeMarkLine,
                        {
                          height: isCardinal ? 16 : 8,
                          backgroundColor: isDark
                            ? "rgba(212, 175, 55, 0.3)"
                            : "rgba(212, 175, 55, 0.4)",
                        },
                      ]}
                    />
                  </View>
                );
              })}
            </Animated.View>

            {/* Qibla Arrow (fixed, points to Qibla) */}
            <View style={styles.arrowContainer}>
              <Animated.View style={arrowRotationStyle}>
                <Feather
                  name="navigation"
                  size={80}
                  color={isDark ? "#f0d473" : "#D4AF37"}
                  style={styles.arrowIcon}
                />
              </Animated.View>
            </View>

            {/* Center dot */}
            <View
              style={[
                styles.centerDot,
                {
                  backgroundColor: isDark ? "#f0d473" : "#D4AF37",
                },
              ]}
            />
          </View>
        </Animated.View>

        {/* Qibla Direction Info */}
        <Animated.View entering={FadeInUp.duration(400).delay(400)}>
          <GlassCard style={styles.infoCard} elevated>
            <View style={styles.infoRow}>
              <Feather
                name="compass"
                size={24}
                color={isDark ? "#f0d473" : "#D4AF37"}
              />
              <View style={styles.infoTextContainer}>
                <ThemedText style={[styles.infoLabel, { color: theme.textSecondary }]}>
                  Qibla Direction
                </ThemedText>
                <ThemedText
                  style={[
                    styles.infoValue,
                    { color: isDark ? "#f0d473" : "#D4AF37" },
                  ]}
                >
                  {degreesToQibla}°
                </ThemedText>
              </View>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />
            <View style={styles.infoRow}>
              <Feather
                name="navigation"
                size={24}
                color={isDark ? "#f0d473" : "#D4AF37"}
              />
              <View style={styles.infoTextContainer}>
                <ThemedText style={[styles.infoLabel, { color: theme.textSecondary }]}>
                  Distance to Makkah
                </ThemedText>
                <ThemedText
                  style={[
                    styles.infoValue,
                    { color: isDark ? "#f0d473" : "#D4AF37" },
                  ]}
                >
                  {formatDistance(distanceToMakkah)}
                </ThemedText>
              </View>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />
            <View style={styles.infoRow}>
              <Feather
                name="map-pin"
                size={24}
                color={isDark ? "#f0d473" : "#D4AF37"}
              />
              <View style={styles.infoTextContainer}>
                <ThemedText style={[styles.infoLabel, { color: theme.textSecondary }]}>
                  Your Location
                </ThemedText>
                <ThemedText style={[styles.infoValue, { color: theme.text }]}>
                  {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
                </ThemedText>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Instructions */}
        <Animated.View entering={FadeInUp.duration(400).delay(500)}>
          <View style={styles.instructions}>
            <ThemedText style={[styles.instructionText, { color: theme.textSecondary }]}>
              Hold your device flat and rotate until the arrow points upward.
              You'll feel a vibration when aligned with the Qibla.
            </ThemedText>
          </View>
        </Animated.View>
      </View>
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
  content: {
    flex: 1,
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
  accuracyCard: {
    marginBottom: 12,
    borderWidth: 1,
  },
  accuracyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  accuracyLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  calibrationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingVertical: 16,
  },
  calibrationTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  calibrationText: {
    fontSize: 13,
    lineHeight: 18,
  },
  compassContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 40,
  },
  compassOuter: {
    borderRadius: 1000,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  compass: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  cardinalContainer: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  cardinalMark: {
    position: "absolute",
    top: 10,
    left: "50%",
    transform: [{ translateX: -15 }],
  },
  cardinalEast: {
    top: "50%",
    left: "auto",
    right: 10,
    transform: [{ translateY: -15 }],
  },
  cardinalSouth: {
    top: "auto",
    bottom: 10,
    left: "50%",
    transform: [{ translateX: -15 }],
  },
  cardinalWest: {
    top: "50%",
    left: 10,
    transform: [{ translateY: -15 }],
  },
  cardinalText: {
    fontSize: 18,
    fontWeight: "700",
    width: 30,
    textAlign: "center",
  },
  degreeMark: {
    position: "absolute",
    width: 2,
    height: COMPASS_SIZE / 2,
    alignItems: "center",
  },
  degreeMarkLine: {
    width: 2,
  },
  arrowContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  arrowIcon: {
    transform: [{ rotate: "-45deg" }], // Feather's navigation icon needs rotation
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: "absolute",
  },
  infoCard: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  infoDivider: {
    height: 1,
    marginVertical: 16,
  },
  instructions: {
    paddingHorizontal: 8,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
