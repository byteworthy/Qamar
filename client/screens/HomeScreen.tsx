import React, { useMemo, useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable, TextInput, Modal, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts, SiraatColors } from "@/constants/theme";
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
        <View style={[styles.moduleIconContainer, { backgroundColor: accentColor + "18" }]}>
          <Feather name={icon} size={22} color={accentColor} />
        </View>
        <View style={styles.moduleTextContainer}>
          <View style={styles.moduleTitleRow}>
            <ThemedText type="h4" style={styles.moduleTitle}>
              {title}
            </ThemedText>
            {locked && (
              <View style={[styles.proBadge, { backgroundColor: SiraatColors.indigo }]}>
                <ThemedText type="caption" style={styles.proBadgeText}>PRO</ThemedText>
              </View>
            )}
          </View>
          <ThemedText type="small" style={[styles.moduleDescription, { color: theme.textSecondary }]}>
            {description}
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={18} color={theme.textSecondary} />
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
      
      <View style={styles.fixedHeader}>
        <View style={styles.headerRow}>
          <View style={styles.brandSection}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.logo}
              contentFit="contain"
            />
            <View>
              <ThemedText type="h2" style={[styles.title, { fontFamily: Fonts?.serif }]}>
                {Brand.name}
              </ThemedText>
            </View>
          </View>
          <Pressable
            onPress={() => navigation.navigate("History")}
            style={[styles.historyButton, { backgroundColor: theme.backgroundDefault }]}
          >
            <Feather name="clock" size={18} color={theme.textSecondary} />
          </Pressable>
        </View>
        
        <Pressable 
          onPress={() => {
            setNameInput(userName);
            setShowNameModal(true);
          }}
          style={styles.greetingRow}
        >
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {greeting}
          </ThemedText>
          <Feather name="edit-2" size={11} color={theme.textSecondary} style={{ opacity: 0.5, marginLeft: 4 }} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing["3xl"] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          entering={FadeInUp.duration(400).delay(100)} 
          style={[styles.anchorCard, { backgroundColor: theme.backgroundDefault }]}
        >
          <View style={[styles.anchorAccent, { backgroundColor: SiraatColors.emerald }]} />
          <View style={styles.anchorContent}>
            <ThemedText type="caption" style={[styles.anchorLabel, { color: theme.textSecondary }]}>
              Today's anchor
            </ThemedText>
            <ThemedText type="body" style={[styles.anchorText, { fontFamily: Fonts?.serif }]}>
              {dailyReminder}
            </ThemedText>
          </View>
        </Animated.View>

        <View style={styles.modulesSection}>
          <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
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
              <ThemedText type="small" style={styles.upgradeText}>
                Unlock everything with Noor Plus
              </ThemedText>
              <Feather name="chevron-right" size={14} color="#fff" />
            </Pressable>
          )}
          <ThemedText type="caption" style={[styles.methodCallout, { color: theme.textSecondary }]}>
            {Brand.methodCallout}
          </ThemedText>
          <ThemedText type="caption" style={[styles.disclaimer, { color: theme.textSecondary }]}>
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
          <ThemedText type="h3" style={{ marginBottom: Spacing.lg }}>
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
              <ThemedText type="body">Cancel</ThemedText>
            </Pressable>
            <Pressable 
              onPress={handleSaveName}
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
            >
              <ThemedText type="body" style={{ color: "#fff" }}>Save</ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeader: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  brandSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  logo: {
    width: 44,
    height: 44,
  },
  title: {
    fontSize: 26,
  },
  historyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  anchorCard: {
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing["2xl"],
    overflow: "hidden",
  },
  anchorAccent: {
    width: 4,
  },
  anchorContent: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  anchorLabel: {
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 10,
    marginBottom: Spacing.xs,
  },
  anchorText: {
    lineHeight: 22,
    fontSize: 15,
  },
  modulesSection: {
    flex: 1,
  },
  sectionLabel: {
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
    marginBottom: Spacing.md,
  },
  modulesGrid: {
    gap: Spacing.sm,
  },
  moduleCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    paddingRight: Spacing.lg,
    borderRadius: BorderRadius.sm,
    gap: Spacing.md,
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
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.xs,
  },
  moduleTextContainer: {
    flex: 1,
  },
  moduleTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  moduleTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  moduleDescription: {
    fontSize: 13,
    lineHeight: 17,
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
    marginTop: Spacing["2xl"],
    alignItems: "center",
    gap: Spacing.md,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  upgradeText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 13,
  },
  methodCallout: {
    textAlign: "center",
    fontStyle: "italic",
    fontSize: 12,
  },
  disclaimer: {
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: Spacing.md,
    fontSize: 10,
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    width: "100%",
    maxWidth: 320,
    borderRadius: BorderRadius.md,
    padding: Spacing["2xl"],
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    fontSize: 16,
    marginBottom: Spacing.xl,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
});
