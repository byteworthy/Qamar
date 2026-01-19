/**
 * Islamic Psychological Framework for Noor CBT
 *
 * This module provides the foundational Islamic concepts that anchor
 * the therapeutic experience. These are not decorative - they form
 * the epistemological basis for understanding human psychology.
 */

// =============================================================================
// CORE ISLAMIC PSYCHOLOGICAL CONCEPTS
// =============================================================================

export type IslamicConcept =
  | "niyyah" // Intention - the seed of all action
  | "sabr" // Patience - active endurance with trust
  | "tawakkul" // Reliance on Allah - trust after effort
  | "tazkiyah" // Purification of the soul
  | "shukr" // Gratitude - recognition of blessings
  | "tawbah" // Repentance - return to Allah
  | "dhikr" // Remembrance of Allah
  | "muraqaba" // Self-observation and mindfulness
  | "muhasaba" // Self-accountability
  | "ridha" // Contentment with Allah's decree
  | "khushu" // Humble presence and focus
  | "ikhlas"; // Sincerity in action

export interface ConceptDefinition {
  arabic: string;
  transliteration: string;
  meaning: string;
  therapeuticApplication: string;
  cbtConnection: string;
}

export const ISLAMIC_CONCEPTS: Record<IslamicConcept, ConceptDefinition> = {
  niyyah: {
    arabic: "نِيَّة",
    transliteration: "Niyyah",
    meaning: "Intention",
    therapeuticApplication:
      "Setting clear intention transforms cognitive work into spiritual practice. Every reflection begins with purpose.",
    cbtConnection:
      "Aligns with values clarification and goal-oriented therapy. Intention shapes attention and attention amplifies state.",
  },
  sabr: {
    arabic: "صَبْر",
    transliteration: "Sabr",
    meaning: "Patient Perseverance",
    therapeuticApplication:
      "Active endurance during difficulty, not passive resignation. The muscle that develops through cognitive struggle.",
    cbtConnection:
      "Connects to distress tolerance and emotional regulation. Sabr is the practice ground for building cognitive resilience.",
  },
  tawakkul: {
    arabic: "تَوَكُّل",
    transliteration: "Tawakkul",
    meaning: "Trust and Reliance on Allah",
    therapeuticApplication:
      "The letting go that comes after doing your part. Separating your effort from your anxiety about outcomes.",
    cbtConnection:
      "Addresses control-related distortions. You are responsible for effort, not outcomes. This distinction reduces anxiety.",
  },
  tazkiyah: {
    arabic: "تَزْكِيَة",
    transliteration: "Tazkiyah",
    meaning: "Purification of the Soul",
    therapeuticApplication:
      "Cognitive work as spiritual cleansing. Removing distortions is not just thinking better—it is purifying the heart.",
    cbtConnection:
      "Reframes CBT as soul work. Cognitive distortions are impurities; reframing is tahara (purification) of thought.",
  },
  shukr: {
    arabic: "شُكْر",
    transliteration: "Shukr",
    meaning: "Gratitude",
    therapeuticApplication:
      "Gratitude is not ignoring pain—it is expanding awareness to include blessing alongside struggle.",
    cbtConnection:
      "Counteracts negativity bias and ingratitude distortion. Gratitude practices are evidence-based interventions.",
  },
  tawbah: {
    arabic: "تَوْبَة",
    transliteration: "Tawbah",
    meaning: "Repentance and Return",
    therapeuticApplication:
      "Every moment offers return. Shame about the past does not need to define the present.",
    cbtConnection:
      "Addresses shame-based cognitions. Tawbah breaks the cycle of self-condemnation and hopelessness.",
  },
  dhikr: {
    arabic: "ذِكْر",
    transliteration: "Dhikr",
    meaning: "Remembrance of Allah",
    therapeuticApplication:
      "Grounding the mind through sacred repetition. Dhikr is the anchor when thoughts spiral.",
    cbtConnection:
      "Aligns with mindfulness and grounding techniques. Dhikr is pattern interruption with spiritual depth.",
  },
  muraqaba: {
    arabic: "مُرَاقَبَة",
    transliteration: "Muraqaba",
    meaning: "Watchful Self-Awareness",
    therapeuticApplication:
      "Observing your thoughts without becoming them. The witness stance that enables cognitive flexibility.",
    cbtConnection:
      'Core to metacognitive awareness. Muraqaba is the Islamic root of "observing your thoughts."',
  },
  muhasaba: {
    arabic: "مُحَاسَبَة",
    transliteration: "Muhasaba",
    meaning: "Self-Accountability",
    therapeuticApplication:
      "Taking honest inventory without self-destruction. Accountability that leads to growth, not despair.",
    cbtConnection:
      "Supports behavioral analysis without harsh self-judgment. Honest assessment is not self-attack.",
  },
  ridha: {
    arabic: "رِضَا",
    transliteration: "Ridha",
    meaning: "Contentment with Divine Decree",
    therapeuticApplication:
      "Peace that comes from acceptance, not achievement. Ridha is the fruit of tawakkul practice.",
    cbtConnection:
      "Addresses comparison-based and outcome-attached distortions. Contentment is not complacency.",
  },
  khushu: {
    arabic: "خُشُوع",
    transliteration: "Khushu",
    meaning: "Humble Presence",
    therapeuticApplication:
      "Full presence in the moment, aware of Allah. The quality that makes reflection transformative.",
    cbtConnection:
      "Connects to mindful engagement. Khushu is presence without performance anxiety.",
  },
  ikhlas: {
    arabic: "إِخْلَاص",
    transliteration: "Ikhlas",
    meaning: "Sincerity",
    therapeuticApplication:
      "Doing the work for Allah, not for show. Sincerity protects against spiritual bypassing.",
    cbtConnection:
      "Addresses people-pleasing and validation-seeking patterns. Ikhlas liberates from audience anxiety.",
  },
};

