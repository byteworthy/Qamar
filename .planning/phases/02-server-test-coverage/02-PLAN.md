---
phase: 02-server-test-coverage
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - server/__tests__/conversational-ai.test.ts
  - server/__tests__/tone-compliance-checker.test.ts
  - server/__tests__/pacing-controller.test.ts
  - server/__tests__/canonical-orchestrator.test.ts
autonomous: true

must_haves:
  truths:
    - "conversational-ai.ts has unit tests covering EmotionalIntelligence and PatternDetector"
    - "tone-compliance-checker.ts has tests for all tone validation rules"
    - "pacing-controller.ts has tests for intervention timing logic"
    - "canonical-orchestrator.ts has tests for prompt orchestration"
    - "All AI orchestration modules have >75% test coverage"
  artifacts:
    - path: "server/__tests__/conversational-ai.test.ts"
      provides: "Unit tests for conversational AI components"
      contains: "describe.*EmotionalIntelligence"
    - path: "server/__tests__/tone-compliance-checker.test.ts"
      provides: "Tests for tone validation"
      contains: "checkToneCompliance"
    - path: "server/__tests__/pacing-controller.test.ts"
      provides: "Tests for pacing intervention logic"
      contains: "shouldIntervene"
    - path: "server/__tests__/canonical-orchestrator.test.ts"
      provides: "Tests for prompt orchestration"
      contains: "orchestratePrompt"
  key_links:
    - from: "test suites"
      to: "AI orchestration modules"
      via: "unit tests validate behavior"
      pattern: "jest\\.mock"
    - from: "mock Anthropic SDK"
      to: "test AI calls"
      via: "controlled test responses"
      pattern: "@anthropic-ai/sdk"
---

<objective>
Add comprehensive unit tests for AI orchestration modules: conversational-ai.ts, tone-compliance-checker.ts, pacing-controller.ts, and canonical-orchestrator.ts.

Purpose: Ensure AI orchestration logic is tested in isolation with controlled inputs, covering decision-making logic, validation rules, and prompt construction.

Output: Four new test files covering TEST-02 through TEST-05 requirements, with >75% coverage for each module and proper mocking of external dependencies.
</objective>

<context>
@.planning/ROADMAP.md
@server/conversational-ai.ts
@server/tone-compliance-checker.ts
@server/pacing-controller.ts
@server/canonical-orchestrator.ts
@server/__tests__/safety-system.test.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create tests for conversational-ai.ts</name>
  <files>server/__tests__/conversational-ai.test.ts</files>
  <action>
Create `server/__tests__/conversational-ai.test.ts`:

