import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components';
import { colors, spacing, typography } from '@/constants/theme';

export default function MatchesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Matches</Text>
      </View>

      <View style={styles.content}>
        <EmptyState
          icon="game-controller-outline"
          title="No Matches"
          message="Your scheduled matches will appear here"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    padding: spacing[6],
    paddingBottom: spacing[4],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    color: colors.text.primary,
    ...typography.fontWeight.bold,
  },
  content: {
    flex: 1,
  },
});