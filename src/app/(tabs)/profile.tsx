import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, CardHeader } from '@/components';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/hooks/useAuth';
import { useCurrentPlayer, usePlayerStats } from '@/hooks/usePlayer';
import { useRankings } from '@/hooks/useRankings';
import { usePlayerWinStreak } from '@/hooks/useEngagement';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { mutate: logout, isPending } = useLogout();
  const { data: currentPlayer, refetch: refetchPlayer } = useCurrentPlayer();
  const { data: stats, refetch: refetchStats } = usePlayerStats(currentPlayer?.id ?? null);
  const { data: rankings, refetch: refetchRankings } = useRankings();
  const { data: winStreak } = usePlayerWinStreak(currentPlayer?.id ?? null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchPlayer(), refetchStats(), refetchRankings()]);
    setRefreshing(false);
  }, [refetchPlayer, refetchStats, refetchRankings]);

  const myRanking = rankings?.find((r) => r.id === currentPlayer?.id);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[400]}
          />
        }
      >
        <Card variant="elevated">
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(currentPlayer?.display_name ?? user?.displayName ?? '?').charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.name}>
              {currentPlayer?.display_name ?? user?.displayName ?? 'Player'}
            </Text>
            <Text style={styles.email}>{user?.email ?? ''}</Text>

            {myRanking && (
              <View style={styles.rankBadge}>
                <Text style={styles.rankBadgeText}>Rank #{myRanking.position}</Text>
              </View>
            )}
          </View>
        </Card>

        {(currentPlayer?.fargo_rating != null || currentPlayer?.robustness != null) && (
          <Card variant="elevated">
            <CardHeader title="Fargo Rating" />
            <View style={styles.fargoRow}>
              <View style={styles.fargoItem}>
                <Text style={styles.fargoValue}>
                  {currentPlayer.fargo_rating ?? '—'}
                </Text>
                <Text style={styles.fargoLabel}>Rating</Text>
              </View>
              <View style={styles.fargoItem}>
                <Text style={styles.fargoValue}>
                  {currentPlayer.robustness ?? '—'}
                </Text>
                <Text style={styles.fargoLabel}>Robustness</Text>
              </View>
            </View>
          </Card>
        )}

        {winStreak != null && winStreak >= 2 && (
          <Card variant="elevated">
            <View style={styles.streakRow}>
              <Ionicons name="flame" size={24} color={colors.error.DEFAULT} />
              <View>
                <Text style={styles.streakValue}>{winStreak}-game win streak!</Text>
                <Text style={styles.streakLabel}>Keep it going</Text>
              </View>
            </View>
          </Card>
        )}

        {stats && (
          <Card variant="elevated">
            <CardHeader title="Match Stats" />
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.matchesPlayed}</Text>
                <Text style={styles.statLabel}>Played</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.success.DEFAULT }]}>
                  {stats.wins}
                </Text>
                <Text style={styles.statLabel}>Wins</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.error.DEFAULT }]}>
                  {stats.losses}
                </Text>
                <Text style={styles.statLabel}>Losses</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.winRate}%</Text>
                <Text style={styles.statLabel}>Win Rate</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Admin Panel (admins only) */}
        {currentPlayer?.is_admin && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/admin')}
          >
            <Ionicons name="shield-outline" size={22} color={colors.warning.DEFAULT} />
            <Text style={styles.menuItemText}>Admin Panel</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
          </TouchableOpacity>
        )}

        {/* Treasury link */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/treasury')}
        >
          <Ionicons name="wallet-outline" size={22} color={colors.primary[400]} />
          <Text style={styles.menuItemText}>{currentPlayer?.is_admin ? 'Treasury' : 'View Treasury'}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
        </TouchableOpacity>

        <View style={styles.section}>
          <Button
            variant="outline"
            onPress={() => logout()}
            loading={isPending}
          >
            Sign Out
          </Button>
        </View>
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
  profileInfo: {
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
    marginBottom: spacing[4],
  },
  avatarText: {
    fontSize: typography.fontSize['3xl'],
    color: colors.text.primary,
    ...typography.fontWeight.bold,
  },
  name: {
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
    ...typography.fontWeight.semibold,
  },
  email: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  rankBadge: {
    marginTop: spacing[3],
    backgroundColor: colors.primary[600] + '30',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: 20,
  },
  rankBadgeText: {
    color: colors.primary[400],
    fontSize: typography.fontSize.base,
    ...typography.fontWeight.bold,
  },
  fargoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  fargoItem: {
    alignItems: 'center',
  },
  fargoValue: {
    fontSize: typography.fontSize['3xl'],
    color: colors.primary[400],
    ...typography.fontWeight.bold,
  },
  fargoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    color: colors.text.primary,
    ...typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[2],
  },
  streakValue: {
    fontSize: typography.fontSize.base,
    color: colors.error.DEFAULT,
    ...typography.fontWeight.bold,
  },
  streakLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    gap: spacing[3],
  },
  menuItemText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    ...typography.fontWeight.medium,
  },
  section: {
    marginTop: spacing[4],
  },
});
