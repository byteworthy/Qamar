// Perspective types for multi-lens reframing
export type PerspectiveType = "empathic" | "logical" | "islamic" | "future";

export interface PerspectiveOption {
  id: PerspectiveType;
  label: string;
  icon: string;
  description: string;
  colorKey: string;
}

export interface ReframeResult {
  beliefTested: string;
  perspective: string;
  nextStep: string;
  anchors: string[];
}

// Islamic wisdom references for the "Rooted" perspective
export interface IslamicReference {
  text: string;
  arabicText?: string;
  source: string;
  concept: string;
}

export const ISLAMIC_REFERENCES: IslamicReference[] = [
  {
    text: "Allah does not burden a soul beyond that it can bear.",
    arabicText: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    source: "Quran 2:286",
    concept: "Divine Wisdom in Trials",
  },
  {
    text: "Verily, with hardship comes ease.",
    arabicText: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    source: "Quran 94:6",
    concept: "Hope in Difficulty",
  },
  {
    text: "And whoever relies upon Allah - then He is sufficient for them.",
    arabicText: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    source: "Quran 65:3",
    concept: "Trust in Allah",
  },
  {
    text: "How wonderful is the affair of the believer, for all of it is good.",
    source: "Sahih Muslim",
    concept: "Gratitude in All States",
  },
];

export const PERSPECTIVE_OPTIONS: PerspectiveOption[] = [
  {
    id: "empathic",
    label: "Compassionate",
    icon: "💛",
    description: "What would a loving friend say?",
    colorKey: "intensityModerate",
  },
  {
    id: "logical",
    label: "Balanced",
    icon: "⚖️",
    description: "What does the evidence show?",
    colorKey: "pillBackground",
  },
  {
    id: "islamic",
    label: "Rooted",
    icon: "🌙",
    description: "What does our tradition say?",
    colorKey: "highlightAccent",
  },
  {
    id: "future",
    label: "Zoomed Out",
    icon: "🔭",
    description: "How will this look in a year?",
    colorKey: "intensityHeavy",
  },
];
