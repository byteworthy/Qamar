/**
 * TajweedText Component
 *
 * Renders color-coded Arabic text based on tajweed rule segments.
 * Each segment is rendered as an inline <Text> span with the
 * corresponding tajweed color applied. Unstyled segments use the
 * current theme's text color.
 */

import React from "react";
import { Text, type TextStyle } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { Fonts } from "@/constants/theme";
import type { TajweedSegment } from "@/services/tajweedParser";

// ============================================================================
// TYPES
// ============================================================================

interface TajweedTextProps {
  segments: TajweedSegment[];
  fontSize?: number;
  style?: TextStyle;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function TajweedText({
  segments,
  fontSize = 28,
  style,
}: TajweedTextProps) {
  const { theme } = useTheme();

  return (
    <Text
      style={[
        {
          fontFamily: Fonts?.spiritual ?? "Amiri-Regular",
          fontSize,
          lineHeight: fontSize * 2.2,
          textAlign: "right",
          writingDirection: "rtl",
          color: theme.text,
        },
        style,
      ]}
    >
      {segments.map((segment, index) => (
        <Text
          key={`${index}-${segment.text}`}
          style={segment.color ? { color: segment.color } : undefined}
        >
          {segment.text}
        </Text>
      ))}
    </Text>
  );
}
