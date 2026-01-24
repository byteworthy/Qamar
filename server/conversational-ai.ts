/**
 * Conversational AI State Model for Noor
 *
 * This module implements the four-mode conversational state system
 * that makes AI responses feel fluid, empathetic, and human.
 */

import type {
  EmotionalState,
  DistressLevel,
} from "../shared/islamic-framework";

// =============================================================================
// CONVERSATIONAL STATE MODEL
// =============================================================================

export type ConversationalMode =
  | "listening" // Detecting and acknowledging
  | "reflection" // Understanding and validating
  | "reframing" // Transforming and offering perspective
  | "grounding"; // Closing and action-orienting

export interface ConversationalContext {
  mode: ConversationalMode;
  emotionalState?: EmotionalState;
  distressLevel?: DistressLevel;
  repetitionDetected?: boolean;
  avoidanceDetected?: boolean;
  previousInteractions?: number;
}

export interface ConversationalResponse {
  opening: string;
  core: string;
  closing?: string;
  tone: "gentle" | "balanced" | "direct" | "urgent";
  sentenceLength: "short" | "medium" | "long";
}

// =============================================================================
// MODE-SPECIFIC RESPONSE PATTERNS
// =============================================================================

export const LISTENING_MODE_PATTERNS = {
  acknowledgments: [
    "I hear you",
    "That sounds heavy",
    "That's real",
    "I can feel how hard this is",
    "That makes sense given what you're experiencing",
  ],
  openEnded: [
    "Tell me more about that",
    "What's the hardest part about this?",
    "How long have you been carrying this?",
    "What does this feel like in your body?",
  ],
  emotionalMirroring: (emotion: string) =>
    `It sounds like you\'re feeling ${emotion}`,
  validation: [
    "Your feelings are real",
    "This struggle is legitimate",
    "Anyone in your situation would feel this way",
  ],
};

export const REFLECTION_MODE_PATTERNS = {
  summaries: [
    "So what I'm hearing is...",
    "It seems like the core of this is...",
    "If I understand correctly...",
  ],
  validation: [
    "That makes complete sense given what you're going through",
    "This reaction is understandable",
    "Your heart is responding to real pain",
  ],
  gentleProbing: [
    "What's underneath this feeling?",
    "Is there a belief hiding in this thought?",
    "What does this thought say about what you believe?",
  ],
};

export const REFRAMING_MODE_PATTERNS = {
  perspectiveIntros: [
    "Another way to see this might be...",
    "What if this thought isn't the whole truth?",
    "Here's a different angle...",
    "Consider this perspective...",
  ],
  valuesConnection: [
    "How does this align with what matters most to you?",
    "What would the person you want to be say about this?",
    "Does this thought serve your values?",
  ],
  islamicAnchoring: [
    "The Prophet ﷺ faced similar struggles...",
    "Allah's guidance speaks to this...",
    "This is where sabr becomes real...",
  ],
  metaLanguage: [
    "Notice how this thought is doing something...",
    "This thought is treating feeling like fact",
    "Your mind is making a jump here",
  ],
};

export const GROUNDING_MODE_PATTERNS = {
  actionOrientation: [
    "What's one small step forward?",
    "What's doable today?",
    "How might you test this new perspective?",
  ],
  hopeInfusion: [
    "This struggle is making you stronger",
    "You're building resilience right now",
    "Growth happens in this space",
  ],
  spiritualConnection: [
    "Allah is with you in this",
    "This moment matters to Him",
    "Your effort is seen",
  ],
};

// =============================================================================
// ADAPTIVE TONE STRATEGY
// =============================================================================

export function getAdaptiveTone(context: ConversationalContext): {
  sentenceLength: "short" | "medium" | "long";
  languageComplexity: "simple" | "moderate" | "nuanced";
  pacing: "slow" | "normal" | "quick";
  emphasisStyle: "concrete" | "balanced" | "abstract";
} {
  const { distressLevel, mode } = context;

  // High distress = shorter, simpler, concrete
  if (distressLevel === "high" || distressLevel === "crisis") {
    return {
      sentenceLength: "short",
      languageComplexity: "simple",
      pacing: "slow",
      emphasisStyle: "concrete",
    };
  }

  // Medium distress = balanced
  if (distressLevel === "moderate") {
    return {
      sentenceLength: "medium",
      languageComplexity: "moderate",
      pacing: "normal",
      emphasisStyle: "balanced",
    };
  }

  // Low distress = can go deeper
  return {
    sentenceLength: mode === "reframing" ? "medium" : "long",
    languageComplexity: "nuanced",
    pacing: "normal",
    emphasisStyle: mode === "grounding" ? "concrete" : "abstract",
  };
}

