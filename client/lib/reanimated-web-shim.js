/**
 * Complete web stub for react-native-reanimated.
 *
 * Replaces all Reanimated functionality with plain React/RN equivalents.
 * Animated.View → View, useAnimatedStyle → static style, animations → no-ops.
 * This eliminates all internal useState loops that cause Error #185 on web.
 */
const React = require("react");
const RN = require("react-native");

// --- Shared Value stub ---
function useSharedValue(initialValue) {
  const ref = React.useRef({ value: initialValue });
  return ref.current;
}

// --- useAnimatedStyle: call once, cache ---
function useAnimatedStyle(callback, _deps) {
  const ref = React.useRef(undefined);
  if (ref.current === undefined) {
    try {
      ref.current = callback();
    } catch (_e) {
      ref.current = {};
    }
  }
  return ref.current;
}

function useAnimatedProps(callback, _deps) {
  const ref = React.useRef(undefined);
  if (ref.current === undefined) {
    try {
      ref.current = callback();
    } catch (_e) {
      ref.current = {};
    }
  }
  return ref.current;
}

function useAnimatedRef() {
  return React.useRef(null);
}

function useDerivedValue(callback, _deps) {
  const val = React.useRef(undefined);
  if (val.current === undefined) {
    try {
      val.current = { value: callback() };
    } catch (_e) {
      val.current = { value: 0 };
    }
  }
  return val.current;
}

function useAnimatedScrollHandler(_handler) {
  return undefined;
}

// --- Animation functions: return target value immediately ---
function withTiming(toValue, _config, _callback) {
  return toValue;
}

function withSpring(toValue, _config, _callback) {
  return toValue;
}

function withRepeat(animation, _numberOfReps, _reverse, _callback) {
  return animation;
}

function withSequence(...animations) {
  return animations[animations.length - 1];
}

function withDelay(_delay, animation) {
  return animation;
}

function withDecay(_config, _callback) {
  return 0;
}

function cancelAnimation(_sharedValue) {}

function runOnJS(fn) {
  return fn;
}

function runOnUI(fn) {
  return fn;
}

function interpolate(value, inputRange, outputRange, _extrapolation) {
  if (inputRange.length < 2 || outputRange.length < 2)
    return outputRange[0] || 0;
  if (value <= inputRange[0]) return outputRange[0];
  if (value >= inputRange[inputRange.length - 1])
    return outputRange[outputRange.length - 1];
  for (let i = 0; i < inputRange.length - 1; i++) {
    if (value >= inputRange[i] && value <= inputRange[i + 1]) {
      const ratio =
        (value - inputRange[i]) / (inputRange[i + 1] - inputRange[i]);
      return outputRange[i] + ratio * (outputRange[i + 1] - outputRange[i]);
    }
  }
  return outputRange[0];
}

const Extrapolation = {
  EXTEND: "extend",
  CLAMP: "clamp",
  IDENTITY: "identity",
};

// --- Easing stub ---
const Easing = {
  linear: (t) => t,
  ease: (t) => t,
  quad: (t) => t * t,
  cubic: (t) => t * t * t,
  poly: (_n) => (t) => t,
  sin: (t) => t,
  circle: (t) => t,
  exp: (t) => t,
  elastic: (_bounciness) => (t) => t,
  back: (_s) => (t) => t,
  bounce: (t) => t,
  bezier: (_x1, _y1, _x2, _y2) => (t) => t,
  in: (fn) => fn,
  out: (fn) => fn,
  inOut: (fn) => fn,
};

// --- Layout animation stubs (entering/exiting) ---
// These return undefined so <Animated.View entering={FadeInUp}> just ignores them
function makeLayoutAnim() {
  const fn = function () {
    return fn;
  };
  fn.duration = () => fn;
  fn.delay = () => fn;
  fn.springify = () => fn;
  fn.damping = () => fn;
  fn.stiffness = () => fn;
  fn.mass = () => fn;
  fn.overshootClamping = () => fn;
  fn.restDisplacementThreshold = () => fn;
  fn.restSpeedThreshold = () => fn;
  fn.withInitialValues = () => fn;
  fn.withCallback = () => fn;
  fn.randomDelay = () => fn;
  fn.build = () => fn;
  return fn;
}

