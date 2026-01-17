/**
 * Conversation State Machine for Noor CBT
 * 
 * Charter Version: 1.0
 * Charter URL: /AI_ISLAMIC_SAFETY_CHARTER.md
 * Last Reviewed: 2026-01-17
 * 
 * This module implements a formal state machine that governs
 * conversation flow, ensuring the AI respects emotional pacing
 * and never rushes users through difficult moments.
 * 
 * Core Principle: "No reframing before reflection."
 */

import type { EmotionalState, DistressLevel } from '../shared/islamic-framework';
import { detectCrisis, type CrisisDetectionResult } from './ai-safety';
import { PatternDetector } from './conversational-ai';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Conversation states that govern AI behavior
 */
export type ConversationState =
  | 'listening'       // Initial: Acknowledging and detecting
  | 'reflection'      // Understanding and validating
  | 'clarification'   // Asking follow-up questions
  | 'reframing'       // Transforming perspective (requires permission)
  | 'grounding'       // Closing with practice
  | 'closure'         // Session complete
  | 'crisis'          // Safety mode - all other states suspended
  | 'pause';          // User requested break

/**
 * Events that can trigger state transitions
 */
export type TransitionEvent =
  | 'user_input_received'
  | 'emotion_validated'
  | 'clarification_needed'
  | 'clarification_received'
  | 'permission_granted'
  | 'permission_denied'
  | 'reframe_accepted'
  | 'reframe_rejected'
  | 'grounding_complete'
  | 'user_requests_pause'
  | 'user_resumes'
  | 'crisis_detected'
  | 'crisis_resolved'
  | 'session_complete'
  | 'repetition_detected'
  | 'timeout';

/**
 * Result of a state transition attempt
 */
export interface TransitionResult {
  allowed: boolean;
  reason?: string;
  suggestedAction?: string;
  newState?: ConversationState;
  requiresPermission?: boolean;
}

/**
 * Rule defining a valid transition
 */
export interface TransitionRule {
  from: ConversationState;
  to: ConversationState;
  event: TransitionEvent;
  conditions: string[];
  forbidden: string[];
  requiresPermission?: boolean;
}

/**
 * Conversation context for state decisions
 */
export interface ConversationContext {
  currentState: ConversationState;
  previousState?: ConversationState;
  emotionalState?: EmotionalState;
  distressLevel?: DistressLevel;
  crisisStatus?: CrisisDetectionResult;
  repetitionCount: number;
  interactionCount: number;
  permissionGranted: boolean;
  validationGiven: boolean;
  sessionStartTime: Date;
  lastStateChange: Date;
}

// =============================================================================
// STATE TRANSITION RULES
// =============================================================================

/**
 * Defines all valid state transitions
 * 
 * Key Rules:
 * 1. No reframing before reflection
 * 2. No advice escalation without user consent
 * 3. Repetition triggers slowing, not pushing
 * 4. Crisis supersedes all other states
 */
