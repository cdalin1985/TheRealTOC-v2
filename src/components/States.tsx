import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/constants/theme';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary[500]} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={48} color={colors.error.DEFAULT} />
      <Text style={[styles.message, { color: colors.error.DEFAULT }]}>{message}</Text>
      {onRetry && (
        <Text style={styles.retry} onPress={onRetry}>
          Tap to retry
        </Text>
      )}
    </View>
  );
}

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
}

export function EmptyState({ icon = 'inbox-outline', title, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={colors.text.tertiary} />
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  title: {
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    ...typography.fontWeight.semibold,
    marginTop: spacing[4],
  },
  message: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginTop: spacing[2],
    textAlign: 'center',
  },
  retry: {
    fontSize: typography.fontSize.base,
    color: colors.primary[400],
    marginTop: spacing[4],
    ...typography.fontWeight.medium,
  },
});