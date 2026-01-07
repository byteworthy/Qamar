import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { SiraatColors } from "@/constants/theme";

interface NoorMarkProps {
  size?: number;
  color?: string;
}

export function NoorMark({ size = 80, color = SiraatColors.charcoal }: NoorMarkProps) {
  const strokeWidth = size * 0.04;
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Path
          d="M 20 85 L 20 35 Q 20 15 50 15 Q 80 15 80 35 L 80 85"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M 32 85 L 32 42 Q 32 28 50 28 Q 68 28 68 42 L 68 85"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M 44 85 L 44 50 Q 44 42 50 42 Q 56 42 56 50 L 56 85"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Rect
          x="15"
          y="85"
          width="70"
          height={strokeWidth}
          fill={color}
          rx={strokeWidth / 2}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
