import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from '@/api/queryClient';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background.primary },
            headerTintColor: colors.text.primary,
            headerTitleStyle: { fontWeight: '600' },
            contentStyle: { backgroundColor: colors.background.primary },
          }}
        >
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="light" />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}