// =============================================================================
// NAFS (SELF/SOUL) FRAMEWORK
// =============================================================================

export type NafsState =
  | "ammara" // The commanding self - inclines to harm
  | "lawwama" // The self-reproaching self - conscience active
  | "mutmainna"; // The tranquil self - at peace

export interface NafsDefinition {
  arabic: string;
  transliteration: string;
  meaning: string;
  characteristics: string[];
  therapeuticImplication: string;
  growthDirection: string;
}

export const NAFS_STATES: Record<NafsState, NafsDefinition> = {
  ammara: {
    arabic: "النَّفْس الأَمَّارَة",
    transliteration: "An-Nafs al-Ammara",
    meaning: "The Soul that Commands to Evil",
    characteristics: [
      "Follows immediate desires without reflection",
      "Justifies harmful patterns",
      "Resists accountability",
      "Seeks comfort over growth",
    ],
    therapeuticImplication:
      "When thoughts push toward harm, avoidance, or self-destruction, the ammara nafs is active.",
    growthDirection:
      "Moving toward lawwama involves developing the witness—the part that notices and questions.",
  },
  lawwama: {
    arabic: "النَّفْس اللَّوَّامَة",
    transliteration: "An-Nafs al-Lawwama",
    meaning: "The Self-Reproaching Soul",
    characteristics: [
      "Active conscience that notices mistakes",
      "Experiences guilt as a signal, not punishment",
      "Struggles between higher and lower impulses",
      "Engaged in active jihad (struggle) with self",
    ],
    therapeuticImplication:
      "The lawwama state is actually healthy—it means the conscience is working. Most therapy happens here.",
    growthDirection:
      "Moving toward mutmainna involves developing peace alongside accountability, not shame.",
  },
  mutmainna: {
    arabic: "النَّفْس المُطْمَئِنَّة",
    transliteration: "An-Nafs al-Mutma'inna",
    meaning: "The Tranquil Soul",
    characteristics: [
      "At peace with Allah's decree",
      "Acts from alignment, not compulsion",
      "Experiences contentment independent of circumstance",
      "Returns to Allah willingly, not fearfully",
    ],
    therapeuticImplication:
      "The goal is not perfection but tranquility. Mutmainna is the fruit of consistent tazkiyah.",
    growthDirection:
      "This state is cultivated, not achieved once. It requires ongoing nourishment through dhikr and sabr.",
  },
};

// =============================================================================
// QALB (HEART) FRAMEWORK
// =============================================================================

