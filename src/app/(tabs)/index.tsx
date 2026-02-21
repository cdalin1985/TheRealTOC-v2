import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardHeader } from '@/components';
import { colors, spacing, typography } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>TheRealTOC</Text>
        <Text style={styles.subtitle}>Welcome back!</Text>
      </View>

      <View style={styles.content}>
        <Card variant="elevated">
          <CardHeader
            title="Quick Stats"
            subtitle="Your performance this season"
          />
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>#3</Text>
              <Text style={styles.statLabel}>Rank</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.activityCard}>
          <CardHeader title="Recent Activity" />
          <Text style={styles.emptyText}>No recent activity</Text>
        </Card>
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
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  content: {
    padding: spacing[4],
    gap: spacing[4],
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize['3xl'],
    color: colors.primary[400],
    ...typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  activityCard: {
    marginTop: spacing[2],
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing[8],
  },
});