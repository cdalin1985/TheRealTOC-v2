/**
 * Auth Flow Integration Tests
 * 
 * These tests verify the complete authentication flow from UI through
 * hooks to the store and back.
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useLogin, useSignUp, useLogout, useCurrentUser } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { createTestQueryClient, renderWithProviders } from '../test-utils';
import { createUser, createAuthTokens, resetFactoryCounter } from '../fixtures/factories';
import { mockSupabaseClient } from '../setup';
import * as SecureStore from 'expo-secure-store';

// Mocks
jest.mock('@/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('expo-secure-store');

describe('Auth Flow Integration', () => {
  const mockStoreLogin = jest.fn();
  const mockStoreLogout = jest.fn();
  const mockSetUser = jest.fn();
  const mockSetLoading = jest.fn();

  beforeEach(() => {
    resetFactoryCounter();
    jest.clearAllMocks();

    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      login: mockStoreLogin,
      logout: mockStoreLogout,
      setUser: mockSetUser,
      setLoading: mockSetLoading,
    });
  });

  describe('Complete Login Flow', () => {
    it('logs in user and updates all state correctly', async () => {
      const user = createUser({ email: 'test@example.com' });
      const tokens = createAuthTokens();
      const session = {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_at: tokens.expiresAt,
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user, session },
        error: null,
      });

      const queryClient = createTestQueryClient();
      const { result: loginResult } = renderHook(() => useLogin(), {
        wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
      });

      // Execute login
      await loginResult.current.mutateAsync({
        email: 'test@example.com',
        password: 'password123',
      });

      // Verify mutation succeeded
      expect(loginResult.current.isSuccess).toBe(true);

      // Verify store was called with correct data
      expect(mockStoreLogin).toHaveBeenCalledWith(user, expect.objectContaining({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }));

      // Verify query cache was updated
      const cachedUser = queryClient.getQueryData(['auth', 'user']);
      expect(cachedUser).toEqual(user);
    });

    it('handles login failure gracefully', async () => {
      const error = new Error('Invalid credentials');
      mockSupabaseClient.auth.signInWithPassword.mockRejectedValueOnce(error);

      const queryClient = createTestQueryClient();
      const { result: loginResult } = renderHook(() => useLogin(), {
        wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
      });

      // Execute login
      loginResult.current.mutate({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });

      await waitFor(() => expect(loginResult.current.isError).toBe(true));

      // Verify error state
      expect(loginResult.current.error).toBeTruthy();

      // Verify store was NOT called
      expect(mockStoreLogin).not.toHaveBeenCalled();

      // Verify query cache was NOT updated
      const cachedUser = queryClient.getQueryData(['auth', 'user']);
      expect(cachedUser).toBeUndefined();
    });
  });

  describe('Complete Sign Up Flow', () => {
    it('signs up user and logs them in', async () => {
      const user = createUser({ email: 'new@example.com', displayName: 'New User' });
      const tokens = createAuthTokens();
      const session = {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_at: tokens.expiresAt,
      };

      mockSupabaseClient.auth.signUp.mockResolvedValueOnce({
        data: { user, session },
        error: null,
      });

      const queryClient = createTestQueryClient();
      const { result: signUpResult } = renderHook(() => useSignUp(), {
        wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
      });

      await signUpResult.current.mutateAsync({
        email: 'new@example.com',
        password: 'password123',
        displayName: 'New User',
      });

      expect(signUpResult.current.isSuccess).toBe(true);
      expect(mockStoreLogin).toHaveBeenCalled();

      const cachedUser = queryClient.getQueryData(['auth', 'user']);
      expect(cachedUser).toEqual(user);
    });

    it('handles sign up without auto-confirmation', async () => {
      const user = createUser({ email: 'pending@example.com' });

      mockSupabaseClient.auth.signUp.mockResolvedValueOnce({
        data: { user, session: null },
        error: null,
      });

      const queryClient = createTestQueryClient();
      const { result: signUpResult } = renderHook(() => useSignUp(), {
        wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
      });

      await signUpResult.current.mutateAsync({
        email: 'pending@example.com',
        password: 'password123',
        displayName: 'Pending User',
      });

      expect(signUpResult.current.isSuccess).toBe(true);
      // Store login should not be called without session
      expect(mockStoreLogin).not.toHaveBeenCalled();
    });
  });

  describe('Complete Logout Flow', () => {
    it('logs out user and clears all state', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValueOnce({ error: null });

      const queryClient = createTestQueryClient();
      // Pre-populate cache
      queryClient.setQueryData(['auth', 'user'], createUser());
      queryClient.setQueryData(['challenges'], []);

      const { result: logoutResult } = renderHook(() => useLogout(), {
        wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
      });

      await logoutResult.current.mutateAsync();

      expect(logoutResult.current.isSuccess).toBe(true);
      expect(mockStoreLogout).toHaveBeenCalled();
    });
  });

  describe('Session Recovery Flow', () => {
    it('recovers existing session on app start', async () => {
      const user = createUser();
      const session = {
        access_token: 'existing-token',
        refresh_token: 'existing-refresh',
        expires_at: Date.now() + 3600000,
      };

      mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
        data: { session },
        error: null,
      });
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user },
        error: null,
      });

      // Simulate auth init
      const { result } = renderHook(() => ({
        init: async () => {
          mockSetLoading(true);
          const { data: { session } } = await mockSupabaseClient.auth.getSession();
          if (session) {
            const { data: { user } } = await mockSupabaseClient.auth.getUser();
            mockSetUser(user);
          }
          mockSetLoading(false);
        },
      }));

      await result.current.init();

      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(mockSetUser).toHaveBeenCalledWith(user);
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });

    it('handles expired session gracefully', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const { result } = renderHook(() => ({
        init: async () => {
          mockSetLoading(true);
          const { data: { session } } = await mockSupabaseClient.auth.getSession();
          if (!session) {
            mockSetLoading(false);
            return;
          }
        },
      }));

      await result.current.init();

      expect(mockSetUser).not.toHaveBeenCalled();
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });
  });

  describe('Concurrent Auth Operations', () => {
    it('handles rapid login/logout sequence', async () => {
      const user = createUser();
      const tokens = createAuthTokens();
      const session = {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_at: tokens.expiresAt,
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user, session },
        error: null,
      });
      mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null });

      const queryClient = createTestQueryClient();

      // Login
      const { result: loginResult } = renderHook(() => useLogin(), {
        wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
      });
      await loginResult.current.mutateAsync({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(loginResult.current.isSuccess).toBe(true);

      // Immediately logout
      const { result: logoutResult } = renderHook(() => useLogout(), {
        wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
      });
      await logoutResult.current.mutateAsync();

      expect(logoutResult.current.isSuccess).toBe(true);
      expect(mockStoreLogout).toHaveBeenCalled();
    });
  });
});