export type HeartState =
  | "salim" // Sound, healthy heart
  | "marid" // Sick heart (temporary illness)
  | "qasi" // Hard heart (accumulated hardness)
  | "ghaafil"; // Heedless heart (distracted)

export interface HeartStateDefinition {
  arabic: string;
  transliteration: string;
  meaning: string;
  signs: string[];
  therapeuticApproach: string;
}

export const HEART_STATES: Record<HeartState, HeartStateDefinition> = {
  salim: {
    arabic: "قَلْب سَلِيم",
    transliteration: "Qalb Salim",
    meaning: "Sound Heart",
    signs: [
      "Responds to truth with recognition",
      "Feels peace after righteous action",
      "Experiences natural aversion to harm",
      "Maintains hope alongside fear",
    ],
    therapeuticApproach:
      "Strengthen and maintain through dhikr, gratitude, and continued reflection.",
  },
  marid: {
    arabic: "قَلْب مَرِيض",
    transliteration: "Qalb Marid",
    meaning: "Sick Heart",
    signs: [
      "Doubts that feel heavier than hope",
      "Inconsistency between values and actions",
      "Spiritual dryness and disconnection",
      "Knows truth but struggles to follow",
    ],
    therapeuticApproach:
      "This is where most people are most of the time. The cure is consistent small actions, not dramatic change.",
  },
  qasi: {
    arabic: "قَلْب قَاسٍ",
    transliteration: "Qalb Qasi",
    meaning: "Hard Heart",
    signs: [
      "Unmoved by reminders",
      "Justification of ongoing harm",
      "Loss of guilt signals",
      "Spiritual numbness",
    ],
    therapeuticApproach:
      "Requires gentle softening, not confrontation. Tears, nature, and compassion can crack hardness.",
  },
  ghaafil: {
    arabic: "قَلْب غَافِل",
    transliteration: "Qalb Ghaafil",
    meaning: "Heedless Heart",
    signs: [
      "Distraction as default state",
      "Avoiding deeper questions",
      "Surface-level living",
      "Forgetting purpose and akhira",
    ],
    therapeuticApproach:
      "Needs awakening through muhasaba (self-accounting) and remembrance of mortality.",
  },
};

// =============================================================================
// QURAN AYAT FOR EMOTIONAL STATES
// =============================================================================

export type EmotionalState =
  | "anxiety"
  | "grief"
  | "fear"
  | "shame"
  | "anger"
  | "loneliness"
  | "doubt"
  | "despair"
  | "exhaustion"
  | "overwhelm"
  | "hopelessness"
  | "guilt";

export interface QuranicReminder {
  reference: string;
  arabicText: string;
  translation: string;
  therapeuticContext: string;
  whenToUse: string[];
}

