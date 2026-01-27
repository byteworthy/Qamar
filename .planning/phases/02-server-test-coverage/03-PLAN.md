---
phase: 02-server-test-coverage
plan: 03
type: execute
wave: 1
depends_on: []
files_modified:
  - server/__tests__/toneClassifier.test.ts
  - server/__tests__/stateInference.test.ts
autonomous: true

must_haves:
  truths:
    - "toneClassifier.ts has unit tests covering all classification methods"
    - "stateInference.ts has tests for state inference logic"
    - "Both modules have >75% test coverage"
    - "Tests verify AI integration points without requiring live API calls"
  artifacts:
    - path: "server/__tests__/toneClassifier.test.ts"
      provides: "Unit tests for tone classification"
      contains: "classifyTone"
    - path: "server/__tests__/stateInference.test.ts"
      provides: "Tests for state inference logic"
      contains: "inferState"
  key_links:
    - from: "test suites"
      to: "classification modules"
      via: "mocked AI responses"
      pattern: "jest\\.mock"
---

<objective>
Add comprehensive unit tests for toneClassifier.ts and stateInference.ts to achieve >75% coverage.

Purpose: Test tone classification and state inference logic with controlled inputs, ensuring accurate detection of emotional states and tone violations.

Output: Two new test files covering TEST-06 and TEST-07 requirements with proper mocking of external dependencies.
</objective>

<context>
@.planning/ROADMAP.md
@server/toneClassifier.ts
@server/stateInference.ts
@server/__tests__/safety-system.test.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create tests for toneClassifier.ts</name>
  <files>server/__tests__/toneClassifier.test.ts</files>
  <action>
Create `server/__tests__/toneClassifier.test.ts`:

