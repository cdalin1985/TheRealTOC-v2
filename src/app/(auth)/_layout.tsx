import { useEffect } from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/stores';
import { useAuthInit } from '@/hooks';
import { LoadingState } from '@/components';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { init } = useAuthInit();

  useEffect(() => {
    init();
  }, [init]);

  if (isLoading) {
    return <LoadingState message="Starting up..." />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}