import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores';
import { colors } from '@/constants/theme';

export default function TabsLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.background.secondary,
          borderTopColor: colors.border.DEFAULT,
        },
        tabBarActiveTintColor: colors.primary[400],
        tabBarInactiveTintColor: colors.text.tertiary,
        headerStyle: { backgroundColor: colors.background.primary },
        headerTintColor: colors.text.primary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: 'Challenges',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="game-controller" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="treasury"
        options={{
          title: 'Treasury',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}