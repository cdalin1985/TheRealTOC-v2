import { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Card, EmptyState, LoadingState } from '@/components';
import { useChallenges, useSendChallenge, useRespondToChallenge } from '@/hooks/useChallenges';
import { useRankings } from '@/hooks/useRankings';
import { useCurrentPlayer } from '@/hooks/usePlayer';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

function getCountdown(expiresAt: string | null): { text: string; urgent: boolean } | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return { text: 'Expired', urgent: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 3) return { text: `${days}d left`, urgent: false };
  if (days > 0) return { text: `${days}d ${hours}h left`, urgent: true };
  if (hours > 0) return { text: `${hours}h left`, urgent: true };

  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { text: `${mins}m left`, urgent: true };
}

export default function ChallengesScreen() {
  const { data: challenges, isLoading, refetch } = useChallenges();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);
  const { data: currentPlayer } = useCurrentPlayer();
  const { data: rankings } = useRankings();
  const { mutate: sendChallenge, isPending: isSending } = useSendChallenge();
  const { mutate: respondToChallenge } = useRespondToChallenge();
  const [showNewChallenge, setShowNewChallenge] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  const myRank = rankings?.find((r) => r.id === currentPlayer?.id)?.position ?? null;
  const eligiblePlayers = (rankings ?? []).filter((p) => {
    if (p.id === currentPlayer?.id) return false;
    if (myRank === null) return true;
    if (myRank === 1) return true;
    return Math.abs(p.position - myRank) <= 5;
  });

  const activeChallenges = useMemo(() => {
    if (!challenges) return [];
    return challenges.filter((c) => c.status === 'pending' || c.status === 'accepted');
  }, [challenges]);

  const pastChallenges = useMemo(() => {
    if (!challenges) return [];
    return challenges.filter((c) => c.status !== 'pending' && c.status !== 'accepted');
  }, [challenges]);

  const displayedChallenges = activeTab === 'active' ? activeChallenges : pastChallenges;

  const handleSend = () => {
    if (!currentPlayer?.id || !selectedPlayerId) return;
    sendChallenge(
      { challengerId: currentPlayer.id, challengedId: selectedPlayerId, notes },
      {
        onSuccess: () => {
          setShowNewChallenge(false);
          setSelectedPlayerId(null);
          setNotes('');
        },
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.warning.DEFAULT;
      case 'accepted': return colors.success.DEFAULT;
      case 'declined': case 'cancelled': return colors.error.DEFAULT;
      case 'expired': return colors.text.tertiary;
      default: return colors.text.tertiary;
    }
  };

  const renderChallenge = ({ item }: { item: any }) => {
    const countdown = item.status === 'pending' ? getCountdown(item.expires_at) : null;

    return (
      <Card variant="elevated" style={styles.challengeCard}>
        <View style={styles.challengeHeader}>
          <View style={styles.challengePlayers}>
            <Text style={styles.challengerName}>
              {item.challenger?.display_name ?? 'Unknown'}
            </Text>
            <Ionicons name="arrow-forward" size={16} color={colors.text.tertiary} />
            <Text style={styles.challengedName}>
              {item.challenged?.display_name ?? 'Unknown'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>

        {countdown && (
          <View style={[styles.countdownRow, countdown.urgent && styles.countdownUrgent]}>
            <Ionicons
              name="time-outline"
              size={14}
              color={countdown.urgent ? colors.error.DEFAULT : colors.text.tertiary}
            />
            <Text style={[
              styles.countdownText,
              countdown.urgent && styles.countdownTextUrgent,
            ]}>
              {countdown.text}
            </Text>
          </View>
        )}

        {item.notes && <Text style={styles.notes}>{item.notes}</Text>}

        {item.status === 'pending' && currentPlayer?.id === item.challenged_id && (
          <View style={styles.actions}>
            <Button
              size="sm"
              variant="primary"
              onPress={() => respondToChallenge({ challengeId: item.id, status: 'accepted' })}
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onPress={() => respondToChallenge({ challengeId: item.id, status: 'declined' })}
            >
              Decline
            </Button>
          </View>
        )}
        {item.status === 'pending' && currentPlayer?.id === item.challenger_id && (
          <View style={styles.actions}>
            <Button
              size="sm"
              variant="ghost"
              onPress={() => respondToChallenge({ challengeId: item.id, status: 'cancelled' })}
            >
              Cancel
            </Button>
          </View>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Challenges</Text>
        {currentPlayer && (
          <TouchableOpacity
            style={styles.newButton}
            onPress={() => setShowNewChallenge(true)}
          >
            <Ionicons name="add-circle" size={28} color={colors.primary[400]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active ({activeChallenges.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
            Past ({pastChallenges.length})
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <LoadingState message="Loading challenges..." />
      ) : displayedChallenges.length > 0 ? (
        <FlatList
          data={displayedChallenges}
          keyExtractor={(item) => item.id}
          renderItem={renderChallenge}
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
          icon="trophy-outline"
          title={activeTab === 'active' ? 'No Active Challenges' : 'No Past Challenges'}
          message={activeTab === 'active'
            ? 'Challenge another player to start a match'
            : 'Past challenges will appear here'}
        />
      )}

      <Modal visible={showNewChallenge} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Challenge</Text>
              <TouchableOpacity onPress={() => setShowNewChallenge(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.selectLabel}>
              {myRank === 1
                ? 'Select a player (you can challenge anyone):'
                : `Select a player (within 5 ranks of #${myRank ?? '?'}):`}
            </Text>

            <Text style={styles.expiryNote}>
              Challenge expires in 7 days if not accepted.
            </Text>

            <ScrollView style={styles.playerList}>
              {eligiblePlayers.map((player) => (
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
                    {player.fargoRating != null && (
                      <Text style={styles.playerOptionFargo}>{player.fargoRating}</Text>
                    )}
                  </TouchableOpacity>
                ))}
            </ScrollView>

            <Input
              label="Notes (optional)"
              placeholder="Add a message..."
              value={notes}
              onChangeText={setNotes}
              multiline
            />

            <Button
              onPress={handleSend}
              loading={isSending}
              disabled={!selectedPlayerId}
              size="lg"
            >
              Send Challenge
            </Button>
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
    paddingBottom: spacing[2],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    color: colors.text.primary,
    ...typography.fontWeight.bold,
  },
  newButton: {
    padding: spacing[1],
  },
  // Tabs
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: spacing[4],
    marginBottom: spacing[3],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing[2],
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  tabActive: {
    backgroundColor: colors.primary[600] + '30',
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    ...typography.fontWeight.medium,
  },
  tabTextActive: {
    color: colors.primary[400],
    ...typography.fontWeight.semibold,
  },
  list: {
    padding: spacing[4],
    gap: spacing[3],
  },
  challengeCard: {
    marginBottom: spacing[3],
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengePlayers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  challengerName: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    ...typography.fontWeight.semibold,
  },
  challengedName: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    ...typography.fontWeight.semibold,
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
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: spacing[2],
  },
  countdownUrgent: {
    backgroundColor: colors.error.DEFAULT + '10',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  countdownText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    ...typography.fontWeight.medium,
  },
  countdownTextUrgent: {
    color: colors.error.DEFAULT,
  },
  notes: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[2],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[3],
  },
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
    marginBottom: spacing[1],
    ...typography.fontWeight.medium,
  },
  expiryNote: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing[2],
  },
  playerList: {
    maxHeight: 300,
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
    width: 36,
  },
  playerOptionName: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    flex: 1,
  },
  playerOptionFargo: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
});