const FadeIn = makeLayoutAnim();
const FadeInUp = makeLayoutAnim();
const FadeInDown = makeLayoutAnim();
const FadeInLeft = makeLayoutAnim();
const FadeInRight = makeLayoutAnim();
const FadeOut = makeLayoutAnim();
const FadeOutUp = makeLayoutAnim();
const FadeOutDown = makeLayoutAnim();
const FadeOutLeft = makeLayoutAnim();
const FadeOutRight = makeLayoutAnim();
const SlideInDown = makeLayoutAnim();
const SlideInUp = makeLayoutAnim();
const SlideInLeft = makeLayoutAnim();
const SlideInRight = makeLayoutAnim();
const SlideOutDown = makeLayoutAnim();
const SlideOutUp = makeLayoutAnim();
const SlideOutLeft = makeLayoutAnim();
const SlideOutRight = makeLayoutAnim();
const ZoomIn = makeLayoutAnim();
const ZoomOut = makeLayoutAnim();
const BounceIn = makeLayoutAnim();
const BounceOut = makeLayoutAnim();
const FlipInXDown = makeLayoutAnim();
const FlipInXUp = makeLayoutAnim();
const FlipOutXDown = makeLayoutAnim();
const FlipOutXUp = makeLayoutAnim();
const StretchInX = makeLayoutAnim();
const StretchOutX = makeLayoutAnim();
const LinearTransition = makeLayoutAnim();
const SequencedTransition = makeLayoutAnim();
const FadingTransition = makeLayoutAnim();
const Layout = makeLayoutAnim();

// --- Animated components: plain RN components that strip animation props ---
function createAnimatedComponent(Component) {
  const AnimatedComp = React.forwardRef(function AnimatedComp(props, ref) {
    // Strip Reanimated-specific props
    const {
      entering,
      exiting,
      layout,
      animatedProps,
      sharedTransitionTag,
      sharedTransitionStyle,
      ...rest
    } = props;
    return React.createElement(Component, { ...rest, ref });
  });
  AnimatedComp.displayName = `Animated(${Component.displayName || Component.name || "Component"})`;
  return AnimatedComp;
}

const Animated = {
  View: createAnimatedComponent(RN.View),
  Text: createAnimatedComponent(RN.Text),
  Image: createAnimatedComponent(RN.Image),
  ScrollView: createAnimatedComponent(RN.ScrollView),
  FlatList: createAnimatedComponent(RN.FlatList),
  SectionList: createAnimatedComponent(RN.SectionList),
  TextInput: createAnimatedComponent(RN.TextInput),
  createAnimatedComponent,
};

// --- Gesture handler compat ---
function useAnimatedGestureHandler(handlers) {
  return handlers;
}

// --- Measure ---
function measure(_ref) {
  return { x: 0, y: 0, width: 0, height: 0, pageX: 0, pageY: 0 };
}

// --- Exports ---
module.exports = Animated; // default export
module.exports.default = Animated;
module.exports.useSharedValue = useSharedValue;
module.exports.useAnimatedStyle = useAnimatedStyle;
module.exports.useAnimatedProps = useAnimatedProps;
module.exports.useAnimatedRef = useAnimatedRef;
module.exports.useDerivedValue = useDerivedValue;
module.exports.useAnimatedScrollHandler = useAnimatedScrollHandler;
module.exports.useAnimatedGestureHandler = useAnimatedGestureHandler;
module.exports.withTiming = withTiming;
module.exports.withSpring = withSpring;
module.exports.withRepeat = withRepeat;
module.exports.withSequence = withSequence;
module.exports.withDelay = withDelay;
module.exports.withDecay = withDecay;
module.exports.cancelAnimation = cancelAnimation;
module.exports.runOnJS = runOnJS;
module.exports.runOnUI = runOnUI;
module.exports.interpolate = interpolate;
module.exports.Extrapolation = Extrapolation;
module.exports.Easing = Easing;
module.exports.measure = measure;
module.exports.createAnimatedComponent = createAnimatedComponent;
module.exports.FadeIn = FadeIn;
module.exports.FadeInUp = FadeInUp;
module.exports.FadeInDown = FadeInDown;
module.exports.FadeInLeft = FadeInLeft;
module.exports.FadeInRight = FadeInRight;
module.exports.FadeOut = FadeOut;
module.exports.FadeOutUp = FadeOutUp;
module.exports.FadeOutDown = FadeOutDown;
module.exports.FadeOutLeft = FadeOutLeft;
module.exports.FadeOutRight = FadeOutRight;
module.exports.SlideInDown = SlideInDown;
module.exports.SlideInUp = SlideInUp;
module.exports.SlideInLeft = SlideInLeft;
module.exports.SlideInRight = SlideInRight;
module.exports.SlideOutDown = SlideOutDown;
module.exports.SlideOutUp = SlideOutUp;
module.exports.SlideOutLeft = SlideOutLeft;
module.exports.SlideOutRight = SlideOutRight;
module.exports.ZoomIn = ZoomIn;
module.exports.ZoomOut = ZoomOut;
module.exports.BounceIn = BounceIn;
module.exports.BounceOut = BounceOut;
module.exports.FlipInXDown = FlipInXDown;
module.exports.FlipInXUp = FlipInXUp;
module.exports.FlipOutXDown = FlipOutXDown;
module.exports.FlipOutXUp = FlipOutXUp;
module.exports.StretchInX = StretchInX;
module.exports.StretchOutX = StretchOutX;
module.exports.LinearTransition = LinearTransition;
module.exports.SequencedTransition = SequencedTransition;
module.exports.FadingTransition = FadingTransition;
module.exports.Layout = Layout;
