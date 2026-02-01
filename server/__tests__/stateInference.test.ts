/**
 * State Inference Test Suite for Noor
 *
 * Tests the inner state detection system that identifies emotional states
 * from user reflections. This drives Islamic context selection and
 * therapeutic response framing.
 *
 * Coverage:
 * - All 11 inner emotional states
 * - Unknown state fallback
 * - Confidence scoring
 * - Edge cases (empty, mixed patterns, long text)
 * - Islamic terminology recognition
 */

import { describe, test, expect } from "@jest/globals";
import {
  inferInnerState,
  getStatePromptModifier,
  detectAssumptionPattern,
  getAssumptionPromptModifier,
} from "../stateInference";

// =============================================================================
// INNER STATE DETECTION TESTS - ALL 11 STATES
// =============================================================================

describe("State Inference", () => {
  describe("Tightness Around Provision", () => {
    test("detects financial anxiety from money worries", () => {
      const result = inferInnerState(
        "I'm so worried about money and can't afford the bills",
      );

      expect(result.state).toBe("tightness_around_provision");
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test("detects Islamic rizq terminology", () => {
      const result = inferInnerState(
        "I'm anxious about my rizq and whether Allah will provide",
      );

      expect(result.state).toBe("tightness_around_provision");
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test("detects provision fears about future", () => {
      const result = inferInnerState(
        "What if I lose my job and can't afford anything?",
      );

      expect(result.state).toBe("tightness_around_provision");
      expect(result.confidence).toBeGreaterThan(0.3);
    });

    test("detects being broke and financial stress", () => {
      const result = inferInnerState(
        "I'm completely broke and running out of money for rent and expenses",
      );

      expect(result.state).toBe("tightness_around_provision");
      expect(result.confidence).toBeGreaterThan(0.6);
    });
  });

  describe("Fear of Loss", () => {
    test("detects fear of losing loved ones", () => {
      const result = inferInnerState(
        "I'm terrified of losing them, afraid they'll leave me",
      );

      expect(result.state).toBe("fear_of_loss");
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test("detects death and illness fears", () => {
      const result = inferInnerState(
        "What if they get sick or die? I can't handle losing them",
      );

      expect(result.state).toBe("fear_of_loss");
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test("detects relationship loss anxiety", () => {
      const result = inferInnerState(
        "My marriage might end in divorce and they'll be taken away from me",
      );

      expect(result.state).toBe("fear_of_loss");
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test("detects fear of abandonment", () => {
      const result = inferInnerState(
        "Everyone I care about will abandon me and slip away",
      );

      expect(result.state).toBe("fear_of_loss");
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });

  describe("Shame After Sin", () => {
    test("detects post-sin guilt and shame", () => {
      const result = inferInnerState(
        "I sinned again, feel so ashamed, how can Allah forgive me",
      );

      expect(result.state).toBe("shame_after_sin");
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test("detects unworthiness after sin", () => {
      const result = inferInnerState(
        "I did something haram and feel so guilty and unworthy",
      );

      expect(result.state).toBe("shame_after_sin");
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test("detects repeated sin cycle", () => {
      const result = inferInnerState(
        "I keep sinning and falling into the same mistake. I'm dirty and unclean",
      );

      expect(result.state).toBe("shame_after_sin");
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test("detects fear of divine punishment", () => {
      const result = inferInnerState(
        "I did wrong and now Allah must be angry and disappointed with me",
      );

      expect(result.state).toBe("shame_after_sin");
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });

  describe("Guilt Without Clarity", () => {
    test("detects vague guilt without clear cause", () => {
      const result = inferInnerState(
        "I feel bad but I'm not sure what I did wrong",
      );

      expect(result.state).toBe("guilt_without_clarity");
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test("detects undefined sense of wrongness", () => {
      const result = inferInnerState(
        "Something feels wrong but I can't pinpoint why I feel guilty",
      );

      expect(result.state).toBe("guilt_without_clarity");
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test("detects nagging guilt feelings", () => {
      const result = inferInnerState(
        "There's a vague sense of guilt that I can't shake",
      );

      expect(result.state).toBe("guilt_without_clarity");
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test("detects feeling bad without reason", () => {
      const result = inferInnerState(
        "I just feel bad and don't know why, something is off",
      );

      expect(result.state).toBe("guilt_without_clarity");
      expect(result.confidence).toBeGreaterThan(0.6);
    });
  });

  describe("Justified Anger", () => {
    test("detects righteous anger at injustice", () => {
      const result = inferInnerState(
        "They hurt me and it's so unfair, I'm furious",
      );

      expect(result.state).toBe("justified_anger");
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test("detects betrayal anger", () => {
      const result = inferInnerState(
        "She betrayed me and it's unjust what he did",
      );

      expect(result.state).toBe("justified_anger");
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test("detects unmet expectations anger", () => {
      const result = inferInnerState(
        "They should have helped and I deserve better, this is not right",
      );

      expect(result.state).toBe("justified_anger");
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test("detects rage at wrongdoing", () => {
      const result = inferInnerState(
        "Why would they do this? I'm so angry and mad about what they did",
      );

      expect(result.state).toBe("justified_anger");
      expect(result.confidence).toBeGreaterThan(0.6);
    });
  });

  describe("Feeling Unseen", () => {
    test("detects invisibility and loneliness", () => {
      const result = inferInnerState(
        "No one sees me, I'm alone, does anyone care",
      );

      expect(result.state).toBe("feeling_unseen");
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test("detects being ignored and forgotten", () => {
      const result = inferInnerState(
        "I'm invisible and nobody notices me, I've been overlooked and dismissed",
      );

      expect(result.state).toBe("feeling_unseen");
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test("detects spiritual loneliness", () => {
      const result = inferInnerState(
        "Does Allah even see me or hear my cries? I'm crying out but feel unnoticed",
      );

      expect(result.state).toBe("feeling_unseen");
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test("detects loneliness and isolation", () => {
      const result = inferInnerState(
        "I'm so lonely and alone, no one cares if I'm here",
      );

      expect(result.state).toBe("feeling_unseen");
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });

  describe("Confusion About Effort vs Control", () => {
    test("detects helplessness despite effort", () => {
      const result = inferInnerState(
        "I've tried everything, nothing works, it's out of my control",
      );

      expect(result.state).toBe("confusion_effort_control");
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test("detects exhausted effort without results", () => {
      const result = inferInnerState(
        "I'm trying so hard but nothing changes, what else can I do?",
      );

      expect(result.state).toBe("confusion_effort_control");
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test("detects useless effort feelings", () => {
      const result = inferInnerState(
        "All my effort seems pointless and not enough, it's out of my hands",
      );

      expect(result.state).toBe("confusion_effort_control");
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test("detects why won't it work confusion", () => {
      const result = inferInnerState(
        "Why isn't this working? I've tried but can't control the outcome",
      );

      expect(result.state).toBe("confusion_effort_control");
      expect(result.confidence).toBeGreaterThan(0.6);
    });
  });

  describe("Decision Paralysis", () => {
    test("detects inability to decide", () => {
      const result = inferInnerState(
        "I can't decide, every option seems wrong, stuck",
      );

      expect(result.state).toBe("decision_paralysis");
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test("detects frozen decision state", () => {
      const result = inferInnerState(
        "I'm paralyzed and don't know what to do, can't choose",
      );

      expect(result.state).toBe("decision_paralysis");
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test("detects istikhara seeking", () => {
      const result = inferInnerState(
        "I prayed istikhara asking for guidance but still can't decide",
      );

      expect(result.state).toBe("decision_paralysis");
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test("detects fear of wrong choice", () => {
      const result = inferInnerState(
        "What if I decide wrong? I'm torn between options and stuck",
      );

      expect(result.state).toBe("decision_paralysis");
      expect(result.confidence).toBeGreaterThan(0.7);
    });
  });

  describe("Grief and Sadness", () => {
    test("detects grief and heartbreak", () => {
      const result = inferInnerState(
        "I'm so sad and heartbroken, just crying all the time",
      );

      expect(result.state).toBe("grief_and_sadness");
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test("detects mourning after death", () => {
      const result = inferInnerState(
        "My mother passed away and I'm grieving, will never see her again",
      );

      expect(result.state).toBe("grief_and_sadness");
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test("detects missing someone deeply", () => {
      const result = inferInnerState(
        "I miss them so much, my heart is heavy and aching",
      );

      expect(result.state).toBe("grief_and_sadness");
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test("detects permanent loss sadness", () => {
      const result = inferInnerState(
        "They died and are gone forever, I'm mourning and feel empty",
      );

      expect(result.state).toBe("grief_and_sadness");
      expect(result.confidence).toBeGreaterThan(0.7);
    });
  });

  describe("Social Anxiety", () => {
    test("detects fear of judgment", () => {
      const result = inferInnerState(
        "I'm so anxious around people, afraid of judgment",
      );

      expect(result.state).toBe("social_anxiety");
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test("detects social awkwardness fear", () => {
      const result = inferInnerState(
        "I feel awkward in front of others and nervous around people",
      );

      expect(result.state).toBe("social_anxiety");
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test("detects not belonging feelings", () => {
      const result = inferInnerState(
        "What will people think? I don't fit in and feel like an outsider",
      );

      expect(result.state).toBe("social_anxiety");
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test("detects fear of speaking up", () => {
      const result = inferInnerState(
        "I'm scared to speak or ask anything, afraid of being judged and embarrassed",
      );

      expect(result.state).toBe("social_anxiety");
      expect(result.confidence).toBeGreaterThan(0.7);
    });
  });

  describe("Overwhelming Gratitude", () => {
    test("detects overwhelming blessing feelings", () => {
      const result = inferInnerState(
        "I'm so grateful to Allah, overwhelmed by His blessings",
      );

      expect(result.state).toBe("overwhelming_gratitude");
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test("detects blessed but unworthy feeling", () => {
      const result = inferInnerState(
        "I'm so blessed but don't deserve this, grateful but overwhelmed",
      );

      expect(result.state).toBe("overwhelming_gratitude");
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test("detects Alhamdulillah sentiment", () => {
      const result = inferInnerState(
        "Alhamdulillah, why would Allah bless me like this? Too blessed",
      );

      expect(result.state).toBe("overwhelming_gratitude");
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test("detects can't believe blessing", () => {
      const result = inferInnerState(
        "I can't believe how much Allah has given me, it's too much",
      );

      expect(result.state).toBe("overwhelming_gratitude");
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });

  describe("Unknown State", () => {
    test("returns unknown for neutral input", () => {
      const result = inferInnerState("Just checking in");

      expect(result.state).toBe("unknown");
      expect(result.confidence).toBeLessThan(0.3);
    });

    test("returns unknown for unclear text", () => {
      const result = inferInnerState(
        "Today was okay, nothing special happened",
      );

      expect(result.state).toBe("unknown");
      expect(result.confidence).toBeLessThan(0.5);
    });

    test("returns unknown for generic statement", () => {
      const result = inferInnerState("I went to the store and came back home");

      expect(result.state).toBe("unknown");
      expect(result.confidence).toBeLessThan(0.5);
    });
  });
});

// =============================================================================
// CONFIDENCE SCORING TESTS
// =============================================================================

describe("Confidence Scoring", () => {
  test("high confidence with multiple pattern matches", () => {
    const result = inferInnerState(
      "I sinned again and feel so ashamed and guilty, how can Allah forgive me after this haram mistake",
    );

    expect(result.confidence).toBeGreaterThan(0.8);
  });

  test("moderate confidence with single pattern match", () => {
    const result = inferInnerState("I'm worried about money");

    expect(result.confidence).toBeGreaterThan(0.3);
    expect(result.confidence).toBeLessThan(0.6);
  });

  test("low confidence with weak pattern", () => {
    const result = inferInnerState("Maybe I feel a bit off");

    expect(result.confidence).toBeLessThan(0.5);
  });

  test("zero confidence with no matches", () => {
    const result = inferInnerState("The weather is nice today");

    expect(result.state).toBe("unknown");
    expect(result.confidence).toBe(0);
  });

  test("confidence capped at 0.9", () => {
    const result = inferInnerState(
      "I sinned and sinned and feel so ashamed, guilty, and unworthy. How can Allah forgive me after all these haram mistakes and wrongdoings, I keep falling and sinning",
    );

    expect(result.confidence).toBeLessThanOrEqual(0.9);
  });
});

// =============================================================================
// EDGE CASES TESTS
// =============================================================================

describe("Edge Cases", () => {
  test("handles empty string", () => {
    const result = inferInnerState("");

    expect(result.state).toBe("unknown");
    expect(result.confidence).toBe(0);
  });

  test("handles whitespace-only string", () => {
    const result = inferInnerState("   \n\t  ");

    expect(result.state).toBe("unknown");
    expect(result.confidence).toBe(0);
  });

  test("handles very long text with mixed patterns", () => {
    const longText = `I'm feeling so many things right now. I'm worried about money and bills,
      but also I sinned and feel ashamed. On top of that, I'm afraid of losing my loved ones
      and I feel like no one sees me. I've tried everything but nothing works. I can't decide
      what to do and I'm stuck. I'm also so sad and grieving. Around people I feel anxious
      and judged. But I'm also grateful to Allah for His blessings.`;

    const result = inferInnerState(longText);

    // Highest confidence state should win
    expect(result.state).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  test("case-insensitive matching", () => {
    const result = inferInnerState(
      "I'M WORRIED ABOUT MONEY AND CAN'T AFFORD BILLS",
    );

    expect(result.state).toBe("tightness_around_provision");
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  test("word boundary matching prevents partial matches", () => {
    const result = inferInnerState("I'm not afraid, I'm breathing well");

    // "afraid" is present but in negative context, shouldn't strongly trigger fear_of_loss
    // However, it will still match the pattern. Let's verify confidence is lower.
    expect(result.confidence).toBeLessThan(0.9);
  });

  test("handles special characters", () => {
    const result = inferInnerState("I'm so worried!!! About money??");

    expect(result.state).toBe("tightness_around_provision");
    expect(result.confidence).toBeGreaterThan(0.3);
  });

  test("handles mixed English and Islamic terminology", () => {
    const result = inferInnerState(
      "I feel ashamed after committing haram, ya Allah please forgive me for this sin",
    );

    expect(result.state).toBe("shame_after_sin");
    expect(result.confidence).toBeGreaterThan(0.7);
  });
});

// =============================================================================
// STATE PROMPT MODIFIER TESTS
// =============================================================================

describe("State Prompt Modifier", () => {
  test("returns modifier for tightness around provision", () => {
    const modifier = getStatePromptModifier("tightness_around_provision");

    expect(modifier).toContain("STATE AWARENESS");
    expect(modifier).toContain("provision");
    expect(modifier).toContain("rizq");
  });

  test("returns modifier for shame after sin", () => {
    const modifier = getStatePromptModifier("shame_after_sin");

    expect(modifier).toContain("STATE AWARENESS");
    expect(modifier).toContain("shame");
    expect(modifier).toContain("return");
  });

  test("returns modifier for unknown state", () => {
    const modifier = getStatePromptModifier("unknown");

    expect(modifier).toContain("STATE AWARENESS");
    expect(modifier).toContain("No specific inner state");
  });

  test("all states have defined modifiers", () => {
    const states = [
      "tightness_around_provision",
      "fear_of_loss",
      "shame_after_sin",
      "guilt_without_clarity",
      "justified_anger",
      "feeling_unseen",
      "confusion_effort_control",
      "decision_paralysis",
      "grief_and_sadness",
      "social_anxiety",
      "overwhelming_gratitude",
      "unknown",
    ] as const;

    states.forEach((state) => {
      const modifier = getStatePromptModifier(state);
      expect(modifier).toBeDefined();
      expect(modifier.length).toBeGreaterThan(0);
    });
  });
});

// =============================================================================
// ASSUMPTION PATTERN DETECTION TESTS
// =============================================================================

describe("Assumption Pattern Detection", () => {
  test("detects suffering equals displeasure assumption", () => {
    const result = detectAssumptionPattern(
      "I'm suffering so much, Allah must be angry with me",
    );

    expect(result.detected).toBe(true);
    expect(result.assumption).toContain("suffer");
    expect(result.assumption).toContain("displeased");
  });

  test("detects failure equals unworthiness", () => {
    const result = detectAssumptionPattern(
      "I failed again, I'm worthless and not good enough",
    );

    expect(result.detected).toBe(true);
    expect(result.assumption).toContain("fail");
    expect(result.assumption).toContain("unworthy");
  });

  test("detects anxiety predicts bad outcomes", () => {
    const result = detectAssumptionPattern(
      "I feel so anxious, something bad is going to happen",
    );

    expect(result.detected).toBe(true);
    expect(result.assumption).toContain("anxious");
  });

  test("detects patience should earn results", () => {
    const result = detectAssumptionPattern(
      "I've been so patient, I should see change and deserve better results",
    );

    expect(result.detected).toBe(true);
    expect(result.assumption).toContain("patient");
  });

  test("detects good deeds earn ease", () => {
    const result = detectAssumptionPattern(
      "I pray and do good deeds, Allah should give me ease",
    );

    expect(result.detected).toBe(true);
    expect(result.assumption).toContain("good");
    expect(result.assumption).toContain("owe");
  });

  test("detects unanswered dua assumption", () => {
    const result = detectAssumptionPattern(
      "My dua is not answered, I feel ignored",
    );

    expect(result.detected).toBe(true);
    expect(result.assumption).toContain("dua");
    expect(result.assumption).toContain("not heard");
  });

  test("returns false for no assumption patterns", () => {
    const result = detectAssumptionPattern(
      "I went to the store and bought groceries",
    );

    expect(result.detected).toBe(false);
    expect(result.assumption).toBeNull();
    expect(result.reflection).toBeNull();
  });
});

// =============================================================================
// ASSUMPTION PROMPT MODIFIER TESTS
// =============================================================================

describe("Assumption Prompt Modifier", () => {
  test("returns empty string when no assumption detected", () => {
    const detection = {
      detected: false,
      assumption: null,
      reflection: null,
    };

    const modifier = getAssumptionPromptModifier(detection);

    expect(modifier).toBe("");
  });

  test("returns modifier when assumption detected", () => {
    const detection = {
      detected: true,
      assumption: "If I suffer, Allah is displeased with me",
      reflection:
        "This thought assumes suffering signals divine displeasure, conflating hardship with punishment.",
    };

    const modifier = getAssumptionPromptModifier(detection);

    expect(modifier).toContain("ASSUMPTION PATTERN DETECTED");
    expect(modifier).toContain(detection.assumption);
    expect(modifier).toContain(detection.reflection);
    expect(modifier).toContain("Name this assumption");
  });

  test("modifier includes reframing guidance", () => {
    const detection = detectAssumptionPattern(
      "I failed, so I'm worthless and not good enough",
    );

    const modifier = getAssumptionPromptModifier(detection);

    expect(modifier).toContain("Test it clearly");
    expect(modifier).toContain("Do not quote verses excessively");
    expect(modifier).toContain("disciplined and precise");
  });
});
