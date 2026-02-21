import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  icon,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = useSharedValue(colors.border.DEFAULT);
  const borderWidth = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
    borderWidth: borderWidth.value,
  }));

  const handleFocus = (e: any) => {
    setIsFocused(true);
    borderColor.value = withTiming(colors.primary[500], { duration: 150 });
    borderWidth.value = withTiming(2, { duration: 150 });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    borderColor.value = withTiming(error ? colors.error.DEFAULT : colors.border.DEFAULT, { duration: 150 });
    borderWidth.value = withTiming(1, { duration: 150 });
    onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View
        style={[
          styles.inputContainer,
          animatedStyle,
          { backgroundColor: colors.background.secondary },
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? colors.primary[400] : colors.text.tertiary}
            style={styles.icon}
          />
        )}
        <TextInput
          {...props}
          style={[
            styles.input,
            { color: colors.text.primary },
            icon && styles.inputWithIcon,
            style,
          ]}
          placeholderTextColor={colors.text.tertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </Animated.View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
    ...typography.fontWeight.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    minHeight: 56,
  },
  icon: {
    marginRight: spacing[3],
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    paddingVertical: spacing[3],
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  error: {
    fontSize: typography.fontSize.sm,
    color: colors.error.DEFAULT,
    marginTop: spacing[1],
  },
});