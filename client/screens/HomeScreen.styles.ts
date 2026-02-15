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

  // ── Header ──────────────────────────────────────────────────────────
  header: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  hijriDate: {
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    opacity: 0.6,
    marginBottom: 6,
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
    lineHeight: 22,
  },

  // ── Next Prayer Card ────────────────────────────────────────────────
  prayerCard: {
    marginBottom: 20,
  },
  prayerCardInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  prayerCardLeft: {
    flex: 1,
  },
  prayerLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    marginBottom: 6,
  },
  prayerName: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 2,
  },
  prayerTime: {
    fontSize: 13,
    opacity: 0.7,
  },
  prayerCountdown: {
    alignItems: "flex-end",
  },
  countdownText: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -1,
  },
  countdownLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  prayerLocationHint: {
    fontSize: 11,
    marginTop: 8,
    opacity: 0.5,
    fontStyle: "italic",
  },

  // ── Daily Hadith Card ───────────────────────────────────────────────
  hadithCard: {
    marginBottom: 20,
  },
  hadithHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  hadithBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  hadithLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
  },
  hadithArabic: {
    fontSize: 22,
    lineHeight: 38,
    textAlign: "right",
    marginBottom: 12,
    writingDirection: "rtl",
  },
  hadithEnglish: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.85,
  },
  hadithSource: {
    fontSize: 11,
    marginTop: 10,
    opacity: 0.5,
    fontStyle: "italic",
  },
  hadithTapHint: {
    fontSize: 11,
    marginTop: 8,
    opacity: 0.4,
  },

  // ── Today's Anchor Card ─────────────────────────────────────────────
  anchorCard: {
    marginBottom: 20,
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

  // ── Quick Actions ───────────────────────────────────────────────────
  quickActionsSection: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  quickActionsLabel: {
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 14,
    fontWeight: "500",
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  quickActionItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  quickActionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontSize: 11,
    textAlign: "center",
    fontWeight: "500",
    letterSpacing: 0.2,
  },

  // ── Learning Streak ─────────────────────────────────────────────────
  streakCard: {
    marginBottom: 20,
  },
  streakHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  streakHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  streakTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  streakCount: {
    fontSize: 13,
    fontWeight: "600",
  },
  streakProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  streakProgressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  streakProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  streakProgressText: {
    fontSize: 12,
    fontWeight: "500",
    minWidth: 40,
    textAlign: "right",
  },

  // ── Recent Reflections ──────────────────────────────────────────────
  reflectionsSection: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  reflectionsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  reflectionsSectionTitle: {
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "500",
  },
  reflectionsSeeAll: {
    fontSize: 13,
    fontWeight: "500",
  },
  reflectionItem: {
    marginBottom: 12,
  },
  reflectionItemInner: {
    paddingVertical: 4,
  },
  reflectionDate: {
    fontSize: 11,
    marginBottom: 4,
    opacity: 0.5,
  },
  reflectionThought: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    marginBottom: 4,
  },
  reflectionReframe: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.7,
    fontStyle: "italic",
  },
  noReflections: {
    textAlign: "center",
    fontSize: 13,
    opacity: 0.5,
    paddingVertical: 16,
  },

  // ── Journey Progress Card ───────────────────────────────────────────
  journeyCard: {
    marginBottom: 20,
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

  // ── Module Cards ────────────────────────────────────────────────────
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

  // ── Upgrade ─────────────────────────────────────────────────────────
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

  // ── Footer ──────────────────────────────────────────────────────────
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

  // ── Name Modal ──────────────────────────────────────────────────────
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
});
