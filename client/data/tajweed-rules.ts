/**
 * Tajweed Rule Definitions
 *
 * Maps the 17 CSS classes returned by the Quran.Foundation API's
 * `uthmani_tajweed` field to display names, colors, and descriptions.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface TajweedRule {
  id: string;
  cssClass: string;
  name: string;
  nameArabic: string;
  color: string;
  description: string;
}

// ============================================================================
// RULE DEFINITIONS
// ============================================================================

export const TAJWEED_RULES: TajweedRule[] = [
  {
    id: "ghunnah",
    cssClass: "tajweed_ghunnah",
    name: "Ghunnah",
    nameArabic: "غنة",
    color: "#FF7F50",
    description: "Nasal sound held for 2 counts",
  },
  {
    id: "ikhfa",
    cssClass: "tajweed_ikhfa",
    name: "Ikhfa",
    nameArabic: "إخفاء",
    color: "#D2691E",
    description: "Hidden/concealed pronunciation",
  },
  {
    id: "idgham_ghunnah",
    cssClass: "tajweed_idghaam_ghunnah",
    name: "Idgham with Ghunnah",
    nameArabic: "إدغام بغنة",
    color: "#9370DB",
    description: "Merging with nasal sound",
  },
  {
    id: "idgham_no_ghunnah",
    cssClass: "tajweed_idghaam_no_ghunnah",
    name: "Idgham without Ghunnah",
    nameArabic: "إدغام بلا غنة",
    color: "#BA55D3",
    description: "Merging without nasal sound",
  },
  {
    id: "iqlab",
    cssClass: "tajweed_iqlab",
    name: "Iqlab",
    nameArabic: "إقلاب",
    color: "#3CB371",
    description: "Converting noon sakinah to meem",
  },
  {
    id: "qalqalah",
    cssClass: "tajweed_qalqalah",
    name: "Qalqalah",
    nameArabic: "قلقلة",
    color: "#4169E1",
    description: "Echoing/bouncing sound on specific letters",
  },
  {
    id: "madd_normal",
    cssClass: "tajweed_madd_normal",
    name: "Madd (Normal)",
    nameArabic: "مد طبيعي",
    color: "#FF6347",
    description: "Natural elongation of 2 counts",
  },
  {
    id: "madd_permissible",
    cssClass: "tajweed_madd_permissible",
    name: "Madd (Permissible)",
    nameArabic: "مد جائز",
    color: "#FF4500",
    description: "Permissible elongation of 2-6 counts",
  },
  {
    id: "madd_obligatory",
    cssClass: "tajweed_madd_obligatory",
    name: "Madd (Obligatory)",
    nameArabic: "مد لازم",
    color: "#DC143C",
    description: "Obligatory elongation of 6 counts",
  },
  {
    id: "madd_munfasil",
    cssClass: "tajweed_madd_munfasil",
    name: "Madd Munfasil",
    nameArabic: "مد منفصل",
    color: "#CD5C5C",
    description: "Separated elongation",
  },
  {
    id: "madd_muttasil",
    cssClass: "tajweed_madd_muttasil",
    name: "Madd Muttasil",
    nameArabic: "مد متصل",
    color: "#B22222",
    description: "Connected elongation",
  },
  {
    id: "lam_shamsiyyah",
    cssClass: "tajweed_laam_shamsiyyah",
    name: "Lam Shamsiyyah",
    nameArabic: "لام شمسية",
    color: "#FFD700",
    description: "Solar lam - assimilated into following letter",
  },
  {
    id: "ikhfa_shafawi",
    cssClass: "tajweed_ikhfa_shafawi",
    name: "Ikhfa Shafawi",
    nameArabic: "إخفاء شفوي",
    color: "#DAA520",
    description: "Lip-based concealment",
  },
  {
    id: "idgham_shafawi",
    cssClass: "tajweed_idghaam_shafawi",
    name: "Idgham Shafawi",
    nameArabic: "إدغام شفوي",
    color: "#8B4513",
    description: "Lip-based merging of meem",
  },
  {
    id: "silent",
    cssClass: "tajweed_silent",
    name: "Silent",
    nameArabic: "حرف ساكن",
    color: "#808080",
    description: "Silent letter - not pronounced",
  },
  {
    id: "idhhar",
    cssClass: "tajweed_idhaar",
    name: "Idhhar",
    nameArabic: "إظهار",
    color: "#20B2AA",
    description: "Clear pronunciation without nasalization",
  },
  {
    id: "idhhar_shafawi",
    cssClass: "tajweed_idhaar_shafawi",
    name: "Idhhar Shafawi",
    nameArabic: "إظهار شفوي",
    color: "#48D1CC",
    description: "Lip-based clear pronunciation",
  },
];

// ============================================================================
// LOOKUP MAP (keyed by CSS class for fast parsing)
// ============================================================================

export const TAJWEED_RULE_MAP: Record<string, TajweedRule> = {};

for (const rule of TAJWEED_RULES) {
  TAJWEED_RULE_MAP[rule.cssClass] = rule;
}
