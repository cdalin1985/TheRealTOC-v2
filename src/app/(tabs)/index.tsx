import { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card, CardHeader, LoadingState } from '@/components';
import { useRankings } from '@/hooks/useRankings';
import { useActivity } from '@/hooks/useActivity';
import { useChallenges } from '@/hooks/useChallenges';
import { useMatches } from '@/hooks/useMatches';
import { useCurrentPlayer } from '@/hooks/usePlayer';
import { useAuthStore } from '@/stores/authStore';
import { useSeasonStats } from '@/hooks/useEngagement';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { data: currentPlayer } = useCurrentPlayer();
  const { data: rankings, isLoading: rankingsLoading, refetch: refetchRankings } = useRankings();
  const { data: activities, isLoading: activitiesLoading, refetch: refetchActivity } = useActivity(15);
  const { data: challenges, refetch: refetchChallenges } = useChallenges();
  const { data: matches, refetch: refetchMatches } = useMatches();
  const { data: seasonStats, refetch: refetchStats } = useSeasonStats();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchRankings(), refetchActivity(), refetchChallenges(), refetchMatches(), refetchStats()]);
    setRefreshing(false);
  }, [refetchRankings, refetchActivity, refetchChallenges, refetchMatches, refetchStats]);

  // My pending challenges (received)
  const myPendingChallenges = useMemo(() => {
    if (!challenges || !currentPlayer?.id) return [];
    return challenges.filter(
      (c) => c.status === 'pending' && c.challenged_id === currentPlayer.id
    );
  }, [challenges, currentPlayer?.id]);

  // Active challenges (all pending/accepted)
  const activeChallenges = useMemo(() => {
    if (!challenges) return [];
    return challenges.filter(
      (c) => c.status === 'pending' || c.status === 'accepted'
    ).slice(0, 5);
  }, [challenges]);

  // Recent completed matches
  const recentResults = useMemo(() => {
    if (!matches) return [];
    return matches.filter((m) => m.status === 'completed').slice(0, 5);
  }, [matches]);

  // My rank
  const myRank = rankings?.find((r) => r.id === currentPlayer?.id);

  const topPlayers = rankings?.slice(0, 5) ?? [];

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>TheRealTOC</Text>
          <Text style={styles.subtitle}>
            Welcome back{user?.displayName ? `, ${user.displayName}` : ''}!
          </Text>
        </View>
        {myRank && (
          <View style={styles.myRankBadge}>
            <Text style={styles.myRankText}>#{myRank.position}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={[]}
        renderItem={null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[400]}
          />
        }
        ListHeaderComponent={
          <View style={styles.content}>
            {/* Pending challenges alert */}
            {myPendingChallenges.length > 0 && (
              <TouchableOpacity
                style={styles.alertBanner}
                onPress={() => router.push('/challenges')}
              >
                <Ionicons name="flash" size={20} color={colors.warning.DEFAULT} />
                <Text style={styles.alertText}>
                  You have {myPendingChallenges.length} pending challenge{myPendingChallenges.length > 1 ? 's' : ''}!
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.warning.DEFAULT} />
              </TouchableOpacity>
            )}

            {/* Season Stats & Engagement */}
            {seasonStats && (seasonStats.totalMatches > 0 || seasonStats.topWinStreak || seasonStats.mostWantedId) && (
              <Card variant="elevated">
                <CardHeader title="Season Highlights" />
                <View style={styles.highlightsGrid}>
                  <View style={styles.highlightItem}>
                    <Text style={styles.highlightValue}>{seasonStats.totalMatches}</Text>
                    <Text style={styles.highlightLabel}>Matches Played</Text>
                  </View>
                  <View style={styles.highlightItem}>
                    <Text style={styles.highlightValue}>{seasonStats.totalChallenges}</Text>
                    <Text style={styles.highlightLabel}>Challenges</Text>
                  </View>
                  <View style={styles.highlightItem}>
                    <Text style={styles.highlightValue}>{seasonStats.activeChallenges}</Text>
                    <Text style={styles.highlightLabel}>Active</Text>
                  </View>
                </View>

                {seasonStats.topWinStreak && seasonStats.topWinStreak.streak >= 2 && (
                  <View style={styles.streakBanner}>
                    <Ionicons name="flame" size={18} color={colors.error.DEFAULT} />
                    <Text style={styles.streakText}>
                      {seasonStats.topWinStreak.playerName} is on a {seasonStats.topWinStreak.streak}-game win streak!
                    </Text>
                  </View>
                )}

                {seasonStats.mostWantedId && seasonStats.mostWantedChallenges >= 2 && (
                  <TouchableOpacity
                    style={styles.mostWantedBanner}
                    onPress={() => router.push({ pathname: '/player/[id]', params: { id: seasonStats.mostWantedId! } })}
                  >
                    <Ionicons name="star" size={18} color={colors.warning.DEFAULT} />
                    <Text style={styles.mostWantedText}>
                      Most Wanted: {seasonStats.mostWantedName} ({seasonStats.mostWantedChallenges} challenges)
                    </Text>
                  </TouchableOpacity>
                )}
              </Card>
            )}

            {/* Active Challenges */}
            {activeChallenges.length > 0 && (
              <Card variant="elevated">
                <CardHeader
                  title="Active Challenges"
                  subtitle={`${activeChallenges.length} open`}
                />
                {activeChallenges.map((challenge) => {
                  const timeLeft = challenge.expires_at
                    ? Math.max(0, Math.ceil((new Date(challenge.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                    : null;

                  return (
                    <View key={challenge.id} style={styles.challengeRow}>
                      <View style={styles.challengeNames}>
                        <Text style={styles.challengerText}>
                          {challenge.challenger?.display_name ?? 'Unknown'}
                        </Text>
                        <Ionicons name="flash" size={14} color={colors.primary[400]} />
                        <Text style={styles.challengedText}>
                          {challenge.challenged?.display_name ?? 'Unknown'}
                        </Text>
                      </View>
                      <View style={styles.challengeMeta}>
                        <View style={[
                          styles.statusDot,
                          { backgroundColor: challenge.status === 'pending' ? colors.warning.DEFAULT : colors.success.DEFAULT },
                        ]} />
                        {timeLeft !== null && timeLeft <= 3 && (
                          <Text style={styles.expiresText}>{timeLeft}d left</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
                <TouchableOpacity
                  style={styles.seeAllBtn}
                  onPress={() => router.push('/challenges')}
                >
                  <Text style={styles.seeAllText}>See All Challenges</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.primary[400]} />
                </TouchableOpacity>
              </Card>
            )}

            {/* Recent Results */}
            {recentResults.length > 0 && (
              <Card variant="elevated">
                <CardHeader title="Recent Results" />
                {recentResults.map((match) => (
                  <View key={match.id} style={styles.resultRow}>
                    <View style={styles.resultPlayers}>
                      <Text style={[
                        styles.resultName,
                        match.winner_id === match.player1_id && styles.winnerText,
                      ]}>
                        {match.player1?.display_name ?? 'TBD'}
                      </Text>
                      <Text style={styles.resultScore}>
                        {match.player1_score} - {match.player2_score}
                      </Text>
                      <Text style={[
                        styles.resultName,
                        match.winner_id === match.player2_id && styles.winnerText,
                      ]}>
                        {match.player2?.display_name ?? 'TBD'}
                      </Text>
                    </View>
                    <Text style={styles.resultTime}>
                      {getTimeAgo(match.completed_at ?? match.created_at)}
                    </Text>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.seeAllBtn}
                  onPress={() => router.push('/matches')}
                >
                  <Text style={styles.seeAllText}>See All Matches</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.primary[400]} />
                </TouchableOpacity>
              </Card>
            )}

            {/* Top 5 Standings */}
            <Card variant="elevated">
              <CardHeader
                title="League Standings"
                subtitle={`${rankings?.length ?? 0} active players`}
              />
              {rankingsLoading ? (
                <LoadingState message="Loading standings..." />
              ) : (
                <View>
                  {topPlayers.map((player) => (
                    <TouchableOpacity
                      key={player.id}
                      style={styles.rankRow}
                      onPress={() => router.push({ pathname: '/player/[id]', params: { id: player.id } })}
                    >
                      <Text style={[
                        styles.rankPosition,
                        player.position <= 3 && styles.topRankPosition,
                      ]}>
                        #{player.position}
                      </Text>
                      <View style={styles.rankInfo}>
                        <Text style={styles.rankName}>{player.displayName}</Text>
                        {player.fargoRating != null && (
                          <Text style={styles.rankFargo}>Fargo: {player.fargoRating}</Text>
                        )}
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.seeAllBtn}
                    onPress={() => router.push('/standings')}
                  >
                    <Text style={styles.seeAllText}>View Full Standings</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.primary[400]} />
                  </TouchableOpacity>
                </View>
              )}
            </Card>

            {/* Activity Feed */}
            <Card>
              <CardHeader title="Recent Activity" />
              {activitiesLoading ? (
                <LoadingState message="Loading activity..." />
              ) : activities && activities.length > 0 ? (
                activities.map((activity: any) => (
                  <View key={activity.id} style={styles.activityRow}>
                    <Text style={styles.activityText}>
                      {activity.description}
                    </Text>
                    <Text style={styles.activityTime}>
                      {getTimeAgo(activity.created_at)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No recent activity</Text>
              )}
            </Card>
          </View>
        }
      />
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
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  myRankBadge: {
    backgroundColor: colors.primary[600] + '30',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: 20,
  },
  myRankText: {
    color: colors.primary[400],
    fontSize: typography.fontSize.lg,
    ...typography.fontWeight.bold,
  },
  content: {
    padding: spacing[4],
    gap: spacing[4],
  },
  // Alert banner
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning.DEFAULT + '20',
    borderWidth: 1,
    borderColor: colors.warning.DEFAULT + '40',
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    gap: spacing[2],
  },
  alertText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.warning.DEFAULT,
    ...typography.fontWeight.semibold,
  },
  // Season highlights
  highlightsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing[3],
  },
  highlightItem: {
    alignItems: 'center',
  },
  highlightValue: {
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
    ...typography.fontWeight.bold,
  },
  highlightLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.error.DEFAULT + '15',
    padding: spacing[2],
    borderRadius: borderRadius.md,
    marginBottom: spacing[2],
  },
  streakText: {
    fontSize: typography.fontSize.sm,
    color: colors.error.DEFAULT,
    ...typography.fontWeight.semibold,
    flex: 1,
  },
  mostWantedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.warning.DEFAULT + '15',
    padding: spacing[2],
    borderRadius: borderRadius.md,
  },
  mostWantedText: {
    fontSize: typography.fontSize.sm,
    color: colors.warning.DEFAULT,
    ...typography.fontWeight.semibold,
    flex: 1,
  },
  // Challenge rows
  challengeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  challengeNames: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  challengerText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    ...typography.fontWeight.medium,
  },
  challengedText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    ...typography.fontWeight.medium,
  },
  challengeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  expiresText: {
    fontSize: typography.fontSize.xs,
    color: colors.error.DEFAULT,
    ...typography.fontWeight.medium,
  },
  // See all button
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing[3],
    gap: spacing[1],
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[400],
    ...typography.fontWeight.medium,
  },
  // Result rows
  resultRow: {
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  resultPlayers: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultName: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    ...typography.fontWeight.medium,
    flex: 1,
  },
  winnerText: {
    color: colors.success.DEFAULT,
    ...typography.fontWeight.bold,
  },
  resultScore: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    ...typography.fontWeight.bold,
    paddingHorizontal: spacing[3],
  },
  resultTime: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  // Rankings
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  rankPosition: {
    fontSize: typography.fontSize.lg,
    color: colors.primary[400],
    ...typography.fontWeight.bold,
    width: 40,
  },
  topRankPosition: {
    color: colors.warning.DEFAULT,
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    ...typography.fontWeight.medium,
  },
  rankFargo: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  // Activity
  activityRow: {
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  activityText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  activityTime: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing[8],
  },
});
