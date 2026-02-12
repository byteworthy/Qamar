import { StyleSheet } from "react-native";
import { NiyyahColors } from "@/constants/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  greetingContent: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  salaamText: {
    fontSize: 22,
  },
  nameText: {
    fontSize: 22,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 15,
    marginTop: 2,
  },
  anchorCard: {
    marginBottom: -20,
    zIndex: 1,
  },
  anchorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  anchorBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  anchorLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "500",
  },
  anchorText: {
    fontSize: 20,
    lineHeight: 32,
    fontWeight: "500",
  },
  modulesSection: {
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  sectionLabel: {
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 14,
    fontWeight: "500",
  },
  modulesGrid: {
    gap: 16,
  },
  moduleCard: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  moduleGradient: {
    padding: 20,
    minHeight: 110,
  },
  moduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  moduleContent: {
    flex: 1,
    justifyContent: "flex-end",
  },
  moduleTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 18,
  },
  proBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  proBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  upgradeSection: {
    marginBottom: 32,
    marginTop: 8,
  },
  upgradeButton: {
    backgroundColor: NiyyahColors.accent,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: NiyyahColors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  upgradeContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  upgradeText: {
    fontSize: 15,
    fontWeight: "600",
    color: NiyyahColors.background,
  },
  footer: {
    alignItems: "center",
    gap: 8,
    paddingTop: 8,
  },
  methodCallout: {
    textAlign: "center",
    fontStyle: "italic",
    fontSize: 12,
    opacity: 0.7,
  },
  disclaimer: {
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 16,
    fontSize: 10,
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  nameInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  // Journey Card
  journeyCard: {
    marginBottom: 32,
    marginTop: 32,
  },
  journeyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  journeyLevel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  journeyIcon: {
    fontSize: 32,
  },
  journeyLevelName: {
    fontSize: 17,
    fontWeight: "600",
  },
  journeyLevelDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  journeyStats: {
    alignItems: "flex-end",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  progressSection: {
    marginTop: 16,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  streakBadge: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  streakText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
