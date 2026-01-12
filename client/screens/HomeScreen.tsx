import React, { useMemo, useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable, TextInput, Modal, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useTheme } from "@/hooks/useTheme";
import { Layout } from "@/constants/layout";
import { Fonts, SiraatColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Brand } from "@/constants/brand";
import { getBillingStatus, isPaidStatus } from "@/lib/billing";

const USER_NAME_KEY = "@noor_user_name";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

interface ModuleCardProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
  accentColor: string;
  delay: number;
  locked?: boolean;
}

function ModuleCard({ icon, title, description, onPress, accentColor, delay, locked }: ModuleCardProps) {
  const { theme } = useTheme();
  
  return (
    <Animated.View entering={FadeInUp.duration(350).delay(delay)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.moduleCard,
          { 
            backgroundColor: theme.cardBackground,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <View style={[styles.moduleAccent, { backgroundColor: accentColor }]} />
        <View style={styles.moduleIconContainer}>
          <Feather name={icon} size={20} color={accentColor} />
        </View>
        <View style={styles.moduleTextContainer}>
          <View style={styles.moduleTitleRow}>
            <ThemedText style={styles.moduleTitle}>
              {title}
            </ThemedText>
            {locked && (
              <View style={[styles.proBadge, { backgroundColor: SiraatColors.indigo }]}>
                <ThemedText style={styles.proBadgeText}>PRO</ThemedText>
              </View>
            )}
          </View>
          <ThemedText style={[styles.moduleDescription, { color: theme.textSecondary }]}>
            {description}
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={16} color={theme.textSecondary} />
      </Pressable>
    </Animated.View>
  );
}

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Peace be with you";
}

function getDailyReminder(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return Brand.dailyReminders[dayOfYear % Brand.dailyReminders.length];
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { height: screenHeight } = useWindowDimensions();
  
  const [userName, setUserName] = useState<string>("Karim");
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    AsyncStorage.getItem(USER_NAME_KEY).then((name) => {
      if (name && name.trim()) {
        setUserName(name);
      } else {
        AsyncStorage.setItem(USER_NAME_KEY, "Karim");
        setUserName("Karim");
      }
    });
  }, []);

  const handleSaveName = async () => {
    const trimmedName = nameInput.trim();
    if (trimmedName) {
      await AsyncStorage.setItem(USER_NAME_KEY, trimmedName);
      setUserName(trimmedName);
    }
    setShowNameModal(false);
    setNameInput("");
  };

  const greeting = userName ? `Salaam, ${userName}` : "Salaam";
  const dailyReminder = useMemo(() => getDailyReminder(), []);

  const { data: billingStatus } = useQuery({
    queryKey: ["/api/billing/status"],
    queryFn: getBillingStatus,
    staleTime: 60000,
  });

  const isPaid = billingStatus ? isPaidStatus(billingStatus.status) : false;

  return (
    <>
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={{ height: insets.top }} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingBottom: insets.bottom + Layout.spacing.lg,
            minHeight: screenHeight - insets.top,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <Animated.View entering={FadeInDown.duration(300)} style={styles.brandBlock}>
            <Pressable 
              onPress={() => {
                setNameInput(userName);
                setShowNameModal(true);
              }}
              style={styles.greetingRow}
            >
              <ThemedText style={[styles.greetingText, { color: theme.textSecondary }]}>
                {greeting}
              </ThemedText>
              <Feather name="edit-2" size={10} color={theme.textSecondary} style={{ opacity: 0.5, marginLeft: 4 }} />
            </Pressable>
            
            <View style={styles.logoRow}>
              <Image
                source={require("../../assets/images/icon.png")}
                style={styles.logo}
                contentFit="contain"
              />
              <ThemedText style={[styles.appTitle, { fontFamily: Fonts?.serif }]}>
                {Brand.name}
              </ThemedText>
              <View style={{ flex: 1 }} />
              <Pressable
                onPress={() => navigation.navigate("History")}
                style={[styles.historyButton, { backgroundColor: theme.backgroundDefault }]}
              >
                <Feather name="clock" size={16} color={theme.textSecondary} />
              </Pressable>
            </View>

            <ThemedText style={[styles.tagline, { color: theme.textSecondary }]}>
              {Brand.tagline}
            </ThemedText>
          </Animated.View>

          <Animated.View 
            entering={FadeInUp.duration(400).delay(100)} 
            style={[styles.anchorCard, { backgroundColor: theme.backgroundDefault }]}
          >
            <View style={[styles.anchorAccent, { backgroundColor: SiraatColors.emerald }]} />
            <View style={styles.anchorContent}>
              <ThemedText style={[styles.anchorLabel, { color: theme.textSecondary }]}>
                Today's anchor
              </ThemedText>
              <ThemedText style={[styles.anchorText, { fontFamily: Fonts?.serif }]}>
                {dailyReminder}
              </ThemedText>
            </View>
          </Animated.View>

          <View style={styles.modulesSection}>
            <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              What do you need?
            </ThemedText>

            <View style={styles.modulesGrid}>
              <ModuleCard
                icon="edit-3"
                title="Reflection"
                description="Process a troubling thought with guided CBT"
                onPress={() => navigation.navigate("ThoughtCapture")}
                accentColor={SiraatColors.clay}
                delay={150}
              />
              <ModuleCard
                icon="wind"
                title="Calming Practice"
                description="Quick grounding exercises with dhikr"
                onPress={() => navigation.navigate("CalmingPractice")}
                accentColor={SiraatColors.emerald}
                delay={200}
              />
              <ModuleCard
                icon="heart"
                title="Dua"
                description="Find the right words for what you carry"
                onPress={() => navigation.navigate("Dua")}
                accentColor={SiraatColors.indigo}
                delay={250}
              />
              <ModuleCard
                icon="bar-chart-2"
                title="Insights"
                description="See patterns in your reflections"
                onPress={() => navigation.navigate("Insights")}
                accentColor={SiraatColors.clay}
                delay={300}
                locked={!isPaid}
              />
            </View>
          </View>
        </View>

        <Animated.View entering={FadeInUp.duration(350).delay(400)} style={styles.footer}>
          {!isPaid && (
            <Pressable
              onPress={() => navigation.navigate("Pricing")}
              style={({ pressed }) => [
                styles.upgradeButton,
                { backgroundColor: SiraatColors.indigo, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Feather name="star" size={14} color="#fff" />
              <ThemedText style={styles.upgradeText}>
                Unlock everything with Noor Plus
              </ThemedText>
              <Feather name="chevron-right" size={14} color="#fff" />
            </Pressable>
          )}
          <ThemedText style={[styles.methodCallout, { color: theme.textSecondary }]}>
            {Brand.methodCallout}
          </ThemedText>
          <ThemedText style={[styles.disclaimer, { color: theme.textSecondary }]}>
            {Brand.disclaimer}
          </ThemedText>
        </Animated.View>
      </ScrollView>
    </View>

    <Modal
      visible={showNameModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowNameModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={styles.modalTitle}>
            What's your name?
          </ThemedText>
          <TextInput
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="Enter your name"
            placeholderTextColor={theme.textSecondary}
            style={[
              styles.nameInput,
              { 
                backgroundColor: theme.backgroundRoot,
                color: theme.text,
                borderColor: theme.textSecondary,
              }
            ]}
            autoFocus
            maxLength={20}
          />
          <View style={styles.modalButtons}>
            <Pressable 
              onPress={() => setShowNameModal(false)}
              style={[styles.modalButton, { backgroundColor: theme.backgroundRoot }]}
            >
              <ThemedText style={styles.modalButtonText}>Cancel</ThemedText>
            </Pressable>
            <Pressable 
              onPress={handleSaveName}
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
            >
              <ThemedText style={[styles.modalButtonText, { color: "#fff" }]}>Save</ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
}

const { spacing, radii, container, typeScale } = Layout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: container.screenPad,
    maxWidth: container.maxWidth,
    alignSelf: "center",
    width: "100%",
  },
  contentWrapper: {
    flexGrow: 1,
    paddingVertical: spacing.xl,
  },
  brandBlock: {
    marginBottom: spacing.sm,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  greetingText: {
    fontSize: typeScale.small,
    opacity: 0.8,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  logo: {
    width: 42,
    height: 42,
  },
  appTitle: {
    fontSize: typeScale.title,
    fontWeight: "600",
  },
  historyButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  tagline: {
    fontSize: typeScale.small,
    opacity: 0.7,
    marginBottom: spacing.lg,
  },
  anchorCard: {
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: radii.sm,
    marginBottom: spacing.lg,
    overflow: "hidden",
  },
  anchorAccent: {
    width: 4,
  },
  anchorContent: {
    flex: 1,
    padding: container.cardPad,
  },
  anchorLabel: {
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 10,
    marginBottom: spacing.xs,
  },
  anchorText: {
    lineHeight: 20,
    fontSize: typeScale.body,
  },
  modulesSection: {
    flex: 1,
  },
  sectionLabel: {
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
    marginBottom: spacing.md,
  },
  modulesGrid: {
    gap: spacing.sm,
  },
  moduleCard: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: Layout.hitTargets.minCardHeight,
    paddingHorizontal: container.cardPad,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    gap: spacing.md,
    overflow: "hidden",
  },
  moduleAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  moduleIconContainer: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.xs,
  },
  moduleTextContainer: {
    flex: 1,
  },
  moduleTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  moduleDescription: {
    fontSize: typeScale.small,
    lineHeight: 16,
  },
  proBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    alignItems: "center",
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.sm,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  upgradeText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 13,
  },
  methodCallout: {
    textAlign: "center",
    fontStyle: "italic",
    fontSize: typeScale.small,
  },
  disclaimer: {
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: spacing.md,
    fontSize: 10,
    opacity: 0.7,
    paddingBottom: spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  modalContent: {
    width: "100%",
    maxWidth: 320,
    borderRadius: radii.md,
    padding: spacing.xxl,
  },
  modalTitle: {
    fontSize: typeScale.h2,
    fontWeight: "600",
    marginBottom: spacing.lg,
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: spacing.lg,
    fontSize: 16,
    marginBottom: spacing.xl,
  },
  modalButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radii.sm,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: typeScale.body,
  },
});
