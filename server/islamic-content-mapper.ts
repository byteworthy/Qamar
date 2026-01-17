/**
 * Islamic Content Mapper for Noor CBT
 * 
 * Charter Version: 1.0
 * Charter URL: /AI_ISLAMIC_SAFETY_CHARTER.md
 * Last Reviewed: 2026-01-17
 * 
 * Intelligently selects Quran, Hadith, and Islamic concepts
 * based on user's emotional state, distress level, and context.
 * 
 * Enforces Charter Part 8: Islamic Content Usage Rules
 */

import { 
  EmotionalState, 
  DistressLevel,
  IslamicConcept,
  QURAN_BY_STATE, 
  HADITH_BY_STATE,
  ISLAMIC_CONCEPTS,
  DISTRESS_RESPONSE_MATRIX,
  CONCEPT_RULES,
  QuranicReminder,
  HadithReminder,
  ConceptDefinition
} from '../shared/islamic-framework';
import { type CrisisDetectionResult } from './ai-safety';

// =============================================================================
// TYPES
// =============================================================================

export interface IslamicContentSelection {
  quran?: QuranicReminder;
  hadith?: HadithReminder;
  concept: ConceptDefinition;
  conceptKey: IslamicConcept;
  tone: string;
  responseLength: 'normal' | 'shorter' | 'minimal';
  emphasis: 'rahma' | 'sabr' | 'tawakkul' | 'hope';
}

export interface ContentSelectionContext {
  emotionalState: EmotionalState;
  distressLevel: DistressLevel;
  context: 'analyze' | 'reframe' | 'practice' | 'dua' | 'insight';
  cognitiveDistortions?: string[];
  beliefType?: string;
  previousConcepts?: IslamicConcept[];
}

// =============================================================================
// COGNITIVE DISTORTION TO CONCEPT MAPPING
// =============================================================================

const DISTORTION_TO_CONCEPT: Record<string, IslamicConcept[]> = {
  "Despair of Allah's Mercy": ['tawbah', 'shukr', 'ridha'],
  "Over-attachment to dunya outcome": ['tawakkul', 'sabr', 'ridha'],
  "Mind reading": ['muraqaba', 'tawakkul', 'ikhlas'],
  "Catastrophizing": ['tawakkul', 'sabr', 'dhikr'],
  "Emotional reasoning": ['muraqaba', 'muhasaba', 'sabr'],
  "Black-and-white thinking": ['sabr', 'ridha', 'tawakkul'],
  "Hasty generalization": ['muraqaba', 'muhasaba', 'sabr'],
  "Self-blame beyond accountability": ['tawbah', 'shukr', 'ridha'],
  "Ingratitude bias": ['shukr', 'muraqaba', 'dhikr'],
  "Comparison to others' blessings": ['shukr', 'ridha', 'ikhlas'],
};

// =============================================================================
// BELIEF TYPE TO CONCEPT MAPPING
// =============================================================================

const BELIEF_TYPE_TO_CONCEPT: Record<string, IslamicConcept[]> = {
  "worth": ['tawbah', 'shukr', 'ridha'],      // Self-worth → tawbah, shukr
  "control": ['tawakkul', 'sabr', 'ridha'],    // Control → tawakkul
  "safety": ['tawakkul', 'dhikr', 'sabr'],     // Safety → tawakkul, dhikr
  "others": ['ikhlas', 'tawakkul', 'ridha'],   // Others' views → ikhlas
  "allah": ['muraqaba', 'tawakkul', 'dhikr'],  // Allah's view → muraqaba
  "future": ['tawakkul', 'sabr', 'niyyah'],    // Future → tawakkul, sabr
};

// =============================================================================
// ISLAMIC CONTENT MAPPER CLASS
// =============================================================================

