/**
 * Pacing Controller for Noor CBT
 * 
 * Charter Version: 1.0
 * Charter URL: /AI_ISLAMIC_SAFETY_CHARTER.md
 * Last Reviewed: 2026-01-17
 * 
 * This module implements gentle pacing mechanisms that protect
 * users from being rushed through vulnerable moments.
 * 
 * Core Principle: "Pressure equals harm. Pacing equals safety."
 */

import type { DistressLevel, EmotionalState } from '../shared/islamic-framework';
import type { ConversationState } from './conversation-state-machine';

// =============================================================================
// TYPES
// =============================================================================

export interface PacingConfig {
  delayBeforeResponse?: number; // milliseconds
  maxResponseLength: number; // characters
  requiresPermission: boolean;
  softLanguage: boolean;
  allowMultipleTopics: boolean;
  showExitOption: boolean;
  toneGuidance: string;
}

export interface ClosureRitual {
  acknowledgment: string;
  validation: string;
  invitation: string;
  blessing: string;
  noGuilt: boolean;
}

export interface SessionMetrics {
  duration: number; // minutes
  interactionCount: number;
  distressLevel: DistressLevel;
  topicsExplored: number;
  crisisDetected: boolean;
  repetitionCount: number;
}

// =============================================================================
// PACING CONTROLLER
// =============================================================================

export class PacingController {
  /**
   * Get pacing configuration based on distress level
   */
  static getPacingConfig(
    distressLevel: DistressLevel,
    conversationState: ConversationState,
    repetitionCount: number
  ): PacingConfig {
    // High distress or crisis: slow everything down
    if (distressLevel === 'crisis' || distressLevel === 'high') {
      return {
        delayBeforeResponse: 1500, // 1.5 second delay shows care
        maxResponseLength: 200, // Very short, simple
        requiresPermission: true,
        softLanguage: true,
        allowMultipleTopics: false,
        showExitOption: true,
        toneGuidance: 'Slow. Simple. Present. No rush.',
      };
    }

    // Repetition detected: user is stuck, slow down
    if (repetitionCount >= 2) {
      return {
        delayBeforeResponse: 1000,
        maxResponseLength: 250,
        requiresPermission: true,
        softLanguage: true,
        allowMultipleTopics: false,
        showExitOption: true,
        toneGuidance: 'Pattern interrupt. Slow down. Name the cycle.',
      };
    }

    // Moderate distress: balanced pacing
    if (distressLevel === 'moderate') {
      return {
        delayBeforeResponse: 500,
        maxResponseLength: 400,
        requiresPermission: conversationState === 'reframing',
        softLanguage: true,
        allowMultipleTopics: false,
        showExitOption: false,
        toneGuidance: 'Balanced. Clear. Validating.',
      };
    }

    // Low distress: normal pacing
    return {
      delayBeforeResponse: 0,
      maxResponseLength: 600,
      requiresPermission: conversationState === 'reframing',
      softLanguage: false,
      allowMultipleTopics: true,
      showExitOption: false,
      toneGuidance: 'Normal depth. Thoughtful engagement.',
    };
  }

  /**
   * Get permission request phrase based on context
   */
  static getPermissionPhrase(
    distressLevel: DistressLevel,
    conversationState: ConversationState
  ): string {
    if (distressLevel === 'high' || distressLevel === 'crisis') {
      return 'Would you like me to offer a different perspective, or should we stay here a bit longer? Either is okay.';
    }

    if (conversationState === 'reframing') {
      return 'Would you like to explore a different angle on this?';
    }

    if (conversationState === 'clarification') {
      return 'Is it okay if I ask a few more questions to understand better?';
    }

    if (conversationState === 'grounding') {
      return 'Would it be helpful to think about a next step?';
    }

    return 'How would you like to proceed from here?';
  }

  /**
   * Check if user should be offered an exit
   */
  static shouldOfferExit(metrics: SessionMetrics): boolean {
    // Offer exit after 20 minutes
    if (metrics.duration > 20) return true;

    // Offer exit after 15 interactions
    if (metrics.interactionCount > 15) return true;

    // Offer exit if high distress persists
    if (metrics.distressLevel === 'high' && metrics.interactionCount > 5) return true;

    // Offer exit if crisis was detected
    if (metrics.crisisDetected) return true;

    // Offer exit if repetition is high (user stuck)
    if (metrics.repetitionCount >= 3) return true;

    return false;
  }

  /**
   * Generate soft exit prompt
   */
  static getSoftExitPrompt(): string {
    return '\n\n💙 This work can feel heavy. You can pause anytime. Type "pause" if you need a break, or keep going if you\'d like.';
  }

