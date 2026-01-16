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
    <Animated.View entering={FadeInUp.duration(300).delay(delay)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.moduleCard,
          { 
            backgroundColor: theme.cardBackground,
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <View style={[styles.moduleAccent, { backgroundColor: accentColor }]} />
        <Feather name={icon} size={18} color={accentColor} style={styles.moduleIcon} />
        <View style={styles.moduleTextContainer}>
          <View style={styles.moduleTitleRow}>
            <ThemedText style={styles.moduleTitle}>{title}</ThemedText>
            {locked && (
              <View style={[styles.proBadge, { backgroundColor: SiraatColors.indigo }]}>
                <ThemedText style={styles.proBadgeText}>PRO</ThemedText>
              </View>
            )}
          </View>
          <ThemedText style={[styles.moduleDescription, { color: theme.textSecondary }]} numberOfLines={1}>
            {description}
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={14} color={theme.textSecondary} style={{ opacity: 0.5 }} />
      </Pressable>
    </Animated.View>
  );
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
            paddingBottom: insets.bottom + 20,
            minHeight: screenHeight - insets.top,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <Animated.View entering={FadeInDown.duration(250)} style={styles.header}>
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
              <Feather name="edit-2" size={9} color={theme.textSecondary} style={{ opacity: 0.4, marginLeft: 4 }} />
            </Pressable>
            
            <View style={styles.logoRow}>
              <Image
                source={require("../../assets/images/icon.png")}
                style={styles.logo}
                contentFit="contain"
              />
              <View style={styles.titleBlock}>
                <ThemedText style={[styles.appTitle, { fontFamily: Fonts?.serif }]}>
                  {Brand.name}
                </ThemedText>
                <ThemedText style={[styles.tagline, { color: theme.textSecondary }]}>
                  {Brand.tagline}
                </ThemedText>
              </View>
              <Pressable
                onPress={() => navigation.navigate("History")}
                style={({ pressed }) => [
                  styles.historyButton, 
                  { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.7 : 1 }
                ]}
              >
                <Feather name="clock" size={15} color={theme.textSecondary} />
              </Pressable>
            </View>
          </Animated.View>

          <Animated.View 
            entering={FadeInUp.duration(350).delay(80)} 
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
                delay={120}
              />
              <ModuleCard
                icon="wind"
                title="Calming Practice"
                description="Quick grounding exercises with dhikr"
                onPress={() => navigation.navigate("CalmingPractice")}
                accentColor={SiraatColors.emerald}
                delay={160}
              />
              <ModuleCard
                icon="heart"
                title="Dua"
                description="Find the right words for what you carry"
                onPress={() => navigation.navigate("Dua")}
                accentColor={SiraatColors.indigo}
                delay={200}
              />
              <ModuleCard
                icon="bar-chart-2"
                title="Insights"
                description="See patterns in your reflections"
                onPress={() => navigation.navigate("Insights")}
                accentColor={SiraatColors.clay}
                delay={240}
                locked={!isPaid}
              />
            </View>
          </View>
        </View>

        <Animated.View entering={FadeInUp.duration(300).delay(320)} style={styles.footer}>
          {!isPaid && (
            <Pressable
              onPress={() => navigation.navigate("Pricing")}
              style={({ pressed }) => [
                styles.upgradeButton,
                { backgroundColor: SiraatColors.indigo, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Feather name="star" size={12} color="#fff" />
              <ThemedText style={styles.upgradeText}>
                Unlock everything with Noor Plus
              </ThemedText>
              <Feather name="chevron-right" size={12} color="rgba(255,255,255,0.6)" />
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
                borderColor: theme.textSecondary + "30",
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
    paddingHorizontal: 20,
    maxWidth: container.maxWidth,
    alignSelf: "center",
    width: "100%",
  },
  contentWrapper: {
    flexGrow: 1,
    justifyContent: "center",
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  greetingText: {
    fontSize: 12,
    opacity: 0.8,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 36,
    height: 36,
  },
  titleBlock: {
    flex: 1,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 24,
  },
  tagline: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 1,
  },
  historyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  anchorCard: {
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: 10,
    marginBottom: spacing.lg,
    overflow: "hidden",
  },
  anchorAccent: {
    width: 3,
  },
  anchorContent: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  anchorLabel: {
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: 9,
    marginBottom: 4,
    opacity: 0.7,
  },
  anchorText: {
    lineHeight: 18,
    fontSize: 13,
  },
  modulesSection: {
    marginTop: spacing.xs,
  },
  sectionLabel: {
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: 10,
    marginBottom: 10,
    opacity: 0.7,
  },
  modulesGrid: {
    gap: 8,
  },
  moduleCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 12,
    overflow: "hidden",
  },
  moduleAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  moduleIcon: {
    marginLeft: 2,
  },
  moduleTextContainer: {
    flex: 1,
  },
  moduleTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  moduleDescription: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
  proBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  proBadgeText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  footer: {
    alignItems: "center",
    gap: 10,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  upgradeText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 12,
  },
  methodCallout: {
    textAlign: "center",
    fontStyle: "italic",
    fontSize: 11,
    opacity: 0.7,
  },
  disclaimer: {
    textAlign: "center",
    lineHeight: 14,
    paddingHorizontal: 20,
    fontSize: 9,
    opacity: 0.5,
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
    maxWidth: 300,
    borderRadius: radii.md,
    padding: 24,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