export const QURAN_BY_STATE: Record<EmotionalState, QuranicReminder> = {
  anxiety: {
    reference: "Surah Al-Baqarah 2:286",
    arabicText: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    translation: "Allah does not burden a soul beyond that it can bear.",
    therapeuticContext:
      "When anxiety tells you that you cannot handle this, remember: Allah already factored in your capacity.",
    whenToUse: [
      "Feeling overwhelmed by responsibilities",
      "Fear of failure",
      "Worry about future",
    ],
  },
  grief: {
    reference: "Surah Ad-Duha 93:3",
    arabicText: "مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ",
    translation: "Your Lord has not abandoned you, nor has He become hateful.",
    therapeuticContext:
      "Grief can whisper that you are forgotten. This ayah speaks directly to that lie.",
    whenToUse: ["Loss of loved one", "Feeling abandoned", "Spiritual dryness"],
  },
  fear: {
    reference: "Surah At-Talaq 65:3",
    arabicText: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    translation: "Whoever relies upon Allah – then He is sufficient for him.",
    therapeuticContext:
      "Fear often comes from feeling alone against threat. Tawakkul is the antidote.",
    whenToUse: [
      "Fear of harm",
      "Uncertainty about future",
      "Feeling unprotected",
    ],
  },
  shame: {
    reference: "Surah Az-Zumar 39:53",
    arabicText:
      "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ",
    translation:
      "Say: O My servants who have transgressed against themselves, despair not of the mercy of Allah.",
    therapeuticContext:
      'Shame says you are beyond redemption. Allah directly addresses those who have "gone too far."',
    whenToUse: [
      "Past sins weighing heavily",
      "Feeling unworthy of forgiveness",
      "Self-condemnation",
    ],
  },
  anger: {
    reference: "Surah Aal-Imran 3:134",
    arabicText: "وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ",
    translation: "Those who restrain anger and pardon the people.",
    therapeuticContext:
      "Anger is not prohibited—restraining it is praised. The goal is mastery, not suppression.",
    whenToUse: ["Feeling wronged", "Resentment building", "Urge to retaliate"],
  },
  loneliness: {
    reference: "Surah Al-Hadid 57:4",
    arabicText: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ",
    translation: "And He is with you wherever you are.",
    therapeuticContext:
      "Loneliness is painful and real. But being alone and being abandoned are different.",
    whenToUse: ["Social isolation", "Feeling unseen", "No one understands"],
  },
  doubt: {
    reference: "Surah Al-Baqarah 2:186",
    arabicText: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ",
    translation:
      "And when My servants ask you concerning Me – indeed I am near.",
    therapeuticContext:
      "Doubt often includes doubt about whether Allah hears. This ayah answers directly.",
    whenToUse: [
      "Questioning faith",
      "Feeling unheard in dua",
      "Spiritual confusion",
    ],
  },
  despair: {
    reference: "Surah Yusuf 12:87",
    arabicText: "وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ",
    translation: "Do not despair of relief from Allah.",
    therapeuticContext:
      "Despair says nothing will change. This ayah names despair and commands against it.",
    whenToUse: ["Feeling hopeless", "Nothing is working", "Wanting to give up"],
  },
  exhaustion: {
    reference: "Surah Al-Inshirah 94:5-6",
    arabicText: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translation:
      "Indeed, with hardship comes ease. Indeed, with hardship comes ease.",
    therapeuticContext:
      "The repetition is intentional. Ease is not after hardship—it is with it, hidden inside it.",
    whenToUse: ["Burnout", "Caregiver fatigue", "Prolonged difficulty"],
  },
  overwhelm: {
    reference: "Surah At-Talaq 65:7",
    arabicText: "سَيَجْعَلُ اللَّهُ بَعْدَ عُسْرٍ يُسْرًا",
    translation: "Allah will bring about, after hardship, ease.",
    therapeuticContext:
      "When everything feels like too much, remember: your current capacity is not your permanent state.",
    whenToUse: ["Too many demands", "Cannot see a way out", "System overload"],
  },
  hopelessness: {
    reference: "Surah Ar-Ra'd 13:28",
    arabicText: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    translation: "Verily, in the remembrance of Allah do hearts find rest.",
    therapeuticContext:
      "Hopelessness is a state, not a truth. The heart can find rest—dhikr is the pathway.",
    whenToUse: [
      "Lost sense of meaning",
      "Nothing matters anymore",
      "Emotional numbness",
    ],
  },
  guilt: {
    reference: "Surah An-Nisa 4:110",
    arabicText:
      "وَمَن يَعْمَلْ سُوءًا أَوْ يَظْلِمْ نَفْسَهُ ثُمَّ يَسْتَغْفِرِ اللَّهَ يَجِدِ اللَّهَ غَفُورًا رَّحِيمًا",
    translation:
      "Whoever does evil or wrongs himself, then seeks forgiveness of Allah, will find Allah Forgiving and Merciful.",
    therapeuticContext:
      "Guilt can be productive (leads to tawbah) or destructive (leads to despair). This ayah redirects guilt toward hope.",
    whenToUse: [
      "Past mistakes haunting",
      "Cannot forgive self",
      "Ruminating on wrongs",
    ],
  },
};

// =============================================================================
// HADITH FOR EMOTIONAL STATES (SAHIH ONLY)
// =============================================================================

export interface HadithReminder {
  narrator: string;
  source: string;
  arabicText: string;
  translation: string;
  therapeuticContext: string;
  authenticity: "Sahih Bukhari" | "Sahih Muslim" | "Agreed Upon";
}

