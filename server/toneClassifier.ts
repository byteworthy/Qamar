type ToneMode = "thinkers" | "feelers" | "balanced";

interface ToneClassification {
  mode: ToneMode;
  confidence: number;
}

const EMOTIONAL_MARKERS = [
  "feel", "feeling", "felt", "hurts", "hurt", "pain", "painful",
  "scared", "afraid", "fear", "anxious", "anxiety", "worried", "worry",
  "sad", "sadness", "angry", "anger", "frustrated", "frustration",
  "overwhelmed", "exhausted", "tired", "lost", "alone", "lonely",
  "hopeless", "helpless", "worthless", "ashamed", "shame", "guilt",
  "heart", "soul", "heavy", "burden", "weight", "drowning", "suffocating",
  "crying", "tears", "broken", "crushed", "devastated", "miserable",
  "love", "miss", "missing", "longing", "yearn", "ache", "aching"
];

const ANALYTICAL_MARKERS = [
  "think", "thought", "thinking", "believe", "belief", "understand",
  "reason", "reasoning", "logic", "logical", "analyze", "analysis",
  "consider", "considering", "evaluate", "evaluating", "assess",
  "conclude", "conclusion", "assume", "assumption", "hypothesis",
  "because", "therefore", "however", "although", "despite",
  "evidence", "proof", "pattern", "structure", "system", "process",
  "question", "questioning", "wonder", "wondering", "curious",
  "decide", "decision", "choice", "option", "alternative",
  "cause", "effect", "consequence", "result", "outcome"
];

function countMarkers(text: string, markers: string[]): number {
  const lowerText = text.toLowerCase();
  let count = 0;
  for (const marker of markers) {
    const regex = new RegExp(`\\b${marker}\\b`, "gi");
    const matches = lowerText.match(regex);
    if (matches) {
      count += matches.length;
    }
  }
  return count;
}

function getAverageSentenceLength(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 0;
  const totalWords = sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0);
  return totalWords / sentences.length;
}

function hasAbstractLanguage(text: string): boolean {
  const abstractPatterns = [
    /\b(concept|idea|notion|principle|theory|philosophy)\b/i,
    /\b(always|never|everything|nothing|everyone|no one)\b/i,
    /\b(means|meaning|purpose|reason why)\b/i,
    /\b(should|must|ought|supposed to)\b/i
  ];
  return abstractPatterns.some(pattern => pattern.test(text));
}

function hasConcreteLanguage(text: string): boolean {
  const concretePatterns = [
    /\b(today|yesterday|this morning|last night|right now)\b/i,
    /\b(said|told|did|happened|went|came)\b/i,
    /\b(my (husband|wife|mother|father|child|friend|boss))\b/i,
    /\b(at work|at home|in the|when I)\b/i
  ];
  return concretePatterns.some(pattern => pattern.test(text));
}

export function classifyTone(text: string, previousReflections?: string[]): ToneClassification {
  if (!text || text.trim().length === 0) {
    return { mode: "balanced", confidence: 0 };
  }

  let emotionalScore = 0;
  let analyticalScore = 0;

  emotionalScore += countMarkers(text, EMOTIONAL_MARKERS) * 2;
  analyticalScore += countMarkers(text, ANALYTICAL_MARKERS) * 2;

  const avgSentenceLength = getAverageSentenceLength(text);
  if (avgSentenceLength > 15) {
    analyticalScore += 2;
  } else if (avgSentenceLength < 8) {
    emotionalScore += 1;
  }

  if (hasAbstractLanguage(text)) {
    analyticalScore += 2;
  }
  if (hasConcreteLanguage(text)) {
    emotionalScore += 1;
  }

  const exclamationCount = (text.match(/!/g) || []).length;
  const questionCount = (text.match(/\?/g) || []).length;
  emotionalScore += exclamationCount;
  analyticalScore += questionCount * 0.5;

  if (previousReflections && previousReflections.length > 0) {
    for (const prev of previousReflections.slice(-3)) {
      const prevEmotional = countMarkers(prev, EMOTIONAL_MARKERS);
      const prevAnalytical = countMarkers(prev, ANALYTICAL_MARKERS);
      emotionalScore += prevEmotional * 0.3;
      analyticalScore += prevAnalytical * 0.3;
    }
  }

  const total = emotionalScore + analyticalScore;
  
  if (total < 2) {
    return { mode: "balanced", confidence: 0.3 };
  }

  const emotionalRatio = emotionalScore / total;
  const analyticalRatio = analyticalScore / total;

  if (emotionalRatio > 0.65) {
    return { mode: "feelers", confidence: Math.min(emotionalRatio, 0.9) };
  } else if (analyticalRatio > 0.65) {
    return { mode: "thinkers", confidence: Math.min(analyticalRatio, 0.9) };
  } else {
    return { mode: "balanced", confidence: 0.5 };
  }
}

export function getTonePromptModifier(mode: ToneMode): string {
  switch (mode) {
    case "thinkers":
      return `TONE CALIBRATION: This user processes through structure and analysis.
- Emphasize sequencing, assumptions, and clarity language
- Use precise, testable framings
- Lead with the pattern or structure, then acknowledge emotion
- Example: "This thought is placing responsibility where control does not exist."`;

    case "feelers":
      return `TONE CALIBRATION: This user processes through emotional experience.
- Emphasize emotional naming, weight language, and acknowledgment
- Validate the feeling before testing the thought
- Use embodied, relational language
- Example: "It sounds heavy to carry everything as if it depends only on you."`;

    case "balanced":
    default:
      return `TONE CALIBRATION: Use balanced framing.
- Acknowledge emotion and clarify structure equally
- Neither overly analytical nor overly emotive`;
  }
}
