/**
 * Tajweed HTML Parser
 *
 * Parses the `uthmani_tajweed` HTML field from the Quran.Foundation API
 * into renderable segments with associated tajweed rules and colors.
 *
 * API format: `<span class="tajweed_ghunnah">text</span>plain text<span class="tajweed_iqlab">...</span>`
 */

import { TAJWEED_RULE_MAP, type TajweedRule } from "@/data/tajweed-rules";

// ============================================================================
// TYPES
// ============================================================================

export interface TajweedSegment {
  text: string;
  rule?: TajweedRule;
  color?: string;
}

// ============================================================================
// PARSER
// ============================================================================

/**
 * Regex that matches `<span class="css_class">content</span>` tags.
 * Captures:
 *   [1] = CSS class name (e.g. "tajweed_ghunnah")
 *   [2] = inner text content
 */
const TAJWEED_SPAN_REGEX = /<span\s+class="([^"]+)">([^<]*)<\/span>/g;

/**
 * Parse tajweed-annotated HTML into an array of renderable segments.
 *
 * Each `<span class="tajweed_*">...</span>` is mapped to a TajweedSegment
 * with the corresponding rule and color. Text outside spans becomes a
 * segment with no rule or color.
 */
export function parseTajweedHtml(html: string): TajweedSegment[] {
  const segments: TajweedSegment[] = [];
  let lastIndex = 0;

  // Reset regex state since it uses the global flag
  TAJWEED_SPAN_REGEX.lastIndex = 0;

  let match = TAJWEED_SPAN_REGEX.exec(html);
  while (match !== null) {
    const [fullMatch, cssClass, innerText] = match;
    const matchStart = match.index;

    // Capture any plain text before this span
    if (matchStart > lastIndex) {
      const plainText = html.slice(lastIndex, matchStart);
      if (plainText.length > 0) {
        segments.push({ text: plainText });
      }
    }

    // Map the CSS class to a tajweed rule
    const rule = TAJWEED_RULE_MAP[cssClass];
    segments.push({
      text: innerText,
      rule,
      color: rule?.color,
    });

    lastIndex = matchStart + fullMatch.length;
    match = TAJWEED_SPAN_REGEX.exec(html);
  }

  // Capture any remaining plain text after the last span
  if (lastIndex < html.length) {
    const remainingText = html.slice(lastIndex);
    if (remainingText.length > 0) {
      segments.push({ text: remainingText });
    }
  }

  return segments;
}
