/**
 * Pacing Controller Test Suite for Qamar
 *
 * Tests protective pacing mechanisms that prioritize user safety:
 * - getPacingConfig: Adaptive pacing based on distress level
 * - shouldOfferExit: Session fatigue detection
 * - getClosureRitual: Gentle session endings
 *
 * Charter compliance: Ensures "Pressure equals harm. Pacing equals safety."
 */

import { describe, test, expect } from "@jest/globals";
import {
  PacingController,
  type PacingConfig,
  type ClosureRitual,
  type SessionMetrics,
} from "../pacing-controller";
import type {
  DistressLevel,
  EmotionalState,
} from "../../shared/islamic-framework";
import type { ConversationState } from "../conversation-state-machine";

// =============================================================================
// PACING CONFIG TESTS
// =============================================================================

describe("PacingController.getPacingConfig", () => {
  describe("Crisis distress level", () => {
    test("enforces maximum protection for crisis level", () => {
      const config = PacingController.getPacingConfig("crisis", "listening", 0);

      expect(config.delayBeforeResponse).toBe(1500);
      expect(config.maxResponseLength).toBe(200);
      expect(config.requiresPermission).toBe(true);
      expect(config.softLanguage).toBe(true);
      expect(config.allowMultipleTopics).toBe(false);
      expect(config.showExitOption).toBe(true);
      expect(config.toneGuidance).toContain("Slow");
    });

    test("applies crisis protection regardless of conversation state", () => {
      const states: ConversationState[] = [
        "listening",
        "clarification",
        "reframing",
        "grounding",
      ];

      states.forEach((state) => {
        const config = PacingController.getPacingConfig("crisis", state, 0);
        expect(config.maxResponseLength).toBe(200);
        expect(config.showExitOption).toBe(true);
      });
    });
  });

  describe("High distress level", () => {
    test("enforces protective pacing for high distress", () => {
      const config = PacingController.getPacingConfig("high", "listening", 0);

      expect(config.delayBeforeResponse).toBe(1500);
      expect(config.maxResponseLength).toBe(200);
      expect(config.requiresPermission).toBe(true);
      expect(config.softLanguage).toBe(true);
      expect(config.allowMultipleTopics).toBe(false);
      expect(config.showExitOption).toBe(true);
    });
  });

  describe("Moderate distress level", () => {
    test("provides balanced pacing for moderate distress", () => {
      const config = PacingController.getPacingConfig(
        "moderate",
        "listening",
        0,
      );

      expect(config.delayBeforeResponse).toBe(500);
      expect(config.maxResponseLength).toBe(400);
      expect(config.requiresPermission).toBe(false);
      expect(config.softLanguage).toBe(true);
      expect(config.allowMultipleTopics).toBe(false);
      expect(config.showExitOption).toBe(false);
      expect(config.toneGuidance).toContain("Balanced");
    });

    test("requires permission when reframing at moderate distress", () => {
      const config = PacingController.getPacingConfig(
        "moderate",
        "reframing",
        0,
      );

      expect(config.requiresPermission).toBe(true);
    });
  });

  describe("Low distress level", () => {
    test("allows normal pacing for low distress", () => {
      const config = PacingController.getPacingConfig("low", "listening", 0);

      expect(config.delayBeforeResponse).toBe(0);
      expect(config.maxResponseLength).toBe(600);
      expect(config.requiresPermission).toBe(false);
      expect(config.softLanguage).toBe(false);
      expect(config.allowMultipleTopics).toBe(true);
      expect(config.showExitOption).toBe(false);
      expect(config.toneGuidance).toContain("Normal");
    });

    test("requires permission when reframing at low distress", () => {
      const config = PacingController.getPacingConfig("low", "reframing", 0);

      expect(config.requiresPermission).toBe(true);
    });
  });

  describe("Unknown distress level handling", () => {
    test("defaults to low distress behavior for unknown levels", () => {
      const config = PacingController.getPacingConfig(
        "unknown" as DistressLevel,
        "listening",
        0,
      );

      expect(config.delayBeforeResponse).toBe(0);
      expect(config.maxResponseLength).toBe(600);
      expect(config.requiresPermission).toBe(false);
      expect(config.softLanguage).toBe(false);
      expect(config.allowMultipleTopics).toBe(true);
      expect(config.showExitOption).toBe(false);
    });
  });

  describe("Repetition detection", () => {
    test("slows pacing when repetition count is 2", () => {
      const config = PacingController.getPacingConfig("low", "listening", 2);

      expect(config.delayBeforeResponse).toBe(1000);
      expect(config.maxResponseLength).toBe(250);
      expect(config.requiresPermission).toBe(true);
      expect(config.softLanguage).toBe(true);
      expect(config.allowMultipleTopics).toBe(false);
      expect(config.showExitOption).toBe(true);
      expect(config.toneGuidance).toContain("Pattern interrupt");
    });

    test("slows pacing when repetition count is higher", () => {
      const config = PacingController.getPacingConfig("low", "listening", 5);

      expect(config.delayBeforeResponse).toBe(1000);
      expect(config.maxResponseLength).toBe(250);
      expect(config.showExitOption).toBe(true);
    });

    test("repetition protection overrides low distress settings", () => {
      const config = PacingController.getPacingConfig("low", "listening", 2);

      // Should use repetition protection, not low distress settings
      expect(config.maxResponseLength).toBe(250);
      expect(config.requiresPermission).toBe(true);
    });

    test("does not apply repetition protection for count of 1", () => {
      const config = PacingController.getPacingConfig("low", "listening", 1);

      // Should use normal low distress settings
      expect(config.delayBeforeResponse).toBe(0);
      expect(config.maxResponseLength).toBe(600);
      expect(config.showExitOption).toBe(false);
    });

    test("does not apply repetition protection for count of 0", () => {
      const config = PacingController.getPacingConfig("low", "listening", 0);

      expect(config.showExitOption).toBe(false);
      expect(config.maxResponseLength).toBe(600);
    });
  });

  describe("Edge cases", () => {
    test("handles undefined-like distress levels by defaulting to low", () => {
      const config = PacingController.getPacingConfig(
        "unknown" as DistressLevel,
        "listening",
        0,
      );

      // Should default to low distress behavior
      expect(config.delayBeforeResponse).toBe(0);
      expect(config.maxResponseLength).toBe(600);
    });

    test("handles all conversation states correctly", () => {
      const states: ConversationState[] = [
        "listening",
        "clarification",
        "reframing",
        "grounding",
      ];

      states.forEach((state) => {
        const config = PacingController.getPacingConfig("moderate", state, 0);
        expect(config).toBeDefined();
        expect(config.maxResponseLength).toBeGreaterThan(0);
      });
    });
  });

  describe("Protective pattern verification", () => {
    test("higher distress always means shorter responses", () => {
      const crisis = PacingController.getPacingConfig("crisis", "listening", 0);
      const high = PacingController.getPacingConfig("high", "listening", 0);
      const moderate = PacingController.getPacingConfig(
        "moderate",
        "listening",
        0,
      );
      const low = PacingController.getPacingConfig("low", "listening", 0);

      expect(crisis.maxResponseLength).toBeLessThanOrEqual(
        high.maxResponseLength,
      );
      expect(high.maxResponseLength).toBeLessThanOrEqual(
        moderate.maxResponseLength,
      );
      expect(moderate.maxResponseLength).toBeLessThanOrEqual(
        low.maxResponseLength,
      );
    });

    test("higher distress always means slower responses", () => {
      const crisis = PacingController.getPacingConfig("crisis", "listening", 0);
      const high = PacingController.getPacingConfig("high", "listening", 0);
      const moderate = PacingController.getPacingConfig(
        "moderate",
        "listening",
        0,
      );
      const low = PacingController.getPacingConfig("low", "listening", 0);

      expect(crisis.delayBeforeResponse).toBeGreaterThanOrEqual(
        high.delayBeforeResponse || 0,
      );
      expect(high.delayBeforeResponse).toBeGreaterThanOrEqual(
        moderate.delayBeforeResponse || 0,
      );
      expect(moderate.delayBeforeResponse).toBeGreaterThanOrEqual(
        low.delayBeforeResponse || 0,
      );
    });

    test("crisis always shows exit option", () => {
      const config = PacingController.getPacingConfig("crisis", "listening", 0);
      expect(config.showExitOption).toBe(true);
    });
  });
});

