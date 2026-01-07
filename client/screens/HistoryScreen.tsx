import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { getSessions, Session } from "@/lib/storage";

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const loadSessions = async () => {
    const data = await getSessions();
    setSessions(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderSession = ({ item, index }: { item: Session; index: number }) => {
    const isExpanded = expandedId === item.timestamp;
    
    return (
      <Pressable
        onPress={() => toggleExpand(item.timestamp)}
        style={({ pressed }) => [
          styles.sessionCard,
          { backgroundColor: theme.cardBackground, opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <View style={styles.sessionHeader}>
          <View style={styles.sessionMeta}>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {formatDate(item.timestamp)}
            </ThemedText>
            <View style={styles.distortionTags}>
              {item.distortions.slice(0, 2).map((d, i) => (
                <View key={i} style={[styles.tag, { backgroundColor: theme.backgroundSecondary }]}>
                  <ThemedText type="caption" style={{ color: theme.primary }}>
                    {d}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
          <Feather 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={theme.textSecondary} 
          />
        </View>

        <ThemedText type="body" numberOfLines={isExpanded ? undefined : 2} style={styles.thoughtText}>
          {item.thought}
        </ThemedText>

        {isExpanded ? (
          <View style={styles.expandedContent}>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            
            <View style={styles.expandedSection}>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Reframe
              </ThemedText>
              <ThemedText type="small" style={[styles.reframeText, { fontFamily: Fonts?.serif }]}>
                {item.reframe}
              </ThemedText>
            </View>

            <View style={styles.expandedSection}>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Practice
              </ThemedText>
              <ThemedText type="small" style={{ fontFamily: Fonts?.serif }}>
                {item.practice}
              </ThemedText>
            </View>

            <View style={styles.expandedSection}>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Intention
              </ThemedText>
              <ThemedText type="small" style={{ fontFamily: Fonts?.serif }}>
                {item.intention}
              </ThemedText>
            </View>
          </View>
        ) : null}
      </Pressable>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="book-open" size={48} color={theme.textSecondary} />
      <ThemedText type="h4" style={[styles.emptyTitle, { fontFamily: Fonts?.serif }]}>
        No Sessions Yet
      </ThemedText>
      <ThemedText type="body" style={[styles.emptyText, { color: theme.textSecondary }]}>
        Your completed sessions will appear here
      </ThemedText>
    </View>
  );

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing["3xl"],
        },
      ]}
      data={sessions}
      keyExtractor={(item) => item.timestamp.toString()}
      renderItem={renderSession}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={theme.primary}
        />
      }
      showsVerticalScrollIndicator={false}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
  },
  sessionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  sessionMeta: {
    flex: 1,
  },
  distortionTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  thoughtText: {
    lineHeight: 22,
  },
  expandedContent: {
    marginTop: Spacing.md,
  },
  divider: {
    height: 1,
    marginBottom: Spacing.md,
  },
  expandedSection: {
    marginBottom: Spacing.md,
  },
  reframeText: {
    fontStyle: "italic",
    marginTop: Spacing.xs,
    lineHeight: 22,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["6xl"],
  },
  emptyTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: "center",
  },
});
