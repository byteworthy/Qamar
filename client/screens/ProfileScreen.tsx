import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Switch,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";

import { useTheme } from "@/hooks/useTheme";
import { VALIDATION_MODE, config } from "@/lib/config";
import { NoorColors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getBillingStatus, isPaidStatus } from "@/lib/billing";
import { clearSessions } from "@/lib/storage";
import { useAppState, type PrayerName, type ReminderOffset } from "@/stores/app-state";
import { rescheduleAllNotifications } from "@/services/notifications";
import { requestNotificationPermissions } from "@/lib/notifications";

const USER_NAME_KEY = "@noor_user_name";
const USER_EMAIL_KEY = "@noor_user_email";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// =============================================================================
// CONSTANTS
// =============================================================================

const CALCULATION_METHODS: { label: string; value: string }[] = [
  { label: "Muslim World League", value: "MWL" },
  { label: "ISNA (North America)", value: "ISNA" },
  { label: "Egyptian General Authority", value: "Egypt" },
  { label: "Umm Al-Qura (Makkah)", value: "Makkah" },
  { label: "University of Karachi", value: "Karachi" },
  { label: "Institute of Geophysics, Tehran", value: "Tehran" },
  { label: "Shia Ithna-Ashari (Jafari)", value: "Jafari" },
];

const HIGH_LATITUDE_RULES: {
  label: string;
  value: "MiddleOfTheNight" | "SeventhOfTheNight" | "TwilightAngle";
}[] = [
  { label: "Middle of the Night", value: "MiddleOfTheNight" },
  { label: "Seventh of the Night", value: "SeventhOfTheNight" },
  { label: "Twilight Angle", value: "TwilightAngle" },
];

const THEME_OPTIONS: { label: string; value: "light" | "dark" | "auto" }[] = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "Auto", value: "auto" },
];

const FONT_SIZE_OPTIONS: {
  label: string;
  value: "small" | "medium" | "large";
}[] = [
  { label: "Small", value: "small" },
  { label: "Medium", value: "medium" },
  { label: "Large", value: "large" },
];

const ASR_OPTIONS: { label: string; value: "Standard" | "Hanafi" }[] = [
  { label: "Shafi'i / Standard", value: "Standard" },
  { label: "Hanafi", value: "Hanafi" },
];

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/** Section header with gold text */
function SectionHeader({ title, delay }: { title: string; delay: number }) {
  return (
    <Animated.View
      entering={FadeInUp.duration(300).delay(delay)}
      style={styles.sectionHeader}
    >
      <ThemedText
        style={[styles.sectionHeaderText, { color: NoorColors.gold }]}
        accessibilityRole="header"
      >
        {title}
      </ThemedText>
    </Animated.View>
  );
}

