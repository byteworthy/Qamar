import React, { ReactNode } from "react";
import { View, StyleSheet, ScrollView, Pressable, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { Layout } from "@/constants/layout";
import { ThemedText } from "@/components/ThemedText";

interface ScreenProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  headerRight?: ReactNode;
  scrollable?: boolean;
  contentStyle?: object;
  centered?: boolean;
}

const HEADER_HEIGHT = 52;

export function Screen({
  children,
  title,
  showBack = false,
  onBack,
  headerRight,
  scrollable = true,
  contentStyle,
  centered = false,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { height: screenHeight } = useWindowDimensions();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const hasHeader = title || showBack || headerRight;

  const contentContainerStyle = [
    styles.scrollContent,
    {
      paddingTop: hasHeader ? Layout.spacing.md : Layout.spacing.xl,
      paddingBottom: insets.bottom + Layout.spacing.xl,
      minHeight: scrollable ? undefined : screenHeight - insets.top - (hasHeader ? HEADER_HEIGHT : 0),
    },
    centered && styles.centeredContent,
    contentStyle,
  ];

  const content = scrollable ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, contentContainerStyle]}>
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
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Feather name="arrow-left" size={22} color={theme.text} />
              </Pressable>
            )}
          </View>
          
          <View style={styles.headerCenter}>
            {title && (
              <ThemedText 
                numberOfLines={1} 
                style={[styles.headerTitle, { fontSize: Layout.typeScale.h2 }]}
              >
                {title}
              </ThemedText>
            )}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  safeTop: {
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    maxWidth: Layout.container.maxWidth,
    paddingHorizontal: Layout.container.screenPad,
  },
  headerLeft: {
    width: 44,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRight: {
    width: 44,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  headerTitle: {
    textAlign: "center",
    fontWeight: "500",
  },
  backButton: {
    padding: Layout.spacing.xs,
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    width: "100%",
    maxWidth: Layout.container.maxWidth,
    alignSelf: "center",
    paddingHorizontal: Layout.container.screenPad,
  },
  content: {
    flex: 1,
    width: "100%",
  },
  centeredContent: {
    justifyContent: "center",
  },
});
