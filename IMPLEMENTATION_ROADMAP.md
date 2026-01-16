# Noor CBT Strategic Amplification Implementation Roadmap

## Executive Summary

This document provides a comprehensive implementation plan for transforming Noor CBT from a functional app into a deeply grounded therapeutic companion. The plan addresses four critical dimensions: CBT/NLP depth, Islamic grounding, AI conversational fluency, and AI safety.

**Current Status**: ~85% complete in terms of technical functionality, but lacking depth, cohesion, and intentional grounding.

**Goal**: Evolution, not expansion. Deepen existing flows without adding new screens or features.

---

## Phase 1: Foundation (COMPLETED ✓)

### 1.1 Islamic Psychological Framework ✓
**File**: `shared/islamic-framework.ts`

**What Was Built**:
- Complete Islamic concept library (niyyah, sabr, tawakkul, tazkiyah, etc.)
- Nafs states framework (ammara, lawwama, mutmainna)
- Qalb (heart) states model
- Quran ayat mapped to emotional states
- Sahih Hadith references for therapeutic contexts
- Tone and language guidelines
- Concept application rules
- Distress-level response matrix
- Spiritual bypassing detection

**Therapeutic Impact**:
- Islam is now epistemological, not decorative
- Every Islamic concept has CBT connection
- Clear rules for when/how to apply concepts
- Prevents spiritual bypassing and guilt-based motivation

**Integration Points**:
- Import into server routes for contextual Quran/Hadith selection
- Use in AI prompts for grounding
- Reference in UI for user education

---

### 1.2 AI Safety & Guardrails System ✓
**File**: `server/ai-safety.ts`

**What Was Built**:
- Crisis detection (emergency, urgent, concern levels)
- Self-harm keyword monitoring
- Crisis resources with Islamic context
- Religious scrupulosity detection (waswasa)
- Theological validation system
- Output validation with severity levels
- Prompt versioning manager
- AI boundaries documentation
- Logging with redaction
- Adaptive safety thresholds

**Safety Impact**:
- Zero-tolerance for harmful theological content
- Automatic crisis detection and resource provision
- Prevents spiritual bypassing in AI responses
- Protects against religious scrupulosity amplification
- Ensures HIPAA-compliant logging

**Integration Points**:
- Use `detectCrisis()` on every user input
- Use `validateAIOutput()` before returning responses
- Log safety events with `createSafeLogEntry()`
- Version all AI prompts with `PromptVersionManager`

---

### 1.3 Conversational AI State Model ✓
**File**: `server/conversational-ai.ts`

**What Was Built**:
- Four-mode conversational system (listening, reflection, reframing, grounding)
- Adaptive tone strategy based on distress level
- Fluency techniques (mirroring, bridging, metaphor, interruption)
- Pattern detection (repetition, avoidance)
- Transition management between modes
- Emotional intelligence helpers
- Response builder framework

**Conversational Impact**:
- AI adapts tone to user's emotional state
- Shorter sentences for high distress
- Pattern interruption for rumination
- Smooth transitions between CBT steps
- Feels like a guide, not a robot

**Integration Points**:
- Wrap all AI responses with `ConversationalResponseBuilder`
- Detect emotional intensity with `EmotionalIntelligence.detectIntensity()`
- Use `buildConversationalPromptModifier()` in AI prompts
- Apply `TransitionManager` between screens

---

## Phase 2: CBT Flow Enhancement (IN PROGRESS)

### 2.1 Enhanced ThoughtCapture Screen
**File**: `client/screens/ThoughtCaptureScreen.tsx`

**Required Additions**:
1. **Emotional Anchoring**
   - Add emotional intensity slider (1-10)
   - Add somatic awareness prompt: "Where do you feel this in your body?"
   - Detect emotional state with NLP before proceeding

2. **Niyyah Integration**
   - Add subtle prompt: "Make your intention for Allah's pleasure"
   - Frame cognitive work as spiritual practice
   - Connect CBT to tazkiyah (purification)