export const STATE_TRANSITION_RULES: TransitionRule[] = [
  // =====================
  // FROM: LISTENING
  // =====================
  {
    from: 'listening',
    to: 'reflection',
    event: 'emotion_validated',
    conditions: ['User has expressed thought', 'Emotional state detected'],
    forbidden: ['Skip directly to reframing'],
  },
  {
    from: 'listening',
    to: 'clarification',
    event: 'clarification_needed',
    conditions: ['User input unclear', 'More context needed'],
    forbidden: ['Assume understanding without asking'],
  },
  {
    from: 'listening',
    to: 'crisis',
    event: 'crisis_detected',
    conditions: ['Crisis keywords detected', 'Emergency or urgent level'],
    forbidden: ['Continue normal flow'],
  },
  {
    from: 'listening',
    to: 'pause',
    event: 'user_requests_pause',
    conditions: ['User explicitly requests break'],
    forbidden: ['Pressure to continue'],
  },

  // =====================
  // FROM: REFLECTION
  // =====================
  {
    from: 'reflection',
    to: 'reframing',
    event: 'permission_granted',
    conditions: ['User feels heard', 'Validation acknowledged', 'Permission asked and granted'],
    forbidden: ['Reframe before validation', 'Skip permission in high distress'],
    requiresPermission: true,
  },
  {
    from: 'reflection',
    to: 'clarification',
    event: 'clarification_needed',
    conditions: ['Deeper understanding needed', 'Pattern unclear'],
    forbidden: ['Push forward without clarity'],
  },
  {
    from: 'reflection',
    to: 'listening',
    event: 'user_input_received',
    conditions: ['User shares more', 'New layer uncovered'],
    forbidden: ['Rush past new disclosure'],
  },
  {
    from: 'reflection',
    to: 'grounding',
    event: 'permission_denied',
    conditions: ['User not ready for reframe', 'Proceed to grounding instead'],
    forbidden: ['Force reframe anyway'],
  },
  {
    from: 'reflection',
    to: 'crisis',
    event: 'crisis_detected',
    conditions: ['Crisis emerges during reflection'],
    forbidden: ['Continue reflection'],
  },

  // =====================
  // FROM: CLARIFICATION
  // =====================
  {
    from: 'clarification',
    to: 'reflection',
    event: 'clarification_received',
    conditions: ['User provided clarity', 'Understanding deepened'],
    forbidden: ['Jump to conclusions'],
  },
  {
    from: 'clarification',
    to: 'listening',
    event: 'user_input_received',
    conditions: ['User redirects conversation', 'New topic emerges'],
    forbidden: ['Ignore redirection'],
  },

  // =====================
  // FROM: REFRAMING
  // =====================
  {
    from: 'reframing',
    to: 'grounding',
    event: 'reframe_accepted',
    conditions: ['User resonates with new perspective', 'Ready for integration'],
    forbidden: ['Pile on more reframes'],
  },
  {
    from: 'reframing',
    to: 'reflection',
    event: 'reframe_rejected',
    conditions: ['Reframe doesn\'t land', 'Return to validation'],
    forbidden: ['Push rejected reframe'],
  },
  {
    from: 'reframing',
    to: 'listening',
    event: 'user_input_received',
    conditions: ['User shares new thought', 'Different angle needed'],
    forbidden: ['Ignore new disclosure'],
  },

  // =====================
  // FROM: GROUNDING
  // =====================
  {
    from: 'grounding',
    to: 'closure',
    event: 'grounding_complete',
    conditions: ['Practice offered', 'User has next step'],
    forbidden: ['Add more content'],
  },
  {
    from: 'grounding',
    to: 'listening',
    event: 'user_input_received',
    conditions: ['User wants to continue', 'More work needed'],
    forbidden: ['Force closure'],
  },

  // =====================
  // FROM: CLOSURE
  // =====================
  {
    from: 'closure',
    to: 'listening',
    event: 'user_input_received',
    conditions: ['User starts new topic', 'Session continues'],
    forbidden: ['End session abruptly'],
  },

  // =====================
  // FROM: CRISIS
  // =====================
  {
    from: 'crisis',
    to: 'listening',
    event: 'crisis_resolved',
    conditions: ['Resources provided', 'User safe', 'Explicit signal to continue'],
    forbidden: ['Return to CBT without confirmation'],
  },
  {
    from: 'crisis',
    to: 'closure',
    event: 'session_complete',
    conditions: ['Resources provided', 'User disengaging'],
    forbidden: ['Push for more interaction'],
  },

  // =====================
  // FROM: PAUSE
  // =====================
  {
    from: 'pause',
    to: 'listening',
    event: 'user_resumes',
    conditions: ['User signals readiness', 'Soft reentry'],
    forbidden: ['Pressure to resume'],
  },
];

// =============================================================================
// CONVERSATION STATE MACHINE
// =============================================================================

export class ConversationStateMachine {
  private context: ConversationContext;

  constructor() {
    this.context = this.createInitialContext();
  }

  /**
   * Create initial conversation context
   */
  private createInitialContext(): ConversationContext {
    const now = new Date();
    return {
      currentState: 'listening',
      repetitionCount: 0,
      interactionCount: 0,
      permissionGranted: false,
      validationGiven: false,
      sessionStartTime: now,
      lastStateChange: now,
    };
  }

