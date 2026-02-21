import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '@/components';
import { useSignUp } from '@/hooks';
import { colors, spacing, typography } from '@/constants/theme';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const { mutate: signUp, isPending, error } = useSignUp();

  const handleSignUp = () => {
    if (email && password && displayName) {
      signUp({ email, password, displayName });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the league today</Text>

        <View style={styles.form}>
          <Input
            label="Display Name"
            placeholder="Enter your name"
            value={displayName}
            onChangeText={setDisplayName}
            icon="person-outline"
          />

          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            icon="mail-outline"
          />

          <Input
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon="lock-closed-outline"
          />

          {error && (
            <Text style={styles.error}>{error.message}</Text>
          )}

          <Button
            onPress={handleSignUp}
            loading={isPending}
            disabled={!email || !password || !displayName}
            size="lg"
          >
            Create Account
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?{' '}</Text>
          <Link href="/login" style={styles.link}>Sign In</Link>
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
  content: {
    flex: 1,
    padding: spacing[6],
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    color: colors.text.primary,
    ...typography.fontWeight.bold,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing[8],
  },
  form: {
    gap: spacing[4],
  },
  error: {
    color: colors.error.DEFAULT,
    fontSize: typography.fontSize.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing[8],
  },
  footerText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.base,
  },
  link: {
    color: colors.primary[400],
    fontSize: typography.fontSize.base,
    ...typography.fontWeight.semibold,
  },
});