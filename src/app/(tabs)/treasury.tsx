import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardHeader } from '@/components';
import { colors, spacing, typography } from '@/constants/theme';

export default function TreasuryScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Treasury</Text>
      </View>

      <View style={styles.content}>
        <Card variant="elevated">
          <CardHeader title="Current Balance" />
          <Text style={styles.balance}>$1,240.00</Text>
        </Card>

        <Card style={styles.transactionsCard}>
          <CardHeader title="Recent Transactions" />
          <Text style={styles.emptyText}>No transactions yet</Text>
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
  content: {
    padding: spacing[4],
    gap: spacing[4],
  },
  balance: {
    fontSize: typography.fontSize['5xl'],
    color: colors.success.DEFAULT,
    ...typography.fontWeight.bold,
  },
  transactionsCard: {
    marginTop: spacing[2],
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing[8],
  },
});