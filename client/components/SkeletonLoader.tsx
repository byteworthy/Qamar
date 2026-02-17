/**
 * SkeletonLoader — thin wrapper over LoadingSkeleton for consistent usage
 */
import React from "react";
import { ViewStyle } from "react-native";
import { LoadingSkeleton } from "./LoadingSkeleton";

interface SkeletonLoaderProps {
  width?: number | `${number}%` | "100%";
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({
  width = "100%",
  height,
  borderRadius = 8,
  style,
}: SkeletonLoaderProps) {
  return (
    <LoadingSkeleton
      width={width}
      height={height}
      borderRadius={borderRadius}
      style={style}
    />
  );
}
