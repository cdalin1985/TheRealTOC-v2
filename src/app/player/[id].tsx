import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { Card, CardHeader, LoadingState } from '@/components';
import { usePlayerProfile, useRankings } from '@/hooks/useRankings';
import { usePlayerStats } from '@/hooks/usePlayer';
import { useMyMatches } from '@/hooks/useMatches';
import { usePlayerWinStreak } from '@/hooks/useEngagement';
import { colors, spacing, typography } from '@/constants/theme';

export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: player, isLoading: playerLoading } = usePlayerProfile(id);
  const { data: stats } = usePlayerStats(id ?? null);
  const { data: rankings } = useRankings();
  const { data: matches } = useMyMatches(id ?? null);
  const { data: winStreak } = usePlayerWinStreak(id ?? null);

  const ranking = rankings?.find((r) => r.id === id);

  // Calculate head-to-head records against each opponent
  const h2hRecords = useMemo(() => {
    if (!matches || !id) return [];

    const opponentMap = new Map<string, {
      opponentId: string;
      opponentName: string;
      wins: number;
      losses: number;
    }>();

    for (const match of matches) {
      if (match.status !== 'completed' || !match.winner_id) continue;

      const isPlayer1 = match.player1_id === id;
      const opponentId = isPlayer1 ? match.player2_id : match.player1_id;
      const opponentName = isPlayer1
        ? (match.player2?.display_name ?? 'Unknown')
        : (match.player1?.display_name ?? 'Unknown');
      const won = match.winner_id === id;

      const existing = opponentMap.get(opponentId) ?? {
        opponentId,
        opponentName,
        wins: 0,
        losses: 0,
      };

      if (won) existing.wins++;
      else existing.losses++;

      opponentMap.set(opponentId, existing);
    }

    return Array.from(opponentMap.values()).sort(
      (a, b) => (b.wins + b.losses) - (a.wins + a.losses)
    );
  }, [matches, id]);

  // Recent match history
  const recentMatches = useMemo(() => {
    if (!matches) return [];
    return matches
      .filter((m) => m.status === 'completed')
      .slice(0, 10);
  }, [matches]);

  if (playerLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState message="Loading player..." />
      </SafeAreaView>
    );
  }

  if (!player) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Player Not Found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{player.display_name}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <Card variant="elevated">
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(player.display_name ?? '?').charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.playerName}>{player.display_name}</Text>
            {ranking && (
              <View style={styles.rankBadge}>
                <Text style={styles.rankBadgeText}>Rank #{ranking.position}</Text>
              </View>
            )}
            {winStreak != null && winStreak >= 2 && (
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={16} color={colors.error.DEFAULT} />
                <Text style={styles.streakBadgeText}>{winStreak}-game win streak</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Stats Row */}
        <Card variant="elevated">
          <View style={styles.statsGrid}>
            {player.fargo_rating != null && (
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{player.fargo_rating}</Text>
                <Text style={styles.statLabel}>Fargo</Text>
              </View>
            )}
            {player.robustness != null && (
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{player.robustness}</Text>
                <Text style={styles.statLabel}>Robustness</Text>
              </View>
            )}
            {stats && (
              <>
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: colors.success.DEFAULT }]}>
                    {stats.wins}
                  </Text>
                  <Text style={styles.statLabel}>Wins</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: colors.error.DEFAULT }]}>
                    {stats.losses}
                  </Text>
                  <Text style={styles.statLabel}>Losses</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{stats.winRate}%</Text>
                  <Text style={styles.statLabel}>Win Rate</Text>
                </View>
              </>
            )}
          </View>
        </Card>

        {/* Head-to-Head Records */}
        {h2hRecords.length > 0 && (
          <Card variant="elevated">
            <CardHeader title="Head-to-Head" subtitle={`${h2hRecords.length} opponents`} />
            {h2hRecords.map((record) => (
              <TouchableOpacity
                key={record.opponentId}
                style={styles.h2hRow}
                onPress={() => router.push({ pathname: '/player/[id]', params: { id: record.opponentId } })}
              >
                <Text style={styles.h2hName}>{record.opponentName}</Text>
                <View style={styles.h2hRecord}>
                  <Text style={[styles.h2hWins, { color: colors.success.DEFAULT }]}>
                    {record.wins}W
                  </Text>
                  <Text style={styles.h2hDash}> - </Text>
                  <Text style={[styles.h2hLosses, { color: colors.error.DEFAULT }]}>
                    {record.losses}L
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
              </TouchableOpacity>
            ))}
          </Card>
        )}

        {/* Recent Matches */}
        {recentMatches.length > 0 && (
          <Card variant="elevated">
            <CardHeader title="Recent Matches" />
            {recentMatches.map((match) => {
              const isPlayer1 = match.player1_id === id;
              const won = match.winner_id === id;
              const opponent = isPlayer1
                ? match.player2?.display_name
                : match.player1?.display_name;
              const myScore = isPlayer1 ? match.player1_score : match.player2_score;
              const theirScore = isPlayer1 ? match.player2_score : match.player1_score;

              return (
                <View key={match.id} style={styles.matchRow}>
                  <View style={[styles.resultDot, { backgroundColor: won ? colors.success.DEFAULT : colors.error.DEFAULT }]} />
                  <View style={styles.matchInfo}>
                    <Text style={styles.matchOpponent}>
                      vs {opponent ?? 'Unknown'}
                    </Text>
                    <Text style={styles.matchDate}>
                      {new Date(match.completed_at ?? match.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={[styles.matchScore, won ? styles.wonScore : styles.lostScore]}>
                    {myScore} - {theirScore}
                  </Text>
                </View>
              );
            })}
          </Card>
        )}

        {h2hRecords.length === 0 && recentMatches.length === 0 && (
          <Card variant="elevated">
            <View style={styles.emptySection}>
              <Ionicons name="game-controller-outline" size={48} color={colors.text.tertiary} />
              <Text style={styles.emptyText}>No match history yet</Text>
            </View>
          </Card>
        )}
      </ScrollView>
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
  content: {
    padding: spacing[4],
    gap: spacing[4],
    paddingBottom: spacing[8],
  },
  profileSection: {
    alignItems: 'center',
    padding: spacing[6],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  avatarText: {
    fontSize: typography.fontSize['3xl'],
    color: colors.text.primary,
    ...typography.fontWeight.bold,
  },
  playerName: {
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
    ...typography.fontWeight.bold,
  },
  rankBadge: {
    marginTop: spacing[2],
    backgroundColor: colors.primary[600] + '30',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[1],
    borderRadius: 16,
  },
  rankBadgeText: {
    color: colors.primary[400],
    fontSize: typography.fontSize.sm,
    ...typography.fontWeight.bold,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: spacing[2],
    backgroundColor: colors.error.DEFAULT + '15',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 16,
  },
  streakBadgeText: {
    color: colors.error.DEFAULT,
    fontSize: typography.fontSize.sm,
    ...typography.fontWeight.semibold,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: spacing[2],
  },
  statBox: {
    alignItems: 'center',
    minWidth: 60,
    paddingVertical: spacing[2],
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
    ...typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  h2hRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  h2hName: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    ...typography.fontWeight.medium,
  },
  h2hRecord: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing[2],
  },
  h2hWins: {
    fontSize: typography.fontSize.sm,
    ...typography.fontWeight.bold,
  },
  h2hDash: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  h2hLosses: {
    fontSize: typography.fontSize.sm,
    ...typography.fontWeight.bold,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  resultDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing[3],
  },
  matchInfo: {
    flex: 1,
  },
  matchOpponent: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    ...typography.fontWeight.medium,
  },
  matchDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  matchScore: {
    fontSize: typography.fontSize.base,
    ...typography.fontWeight.bold,
  },
  wonScore: {
    color: colors.success.DEFAULT,
  },
  lostScore: {
    color: colors.error.DEFAULT,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: spacing[8],
    gap: spacing[3],
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
  },
});