**Implementation Steps**:
```typescript
// Add state for emotional data
const [emotionalIntensity, setEmotionalIntensity] = useState(5);
const [somaticAwareness, setSomaticAwareness] = useState('');

// Add intensity slider component
<Slider
  value={emotionalIntensity}
  onValueChange={setEmotionalIntensity}
  minimumValue={1}
  maximumValue={10}
  step={1}
/>

// Add somatic prompt
<TextInput
  placeholder="Where do you feel this in your body?"
  value={somaticAwareness}
  onChangeText={setSomaticAwareness}
/>

// Pass to navigation
navigation.navigate("Distortion", { 
  thought, 
  emotionalIntensity, 
  somaticAwareness 
});
```

---

### 2.2 Enhanced DistortionScreen with Spectrum Analysis
**File**: `client/screens/DistortionScreen.tsx`

**Required Changes**:
1. **Spectrum Instead of Binary**
   - Show distortion intensity (0-100%)
   - Multiple distortions with weights
   - Visual representation of distortion strength

2. **Crisis Detection Integration**
   - Check for crisis language before analysis
   - Show crisis resources if detected
   - Pause CBT flow for safety

3. **Belief Inspection Preview**
   - Add question: "How strongly do you believe this thought? (0-100%)"
   - Tease belief inspection layer

**API Changes Required**:
```typescript
// Update /api/analyze response
interface AnalysisResult {
  distortions: Array<{
    name: string;
    intensity: number; // 0-100
    explanation: string;
  }>;
  happening: string;
  pattern: string[];
  matters: string;
  crisisDetected?: {
    level: 'emergency' | 'urgent' | 'concern';
    resources: Resource[];
  };
}
```

---

### 2.3 New Screen: Belief Inspection Layer
**File**: `client/screens/BeliefInspectionScreen.tsx` (NEW)

**Purpose**: Bridge between distortion detection and reframing

**Content**:
1. "What does this thought say about what you believe?"
2. Belief strength slider (0-100%)
3. Pattern interruption question: "What if this thought is only 60% true?"
4. Future pacing: "How might this belief change your next hour?"

**Navigation Flow**:
```
ThoughtCapture → Distortion → BeliefInspection → Reframe → Regulation → Intention → Complete
```

**Implementation**:
```typescript
export default function BeliefInspectionScreen() {
  const [beliefStrength, setBeliefStrength] = useState(80);
  const [underlyingBelief, setUnderlyingBelief] = useState('');

  return (
    <Screen>
      <ThemedText type="h3">
        What does this thought say about what you believe?
      </ThemedText>
      
      <TextInput
        multiline
        placeholder="The belief underneath this thought is..."
        value={underlyingBelief}
        onChangeText={setUnderlyingBelief}
      />

      <ThemedText type="body">
        How strongly do you believe this? (0-100%)
      </ThemedText>
      <Slider
        value={beliefStrength}
        onValueChange={setBeliefStrength}
        minimumValue={0}
        maximumValue={100}
      />

      <Button onPress={handleContinue}>
        Continue
      </Button>
    </Screen>
  );
}
```

---

### 2.4 Enhanced ReframeScreen with Multiple Perspectives
**File**: `client/screens/ReframeScreen.tsx`

**Required Changes**:
1. **Multiple Reframing Angles**
   - Logical reframe
   - Emotional reframe
   - Spiritual reframe (Islamic)

2. **User Choice**
   - "Which reframe feels most true to you?"
   - Allow selection of preferred perspective
   - Explain why they chose it

3. **Future Pacing**
   - "How might this new perspective change your next hour?"
   - Connect to immediate action

**API Changes**:
```typescript
interface ReframeResult {
  beliefTested: string;
  perspectives: {
    logical: string;
    emotional: string;
    spiritual: string;
  };
  nextStep: string;
  anchors: string[];
  futurePacing: string;
}
```

---

### 2.5 Enhanced RegulationScreen
**File**: `client/screens/RegulationScreen.tsx`

**Required Additions**:
1. **Haptic Feedback Integration**
   - Vibration pattern for breathing
   - Gentle pulse for dhikr timing

2. **Physiological Grounding**
   - Heart rate variability cues
   - 4-7-8 breathing with counter
   - Progressive muscle relaxation option

3. **Islamic Practice Integration**
   - Dhikr phrases (SubhanAllah, Alhamdulillah)
   - Wudu as grounding practice
   - Dua options from authenticated list

---

### 2.6 Enhanced IntentionScreen with Niyyah
**File**: `client/screens/IntentionScreen.tsx`