  /**
   * Get current state
   */
  getCurrentState(): ConversationState {
    return this.context.currentState;
  }

  /**
   * Get full context
   */
  getContext(): ConversationContext {
    return { ...this.context };
  }

  /**
   * Update context without changing state
   */
  updateContext(updates: Partial<ConversationContext>): void {
    this.context = {
      ...this.context,
      ...updates,
    };
  }

  /**
   * Check if a transition is allowed
   */
  canTransitionTo(nextState: ConversationState, event: TransitionEvent): TransitionResult {
    const rule = STATE_TRANSITION_RULES.find(
      r => r.from === this.context.currentState && r.to === nextState && r.event === event
    );

    if (!rule) {
      return {
        allowed: false,
        reason: `No valid transition from ${this.context.currentState} to ${nextState} via ${event}`,
        suggestedAction: this.suggestValidTransition(this.context.currentState),
      };
    }

    // Check special conditions
    if (rule.requiresPermission && !this.context.permissionGranted) {
      return {
        allowed: false,
        reason: 'Permission required for this transition',
        suggestedAction: 'Ask user for permission before proceeding',
        requiresPermission: true,
      };
    }

    // Check if reframing without validation
    if (nextState === 'reframing' && !this.context.validationGiven) {
      return {
        allowed: false,
        reason: 'Charter Rule: No reframing before reflection and validation',
        suggestedAction: 'Validate user\'s feelings first',
      };
    }

    return {
      allowed: true,
      newState: nextState,
    };
  }

  /**
   * Attempt to transition to a new state
   */
  transition(nextState: ConversationState, event: TransitionEvent): TransitionResult {
    const canTransition = this.canTransitionTo(nextState, event);

    if (!canTransition.allowed) {
      return canTransition;
    }

    // Perform transition
    this.context.previousState = this.context.currentState;
    this.context.currentState = nextState;
    this.context.lastStateChange = new Date();
    this.context.interactionCount++;

    // Reset permission on state change
    if (nextState !== 'reframing') {
      this.context.permissionGranted = false;
    }

    return {
      allowed: true,
      newState: nextState,
    };
  }

  /**
   * Force transition to crisis state (bypasses normal rules)
   */
  enterCrisis(crisisStatus: CrisisDetectionResult): void {
    this.context.previousState = this.context.currentState;
    this.context.currentState = 'crisis';
    this.context.crisisStatus = crisisStatus;
    this.context.lastStateChange = new Date();
  }

  /**
   * Mark that user has been validated (enables reframing)
   */
  markValidationGiven(): void {
    this.context.validationGiven = true;
  }

  /**
   * Mark that user granted permission for reframing
   */
  grantPermission(): void {
    this.context.permissionGranted = true;
  }

  /**
   * Record a repetition
   */
  recordRepetition(): void {
    this.context.repetitionCount++;
  }

  /**
   * Check if repetition slowing is needed
   */
  needsRepetitionSlowing(): boolean {
    return this.context.repetitionCount >= 2;
  }

  /**
   * Suggest a valid transition from current state
   */
  private suggestValidTransition(fromState: ConversationState): string {
    const validTransitions = STATE_TRANSITION_RULES
      .filter(r => r.from === fromState)
      .map(r => `${r.to} (via ${r.event})`);

    if (validTransitions.length === 0) {
      return 'No valid transitions available';
    }

    return `Valid transitions: ${validTransitions.join(', ')}`;
  }

  /**
   * Get appropriate response guidance for current state
   */
  getStateGuidance(): StateGuidance {
    return STATE_GUIDANCE[this.context.currentState];
  }

  /**
   * Check if we should ask permission before reframing
   */
  shouldAskPermission(): boolean {
    // Always ask permission in high distress
    if (this.context.distressLevel === 'high' || this.context.distressLevel === 'crisis') {
      return true;
    }

    // Ask if repetition detected (user may be stuck)
    if (this.needsRepetitionSlowing()) {
      return true;
    }

    // Default: ask if moving from reflection to reframing
    return this.context.currentState === 'reflection' && !this.context.permissionGranted;
  }

