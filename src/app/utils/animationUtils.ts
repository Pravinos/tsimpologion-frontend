import { Animated, Easing } from 'react-native';

/**
 * Animates a value with a fade-in effect
 * @param value Animated.Value to animate
 * @param toValue Target value (typically 1 for opacity)
 * @param duration Animation duration in ms
 * @param delay Delay before animation starts in ms
 * @returns Animated.CompositeAnimation that can be started/stopped
 */
export const fadeIn = (
  value: Animated.Value, 
  toValue: number = 1, 
  duration: number = 400, 
  delay: number = 0
): Animated.CompositeAnimation => {
  return Animated.timing(value, {
    toValue,
    duration,
    delay,
    useNativeDriver: true,
    easing: Easing.out(Easing.ease),
  });
};

/**
 * Animates a value with a slide-in effect
 * @param value Animated.Value to animate
 * @param fromValue Starting value
 * @param toValue Target value
 * @param duration Animation duration in ms
 * @param delay Delay before animation starts in ms
 * @returns Animated.CompositeAnimation that can be started/stopped
 */
export const slideIn = (
  value: Animated.Value,
  fromValue: number,
  toValue: number = 0,
  duration: number = 400,
  delay: number = 0
): Animated.CompositeAnimation => {
  // Reset the value to the starting position
  value.setValue(fromValue);
  
  return Animated.timing(value, {
    toValue,
    duration,
    delay,
    useNativeDriver: true,
    easing: Easing.out(Easing.ease),
  });
};

/**
 * Creates a sequence of staggered animations for a list of elements
 * @param animations Array of animation functions to run
 * @param staggerDelay Delay between each animation in ms
 * @returns Animated.CompositeAnimation that can be started/stopped
 */
export const staggerAnimations = (
  animations: Animated.CompositeAnimation[],
  staggerDelay: number = 100
): Animated.CompositeAnimation => {
  return Animated.stagger(staggerDelay, animations);
};

/**
 * Creates a sequence of animations that run one after another
 * @param animations Array of animation functions to run in sequence
 * @returns Animated.CompositeAnimation that can be started/stopped
 */
export const sequenceAnimations = (
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation => {
  return Animated.sequence(animations);
};

/**
 * Creates a group of animations that run simultaneously
 * @param animations Array of animation functions to run in parallel
 * @returns Animated.CompositeAnimation that can be started/stopped
 */
export const parallelAnimations = (
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation => {
  return Animated.parallel(animations);
};

/**
 * Scales a value up and down, creating a pulse effect
 * @param value Animated.Value to animate
 * @param minScale Minimum scale value
 * @param maxScale Maximum scale value
 * @param duration Duration of one pulse cycle in ms
 * @returns Animated.CompositeAnimation that can be started/stopped
 */
export const pulseAnimation = (
  value: Animated.Value,
  minScale: number = 0.97,
  maxScale: number = 1.03,
  duration: number = 800
): Animated.CompositeAnimation => {
  // Reset to the starting value
  value.setValue(minScale);
  
  return Animated.sequence([
    Animated.timing(value, {
      toValue: maxScale,
      duration: duration / 2,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }),
    Animated.timing(value, {
      toValue: minScale,
      duration: duration / 2,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    })
  ]);
};