  /**
   * Generate closure ritual for session end
   */
  static getClosureRitual(
    emotionalState: EmotionalState,
    workDone: boolean,
    distressLevel: DistressLevel
  ): ClosureRitual {
    // High distress closure: minimal, warm, no pressure
    if (distressLevel === 'high' || distressLevel === 'crisis') {
      return {
        acknowledgment: 'You\'ve been through something difficult.',
        validation: 'That took courage.',
        invitation: 'This work will be here when you\'re ready to return.',
        blessing: 'May you find ease.',
        noGuilt: true,
      };
    }

    // Work completed closure: honor the effort
    if (workDone) {
      return {
        acknowledgment: 'You showed up for this work today.',
        validation: 'That matters. Your effort is seen.',
        invitation: 'Return whenever you need. This space is yours.',
        blessing: 'May this reflection be a means of growth. Ameen.',
        noGuilt: true,
      };
    }

    // Incomplete session closure: gentle and open
    return {
      acknowledgment: 'Sometimes the work takes time.',
      validation: 'Coming here is enough for today.',
      invitation: 'You can pick this up whenever feels right.',
      blessing: 'May you be gentle with yourself.',
      noGuilt: true,
    };
  }

  /**
   * Format closure message
   */
  static formatClosureMessage(ritual: ClosureRitual): string {
    let message = `\n\n${ritual.acknowledgment}\n\n${ritual.validation}`;

    if (ritual.noGuilt) {
      message += `\n\n${ritual.invitation}`;
    }

    message += `\n\n${ritual.blessing}`;

    return message;
  }

  /**
   * Check if response needs simplification
   */
  static needsSimplification(
    responseText: string,
    pacingConfig: PacingConfig
  ): { needsSimplification: boolean; reason: string } {
    // Check length
    if (responseText.length > pacingConfig.maxResponseLength) {
      return {
        needsSimplification: true,
        reason: `Response too long (${responseText.length} chars, max ${pacingConfig.maxResponseLength})`,
      };
    }

    // Check sentence complexity (high distress should have short sentences)
    if (pacingConfig.maxResponseLength <= 200) {
      const sentences = responseText.split(/[.!?]+/);
      const longSentences = sentences.filter(s => s.length > 60);

      if (longSentences.length > 0) {
        return {
          needsSimplification: true,
          reason: 'Sentences too complex for high distress state',
        };
      }
    }

    return {
      needsSimplification: false,
      reason: '',
    };
  }

  /**
   * Simplify response for high distress
   */
  static simplifyResponse(responseText: string, maxLength: number): string {
    // Split into sentences
    const sentences = responseText.split(/[.!?]+/).filter(s => s.trim());

    // Take first sentences up to length limit
    let simplified = '';
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if ((simplified + trimmed).length <= maxLength) {
        simplified += (simplified ? '. ' : '') + trimmed;
      } else {
        break;
      }
    }

    return simplified + '.';
  }

  /**
   * Add gentle delay before response (simulates thoughtful presence)
   */
  static async applyGentleDelay(milliseconds: number): Promise<void> {
    if (milliseconds > 0) {
      await new Promise(resolve => setTimeout(resolve, milliseconds));
    }
  }

  /**
   * Get pacing guidance for AI prompt
   */
  static getPacingGuidanceForPrompt(config: PacingConfig): string {
    let guidance = '\n\nPACING GUIDANCE:\n';

    guidance += `- Maximum response length: ${config.maxResponseLength} characters\n`;
    guidance += `- Tone: ${config.toneGuidance}\n`;

    if (config.requiresPermission) {
      guidance += '- IMPORTANT: Ask permission before offering new perspectives\n';
    }

    if (config.softLanguage) {
      guidance += '- Use soft, invitational language (might, could, perhaps)\n';
      guidance += '- Avoid directive language (should, must, need to)\n';
    }

    if (!config.allowMultipleTopics) {
      guidance += '- Stay with ONE topic. Do not introduce new angles.\n';
    }

    if (config.showExitOption) {
      guidance += '- User needs option to pause. Include soft exit.\n';
    }

    if (config.maxResponseLength <= 250) {
      guidance += '- HIGH PRIORITY: Keep sentences SHORT and SIMPLE\n';
      guidance += '- One idea at a time. No complexity.\n';
    }

    return guidance;
  }
}

// =============================================================================
// PERMISSION CHECK SYSTEM
// =============================================================================

export class PermissionChecker {
  /**
   * Check if permission is needed for an action
   */
  static needsPermission(
    action: 'reframe' | 'clarify' | 'deepen' | 'practice' | 'close',
    distressLevel: DistressLevel,
    repetitionCount: number
  ): boolean {
    // Always need permission for reframing
    if (action === 'reframe') return true;

    // Need permission in high distress for any progression
    if (distressLevel === 'high' || distressLevel === 'crisis') {
      return action !== 'close';
    }

    // Need permission if repetition detected (user stuck)
    if (repetitionCount >= 2) {
      return action === 'deepen';
    }

    // Clarifying and practicing usually don't need explicit permission
    return false;
  }

