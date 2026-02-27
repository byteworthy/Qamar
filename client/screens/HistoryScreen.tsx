import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Share from "react-native-share";

import { useTheme } from "@/hooks/useTheme";
import { useScreenProtection } from "@/hooks/useScreenProtection";
import { Spacing, BorderRadius, Fonts, SiraatColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { GlassCard } from "@/components/GlassCard";
import { ShimmerPlaceholder } from "@/components/ShimmerPlaceholder";
import { getSessions, Session } from "@/lib/storage";
import { getBillingStatus, isPaidStatus } from "@/lib/billing";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { hapticMedium } from "@/lib/haptics";
import { EmptyState } from "@/components/EmptyState";
import { styles } from "./HistoryScreen.styles";
import Animated, {
  FadeInUp,
  FadeInDown,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "History">;

// Contemplative spring config - serene, meditative feel (matching GlassCard and Button)
const springConfig: WithSpringConfig = {
  damping: 20,
  mass: 0.5,
  stiffness: 120,
  overshootClamping: true,
  energyThreshold: 0.001,
};

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

  // Prevent screenshots on this screen (displays all journal entries)
  useScreenProtection({ preventScreenCapture: true });

  const { data: billingStatus } = useQuery({
    queryKey: ["/api/billing/status"],
    queryFn: getBillingStatus,
    staleTime: 60000,
  });

  const isPaid = billingStatus ? isPaidStatus(billingStatus.status) : false;

  const {
    data: insights,
    isLoading: insightsLoading,
    refetch: refetchInsights,
  } = useQuery({
    queryKey: ["/api/insights/summary"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/insights/summary");
      return response.json() as Promise<InsightSummary>;
    },
    enabled: isPaid,
    staleTime: 300000,
  });

  const {
    data: assumptions,
    isLoading: assumptionsLoading,
    refetch: refetchAssumptions,
  } = useQuery({
    queryKey: ["/api/insights/assumptions"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/insights/assumptions");
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
    }, []),
  );

  // Add export button to header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        sessions.length > 0 ? (
          <Pressable
            onPress={handleExport}
            style={{ marginRight: Spacing.sm }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Export reflections"
            accessibilityHint="Share your reflections as text"
          >
            <Feather name="download" size={20} color={theme.primary} />
          </Pressable>
        ) : null,
    });
  }, [navigation, sessions.length, theme.primary]);

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

  const handleExport = async () => {
    if (sessions.length === 0) {
      Alert.alert(
        "No Reflections",
        "You don't have any reflections to export yet.",
      );
      return;
    }

    try {
      hapticMedium();

      // Format as markdown
      const markdown = sessions
        .map((s) => {
          const date = new Date(s.timestamp).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          return `## ${date}\n\n**Thought**: ${s.thought}\n\n**Reframe**: ${s.reframe}\n\n**Intention**: ${s.intention}\n\n---\n\n`;
        })
        .join("");

      const header = `# My Noor Reflections\n\nExported on ${new Date().toLocaleDateString()}\n\n---\n\n`;
      const fullContent = header + markdown;

      await Share.open({
        message: fullContent,
        title: "My Noor Reflections",
        subject: "Noor Reflections Export",
      });
    } catch (error: unknown) {
      // User cancelled - don't show error
      const message = error instanceof Error ? error.message : String(error);
      if (message !== "User did not share") {
        Alert.alert(
          "Export Unavailable",
          "We couldn't export your reflections. Please try again in a moment.",
        );
      }
    }
  };

  const handleDeleteReflection = async (sessionId: number) => {
    Alert.alert(
      "Delete Reflection",
      "Are you sure you want to delete this reflection? This cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              hapticMedium();
              const response = await apiRequest(
                "DELETE",
                `/api/reflection/${sessionId}`,
              );

              if (response.ok) {
                // Reload sessions
                await loadSessions();
                // Refresh insights if paid user
                if (isPaid) {
                  refetchInsights();
                  if (insightsExpanded) {
                    refetchAssumptions();
                  }
                }
              } else {
                const error = await response.json();
                Alert.alert(
                  "Unable to Delete",
                  error.error ||
                    "We couldn't delete this reflection. Please try again.",
                );
              }
            } catch (error) {
              Alert.alert(
                "Unable to Delete",
                "We couldn't delete this reflection. Check your connection and try again.",
              );
            }
          },
        },
      ],
    );
  };

  const renderInsightsCard = () => {
    if (!isPaid) return null;

    return (
      <GlassCard style={styles.insightsCard} elevated>
        <Pressable
          onPress={() => setInsightsExpanded(!insightsExpanded)}
          style={styles.insightsHeader}
          accessibilityRole="button"
          accessibilityLabel="Your patterns insights"
          accessibilityHint={`${insightsExpanded ? "Collapse" : "Expand"} to ${insightsExpanded ? "hide" : "view"} your reflection patterns`}
          accessibilityState={{ expanded: insightsExpanded }}
        >
          <View style={styles.insightsHeaderLeft}>
            <View
              style={[
                styles.proBadge,
                { backgroundColor: theme.pillBackground },
              ]}
            >
              <Feather name="star" size={12} color={theme.onPrimary} />
              <ThemedText
                type="caption"
                style={{ color: theme.onPrimary, marginLeft: 4 }}
              >
                Noor Plus
              </ThemedText>
            </View>
            <ThemedText
              type="bodyLarge"
              style={[styles.insightsTitle, { fontFamily: Fonts?.serif }]}
            >
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
              <View style={{ marginVertical: Spacing.lg, gap: Spacing.sm }}>
                <ShimmerPlaceholder width={120} height={16} borderRadius={8} />
                <ShimmerPlaceholder width={80} height={32} borderRadius={8} />
                <View style={{ marginTop: Spacing.sm }}>
                  <ShimmerPlaceholder width={180} height={14} borderRadius={6} />
                </View>
              </View>
            ) : insights ? (
              <>
                <View style={styles.insightSection}>
                  <ThemedText
                    type="caption"
                    style={{ color: theme.textSecondary }}
                  >
                    Total Reflections
                  </ThemedText>
                  <ThemedText type="h3" style={{ fontFamily: Fonts?.serif }}>
                    {insights.totalReflections}
                  </ThemedText>
                </View>

                {insights.topDistortions.length > 0 ? (
                  <View style={styles.insightSection}>
                    <ThemedText
                      type="caption"
                      style={{ color: theme.textSecondary }}
                    >
                      Common Patterns
                    </ThemedText>
                    <View style={styles.distortionsList}>
                      {insights.topDistortions.map((d, i) => (
                        <View key={i} style={styles.distortionRow}>
                          <ThemedText type="body">{d.name}</ThemedText>
                          <ThemedText
                            type="caption"
                            style={{ color: theme.textSecondary }}
                          >
                            {d.count}x
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}

                {insights.summary ? (
                  <View style={styles.insightSection}>
                    <ThemedText
                      type="caption"
                      style={{ color: theme.textSecondary }}
                    >
                      Pattern Summary
                    </ThemedText>
                    <ThemedText
                      type="body"
                      style={[styles.summaryText, { fontFamily: Fonts?.serif }]}
                    >
                      {insights.summary}
                    </ThemedText>
                  </View>
                ) : insights.totalReflections < 5 ? (
                  <View style={styles.insightSection}>
                    <ThemedText
                      type="small"
                      style={{
                        color: theme.textSecondary,
                        fontStyle: "italic",
                      }}
                    >
                      Complete {5 - insights.totalReflections} more reflection
                      {5 - insights.totalReflections !== 1 ? "s" : ""} to unlock
                      your pattern summary.
                    </ThemedText>
                  </View>
                ) : null}

                {assumptions?.assumptions &&
                assumptions.assumptions.length > 0 ? (
                  <View style={styles.insightSection}>
                    <ThemedText
                      type="caption"
                      style={{ color: theme.textSecondary }}
                    >
                      Your Assumptions
                    </ThemedText>
                    {assumptions.assumptions.slice(0, 3).map((a, i) => (
                      <View
                        key={i}
                        style={[
                          styles.assumptionCard,
                          { backgroundColor: theme.backgroundSecondary },
                        ]}
                      >
                        <ThemedText
                          type="body"
                          style={{ fontFamily: Fonts?.serif }}
                        >
                          {a.assumption}
                        </ThemedText>
                        <ThemedText
                          type="caption"
                          style={{
                            color: theme.textSecondary,
                            marginTop: Spacing.xs,
                          }}
                        >
                          Appeared {a.frequency} time
                          {a.frequency !== 1 ? "s" : ""}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                ) : assumptionsLoading ? (
                  <View style={{ marginVertical: Spacing.sm, gap: Spacing.xs }}>
                    <ShimmerPlaceholder width={200} height={14} borderRadius={6} />
                    <ShimmerPlaceholder width={180} height={14} borderRadius={6} />
                    <ShimmerPlaceholder width={160} height={14} borderRadius={6} />
                  </View>
                ) : null}
              </>
            ) : null}
          </View>
        ) : null}
      </GlassCard>
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

  // Animated list item with long-press scale feedback
  interface AnimatedHistoryItemProps {
    item: Session;
    index: number;
    isExpanded: boolean;
  }

  function AnimatedHistoryItem({
    item,
    index,
    isExpanded,
  }: AnimatedHistoryItemProps) {
    const scale = useSharedValue(1);
    const cappedDelay = Math.min(index * 40, 400);

    const handlePressIn = () => {
      scale.value = withSpring(0.98, springConfig);
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, springConfig);
    };

    const handleLongPress = () => {
      hapticMedium();
      handleDeleteReflection(item.timestamp);
    };

    const scaleStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <Animated.View
        testID={`reflection-item-${index}`}
        entering={FadeInUp.springify()
          .delay(cappedDelay)
          .damping(springConfig.damping as number)
          .mass(springConfig.mass as number)
          .stiffness(springConfig.stiffness as number)}
        exiting={FadeOut.duration(200)}
        style={scaleStyle}
      >
        <GlassCard style={styles.sessionCard} elevated>
          <Pressable
            onPress={() => toggleExpand(item.timestamp)}
            onLongPress={handleLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            delayLongPress={500}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.9 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Reflection from ${formatDate(item.timestamp)}`}
            accessibilityHint={`${isExpanded ? "Collapse" : "Expand"} to ${isExpanded ? "hide" : "view"} full reflection details. Long press to delete.`}
            accessibilityState={{ expanded: isExpanded }}
          >
          <View style={styles.sessionHeader}>
            <View style={styles.sessionMeta}>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {formatDate(item.timestamp)}
              </ThemedText>
              <View style={styles.distortionTags}>
                {item.distortions.slice(0, 2).map((d, i) => (
                  <View
                    key={i}
                    style={[
                      styles.tag,
                      { backgroundColor: theme.backgroundSecondary },
                    ]}
                  >
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
              <ThemedText
                type="small"
                numberOfLines={1}
                style={[styles.intentionText, { color: theme.textSecondary }]}
              >
                {item.intention}
              </ThemedText>
            </View>
          )}

          {isExpanded ? (
            <View style={styles.expandedContent}>
              <View
                style={[styles.divider, { backgroundColor: theme.border }]}
              />

              <View style={styles.expandedSection}>
                <ThemedText
                  type="caption"
                  style={{ color: theme.textSecondary }}
                >
                  Reframe
                </ThemedText>
                <ThemedText
                  type="small"
                  style={[styles.reframeText, { fontFamily: Fonts?.serif }]}
                >
                  {item.reframe}
                </ThemedText>
              </View>

              <View style={styles.expandedSection}>
                <ThemedText
                  type="caption"
                  style={{ color: theme.textSecondary }}
                >
                  Practice
                </ThemedText>
                <ThemedText type="small" style={{ fontFamily: Fonts?.serif }}>
                  {item.practice}
                </ThemedText>
              </View>

              <View style={styles.expandedSection}>
                <ThemedText
                  type="caption"
                  style={{ color: theme.textSecondary }}
                >
                  Original Thought
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{ fontStyle: "italic", marginTop: Spacing.xs }}
                >
                  {item.thought}
                </ThemedText>
              </View>

              <View style={styles.expandedSection}>
                <ThemedText
                  type="caption"
                  style={{ color: theme.textSecondary }}
                >
                  Intention
                </ThemedText>
                <ThemedText type="small" style={{ fontFamily: Fonts?.serif }}>
                  {item.intention}
                </ThemedText>
              </View>

              <Pressable
                onPress={() => handleDeleteReflection(item.timestamp)}
                style={[
                  styles.deleteButton,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    borderColor: theme.border,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Delete this reflection"
                accessibilityHint="Permanently deletes this reflection. Requires confirmation."
              >
                <Feather name="trash-2" size={16} color="#ef4444" />
                <ThemedText
                  type="small"
                  style={{ color: "#ef4444", marginLeft: Spacing.xs }}
                >
                  Delete Reflection
                </ThemedText>
              </Pressable>
            </View>
          ) : null}
          </Pressable>
        </GlassCard>
      </Animated.View>
    );
  }

  const renderSession = ({ item, index }: { item: Session; index: number }) => {
    const isExpanded = expandedId === item.timestamp;
    return <AnimatedHistoryItem item={item} index={index} isExpanded={isExpanded} />;
  };

  const renderEmpty = () => (
    <View testID="history-empty-state">
      <EmptyState
        icon="📖"
        title="No Reflections Yet"
      description="Completed reflections will appear here. Start your first reflection to begin your journey."
      actionLabel="Start a Reflection"
      onAction={() => navigation.navigate("Home")}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <AtmosphericBackground variant="atmospheric">
        <FlatList
          testID="reflection-list"
          style={styles.flatList}
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
      </AtmosphericBackground>
    </View>
  );
}