// =============================================================================
// SHOULD OFFER EXIT TESTS
// =============================================================================

describe("PacingController.shouldOfferExit", () => {
  describe("Duration-based exit", () => {
    test("offers exit after 20 minutes", () => {
      const metrics: SessionMetrics = {
        duration: 20,
        interactionCount: 5,
        distressLevel: "low",
        topicsExplored: 2,
        crisisDetected: false,
        repetitionCount: 0,
      };

      expect(PacingController.shouldOfferExit(metrics)).toBe(false);
    });

    test("offers exit after more than 20 minutes", () => {
      const metrics: SessionMetrics = {
        duration: 21,
        interactionCount: 5,
        distressLevel: "low",
        topicsExplored: 2,
        crisisDetected: false,
        repetitionCount: 0,
      };

      expect(PacingController.shouldOfferExit(metrics)).toBe(true);
    });

    test("offers exit after 25 minutes", () => {
      const metrics: SessionMetrics = {
        duration: 25,
        interactionCount: 3,
        distressLevel: "low",
        topicsExplored: 1,
        crisisDetected: false,
        repetitionCount: 0,
      };

      expect(PacingController.shouldOfferExit(metrics)).toBe(true);
    });
  });

  describe("Interaction count-based exit", () => {
    test("does not offer exit at 15 interactions", () => {
      const metrics: SessionMetrics = {
        duration: 10,
        interactionCount: 15,
        distressLevel: "low",
        topicsExplored: 3,
        crisisDetected: false,
        repetitionCount: 0,
      };

      expect(PacingController.shouldOfferExit(metrics)).toBe(false);
    });

    test("offers exit after more than 15 interactions", () => {
      const metrics: SessionMetrics = {
        duration: 10,
        interactionCount: 16,
        distressLevel: "low",
        topicsExplored: 3,
        crisisDetected: false,
        repetitionCount: 0,
      };

      expect(PacingController.shouldOfferExit(metrics)).toBe(true);
    });

    test("offers exit at 20 interactions", () => {
      const metrics: SessionMetrics = {
        duration: 15,
        interactionCount: 20,
        distressLevel: "moderate",
        topicsExplored: 4,
        crisisDetected: false,
        repetitionCount: 1,
      };

      expect(PacingController.shouldOfferExit(metrics)).toBe(true);
    });
  });

  describe("High distress persistence exit", () => {
    test("does not offer exit with high distress and 5 interactions", () => {
      const metrics: SessionMetrics = {
        duration: 5,
        interactionCount: 5,
        distressLevel: "high",
        topicsExplored: 1,
        crisisDetected: false,
        repetitionCount: 0,
      };

      expect(PacingController.shouldOfferExit(metrics)).toBe(false);
    });

    test("offers exit with high distress after more than 5 interactions", () => {
      const metrics: SessionMetrics = {
        duration: 5,
        interactionCount: 6,
        distressLevel: "high",
        topicsExplored: 1,
        crisisDetected: false,
        repetitionCount: 0,
      };

      expect(PacingController.shouldOfferExit(metrics)).toBe(true);
    });

    test("offers exit with high distress after 10 interactions", () => {
      const metrics: SessionMetrics = {
        duration: 8,
        interactionCount: 10,
        distressLevel: "high",
        topicsExplored: 2,
        crisisDetected: false,
        repetitionCount: 0,
      };

      expect(PacingController.shouldOfferExit(metrics)).toBe(true);
    });

    test("does not offer exit with moderate distress and 6 interactions", () => {
      const metrics: SessionMetrics = {
        duration: 5,
        interactionCount: 6,
        distressLevel: "moderate",
        topicsExplored: 1,
        crisisDetected: false,
        repetitionCount: 0,
      };

      expect(PacingController.shouldOfferExit(metrics)).toBe(false);
    });
  });

  describe("Crisis detection exit", () => {
    test("always offers exit when crisis detected", () => {
      const metrics: SessionMetrics = {
        duration: 2,
        interactionCount: 1,
        distressLevel: "low",
        topicsExplored: 1,
        crisisDetected: true,
        repetitionCount: 0,
      };

      expect(PacingController.shouldOfferExit(metrics)).toBe(true);
    });

    test("offers exit even with crisis and low activity", () => {
      const metrics: SessionMetrics = {
        duration: 1,
        interactionCount: 1,
        distressLevel: "low",
        topicsExplored: 0,
        crisisDetected: true,
        repetitionCount: 0,
      };

      expect(PacingController.shouldOfferExit(metrics)).toBe(true);
    });
  });

  describe("Repetition count exit", () => {
    test("does not offer exit with repetition count of 2", () => {
      const metrics: SessionMetrics = {
        duration: 5,
        interactionCount: 4,
        distressLevel: "low",
        topicsExplored: 1,
        crisisDetected: false,
        repetitionCount: 2,
      };

      expect(PacingController.shouldOfferExit(metrics)).toBe(false);
    });

    test("offers exit when repetition count is 3 or more", () => {
      const metrics: SessionMetrics = {
        duration: 5,
        interactionCount: 4,
        distressLevel: "low",
        topicsExplored: 1,
        crisisDetected: false,
        repetitionCount: 3,
      };

      expect(PacingController.shouldOfferExit(metrics)).toBe(true);
    });

    test("offers exit with high repetition count", () => {
      const metrics: SessionMetrics = {
        duration: 8,
        interactionCount: 7,
        distressLevel: "moderate",
        topicsExplored: 1,
        crisisDetected: false,
        repetitionCount: 5,
      };

      expect(PacingController.shouldOfferExit(metrics)).toBe(true);
    });
  });

  describe("Normal conditions (no exit)", () => {
    test("does not offer exit with normal short session", () => {
      const metrics: SessionMetrics = {
        duration: 5,
        interactionCount: 3,
        distressLevel: "low",
        topicsExplored: 1,
        crisisDetected: false,
        repetitionCount: 0,
      };

      expect(PacingController.shouldOfferExit(metrics)).toBe(false);
    });

    test("does not offer exit with moderate distress and normal activity", () => {
      const metrics: SessionMetrics = {
        duration: 10,
        interactionCount: 8,
        distressLevel: "moderate",
        topicsExplored: 2,
        crisisDetected: false,
        repetitionCount: 1,
      };

      expect(PacingController.shouldOfferExit(metrics)).toBe(false);
    });

    test("does not offer exit at boundary conditions", () => {
      const metrics: SessionMetrics = {
        duration: 20,
        interactionCount: 15,
        distressLevel: "low",
        topicsExplored: 3,
        crisisDetected: false,
        repetitionCount: 2,
      };

      expect(PacingController.shouldOfferExit(metrics)).toBe(false);
    });
  });

  describe("Multiple trigger combinations", () => {
    test("offers exit when both duration and interaction count exceeded", () => {
      const metrics: SessionMetrics = {
        duration: 25,
        interactionCount: 20,
        distressLevel: "low",
        topicsExplored: 5,
        crisisDetected: false,
        repetitionCount: 0,
      };

      expect(PacingController.shouldOfferExit(metrics)).toBe(true);
    });

    test("offers exit when crisis and high distress both present", () => {
      const metrics: SessionMetrics = {
        duration: 5,
        interactionCount: 3,
        distressLevel: "high",
        topicsExplored: 1,
        crisisDetected: true,
        repetitionCount: 0,
      };

      expect(PacingController.shouldOfferExit(metrics)).toBe(true);
    });
  });
});