  /**
   * Generate permission request
   */
  static generatePermissionRequest(
    action: 'reframe' | 'clarify' | 'deepen' | 'practice' | 'close',
    distressLevel: DistressLevel
  ): string {
    const highDistress = distressLevel === 'high' || distressLevel === 'crisis';

    const requests: Record<string, { normal: string; highDistress: string }> = {
      reframe: {
        normal: 'Would you like to explore a different perspective on this?',
        highDistress: 'Would you like me to offer another way to see this, or should we stay here a bit longer?',
      },
      clarify: {
        normal: 'Can I ask a few more questions to understand better?',
        highDistress: 'Is it okay if I ask one more question? Or would you rather I just listen?',
      },
      deepen: {
        normal: 'Would you like to go deeper into this?',
        highDistress: 'Is it okay to explore this a bit more? We can also stay where we are.',
      },
      practice: {
        normal: 'Would it help to think about a concrete next step?',
        highDistress: 'Would a small practice be helpful right now?',
      },
      close: {
        normal: 'Would you like to wrap up for now?',
        highDistress: 'Is this a good place to pause?',
      },
    };

    return highDistress ? requests[action].highDistress : requests[action].normal;
  }

  /**
   * Interpret user's permission response
   */
  static interpretPermissionResponse(userResponse: string): 'granted' | 'denied' | 'unclear' {
    const lower = userResponse.toLowerCase().trim();

    // Clear grants
    const grantWords = ['yes', 'yeah', 'sure', 'ok', 'okay', 'please', 'go ahead', 'continue'];
    if (grantWords.some(word => lower.includes(word))) {
      return 'granted';
    }

    // Clear denials
    const denyWords = ['no', 'not yet', 'stay here', 'keep listening', 'pause'];
    if (denyWords.some(word => lower.includes(word))) {
      return 'denied';
    }

    // If user asks a question or changes topic, treat as unclear
    if (lower.includes('?')) {
      return 'unclear';
    }

    // Default to unclear if we can't tell
    return 'unclear';
  }
}

// =============================================================================
// PRESSURE REMOVAL SYSTEM
// =============================================================================

/**
 * Gamification elements to REMOVE or SOFTEN
 */
export const PRESSURE_ELEMENTS_TO_REMOVE = {
  remove: [
    'Streak guilt language ("Don\'t break your streak!")',
    'Performance metrics ("You\'re doing better than 80% of users")',
    'Completion pressure ("Finish this module to unlock...")',
    'Urgency language ("Complete today to...")',
    'Comparison to others',
    'Achievement badges for vulnerable work',
  ],
  soften: [
    'Progress tracking → Reframe as "Your journey" not "% complete"',
    'Check-ins → "Come back when ready" not "Daily reminder"',
    'Streaks → Show as history, not as pressure metric',
    'Goals → Frame as intentions, not mandates',
  ],
};

/**
 * Transform pressure language to invitation language
 */
export function transformPressureToInvitation(text: string): string {
  const transformations: Array<{ from: RegExp; to: string }> = [
    { from: /you should/gi, to: 'you might' },
    { from: /you must/gi, to: 'you could' },
    { from: /you need to/gi, to: 'it might help to' },
    { from: /don't break your streak/gi, to: 'welcome back whenever' },
    { from: /keep going/gi, to: 'take your time' },
    { from: /try harder/gi, to: 'be gentle with yourself' },
    { from: /you have to/gi, to: 'you might try' },
    { from: /complete this/gi, to: 'explore this if you\'d like' },
  ];

  let transformed = text;
  for (const { from, to } of transformations) {
    transformed = transformed.replace(from, to);
  }

  return transformed;
}

/**
 * Check if text contains pressure language
 */
export function detectPressure(text: string): { hasPressure: boolean; examples: string[] } {
  const pressurePatterns = [
    'you should',
    'you must',
    'you need to',
    'you have to',
    'don\'t break',
    'keep going',
    'try harder',
    'push yourself',
    'stay consistent',
    'don\'t give up',
  ];

  const examples: string[] = [];
  const lower = text.toLowerCase();

  for (const pattern of pressurePatterns) {
    if (lower.includes(pattern)) {
      examples.push(pattern);
    }
  }

  return {
    hasPressure: examples.length > 0,
    examples,
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate session duration from start time
 */
export function calculateSessionDuration(startTime: Date): number {
  const now = new Date();
  const durationMs = now.getTime() - startTime.getTime();
  return Math.floor(durationMs / 1000 / 60); // minutes
}

/**
 * Format duration for display
 */
export function formatDuration(minutes: number): string {
  if (minutes < 1) return 'less than a minute';
  if (minutes === 1) return '1 minute';
  if (minutes < 60) return `${minutes} minutes`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }

  return `${hours} hour${hours > 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
}
