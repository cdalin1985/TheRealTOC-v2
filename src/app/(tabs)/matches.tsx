import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, EmptyState, LoadingState } from '@/components';
import { useMatches, useUpdateMatchScore, useConfirmMatch, useDisputeMatch } from '@/hooks/useMatches';
import { useCurrentPlayer } from '@/hooks/usePlayer';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

export default function MatchesScreen() {
  const { data: matches, isLoading, refetch } = useMatches();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);
  const { data: currentPlayer } = useCurrentPlayer();
  const { mutate: updateScore, isPending: isUpdating } = useUpdateMatchScore();
  const { mutate: confirmMatch, isPending: isConfirming } = useConfirmMatch();
  const { mutate: disputeMatch } = useDisputeMatch();
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);

  const openScoreEntry = (match: any) => {
    setSelectedMatch(match);
    setP1Score(match.player1_score ?? 0);
    setP2Score(match.player2_score ?? 0);
  };

  const submitScore = () => {
    if (!selectedMatch || !currentPlayer?.id) return;
    const winnerId = p1Score > p2Score
      ? selectedMatch.player1_id
      : selectedMatch.player2_id;

    updateScore(
      {
        matchId: selectedMatch.id,
        player1Score: p1Score,
        player2Score: p2Score,
        winnerId,
        submittedBy: currentPlayer.id,
      },
      {
        onSuccess: () => setSelectedMatch(null),
      }
    );
  };

  const canEditMatch = (match: any) => {
    if (!currentPlayer?.id) return false;
    if (match.status === 'completed' || match.status === 'cancelled') return false;
    return match.player1_id === currentPlayer.id || match.player2_id === currentPlayer.id;
  };

  // Check if the current player needs to confirm the match
  const needsMyConfirmation = (match: any) => {
    if (!currentPlayer?.id) return false;
    if (match.status !== 'in_progress') return false;
    if (!match.submitted_by) return false;
    // The other player submitted - I need to confirm
    const isPlayer1 = match.player1_id === currentPlayer.id;
    if (isPlayer1) return !match.player1_confirmed;
    return !match.player2_confirmed;
  };

  // Check if current player already submitted/confirmed and waiting for opponent
  const waitingForOpponent = (match: any) => {
    if (!currentPlayer?.id) return false;
    if (match.status !== 'in_progress') return false;
    const isPlayer1 = match.player1_id === currentPlayer.id;
    if (isPlayer1) return match.player1_confirmed && !match.player2_confirmed;
    return match.player2_confirmed && !match.player1_confirmed;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return colors.info.DEFAULT;
      case 'in_progress': return colors.warning.DEFAULT;
      case 'completed': return colors.success.DEFAULT;
      case 'cancelled': return colors.error.DEFAULT;
      case 'disputed': return colors.error.light;
      default: return colors.text.tertiary;
    }
  };

  const getStatusLabel = (match: any) => {
    if (needsMyConfirmation(match)) return 'Needs Confirmation';
    if (waitingForOpponent(match)) return 'Awaiting Opponent';
    return match.status.replace('_', ' ');
  };

  const renderMatch = ({ item }: { item: any }) => {
    const showConfirm = needsMyConfirmation(item);
    const showWaiting = waitingForOpponent(item);

    return (
      <TouchableOpacity
        onPress={() => canEditMatch(item) && !showConfirm ? openScoreEntry(item) : null}
        activeOpacity={canEditMatch(item) && !showConfirm ? 0.7 : 1}
      >
        <Card variant="elevated" style={styles.matchCard}>
          <View style={styles.matchHeader}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {getStatusLabel(item)}
              </Text>
            </View>
            {canEditMatch(item) && !showConfirm && (
              <Ionicons name="create-outline" size={18} color={colors.primary[400]} />
            )}
          </View>

          <View style={styles.playersRow}>
            <View style={styles.playerSide}>
              <Text
                style={[
                  styles.playerName,
                  item.winner_id === item.player1_id && styles.winnerName,
                ]}
              >
                {item.player1?.display_name ?? 'TBD'}
              </Text>
              {item.player1_confirmed && (
                <Ionicons name="checkmark-circle" size={14} color={colors.success.DEFAULT} />
              )}
            </View>

            <View style={styles.scoreSection}>
              <Text style={styles.score}>
                {item.player1_score} - {item.player2_score}
              </Text>
            </View>

            <View style={[styles.playerSide, { alignItems: 'flex-end' }]}>
              <Text
                style={[
                  styles.playerName,
                  item.winner_id === item.player2_id && styles.winnerName,
                ]}
              >
                {item.player2?.display_name ?? 'TBD'}
              </Text>
              {item.player2_confirmed && (
                <Ionicons name="checkmark-circle" size={14} color={colors.success.DEFAULT} />
              )}
            </View>
          </View>

          {/* Confirmation actions */}
          {showConfirm && (
            <View style={styles.confirmSection}>
              <Text style={styles.confirmText}>
                {item.submitted_by === item.player1_id
                  ? item.player1?.display_name
                  : item.player2?.display_name} submitted this score. Confirm?
              </Text>
              <View style={styles.confirmActions}>
                <Button
                  size="sm"
                  variant="primary"
                  onPress={() => confirmMatch({ matchId: item.id, playerId: currentPlayer!.id })}
                  loading={isConfirming}
                >
                  Confirm Score
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={() => disputeMatch({ matchId: item.id })}
                >
                  Dispute
                </Button>
              </View>
            </View>
          )}

          {showWaiting && (
            <View style={styles.waitingSection}>
              <Ionicons name="time-outline" size={16} color={colors.text.tertiary} />
              <Text style={styles.waitingText}>
                Waiting for opponent to confirm the score
              </Text>
            </View>
          )}

          {item.location && (
            <Text style={styles.location}>{item.location}</Text>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Matches</Text>
      </View>

      {isLoading ? (
        <LoadingState message="Loading matches..." />
      ) : matches && matches.length > 0 ? (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={renderMatch}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary[400]}
            />
          }
        />
      ) : (
        <EmptyState
          icon="game-controller-outline"
          title="No Matches"
          message="Matches will appear here once challenges are accepted"
        />
      )}

      {/* Score Entry Modal */}
      <Modal visible={!!selectedMatch} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enter Score</Text>
              <TouchableOpacity onPress={() => setSelectedMatch(null)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            {selectedMatch && (
              <View style={styles.scoreEntry}>
                {/* Player 1 */}
                <View style={styles.scorePlayer}>
                  <Text style={styles.scorePlayerName}>
                    {selectedMatch.player1?.display_name ?? 'Player 1'}
                  </Text>
                  <View style={styles.scoreControls}>
                    <TouchableOpacity
                      style={styles.scoreBtn}
                      onPress={() => setP1Score(Math.max(0, p1Score - 1))}
                    >
                      <Ionicons name="remove-circle" size={36} color={colors.error.DEFAULT} />
                    </TouchableOpacity>
                    <Text style={styles.scoreValue}>{p1Score}</Text>
                    <TouchableOpacity
                      style={styles.scoreBtn}
                      onPress={() => setP1Score(p1Score + 1)}
                    >
                      <Ionicons name="add-circle" size={36} color={colors.success.DEFAULT} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.vsText}>VS</Text>

                {/* Player 2 */}
                <View style={styles.scorePlayer}>
                  <Text style={styles.scorePlayerName}>
                    {selectedMatch.player2?.display_name ?? 'Player 2'}
                  </Text>
                  <View style={styles.scoreControls}>
                    <TouchableOpacity
                      style={styles.scoreBtn}
                      onPress={() => setP2Score(Math.max(0, p2Score - 1))}
                    >
                      <Ionicons name="remove-circle" size={36} color={colors.error.DEFAULT} />
                    </TouchableOpacity>
                    <Text style={styles.scoreValue}>{p2Score}</Text>
                    <TouchableOpacity
                      style={styles.scoreBtn}
                      onPress={() => setP2Score(p2Score + 1)}
                    >
                      <Ionicons name="add-circle" size={36} color={colors.success.DEFAULT} />
                    </TouchableOpacity>
                  </View>
                </View>

                {p1Score !== p2Score && (
                  <View style={styles.winnerPreview}>
                    <Ionicons name="trophy" size={20} color={colors.warning.DEFAULT} />
                    <Text style={styles.winnerPreviewText}>
                      Winner: {p1Score > p2Score
                        ? selectedMatch.player1?.display_name
                        : selectedMatch.player2?.display_name}
                    </Text>
                  </View>
                )}

                <Text style={styles.confirmNote}>
                  Your opponent will need to confirm the score before the match is finalized.
                </Text>

                <Button
                  onPress={submitScore}
                  loading={isUpdating}
                  disabled={p1Score === p2Score}
                  size="lg"
                >
                  Submit Score
                </Button>

                {p1Score === p2Score && (
                  <Text style={styles.tieWarning}>
                    Scores can't be tied — adjust to declare a winner
                  </Text>
                )}
              </View>
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
    padding: spacing[6],
    paddingBottom: spacing[4],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    color: colors.text.primary,
    ...typography.fontWeight.bold,
  },
  list: {
    padding: spacing[4],
  },
  matchCard: {
    marginBottom: spacing[3],
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  statusBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    ...typography.fontWeight.semibold,
    textTransform: 'uppercase',
  },
  playersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerSide: {
    flex: 1,
    gap: 4,
  },
  playerName: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    ...typography.fontWeight.medium,
  },
  winnerName: {
    color: colors.success.DEFAULT,
    ...typography.fontWeight.bold,
  },
  scoreSection: {
    paddingHorizontal: spacing[4],
  },
  score: {
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
    ...typography.fontWeight.bold,
  },
  location: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing[2],
  },
  // Confirmation section
  confirmSection: {
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  confirmText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  confirmActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  waitingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  waitingText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  // Modal styles
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
    ...typography.fontWeight.bold,
  },
  scoreEntry: {
    gap: spacing[4],
  },
  scorePlayer: {
    alignItems: 'center',
    gap: spacing[2],
  },
  scorePlayerName: {
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    ...typography.fontWeight.semibold,
  },
  scoreControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[6],
  },
  scoreBtn: {
    padding: spacing[1],
  },
  scoreValue: {
    fontSize: typography.fontSize['4xl'],
    color: colors.text.primary,
    ...typography.fontWeight.bold,
    minWidth: 60,
    textAlign: 'center',
  },
  vsText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.tertiary,
    textAlign: 'center',
    ...typography.fontWeight.bold,
  },
  winnerPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    backgroundColor: colors.warning.DEFAULT + '15',
    borderRadius: borderRadius.lg,
  },
  winnerPreviewText: {
    fontSize: typography.fontSize.base,
    color: colors.warning.DEFAULT,
    ...typography.fontWeight.semibold,
  },
  confirmNote: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  tieWarning: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