export const HADITH_BY_STATE: Partial<Record<EmotionalState, HadithReminder>> =
  {
    anxiety: {
      narrator: "Anas ibn Malik",
      source: "Sahih Bukhari 6369",
      arabicText: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ",
      translation: "O Allah, I seek refuge in You from anxiety and sorrow.",
      therapeuticContext:
        "The Prophet ﷺ himself sought refuge from anxiety. This normalizes the struggle and provides a response.",
      authenticity: "Sahih Bukhari",
    },
    grief: {
      narrator: "Umm Salamah",
      source: "Sahih Muslim 918",
      arabicText:
        "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا",
      translation:
        "To Allah we belong and to Him we return. O Allah, reward me in my affliction and replace it with something better.",
      therapeuticContext:
        "This dua was taught during loss. It acknowledges the pain while opening to future good.",
      authenticity: "Sahih Muslim",
    },
    fear: {
      narrator: "Abu Hurairah",
      source: "Agreed Upon",
      arabicText:
        "مَا يُصِيبُ الْمُسْلِمَ مِنْ نَصَبٍ وَلاَ وَصَبٍ وَلاَ هَمٍّ وَلاَ حَزَنٍ وَلاَ أَذًى وَلاَ غَمٍّ حَتَّى الشَّوْكَةِ يُشَاكُهَا إِلاَّ كَفَّرَ اللَّهُ بِهَا مِنْ خَطَايَاهُ",
      translation:
        "No fatigue, disease, sorrow, sadness, hurt, or distress befalls a Muslim, even if it were the prick of a thorn, but Allah expiates some of his sins for that.",
      therapeuticContext:
        "Nothing is wasted. Even the smallest pain carries meaning. This reframes suffering as spiritually productive.",
      authenticity: "Agreed Upon",
    },
    shame: {
      narrator: "Abu Hurairah",
      source: "Sahih Muslim 2749",
      arabicText:
        "وَالَّذِي نَفْسِي بِيَدِهِ لَوْ لَمْ تُذْنِبُوا لَذَهَبَ اللَّهُ بِكُمْ وَلَجَاءَ بِقَوْمٍ يُذْنِبُونَ فَيَسْتَغْفِرُونَ اللَّهَ فَيَغْفِرُ لَهُمْ",
      translation:
        "By Him in Whose Hand is my soul, if you did not sin, Allah would replace you with people who would sin and then seek forgiveness from Allah, and He would forgive them.",
      therapeuticContext:
        "Sin is part of the human condition. The goal is not sinlessness but sincere return.",
      authenticity: "Sahih Muslim",
    },
    exhaustion: {
      narrator: "Aisha",
      source: "Sahih Bukhari 6464",
      arabicText: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
      translation:
        "The most beloved deeds to Allah are those done consistently, even if small.",
      therapeuticContext:
        "When exhausted, perfection is not required. Small consistent acts are more beloved than burnout-inducing efforts.",
      authenticity: "Sahih Bukhari",
    },
    despair: {
      narrator: "Abu Hurairah",
      source: "Sahih Bukhari 7405",
      arabicText: "أَنَا عِنْدَ ظَنِّ عَبْدِي بِي",
      translation: "I am as My servant thinks of Me.",
      therapeuticContext:
        "Your expectation of Allah matters. Good opinion (husn al-dhann) of Allah is itself an act of worship.",
      authenticity: "Sahih Bukhari",
    },
  };

// =============================================================================
// TONE AND LANGUAGE GUIDELINES
// =============================================================================

export const TONE_GUIDELINES = {
  use: [
    "This feeling is understandable",
    "Allah's mercy encompasses all things",
    "What if this thought isn't the whole truth?",
    "Your struggle has meaning",
    "Small steps are still progress",
    "That sounds heavy",
    "I hear you",
    "This is real and difficult",
    "You're not alone in this",
    "Hearts fluctuate - this too is temporary",
  ],
  avoid: [
    "You should feel...",
    "Just trust Allah",
    "This is easy if you...",
    "Real Muslims would...",
    "You're overreacting",
    "Everything happens for a reason",
    "At least...",
    "Others have it worse",
    "Just make dua and it will be fine",
    "You need to have more faith",
  ],
  patterns: {
    acknowledgmentFirst: "Always acknowledge the emotion before analyzing it",
    noPreaching: "Share wisdom, don't lecture",
    noGuilt: "Inspire, don't shame",
    noFatwa: "Therapeutic guidance only, never religious rulings",
    mercyFirst: "When in doubt, emphasize Allah's mercy over obligation",
  },
};

