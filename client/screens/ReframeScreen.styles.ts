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
  block: {
    marginBottom: Spacing["2xl"],
  },
  blockLabel: {
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
  },
  blockText: {
    lineHeight: 26,
  },
  // Perspective Selector
  perspectiveSelectorSection: {
    marginBottom: Spacing["2xl"],
  },
  perspectiveSelector: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  perspectiveIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  perspectiveSelectorContent: {
    flex: 1,
  },
  perspectiveOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  perspectiveOptionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  perspectiveOptionText: {
    marginLeft: Spacing.xs,
  },
  // Main Perspective
  perspectiveCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    marginBottom: Spacing["2xl"],
    overflow: "hidden",
  },
  perspectiveAccent: {
    width: 4,
    alignSelf: "stretch",
  },
  perspectiveContent: {
    flex: 1,
    padding: Spacing["2xl"],
  },
  perspectiveText: {
    lineHeight: 32,
    fontStyle: "italic",
  },
  // Next Step
  nextStepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  nextStepIcon: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  nextStepIconText: {
    fontWeight: "600",
    fontSize: 13,
  },
  // Belief Check
  beliefCheckSection: {
    marginBottom: Spacing["2xl"],
  },
  beliefButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  beliefButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  beliefShiftFeedback: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  beliefShiftText: {
    textAlign: "center",
    fontStyle: "italic",
  },
  // Anchors
  anchorsSection: {
    marginBottom: Spacing.xl,
  },
  anchorsLabel: {
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
  },
  anchorsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  anchorPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  anchorText: {
    fontStyle: "italic",
    fontSize: 13,
  },
  buttonSection: {
    marginTop: "auto",
    paddingTop: Spacing.lg,
  },
  // Islamic Reference Card
  islamicReferenceCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing["2xl"],
    borderLeftWidth: 4,
  },
  islamicReferenceHeader: {
    marginBottom: Spacing.md,
  },
  arabicText: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: Spacing.md,
    lineHeight: 34,
  },
  islamicReferenceText: {
    lineHeight: 28,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  islamicSource: {
    textAlign: "center",
    fontWeight: "500",
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
});
