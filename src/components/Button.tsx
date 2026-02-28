import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { usePress } from '@/hooks/useAnimations';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  haptic?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  haptic = true,
  testID,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const { onPressIn, onPressOut, style: animatedStyle } = usePress();

  const handlePress = () => {
    if (haptic && !disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const getBackgroundColor = () => {
    if (disabled) return colors.background.tertiary;
    switch (variant) {
      case 'primary': return colors.primary[600];
      case 'secondary': return colors.background.elevated;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      case 'danger': return colors.error.DEFAULT;
      default: return colors.primary[600];
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.text.disabled;
    switch (variant) {
      case 'primary': return colors.text.primary;
      case 'secondary': return colors.text.primary;
      case 'outline': return colors.primary[400];
      case 'ghost': return colors.primary[400];
      case 'danger': return colors.text.primary;
      default: return colors.text.primary;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm': return { paddingVertical: spacing[2], paddingHorizontal: spacing[3] };
      case 'lg': return { paddingVertical: spacing[4], paddingHorizontal: spacing[6] };
      default: return { paddingVertical: spacing[3], paddingHorizontal: spacing[4] };
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled || loading}
      activeOpacity={1}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={[
        styles.base,
        {
          backgroundColor: getBackgroundColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: colors.primary[600],
          ...getPadding(),
        },
        style,
      ]}
    >
      <Animated.View style={animatedStyle}>
        {loading ? (
          <ActivityIndicator color={getTextColor()} />
        ) : (
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
            {children}
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.fontWeight.semibold,
    fontSize: typography.fontSize.base,
  },
});