// =============================================================================
// CLOSURE RITUAL TESTS
// =============================================================================

describe("PacingController.getClosureRitual", () => {
  describe("High distress closure", () => {
    test("provides minimal, warm closure for high distress", () => {
      const ritual = PacingController.getClosureRitual(
        "anxiety" as EmotionalState,
        false,
        "high",
      );

      expect(ritual.acknowledgment).toBeDefined();
      expect(ritual.acknowledgment.length).toBeGreaterThan(0);
      expect(ritual.validation).toBeDefined();
      expect(ritual.validation.length).toBeGreaterThan(0);
      expect(ritual.invitation).toBeDefined();
      expect(ritual.blessing).toBeDefined();
      expect(ritual.noGuilt).toBe(true);

      // High distress should be gentle
      expect(ritual.acknowledgment).toContain("difficult");
      expect(ritual.validation).toContain("courage");
    });

    test("provides minimal, warm closure for crisis level", () => {
      const ritual = PacingController.getClosureRitual(
        "anxiety" as EmotionalState,
        false,
        "crisis",
      );

      expect(ritual.noGuilt).toBe(true);
      expect(ritual.acknowledgment).toContain("difficult");
      expect(ritual.validation).toContain("courage");
      expect(ritual.invitation).toContain("ready");
      expect(ritual.blessing).toContain("ease");
    });

    test("always sets noGuilt to true for high distress", () => {
      const ritual = PacingController.getClosureRitual(
        "shame" as EmotionalState,
        true,
        "high",
      );

      expect(ritual.noGuilt).toBe(true);
    });
  });

  describe("Work completed closure", () => {
    test("honors effort when work was completed", () => {
      const ritual = PacingController.getClosureRitual(
        "anxiety" as EmotionalState,
        true,
        "low",
      );

      expect(ritual.acknowledgment).toContain("showed up");
      expect(ritual.validation).toContain("matters");
      expect(ritual.invitation).toContain("Return");
      expect(ritual.blessing).toContain("growth");
      expect(ritual.noGuilt).toBe(true);
    });

    test("validates effort in moderate distress with completion", () => {
      const ritual = PacingController.getClosureRitual(
        "anxiety" as EmotionalState,
        true,
        "moderate",
      );

      expect(ritual.acknowledgment).toContain("showed up");
      expect(ritual.validation).toContain("effort");
      expect(ritual.noGuilt).toBe(true);
    });
  });

  describe("Incomplete session closure", () => {
    test("provides gentle closure for incomplete work", () => {
      const ritual = PacingController.getClosureRitual(
        "anxiety" as EmotionalState,
        false,
        "moderate",
      );

      expect(ritual.acknowledgment).toContain("time");
      expect(ritual.validation).toContain("enough");
      expect(ritual.invitation).toContain("pick this up");
      expect(ritual.blessing).toContain("gentle");
      expect(ritual.noGuilt).toBe(true);
    });

    test("never adds guilt for incomplete work", () => {
      const ritual = PacingController.getClosureRitual(
        "anxiety" as EmotionalState,
        false,
        "low",
      );

      expect(ritual.noGuilt).toBe(true);
      expect(ritual.invitation).not.toContain("should");
      expect(ritual.invitation).not.toContain("must");
    });
  });

  describe("Closure ritual structure", () => {
    test("always includes all required fields", () => {
      const ritual = PacingController.getClosureRitual(
        "anxiety" as EmotionalState,
        true,
        "low",
      );

      expect(ritual).toHaveProperty("acknowledgment");
      expect(ritual).toHaveProperty("validation");
      expect(ritual).toHaveProperty("invitation");
      expect(ritual).toHaveProperty("blessing");
      expect(ritual).toHaveProperty("noGuilt");
    });

    test("all fields contain meaningful content", () => {
      const ritual = PacingController.getClosureRitual(
        "anxiety" as EmotionalState,
        false,
        "moderate",
      );

      expect(ritual.acknowledgment.length).toBeGreaterThan(10);
      expect(ritual.validation.length).toBeGreaterThan(10);
      expect(ritual.invitation.length).toBeGreaterThan(10);
      expect(ritual.blessing.length).toBeGreaterThan(5);
    });

    test("noGuilt is always true across all scenarios", () => {
      const scenarios: [boolean, DistressLevel][] = [
        [true, "crisis"],
        [false, "crisis"],
        [true, "high"],
        [false, "high"],
        [true, "moderate"],
        [false, "moderate"],
        [true, "low"],
        [false, "low"],
      ];

      scenarios.forEach(([workDone, distress]) => {
        const ritual = PacingController.getClosureRitual(
          "anxiety" as EmotionalState,
          workDone,
          distress,
        );

        expect(ritual.noGuilt).toBe(true);
      });
    });
  });

  describe("Language adaptation by distress level", () => {
    test("uses simpler language for high distress than low distress", () => {
      const highRitual = PacingController.getClosureRitual(
        "anxiety" as EmotionalState,
        false,
        "high",
      );

      const lowRitual = PacingController.getClosureRitual(
        "anxiety" as EmotionalState,
        true,
        "low",
      );

      // High distress should be simpler and more direct
      // Not necessarily shorter, but focused on immediate comfort
      expect(highRitual.acknowledgment).toBeDefined();
      expect(highRitual.validation).toBeDefined();
      expect(highRitual.acknowledgment.length).toBeGreaterThan(0);
      expect(highRitual.validation.length).toBeGreaterThan(0);

      // High distress messages should be concrete and present-focused
      expect(highRitual.acknowledgment).not.toContain("work");
      expect(highRitual.validation.length).toBeLessThanOrEqual(30);
    });

    test("matches tone to distress level", () => {
      const crisisRitual = PacingController.getClosureRitual(
        "anxiety" as EmotionalState,
        false,
        "crisis",
      );

      const lowRitual = PacingController.getClosureRitual(
        "anxiety" as EmotionalState,
        true,
        "low",
      );

      // Crisis should emphasize ease and simplicity
      expect(crisisRitual.blessing).toContain("ease");

      // Low distress can be more expansive
      expect(lowRitual.blessing).toContain("growth");
    });
  });

  describe("Edge cases", () => {
    test("handles all distress levels appropriately", () => {
      const levels: DistressLevel[] = ["crisis", "high", "moderate", "low"];

      levels.forEach((level) => {
        const ritual = PacingController.getClosureRitual(
          "anxiety" as EmotionalState,
          false,
          level,
        );

        expect(ritual).toBeDefined();
        expect(ritual.noGuilt).toBe(true);
        expect(ritual.acknowledgment.length).toBeGreaterThan(0);
        expect(ritual.validation.length).toBeGreaterThan(0);
        expect(ritual.invitation.length).toBeGreaterThan(0);
        expect(ritual.blessing.length).toBeGreaterThan(0);
      });
    });
  });
});
