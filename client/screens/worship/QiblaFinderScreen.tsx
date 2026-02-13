import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  FadeInUp,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
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

  const rotation = useSharedValue(0);

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

        // Set update interval (100ms = 10Hz)
        Magnetometer.setUpdateInterval(100);

        subscription = Magnetometer.addListener((data: { x: number; y: number; z: number }) => {
          // Calculate compass heading from magnetometer data
          let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
          // Normalize to 0-360
          angle = (angle + 360) % 360;
          setMagnetometerData(angle);

          // Simple calibration check - if readings are very stable, might need calibration
          // (This is a simplified check; real calibration is more complex)
          if (Math.abs(data.x) < 0.1 && Math.abs(data.y) < 0.1 && Math.abs(data.z) < 0.1) {
            setCalibrationNeeded(true);
          }
        });
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
      // Normalize to -180 to 180
      while (targetRotation > 180) targetRotation -= 360;
      while (targetRotation < -180) targetRotation += 360;

      rotation.value = withSpring(-targetRotation, {
        damping: 20,
        stiffness: 90,
      });

      // Haptic feedback when pointing in the right direction (within 5 degrees)
      const isAligned = Math.abs(targetRotation) < 5;
      if (isAligned) {
        const now = Date.now();
        // Only trigger haptic every 2 seconds to avoid spam
        if (now - lastHapticTime > 2000) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setLastHapticTime(now);
        }
      }
    }
  }, [magnetometerData, qiblaDirection]);

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
        {/* Calibration Warning */}
        {calibrationNeeded && (
          <Animated.View entering={FadeInUp.duration(400).delay(100)}>
            <GlassCard style={styles.calibrationCard}>
              <Feather
                name="alert-circle"
                size={20}
                color={theme.warning}
                style={{ marginRight: 8 }}
              />
              <ThemedText style={[styles.calibrationText, { color: theme.warning }]}>
                Move your device in a figure-8 pattern to calibrate
              </ThemedText>
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
  calibrationCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  calibrationText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
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
