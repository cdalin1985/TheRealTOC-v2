import '@testing-library/jest-native/extend-expect';
import { QueryClient } from '@tanstack/react-query';

// ============================================================================
// Timing
// ============================================================================

jest.useFakeTimers({ legacyFakeTimers: false });

// ============================================================================
// Expo Router Mocks
// ============================================================================

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
  setParams: jest.fn(),
  navigate: jest.fn(),
  reload: jest.fn(),
};

const mockSegments: string[] = [];

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => mockRouter),
  useLocalSearchParams: jest.fn(() => ({})),
  useGlobalSearchParams: jest.fn(() => ({})),
  usePathname: jest.fn(() => '/'),
  useSegments: jest.fn(() => mockSegments),
  Redirect: jest.fn(({ href }: { href: string }) => null),
  Stack: {
    Screen: jest.fn(({ children }) => children),
  },
  Tabs: jest.fn(({ children }) => children),
  Link: jest.fn(({ children }) => children),
  Href: String,
}));

// ============================================================================
// Expo Modules Mocks
// ============================================================================

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelScheduledNotificationAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  removeNotificationSubscription: jest.fn(),
}));

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      supabaseUrl: 'https://test.supabase.co',
      supabaseAnonKey: 'test-anon-key',
    },
  },
}));

jest.mock('expo-image', () => ({
  Image: jest.fn(({ source, style, testID }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { style, testID });
  }),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: jest.fn(({ children, style, testID }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { style, testID }, children);
  }),
}));

// ============================================================================
// React Native Mocks
// ============================================================================

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native-gesture-handler', () => ({
  Swipeable: jest.fn(({ children }) => children),
  DrawerLayout: jest.fn(({ children }) => children),
  State: {},
  PanGestureHandler: jest.fn(({ children }) => children),
  TapGestureHandler: jest.fn(({ children }) => children),
  LongPressGestureHandler: jest.fn(({ children }) => children),
  PinchGestureHandler: jest.fn(({ children }) => children),
  RotationGestureHandler: jest.fn(({ children }) => children),
  FlingGestureHandler: jest.fn(({ children }) => children),
  ForceTouchGestureHandler: jest.fn(({ children }) => children),
  NativeViewGestureHandler: jest.fn(({ children }) => children),
  RawButton: jest.fn(({ children }) => children),
  BaseButton: jest.fn(({ children }) => children),
  RectButton: jest.fn(({ children }) => children),
  BorderlessButton: jest.fn(({ children }) => children),
  Directions: {},
  Gesture: {
    Pan: () => ({ onStart: jest.fn(), onUpdate: jest.fn(), onEnd: jest.fn() }),
    Tap: () => ({ onStart: jest.fn(), onEnd: jest.fn() }),
    LongPress: () => ({ onStart: jest.fn(), onEnd: jest.fn() }),
  },
  GestureDetector: jest.fn(({ children }) => children),
  GestureHandlerRootView: jest.fn(({ children }) => children),
}));

// ============================================================================
// Supabase Mocks
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockSupabaseClient = any;

export const mockSupabaseClient: MockSupabaseClient = {};

// Build the mock client with self-references after initial object creation
Object.assign(mockSupabaseClient, {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    refreshSession: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    updateUser: jest.fn(),
  },
  from: jest.fn(() => mockSupabaseClient),
  select: jest.fn(() => mockSupabaseClient),
  insert: jest.fn(() => mockSupabaseClient),
  update: jest.fn(() => mockSupabaseClient),
  delete: jest.fn(() => mockSupabaseClient),
  upsert: jest.fn(() => mockSupabaseClient),
  eq: jest.fn(() => mockSupabaseClient),
  neq: jest.fn(() => mockSupabaseClient),
  gt: jest.fn(() => mockSupabaseClient),
  gte: jest.fn(() => mockSupabaseClient),
  lt: jest.fn(() => mockSupabaseClient),
  lte: jest.fn(() => mockSupabaseClient),
  like: jest.fn(() => mockSupabaseClient),
  ilike: jest.fn(() => mockSupabaseClient),
  is: jest.fn(() => mockSupabaseClient),
  in: jest.fn(() => mockSupabaseClient),
  contains: jest.fn(() => mockSupabaseClient),
  containedBy: jest.fn(() => mockSupabaseClient),
  range: jest.fn(() => mockSupabaseClient),
  overlaps: jest.fn(() => mockSupabaseClient),
  textSearch: jest.fn(() => mockSupabaseClient),
  match: jest.fn(() => mockSupabaseClient),
  not: jest.fn(() => mockSupabaseClient),
  or: jest.fn(() => mockSupabaseClient),
  and: jest.fn(() => mockSupabaseClient),
  filter: jest.fn(() => mockSupabaseClient),
  order: jest.fn(() => mockSupabaseClient),
  limit: jest.fn(() => mockSupabaseClient),
  single: jest.fn(() => Promise.resolve({ data: null, error: null })),
  maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
  csv: jest.fn(() => Promise.resolve({ data: null, error: null })),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  then: jest.fn((callback: any) => Promise.resolve(callback({ data: [], error: null }))),
  subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
  channel: jest.fn(() => ({
    on: jest.fn(() => mockSupabaseClient.channel('')),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subscribe: jest.fn((callback: any) => {
      callback('SUBSCRIBED', null);
      return { unsubscribe: jest.fn() };
    }),
  })),
  removeChannel: jest.fn(),
  removeAllChannels: jest.fn(),
  rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(() => Promise.resolve({ data: { path: 'test-path' }, error: null })),
      download: jest.fn(() => Promise.resolve({ data: new Blob(), error: null })),
      getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://test.com/image.png' } })),
      remove: jest.fn(() => Promise.resolve({ data: null, error: null })),
      list: jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  },
});

jest.mock('../api/supabase', () => ({
  supabase: mockSupabaseClient,
}));

// ============================================================================
// Console Error Suppression (for expected errors in tests)
// ============================================================================

const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    // Suppress specific React Native warnings
    const message = args[0]?.toString() || '';
    if (
      message.includes('useNativeDriver') ||
      message.includes('VirtualizedLists') ||
      message.includes('Non-serializable values') ||
      message.includes('Warning:') && message.includes('act')
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});

// ============================================================================
// Global Test Utilities
// ============================================================================

declare global {
  // eslint-disable-next-line no-var
  var mockRouter: {
    push: jest.Mock;
    replace: jest.Mock;
    back: jest.Mock;
    canGoBack: jest.Mock;
    setParams: jest.Mock;
    navigate: jest.Mock;
    reload: jest.Mock;
  };
  // eslint-disable-next-line no-var
  var mockSupabaseClient: Record<string, unknown>;
}

global.mockRouter = mockRouter;
global.mockSupabaseClient = mockSupabaseClient as Record<string, unknown>;

// ============================================================================
// Cleanup
// ============================================================================

afterEach(() => {
  jest.clearAllMocks();
});
