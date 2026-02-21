import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from '@/api/supabase';
import { useCurrentPlayer } from './usePlayer';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Push notifications only work on physical devices
  if (Platform.OS === 'web') return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  return tokenData.data;
}

/**
 * Registers the device for push notifications and saves the token
 * to the push_tokens table linked to the current player.
 */
export function usePushNotifications() {
  const { data: currentPlayer } = useCurrentPlayer();
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!currentPlayer?.id || registeredRef.current) return;

    const register = async () => {
      const token = await registerForPushNotificationsAsync();
      if (!token) return;

      // Upsert the token (ignore conflict if already exists)
      const { error } = await supabase
        .from('push_tokens')
        .upsert(
          { player_id: currentPlayer.id, token },
          { onConflict: 'player_id,token' }
        );

      if (!error) {
        registeredRef.current = true;
      }
    };

    register();
  }, [currentPlayer?.id]);
}
