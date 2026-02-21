import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Card, CardHeader, EmptyState, LoadingState } from '@/components';
import { useTreasury, useTreasuryBalance, useAddTransaction } from '@/hooks/useTreasury';
import { useRankings } from '@/hooks/useRankings';
import { useAuthStore } from '@/stores/authStore';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

const CATEGORIES = [
  { value: 'match_fee', label: 'Match Fee' },
  { value: 'membership_dues', label: 'Membership Dues' },
  { value: 'venue_rental', label: 'Venue Rental' },
  { value: 'trophy_purchase', label: 'Trophy Purchase' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'payout', label: 'Payout' },
  { value: 'other', label: 'Other' },
];

function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  return dollars.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

export default function TreasuryScreen() {
  const { user } = useAuthStore();
  const { data: transactions, isLoading: txLoading, refetch: refetchTx } = useTreasury();
  const { data: balance, isLoading: balLoading, refetch: refetchBal } = useTreasuryBalance();
  const { data: rankings } = useRankings();
  const { mutate: addTransaction, isPending: isAdding } = useAddTransaction();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchTx(), refetchBal()]);
    setRefreshing(false);
  }, [refetchTx, refetchBal]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [txType, setTxType] = useState<'income' | 'expense'>('income');
  const [txCategory, setTxCategory] = useState('match_fee');
  const [txAmount, setTxAmount] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txPlayerId, setTxPlayerId] = useState<string | null>(null);

  const isAdmin = user?.isAdmin === true;

  const resetForm = () => {
    setTxType('income');
    setTxCategory('match_fee');
    setTxAmount('');
    setTxDescription('');
    setTxPlayerId(null);
  };

  const handleAddTransaction = () => {
    if (!user?.id || !txAmount || !txDescription) return;
    const amountCents = Math.round(parseFloat(txAmount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) return;

    addTransaction(
      {
        type: txType,
        category: txCategory,
        amount: amountCents,
        description: txDescription,
        playerId: txPlayerId || undefined,
        adminId: user.id,
      },
      {
        onSuccess: () => {
          setShowAddForm(false);
          resetForm();
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Treasury</Text>
        {isAdmin && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddForm(true)}
          >
            <Ionicons name="add-circle" size={28} color={colors.primary[400]} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[400]}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Card variant="elevated">
              <CardHeader title="Current Balance" />
              {balLoading ? (
                <LoadingState message="Loading..." />
              ) : (
                <View>
                  <Text style={styles.balance}>
                    {formatCurrency(balance?.balance ?? 0)}
                  </Text>
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Income</Text>
                      <Text style={[styles.summaryValue, { color: colors.success.DEFAULT }]}>
                        {formatCurrency(balance?.totalIncome ?? 0)}
                      </Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Expenses</Text>
                      <Text style={[styles.summaryValue, { color: colors.error.DEFAULT }]}>
                        {formatCurrency(balance?.totalExpenses ?? 0)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </Card>

            <CardHeader title="Transactions" />
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.txRow}>
            <View style={styles.txInfo}>
              <Text style={styles.txDescription}>{item.description}</Text>
              <Text style={styles.txMeta}>
                {item.category.replace('_', ' ')}
                {item.player?.display_name ? ` · ${item.player.display_name}` : ''}
              </Text>
              <Text style={styles.txDate}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Text
              style={[
                styles.txAmount,
                { color: item.type === 'income' ? colors.success.DEFAULT : colors.error.DEFAULT },
              ]}
            >
              {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          txLoading ? (
            <LoadingState message="Loading transactions..." />
          ) : (
            <EmptyState
              icon="cash-outline"
              title="No Transactions"
              message="Treasury transactions will appear here"
            />
          )
        }
        contentContainerStyle={styles.list}
      />

      {/* Admin Add Transaction Modal */}
      <Modal visible={showAddForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Transaction</Text>
              <TouchableOpacity onPress={() => { setShowAddForm(false); resetForm(); }}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Type toggle */}
              <Text style={styles.fieldLabel}>Type</Text>
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.toggleBtn, txType === 'income' && styles.toggleBtnActive]}
                  onPress={() => setTxType('income')}
                >
                  <Text style={[styles.toggleText, txType === 'income' && styles.toggleTextActive]}>
                    Income
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, txType === 'expense' && styles.toggleBtnExpenseActive]}
                  onPress={() => setTxType('expense')}
                >
                  <Text style={[styles.toggleText, txType === 'expense' && styles.toggleTextActive]}>
                    Expense
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Category */}
              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.categoryChip,
                      txCategory === cat.value && styles.categoryChipActive,
                    ]}
                    onPress={() => setTxCategory(cat.value)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        txCategory === cat.value && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Amount */}
              <Input
                label="Amount ($)"
                placeholder="0.00"
                value={txAmount}
                onChangeText={setTxAmount}
                keyboardType="decimal-pad"
                icon="cash-outline"
              />

              {/* Description */}
              <Input
                label="Description"
                placeholder="What is this transaction for?"
                value={txDescription}
                onChangeText={setTxDescription}
                icon="document-text-outline"
              />

              {/* Optional player */}
              <Text style={styles.fieldLabel}>Player (optional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.playerScroll}>
                <TouchableOpacity
                  style={[styles.playerChip, !txPlayerId && styles.playerChipActive]}
                  onPress={() => setTxPlayerId(null)}
                >
                  <Text style={[styles.playerChipText, !txPlayerId && styles.playerChipTextActive]}>
                    None
                  </Text>
                </TouchableOpacity>
                {rankings?.map((player) => (
                  <TouchableOpacity
                    key={player.id}
                    style={[styles.playerChip, txPlayerId === player.id && styles.playerChipActive]}
                    onPress={() => setTxPlayerId(player.id)}
                  >
                    <Text
                      style={[
                        styles.playerChipText,
                        txPlayerId === player.id && styles.playerChipTextActive,
                      ]}
                    >
                      {player.displayName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.submitSection}>
                <Button
                  onPress={handleAddTransaction}
                  loading={isAdding}
                  disabled={!txAmount || !txDescription}
                  size="lg"
                >
                  Add {txType === 'income' ? 'Income' : 'Expense'}
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[6],
    paddingBottom: spacing[4],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    color: colors.text.primary,
    ...typography.fontWeight.bold,
  },
  addButton: {
    padding: spacing[1],
  },
  headerSection: {
    gap: spacing[4],
    marginBottom: spacing[2],
  },
  balance: {
    fontSize: typography.fontSize['5xl'],
    color: colors.success.DEFAULT,
    ...typography.fontWeight.bold,
  },
  summaryRow: {
    flexDirection: 'row',
    marginTop: spacing[4],
    gap: spacing[6],
  },
  summaryItem: {},
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: typography.fontSize.lg,
    ...typography.fontWeight.semibold,
    marginTop: 2,
  },
  list: {
    padding: spacing[4],
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  txInfo: {
    flex: 1,
  },
  txDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    ...typography.fontWeight.medium,
  },
  txMeta: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  txDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  txAmount: {
    fontSize: typography.fontSize.base,
    ...typography.fontWeight.bold,
    marginLeft: spacing[3],
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.background.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    padding: spacing[6],
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
    ...typography.fontWeight.bold,
  },
  fieldLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
    marginTop: spacing[3],
    ...typography.fontWeight.medium,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: colors.success.DEFAULT + '30',
    borderWidth: 1,
    borderColor: colors.success.DEFAULT,
  },
  toggleBtnExpenseActive: {
    backgroundColor: colors.error.DEFAULT + '30',
    borderWidth: 1,
    borderColor: colors.error.DEFAULT,
  },
  toggleText: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    ...typography.fontWeight.medium,
  },
  toggleTextActive: {
    color: colors.text.primary,
    ...typography.fontWeight.semibold,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  categoryChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
  },
  categoryChipActive: {
    backgroundColor: colors.primary[600] + '30',
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  categoryChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  categoryChipTextActive: {
    color: colors.primary[400],
    ...typography.fontWeight.medium,
  },
  playerScroll: {
    marginBottom: spacing[4],
  },
  playerChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
    marginRight: spacing[2],
  },
  playerChipActive: {
    backgroundColor: colors.primary[600] + '30',
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  playerChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  playerChipTextActive: {
    color: colors.primary[400],
    ...typography.fontWeight.medium,
  },
  submitSection: {
    marginTop: spacing[4],
    marginBottom: spacing[8],
  },
});
