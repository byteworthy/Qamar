type InnerState = 
  | "tightness_around_provision"
  | "fear_of_loss"
  | "shame_after_sin"
  | "justified_anger"
  | "feeling_unseen"
  | "confusion_effort_control"
  | "overwhelming_gratitude"
  | "unknown";

interface StateInference {
  state: InnerState;
  confidence: number;
}

const STATE_PATTERNS: Record<InnerState, RegExp[]> = {
  tightness_around_provision: [
    /\b(money|income|job|salary|bills|rent|expenses|afford|poor|broke|financial)\b/i,
    /\b(rizq|provision|sustenance|livelihood)\b/i,
    /\b(worried about|scared of|anxious about).*(future|finances|money)/i,
    /\b(won't be able to|can't afford|running out)\b/i,
  ],
  fear_of_loss: [
    /\b(lose|losing|lost|afraid of losing|scared to lose)\b/i,
    /\b(taken away|slip away|leave me|abandon)\b/i,
    /\b(death|dying|illness|sick|health)\b/i,
    /\b(relationship|marriage|divorce|separation)\b/i,
    /\b(hold on|can't let go|terrified of)\b/i,
  ],
  shame_after_sin: [
    /\b(sin|sinned|sins|sinning|haram|wrong|mistake)\b/i,
    /\b(ashamed|shame|guilt|guilty|regret|remorse)\b/i,
    /\b(Allah.*(forgive|angry|punish|disappointed))\b/i,
    /\b(how can I face|dirty|unclean|unworthy)\b/i,
    /\b(keep falling|can't stop|doing it again)\b/i,
  ],
  justified_anger: [
    /\b(unfair|unjust|wrong|not right)\b/i,
    /\b(angry|anger|furious|rage|mad)\b/i,
    /\b(they did|he did|she did|hurt me|betrayed)\b/i,
    /\b(deserve|owed|should have|supposed to)\b/i,
    /\b(why (did|would) (they|he|she))\b/i,
  ],
  feeling_unseen: [
    /\b(no one|nobody|alone|lonely|invisible|ignored)\b/i,
    /\b(doesn't see|don't see|doesn't care|don't care)\b/i,
    /\b(unnoticed|overlooked|forgotten|dismissed)\b/i,
    /\b(does anyone|does Allah).*(see|hear|care|know)\b/i,
    /\b(crying out|screaming|begging)\b/i,
  ],
  confusion_effort_control: [
    /\b(tried|trying|try so hard|doing everything)\b/i,
    /\b(nothing (works|changes|happens))\b/i,
    /\b(out of my (hands|control)|can't control)\b/i,
    /\b(what (more|else) (can|should) I do)\b/i,
    /\b(effort|work|struggle).*(not enough|useless|pointless)\b/i,
    /\b(why isn't|why won't|why doesn't).*(working|changing)\b/i,
  ],
  overwhelming_gratitude: [
    /\b(so blessed|too blessed|don't deserve)\b/i,
    /\b(grateful but|thankful but|blessed but)\b/i,
    /\b(why me|why would Allah).*(give|bless)\b/i,
    /\b(overwhelming|too much|can't believe)\b/i,
  ],
  unknown: [],
};

export function inferInnerState(thought: string): StateInference {
  if (!thought || thought.trim().length === 0) {
    return { state: "unknown", confidence: 0 };
  }

  const scores: Record<InnerState, number> = {
    tightness_around_provision: 0,
    fear_of_loss: 0,
    shame_after_sin: 0,
    justified_anger: 0,
    feeling_unseen: 0,
    confusion_effort_control: 0,
    overwhelming_gratitude: 0,
    unknown: 0,
  };

  for (const [state, patterns] of Object.entries(STATE_PATTERNS)) {
    if (state === "unknown") continue;
    for (const pattern of patterns) {
      if (pattern.test(thought)) {
        scores[state as InnerState] += 1;
      }
    }
  }

  let maxState: InnerState = "unknown";
  let maxScore = 0;

  for (const [state, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      maxState = state as InnerState;
    }
  }

  if (maxScore === 0) {
    return { state: "unknown", confidence: 0 };
  }

  const confidence = Math.min(maxScore / 3, 0.9);
  return { state: maxState, confidence };
}

export function getStatePromptModifier(state: InnerState): string {
  const modifiers: Record<InnerState, string> = {
    tightness_around_provision: `STATE AWARENESS: The user shows tightness around provision and sustenance.
- Gently acknowledge the weight of material uncertainty
- Reference that rizq is decreed but effort remains their responsibility
- Avoid suggesting outcomes are guaranteed by faith`,

    fear_of_loss: `STATE AWARENESS: The user shows fear of losing what they hold dear.
- Acknowledge the preciousness of what they fear losing
- Gently note that attachment and trust can coexist
- Avoid dismissing the fear or promising preservation`,

    shame_after_sin: `STATE AWARENESS: The user shows shame after perceived sin.
- Acknowledge the weight of regret without adding to it
- Reference that return is always open
- Avoid moralizing or adding guilt
- Do not minimize the struggle to change`,

    justified_anger: `STATE AWARENESS: The user shows anger that feels justified.
- Acknowledge that the situation may genuinely be unjust
- Distinguish between the injustice and the response to it
- Avoid dismissing anger or rushing to forgiveness language`,

    feeling_unseen: `STATE AWARENESS: The user feels unseen or unheard.
- Acknowledge the pain of invisibility
- Reference divine witnessing without dismissing human loneliness
- Avoid platitudes about Allah seeing everything`,

    confusion_effort_control: `STATE AWARENESS: The user is confused between effort and control.
- Acknowledge the exhaustion of sustained effort
- Clarify the boundary between responsibility and outcome
- Avoid suggesting more effort or passive acceptance`,

    overwhelming_gratitude: `STATE AWARENESS: The user feels overwhelmed by blessing.
- Acknowledge that gratitude can coexist with unworthiness feelings
- Reference that blessing is mercy, not transaction
- Avoid suggesting they must "earn" what they have`,

    unknown: `STATE AWARENESS: No specific inner state detected.
- Proceed with balanced, careful framing
- Let the content guide the tone`,
  };

  return modifiers[state] || modifiers.unknown;
}

const ASSUMPTION_PATTERNS = [
  {
    pattern: /\b(suffer|pain|hardship|difficulty).*(Allah.*(displeased|angry|punish|upset))\b/i,
    assumption: "If I suffer, Allah is displeased with me",
    reflection: "This thought assumes suffering signals divine displeasure, conflating hardship with punishment.",
  },
  {
    pattern: /\b(fail|failure|failed).*(unworthy|worthless|not good enough)\b/i,
    assumption: "If I fail, I am unworthy",
    reflection: "This thought ties worth to outcome, treating failure as identity rather than event.",
  },
  {
    pattern: /\b(anxious|anxiety|worried).*(something bad|bad will happen|going wrong)\b/i,
    assumption: "If I feel anxious, something bad will happen",
    reflection: "This thought treats anxiety as prophecy, confusing internal alarm with external reality.",
  },
  {
    pattern: /\b(patient|patience|waited|waiting).*(should|deserve|entitled|owed).*(change|better|result)\b/i,
    assumption: "If I am patient, outcomes should change",
    reflection: "This thought frames patience as transaction, expecting specific return for endurance.",
  },
  {
    pattern: /\b(good|good deeds|pray|worship|try).*(Allah.*(owe|should|must|give|reward))\b/i,
    assumption: "If I do good, Allah owes me ease",
    reflection: "This thought treats worship as exchange, expecting guaranteed worldly return for obedience.",
  },
  {
    pattern: /\b(dua|pray|prayed|asking).*(not answered|ignored|doesn't work)\b/i,
    assumption: "If my dua is not answered, I am not heard",
    reflection: "This thought equates non-answer with non-hearing, conflating response timing with rejection.",
  },
];

interface AssumptionDetection {
  detected: boolean;
  assumption: string | null;
  reflection: string | null;
}

export function detectAssumptionPattern(thought: string): AssumptionDetection {
  for (const { pattern, assumption, reflection } of ASSUMPTION_PATTERNS) {
    if (pattern.test(thought)) {
      return { detected: true, assumption, reflection };
    }
  }
  return { detected: false, assumption: null, reflection: null };
}

export function getAssumptionPromptModifier(detection: AssumptionDetection): string {
  if (!detection.detected) {
    return "";
  }

  return `ASSUMPTION PATTERN DETECTED: "${detection.assumption}"
Reflection frame: ${detection.reflection}

When generating the reframe:
- Name this assumption precisely but gently
- Test it clearly without moralizing
- Do not quote verses excessively
- Keep the response disciplined and precise`;
}