/** Segmented control for picking from a short list of options */
function SegmentedControl<T extends string>({
  options,
  selectedValue,
  onSelect,
}: {
  options: { label: string; value: T }[];
  selectedValue: T;
  onSelect: (value: T) => void;
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.segmented, { backgroundColor: theme.backgroundRoot }]}>
      {options.map((opt) => {
        const isSelected = opt.value === selectedValue;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            style={[
              styles.segmentedOption,
              isSelected && {
                backgroundColor: NoorColors.gold,
              },
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={opt.label}
          >
            <ThemedText
              style={[
                styles.segmentedLabel,
                {
                  color: isSelected
                    ? NoorColors.background
                    : theme.textSecondary,
                },
                isSelected && { fontWeight: "600" },
              ]}
            >
              {opt.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

/** A single setting row with label + right-side control */
function SettingRow({
  label,
  subtitle,
  children,
}: {
  label: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  return (
    <View style={styles.settingRow}>
      <View style={styles.settingRowLabel}>
        <ThemedText style={styles.settingRowLabelText}>{label}</ThemedText>
        {subtitle && (
          <ThemedText
            style={[styles.settingRowSubtitle, { color: theme.textSecondary }]}
          >
            {subtitle}
          </ThemedText>
        )}
      </View>
      {children}
    </View>
  );
}

/** Dropdown picker shown as a modal list */
function PickerModal<T extends string>({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: { label: string; value: T }[];
  selectedValue: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View
          style={[
            styles.pickerModalContent,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <ThemedText style={styles.pickerModalTitle}>{title}</ThemedText>
          {options.map((opt) => {
            const isSelected = opt.value === selectedValue;
            return (
              <Pressable
                key={opt.value}
                onPress={() => {
                  onSelect(opt.value);
                  onClose();
                }}
                style={[
                  styles.pickerOption,
                  {
                    backgroundColor: isSelected
                      ? NoorColors.gold + "20"
                      : "transparent",
                  },
                ]}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={opt.label}
              >
                <ThemedText
                  style={[
                    styles.pickerOptionText,
                    isSelected && { color: NoorColors.gold, fontWeight: "600" },
                  ]}
                >
                  {opt.label}
                </ThemedText>
                {isSelected && (
                  <Feather name="check" size={18} color={NoorColors.gold} />
                )}
              </Pressable>
            );
          })}
          <Pressable
            onPress={onClose}
            style={[
              styles.pickerCloseButton,
              { backgroundColor: theme.backgroundRoot },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <ThemedText style={{ fontWeight: "500" }}>Close</ThemedText>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

/** Tappable row that opens a picker */
function PickerRow({
  label,
  currentLabel,
  onPress,
}: {
  label: string;
  currentLabel: string;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={styles.settingRow}
      accessibilityRole="button"
      accessibilityLabel={`${label}, currently ${currentLabel}`}
      accessibilityHint={`Opens picker to change ${label.toLowerCase()}`}
    >
      <View style={styles.settingRowLabel}>
        <ThemedText style={styles.settingRowLabelText}>{label}</ThemedText>
      </View>
      <View style={styles.pickerRowRight}>
        <ThemedText
          style={[styles.pickerRowValue, { color: theme.textSecondary }]}
        >
          {currentLabel}
        </ThemedText>
        <Feather
          name="chevron-right"
          size={16}
          color={theme.textSecondary}
          style={{ opacity: 0.5 }}
        />
      </View>
    </Pressable>
  );
}

/** Menu item for action rows (privacy, export, etc.) */
function ActionRow({
  icon,
  title,
  subtitle,
  onPress,
  destructive,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionRow,
        { opacity: pressed ? 0.7 : 1 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
    >
      <Feather
        name={icon}
        size={18}
        color={destructive ? theme.error : theme.textSecondary}
      />
      <View style={styles.actionRowContent}>
        <ThemedText
          style={[
            styles.actionRowTitle,
            destructive && { color: theme.error },
          ]}
        >
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText
            style={[styles.actionRowSubtitle, { color: theme.textSecondary }]}
          >
            {subtitle}
          </ThemedText>
        )}
      </View>
      <Feather
        name="chevron-right"
        size={16}
        color={theme.textSecondary}
        style={{ opacity: 0.4 }}
      />
    </Pressable>
  );
}

// =============================================================================
// MAIN SCREEN
// =============================================================================

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  // User info
  const [userName, setUserName] = useState<string>("Friend");
  const [userEmail, setUserEmail] = useState<string>("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [nameInput, setNameInput] = useState("");

  // Picker modals
  const [showCalcMethodPicker, setShowCalcMethodPicker] = useState(false);
  const [showHighLatPicker, setShowHighLatPicker] = useState(false);

  // Billing
  const { data: billingStatus } = useQuery({
    queryKey: ["/api/billing/status"],
    queryFn: getBillingStatus,
    staleTime: 60000,
  });
  const isPaid = billingStatus ? isPaidStatus(billingStatus.status) : false;

  // Zustand state
  const uiState = useAppState((s) => s.ui);
  const prayerState = useAppState((s) => s.prayer);
  const setTheme = useAppState((s) => s.setTheme);
  const setFontSize = useAppState((s) => s.setFontSize);
  const toggleReducedMotion = useAppState((s) => s.toggleReducedMotion);
  const setCalculationMethod = useAppState((s) => s.setCalculationMethod);
  const setAsrCalculation = useAppState((s) => s.setAsrCalculation);
  const setHighLatitudeRule = useAppState((s) => s.setHighLatitudeRule);
  const togglePrayerNotifications = useAppState((s) => s.togglePrayerNotifications);
  const togglePrayerNotification = useAppState((s) => s.togglePrayerNotification);
  const setReminderOffset = useAppState((s) => s.setReminderOffset);
  const toggleDailyReflection = useAppState((s) => s.toggleDailyReflection);
  const setDailyReflectionTime = useAppState((s) => s.setDailyReflectionTime);

  const handleToggleNotifications = useCallback(async () => {
    if (!prayerState.notificationsEnabled) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          "Notifications Disabled",
          "Please enable notifications in your device settings to receive prayer reminders.",
          [{ text: "OK" }],
        );
        return;
      }
    }
    togglePrayerNotifications();
    // Reschedule after state update settles
    setTimeout(() => rescheduleAllNotifications().catch(() => {}), 100);
  }, [prayerState.notificationsEnabled, togglePrayerNotifications]);

  const handleTogglePrayer = useCallback(
    (prayer: PrayerName) => {
      togglePrayerNotification(prayer);
      setTimeout(() => rescheduleAllNotifications().catch(() => {}), 100);
    },
    [togglePrayerNotification],
  );

  const handleOffsetChange = useCallback(
    (offset: ReminderOffset) => {
      setReminderOffset(offset);
      setTimeout(() => rescheduleAllNotifications().catch(() => {}), 100);
    },
    [setReminderOffset],
  );

  const handleToggleDailyReflection = useCallback(() => {
    toggleDailyReflection();
    setTimeout(() => rescheduleAllNotifications().catch(() => {}), 100);
  }, [toggleDailyReflection]);

  // Load user info
  useEffect(() => {
    AsyncStorage.getItem(USER_NAME_KEY).then((name) => {
      if (name && name.trim()) setUserName(name);
    }).catch(() => {});
    AsyncStorage.getItem(USER_EMAIL_KEY).then((email) => {
      if (email && email.trim()) setUserEmail(email);
    }).catch(() => {});
  }, []);

  const handleSaveName = useCallback(async () => {
    const trimmedName = nameInput.trim();
    if (trimmedName) {
      await AsyncStorage.setItem(USER_NAME_KEY, trimmedName);
      setUserName(trimmedName);
    }
    setShowEditModal(false);
    setNameInput("");
  }, [nameInput]);

  const handleClearHistory = useCallback(() => {
    Alert.alert(
      "Clear Reflection History",
      "This will permanently delete all your reflections from this device. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            await clearSessions();
            Alert.alert("Done", "All reflections have been deleted.");
          },
        },
      ],
    );
  }, []);

  const handleExportData = useCallback(() => {
    Alert.alert(
      "Export Data",
      "Your reflection data will be exported as a JSON file. This feature is coming soon.",
      [{ text: "OK" }],
    );
  }, []);

  const handlePrivacyPolicy = useCallback(() => {
    Linking.openURL("https://noorapp.co/privacy");
  }, []);

  // Derived labels
  const currentCalcLabel =
    CALCULATION_METHODS.find((m) => m.value === prayerState.calculationMethod)
      ?.label ?? prayerState.calculationMethod;

  const currentHighLatLabel =
    HIGH_LATITUDE_RULES.find((r) => r.value === prayerState.highLatitudeRule)
      ?.label ?? prayerState.highLatitudeRule;

  const appVersion = Constants.expoConfig?.version || "dev";

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={styles.header}
        >
          <ThemedText style={styles.headerTitle} accessibilityRole="header">Settings</ThemedText>
        </Animated.View>

        {/* ── User Info ─────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.duration(350).delay(50)}>
          <GlassCard style={styles.profileCard}>
            {/* Avatar placeholder with Islamic geometric pattern */}
            <View
              style={[
                styles.avatar,
                { backgroundColor: NoorColors.gold + "20" },
              ]}
            >
              <View style={styles.avatarInner}>
                <ThemedText
                  style={[styles.avatarText, { color: NoorColors.gold }]}
                >
                  {userName.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              {/* Geometric accent lines */}
              <View
                style={[
                  styles.avatarRing,
                  { borderColor: NoorColors.gold + "40" },
                ]}
              />
            </View>
            <View style={styles.profileInfo}>
              <ThemedText style={styles.profileGreeting}>
                Assalamu Alaikum,
              </ThemedText>
              <ThemedText style={styles.profileName}>{userName}</ThemedText>
              {userEmail ? (
                <ThemedText
                  style={[styles.profileEmail, { color: theme.textSecondary }]}
                >
                  {userEmail}
                </ThemedText>
              ) : null}
            </View>
            <Pressable
              onPress={() => {
                setNameInput(userName);
                setShowEditModal(true);
              }}
              style={[
                styles.editButton,
                { backgroundColor: theme.backgroundRoot },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Edit profile name"
            >
              <Feather name="edit-2" size={14} color={theme.textSecondary} />
            </Pressable>
          </GlassCard>
        </Animated.View>

        {/* ── Appearance ────────────────────────────────────── */}
        <SectionHeader title="Appearance" delay={100} />
        <Animated.View entering={FadeInUp.duration(350).delay(120)}>
          <GlassCard style={styles.settingsCard}>
            <SettingRow label="Theme">
              <SegmentedControl
                options={THEME_OPTIONS}
                selectedValue={uiState.theme}
                onSelect={setTheme}
              />
            </SettingRow>

            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            <SettingRow label="Font Size">
              <SegmentedControl
                options={FONT_SIZE_OPTIONS}
                selectedValue={uiState.fontSize}
                onSelect={setFontSize}
              />
            </SettingRow>

            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            <SettingRow
              label="Reduced Motion"
              subtitle="Minimize animations"
            >
              <Switch
                value={uiState.reducedMotion}
                onValueChange={toggleReducedMotion}
                trackColor={{
                  false: theme.backgroundRoot,
                  true: NoorColors.gold + "80",
                }}
                thumbColor={uiState.reducedMotion ? NoorColors.gold : "#ccc"}
                accessibilityLabel="Reduced motion toggle"
              />
            </SettingRow>
          </GlassCard>
        </Animated.View>

        {/* ── Prayer Settings ──────────────────────────────── */}
        <SectionHeader title="Prayer Settings" delay={180} />
        <Animated.View entering={FadeInUp.duration(350).delay(200)}>
          <GlassCard style={styles.settingsCard}>
            <PickerRow
              label="Calculation Method"
              currentLabel={currentCalcLabel}
              onPress={() => setShowCalcMethodPicker(true)}
            />

            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            <SettingRow label="Asr Calculation" subtitle="Madhab">
              <SegmentedControl
                options={ASR_OPTIONS}
                selectedValue={prayerState.asrCalculation}
                onSelect={setAsrCalculation}
              />
            </SettingRow>

            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            <PickerRow
              label="High Latitude Rule"
              currentLabel={currentHighLatLabel}
              onPress={() => setShowHighLatPicker(true)}
            />
          </GlassCard>
        </Animated.View>

        {/* ── Notification Settings ──────────────────────────── */}
        <SectionHeader title="Prayer Notifications" delay={220} />
        <Animated.View entering={FadeInUp.duration(350).delay(240)}>
          <GlassCard style={styles.settingsCard}>
            <SettingRow label="Prayer Reminders">
              <Switch
                value={prayerState.notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: theme.border, true: NoorColors.gold }}
                accessibilityLabel={`Prayer reminders ${prayerState.notificationsEnabled ? "on" : "off"}`}
              />
            </SettingRow>

            {prayerState.notificationsEnabled && (
              <>
                <View style={[styles.divider, { backgroundColor: theme.divider }]} />

                {(["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const).map(
                  (prayer) => (
                    <React.Fragment key={prayer}>
                      <SettingRow label={`  ${prayer}`}>
                        <Switch
                          value={prayerState.notificationPreferences.perPrayer[prayer]}
                          onValueChange={() => handleTogglePrayer(prayer)}
                          trackColor={{ false: theme.border, true: NoorColors.gold }}
                          accessibilityLabel={`${prayer} notification ${prayerState.notificationPreferences.perPrayer[prayer] ? "on" : "off"}`}
                        />
                      </SettingRow>
                    </React.Fragment>
                  ),
                )}

                <View style={[styles.divider, { backgroundColor: theme.divider }]} />

                <SettingRow label="Remind me" subtitle="Before adhan">
                  <SegmentedControl
                    options={[
                      { label: "At time", value: "0" },
                      { label: "5 min", value: "5" },
                      { label: "15 min", value: "15" },
                      { label: "30 min", value: "30" },
                    ]}
                    selectedValue={String(prayerState.notificationPreferences.reminderOffset)}
                    onSelect={(val: string) =>
                      handleOffsetChange(Number(val) as ReminderOffset)
                    }
                  />
                </SettingRow>

                <View style={[styles.divider, { backgroundColor: theme.divider }]} />

                <SettingRow label="Daily Reflection Reminder">
                  <Switch
                    value={prayerState.notificationPreferences.dailyReflectionEnabled}
                    onValueChange={handleToggleDailyReflection}
                    trackColor={{ false: theme.border, true: NoorColors.gold }}
                    accessibilityLabel={`Daily reflection reminder ${prayerState.notificationPreferences.dailyReflectionEnabled ? "on" : "off"}`}
                  />
                </SettingRow>

                {prayerState.notificationPreferences.dailyReflectionEnabled && (
                  <SettingRow
                    label="  Reminder time"
                    subtitle={`${prayerState.notificationPreferences.dailyReflectionHour > 12 ? prayerState.notificationPreferences.dailyReflectionHour - 12 : prayerState.notificationPreferences.dailyReflectionHour}:${String(prayerState.notificationPreferences.dailyReflectionMinute).padStart(2, "0")} ${prayerState.notificationPreferences.dailyReflectionHour >= 12 ? "PM" : "AM"}`}
                  >
                    <SegmentedControl
                      options={[
                        { label: "8 PM", value: "20" },
                        { label: "9 PM", value: "21" },
                        { label: "10 PM", value: "22" },
                      ]}
                      selectedValue={String(prayerState.notificationPreferences.dailyReflectionHour)}
                      onSelect={(val: string) =>
                        setDailyReflectionTime(Number(val), 0)
                      }
                    />
                  </SettingRow>
                )}
              </>
            )}
          </GlassCard>
        </Animated.View>

        {/* ── Subscription ─────────────────────────────────── */}
        <SectionHeader title="Subscription" delay={260} />
        <Animated.View entering={FadeInUp.duration(350).delay(280)}>
          <GlassCard style={styles.settingsCard}>
            <SettingRow label="Current Plan">
              <View
                style={[
                  styles.planBadge,
                  {
                    backgroundColor: isPaid
                      ? NoorColors.gold + "20"
                      : theme.backgroundRoot,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.planBadgeText,
                    { color: isPaid ? NoorColors.gold : theme.textSecondary },
                  ]}
                >
                  {isPaid ? "Noor Plus" : "Free"}
                </ThemedText>
              </View>
            </SettingRow>

            {!isPaid && (
              <>
                <View
                  style={[styles.divider, { backgroundColor: theme.divider }]}
                />
                <Pressable
                  onPress={() => navigation.navigate("Pricing")}
                  style={[styles.upgradeButton, { backgroundColor: NoorColors.gold }]}
                  accessibilityRole="button"
                  accessibilityLabel="Upgrade to Noor Plus"
                >
                  <Feather
                    name="star"
                    size={16}
                    color={NoorColors.background}
                  />
                  <ThemedText
                    style={[
                      styles.upgradeButtonText,
                      { color: NoorColors.background },
                    ]}
                  >
                    Upgrade to Noor Plus
                  </ThemedText>
                </Pressable>
              </>
            )}
          </GlassCard>
        </Animated.View>

        {/* ── Data & Privacy ───────────────────────────────── */}
        <SectionHeader title="Data & Privacy" delay={340} />
        <Animated.View entering={FadeInUp.duration(350).delay(360)}>
          <GlassCard style={styles.settingsCard}>
            <ActionRow
              icon="download"
              title="Export Data"
              subtitle="Download your reflections"
              onPress={handleExportData}
            />
            <View style={[styles.divider, { backgroundColor: theme.divider }]} />
            <ActionRow
              icon="trash-2"
              title="Clear Reflection History"
              subtitle="Permanently delete all local data"
              onPress={handleClearHistory}
              destructive
            />
            <View style={[styles.divider, { backgroundColor: theme.divider }]} />
            <ActionRow
              icon="shield"
              title="Privacy Policy"
              onPress={handlePrivacyPolicy}
            />
          </GlassCard>
        </Animated.View>

        {/* ── About ────────────────────────────────────────── */}
        <SectionHeader title="About" delay={420} />
        <Animated.View entering={FadeInUp.duration(350).delay(440)}>
          <GlassCard style={styles.settingsCard}>
            <SettingRow label="App Version">
              <ThemedText
                style={[
                  styles.settingValueText,
                  { color: theme.textSecondary },
                ]}
              >
                {appVersion}
              </ThemedText>
            </SettingRow>

            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            <View style={styles.disclaimerRow}>
              <Feather
                name="alert-circle"
                size={16}
                color={theme.textSecondary}
                style={{ marginTop: 2 }}
              />
              <ThemedText
                style={[styles.disclaimerText, { color: theme.textSecondary }]}
              >
                Noor is a spiritual wellness companion and is not a substitute
                for professional mental health guidance or Islamic scholarly
                advice. Please consult qualified professionals for clinical or
                religious matters.
              </ThemedText>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            <View style={styles.creditsRow}>
              <ThemedText
                style={[styles.creditsText, { color: theme.textSecondary }]}
              >
                Prayer times powered by Adhan.js{"\n"}
                Quran text via quran.com API{"\n"}
                Made with love for the Ummah
              </ThemedText>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Build info for testers */}
        <View style={styles.buildInfoSection}>
          <ThemedText
            style={[styles.buildInfoText, { color: theme.textSecondary }]}
          >
            Build: {appVersion}
          </ThemedText>
          <ThemedText
            style={[styles.buildInfoText, { color: theme.textSecondary }]}
          >
            iOS Build: {Constants.expoConfig?.ios?.buildNumber || "unknown"} |
            Android Code:{" "}
            {Constants.expoConfig?.android?.versionCode || "unknown"}
          </ThemedText>
          {VALIDATION_MODE && (
            <ThemedText
              style={[styles.buildInfoText, { color: theme.textSecondary }]}
            >
              Validation Mode: on
            </ThemedText>
          )}
          {config.apiDomain ? (
            <ThemedText
              style={[styles.buildInfoText, { color: theme.textSecondary }]}
            >
              Server: {config.apiDomain}
            </ThemedText>
          ) : null}
        </View>
      </ScrollView>

      {/* ── Edit Name Modal ──────────────────────────────── */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText style={styles.modalTitle}>Edit Profile</ThemedText>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Your name"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.nameInput,
                { backgroundColor: theme.backgroundRoot, color: theme.text },
              ]}
              autoFocus
              maxLength={20}
              accessibilityLabel="Display name"
              accessibilityHint="Enter your preferred display name, up to 20 characters"
            />
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setShowEditModal(false)}
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.backgroundRoot },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
              >
                <ThemedText>Cancel</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSaveName}
                style={[styles.modalButton, { backgroundColor: NoorColors.gold }]}
                accessibilityRole="button"
                accessibilityLabel="Save"
              >
                <ThemedText style={{ color: NoorColors.background }}>
                  Save
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Picker Modals ────────────────────────────────── */}
      <PickerModal
        visible={showCalcMethodPicker}
        title="Calculation Method"
        options={CALCULATION_METHODS}
        selectedValue={prayerState.calculationMethod}
        onSelect={setCalculationMethod}
        onClose={() => setShowCalcMethodPicker(false)}
      />

      <PickerModal
        visible={showHighLatPicker}
        title="High Latitude Rule"
        options={HIGH_LATITUDE_RULES}
        selectedValue={prayerState.highLatitudeRule}
        onSelect={setHighLatitudeRule}
        onClose={() => setShowHighLatPicker(false)}
      />
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },

  // Profile card
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "serif",
  },
  avatarRing: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  profileInfo: {
    flex: 1,
  },
  profileGreeting: {
    fontSize: 12,
    opacity: 0.7,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 1,
  },
  profileEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  // Section headers
  sectionHeader: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    paddingHorizontal: 4,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  // Settings card
  settingsCard: {
    marginBottom: 4,
  },

  // Setting row
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    minHeight: 48,
  },
  settingRowLabel: {
    flex: 1,
    marginRight: 12,
  },
  settingRowLabelText: {
    fontSize: 15,
    fontWeight: "500",
  },
  settingRowSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  settingValueText: {
    fontSize: 14,
  },

  // Segmented control
  segmented: {
    flexDirection: "row",
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
    padding: 3,
  },
  segmentedOption: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.xs,
  },
  segmentedLabel: {
    fontSize: 13,
    fontWeight: "400",
  },

  // Picker row
  pickerRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pickerRowValue: {
    fontSize: 13,
  },

  // Action rows
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  actionRowContent: {
    flex: 1,
  },
  actionRowTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  actionRowSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // Divider
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 2,
  },

  // Upgrade button
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: BorderRadius.sm,
    marginTop: 8,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },

  // Plan badge
  planBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  planBadgeText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Disclaimer / credits
  disclaimerRow: {
    flexDirection: "row",
    paddingVertical: 10,
    gap: 10,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  creditsRow: {
    paddingVertical: 10,
    alignItems: "center",
  },
  creditsText: {
    fontSize: 12,
    lineHeight: 20,
    textAlign: "center",
  },

  // Build info
  buildInfoSection: {
    marginTop: 24,
    alignItems: "center",
    gap: 4,
  },
  buildInfoText: {
    fontSize: 11,
  },

  // Edit name modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  nameInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  // Picker modal
  pickerModalContent: {
    width: "90%",
    maxWidth: 360,
    borderRadius: 16,
    padding: 20,
    maxHeight: "70%",
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.sm,
    marginBottom: 2,
  },
  pickerOptionText: {
    fontSize: 15,
    flex: 1,
  },
  pickerCloseButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
});
