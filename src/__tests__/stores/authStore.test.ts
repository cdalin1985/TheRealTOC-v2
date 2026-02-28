import { act } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '@/stores/authStore';
import type { User, AuthTokens } from '@/types';

// Mock SecureStore
jest.mock('expo-secure-store');

const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  avatarUrl: null,
  isAdmin: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockTokens: AuthTokens = {
  accessToken: 'access-token-123',
  refreshToken: 'refresh-token-123',
  expiresAt: Date.now() + 3600000,
};

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    act(() => {
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: true,
      });
    });
    jest.clearAllMocks();
  });

  // ============================================================================
  // Initial State Tests
  // ============================================================================

  describe('initial state', () => {
    it('has correct initial state', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(true);
    });
  });

  // ============================================================================
  // setUser Tests
  // ============================================================================

  describe('setUser', () => {
    it('sets user and updates isAuthenticated', () => {
      act(() => {
        useAuthStore.getState().setUser(mockUser);
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('clears user and sets isAuthenticated to false', () => {
      // First set a user
      act(() => {
        useAuthStore.getState().setUser(mockUser);
      });

      // Then clear it
      act(() => {
        useAuthStore.getState().setUser(null);
      });

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  // ============================================================================
  // setLoading Tests
  // ============================================================================

  describe('setLoading', () => {
    it('sets loading state to true', () => {
      act(() => {
        useAuthStore.getState().setLoading(true);
      });

      expect(useAuthStore.getState().isLoading).toBe(true);
    });

    it('sets loading state to false', () => {
      act(() => {
        useAuthStore.getState().setLoading(false);
      });

      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('toggles loading state', () => {
      const store = useAuthStore.getState();

      act(() => store.setLoading(true));
      expect(useAuthStore.getState().isLoading).toBe(true);

      act(() => store.setLoading(false));
      expect(useAuthStore.getState().isLoading).toBe(false);

      act(() => store.setLoading(true));
      expect(useAuthStore.getState().isLoading).toBe(true);
    });
  });

  // ============================================================================
  // login Tests
  // ============================================================================

  describe('login', () => {
    it('stores tokens in SecureStore', async () => {
      const store = useAuthStore.getState();

      await act(async () => {
        await store.login(mockUser, mockTokens);
      });

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'access_token',
        mockTokens.accessToken
      );
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'refresh_token',
        mockTokens.refreshToken
      );
    });

    it('sets user and isAuthenticated', async () => {
      const store = useAuthStore.getState();

      await act(async () => {
        await store.login(mockUser, mockTokens);
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('handles SecureStore error gracefully', async () => {
      const error = new Error('SecureStore error');
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(error);

      const store = useAuthStore.getState();

      await expect(store.login(mockUser, mockTokens)).rejects.toThrow(error);
    });
  });

  // ============================================================================
  // logout Tests
  // ============================================================================

  describe('logout', () => {
    it('removes tokens from SecureStore', async () => {
      // First login
      const store = useAuthStore.getState();
      await act(async () => {
        await store.login(mockUser, mockTokens);
      });

      // Then logout
      await act(async () => {
        await store.logout();
      });

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('access_token');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('refresh_token');
    });

    it('clears user and isAuthenticated', async () => {
      // First login
      const store = useAuthStore.getState();
      await act(async () => {
        await store.login(mockUser, mockTokens);
      });

      // Then logout
      await act(async () => {
        await store.logout();
      });

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it('handles SecureStore delete error gracefully', async () => {
      const error = new Error('SecureStore delete error');
      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValueOnce(error);

      const store = useAuthStore.getState();

      await expect(store.logout()).rejects.toThrow(error);
    });

    it('works even when user was not logged in', async () => {
      const store = useAuthStore.getState();

      await act(async () => {
        await store.logout();
      });

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  // ============================================================================
  // updateUser Tests
  // ============================================================================

  describe('updateUser', () => {
    it('updates user properties', async () => {
      const store = useAuthStore.getState();

      // First login
      await act(async () => {
        await store.login(mockUser, mockTokens);
      });

      // Update user
      act(() => {
        store.updateUser({ displayName: 'Updated Name' });
      });

      const state = useAuthStore.getState();
      expect(state.user?.displayName).toBe('Updated Name');
      expect(state.user?.email).toBe(mockUser.email); // Unchanged
    });

    it('updates multiple properties at once', async () => {
      const store = useAuthStore.getState();

      await act(async () => {
        await store.login(mockUser, mockTokens);
      });

      act(() => {
        store.updateUser({
          displayName: 'New Name',
          avatarUrl: 'https://example.com/avatar.jpg',
          isAdmin: true,
        });
      });

      const state = useAuthStore.getState();
      expect(state.user?.displayName).toBe('New Name');
      expect(state.user?.avatarUrl).toBe('https://example.com/avatar.jpg');
      expect(state.user?.isAdmin).toBe(true);
    });

    it('updates updatedAt timestamp', async () => {
      const store = useAuthStore.getState();

      await act(async () => {
        await store.login(mockUser, mockTokens);
      });

      const beforeUpdate = useAuthStore.getState().user?.updatedAt;

      // Wait a bit to ensure timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 10));

      act(() => {
        store.updateUser({ displayName: 'Updated' });
      });

      const state = useAuthStore.getState();
      expect(state.user?.updatedAt).not.toBe(beforeUpdate);
    });

    it('does nothing when no user is logged in', () => {
      const store = useAuthStore.getState();

      act(() => {
        store.updateUser({ displayName: 'Should Not Update' });
      });

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });

    it('preserves existing properties not being updated', async () => {
      const store = useAuthStore.getState();

      await act(async () => {
        await store.login(mockUser, mockTokens);
      });

      act(() => {
        store.updateUser({ avatarUrl: 'new-avatar.jpg' });
      });

      const state = useAuthStore.getState();
      expect(state.user).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        displayName: mockUser.displayName,
        isAdmin: mockUser.isAdmin,
        avatarUrl: 'new-avatar.jpg',
      });
    });
  });

  // ============================================================================
  // State Persistence Tests
  // ============================================================================

  describe('state persistence', () => {
    it('maintains state across multiple actions', async () => {
      const store = useAuthStore.getState();

      // Login
      await act(async () => {
        await store.login(mockUser, mockTokens);
      });

      // Update user
      act(() => {
        store.updateUser({ displayName: 'First Update' });
      });

      act(() => {
        store.updateUser({ displayName: 'Second Update' });
      });

      const state = useAuthStore.getState();
      expect(state.user?.displayName).toBe('Second Update');
      expect(state.isAuthenticated).toBe(true);
    });

    it('can login, update, and logout in sequence', async () => {
      const store = useAuthStore.getState();

      // Login
      await act(async () => {
        await store.login(mockUser, mockTokens);
      });

      // Update
      act(() => {
        store.updateUser({ isAdmin: true });
      });

      // Logout
      await act(async () => {
        await store.logout();
      });

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