  /**
   * Reset for new session
   */
  reset(): void {
    this.context = this.createInitialContext();
  }
}

// =============================================================================
// STATE GUIDANCE
// =============================================================================

export interface StateGuidance {
  purpose: string;
  toneEmphasis: string[];
  doThis: string[];
  avoidThis: string[];
  transitionCues: string[];
  samplePhrases: string[];
}

export const STATE_GUIDANCE: Record<ConversationState, StateGuidance> = {
  listening: {
    purpose: 'Acknowledge and detect what the user is experiencing',
    toneEmphasis: ['Curious', 'Open', 'Non-judgmental', 'Inviting'],
    doThis: [
      'Acknowledge what they shared',
      'Reflect back key emotions',
      'Stay open to more',
      'Detect distress level',
    ],
    avoidThis: [
      'Rushing to analysis',
      'Offering solutions',
      'Minimizing feelings',
      'Interpreting too quickly',
    ],
    transitionCues: [
      'User has fully expressed thought',
      'Emotional state is clear',
      'Ready for validation',
    ],
    samplePhrases: [
      'I hear you.',
      'That sounds heavy.',
      'Tell me more about that.',
      'What\'s the hardest part?',
    ],
  },

  reflection: {
    purpose: 'Deeply understand and validate the user\'s experience',
    toneEmphasis: ['Warm', 'Validating', 'Understanding', 'Compassionate'],
    doThis: [
      'Validate the emotion explicitly',
      'Summarize what you understand',
      'Check your understanding',
      'Normalize their experience',
    ],
    avoidThis: [
      'Moving to reframe too quickly',
      'Skipping validation',
      'Making assumptions',
      'Correcting their perception',
    ],
    transitionCues: [
      'User feels heard (they say so or relax)',
      'User asks for perspective',
      'Natural opening for reframe',
    ],
    samplePhrases: [
      'That makes complete sense given what you\'re going through.',
      'So what I\'m hearing is...',
      'Anyone in your situation would feel this way.',
      'Your feelings are valid.',
    ],
  },

  clarification: {
    purpose: 'Gather more information to understand fully',
    toneEmphasis: ['Curious', 'Gentle', 'Patient', 'Non-pressuring'],
    doThis: [
      'Ask open-ended questions',
      'Invite without demanding',
      'Show genuine curiosity',
      'Accept if they don\'t want to share',
    ],
    avoidThis: [
      'Interrogating',
      'Making them feel judged',
      'Assuming answers',
      'Multiple questions at once',
    ],
    transitionCues: [
      'User provides clarity',
      'User redirects',
      'Enough context gathered',
    ],
    samplePhrases: [
      'What\'s underneath this feeling?',
      'When did this thought first appear?',
      'What does this say about what you believe?',
      'Is there more you\'d like to share?',
    ],
  },

  reframing: {
    purpose: 'Offer alternative perspective (only after validation and permission)',
    toneEmphasis: ['Gentle', 'Invitational', 'Curious', 'Non-imposing'],
    doThis: [
      'Ask permission first',
      'Offer perspective as possibility, not truth',
      'Connect to their values',
      'Be ready to withdraw if rejected',
    ],
    avoidThis: [
      'Forcing new perspective',
      'Dismissing original thought',
      'Stacking multiple reframes',
      'Being prescriptive',
    ],
    transitionCues: [
      'User resonates with new view',
      'User rejects reframe (return to reflection)',
      'Ready for grounding',
    ],
    samplePhrases: [
      'Would you like me to offer a different perspective?',
      'What if this thought isn\'t the whole story?',
      'Here\'s another angle - take it or leave it.',
      'How does this alternative feel?',
    ],
  },

  grounding: {
    purpose: 'Integrate insights and prepare for action',
    toneEmphasis: ['Encouraging', 'Practical', 'Grounded', 'Hopeful'],
    doThis: [
      'Offer concrete next step',
      'Connect to spiritual practice if appropriate',
      'Keep it simple and doable',
      'Infuse gentle hope',
    ],
    avoidThis: [
      'Adding complexity',
      'Creating pressure',
      'Making unrealistic plans',
      'Forcing spiritual content',
    ],
    transitionCues: [
      'User has a takeaway',
      'Natural close point',
      'Session energy winding down',
    ],
    samplePhrases: [
      'What\'s one small thing you could try today?',
      'This work you did matters.',
      'Your effort is seen.',
      'Take this with you gently.',
    ],
  },

  closure: {
    purpose: 'Complete session with care and soft exit',
    toneEmphasis: ['Warm', 'Complete', 'No pressure', 'Welcoming return'],
    doThis: [
      'Summarize briefly if helpful',
      'Honor their work',
      'Invite return without pressure',
      'End with mercy',
    ],
    avoidThis: [
      'Guilt about not finishing',
      'Pressure to return',
      'Adding more content',
      'Abrupt ending',
    ],
    transitionCues: [
      'Session complete',
      'User disengages',
      'Natural endpoint',
    ],
    samplePhrases: [
      'This work will be here when you\'re ready.',
      'May this reflection be a means of growth.',
      'You showed up. That matters.',
      'Return whenever you need.',
    ],
  },

  crisis: {
    purpose: 'Safety mode - provide resources and care',
    toneEmphasis: ['Calm', 'Clear', 'Direct', 'Compassionate'],
    doThis: [
      'Provide crisis resources immediately',
      'Express care simply',
      'Stay present without overwhelming',
      'Do NOT continue CBT',
    ],
    avoidThis: [
      'Continuing normal flow',
      'Analyzing the thought',
      'Offering reframes',
      'Religious platitudes',
    ],
    transitionCues: [
      'User indicates safety',
      'Resources accepted',
      'Explicit permission to continue',
    ],
    samplePhrases: [
      'You\'re in a lot of pain right now.',
      'Please reach out: 988 (call or text) for 24/7 support.',
      'I\'m here, but you deserve more support than I can give.',
      'You matter.',
    ],
  },

  pause: {
    purpose: 'Honor user\'s need for break',
    toneEmphasis: ['Respectful', 'Warm', 'Non-pressuring', 'Welcoming'],
    doThis: [
      'Acknowledge their need',
      'Make return easy',
      'No guilt',
      'Stay available',
    ],
    avoidThis: [
      'Guilt about leaving',
      'Questions about why',
      'Pushing to continue',
      'Minimizing their need',
    ],
    transitionCues: [
      'User signals readiness',
      'User returns',
      'Session ends',
    ],
    samplePhrases: [
      'That\'s okay. Take your time.',
      'This will be here when you\'re ready.',
      'Taking a break is part of the process.',
      'Welcome back whenever.',
    ],
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Create a new conversation state machine
 */
export function createConversationStateMachine(): ConversationStateMachine {
  return new ConversationStateMachine();
}

/**
 * Get transition permission phrase
 */
export function getPermissionPhrase(distressLevel?: DistressLevel): string {
  if (distressLevel === 'high' || distressLevel === 'crisis') {
    return 'Would you like me to offer a different perspective, or should we stay here a bit longer?';
  }

  return 'Would you like to explore a different angle on this?';
}

/**
 * Get state transition message
 */
export function getTransitionMessage(fromState: ConversationState, toState: ConversationState): string {
  const messages: Record<string, Record<string, string>> = {
    listening: {
      reflection: 'Let me make sure I understand what you\'re experiencing.',
      clarification: 'I want to understand better.',
      crisis: 'I hear you, and I want you to know help is available.',
    },
    reflection: {
      reframing: 'I\'d like to offer a different perspective, if you\'re open to it.',
      grounding: 'Let\'s bring this to something you can carry forward.',
      listening: 'Tell me more about that.',
    },
    reframing: {
      grounding: 'Let\'s make this practical.',
      reflection: 'Let\'s come back to where you are.',
    },
    grounding: {
      closure: 'This work matters.',
    },
  };

  return messages[fromState]?.[toState] || '';
}
