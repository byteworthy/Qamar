import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { Spacing, SiraatColors, Fonts } from "@/constants/theme";
import { syncBillingStatus, isPaidStatus } from "@/lib/billing";
import { useQueryClient } from "@tanstack/react-query";

export default function BillingSuccessScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sync = async () => {
      try {
        const result = await syncBillingStatus();
        if (isPaidStatus(result.status)) {
          setSuccess(true);
          queryClient.invalidateQueries({ queryKey: ["/api/billing/status"] });
          queryClient.invalidateQueries({
            queryKey: ["/api/reflection/can-reflect"],
          });
        } else {
          setError(
            "Your subscription is still processing. This can take a minute—please wait and try again.",
          );
        }
      } catch (err) {
        setError("We couldn't verify your subscription. Check your connection and try again.");
      } finally {
        setSyncing(false);
      }
    };

    sync();
  }, [queryClient]);

  const handleContinue = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }],
      }),
    );
  };

  const handleRetry = async () => {
    setSyncing(true);
    setError(null);
    try {
      const result = await syncBillingStatus();
      if (isPaidStatus(result.status)) {
        setSuccess(true);
        queryClient.invalidateQueries({ queryKey: ["/api/billing/status"] });
        queryClient.invalidateQueries({
          queryKey: ["/api/reflection/can-reflect"],
        });
      } else {
        setError(
          "Your subscription is still being processed. Please try again in a moment.",
        );
      }
    } catch (err) {
      setError("We couldn't verify your subscription. Check your connection and try again.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: insets.top + Spacing["4xl"],
          paddingBottom: insets.bottom + Spacing["4xl"],
        },
      ]}
    >
      {syncing ? (
        <View style={styles.content}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText
            type="body"
            style={[styles.message, { color: theme.textSecondary }]}
          >
            Verifying your subscription...
          </ThemedText>
        </View>
      ) : success ? (
        <View style={styles.content}>
          <View
            style={[
              styles.checkCircle,
              { backgroundColor: SiraatColors.emerald },
            ]}
          >
            <Feather name="check" size={48} color="#fff" />
          </View>
          <ThemedText
            type="h2"
            style={[styles.title, { fontFamily: Fonts?.serif }]}
          >
            Welcome to Noor Plus
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.message, { color: theme.textSecondary }]}
          >
            You now have unlimited reflections, full history access, pattern
            insights, and contextual duas.
          </ThemedText>
          <View style={styles.buttonContainer}>
            <Button onPress={handleContinue} variant="primary">
              Begin Your Journey
            </Button>
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          <View
            style={[styles.checkCircle, { backgroundColor: SiraatColors.clay }]}
          >
            <Feather name="clock" size={48} color="#fff" />
          </View>
          <ThemedText
            type="h2"
            style={[styles.title, { fontFamily: Fonts?.serif }]}
          >
            Almost There
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.message, { color: theme.textSecondary }]}
          >
            {error}
          </ThemedText>
          <View style={styles.buttonContainer}>
            <Button onPress={handleRetry} variant="primary">
              Try Again
            </Button>
            <View style={styles.buttonSpacer} />
            <Button onPress={handleContinue} variant="secondary">
              Continue to Home
            </Button>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  content: {
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  message: {
    textAlign: "center",
    marginTop: Spacing.lg,
    lineHeight: 24,
  },
  buttonContainer: {
    marginTop: Spacing["3xl"],
    width: "100%",
  },
  buttonSpacer: {
    height: Spacing.md,
  },
});
