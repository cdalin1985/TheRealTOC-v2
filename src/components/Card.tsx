import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows, typography } from '@/constants/theme';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'glass';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
  testID?: string;
}

export function Card({
  children,
  variant = 'default',
  style,
  padding = 4,
  testID,
}: CardProps) {
  const getStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.background.elevated,
          ...shadows.md,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.border.DEFAULT,
        };
      case 'glass':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
        };
      default:
        return {
          backgroundColor: colors.background.secondary,
        };
    }
  };

  return (
    <View
      testID={testID}
      style={[
        styles.base,
        getStyles(),
        { padding: spacing[padding] },
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <View style={headerStyles.container}>
      <View style={headerStyles.textContainer}>
        <Text style={headerStyles.title}>{title}</Text>
        {subtitle && <Text style={headerStyles.subtitle}>{subtitle}</Text>}
      </View>
      {action && <View>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.xl,
  },
});

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    ...typography.fontWeight.semibold,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
});