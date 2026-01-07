import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts, SiraatColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { getSessions, Session } from "@/lib/storage";
import { getBillingStatus, isPaidStatus } from "@/lib/billing";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "History">;

interface InsightSummary {
  totalReflections: number;
  topDistortions: { name: string; count: number }[];
  summary: string | null;
  lastUpdated: string | null;
}

interface Assumption {
  id: number;
  assumption: string;
  frequency: number;
  firstSeen: string;
  lastSeen: string;
}

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [insightsExpanded, setInsightsExpanded] = useState(false);

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const { data: billingStatus } = useQuery({
    queryKey: ["/api/billing/status"],
    queryFn: getBillingStatus,
    staleTime: 60000,
  });

  const isPaid = billingStatus ? isPaidStatus(billingStatus.status) : false;

  const { data: insights, isLoading: insightsLoading, refetch: refetchInsights } = useQuery({
    queryKey: ["/api/insights/summary"],
    queryFn: async () => {
      const url = new URL("/api/insights/summary", getApiUrl());
      const response = await apiRequest(url.toString());
      return response.json() as Promise<InsightSummary>;
    },
    enabled: isPaid,
    staleTime: 300000,
  });

  const { data: assumptions, isLoading: assumptionsLoading, refetch: refetchAssumptions } = useQuery({
    queryKey: ["/api/insights/assumptions"],
    queryFn: async () => {
      const url = new URL("/api/insights/assumptions", getApiUrl());
      const response = await apiRequest(url.toString());
      return response.json() as Promise<{ assumptions: Assumption[] }>;
    },
    enabled: isPaid && insightsExpanded,
    staleTime: 300000,
  });

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
    if (isPaid) {
      refetchInsights();
      if (insightsExpanded) {
        refetchAssumptions();
      }
    }
    setRefreshing(false);
  };

  const renderInsightsCard = () => {
    if (!isPaid) return null;

    return (
      <View style={[styles.insightsCard, { backgroundColor: theme.backgroundDefault, borderColor: SiraatColors.indigo }]}>
        <Pressable
          onPress={() => setInsightsExpanded(!insightsExpanded)}
          style={styles.insightsHeader}
        >
          <View style={styles.insightsHeaderLeft}>
            <View style={[styles.proBadge, { backgroundColor: SiraatColors.indigo }]}>
              <Feather name="star" size={12} color="#fff" />
              <ThemedText type="caption" style={{ color: "#fff", marginLeft: 4 }}>Noor Plus</ThemedText>
            </View>
            <ThemedText type="bodyLarge" style={[styles.insightsTitle, { fontFamily: Fonts?.serif }]}>
              Your Patterns
            </ThemedText>
          </View>
          <Feather
            name={insightsExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={theme.textSecondary}
          />
        </Pressable>

        {insightsExpanded ? (
          <View style={styles.insightsContent}>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            
            {insightsLoading ? (
              <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: Spacing.lg }} />
            ) : insights ? (
              <>
                <View style={styles.insightSection}>
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                    Total Reflections
                  </ThemedText>
                  <ThemedText type="h3" style={{ fontFamily: Fonts?.serif }}>
                    {insights.totalReflections}
                  </ThemedText>
                </View>

                {insights.topDistortions.length > 0 ? (
                  <View style={styles.insightSection}>
                    <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                      Common Patterns
                    </ThemedText>
                    <View style={styles.distortionsList}>
                      {insights.topDistortions.map((d, i) => (
                        <View key={i} style={styles.distortionRow}>
                          <ThemedText type="body">{d.name}</ThemedText>
                          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                            {d.count}x
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}

                {insights.summary ? (
                  <View style={styles.insightSection}>
                    <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                      Pattern Summary
                    </ThemedText>
                    <ThemedText type="body" style={[styles.summaryText, { fontFamily: Fonts?.serif }]}>
                      {insights.summary}
                    </ThemedText>
                  </View>
                ) : insights.totalReflections < 5 ? (
                  <View style={styles.insightSection}>
                    <ThemedText type="small" style={{ color: theme.textSecondary, fontStyle: "italic" }}>
                      Complete {5 - insights.totalReflections} more reflection{5 - insights.totalReflections !== 1 ? "s" : ""} to unlock your pattern summary.
                    </ThemedText>
                  </View>
                ) : null}

                {assumptions?.assumptions && assumptions.assumptions.length > 0 ? (
                  <View style={styles.insightSection}>
                    <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                      Your Assumptions
                    </ThemedText>
                    {assumptions.assumptions.slice(0, 3).map((a, i) => (
                      <View key={i} style={[styles.assumptionCard, { backgroundColor: theme.backgroundSecondary }]}>
                        <ThemedText type="body" style={{ fontFamily: Fonts?.serif }}>
                          {a.assumption}
                        </ThemedText>
                        <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                          Appeared {a.frequency} time{a.frequency !== 1 ? "s" : ""}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                ) : assumptionsLoading ? (
                  <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: Spacing.sm }} />
                ) : null}
              </>
            ) : null}
          </View>
        ) : null}
      </View>
    );
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

        {isExpanded ? null : (
          <View style={styles.intentionPreview}>
            <Feather name="target" size={14} color={theme.textSecondary} />
            <ThemedText type="small" numberOfLines={1} style={[styles.intentionText, { color: theme.textSecondary }]}>
              {item.intention}
            </ThemedText>
          </View>
        )}

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
                Original Thought
              </ThemedText>
              <ThemedText type="small" style={{ fontStyle: "italic", marginTop: Spacing.xs }}>
                {item.thought}
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
        No Reflections Yet
      </ThemedText>
      <ThemedText type="body" style={[styles.emptyText, { color: theme.textSecondary }]}>
        Your completed reflections will appear here
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
      ListHeaderComponent={renderInsightsCard}
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
  intentionPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  intentionText: {
    flex: 1,
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
  insightsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  insightsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  insightsHeaderLeft: {
    flex: 1,
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.sm,
  },
  insightsTitle: {
    marginTop: Spacing.xs,
  },
  insightsContent: {
    marginTop: Spacing.md,
  },
  insightSection: {
    marginBottom: Spacing.lg,
  },
  distortionsList: {
    marginTop: Spacing.sm,
  },
  distortionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.xs,
  },
  summaryText: {
    marginTop: Spacing.sm,
    lineHeight: 24,
    fontStyle: "italic",
  },
  assumptionCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
});