**Required Changes**:
1. **Niyyah Framing**
   - "Make your intention pure for Allah's pleasure"
   - Connect intention to action
   - Frame as spiritual practice

2. **Values Alignment**
   - "What intention does Allah want for you in this moment?"
   - Connect to user's core values
   - Sabr, shukr, tawakkul integration

3. **Concrete Action**
   - Must be specific and achievable
   - Time-bound (today, this hour)
   - Tied to reframe

---

## Phase 3: Server-Side AI Integration (PRIORITY)

### 3.1 Enhanced Tone Classification
**File**: `server/toneClassifier.ts`

**Required Updates**:
1. Import distress-level detection from `conversational-ai.ts`
2. Add emotional intensity calculation
3. Return conversational context with classification

**Code Changes**:
```typescript
import { EmotionalIntelligence } from './conversational-ai';
import { DISTRESS_RESPONSE_MATRIX } from '../shared/islamic-framework';

export function classifyToneEnhanced(
  text: string, 
  previousReflections?: string[]
): {
  mode: ToneMode;
  confidence: number;
  emotionalIntensity: number;
  distressLevel: 'low' | 'moderate' | 'high' | 'crisis';
  suggestedEmotion: string;
} {
  const intensity = EmotionalIntelligence.detectIntensity(text);
  const emotion = EmotionalIntelligence.suggestEmotionalLabel(text);
  
  // Determine distress level
  let distressLevel: 'low' | 'moderate' | 'high' | 'crisis' = 'moderate';
  if (intensity < 30) distressLevel = 'low';
  else if (intensity < 60) distressLevel = 'moderate';
  else if (intensity < 85) distressLevel = 'high';
  else distressLevel = 'crisis';

  return {
    mode: classifyTone(text, previousReflections).mode,
    confidence: classifyTone(text, previousReflections).confidence,
    emotionalIntensity: intensity,
    distressLevel,
    suggestedEmotion: emotion,
  };
}
```

---

### 3.2 Update Server Routes with Safety Integration
**File**: `server/routes.ts`

**Critical Changes**:

#### 3.2.1 Add Safety Checks to /api/analyze
```typescript
import { detectCrisis, validateAIOutput, CRISIS_RESOURCES } from './ai-safety';
import { buildConversationalPromptModifier } from './conversational-ai';

app.post("/api/analyze", async (req, res) => {
  const { thought } = req.body;

  // SAFETY CHECK 1: Crisis detection
  const crisisCheck = detectCrisis(thought);
  if (crisisCheck.level === 'emergency') {
    return res.json({
      crisis: true,
      level: crisisCheck.level,
      resources: CRISIS_RESOURCES.emergency,
    });
  }

  // Continue with analysis...
  const toneClassification = classifyToneEnhanced(thought);
  
  // Build conversational context
  const conversationalModifier = buildConversationalPromptModifier({
    mode: 'listening',
    distressLevel: toneClassification.distressLevel,
    emotionalState: toneClassification.suggestedEmotion,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-5.1",
    messages: [
      {
        role: "system",
        content: `${SYSTEM_FOUNDATION}${conversationalModifier}${toneModifier}${stateModifier}...`,
      },
      { role: "user", content: thought },
    ],
  });

  const result = JSON.parse(response.choices[0]?.message?.content || "{}");

  // SAFETY CHECK 2: Output validation
  const validation = validateAIOutput(JSON.stringify(result), {
    type: 'analysis',
    emotionalState: toneClassification.suggestedEmotion,
  });

  if (!validation.approved) {
    console.error('[AI Safety] Output rejected:', validation.issues);
    return res.status(500).json({ error: 'Unable to generate safe response' });
  }

  res.json(result);
});
```

#### 3.2.2 Add Islamic Grounding to /api/reframe
```typescript
import { QURAN_BY_STATE, ISLAMIC_CONCEPTS } from '../shared/islamic-framework';

app.post("/api/reframe", async (req, res) => {
  const { thought, distortions, analysis, emotionalState } = req.body;

  // Select contextual Quran reminder
  const quranicReminder = emotionalState && QURAN_BY_STATE[emotionalState]
    ? QURAN_BY_STATE[emotionalState]
    : null;

  const quranicContext = quranicReminder 
    ? `\n\nCONTEXTUAL QURAN REFERENCE:\n${quranicReminder.translation}\nContext: ${quranicReminder.therapeuticContext}`
    : '';

  const response = await openai.chat.completions.create({
    model: "gpt-5.1",
    messages: [
      {
        role: "system",
        content: `${SYSTEM_FOUNDATION}${quranicContext}...`,
      },
      { role: "user", content: `...` },
    ],
  });

  // Validation and return...
});
```