```typescript
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import {
  EmotionalIntelligence,
  buildConversationalPromptModifier,
  PatternDetector,
} from "../conversational-ai";

describe("conversational-ai.ts", () => {
  describe("EmotionalIntelligence", () => {
    let ei: EmotionalIntelligence;

    beforeEach(() => {
      ei = new EmotionalIntelligence();
    });

    describe("analyzeEmotionalContext", () => {
      it("should detect high intensity anxious state", () => {
        const result = ei.analyzeEmotionalContext(
          "I'm completely overwhelmed and panicking about everything",
          { previousState: null, sessionCount: 1 }
        );

        expect(result.emotionalState).toBe("anxious");
        expect(result.intensity).toBeGreaterThanOrEqual(0.7);
        expect(result.needsIntervention).toBe(true);
      });

      it("should detect calm state", () => {
        const result = ei.analyzeEmotionalContext(
          "I'm feeling peaceful and centered today",
          { previousState: null, sessionCount: 5 }
        );

        expect(result.emotionalState).toBe("calm");
        expect(result.intensity).toBeLessThan(0.5);
        expect(result.needsIntervention).toBe(false);
      });

      it("should track emotional progression", () => {
        const first = ei.analyzeEmotionalContext(
          "I'm very anxious",
          { previousState: null, sessionCount: 1 }
        );

        const second = ei.analyzeEmotionalContext(
          "I'm feeling a bit better",
          { previousState: first.emotionalState, sessionCount: 2 }
        );

        expect(second.progression).toBe("improving");
      });

      it("should detect deteriorating emotional state", () => {
        const result = ei.analyzeEmotionalContext(
          "Things are getting worse and worse",
          { previousState: "concerned", sessionCount: 3 }
        );

        expect(result.progression).toBe("deteriorating");
      });
    });

    describe("suggestInterventionType", () => {
      it("should suggest grounding for high anxiety", () => {
        const intervention = ei.suggestInterventionType({
          emotionalState: "anxious",
          intensity: 0.9,
          context: "panic attack",
        });

        expect(intervention.type).toBe("grounding");
        expect(intervention.urgency).toBe("high");
      });

      it("should suggest reflection for mild concern", () => {
        const intervention = ei.suggestInterventionType({
          emotionalState: "concerned",
          intensity: 0.4,
          context: "worried about future",
        });

        expect(intervention.type).toBe("reflection");
        expect(intervention.urgency).toBe("low");
      });

      it("should include Islamic resources", () => {
        const intervention = ei.suggestInterventionType({
          emotionalState: "anxious",
          intensity: 0.8,
        });

        expect(intervention.islamicResources).toBeDefined();
        expect(intervention.islamicResources?.quranRef).toBeDefined();
      });
    });
  });

  describe("PatternDetector", () => {
    let detector: PatternDetector;

    beforeEach(() => {
      detector = new PatternDetector();
    });

    describe("detectRecurringPatterns", () => {
      it("should detect recurring catastrophizing", () => {
        const sessions = [
          { distortions: ["catastrophizing"], thought: "Everything will go wrong" },
          { distortions: ["catastrophizing"], thought: "This will be a disaster" },
          { distortions: ["catastrophizing"], thought: "It's all going to fall apart" },
        ];

        const patterns = detector.detectRecurringPatterns(sessions);

        expect(patterns).toContainEqual(
          expect.objectContaining({
            type: "catastrophizing",
            frequency: 3,
          })
        );
      });

      it("should detect patterns only after threshold", () => {
        const sessions = [
          { distortions: ["mind-reading"], thought: "They think I'm stupid" },
          { distortions: ["all-or-nothing"], thought: "I'm a complete failure" },
        ];

        const patterns = detector.detectRecurringPatterns(sessions);

        expect(patterns.length).toBe(0);
      });

      it("should rank patterns by frequency and recency", () => {
        const sessions = Array(5).fill(null).map((_, i) => ({
          distortions: i < 3 ? ["catastrophizing"] : ["personalization"],
          thought: "test",
          timestamp: Date.now() - (4 - i) * 86400000, // Spread over 5 days
        }));

        const patterns = detector.detectRecurringPatterns(sessions);

        expect(patterns[0].type).toBe("catastrophizing");
        expect(patterns[0].recency).toBe("recent");
      });
    });

    describe("suggestTargetedIntervention", () => {
      it("should suggest evidence-seeking for mind-reading", () => {
        const suggestion = detector.suggestTargetedIntervention({
          type: "mind-reading",
          frequency: 5,
        });

        expect(suggestion).toContain("evidence");
        expect(suggestion).toContain("assumption");
      });

      it("should suggest nuance for all-or-nothing thinking", () => {
        const suggestion = detector.suggestTargetedIntervention({
          type: "all-or-nothing",
          frequency: 4,
        });

        expect(suggestion).toContain("spectrum");
        expect(suggestion).toContain("gray");
      });
    });
  });

  describe("buildConversationalPromptModifier", () => {
    it("should build warm, empathetic tone modifier", () => {
      const modifier = buildConversationalPromptModifier({
        emotionalState: "anxious",
        sessionCount: 1,
        previousInteractions: [],
      });

      expect(modifier).toContain("warm");
      expect(modifier).toContain("empathetic");
      expect(modifier.length).toBeGreaterThan(50);
    });

    it("should reference previous interactions", () => {
      const modifier = buildConversationalPromptModifier({
        emotionalState: "concerned",
        sessionCount: 5,
        previousInteractions: [
          { summary: "Worked on catastrophizing", outcome: "positive" },
        ],
      });

      expect(modifier).toContain("previously");
      expect(modifier).toContain("catastrophizing");
    });

    it("should adapt to high session count", () => {
      const modifier = buildConversationalPromptModifier({
        emotionalState: "calm",
        sessionCount: 20,
        previousInteractions: [],
      });

      expect(modifier).toContain("progress");
      expect(modifier).toContain("journey");
    });
  });
});
```
  </action>
  <verify>
