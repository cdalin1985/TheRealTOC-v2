import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '@/components';
import { useAuthStore, useLogout } from '@/hooks';
import { colors, spacing, typography } from '@/constants/theme';

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { mutate: logout, isPending } = useLogout();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
        <Card variant="elevated">
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.displayName?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <Text style={styles.name}>{user?.displayName || 'Player'}</Text>
            <Text style={styles.email}>{user?.email || ''}</Text>
          </View>
        </Card>

        <View style={styles.section}>
          <Button
            variant="outline"
            onPress={() => logout()}
            loading={isPending}
          >
            Sign Out
          </Button>
        </View>
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
  section: {
    marginTop: spacing[4],
  },
});