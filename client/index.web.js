/**
 * Web entry point — patches Reanimated before any component loads.
 *
 * Reanimated 4.x useAnimatedStyle on web uses internal useState that triggers
 * infinite re-renders when the callback returns a new object reference each time.
 * This patch replaces useAnimatedStyle with a useRef-cached version on web.
 */

console.log("[WEB-ENTRY] index.web.js loaded — applying Reanimated web patch");
const React = require("react");
const Reanimated = require("react-native-reanimated");
console.log("[WEB-ENTRY] useAnimatedStyle type before patch:", typeof Reanimated.useAnimatedStyle);

// Patch useAnimatedStyle: call callback once, cache result, return stable ref
const _originalUseAnimatedStyle = Reanimated.useAnimatedStyle;
Reanimated.useAnimatedStyle = function useAnimatedStyleWeb(callback, deps) {
  const ref = React.useRef(undefined);
  if (ref.current === undefined) {
    ref.current = callback();
  }
  return ref.current;
};

// Patch useAnimatedProps similarly (same issue pattern)
if (Reanimated.useAnimatedProps) {
  Reanimated.useAnimatedProps = function useAnimatedPropsWeb(callback, deps) {
    const ref = React.useRef(undefined);
    if (ref.current === undefined) {
      ref.current = callback();
    }
    return ref.current;
  };
}

console.log("[WEB-ENTRY] Reanimated patched successfully");

// Now load the app
const { registerRootComponent } = require("expo");
const App = require("@/App").default;

registerRootComponent(App);
