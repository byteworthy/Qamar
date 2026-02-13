import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { useHadiths, Hadith } from "@/hooks/useHadithData";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { RouteType } from "@/navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface HadithCardProps {
  hadith: Hadith;
  onPress: () => void;
  index: number;
}

function HadithCard({ hadith, onPress, index }: HadithCardProps) {
  const { theme } = useTheme();

  const gradeColor =
    hadith.grade === "Sahih"
      ? "#4CAF50"
      : hadith.grade === "Hasan"
        ? "#2196F3"
        : "#9E9E9E";

  return (
    <Animated.View entering={FadeInUp.duration(350).delay(index * 50)}>
      <GlassCard onPress={onPress} style={styles.hadithCard} elevated>
        <View style={styles.hadithContent}>
          <View style={styles.hadithHeader}>
            <View style={styles.hadithNumber}>
              <ThemedText style={styles.hadithNumberText}>
                {hadith.hadithNumber}
              </ThemedText>
            </View>
            <View
              style={[
                styles.gradeBadge,
                { backgroundColor: `${gradeColor}20` },
              ]}
            >
              <ThemedText style={[styles.gradeText, { color: gradeColor }]}>
                {hadith.grade}
              </ThemedText>
            </View>
          </View>

          <ThemedText
            style={[styles.hadithArabic, { fontFamily: "Amiri-Bold" }]}
            numberOfLines={2}
          >
            {hadith.textArabic}
          </ThemedText>

          <ThemedText
            style={[styles.hadithEnglish, { color: theme.text }]}
            numberOfLines={3}
          >
            {hadith.textEnglish}
          </ThemedText>

          <ThemedText
            style={[styles.narratorText, { color: theme.textSecondary }]}
          >
            {hadith.narrator}
          </ThemedText>
        </View>

        <Feather
          name="chevron-right"
          size={20}
          color={theme.textSecondary}
          style={styles.chevron}
        />
      </GlassCard>
    </Animated.View>
  );
}

export default function HadithListScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType<"HadithList">>();
  const { collectionId } = route.params;
  const { data: hadiths, isLoading, error } = useHadiths(collectionId);

  const handleHadithPress = (hadith: Hadith) => {
    navigation.navigate("HadithDetail", { hadithId: hadith.id });
  };

  if (isLoading) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText
            style={[styles.loadingText, { color: theme.textSecondary }]}
          >
            Loading hadiths...
          </ThemedText>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={theme.error} />
          <ThemedText style={[styles.errorText, { color: theme.error }]}>
            Failed to load hadiths
          </ThemedText>
          <ThemedText
            style={[styles.errorSubtext, { color: theme.textSecondary }]}
          >
            Please check your connection and try again
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={hadiths}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <HadithCard
            hadith={item}
            onPress={() => handleHadithPress(item)}
            index={index}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 100 + insets.bottom, paddingTop: 16 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="file-text" size={48} color={theme.textSecondary} />
            <ThemedText
              style={[styles.emptyText, { color: theme.textSecondary }]}
            >
              No hadiths available
            </ThemedText>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  hadithCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  hadithContent: {
    flex: 1,
    gap: 8,
  },
  hadithHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hadithNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  hadithNumberText: {
    fontSize: 14,
    fontWeight: "600",
  },
  gradeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gradeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  hadithArabic: {
    fontSize: 20,
    lineHeight: 30,
    textAlign: "right",
    writingDirection: "rtl",
  },
  hadithEnglish: {
    fontSize: 14,
    lineHeight: 20,
  },
  narratorText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  chevron: {
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
  },
});
