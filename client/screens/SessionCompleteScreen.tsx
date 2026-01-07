import React, { useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp, CommonActions } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts, SiraatColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { saveSession } from "@/lib/storage";
import { ScreenCopy } from "@/constants/brand";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "SessionComplete">;
type RouteType = RouteProp<RootStackParamList, "SessionComplete">;

export default function SessionCompleteScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { thought, distortions, reframe, intention, practice, anchor } = route.params;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    saveSession({
      thought,
      distortions,
      reframe,
      intention,
      practice,
      timestamp: Date.now(),
    });
  }, []);

  const handleGoHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: insets.top + Spacing["4xl"],
          paddingBottom: insets.bottom + Spacing["4xl"],
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={[styles.checkCircle, { backgroundColor: SiraatColors.emerald }]}>
          <Feather name="check" size={40} color={SiraatColors.cream} />
        </View>
        <ThemedText type="h2" style={[styles.title, { fontFamily: Fonts?.serif }]}>
          {ScreenCopy.complete.title}
        </ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          {ScreenCopy.complete.subtitle}
        </ThemedText>
      </View>

      <View style={styles.cardsSection}>
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {ScreenCopy.complete.cards.niyyah}
          </ThemedText>
          <ThemedText type="bodyLarge" style={[styles.cardText, { fontFamily: Fonts?.serif }]}>
            {intention}
          </ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {ScreenCopy.complete.cards.anchor}
          </ThemedText>
          <ThemedText type="body" style={[styles.cardText, { fontFamily: Fonts?.serif, fontStyle: "italic" }]}>
            {anchor}
          </ThemedText>
        </View>
      </View>

      <View style={styles.buttonSection}>
        <Button
          onPress={handleGoHome}
          style={{ backgroundColor: theme.primary }}
        >
          {ScreenCopy.complete.returnHome}
        </Button>
      </View>
    </ScrollView>
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
    marginBottom: Spacing["4xl"],
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
  },
  cardsSection: {
    gap: Spacing.lg,
    marginBottom: Spacing["3xl"],
  },
  card: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  cardText: {
    marginTop: Spacing.sm,
    lineHeight: 26,
  },
  buttonSection: {
    marginTop: "auto",
  },
});
