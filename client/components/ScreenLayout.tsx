import React, { ReactNode } from "react";
import { View, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";

interface ScreenLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  headerRight?: ReactNode;
  headerContent?: ReactNode;
  scrollable?: boolean;
  contentStyle?: object;
}

const HEADER_HEIGHT = 56;

export function ScreenLayout({
  children,
  title,
  showBack = false,
  onBack,
  headerRight,
  headerContent,
  scrollable = true,
  contentStyle,
}: ScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const hasHeader = title || showBack || headerRight || headerContent;

  const content = scrollable ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContent,
        { 
          paddingTop: hasHeader ? Spacing.lg : Spacing["2xl"],
          paddingBottom: insets.bottom + Spacing["3xl"],
        },
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[
      styles.content, 
      { 
        paddingTop: hasHeader ? Spacing.lg : Spacing["2xl"],
        paddingBottom: insets.bottom + Spacing["3xl"],
      }, 
      contentStyle,
    ]}>
      {children}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.safeTop, { height: insets.top, backgroundColor: theme.backgroundRoot }]} />
      
      {hasHeader && (
        <View style={[styles.header, { height: HEADER_HEIGHT, backgroundColor: theme.backgroundRoot }]}>
          <View style={styles.headerLeft}>
            {showBack && (
              <Pressable
                onPress={handleBack}
                style={({ pressed }) => [
                  styles.backButton,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="arrow-left" size={24} color={theme.text} />
              </Pressable>
            )}
          </View>
          
          <View style={styles.headerCenter}>
            {headerContent ? (
              headerContent
            ) : title ? (
              <ThemedText type="h4" numberOfLines={1} style={styles.headerTitle}>
                {title}
              </ThemedText>
            ) : null}
          </View>
          
          <View style={styles.headerRight}>
            {headerRight}
          </View>
        </View>
      )}
      
      {content}
    </View>
  );
}

export function ScreenSection({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) {
  return <View style={[styles.section, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeTop: {
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  headerLeft: {
    width: 48,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRight: {
    width: 48,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  headerTitle: {
    textAlign: "center",
  },
  backButton: {
    padding: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
});