- Test file created with comprehensive coverage
- Tests pass: `npm test conversational-ai.test.ts`
- TypeScript compilation passes
  </verify>
  <done>conversational-ai.ts fully tested with EmotionalIntelligence and PatternDetector coverage</done>
</task>

<task type="auto">
  <name>Task 2: Create tests for tone-compliance-checker.ts</name>
  <files>server/__tests__/tone-compliance-checker.test.ts</files>
  <action>
Create `server/__tests__/tone-compliance-checker.test.ts`:

```typescript
import { describe, it, expect } from "@jest/globals";
import {
  checkToneCompliance,
  validateResponseTone,
  ToneViolation,
} from "../tone-compliance-checker";

describe("tone-compliance-checker.ts", () => {
  describe("checkToneCompliance", () => {
    it("should pass compliant warm and supportive text", () => {
      const text = "I understand this feels overwhelming. Let's explore this together with compassion.";

      const result = checkToneCompliance(text);

      expect(result.compliant).toBe(true);
      expect(result.violations).toHaveLength(0);
      expect(result.score).toBeGreaterThan(0.8);
    });

    it("should detect clinical/diagnostic tone violations", () => {
      const text = "You are exhibiting symptoms of anxiety disorder and require clinical intervention.";

      const result = checkToneCompliance(text);

      expect(result.compliant).toBe(false);
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          type: "clinical",
          severity: "high",
        })
      );
    });

    it("should detect judgmental language", () => {
      const text = "You shouldn't feel that way. That's wrong thinking.";

      const result = checkToneCompliance(text);

      expect(result.compliant).toBe(false);
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          type: "judgmental",
        })
      );
    });

    it("should detect dismissive language", () => {
      const text = "Just get over it. Everyone goes through this.";

      const result = checkToneCompliance(text);

      expect(result.compliant).toBe(false);
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          type: "dismissive",
        })
      );
    });

    it("should detect overly clinical terminology", () => {
      const text = "Your cognitive distortions indicate maladaptive schemas.";

      const result = checkToneCompliance(text);

      expect(result.compliant).toBe(false);
      expect(result.violations.some(v => v.type === "clinical")).toBe(true);
    });

    it("should handle mixed tone (some good, some violations)", () => {
      const text = "I hear you, this is difficult. However, you are catastrophizing and need to stop.";

      const result = checkToneCompliance(text);

      expect(result.compliant).toBe(false);
      expect(result.score).toBeGreaterThan(0.3);
      expect(result.score).toBeLessThan(0.7);
    });

    it("should detect lack of empathy", () => {
      const text = "Here are the facts. This is what you need to do.";

      const result = checkToneCompliance(text);

      expect(result.compliant).toBe(false);
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          type: "cold",
        })
      );
    });
  });

  describe("validateResponseTone", () => {
    it("should validate entire AI response structure", () => {
      const response = {
        reframe: "Let's explore this thought with curiosity and compassion.",
        intention: "Take a moment to breathe and reflect.",
        islamicPerspective: {
          verse: "Indeed, with hardship comes ease (94:5-6)",
          context: "Trust in Allah's wisdom and timing.",
        },
      };

      const result = validateResponseTone(response);

      expect(result.overallCompliance).toBe(true);
      expect(result.componentResults.reframe.compliant).toBe(true);
      expect(result.componentResults.intention.compliant).toBe(true);
    });

    it("should detect violations across response components", () => {
      const response = {
        reframe: "You're catastrophizing and need to stop this irrational thinking.",
        intention: "Just don't think about it.",
      };

      const result = validateResponseTone(response);

      expect(result.overallCompliance).toBe(false);
      expect(result.componentResults.reframe.compliant).toBe(false);
      expect(result.componentResults.intention.compliant).toBe(false);
    });

    it("should provide aggregated violation summary", () => {
      const response = {
        reframe: "This is clearly wrong. You exhibit anxiety symptoms.",
        intention: "Stop worrying immediately.",
      };

      const result = validateResponseTone(response);

      expect(result.violationSummary.length).toBeGreaterThan(0);
      expect(result.violationSummary).toContain("clinical");
      expect(result.violationSummary).toContain("judgmental");
    });
  });

  describe("ToneViolation severity levels", () => {
    it("should assign high severity to harmful language", () => {
      const text = "You are mentally ill and need professional help immediately.";

      const result = checkToneCompliance(text);
      const highSeverity = result.violations.filter(v => v.severity === "high");

      expect(highSeverity.length).toBeGreaterThan(0);
    });

    it("should assign medium severity to clinical jargon", () => {
      const text = "Your maladaptive coping mechanisms require cognitive restructuring.";

      const result = checkToneCompliance(text);
      const mediumSeverity = result.violations.filter(v => v.severity === "medium");

      expect(mediumSeverity.length).toBeGreaterThan(0);
    });

    it("should assign low severity to minor tone issues", () => {
      const text = "Let's think about this logically and rationally.";

      const result = checkToneCompliance(text);

      if (result.violations.length > 0) {
        expect(result.violations.every(v => v.severity === "low")).toBe(true);
      }
    });
  });
});
```
  </action>
  <verify>