// =============================================================================
// FLUENCY TECHNIQUES
// =============================================================================

export class ConversationalFluency {
  /**
   * Reflective Mirroring: Repeat user's key phrases with slight rephrasing
   */
  static mirror(userPhrase: string): string {
    const lowered = userPhrase.toLowerCase().trim();

    // Remove "I feel" or "I am" to create mirror
    const cleaned = lowered
      .replace(/^i feel /i, "")
      .replace(/^i am /i, "")
      .replace(/^i'm /i, "");

    return `So you're feeling ${cleaned}`;
  }

  /**
   * Progressive Depth: Start surface-level, go deeper as trust builds
   */
  static getDepthLevel(
    interactionCount: number,
  ): "surface" | "middle" | "deep" {
    if (interactionCount <= 2) return "surface";
    if (interactionCount <= 5) return "middle";
    return "deep";
  }

  /**
   * Emotional Bridging: Connect current struggle to past growth
   */
  static createBridge(currentStruggle: string, pastPattern?: string): string {
    if (!pastPattern) {
      return `This ${currentStruggle} is new territory for your growth`;
    }
    return `You've worked through ${pastPattern} before. This ${currentStruggle} is the next layer.`;
  }

  /**
   * Pattern Interruption: Use unexpected questions to break rumination
   */
  static interrupt(thought: string): string {
    const interruptions = [
      "What if the opposite were true?",
      "What would you tell a friend thinking this?",
      "Is this thought helping you right now?",
      "What's the evidence against this?",
      "What percentage of this feels actually true?",
    ];

    return interruptions[Math.floor(Math.random() * interruptions.length)];
  }

  /**
   * Metaphor Usage: Create imagery for abstract concepts
   */
  static useMetaphor(concept: string): string {
    const metaphors: Record<string, string> = {
      anxiety: "like carrying a heavy backpack you forgot you could set down",
      rumination: "like walking in circles in the same room",
      distortion: "like looking through a warped mirror",
      shame: "like wearing a coat that never belonged to you",
      fear: "like shadows that grow in the dark",
      overwhelm: "like trying to hold water in your hands",
    };

    return metaphors[concept.toLowerCase()] || "";
  }
}

// =============================================================================
// RESPONSE BUILDER
// =============================================================================

export class ConversationalResponseBuilder {
  private context: ConversationalContext;
  private userInput: string;

  constructor(context: ConversationalContext, userInput: string) {
    this.context = context;
    this.userInput = userInput;
  }

  build(): ConversationalResponse {
    const tone = this.determineTone();
    const { sentenceLength } = getAdaptiveTone(this.context);

    switch (this.context.mode) {
      case "listening":
        return this.buildListeningResponse(tone, sentenceLength);
      case "reflection":
        return this.buildReflectionResponse(tone, sentenceLength);
      case "reframing":
        return this.buildReframingResponse(tone, sentenceLength);
      case "grounding":
        return this.buildGroundingResponse(tone, sentenceLength);
      default:
        return this.buildDefaultResponse(tone, sentenceLength);
    }
  }

  private determineTone(): "gentle" | "balanced" | "direct" | "urgent" {
    if (this.context.distressLevel === "crisis") return "urgent";
    if (this.context.distressLevel === "high") return "gentle";
    if (this.context.repetitionDetected) return "direct";
    return "balanced";
  }

  private buildListeningResponse(
    tone: ConversationalResponse["tone"],
    sentenceLength: ConversationalResponse["sentenceLength"],
  ): ConversationalResponse {
    const acknowledgment = this.selectRandomFrom(
      LISTENING_MODE_PATTERNS.acknowledgments,
    );

    return {
      opening: acknowledgment + ".",
      core:
        this.userInput.length > 50
          ? ConversationalFluency.mirror(this.userInput.substring(0, 50))
          : "This is real and it matters.",
      closing: this.selectRandomFrom(LISTENING_MODE_PATTERNS.openEnded),
      tone,
      sentenceLength,
    };
  }

  private buildReflectionResponse(
    tone: ConversationalResponse["tone"],
    sentenceLength: ConversationalResponse["sentenceLength"],
  ): ConversationalResponse {
    const summaryIntro = this.selectRandomFrom(
      REFLECTION_MODE_PATTERNS.summaries,
    );
    const validation = this.selectRandomFrom(
      REFLECTION_MODE_PATTERNS.validation,
    );

    return {
      opening: summaryIntro,
      core: validation + ".",
      closing: this.selectRandomFrom(REFLECTION_MODE_PATTERNS.gentleProbing),
      tone,
      sentenceLength,
    };
  }

