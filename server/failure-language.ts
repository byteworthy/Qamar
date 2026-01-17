/**
 * Failure Language System for Noor CBT
 * 
 * PRIORITY 2: User-facing language for system interventions and pauses
 * 
 * Design Principles:
 * - Calm
 * - Non-alarming
 * - Non-technical
 * - Reassuring without dependency
 * 
 * The system protects without explaining itself defensively.
 * 
 * Last Updated: 2026-01-17
 */

import type { DistressLevel } from '../shared/islamic-framework';

// =============================================================================
// FAILURE LANGUAGE LIBRARY
// =============================================================================

export class FailureLanguage {
  /**
   * When the system needs to pause for safety reasons
   * Used for: Charter violations, technical errors, AI failures
   */
  static systemPause(): string {
    return 'Let me take a moment to respond more carefully.';
  }

  /**
   * When the AI response needs refinement
   * Used for: Tone violations, pacing issues, content governance failures
   */
  static needsRefinement(distressLevel: DistressLevel): string {
    if (distressLevel === 'high' || distressLevel === 'crisis') {
      return 'I want to make sure I respond with the care you deserve. Give me one moment.';
    }

    return 'I want to get this right. Let me rephrase that.';
  }

  /**
   * When reframing permission is declined
   * Used for: User says no to perspective shift
   */
  static reframingDeclined(): string {
    return 'That\'s okay. You know what feels right for you.';
  }

  /**
   * When pacing needs to slow down
   * Used for: High distress with complex content
   */
  static pacingSlowed(): string {
    return 'Let\'s slow down. What matters most right now?';
  }

  /**
   * When repetition is detected and needs interruption
   * Used for: Rumination loops
   */
  static repetitionInterrupt(): string {
    return 'I notice we\'re circling back. What if we tried a different angle?';
  }

  /**
   * When scrupulosity is detected and engagement must stop
   * Used for: Waswasa patterns
   */
  static scrupulosityBoundary(): string {
    return 'I notice this question is pulling you deeper into the spiral. Let\'s step back from the content and look at the pattern itself.';
  }

  /**
   * When Islamic content is temporarily withheld
   * Used for: Post-crisis cooling period
   */
  static contentWithheld(): string {
    return 'Let\'s stay with what you\'re feeling right now. We can explore deeper meaning when you\'re ready.';
  }

  /**
   * When the system cannot proceed safely
   * Used for: Unresolvable safety conflicts
   */
  static cannotProceed(): string {
    return 'I want to support you, but I\'m not the right fit for what you\'re going through right now. Please consider reaching out to a qualified professional.';
  }

  /**
   * When practice is paused due to distress
   * Used for: Meditation/breathing exercises during crisis
   */
  static practicePaused(): string {
    return 'Let\'s pause this practice. What you\'re experiencing needs attention first.';
  }

  /**
   * When insight generation is blocked
   * Used for: Complex analysis during high distress
   */
  static insightDeferred(): string {
    return 'Your mind is working hard right now. Let\'s focus on what helps you feel steady before we dig deeper.';
  }

  /**
   * Generic calm redirect
   * Used for: Unclear situations that need graceful handling
   */
  static calmRedirect(): string {
    return 'Tell me what\'s happening for you right now.';
  }
}

// =============================================================================
// CONTEXT-AWARE FAILURE MESSAGING
// =============================================================================

export class ContextualFailureLanguage {
  /**
   * Get appropriate failure message based on context
   */
  static getMessage(
    failureType: 'system' | 'refinement' | 'boundary' | 'deferral',
    context: {
      distressLevel: DistressLevel;
      conversationPhase: 'early' | 'middle' | 'late';
      previousFailures: number;
    }
  ): string {
    // If multiple failures, escalate concern
    if (context.previousFailures >= 2) {
      return FailureLanguage.cannotProceed();
    }

    switch (failureType) {
      case 'system':
        return FailureLanguage.systemPause();
      
      case 'refinement':
        return FailureLanguage.needsRefinement(context.distressLevel);
      
      case 'boundary':
        return context.distressLevel === 'crisis'
          ? FailureLanguage.cannotProceed()
          : FailureLanguage.calmRedirect();
      
      case 'deferral':
        return context.conversationPhase === 'early'
          ? FailureLanguage.calmRedirect()
          : FailureLanguage.insightDeferred();
      
      default:
        return FailureLanguage.systemPause();
    }
  }
}

// =============================================================================
// PROGRESSIVE DISCLOSURE FOR FAILURES
// =============================================================================

export class ProgressiveFailureDisclosure {
  /**
   * Track failure count and escalate language appropriately
   */
  private static failureCounts = new Map<string, number>();

  static getProgressiveMessage(
    userId: string,
    sessionId: string,
    baseMessage: string
  ): string {
    const key = `${userId}:${sessionId}`;
    const count = this.failureCounts.get(key) || 0;
    
    this.failureCounts.set(key, count + 1);

    // First failure: gentle pause
    if (count === 0) {
      return baseMessage;
    }

    // Second failure: add acknowledgment
    if (count === 1) {
      return 'I\'m still working to get this right. ' + baseMessage;
    }

    // Third+ failure: escalate to cannot proceed
    return FailureLanguage.cannotProceed();
  }

  static resetCount(userId: string, sessionId: string): void {
    const key = `${userId}:${sessionId}`;
    this.failureCounts.delete(key);
  }

  static clearAll(): void {
    this.failureCounts.clear();
  }
}

// =============================================================================
// CRISIS-SPECIFIC LANGUAGE
// =============================================================================

export class CrisisLanguage {
  /**
   * Immediate crisis intervention language
   */
  static immediateCrisis(): string {
    return `You're in a lot of pain right now. Please reach out for immediate support:

**988 Suicide & Crisis Lifeline** (call or text 988)
Available 24/7 for anyone in crisis.

**Crisis Text Line**: Text HOME to 741741

You matter. You deserve support that can meet you in this moment.`;
  }

  /**
   * Urgent concern language
   */
  static urgentConcern(): string {
    return `This sounds really heavy. You don't have to carry this alone.

If you're having thoughts of self-harm:
**988 Suicide & Crisis Lifeline** (call or text 988)

You're worth more care than I can give right now. Please reach out.`;
  }

  /**
   * Post-crisis stabilization language
   */
  static postCrisisStabilization(): string {
    return 'I\'m glad you\'re still here. How are you feeling right now?';
  }

  /**
   * Crisis cooling period explanation
   */
  static coolingPeriodExplanation(): string {
    return 'Let\'s stay focused on keeping you steady right now. We can explore other things when you\'re ready.';
  }
}

// =============================================================================
// PERMISSION-BASED LANGUAGE
// =============================================================================

export class PermissionLanguage {
  /**
   * Request permission to continue
   */
  static requestContinuation(): string {
    return 'Would it be okay if we looked at this from a different angle?';
  }

  /**
   * Acknowledge declined permission
   */
  static acknowledgeDecline(): string {
    return 'That\'s completely okay. What would be more helpful right now?';
  }

  /**
   * Request permission to slow down
   */
  static requestSlowdown(): string {
    return 'There\'s a lot here. Is it okay if we take this one piece at a time?';
  }

  /**
   * Request permission for deeper work
   */
  static requestDepth(): string {
    return 'Would you like to explore what might be underneath this feeling?';
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const SystemLanguage = {
  failure: FailureLanguage,
  contextual: ContextualFailureLanguage,
  progressive: ProgressiveFailureDisclosure,
  crisis: CrisisLanguage,
  permission: PermissionLanguage,
};