export class IslamicContentMapper {
  /**
   * Select appropriate Islamic content based on user context
   */
  static selectContent(context: ContentSelectionContext): IslamicContentSelection {
    const { emotionalState, distressLevel, context: useContext, cognitiveDistortions, beliefType, previousConcepts } = context;
    
    const distressResponse = DISTRESS_RESPONSE_MATRIX[distressLevel];
    
    // Select primary concept based on context
    let conceptKey = this.selectConcept(context);
    
    // Avoid repeating previous concepts if possible
    if (previousConcepts && previousConcepts.indexOf(conceptKey) !== -1) {
      conceptKey = this.selectAlternativeConcept(context, previousConcepts);
    }
    
    const concept = ISLAMIC_CONCEPTS[conceptKey];
    
    // Get Quran/Hadith based on emotional state and distress level
    const quran = this.selectQuran(emotionalState, distressLevel, useContext);
    const hadith = this.selectHadith(emotionalState, distressLevel, useContext);
    
    return {
      quran,
      hadith,
      concept,
      conceptKey,
      tone: distressResponse.toneAdjustment,
      responseLength: distressResponse.responseLength,
      emphasis: distressResponse.quranicEmphasis,
    };
  }

  /**
   * Select the most appropriate concept based on context
   */
  private static selectConcept(context: ContentSelectionContext): IslamicConcept {
    const { emotionalState, distressLevel, cognitiveDistortions, beliefType } = context;
    
    // Priority 1: Distress-level based selection for high distress
    if (distressLevel === 'crisis' || distressLevel === 'high') {
      return DISTRESS_RESPONSE_MATRIX[distressLevel].primaryConcept;
    }
    
    // Priority 2: Cognitive distortion based selection
    if (cognitiveDistortions && cognitiveDistortions.length > 0) {
      const primaryDistortion = cognitiveDistortions[0];
      const concepts = DISTORTION_TO_CONCEPT[primaryDistortion];
      if (concepts && concepts.length > 0) {
        return concepts[0];
      }
    }
    
    // Priority 3: Belief type based selection
    if (beliefType && BELIEF_TYPE_TO_CONCEPT[beliefType]) {
      return BELIEF_TYPE_TO_CONCEPT[beliefType][0];
    }
    
    // Priority 4: Emotional state based selection
    return this.getConceptForEmotion(emotionalState);
  }

  /**
   * Select an alternative concept when primary is already used
   */
  private static selectAlternativeConcept(
    context: ContentSelectionContext, 
    previousConcepts: IslamicConcept[]
  ): IslamicConcept {
    const { cognitiveDistortions, beliefType, emotionalState } = context;
    
    // Try distortion-based alternatives
    if (cognitiveDistortions && cognitiveDistortions.length > 0) {
      const primaryDistortion = cognitiveDistortions[0];
      const concepts = DISTORTION_TO_CONCEPT[primaryDistortion];
      if (concepts) {
        for (const concept of concepts) {
          if (previousConcepts.indexOf(concept) === -1) {
            return concept;
          }
        }
      }
    }
    
    // Try belief type alternatives
    if (beliefType && BELIEF_TYPE_TO_CONCEPT[beliefType]) {
      for (const concept of BELIEF_TYPE_TO_CONCEPT[beliefType]) {
        if (previousConcepts.indexOf(concept) === -1) {
          return concept;
        }
      }
    }
    
    // Fall back to emotion-based
    return this.getConceptForEmotion(emotionalState);
  }

  /**
   * Get concept for emotional state
   */
  private static getConceptForEmotion(emotionalState: EmotionalState): IslamicConcept {
    const emotionToConceptMap: Record<EmotionalState, IslamicConcept> = {
      'anxiety': 'dhikr',
      'grief': 'sabr',
      'fear': 'tawakkul',
      'shame': 'tawbah',
      'anger': 'sabr',
      'loneliness': 'dhikr',
      'doubt': 'muraqaba',
      'despair': 'tawakkul',
      'exhaustion': 'sabr',
      'overwhelm': 'tawakkul',
      'hopelessness': 'tawakkul',
      'guilt': 'tawbah',
    };
    
    return emotionToConceptMap[emotionalState] || 'dhikr';
  }

