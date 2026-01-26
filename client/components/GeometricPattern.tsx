import React from "react";
import { View, ViewStyle } from "react-native";
import Svg, { Path, Circle, Polygon, G } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";

const AnimatedG = Animated.createAnimatedComponent(G);

interface GeometricPatternProps {
  type?: "border" | "divider" | "spinner" | "corner";
  size?: number;
  color?: string;
  opacity?: number;
  animated?: boolean;
  style?: ViewStyle;
}

/**
 * Islamic geometric pattern component
 * Provides subtle cultural visual elements throughout the app
 *
 * Pattern types:
 * - border: Decorative border pattern (subtle, 2-3% opacity)
 * - divider: Section divider using geometric motifs
 * - spinner: Geometric loading indicator
 * - corner: Corner flourish for banners/cards
 */
export function GeometricPattern({
  type = "border",
  size = 40,
  color,
  opacity = 0.03,
  animated = false,
  style,
}: GeometricPatternProps) {
  const { theme } = useTheme();
  const patternColor = color || theme.text;

  switch (type) {
    case "spinner":
      return (
        <GeometricSpinner
          size={size}
          color={patternColor}
          opacity={opacity}
          style={style}
        />
      );
    case "corner":
      return (
        <CornerFlourish
          size={size}
          color={patternColor}
          opacity={opacity}
          style={style}
        />
      );
    case "divider":
      return (
        <DividerPattern
          size={size}
          color={patternColor}
          opacity={opacity}
          style={style}
        />
      );
    case "border":
    default:
      return (
        <BorderPattern
          size={size}
          color={patternColor}
          opacity={opacity}
          style={style}
        />
      );
  }
}

/**
 * Geometric spinner - rotating Islamic star pattern
 */
function GeometricSpinner({
  size,
  color,
  opacity,
  style,
}: {
  size: number;
  color: string;
  opacity: number;
  style?: ViewStyle;
}) {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    rotation: rotation.value,
  }));

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <AnimatedG
          animatedProps={animatedProps}
          origin="50, 50"
          opacity={opacity}
        >
          {/* 8-pointed Islamic star */}
          <Path
            d="M50 10 L58 42 L90 42 L64 58 L72 90 L50 70 L28 90 L36 58 L10 42 L42 42 Z"
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
          <Circle
            cx="50"
            cy="50"
            r="8"
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
          <Path
            d="M50 25 L50 75 M25 50 L75 50 M35 35 L65 65 M35 65 L65 35"
            stroke={color}
            strokeWidth="1"
            opacity={0.5}
          />
        </AnimatedG>
      </Svg>
    </View>
  );
}

/**
 * Corner flourish - decorative corner element
 */
function CornerFlourish({
  size,
  color,
  opacity,
  style,
}: {
  size: number;
  color: string;
  opacity: number;
  style?: ViewStyle;
}) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G opacity={opacity}>
          {/* Curved corner with geometric detail */}
          <Path
            d="M 0 0 Q 20 0, 20 20 L 20 80 Q 20 100, 40 100 L 100 100"
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
          <Path
            d="M 10 10 Q 15 10, 15 15 L 15 85 Q 15 90, 20 90 L 90 90"
            fill="none"
            stroke={color}
            strokeWidth="1"
            opacity={0.5}
          />
          {/* Small decorative stars */}
          <Polygon
            points="15,40 17,45 22,45 18,48 20,53 15,50 10,53 12,48 8,45 13,45"
            fill={color}
            opacity={0.6}
          />
          <Polygon
            points="45,15 47,20 52,20 48,23 50,28 45,25 40,28 42,23 38,20 43,20"
            fill={color}
            opacity={0.6}
          />
        </G>
      </Svg>
    </View>
  );
}

/**
 * Divider pattern - section separator
 */
function DividerPattern({
  size,
  color,
  opacity,
  style,
}: {
  size: number;
  color: string;
  opacity: number;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        { width: size * 3, height: size / 2, alignSelf: "center" },
        style,
      ]}
    >
      <Svg width={size * 3} height={size / 2} viewBox="0 0 300 50">
        <G opacity={opacity}>
          {/* Central geometric motif */}
          <Circle
            cx="150"
            cy="25"
            r="15"
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
          <Polygon
            points="150,10 160,25 150,40 140,25"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
          />
          {/* Side decorations */}
          <Path
            d="M 50 25 L 130 25"
            stroke={color}
            strokeWidth="1"
            strokeDasharray="3,5"
          />
          <Path
            d="M 170 25 L 250 25"
            stroke={color}
            strokeWidth="1"
            strokeDasharray="3,5"
          />
          <Circle cx="50" cy="25" r="4" fill={color} />
          <Circle cx="250" cy="25" r="4" fill={color} />
        </G>
      </Svg>
    </View>
  );
}

/**
 * Border pattern - repeating geometric pattern
 */
function BorderPattern({
  size,
  color,
  opacity,
  style,
}: {
  size: number;
  color: string;
  opacity: number;
  style?: ViewStyle;
}) {
  return (
    <View style={[{ width: "100%", height: size / 4 }, style]}>
      <Svg width="100%" height={size / 4} viewBox="0 0 400 25">
        <G opacity={opacity}>
          {/* Repeating pattern of small geometric shapes */}
          {[0, 50, 100, 150, 200, 250, 300, 350].map((x, i) => (
            <G key={i}>
              <Path
                d={`M ${x} 12.5 L ${x + 10} 7.5 L ${x + 20} 12.5 L ${x + 10} 17.5 Z`}
                fill="none"
                stroke={color}
                strokeWidth="1"
              />
              <Circle cx={x + 10} cy={12.5} r="2" fill={color} />
            </G>
          ))}
        </G>
      </Svg>
    </View>
  );
}