---

### 3.3 Quran/Hadith Contextual Mapping
**File**: `server/islamic-content-mapper.ts` (NEW)

**Purpose**: Intelligent selection of Islamic content based on user state

```typescript
import { 
  EmotionalState, 
  QURAN_BY_STATE, 
  HADITH_BY_STATE,
  DistressLevel,
  DISTRESS_RESPONSE_MATRIX 
} from '../shared/islamic-framework';

export class IslamicContentMapper {
  static selectContent(
    emotionalState: EmotionalState,
    distressLevel: DistressLevel,
    context: 'analyze' | 'reframe' | 'practice'
  ): {
    quran?: typeof QURAN_BY_STATE[EmotionalState];
    hadith?: typeof HADITH_BY_STATE[EmotionalState];
    concept: string;
    tone: string;
  } {
    const distressResponse = DISTRESS_RESPONSE_MATRIX[distressLevel];
    const quran = QURAN_BY_STATE[emotionalState];
    const hadith = HADITH_BY_STATE[emotionalState];

    // High distress = emphasize mercy
    if (distressLevel === 'high' || distressLevel === 'crisis') {
      return {
        quran: distressResponse.quranicEmphasis === 'rahma' ? quran : undefined,
        hadith: undefined, // Keep it simple
        concept: distressResponse.primaryConcept,
        tone: distressResponse.toneAdjustment,
      };
    }

    // Moderate distress = balanced
    return {
      quran,
      hadith,
      concept: distressResponse.primaryConcept,
      tone: distressResponse.toneAdjustment,
    };
  }

  static validateContent(text: string): {
    safe: boolean;
    issues: string[];
  } {
    // Check against spiritual bypassing patterns
    // Check against theological prohibitions
    // Ensure mercy-first approach
    return { safe: true, issues: [] };
  }
}
```

---

## Phase 4: Data Security & Privacy (CRITICAL)

### 4.1 Encryption for Sensitive Data
**File**: `server/encryption.ts` (NEW)

**Requirements**:
- Encrypt thoughts before database storage
- Hash user IDs in logs
- Auto-delete after 30 days
- User-controlled data export

```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32-byte key
const IV_LENGTH = 16;

export class DataEncryption {
  static encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    );
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  static decrypt(text: string): string {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift()!, 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    );
    
    let decrypted = decipher.update(encryptedText, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

### 4.2 Update Storage Layer
**File**: `server/storage.ts`

**Changes**:
```typescript
import { DataEncryption } from './encryption';