  /**
   * Select Quranic content based on context
   */
  private static selectQuran(
    emotionalState: EmotionalState, 
    distressLevel: DistressLevel,
    context: 'analyze' | 'reframe' | 'practice' | 'dua' | 'insight'
  ): QuranicReminder | undefined {
    // Don't include Quran for analysis (keep it simple)
    if (context === 'analyze') {
      return undefined;
    }
    
    // Don't include Quran for high distress (keep it minimal)
    if (distressLevel === 'crisis') {
      return undefined;
    }
    
    // For high distress, only include if it's mercy-focused
    if (distressLevel === 'high') {
      const distressResponse = DISTRESS_RESPONSE_MATRIX[distressLevel];
      if (distressResponse.quranicEmphasis !== 'rahma') {
        return undefined;
      }
    }
    
    return QURAN_BY_STATE[emotionalState];
  }

  /**
   * Select Hadith content based on context
   */
  private static selectHadith(
    emotionalState: EmotionalState, 
    distressLevel: DistressLevel,
    context: 'analyze' | 'reframe' | 'practice' | 'dua' | 'insight'
  ): HadithReminder | undefined {
    // Don't include Hadith for analysis (keep it simple)
    if (context === 'analyze') {
      return undefined;
    }
    
    // Don't include Hadith for high distress or crisis (keep it minimal)
    if (distressLevel === 'high' || distressLevel === 'crisis') {
      return undefined;
    }
    
    return HADITH_BY_STATE[emotionalState];
  }

  /**
   * Validate that content is appropriate for the context
   */
  static validateContent(text: string): { safe: boolean; issues: string[] } {
    const issues: string[] = [];
    const lowerText = text.toLowerCase();
    
    // Check for spiritual bypassing patterns
    const bypassingPatterns = [
      'just trust allah',
      'just make dua',
      'if you had more faith',
      'you should be grateful',
      'real muslims don\'t',
      'just pray more',
    ];
    
    for (const pattern of bypassingPatterns) {
      if (lowerText.includes(pattern)) {
        issues.push(`Spiritual bypassing detected: "${pattern}"`);
      }
    }
    
    // Check for guilt-based motivation
    const guiltPatterns = [
      'you should feel',
      'allah is disappointed',
      'you\'re failing',
      'you\'re not good enough',
    ];
    
    for (const pattern of guiltPatterns) {
      if (lowerText.includes(pattern)) {
        issues.push(`Guilt-based language detected: "${pattern}"`);
      }
    }
    
    // Check for fatwa-like language
    const fatwaPatterns = [
      'this is haram',
      'this is halal',
      'you must',
      'islam requires',
      'it is forbidden',
    ];
    
    for (const pattern of fatwaPatterns) {
      if (lowerText.includes(pattern)) {
        issues.push(`Fatwa-like language detected: "${pattern}"`);
      }
    }
    
    return {
      safe: issues.length === 0,
      issues,
    };
  }

  /**
   * Build a contextual prompt modifier with Islamic content
   */
  static buildIslamicPromptModifier(selection: IslamicContentSelection): string {
    let modifier = `\n\nISLAMIC CONTEXT FOR THIS RESPONSE:\n`;
    
    // Add concept
    modifier += `Primary Concept: ${selection.concept.transliteration} (${selection.concept.arabic}) - ${selection.concept.meaning}\n`;
    modifier += `Therapeutic Application: ${selection.concept.therapeuticApplication}\n`;
    modifier += `CBT Connection: ${selection.concept.cbtConnection}\n`;
    
    // Add Quran if available
    if (selection.quran) {
      modifier += `\nQuranic Reminder (${selection.quran.reference}):\n`;
      modifier += `"${selection.quran.translation}"\n`;
      modifier += `Therapeutic Context: ${selection.quran.therapeuticContext}\n`;
    }
    
    // Add Hadith if available
    if (selection.hadith) {
      modifier += `\nHadith Reminder (${selection.hadith.source}):\n`;
      modifier += `"${selection.hadith.translation}"\n`;
      modifier += `Therapeutic Context: ${selection.hadith.therapeuticContext}\n`;
    }
    
    // Add tone and emphasis guidance
    modifier += `\nRESPONSE GUIDANCE:\n`;
    modifier += `- Tone: ${selection.tone}\n`;
    modifier += `- Response Length: ${selection.responseLength}\n`;
    modifier += `- Emphasis: ${selection.emphasis}\n`;
    
    return modifier;
  }