// =============================================================================
// CONCEPT APPLICATION RULES
// =============================================================================

export interface ConceptApplicationRule {
  concept: IslamicConcept;
  applyWhen: string[];
  neverApplyWhen: string[];
  exampleApplication: string;
}

export const CONCEPT_RULES: ConceptApplicationRule[] = [
  {
    concept: "tawakkul",
    applyWhen: [
      "User is anxious about outcomes",
      "User is trying to control the uncontrollable",
      "User feels responsible for things outside their control",
    ],
    neverApplyWhen: [
      "User needs to take action they are avoiding",
      "User is using spirituality to bypass responsibility",
      "User is in crisis requiring immediate help",
    ],
    exampleApplication:
      "You've done what you can. The rest is Allah's territory, not yours to carry.",
  },
  {
    concept: "sabr",
    applyWhen: [
      "User is in prolonged difficulty",
      "User feels like giving up",
      "User is building new patterns",
    ],
    neverApplyWhen: [
      "User is in abusive situation",
      "User needs to make a change, not endure",
      "Sabr would mean tolerating harm",
    ],
    exampleApplication:
      "This is building something in you. Sabr isn't passive—it's active trust during difficulty.",
  },
  {
    concept: "shukr",
    applyWhen: [
      "User is in ingratitude spiral",
      "User cannot see blessings",
      "User is comparing to others",
    ],
    neverApplyWhen: [
      "User is in acute grief",
      "Gratitude would feel dismissive of real pain",
      "User is already practicing gratitude but struggling",
    ],
    exampleApplication:
      "What's one thing, even small, that's working right now?",
  },
];

// =============================================================================
// DISTRESS LEVEL RESPONSE MATRIX
// =============================================================================

export type DistressLevel = "low" | "moderate" | "high" | "crisis";

export interface DistressResponse {
  primaryConcept: IslamicConcept;
  quranicEmphasis: "rahma" | "sabr" | "tawakkul" | "hope";
  toneAdjustment: string;
  responseLength: "normal" | "shorter" | "minimal";
  additionalGuidance: string;
}

export const DISTRESS_RESPONSE_MATRIX: Record<DistressLevel, DistressResponse> =
  {
    low: {
      primaryConcept: "muraqaba",
      quranicEmphasis: "tawakkul",
      toneAdjustment: "Can use more abstract, growth-oriented language",
      responseLength: "normal",
      additionalGuidance:
        "User has capacity for reflection. Can explore patterns more deeply.",
    },
    moderate: {
      primaryConcept: "sabr",
      quranicEmphasis: "sabr",
      toneAdjustment: "Balance reflection with validation",
      responseLength: "normal",
      additionalGuidance:
        "User is struggling but engaged. Standard therapeutic approach.",
    },
    high: {
      primaryConcept: "dhikr",
      quranicEmphasis: "rahma",
      toneAdjustment: "More concrete, grounding language. Shorter sentences.",
      responseLength: "shorter",
      additionalGuidance:
        "User needs stabilization before cognitive work. Emphasize mercy over analysis.",
    },
    crisis: {
      primaryConcept: "tawakkul",
      quranicEmphasis: "hope",
      toneAdjustment: "Minimal words. Direct. Grounding. Safety first.",
      responseLength: "minimal",
      additionalGuidance:
        "User may need professional help. Provide resources. Do not attempt deep cognitive work.",
    },
  };

// =============================================================================
// SPIRITUAL BYPASSING DETECTION
// =============================================================================

export const SPIRITUAL_BYPASSING_INDICATORS = [
  "I should just trust Allah and stop worrying",
  "Good Muslims don't feel this way",
  "I need to be grateful and stop complaining",
  "If my iman was stronger I wouldn't struggle",
  "I just need to pray more",
  "This is a test and I should be happy about it",
  "I'm not allowed to feel angry at Allah",
  "Sadness means weak faith",
];

export const SPIRITUAL_BYPASSING_RESPONSE = `Your faith is not measured by whether you struggle. Even the prophets experienced difficulty and called out to Allah in distress. The goal is not to feel nothing—it is to feel everything while staying connected to Him.`;