export class Storage {
  async saveReflection(userId: string, data: ReflectionData) {
    // Encrypt sensitive content
    const encryptedThought = DataEncryption.encrypt(data.thought);
    const encryptedReframe = DataEncryption.encrypt(data.reframe);
    
    // Store with metadata only
    await db.insert(reflections).values({
      userId: hashUserId(userId), // Hashed
      thought: encryptedThought,   // Encrypted
      reframe: encryptedReframe,   // Encrypted
      distortions: data.distortions, // Metadata OK
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
  }

  async getReflectionHistory(userId: string) {
    const rows = await db
      .select()
      .from(reflections)
      .where(eq(reflections.userId, hashUserId(userId)))
      .where(gt(reflections.expiresAt, new Date())); // Auto-filter expired

    // Decrypt on retrieval
    return rows.map(row => ({
      ...row,
      thought: DataEncryption.decrypt(row.thought),
      reframe: DataEncryption.decrypt(row.reframe),
    }));
  }
}
```

### 4.3 Auto-Deletion Cron Job
**File**: `server/data-retention.ts` (NEW)

```typescript
import { db } from './db';
import { reflections } from './schema';
import { lt } from 'drizzle-orm';

export async function deleteExpiredReflections() {
  const deleted = await db
    .delete(reflections)
    .where(lt(reflections.expiresAt, new Date()))
    .returning();

  console.log(`[Data Retention] Deleted ${deleted.length} expired reflections`);
}

// Run daily
setInterval(deleteExpiredReflections, 24 * 60 * 60 * 1000);
```

---

## Phase 5: Testing & Validation

### 5.1 Safety Testing
**Test Cases**:
1. Crisis language detection accuracy
2. Theological validation effectiveness
3. Output filtering for harmful content
4. Scrupulosity detection sensitivity

**Test Script**: `server/__tests__/ai-safety.test.ts`

### 5.2 Islamic Content Validation
**Validation Steps**:
1. Review all Quran ayat for accuracy
2. Verify all Hadith are Sahih
3. Check concept applications for appropriateness
4. Ensure no spiritual bypassing in responses

**Reviewers**: Islamic scholars + therapists

### 5.3 User Acceptance Testing
**Test Scenarios**:
1. Low distress user → Full CBT flow
2. High distress user → Shorter responses
3. Crisis user → Resource provision
4. Repetitive patterns → Pattern interruption
5. Avoidance behavior → Gentle probing

---

## Implementation Priority

### Week 1: Critical Safety
- [x] Islamic framework foundation
- [x] AI safety guardrails
- [x] Conversational state model
- [ ] Integrate crisis detection into routes
- [ ] Add output validation to all endpoints

### Week 2: CBT Flow Enhancement
- [ ] Enhance ThoughtCapture with emotional anchoring
- [ ] Add belief inspection layer (new screen)
- [ ] Enhance Reframe with multiple perspectives
- [ ] Update navigation flow

### Week 3: AI Integration
- [ ] Update tone classification with intensity
- [ ] Integrate Islamic content mapper
- [ ] Add conversational modifiers to prompts
- [ ] Implement adaptive tone in responses

### Week 4: Security & Testing
- [ ] Implement encryption layer
- [ ] Add auto-deletion cron
- [ ] Run safety test suite
- [ ] Conduct Islamic content review
- [ ] User acceptance testing

---

## Success Metrics

### Quantitative
- Crisis detection accuracy > 95%
- Theological validation rejects < 1% of outputs
- User session completion rate > 80%
- Average emotional intensity reduction > 30%

### Qualitative
- User reports feeling "understood, not judged"
- Islamic content feels "grounding, not preachy"
- AI responses feel "human, not robotic"
- Transitions between steps feel "natural, not forced"

---

## Risk Mitigation

### Risk 1: Theological Misrepresentation
**Mitigation**: 
- Use only authenticated sources
- Implement theological validation
- Regular review by scholars

### Risk 2: Emotional Harm
**Mitigation**:
- Output validation before every response
- Crisis detection on every input
- Adaptive tone based on distress

### Risk 3: Over-Reliance
**Mitigation**:
- Clear boundaries in AI messaging
- Regular prompts to seek professional help
- No guarantees or authority claims

### Risk 4: Data Breach
**Mitigation**:
- Encryption at rest and in transit
- Minimal data retention (30 days)
- Hashed user IDs in logs

### Risk 5: Cultural Insensitivity
**Mitigation**:
- Diverse user testing
- Scholar review panel
- Tone guidelines enforcement

---

## Next Steps for Developer

1. **Immediate** (Today):
   - Integrate crisis detection into `/api/analyze`
   - Add output validation to all routes
   - Test safety system end-to-end

2. **This Week**:
   - Create BeliefInspectionScreen
   - Enhance ThoughtCapture with emotional anchoring
   - Update ReframeScreen with multiple perspectives

3. **Next Week**:
   - Implement encryption layer
   - Add Islamic content mapper
   - Update all AI prompts with conversational modifiers

4. **Before Launch**:
   - Complete safety testing
   - Islamic content review
   - User acceptance testing
   - Performance optimization

---

## Conclusion

This implementation transforms Noor CBT from functional to transformative. The foundation is built. The path is clear. The work remaining is focused and achievable.

**Core Principle**: Every line of code serves therapeutic efficacy and spiritual integrity. No feature exists for its own sake. Every enhancement deepens the existing flow.

**The App's Promise**: A grounded companion that helps Muslims work through cognitive distortions using CBT tools within an Islamic framework, with safety and mercy at the center.

May this work be accepted and may it benefit those who struggle.
