import { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card, LoadingState, EmptyState } from '@/components';
import { useRankings } from '@/hooks/useRankings';
import { useSeasonStats } from '@/hooks/useEngagement';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

export default function StandingsScreen() {
  const { data: rankings, isLoading, refetch } = useRankings();
  const { data: seasonStats } = useSeasonStats();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const filtered = useMemo(() => {
    if (!rankings) return [];
    if (!search.trim()) return rankings;
    const q = search.toLowerCase().trim();
    return rankings.filter((p) =>
      p.displayName.toLowerCase().includes(q)
    );
  }, [rankings, search]);

  const mostWantedId = seasonStats?.mostWantedId ?? null;

  const getRankChangeIcon = (player: any) => {
    if (player.previousPosition === null || player.previousPosition === undefined) return null;
    const diff = player.previousPosition - player.position;
    if (diff > 0) return { name: 'arrow-up' as const, color: colors.success.DEFAULT, diff };
    if (diff < 0) return { name: 'arrow-down' as const, color: colors.error.DEFAULT, diff: Math.abs(diff) };
    return null;
  };

  const renderPlayer = ({ item }: { item: any }) => {
    const rankChange = getRankChangeIcon(item);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push({ pathname: '/player/[id]', params: { id: item.id } })}
      >
        <View style={styles.playerRow}>
          <View style={styles.rankCol}>
            <Text style={[
              styles.rankNum,
              item.position <= 3 && styles.topRank,
            ]}>
              #{item.position}
            </Text>
            {rankChange && (
              <View style={styles.rankChange}>
                <Ionicons name={rankChange.name} size={12} color={rankChange.color} />
                <Text style={[styles.rankChangeDiff, { color: rankChange.color }]}>
                  {rankChange.diff}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.infoCol}>
            <View style={styles.nameRow}>
              <Text style={styles.playerName}>{item.displayName}</Text>
              {mostWantedId === item.id && (
                <View style={styles.mostWantedBadge}>
                  <Ionicons name="star" size={10} color={colors.warning.DEFAULT} />
                  <Text style={styles.mostWantedText}>Most Wanted</Text>
                </View>
              )}
            </View>
            <View style={styles.statsRow}>
              {item.fargoRating != null && (
                <Text style={styles.statText}>Fargo: {item.fargoRating}</Text>
              )}
              {item.robustness != null && (
                <Text style={styles.statText}>Rob: {item.robustness}</Text>
              )}
            </View>
          </View>

          <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Standings</Text>
        <Text style={styles.subtitle}>{rankings?.length ?? 0} players</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={colors.text.tertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search players..."
          placeholderTextColor={colors.text.tertiary}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <LoadingState message="Loading standings..." />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderPlayer}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary[400]}
            />
          }
          ListEmptyComponent={
            search ? (
              <EmptyState
                icon="search-outline"
                title="No Results"
                message={`No players matching "${search}"`}
              />
            ) : (
              <EmptyState
                icon="people-outline"
                title="No Standings"
                message="Rankings will appear once the season starts"
              />
            )
          }
        />
      )}
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
    paddingBottom: spacing[2],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    color: colors.text.primary,
    ...typography.fontWeight.bold,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    marginHorizontal: spacing[4],
    marginBottom: spacing[3],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    height: 44,
  },
  searchIcon: {
    marginRight: spacing[2],
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  list: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[8],
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  rankCol: {
    width: 50,
    alignItems: 'center',
  },
  rankNum: {
    fontSize: typography.fontSize.base,
    color: colors.primary[400],
    ...typography.fontWeight.bold,
  },
  topRank: {
    fontSize: typography.fontSize.lg,
    color: colors.warning.DEFAULT,
  },
  rankChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  rankChangeDiff: {
    fontSize: typography.fontSize.xs,
    ...typography.fontWeight.medium,
    marginLeft: 1,
  },
  infoCol: {
    flex: 1,
    marginLeft: spacing[2],
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  playerName: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    ...typography.fontWeight.medium,
  },
  mostWantedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.warning.DEFAULT + '20',
    paddingHorizontal: spacing[1],
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
  },
  mostWantedText: {
    fontSize: typography.fontSize.xs - 1,
    color: colors.warning.DEFAULT,
    ...typography.fontWeight.semibold,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: 2,
  },
  statText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
});
