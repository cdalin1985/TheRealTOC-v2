import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Button, Card, CardHeader, Input } from '@/components';
import { useRankings } from '@/hooks/useRankings';
import { useMatches } from '@/hooks/useMatches';
import { useCurrentPlayer } from '@/hooks/usePlayer';
import { supabase } from '@/api/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

export default function AdminScreen() {
  const { data: currentPlayer } = useCurrentPlayer();
  const { data: rankings } = useRankings();
  const { data: matches } = useMatches();
  const queryClient = useQueryClient();

  const [showRankEdit, setShowRankEdit] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [newPosition, setNewPosition] = useState('');
  const [saving, setSaving] = useState(false);

  // Compute filtered matches before any early returns (hooks rule)
  const disputedMatches = useMemo(() => {
    if (!matches) return [];
    return matches.filter((m) => m.status === 'disputed');
  }, [matches]);

  const pendingMatches = useMemo(() => {
    if (!matches) return [];
    return matches.filter((m) => m.status === 'in_progress');
  }, [matches]);

  // Only admins can access
  if (currentPlayer && !currentPlayer.is_admin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>You don't have admin access.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleMoveRank = async () => {
    if (!selectedPlayerId || !newPosition) return;
    const pos = parseInt(newPosition, 10);
    if (isNaN(pos) || pos < 1 || pos > (rankings?.length ?? 70)) {
      Alert.alert('Invalid Position', `Enter a number between 1 and ${rankings?.length ?? 70}`);
      return;
    }

    setSaving(true);
    try {
      // Get current position of selected player
      const currentRank = rankings?.find((r) => r.id === selectedPlayerId);
      if (!currentRank) throw new Error('Player not in rankings');

      const oldPos = currentRank.position;
      if (oldPos === pos) {
        setShowRankEdit(false);
        setSaving(false);
        return;
      }

      // Save previous positions for all affected
      if (oldPos < pos) {
        // Moving down: shift everyone between old+1 and new up by 1
        await supabase
          .from('rankings')
          .update({ previous_position: oldPos })
          .eq('player_id', selectedPlayerId);

        // Using raw SQL for the shift since we need a range update
        await supabase.rpc('admin_move_ranking', {
          p_player_id: selectedPlayerId,
          p_new_position: pos,
        });
      } else {
        // Moving up: shift everyone between new and old-1 down by 1
        await supabase.rpc('admin_move_ranking', {
          p_player_id: selectedPlayerId,
          p_new_position: pos,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['rankings'] });
      setShowRankEdit(false);
      setSelectedPlayerId(null);
      setNewPosition('');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to update ranking');
    }
    setSaving(false);
  };

  const resolveDispute = async (matchId: string, action: 'reset' | 'cancel' | 'complete') => {
    setSaving(true);
    try {
      if (action === 'cancel') {
        await supabase
          .from('matches')
          .update({ status: 'cancelled' })
          .eq('id', matchId);
      } else if (action === 'reset') {
        await supabase
          .from('matches')
          .update({
            status: 'scheduled',
            player1_score: 0,
            player2_score: 0,
            winner_id: null,
            player1_confirmed: false,
            player2_confirmed: false,
            submitted_by: null,
            completed_at: null,
          })
          .eq('id', matchId);
      } else if (action === 'complete') {
        // Force complete with current scores
        const match = matches?.find((m) => m.id === matchId);
        if (match && match.player1_score !== match.player2_score) {
          const winnerId = match.player1_score > match.player2_score
            ? match.player1_id
            : match.player2_id;
          await supabase
            .from('matches')
            .update({
              status: 'completed',
              winner_id: winnerId,
              player1_confirmed: true,
              player2_confirmed: true,
              completed_at: new Date().toISOString(),
            })
            .eq('id', matchId);
        }
      }
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to resolve dispute');
    }
    setSaving(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Disputed Matches */}
        <Card variant="elevated">
          <CardHeader
            title="Disputed Matches"
            subtitle={`${disputedMatches.length} disputes`}
          />
          {disputedMatches.length === 0 ? (
            <Text style={styles.emptyText}>No disputes</Text>
          ) : (
            disputedMatches.map((match) => (
              <View key={match.id} style={styles.disputeRow}>
                <View style={styles.disputeInfo}>
                  <Text style={styles.disputeNames}>
                    {match.player1?.display_name} vs {match.player2?.display_name}
                  </Text>
                  <Text style={styles.disputeScore}>
                    Score: {match.player1_score} - {match.player2_score}
                  </Text>
                </View>
                <View style={styles.disputeActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionReset]}
                    onPress={() => resolveDispute(match.id, 'reset')}
                  >
                    <Text style={styles.actionBtnText}>Reset</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionComplete]}
                    onPress={() => resolveDispute(match.id, 'complete')}
                  >
                    <Text style={styles.actionBtnText}>Force Complete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionCancel]}
                    onPress={() => resolveDispute(match.id, 'cancel')}
                  >
                    <Text style={styles.actionBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </Card>

        {/* Pending Matches (in progress, awaiting confirmation) */}
        <Card variant="elevated">
          <CardHeader
            title="Pending Matches"
            subtitle={`${pendingMatches.length} awaiting confirmation`}
          />
          {pendingMatches.length === 0 ? (
            <Text style={styles.emptyText}>No pending matches</Text>
          ) : (
            pendingMatches.map((match) => (
              <View key={match.id} style={styles.disputeRow}>
                <View style={styles.disputeInfo}>
                  <Text style={styles.disputeNames}>
                    {match.player1?.display_name} vs {match.player2?.display_name}
                  </Text>
                  <Text style={styles.disputeScore}>
                    Score: {match.player1_score} - {match.player2_score}
                    {match.player1_confirmed ? ' | P1 confirmed' : ''}
                    {match.player2_confirmed ? ' | P2 confirmed' : ''}
                  </Text>
                </View>
                <View style={styles.disputeActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionComplete]}
                    onPress={() => resolveDispute(match.id, 'complete')}
                  >
                    <Text style={styles.actionBtnText}>Force Complete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionCancel]}
                    onPress={() => resolveDispute(match.id, 'cancel')}
                  >
                    <Text style={styles.actionBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </Card>

        {/* Manual Ranking Adjustment */}
        <Card variant="elevated">
          <CardHeader title="Adjust Rankings" subtitle="Manually move a player" />
          <Button
            variant="outline"
            onPress={() => setShowRankEdit(true)}
          >
            Move Player Rank
          </Button>
        </Card>

        {/* Expire Challenges */}
        <Card variant="elevated">
          <CardHeader title="Expire Overdue Challenges" subtitle="Run manually" />
          <Button
            variant="outline"
            onPress={async () => {
              const { data, error } = await supabase.rpc('expire_overdue_challenges');
              if (error) {
                Alert.alert('Error', error.message);
              } else {
                Alert.alert('Done', `${data ?? 0} challenges expired`);
                queryClient.invalidateQueries({ queryKey: ['challenges'] });
              }
            }}
          >
            Expire Challenges Now
          </Button>
        </Card>
      </ScrollView>

      {/* Rank Edit Modal */}
      <Modal visible={showRankEdit} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Move Player</Text>
              <TouchableOpacity onPress={() => { setShowRankEdit(false); setSelectedPlayerId(null); }}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.selectLabel}>Select player:</Text>
            <ScrollView style={styles.playerList}>
              {(rankings ?? []).map((player) => (
                <TouchableOpacity
                  key={player.id}
                  style={[
                    styles.playerOption,
                    selectedPlayerId === player.id && styles.playerOptionSelected,
                  ]}
                  onPress={() => setSelectedPlayerId(player.id)}
                >
                  <Text style={styles.playerOptionRank}>#{player.position}</Text>
                  <Text style={styles.playerOptionName}>{player.displayName}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectedPlayerId && (
              <>
                <Input
                  label="New Position"
                  placeholder="Enter new rank number..."
                  value={newPosition}
                  onChangeText={setNewPosition}
                  keyboardType="number-pad"
                />
                <Button
                  onPress={handleMoveRank}
                  loading={saving}
                  disabled={!newPosition}
                  size="lg"
                >
                  Move Player
                </Button>
              </>
            )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    paddingBottom: spacing[2],
  },
  backBtn: {
    padding: spacing[1],
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    ...typography.fontWeight.semibold,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.error.DEFAULT,
  },
  content: {
    padding: spacing[4],
    gap: spacing[4],
    paddingBottom: spacing[8],
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing[4],
  },
  disputeRow: {
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  disputeInfo: {
    marginBottom: spacing[2],
  },
  disputeNames: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    ...typography.fontWeight.medium,
  },
  disputeScore: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  disputeActions: {
    flexDirection: 'row',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  actionBtn: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.md,
  },
  actionReset: {
    backgroundColor: colors.warning.DEFAULT + '20',
  },
  actionComplete: {
    backgroundColor: colors.success.DEFAULT + '20',
  },
  actionCancel: {
    backgroundColor: colors.error.DEFAULT + '20',
  },
  actionBtnText: {
    fontSize: typography.fontSize.xs,
    ...typography.fontWeight.semibold,
    color: colors.text.primary,
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
    maxHeight: '85%',
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
  selectLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
    ...typography.fontWeight.medium,
  },
  playerList: {
    maxHeight: 250,
    marginBottom: spacing[4],
  },
  playerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[1],
  },
  playerOptionSelected: {
    backgroundColor: colors.primary[600] + '30',
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  playerOptionRank: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[400],
    ...typography.fontWeight.bold,
    width: 40,
  },
  playerOptionName: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    flex: 1,
  },
});