- Tests cover all tone violation types
- Tests verify severity assignment
- Tests validate full response structure
- All tests pass: `npm test tone-compliance-checker.test.ts`
  </verify>
  <done>tone-compliance-checker.ts fully tested for all validation rules</done>
</task>

<task type="auto">
  <name>Task 3: Create tests for pacing-controller.ts</name>
  <files>server/__tests__/pacing-controller.test.ts</files>
  <action>
Create `server/__tests__/pacing-controller.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "@jest/globals";
import {
  PacingController,
  shouldIntervene,
  calculateInterventionTiming,
} from "../pacing-controller";

describe("pacing-controller.ts", () => {
  describe("PacingController", () => {
    let controller: PacingController;

    beforeEach(() => {
      controller = new PacingController();
    });

    describe("shouldIntervene", () => {
      it("should intervene after 3 rapid sessions", () => {
        const sessions = [
          { timestamp: Date.now() - 60000 }, // 1 min ago
          { timestamp: Date.now() - 120000 }, // 2 min ago
          { timestamp: Date.now() - 180000 }, // 3 min ago
        ];

        const result = shouldIntervene(sessions);

        expect(result.shouldIntervene).toBe(true);
        expect(result.reason).toContain("rapid");
      });

      it("should not intervene for well-spaced sessions", () => {
        const sessions = [
          { timestamp: Date.now() - 86400000 }, // 1 day ago
          { timestamp: Date.now() - 172800000 }, // 2 days ago
        ];

        const result = shouldIntervene(sessions);

        expect(result.shouldIntervene).toBe(false);
      });

      it("should intervene for very long session duration", () => {
        const sessionStart = Date.now() - 3600000; // 1 hour ago

        const result = controller.checkSessionDuration(sessionStart);

        expect(result.shouldIntervene).toBe(true);
        expect(result.reason).toContain("duration");
      });

      it("should intervene for emotional intensity escalation", () => {
        const sessions = [
          { emotionalIntensity: 0.3, timestamp: Date.now() - 300000 },
          { emotionalIntensity: 0.5, timestamp: Date.now() - 180000 },
          { emotionalIntensity: 0.8, timestamp: Date.now() - 60000 },
        ];

        const result = controller.checkEmotionalEscalation(sessions);

        expect(result.shouldIntervene).toBe(true);
        expect(result.reason).toContain("escalation");
      });
    });

    describe("calculateInterventionTiming", () => {
      it("should suggest immediate intervention for high intensity", () => {
        const timing = calculateInterventionTiming({
          emotionalIntensity: 0.9,
          sessionCount: 5,
          lastIntervention: Date.now() - 1800000, // 30 min ago
        });

        expect(timing.when).toBe("immediate");
        expect(timing.type).toBe("grounding");
      });

      it("should suggest deferred intervention for low intensity", () => {
        const timing = calculateInterventionTiming({
          emotionalIntensity: 0.3,
          sessionCount: 2,
          lastIntervention: Date.now() - 300000, // 5 min ago
        });

        expect(timing.when).toBe("deferred");
        expect(timing.delayMinutes).toBeGreaterThan(5);
      });

      it("should respect cooldown period", () => {
        const timing = calculateInterventionTiming({
          emotionalIntensity: 0.6,
          sessionCount: 3,
          lastIntervention: Date.now() - 60000, // 1 min ago (very recent)
        });

        expect(timing.when).toBe("deferred");
        expect(timing.reason).toContain("cooldown");
      });
    });

    describe("suggestBreak", () => {
      it("should suggest break after prolonged session", () => {
        const breakSuggestion = controller.suggestBreak({
          sessionDuration: 45, // 45 minutes
          emotionalIntensity: 0.7,
        });

        expect(breakSuggestion.suggested).toBe(true);
        expect(breakSuggestion.message).toContain("break");
        expect(breakSuggestion.durationMinutes).toBeGreaterThan(5);
      });

      it("should not suggest break for short sessions", () => {
        const breakSuggestion = controller.suggestBreak({
          sessionDuration: 5,
          emotionalIntensity: 0.4,
        });

        expect(breakSuggestion.suggested).toBe(false);
      });

      it("should prioritize break for high emotional intensity", () => {
        const breakSuggestion = controller.suggestBreak({
          sessionDuration: 20,
          emotionalIntensity: 0.95,
        });

        expect(breakSuggestion.suggested).toBe(true);
        expect(breakSuggestion.urgency).toBe("high");
      });
    });
  });

  describe("Integration scenarios", () => {
    it("should handle healthy pacing pattern", () => {
      const controller = new PacingController();
      const sessions = [
        { timestamp: Date.now() - 86400000, duration: 15, intensity: 0.5 },
        { timestamp: Date.now() - 172800000, duration: 20, intensity: 0.4 },
      ];

      const pacing = controller.evaluatePacing(sessions);

      expect(pacing.healthy).toBe(true);
      expect(pacing.interventionNeeded).toBe(false);
    });

    it("should detect unhealthy rumination pattern", () => {
      const controller = new PacingController();
      const sessions = Array(10).fill(null).map((_, i) => ({
        timestamp: Date.now() - i * 300000, // Every 5 minutes
        duration: 30,
        intensity: 0.7,
      }));

      const pacing = controller.evaluatePacing(sessions);

      expect(pacing.healthy).toBe(false);
      expect(pacing.interventionNeeded).toBe(true);
      expect(pacing.pattern).toContain("rumination");
    });
  });
});
```
  </action>
  <verify>