  private buildReframingResponse(
    tone: ConversationalResponse["tone"],
    sentenceLength: ConversationalResponse["sentenceLength"],
  ): ConversationalResponse {
    const perspectiveIntro = this.selectRandomFrom(
      REFRAMING_MODE_PATTERNS.perspectiveIntros,
    );

    return {
      opening: perspectiveIntro,
      core: "The thought you're having is just one angle. There are others.",
      closing: this.selectRandomFrom(REFRAMING_MODE_PATTERNS.valuesConnection),
      tone,
      sentenceLength,
    };
  }

  private buildGroundingResponse(
    tone: ConversationalResponse["tone"],
    sentenceLength: ConversationalResponse["sentenceLength"],
  ): ConversationalResponse {
    const hope = this.selectRandomFrom(GROUNDING_MODE_PATTERNS.hopeInfusion);
    const spiritual = this.selectRandomFrom(
      GROUNDING_MODE_PATTERNS.spiritualConnection,
    );

    return {
      opening: hope + ".",
      core: spiritual + ".",
      closing: this.selectRandomFrom(GROUNDING_MODE_PATTERNS.actionOrientation),
      tone,
      sentenceLength,
    };
  }

  private buildDefaultResponse(
    tone: ConversationalResponse["tone"],
    sentenceLength: ConversationalResponse["sentenceLength"],
  ): ConversationalResponse {
    return {
      opening: "I hear you.",
      core: "This is real and it deserves attention.",
      closing: "Tell me more about what you're experiencing.",
      tone,
      sentenceLength,
    };
  }

  private selectRandomFrom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}

// =============================================================================
// REPETITION & AVOIDANCE DETECTION
// =============================================================================

export interface PatternDetection {
  repetitionDetected: boolean;
  repetitionCount?: number;
  commonThemes?: string[];
  avoidanceDetected: boolean;
  avoidanceIndicators?: string[];
}

export class PatternDetector {
  /**
   * Detect if user is repeating the same themes
   */
  static detectRepetition(
    currentThought: string,
    previousThoughts: string[],
  ): PatternDetection {
    if (previousThoughts.length < 2) {
      return {
        repetitionDetected: false,
        avoidanceDetected: false,
      };
    }

    const currentWords = this.extractKeywords(currentThought);
    const themes: Record<string, number> = {};

    for (const prevThought of previousThoughts) {
      const prevWords = this.extractKeywords(prevThought);
      const overlap = currentWords.filter((word) => prevWords.includes(word));

      for (const word of overlap) {
        themes[word] = (themes[word] || 0) + 1;
      }
    }

    const repeatedThemes = Object.entries(themes)
      .filter(([_, count]) => count >= 2)
      .map(([theme]) => theme);

    return {
      repetitionDetected: repeatedThemes.length > 0,
      repetitionCount: repeatedThemes.length,
      commonThemes: repeatedThemes,
      avoidanceDetected: false, // Implement if needed
    };
  }

  /**
   * Extract meaningful keywords from text
   */
  private static extractKeywords(text: string): string[] {
    const stopWords = new Set([
      "i",
      "me",
      "my",
      "myself",
      "we",
      "our",
      "ours",
      "ourselves",
      "you",
      "your",
      "the",
      "a",
      "an",
      "and",
      "but",
      "if",
      "or",
      "because",
      "as",
      "until",
      "is",
      "am",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "to",
      "in",
      "on",
      "at",
      "for",
      "with",
      "about",
      "that",
      "this",
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stopWords.has(word));
  }

  /**
   * Detect avoidance patterns (talking around the issue)
   */
  static detectAvoidance(thought: string): boolean {
    const avoidancePatterns = [
      "i don't know",
      "maybe",
      "i guess",
      "whatever",
      "it doesn't matter",
      "i'm fine",
      "it's nothing",
    ];

    const lowerThought = thought.toLowerCase();
    return avoidancePatterns.some((pattern) => lowerThought.includes(pattern));
  }
}

// =============================================================================
// TRANSITION SMOOTHNESS
// =============================================================================

export class TransitionManager {
  /**
   * Create smooth transitions between CBT flow steps
   */
  static createTransition(
    fromMode: ConversationalMode,
    toMode: ConversationalMode,
    context?: { distortionFound?: boolean; reframeReady?: boolean },
  ): string {
    const transitions: Record<string, Record<string, string>> = {
      listening: {
        reflection: "Let me make sure I understand what you're experiencing.",
        reframing: "Now let's look at this from another angle.",
        grounding: "Let's find a way to settle this.",
      },
      reflection: {
        reframing: context?.distortionFound
          ? "I notice a pattern here. Let's explore it together."
          : "Here's what I'm seeing.",
        grounding: "Now let's bring this home.",
      },
      reframing: {
        grounding: context?.reframeReady
          ? "This new perspective deserves to land. Let's ground it."
          : "Let's make this practical.",
      },
      grounding: {
        listening: "How does that feel?",
      },
    };

    return transitions[fromMode]?.[toMode] || "Let's continue.";
  }