```typescript
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import {
  ToneClassifier,
  classifyTone,
  detectToneViolations,
  analyzeToneCompliance,
} from "../toneClassifier";

// Mock Anthropic SDK
jest.mock("@anthropic-ai/sdk");

describe("toneClassifier.ts", () => {
  describe("ToneClassifier", () => {
    let classifier: ToneClassifier;

    beforeEach(() => {
      classifier = new ToneClassifier();
    });

    describe("classifyTone", () => {
      it("should classify warm and empathetic tone", async () => {
        const text = "I hear your pain and I'm here with you through this difficult time.";

        const result = await classifyTone(text);

        expect(result.tone).toBe("warm");
        expect(result.empathy).toBeGreaterThan(0.7);
        expect(result.clinical).toBeLessThan(0.3);
      });

      it("should detect clinical/diagnostic tone", async () => {
        const text = "You exhibit symptoms of anxiety disorder requiring clinical intervention.";

        const result = await classifyTone(text);

        expect(result.tone).toBe("clinical");
        expect(result.clinical).toBeGreaterThan(0.7);
        expect(result.empathy).toBeLessThan(0.3);
      });

      it("should detect judgmental tone", async () => {
        const text = "You shouldn't feel that way. That's wrong thinking.";

        const result = await classifyTone(text);

        expect(result.tone).toBe("judgmental");
        expect(result.judgment).toBeGreaterThan(0.6);
      });

      it("should detect dismissive tone", async () => {
        const text = "Just get over it. Everyone deals with this.";

        const result = await classifyTone(text);

        expect(result.tone).toBe("dismissive");
        expect(result.dismissiveness).toBeGreaterThan(0.6);
      });

      it("should detect supportive and validating tone", async () => {
        const text = "Your feelings are valid. It makes sense that you feel this way.";

        const result = await classifyTone(text);

        expect(result.tone).toBe("supportive");
        expect(result.validation).toBeGreaterThan(0.7);
      });
    });

    describe("detectToneViolations", () => {
      it("should detect no violations in compliant text", () => {
        const text = "Let's explore this thought together with curiosity and compassion.";

        const violations = detectToneViolations(text);

        expect(violations).toHaveLength(0);
      });

      it("should detect diagnostic language violations", () => {
        const text = "You have depression and need medication.";

        const violations = detectToneViolations(text);

        expect(violations).toContainEqual(
          expect.objectContaining({
            type: "diagnostic",
            severity: "high",
          })
        );
      });

      it("should detect medical terminology violations", () => {
        const text = "Your maladaptive schemas require cognitive restructuring therapy.";

        const violations = detectToneViolations(text);

        expect(violations).toContainEqual(
          expect.objectContaining({
            type: "clinical_jargon",
            severity: "medium",
          })
        );
      });

      it("should detect minimizing language", () => {
        const text = "It's not that bad. You're overreacting.";

        const violations = detectToneViolations(text);

        expect(violations).toContainEqual(
          expect.objectContaining({
            type: "minimizing",
          })
        );
      });

      it("should detect directive/commanding tone", () => {
        const text = "You must stop thinking this way immediately. Do what I tell you.";

        const violations = detectToneViolations(text);

        expect(violations).toContainEqual(
          expect.objectContaining({
            type: "directive",
          })
        );
      });

      it("should detect multiple violations in same text", () => {
        const text = "You have anxiety disorder. Just stop worrying. You're being irrational.";

        const violations = detectToneViolations(text);

        expect(violations.length).toBeGreaterThanOrEqual(2);
        expect(violations.some(v => v.type === "diagnostic")).toBe(true);
        expect(violations.some(v => v.type === "dismissive")).toBe(true);
      });
    });

    describe("analyzeToneCompliance", () => {
      it("should return high compliance score for compliant response", () => {
        const response = {
          reframe: "Let's explore this thought with gentleness and understanding.",
          intention: "Take a moment to breathe and notice what you're feeling.",
          islamicPerspective: {
            verse: "Verily, with hardship comes ease (94:5-6)",
            reflection: "Trust in Allah's wisdom during difficult times.",
          },
        };

        const analysis = analyzeToneCompliance(response);

        expect(analysis.overallScore).toBeGreaterThan(0.8);
        expect(analysis.compliant).toBe(true);
        expect(analysis.violations).toHaveLength(0);
      });

      it("should detect violations across response components", () => {
        const response = {
          reframe: "Your anxiety symptoms require professional diagnosis.",
          intention: "Stop thinking negatively right now.",
        };

        const analysis = analyzeToneCompliance(response);

        expect(analysis.overallScore).toBeLessThan(0.5);
        expect(analysis.compliant).toBe(false);
        expect(analysis.violations.length).toBeGreaterThan(0);
      });

      it("should provide component-level scores", () => {
        const response = {
          reframe: "I understand this is challenging for you.",
          intention: "You must do this immediately.",
        };

        const analysis = analyzeToneCompliance(response);

        expect(analysis.componentScores.reframe).toBeGreaterThan(0.7);
        expect(analysis.componentScores.intention).toBeLessThan(0.5);
      });
    });

    describe("Edge cases", () => {
      it("should handle empty text", () => {
        const violations = detectToneViolations("");

        expect(violations).toHaveLength(0);
      });

      it("should handle very short text", () => {
        const violations = detectToneViolations("OK.");

        expect(violations).toHaveLength(0);
      });

      it("should handle text with special characters", () => {
        const text = "I hear you 💙 Let's explore this with compassion.";

        const violations = detectToneViolations(text);

        expect(violations).toHaveLength(0);
      });

      it("should handle text with mixed languages", () => {
        const text = "Alhamdulillah, I understand your struggle. Let's work through this together.";

        const violations = detectToneViolations(text);

        expect(violations).toHaveLength(0);
      });
    });
  });

  describe("Performance and caching", () => {
    it("should cache classification results for identical text", async () => {
      const text = "Test text for caching";

      const start1 = Date.now();
      const result1 = await classifyTone(text);
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      const result2 = await classifyTone(text);
      const time2 = Date.now() - start2;

      expect(result1).toEqual(result2);
      expect(time2).toBeLessThan(time1); // Cached call should be faster
    });
  });
});
```
  </action>
  <verify>
- Test file created with comprehensive tone classification coverage
- Tests pass: `npm test toneClassifier.test.ts`
- TypeScript compilation passes
  </verify>
  <done>toneClassifier.ts fully tested with all classification methods covered</done>
</task>

<task type="auto">
  <name>Task 2: Create tests for stateInference.ts</name>
  <files>server/__tests__/stateInference.test.ts</files>
  <action>
Create `server/__tests__/stateInference.test.ts`:

```typescript
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import {
  StateInference,
  inferEmotionalState,
  inferIntensity,
  inferDistortions,
  trackStateProgression,
} from "../stateInference";

describe("stateInference.ts", () => {
  describe("StateInference", () => {
    let inference: StateInference;

    beforeEach(() => {
      inference = new StateInference();
    });

    describe("inferEmotionalState", () => {
      it("should infer anxious state from worry language", () => {
        const text = "I'm constantly worried about everything going wrong";

        const state = inferEmotionalState(text);

        expect(state.primary).toBe("anxious");
        expect(state.confidence).toBeGreaterThan(0.7);
      });

      it("should infer sad state from grief language", () => {
        const text = "I feel empty and hopeless. Everything feels meaningless.";

        const state = inferEmotionalState(text);

        expect(state.primary).toBe("sad");
        expect(state.confidence).toBeGreaterThan(0.7);
      });

      it("should infer angry state from frustration language", () => {
        const text = "I'm so frustrated and angry at how unfair this is.";

        const state = inferEmotionalState(text);

        expect(state.primary).toBe("angry");
        expect(state.confidence).toBeGreaterThan(0.6);
      });

      it("should infer calm state from peaceful language", () => {
        const text = "I'm feeling centered and at peace today.";

        const state = inferEmotionalState(text);

        expect(state.primary).toBe("calm");
        expect(state.confidence).toBeGreaterThan(0.7);
      });

      it("should detect mixed emotional states", () => {
        const text = "I'm anxious about the future but also hopeful.";

        const state = inferEmotionalState(text);

        expect(state.primary).toBe("anxious");
        expect(state.secondary).toBeDefined();
        expect(state.secondary).toContain("hopeful");
      });

      it("should handle ambiguous emotional text", () => {
        const text = "Things are happening.";

        const state = inferEmotionalState(text);

        expect(state.primary).toBe("neutral");
        expect(state.confidence).toBeLessThan(0.5);
      });
    });

    describe("inferIntensity", () => {
      it("should detect high intensity from extreme language", () => {
        const text = "I'm completely overwhelmed and can't handle this at all.";

        const intensity = inferIntensity(text);

        expect(intensity.level).toBeGreaterThan(0.8);
        expect(intensity.category).toBe("high");
      });

      it("should detect low intensity from mild language", () => {
        const text = "I'm a bit concerned about this.";

        const intensity = inferIntensity(text);

        expect(intensity.level).toBeLessThan(0.4);
        expect(intensity.category).toBe("low");
      });

      it("should detect medium intensity", () => {
        const text = "I'm worried about how this will turn out.";

        const intensity = inferIntensity(text);

        expect(intensity.level).toBeGreaterThan(0.4);
        expect(intensity.level).toBeLessThan(0.7);
        expect(intensity.category).toBe("medium");
      });

      it("should factor in repeated emphasis", () => {
        const text = "I'm so, so, so worried about this!!!";

        const intensity = inferIntensity(text);

        expect(intensity.level).toBeGreaterThan(0.7);
        expect(intensity.indicators).toContain("repetition");
      });

      it("should factor in all-caps usage", () => {
        const text = "I CAN'T DEAL WITH THIS ANYMORE";

        const intensity = inferIntensity(text);

        expect(intensity.level).toBeGreaterThan(0.7);
        expect(intensity.indicators).toContain("caps");
      });
    });

    describe("inferDistortions", () => {
      it("should detect catastrophizing", () => {
        const text = "This will be a complete disaster and everything will fall apart.";

        const distortions = inferDistortions(text);

        expect(distortions).toContainEqual(
          expect.objectContaining({
            type: "catastrophizing",
            confidence: expect.any(Number),
          })
        );
      });

      it("should detect all-or-nothing thinking", () => {
        const text = "I'm a complete failure. I never do anything right.";

        const distortions = inferDistortions(text);

        expect(distortions).toContainEqual(
          expect.objectContaining({
            type: "all-or-nothing",
          })
        );
      });

      it("should detect mind-reading", () => {
        const text = "Everyone thinks I'm stupid and incompetent.";

        const distortions = inferDistortions(text);

        expect(distortions).toContainEqual(
          expect.objectContaining({
            type: "mind-reading",
          })
        );
      });

      it("should detect personalization", () => {
        const text = "It's all my fault. If only I had done better, this wouldn't have happened.";

        const distortions = inferDistortions(text);

        expect(distortions).toContainEqual(
          expect.objectContaining({
            type: "personalization",
          })
        );
      });

      it("should detect fortune-telling", () => {
        const text = "I know for certain that this will never work out.";

        const distortions = inferDistortions(text);

        expect(distortions).toContainEqual(
          expect.objectContaining({
            type: "fortune-telling",
          })
        );
      });

      it("should detect multiple distortions", () => {
        const text = "I'm a total failure and everyone knows it. This will definitely end badly.";

        const distortions = inferDistortions(text);

        expect(distortions.length).toBeGreaterThanOrEqual(2);
      });

      it("should rank distortions by confidence", () => {
        const text = "Everything is terrible. I'm worthless.";

        const distortions = inferDistortions(text);

        expect(distortions[0].confidence).toBeGreaterThanOrEqual(
          distortions[distortions.length - 1].confidence
        );
      });

      it("should handle text with no distortions", () => {
        const text = "I had a productive day at work today.";

        const distortions = inferDistortions(text);

        expect(distortions).toHaveLength(0);
      });
    });

    describe("trackStateProgression", () => {
      it("should track improving progression", () => {
        const sessions = [
          { emotionalState: "anxious", intensity: 0.8, timestamp: Date.now() - 7200000 },
          { emotionalState: "concerned", intensity: 0.6, timestamp: Date.now() - 3600000 },
          { emotionalState: "calm", intensity: 0.3, timestamp: Date.now() },
        ];

        const progression = trackStateProgression(sessions);

        expect(progression.trend).toBe("improving");
        expect(progression.changeRate).toBeLessThan(0);
      });

      it("should track deteriorating progression", () => {
        const sessions = [
          { emotionalState: "calm", intensity: 0.3, timestamp: Date.now() - 7200000 },
          { emotionalState: "concerned", intensity: 0.5, timestamp: Date.now() - 3600000 },
          { emotionalState: "anxious", intensity: 0.8, timestamp: Date.now() },
        ];

        const progression = trackStateProgression(sessions);

        expect(progression.trend).toBe("deteriorating");
        expect(progression.changeRate).toBeGreaterThan(0);
      });

      it("should track stable progression", () => {
        const sessions = [
          { emotionalState: "concerned", intensity: 0.5, timestamp: Date.now() - 7200000 },
          { emotionalState: "concerned", intensity: 0.5, timestamp: Date.now() - 3600000 },
          { emotionalState: "concerned", intensity: 0.5, timestamp: Date.now() },
        ];

        const progression = trackStateProgression(sessions);

        expect(progression.trend).toBe("stable");
        expect(Math.abs(progression.changeRate)).toBeLessThan(0.1);
      });

      it("should identify rapid escalation", () => {
        const sessions = [
          { emotionalState: "calm", intensity: 0.2, timestamp: Date.now() - 600000 },
          { emotionalState: "anxious", intensity: 0.9, timestamp: Date.now() },
        ];

        const progression = trackStateProgression(sessions);

        expect(progression.rapidChange).toBe(true);
        expect(progression.changeRate).toBeGreaterThan(0.5);
      });
    });

    describe("Integration scenarios", () => {
      it("should provide complete state analysis", () => {
        const text = "I'm completely overwhelmed. Everything is falling apart and I can't do anything right.";

        const analysis = inference.analyzeComplete(text);

        expect(analysis.emotionalState).toBeDefined();
        expect(analysis.intensity).toBeDefined();
        expect(analysis.distortions).toBeDefined();
        expect(analysis.distortions.length).toBeGreaterThan(0);
      });

      it("should handle crisis language appropriately", () => {
        const text = "I can't take this anymore. I want to hurt myself.";

        const analysis = inference.analyzeComplete(text);

        expect(analysis.crisisDetected).toBe(true);
        expect(analysis.severity).toBe("high");
      });
    });
  });
});
```
  </action>
  <verify>