- Tests cover intervention timing logic
- Tests verify emotional escalation detection
- Tests validate break suggestion logic
- All tests pass: `npm test pacing-controller.test.ts`
  </verify>
  <done>pacing-controller.ts fully tested for intervention timing and pacing logic</done>
</task>

<task type="auto">
  <name>Task 4: Create tests for canonical-orchestrator.ts</name>
  <files>server/__tests__/canonical-orchestrator.test.ts</files>
  <action>
Create `server/__tests__/canonical-orchestrator.test.ts`:

```typescript
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { CanonicalOrchestrator } from "../canonical-orchestrator";

// Mock Anthropic SDK
jest.mock("@anthropic-ai/sdk");

describe("canonical-orchestrator.ts", () => {
  let orchestrator: CanonicalOrchestrator;

  beforeEach(() => {
    orchestrator = new CanonicalOrchestrator();
  });

  describe("orchestratePrompt", () => {
    it("should build complete prompt with all modifiers", async () => {
      const prompt = orchestrator.orchestratePrompt({
        userInput: "I always fail at everything",
        emotionalState: "anxious",
        distortions: ["all-or-nothing", "catastrophizing"],
        toneGuidance: "warm and empathetic",
        islamicContext: true,
      });

      expect(prompt).toContain("I always fail at everything");
      expect(prompt).toContain("anxious");
      expect(prompt).toContain("all-or-nothing");
      expect(prompt).toContain("warm and empathetic");
      expect(prompt).toContain("Islamic");
    });

    it("should include safety constraints", async () => {
      const prompt = orchestrator.orchestratePrompt({
        userInput: "I'm in crisis",
        emotionalState: "distressed",
      });

      expect(prompt).toContain("crisis");
      expect(prompt).toContain("safety");
      expect(prompt).toContain("not a therapist");
    });

    it("should adapt prompt based on session history", async () => {
      const prompt = orchestrator.orchestratePrompt({
        userInput: "Still struggling with the same thing",
        emotionalState: "frustrated",
        sessionHistory: [
          { distortion: "catastrophizing", resolved: false },
          { distortion: "catastrophizing", resolved: false },
        ],
      });

      expect(prompt).toContain("pattern");
      expect(prompt).toContain("recurring");
    });
  });

  describe("buildSystemPrompt", () => {
    it("should create comprehensive system prompt", () => {
      const systemPrompt = orchestrator.buildSystemPrompt({
        role: "reframe",
        constraints: ["no diagnosis", "warm tone", "Islamic perspective"],
      });

      expect(systemPrompt).toContain("reframe");
      expect(systemPrompt).toContain("no diagnosis");
      expect(systemPrompt).toContain("warm tone");
      expect(systemPrompt).toContain("Islamic perspective");
    });

    it("should include HIPAA compliance guidance", () => {
      const systemPrompt = orchestrator.buildSystemPrompt({
        role: "analyze",
      });

      expect(systemPrompt).toContain("HIPAA");
      expect(systemPrompt).toContain("confidential");
    });
  });

  describe("addContextualModifiers", () => {
    it("should add tone modifier for anxious state", () => {
      const modifiers = orchestrator.addContextualModifiers({
        emotionalState: "anxious",
        intensity: 0.8,
      });

      expect(modifiers).toContain("gentle");
      expect(modifiers).toContain("grounding");
    });

    it("should add pacing modifier for rapid sessions", () => {
      const modifiers = orchestrator.addContextualModifiers({
        sessionFrequency: "rapid",
        lastSessionMinutesAgo: 5,
      });

      expect(modifiers).toContain("break");
      expect(modifiers).toContain("space");
    });

    it("should add pattern-specific guidance", () => {
      const modifiers = orchestrator.addContextualModifiers({
        recurringPattern: "catastrophizing",
        patternFrequency: 5,
      });

      expect(modifiers).toContain("catastrophizing");
      expect(modifiers).toContain("evidence");
    });
  });

  describe("validatePromptOutput", () => {
    it("should validate compliant output", () => {
      const output = {
        reframe: "Let's explore this with compassion and curiosity",
        intention: "Take a moment to breathe",
      };

      const validation = orchestrator.validatePromptOutput(output);

      expect(validation.valid).toBe(true);
      expect(validation.violations).toHaveLength(0);
    });

    it("should reject output with clinical language", () => {
      const output = {
        reframe: "Your anxiety disorder requires clinical intervention",
      };

      const validation = orchestrator.validatePromptOutput(output);

      expect(validation.valid).toBe(false);
      expect(validation.violations).toContainEqual(
        expect.objectContaining({ type: "clinical" })
      );
    });

    it("should reject output missing required fields", () => {
      const output = {
        // Missing reframe
        intention: "Take a breath",
      };

      const validation = orchestrator.validatePromptOutput(output);

      expect(validation.valid).toBe(false);
      expect(validation.violations).toContainEqual(
        expect.objectContaining({ type: "missing_field" })
      );
    });
  });

  describe("Error handling", () => {
    it("should handle API rate limits gracefully", async () => {
      // Mock rate limit error
      const mockError = new Error("Rate limit exceeded");
      mockError.status = 429;

      jest.spyOn(orchestrator, "callAPI").mockRejectedValue(mockError);

      await expect(
        orchestrator.executePrompt({ userInput: "test" })
      ).rejects.toThrow("Rate limit");
    });

    it("should handle invalid API responses", async () => {
      jest.spyOn(orchestrator, "callAPI").mockResolvedValue({
        invalid: "response structure",
      });

      await expect(
        orchestrator.executePrompt({ userInput: "test" })
      ).rejects.toThrow("Invalid response");
    });
  });
});
```
  </action>
  <verify>