  /**
   * Add pauses for emphasis (represented as ellipsis in text)
   */
  static addPause(
    text: string,
    pauseType: "short" | "medium" | "long",
  ): string {
    const pauses = {
      short: "...",
      medium: "... ",
      long: "... ",
    };

    return text + pauses[pauseType];
  }
}

// =============================================================================
// EMOTIONAL INTELLIGENCE HELPERS
// =============================================================================

export class EmotionalIntelligence {
  /**
   * Detect emotional intensity from text
   */
  static detectIntensity(text: string): number {
    let intensity = 0;

    // Capitalization intensity
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    intensity += capsRatio * 30;

    // Exclamation marks
    const exclamations = (text.match(/!/g) || []).length;
    intensity += Math.min(exclamations * 10, 30);

    // Strong emotional words
    const strongWords = [
      "hate",
      "love",
      "always",
      "never",
      "completely",
      "totally",
      "extremely",
    ];
    const strongWordCount = strongWords.filter((word) =>
      text.toLowerCase().includes(word),
    ).length;
    intensity += strongWordCount * 10;

    // Absolute language
    const absoluteWords = ["all", "none", "every", "nothing", "everything"];
    const absoluteCount = absoluteWords.filter((word) =>
      text.toLowerCase().includes(word),
    ).length;
    intensity += absoluteCount * 5;

    return Math.min(intensity, 100);
  }

  /**
   * Suggest emotional label based on text analysis
   */
  static suggestEmotionalLabel(text: string): EmotionalState | "mixed" {
    const lowerText = text.toLowerCase();

    const emotionPatterns: Record<EmotionalState, string[]> = {
      anxiety: ["worried", "anxious", "nervous", "scared", "afraid"],
      grief: ["lost", "miss", "gone", "died", "empty"],
      fear: ["terrified", "frightened", "panic", "dread"],
      shame: ["ashamed", "embarrassed", "humiliated", "guilty"],
      anger: ["angry", "mad", "furious", "rage", "frustrated"],
      loneliness: ["lonely", "alone", "isolated", "abandoned"],
      doubt: ["unsure", "questioning", "confused", "lost"],
      despair: ["hopeless", "pointless", "give up", "no hope"],
      exhaustion: ["tired", "exhausted", "drained", "burned out"],
      overwhelm: ["overwhelmed", "too much", "can't handle"],
      hopelessness: ["hopeless", "no point", "meaningless"],
      guilt: ["guilty", "fault", "blame", "should have"],
    };

    const matches: EmotionalState[] = [];

    for (const [emotion, patterns] of Object.entries(emotionPatterns)) {
      if (patterns.some((pattern) => lowerText.includes(pattern))) {
        matches.push(emotion as EmotionalState);
      }
    }

    if (matches.length === 0) return "anxiety"; // Default
    if (matches.length === 1) return matches[0];
    return "mixed";
  }
}

// =============================================================================
// EXPORT HELPERS
// =============================================================================

export function buildConversationalPromptModifier(
  context: ConversationalContext,
): string {
  const tone = getAdaptiveTone(context);

  let modifier = `\n\nCONVERSATIONAL ADAPTATION:\n`;
  modifier += `Mode: ${context.mode}\n`;
  modifier += `Sentence length: ${tone.sentenceLength}\n`;
  modifier += `Language: ${tone.languageComplexity}\n`;
  modifier += `Style: ${tone.emphasisStyle}\n`;

  if (context.repetitionDetected) {
    modifier += `\nREPETITION DETECTED: User is circling back to familiar patterns. Gently interrupt with a pattern-breaking question.\n`;
  }

  if (context.avoidanceDetected) {
    modifier += `\nAVOIDANCE DETECTED: User may be talking around the core issue. Invite deeper honesty with compassion.\n`;
  }

  return modifier;
}
