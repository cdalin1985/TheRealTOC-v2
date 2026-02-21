import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '@/components';
import { useLogin } from '@/hooks';
import { colors, spacing, typography } from '@/constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutate: login, isPending, error } = useLogin();

  const handleLogin = () => {
    if (email && password) {
      login({ email, password });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.form}>
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
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon="lock-closed-outline"
          />

          {error && (
            <Text style={styles.error}>{error.message}</Text>
          )}

          <Button
            onPress={handleLogin}
            loading={isPending}
            disabled={!email || !password}
            size="lg"
          >
            Sign In
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?{' '}</Text>
          <Link href="/register" style={styles.link}>Sign Up</Link>
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