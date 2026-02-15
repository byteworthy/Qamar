import { StyleSheet } from "react-native";
import { Spacing, BorderRadius } from "@/constants/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  // Crisis Screen Styles
  crisisContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  crisisHeader: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  crisisIcon: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius["3xl"],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  crisisTitle: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  crisisMessage: {
    textAlign: "center",
    lineHeight: 26,
  },
  resourcesSection: {
    marginBottom: Spacing["2xl"],
  },
  resourceCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  resourceContent: {
    flex: 1,
  },
  resourceContact: {
    marginVertical: Spacing.xs,
    fontWeight: "600",
  },
  resourceArrow: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: Spacing.md,
  },
  islamicCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing["2xl"],
  },
  islamicText: {
    textAlign: "center",
    lineHeight: 26,
    fontStyle: "italic",
  },
  continueNote: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  // Standard Screen Styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.lg,
    textAlign: "center",
  },
  errorText: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionLabel: {
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionText: {
    lineHeight: 26,
  },
  distortionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  distortionPill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  distortionText: {
    fontWeight: "600",
  },
  patternItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  patternBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 9,
  },
  patternText: {
    flex: 1,
    lineHeight: 24,
  },
  mattersCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    overflow: "hidden",
  },
  mattersAccent: {
    width: 4,
    alignSelf: "stretch",
  },
  mattersContent: {
    flex: 1,
    padding: Spacing.xl,
  },
  mattersText: {
    lineHeight: 26,
    fontStyle: "italic",
  },
  buttonSection: {
    marginTop: "auto",
    paddingTop: Spacing.lg,
  },
  timeoutWarning: {
    textAlign: "center",
    fontStyle: "italic",
  },
  // Error State Styles
  errorContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  errorContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  errorTitle: {
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  errorActions: {
    width: "100%",
    marginTop: Spacing["2xl"],
  },
  patternRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
});
