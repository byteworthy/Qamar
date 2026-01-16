import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, ScrollView, TextInput, Modal, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

import { useTheme } from "@/hooks/useTheme";
import { NiyyahColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getBillingStatus, isPaidStatus } from "@/lib/billing";

const USER_NAME_KEY = "@noor_user_name";
const USER_EMAIL_KEY = "@noor_user_email";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuItemProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  delay: number;
  showChevron?: boolean;
}

function MenuItem({ icon, title, subtitle, onPress, delay, showChevron = true }: MenuItemProps) {
  const { theme } = useTheme();
  
  return (
    <Animated.View entering={FadeInUp.duration(300).delay(delay)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.menuItem,
          { backgroundColor: theme.cardBackground, opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <Feather name={icon} size={18} color={theme.textSecondary} />
        <View style={styles.menuItemContent}>
          <ThemedText style={styles.menuItemTitle}>{title}</ThemedText>
          {subtitle && (
            <ThemedText style={[styles.menuItemSubtitle, { color: theme.textSecondary }]}>
              {subtitle}
            </ThemedText>
          )}
        </View>
        {showChevron && (
          <Feather name="chevron-right" size={18} color={theme.textSecondary} style={{ opacity: 0.5 }} />
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [userName, setUserName] = useState<string>("Friend");
  const [userEmail, setUserEmail] = useState<string>("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const { data: billingStatus } = useQuery({
    queryKey: ["/api/billing/status"],
    queryFn: getBillingStatus,
    staleTime: 60000,
  });

  const isPaid = billingStatus ? isPaidStatus(billingStatus.status) : false;

  useEffect(() => {
    AsyncStorage.getItem(USER_NAME_KEY).then((name) => {
      if (name && name.trim()) setUserName(name);
    });
    AsyncStorage.getItem(USER_EMAIL_KEY).then((email) => {
      if (email && email.trim()) setUserEmail(email);
    });
  }, []);

  const handleSaveName = async () => {
    const trimmedName = nameInput.trim();
    if (trimmedName) {
      await AsyncStorage.setItem(USER_NAME_KEY, trimmedName);
      setUserName(trimmedName);
    }
    setShowEditModal(false);
    setNameInput("");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16, paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
          <ThemedText style={styles.headerTitle}>Profile</ThemedText>
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.duration(350).delay(100)}
          style={[styles.profileCard, { backgroundColor: theme.cardBackground }]}
        >
          <View style={styles.profileInfo}>
            <ThemedText style={styles.profileName}>{userName}</ThemedText>
            {userEmail ? (
              <ThemedText style={[styles.profileEmail, { color: theme.textSecondary }]}>
                {userEmail}
              </ThemedText>
            ) : null}
          </View>
          <Pressable
            onPress={() => {
              setNameInput(userName);
              setShowEditModal(true);
            }}
            style={[styles.editButton, { backgroundColor: theme.backgroundDefault }]}
          >
            <ThemedText style={styles.editButtonText}>Edit</ThemedText>
          </Pressable>
        </Animated.View>

        {!isPaid && (
          <Animated.View entering={FadeInUp.duration(350).delay(150)}>
            <Pressable
              onPress={() => navigation.navigate("Pricing")}
              style={({ pressed }) => [
                styles.upgradeCard,
                { opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <ThemedText style={styles.upgradeText}>Upgrade to Noor Plus</ThemedText>
              <View style={styles.upgradeIcon}>
                <ThemedText style={{ fontSize: 20 }}>*</ThemedText>
              </View>
            </Pressable>
          </Animated.View>
        )}

        <View style={styles.menuSection}>
          <MenuItem
            icon="clock"
            title="Reflection History"
            onPress={() => navigation.navigate("History")}
            delay={200}
          />
          <MenuItem
            icon="credit-card"
            title="Subscription"
            subtitle={isPaid ? "Noor Plus" : "Free Plan"}
            onPress={() => navigation.navigate("Pricing")}
            delay={250}
          />
          <MenuItem
            icon="shield"
            title="Privacy Policy"
            onPress={() => Alert.alert("Privacy Policy", "Coming soon")}
            delay={300}
          />
          <MenuItem
            icon="help-circle"
            title="FAQs"
            onPress={() => Alert.alert("FAQs", "Coming soon")}
            delay={350}
          />
        </View>
      </ScrollView>

      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText style={styles.modalTitle}>Edit Profile</ThemedText>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Your name"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.nameInput,
                { backgroundColor: theme.backgroundRoot, color: theme.text }
              ]}
              autoFocus
              maxLength={20}
            />
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setShowEditModal(false)}
                style={[styles.modalButton, { backgroundColor: theme.backgroundRoot }]}
              >
                <ThemedText>Cancel</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSaveName}
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
              >
                <ThemedText style={{ color: NiyyahColors.background }}>Save</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "500",
  },
  upgradeCard: {
    backgroundColor: NiyyahColors.accent,
    padding: 16,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  upgradeText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: NiyyahColors.background,
  },
  upgradeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  menuSection: {
    gap: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    gap: 14,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  menuItemSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
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
});