- Test file created with comprehensive state inference coverage
- Tests pass: `npm test stateInference.test.ts`
- TypeScript compilation passes
  </verify>
  <done>stateInference.ts fully tested with all inference methods covered</done>
</task>

<task type="auto">
  <name>Task 3: Run tests and verify coverage</name>
  <files>server/__tests__/*.test.ts</files>
  <action>
1. Run new test files:
   ```bash
   npm test toneClassifier.test.ts
   npm test stateInference.test.ts
   ```

2. Generate coverage report:
   ```bash
   npm test -- --coverage --collectCoverageFrom="server/{toneClassifier,stateInference}.ts"
   ```

3. Verify coverage targets:
   - toneClassifier.ts: >75% line coverage
   - stateInference.ts: >75% line coverage

4. Run full test suite:
   ```bash
   npm test
   ```

5. Verify TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```
  </action>
  <verify>
- Both test files pass
- Coverage >75% for each module
- Full test suite passes (79 existing + new tests)
- No TypeScript errors
  </verify>
  <done>toneClassifier.ts and stateInference.ts both have >75% test coverage</done>
</task>

</tasks>

<verification>
1. Confirm 2 new test files created in server/__tests__/
2. Run `npm test` - all tests pass
3. Check coverage report - verify >75% for toneClassifier and stateInference
4. Verify tests cover: tone classification, state inference, distortion detection, intensity calculation
5. No TypeScript compilation errors
</verification>

<success_criteria>
1. toneClassifier.test.ts created with comprehensive tone classification tests
2. stateInference.test.ts created with comprehensive state inference tests
3. Each module achieves >75% test coverage
4. All tests pass alongside existing test suite
5. Tests cover happy paths, edge cases, and error handling
6. TypeScript compilation passes
7. Code committed with clear commit message referencing TEST-06, TEST-07
</success_criteria>

<output>
After completion, create `.planning/phases/02-server-test-coverage/03-SUMMARY.md`
</output>
