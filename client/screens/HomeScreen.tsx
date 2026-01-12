import React, { useMemo, useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable, TextInput, Modal } from "react-native";
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
import { Button } from "@/components/Button";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Brand, ScreenCopy } from "@/constants/brand";
import { checkReflectionLimit, getBillingStatus, isPaidStatus } from "@/lib/billing";

const USER_NAME_KEY = "@noor_user_name";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

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
  const [showLimitModal, setShowLimitModal] = useState(false);
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

  const { data: limitStatus } = useQuery({
    queryKey: ["/api/reflection/can-reflect"],
    queryFn: checkReflectionLimit,
    staleTime: 30000,
  });

  const isPaid = billingStatus ? isPaidStatus(billingStatus.status) : false;
  const canReflect = limitStatus?.canReflect ?? true;

  const handleBeginReflection = () => {
    if (!canReflect && !isPaid) {
      setShowLimitModal(true);
      return;
    }
    navigation.navigate("ThoughtCapture");
  };

  return (
    <>
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: insets.top + Spacing["3xl"],
          paddingBottom: insets.bottom + Spacing["4xl"],
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.header}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
          contentFit="contain"
        />
        <Pressable 
          onPress={() => {
            setNameInput(userName);
            setShowNameModal(true);
          }}
          style={styles.greetingContainer}
        >
          <ThemedText type="h2" style={[styles.greeting, { color: theme.textSecondary }]}>
            {greeting}
          </ThemedText>
          <Feather 
            name="edit-2" 
            size={14} 
            color={theme.textSecondary} 
            style={styles.editIcon} 
          />
        </Pressable>
        <ThemedText type="h1" style={[styles.title, { fontFamily: Fonts?.serif }]}>
          {Brand.name}
        </ThemedText>
      </Animated.View>

      <Animated.View 
        entering={FadeInUp.duration(600).delay(300)} 
        style={[styles.reminderCard, { backgroundColor: theme.backgroundDefault }]}
      >
        <View style={[styles.reminderAccent, { backgroundColor: SiraatColors.emerald }]} />
        <View style={styles.reminderContent}>
          <ThemedText type="caption" style={[styles.reminderLabel, { color: theme.textSecondary }]}>
            Today's reminder
          </ThemedText>
          <ThemedText type="body" style={[styles.reminderText, { fontFamily: Fonts?.serif }]}>
            {dailyReminder}
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View 
        entering={FadeInUp.duration(500).delay(500)} 
        style={styles.mainContent}
      >
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Button
            onPress={handleBeginReflection}
            style={{ backgroundColor: theme.primary }}
          >
            {ScreenCopy.home.cta}
          </Button>
          <View style={styles.ctaSubcopyContainer}>
            {ScreenCopy.home.ctaSubcopyLines.map((line, index) => (
              <View key={index} style={styles.ctaSubcopyItem}>
                <View style={[styles.ctaSubcopyDot, { backgroundColor: SiraatColors.emerald }]} />
                <ThemedText 
                  type="body" 
                  style={[styles.ctaSubcopyLine, { color: theme.textSecondary }]}
                >
                  {line}
                </ThemedText>
              </View>
            ))}
          </View>
          <ThemedText type="caption" style={[styles.methodCallout, { color: theme.textSecondary }]}>
            {Brand.methodCallout}
          </ThemedText>
        </View>

        <Pressable
          onPress={() => navigation.navigate("History")}
          style={({ pressed }) => [
            styles.historyButton,
            { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather name="clock" size={20} color={theme.textSecondary} />
          <ThemedText type="body" style={{ marginLeft: Spacing.sm, color: theme.textSecondary }}>
            {ScreenCopy.home.historyLink}
          </ThemedText>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} style={{ marginLeft: "auto" }} />
        </Pressable>

        {!isPaid ? (
          <Pressable
            onPress={() => navigation.navigate("Pricing")}
            style={({ pressed }) => [
              styles.upgradeButton,
              { backgroundColor: SiraatColors.indigo, opacity: pressed ? 0.7 : 0.85 },
            ]}
          >
            <Feather name="star" size={16} color="#fff" />
            <ThemedText type="caption" style={{ marginLeft: Spacing.sm, color: "#fff" }}>
              Upgrade to Noor Plus
            </ThemedText>
            <Feather name="chevron-right" size={16} color="#fff" style={{ marginLeft: "auto" }} />
          </Pressable>
        ) : null}
      </Animated.View>

      <View style={styles.footer}>
        <ThemedText type="caption" style={[styles.disclaimer, { color: theme.textSecondary }]}>
          {Brand.disclaimer}
        </ThemedText>
        {!isPaid && limitStatus ? (
          <ThemedText type="caption" style={[styles.limitHint, { color: theme.textSecondary }]}>
            {limitStatus.remaining === 0 
              ? "Daily reflection used" 
              : `${limitStatus.remaining} free reflection${limitStatus.remaining === 1 ? '' : 's'} today`}
          </ThemedText>
        ) : null}
      </View>
    </ScrollView>

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

    <Modal
      visible={showLimitModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowLimitModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h3" style={{ marginBottom: Spacing.md }}>
            Daily Limit Reached
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary, marginBottom: Spacing.xl }}>
            You've used your free daily reflection. Upgrade to Noor Plus for unlimited reflections.
          </ThemedText>
          <View style={styles.modalButtons}>
            <Pressable 
              onPress={() => setShowLimitModal(false)}
              style={[styles.modalButton, { backgroundColor: theme.backgroundRoot }]}
            >
              <ThemedText type="body">Maybe Later</ThemedText>
            </Pressable>
            <Pressable 
              onPress={() => {
                setShowLimitModal(false);
                navigation.navigate("Pricing");
              }}
              style={[styles.modalButton, { backgroundColor: SiraatColors.indigo }]}
            >
              <ThemedText type="body" style={{ color: "#fff" }}>Upgrade</ThemedText>
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
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  greeting: {
    marginBottom: Spacing.xs,
    fontSize: 18,
    fontWeight: "400",
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  reminderCard: {
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: BorderRadius.md,
    marginBottom: Spacing["2xl"],
    overflow: "hidden",
  },
  reminderAccent: {
    width: 4,
    alignSelf: "stretch",
  },
  reminderContent: {
    flex: 1,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  reminderLabel: {
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
    marginBottom: Spacing.xs,
  },
  reminderText: {
    lineHeight: 24,
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    gap: Spacing.lg,
  },
  card: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.lg,
  },
  ctaSubcopyContainer: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  ctaSubcopyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  ctaSubcopyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  ctaSubcopyLine: {
    lineHeight: 22,
  },
  methodCallout: {
    textAlign: "center",
    marginTop: Spacing.xl,
    fontStyle: "italic",
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  limitHint: {
    textAlign: "center",
    marginTop: Spacing.md,
    opacity: 0.6,
    fontSize: 11,
  },
  footer: {
    alignItems: "center",
    marginTop: Spacing["3xl"],
    gap: Spacing.xs,
  },
  disclaimer: {
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: Spacing.md,
  },
  greetingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  editIcon: {
    opacity: 0.6,
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
    borderRadius: BorderRadius.lg,
    padding: Spacing["2xl"],
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
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
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
});
