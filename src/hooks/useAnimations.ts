import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { animation } from '@/constants/theme';

const { duration } = animation;

export function useFade(initialOpacity = 0) {
  const opacity = useSharedValue(initialOpacity);

  const fadeIn = useCallback((config?: { duration?: number; delay?: number }) => {
    opacity.value = withTiming(1, {
      duration: config?.duration ?? duration.normal,
    });
  }, [opacity]);

  const fadeOut = useCallback((config?: { duration?: number }) => {
    opacity.value = withTiming(0, {
      duration: config?.duration ?? duration.normal,
    });
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return { fadeIn, fadeOut, style, opacity };
}

export function useSlide(direction: 'up' | 'down' | 'left' | 'right' = 'up', distance = 100) {
  const translate = useSharedValue(direction === 'up' || direction === 'left' ? distance : -distance);

  const slideIn = useCallback(() => {
    translate.value = withSpring(0, { damping: 15, stiffness: 150 });
  }, [translate]);

  const slideOut = useCallback(() => {
    const target = direction === 'up' || direction === 'left' ? distance : -distance;
    translate.value = withTiming(target, { duration: duration.normal });
  }, [translate, direction, distance]);

  const style = useAnimatedStyle(() => ({
    transform: [
      direction === 'up' || direction === 'down'
        ? { translateY: translate.value }
        : { translateX: translate.value },
    ],
  }));

  return { slideIn, slideOut, style, translate };
}

export function useScale(initialScale = 0.8) {
  const scale = useSharedValue(initialScale);

  const scaleIn = useCallback(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  }, [scale]);

  const scaleOut = useCallback(() => {
    scale.value = withTiming(initialScale, { duration: duration.fast });
  }, [scale, initialScale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return { scaleIn, scaleOut, style, scale };
}

export function usePress() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const onPressIn = useCallback(() => {
    scale.value = withTiming(0.96, { duration: duration.fast });
    opacity.value = withTiming(0.8, { duration: duration.fast });
  }, [scale, opacity]);

  const onPressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: duration.fast });
    opacity.value = withTiming(1, { duration: duration.fast });
  }, [scale, opacity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return { onPressIn, onPressOut, style };
}

export function usePulse() {
  const pulse = useSharedValue(1);

  const start = useCallback(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: duration.slow }),
        withTiming(1, { duration: duration.slow })
      ),
      -1,
      true
    );
  }, [pulse]);

  const stop = useCallback(() => {
    pulse.value = withTiming(1, { duration: duration.normal });
  }, [pulse]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return { start, stop, style };
}