  /**
   * Get a list of applicable concepts for a given emotional state
   */
  static getApplicableConcepts(emotionalState: EmotionalState): IslamicConcept[] {
    const applicableConcepts: IslamicConcept[] = [];
    
    for (const rule of CONCEPT_RULES) {
      // Check if the concept applies to any emotional state-related conditions
      const applies = rule.applyWhen.some(condition => 
        condition.toLowerCase().includes(emotionalState) ||
        condition.toLowerCase().includes('prolonged difficulty') ||
        condition.toLowerCase().includes('feel')
      );
      
      if (applies) {
        applicableConcepts.push(rule.concept);
      }
    }
    
    // Always include dhikr as a default grounding practice
    if (applicableConcepts.indexOf('dhikr') === -1) {
      applicableConcepts.push('dhikr');
    }
    
    return applicableConcepts;
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get a simple Islamic reminder for the given emotional state
 */
export function getSimpleReminder(emotionalState: EmotionalState): string {
  const reminders: Record<EmotionalState, string> = {
    anxiety: "Allah does not burden a soul beyond its capacity. What you're carrying is within your strength.",
    grief: "Your Lord has not abandoned you. This pain is seen and honored.",
    fear: "Whoever relies upon Allah, He is sufficient for them. You are not alone in this.",
    shame: "Allah's mercy exceeds all sin. The door of return is always open.",
    anger: "The strong one is not the one who overcomes others, but the one who controls themselves in anger.",
    loneliness: "He is with you wherever you are. You are never truly alone.",
    doubt: "Allah is near. Closer than you feel right now.",
    despair: "Do not despair of Allah's mercy. Relief is closer than it seems.",
    exhaustion: "With hardship comes ease. The most beloved deeds are small and consistent.",
    overwhelm: "Take one step. Allah will meet you where you are.",
    hopelessness: "In the remembrance of Allah do hearts find rest. This feeling is not the final truth.",
    guilt: "Whoever seeks forgiveness finds Allah forgiving and merciful. Start fresh.",
  };
  
  return reminders[emotionalState] || "Hearts fluctuate. Return is always possible.";
}

/**
 * Get concept application guidance
 */
export function getConceptGuidance(concept: IslamicConcept): string {
  const rule = CONCEPT_RULES.find(r => r.concept === concept);
  if (!rule) {
    return ISLAMIC_CONCEPTS[concept].therapeuticApplication;
  }
  
  return rule.exampleApplication;
}

// =============================================================================
// CHARTER PART 8: ISLAMIC CONTENT SOURCING RULES
// =============================================================================

/**
 * Explicit sourcing rules per Charter Part 8
 */
export const SOURCING_RULES = {
  quran: {
    translation: 'Sahih International',
    usage: 'Grounding and mercy ONLY, never as argument or proof',
    maxPerResponse: 1,
    forbidden: [
      'Verse stacking (multiple ayat)',
      'Out of context usage',
      'After crisis detection (except mercy verses in urgent)',
      'As argument to convince user',
      'Without proper therapeutic context',
    ],
  },
  hadith: {
    authenticity: ['Sahih Bukhari', 'Sahih Muslim', 'Agreed Upon'],
    maxPerResponse: 1,
    usage: 'Therapeutic context only, not as religious proof',
    forbidden: [
      'Weak (da\'if) hadith',
      'Fabricated (mawdu\') narrations',
      'Israelite narrations (Isra\'iliyyat)',
      'Hadith not in authenticated whitelist',
      'Multiple hadith in one response',
    ],
  },
  concepts: {
    whitelist: [
      'niyyah', 'sabr', 'tawakkul', 'tazkiyah', 'shukr', 'tawbah',
      'dhikr', 'muraqaba', 'muhasaba', 'ridha', 'khushu', 'ikhlas'
    ],
    requiresContext: true,
    forbidden: [
      'Concepts outside the 12',
      'Sectarian interpretations',
      'Concepts without therapeutic framing',
    ],
  },
};

/**
 * Distress-based content restrictions per Charter Part 8
 */
export const DISTRESS_CONTENT_RESTRICTIONS: Record<DistressLevel, {
  quranAllowed: boolean;
  hadithAllowed: boolean;
  conceptComplexity: 'full' | 'balanced' | 'simple' | 'minimal';
  notes: string;
}> = {
  low: {
    quranAllowed: true,
    hadithAllowed: true,
    conceptComplexity: 'full',
    notes: 'Full depth okay. User has capacity for reflection.',
  },
  moderate: {
    quranAllowed: true,
    hadithAllowed: true,
    conceptComplexity: 'balanced',
    notes: 'Balanced approach. Standard therapeutic usage.',
  },
  high: {
    quranAllowed: true, // Only mercy verses
    hadithAllowed: false,
    conceptComplexity: 'simple',
    notes: 'Mercy verses only. Simple, concrete language.',
  },
  crisis: {
    quranAllowed: false,
    hadithAllowed: false,
    conceptComplexity: 'minimal',
    notes: 'No verses. No hadith. Minimal content. Resources only.',
  },
};

// =============================================================================
// AUTHENTICITY LEVEL TAGGING SYSTEM
// =============================================================================

export interface AuthenticatedContent {
  text: string;
  source: string;
  authenticityLevel: 'quran' | 'sahih' | 'hassan' | 'weak' | 'unknown';
  scholarApproved: boolean;
  therapeuticContext: string;
  usageConstraints: string[];
  reviewDate?: Date;
  reviewedBy?: string;
}

/**
 * Verify content authenticity
 */
export function verifyAuthenticity(
  contentType: 'quran' | 'hadith' | 'concept',
  reference: string
): { authentic: boolean; level: string; issues: string[] } {
  const issues: string[] = [];

  if (contentType === 'quran') {
    // All Quran content is authentic by definition
    // Check if it's in our whitelist
    const inWhitelist = Object.values(QURAN_BY_STATE).some(
      reminder => reminder.reference === reference
    );

    if (!inWhitelist) {
      issues.push(`Quranic reference "${reference}" not in authenticated whitelist`);
    }

    return {
      authentic: inWhitelist,
      level: 'quran',
      issues,
    };
  }

  if (contentType === 'hadith') {
    // Check if hadith is in our whitelist
    const inWhitelist = Object.values(HADITH_BY_STATE).some(
      reminder => reminder && reminder.source === reference
    );

    if (!inWhitelist) {
      issues.push(`Hadith reference "${reference}" not in authenticated whitelist`);
      return {
        authentic: false,
        level: 'unknown',
        issues,
      };
    }

    // Check authenticity level from whitelist
    const hadith = Object.values(HADITH_BY_STATE).find(
      reminder => reminder && reminder.source === reference
    );

    if (hadith?.authenticity === 'Sahih Bukhari' || hadith?.authenticity === 'Sahih Muslim' || hadith?.authenticity === 'Agreed Upon') {
      return {
        authentic: true,
        level: 'sahih',
        issues: [],
      };
    }

    issues.push(`Hadith authenticity level not confirmed as Sahih`);
    return {
      authentic: false,
      level: 'unknown',
      issues,
    };
  }

  if (contentType === 'concept') {
    // Check if concept is in whitelist
    const inWhitelist = SOURCING_RULES.concepts.whitelist.includes(reference);

    if (!inWhitelist) {
      issues.push(`Concept "${reference}" not in authenticated whitelist of 12 core concepts`);
    }

    return {
      authentic: inWhitelist,
      level: 'concept',
      issues,
    };
  }

  return {
    authentic: false,
    level: 'unknown',
    issues: ['Unknown content type'],
  };
}

// =============================================================================
// CONTEXTUAL USAGE CONSTRAINTS
// =============================================================================

/**
 * Usage constraints for each Islamic concept
 */
export const CONCEPT_USAGE_CONSTRAINTS: Record<IslamicConcept, {
  applyWhen: string[];
  neverWhen: string[];
  example: string;
  therapeuticBoundary: string;
}> = {
  tawakkul: {
    applyWhen: ['Anxiety about outcomes', 'Control issues', 'Future worry'],
    neverWhen: ['User avoiding action', 'Spiritual bypassing detected', 'User needs to make change'],
    example: 'After effort, not instead of effort. "You\'ve done what you can. The rest is not yours to carry."',
    therapeuticBoundary: 'Tawakkul is not passivity. It requires doing your part first.',
  },
  sabr: {
    applyWhen: ['Prolonged difficulty', 'Building resilience', 'Waiting for change'],
    neverWhen: ['Abuse situation', 'Change is needed now', 'Tolerating harm'],
    example: 'Active endurance, not passive tolerance. "Sabr doesn\'t mean staying stuck. It means staying steady while working toward change."',
    therapeuticBoundary: 'Never use sabr to keep someone in a harmful situation.',
  },
  shukr: {
    applyWhen: ['Ingratitude spiral', 'Cannot see blessings', 'Comparison to others'],
    neverWhen: ['Acute grief', 'Gratitude would dismiss pain', 'User already practicing gratitude'],
    example: 'Validate pain first. "What\'s one thing, even small, that\'s working right now?"',
    therapeuticBoundary: 'Gratitude alongside struggle, not instead of acknowledging it.',
  },
  tawbah: {
    applyWhen: ['Shame about past', 'Feeling unworthy', 'Stuck in regret'],
    neverWhen: ['User hasn\'t done anything wrong', 'Shame is unfounded', 'Self-condemnation already high'],
    example: 'Frame as return, not failure. "The door is always open. Starting fresh is always possible."',
    therapeuticBoundary: 'Tawbah breaks shame cycles; it doesn\'t create them.',
  },
  dhikr: {
    applyWhen: ['Overwhelm', 'Anxiety', 'Need for grounding', 'Rumination'],
    neverWhen: ['As only intervention', 'Dismissing other needs', 'In place of professional help'],
    example: 'As one tool among many. "Dhikr can be an anchor. Would you like to try a simple practice?"',
    therapeuticBoundary: 'Dhikr is grounding, not a cure-all.',
  },
  muraqaba: {
    applyWhen: ['Lack of self-awareness', 'Reactive patterns', 'Need for witnessing'],
    neverWhen: ['Acute crisis', 'High distress', 'Overwhelming emotion'],
    example: 'The observer stance. "Notice the thought without becoming it."',
    therapeuticBoundary: 'Requires emotional capacity. Not for crisis states.',
  },
  muhasaba: {
    applyWhen: ['Pattern recognition needed', 'Growth reflection', 'Gentle accountability'],
    neverWhen: ['High shame', 'Self-attack present', 'Depression with rumination'],
    example: 'Honest inventory without self-destruction. "What can you learn here?"',
    therapeuticBoundary: 'Assessment, not judgment. Never fuel self-attack.',
  },
  ridha: {
    applyWhen: ['Over-attachment to outcome', 'Comparison', 'Control struggle'],
    neverWhen: ['Resignation being confused with contentment', 'Passivity', 'Avoiding necessary action'],
    example: 'Peace from acceptance, not achievement. "Contentment with effort, not outcome."',
    therapeuticBoundary: 'Ridha is not complacency or giving up.',
  },
  tazkiyah: {
    applyWhen: ['Framing CBT as spiritual work', 'Soul purification', 'Growth mindset'],
    neverWhen: ['Perfectionism present', 'Scrupulosity detected', 'Self-improvement obsession'],
    example: 'Soul work, not performance. "This work is purifying, even when it\'s hard."',
    therapeuticBoundary: 'Growth-oriented, not perfection-driven.',
  },
  niyyah: {
    applyWhen: ['Beginning of work', 'Values clarification', 'Purpose-setting'],
    neverWhen: ['Overthinking intention', 'Scrupulosity about intentions', 'Analysis paralysis'],
    example: 'Setting direction, not overthinking. "What\'s your intention for this work?"',
    therapeuticBoundary: 'Simple and clear. Not obsessive.',
  },
  khushu: {
    applyWhen: ['Distracted', 'Surface-level', 'Lack of presence'],
    neverWhen: ['Anxiety about doing it "right"', 'Perfectionism in prayer', 'Scrupulosity'],
    example: 'Presence without pressure. "Full attention, without judgment about how well you\'re doing."',
    therapeuticBoundary: 'Quality of presence, not performance metric.',
  },
  ikhlas: {
    applyWhen: ['People-pleasing', 'Validation-seeking', 'Audience anxiety'],
    neverWhen: ['Isolation', 'Avoiding help', 'Using sincerity to reject support'],
    example: 'For Allah, not for show. "Who is this really for?"',
    therapeuticBoundary: 'Sincerity, not isolation or pride.',
  },
};

// =============================================================================
// CHARTER ENFORCEMENT: NO VERSE AFTER CRISIS RULE
// =============================================================================

/**
 * Enforce Charter Part 8: No Verse After Crisis Rule
 * 
 * CRITICAL: When crisis is detected, do NOT include Quranic verses or hadith
 */
export function enforceNoVerseAfterCrisis(
  crisisDetected: CrisisDetectionResult | undefined,
  distressLevel: DistressLevel,
  selection: IslamicContentSelection
): IslamicContentSelection {
  // Rule 1: No verse or hadith in emergency crisis
  if (crisisDetected && crisisDetected.level === 'emergency') {
    return {
      ...selection,
      quran: undefined,
      hadith: undefined,
      responseLength: 'minimal',
    };
  }

  // Rule 2: Only mercy verses in urgent crisis, no hadith
  if (crisisDetected && crisisDetected.level === 'urgent') {
    // Only allow if emphasis is on mercy (rahma)
    if (selection.emphasis !== 'rahma') {
      return {
        ...selection,
        quran: undefined,
        hadith: undefined,
      };
    }

    // Even with mercy emphasis, remove hadith
    return {
      ...selection,
      hadith: undefined,
    };
  }

  // Rule 3: High distress restrictions
  if (distressLevel === 'high') {
    return {
      ...selection,
      hadith: undefined, // No hadith in high distress
    };
  }

  return selection;
}

// =============================================================================
// SCHOLAR REVIEW REGISTRY
// =============================================================================

/**
 * Placeholder for scholar-approved content registry
 * 
 * In production, this would be populated after actual scholar review
 */
export const SCHOLAR_APPROVED_CONTENT = {
  reviewStatus: 'PENDING_INITIAL_REVIEW',
  reviewedBy: [],
  approvedQuranAyat: Object.keys(QURAN_BY_STATE),
  approvedHadith: Object.keys(HADITH_BY_STATE),
  approvedConcepts: SOURCING_RULES.concepts.whitelist,
  reviewNotes: 'Awaiting initial review by qualified Islamic scholars with mental health understanding',
  nextReviewDate: '2026-04-01', // Quarterly review
  reviewCriteria: [
    'Theological accuracy',
    'Contextual appropriateness',
    'Spiritual safety',
    'Balanced approach',
    'Therapeutic integrity',
  ],
};

/**
 * Check if content is scholar-approved
 */
export function isScholarApproved(
  contentType: 'quran' | 'hadith' | 'concept',
  reference: string
): boolean {
  // In production, this would check actual scholar approvals
  // For now, we check against our authenticated whitelist
  
  if (contentType === 'quran') {
    return SCHOLAR_APPROVED_CONTENT.approvedQuranAyat.includes(reference);
  }

  if (contentType === 'hadith') {
    return SCHOLAR_APPROVED_CONTENT.approvedHadith.includes(reference);
  }

  if (contentType === 'concept') {
    return SCHOLAR_APPROVED_CONTENT.approvedConcepts.includes(reference);
  }

  return false;
}