- Tests cover prompt orchestration logic
- Tests verify system prompt construction
- Tests validate contextual modifiers
- Tests check output validation
- All tests pass: `npm test canonical-orchestrator.test.ts`
  </verify>
  <done>canonical-orchestrator.ts fully tested for prompt orchestration</done>
</task>

<task type="auto">
  <name>Task 5: Run all AI orchestration tests and verify coverage</name>
  <files>server/__tests__/*.test.ts</files>
  <action>
1. Run all new test files:
   ```bash
   npm test conversational-ai.test.ts
   npm test tone-compliance-checker.test.ts
   npm test pacing-controller.test.ts
   npm test canonical-orchestrator.test.ts
   ```

2. Generate coverage report for AI orchestration modules:
   ```bash
   npm test -- --coverage --collectCoverageFrom="server/{conversational-ai,tone-compliance-checker,pacing-controller,canonical-orchestrator}.ts"
   ```

3. Verify coverage targets:
   - Each module: >75% line coverage
   - Each module: >70% branch coverage

4. Run full test suite to ensure no regressions:
   ```bash
   npm test
   ```

5. Verify TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```
  </action>
  <verify>
- All new test files pass
- Coverage >75% for each AI orchestration module
- Full test suite passes (79 existing + ~80 new = ~160 tests)
- No TypeScript errors
  </verify>
  <done>AI orchestration modules fully tested with >75% coverage each</done>
</task>

</tasks>

<verification>
1. Confirm 4 new test files created in server/__tests__/
2. Run `npm test` - all tests pass (~160 total)
3. Check coverage report - verify >75% for conversational-ai, tone-compliance-checker, pacing-controller, canonical-orchestrator
4. Verify tests cover: emotional intelligence, pattern detection, tone validation, pacing logic, prompt orchestration
5. No TypeScript compilation errors
</verification>

<success_criteria>
1. conversational-ai.test.ts created with EmotionalIntelligence and PatternDetector tests
2. tone-compliance-checker.test.ts created with comprehensive tone validation tests
3. pacing-controller.test.ts created with intervention timing tests
4. canonical-orchestrator.test.ts created with prompt orchestration tests
5. Each module achieves >75% test coverage
6. All tests pass alongside existing test suite (79 → ~160 tests)
7. Tests cover happy paths, edge cases, and error handling
8. External dependencies properly mocked (Anthropic SDK)
9. TypeScript compilation passes
10. Code committed with clear commit message referencing TEST-02, TEST-03, TEST-04, TEST-05
</success_criteria>

<output>
After completion, create `.planning/phases/02-server-test-coverage/02-SUMMARY.md`
</output>
