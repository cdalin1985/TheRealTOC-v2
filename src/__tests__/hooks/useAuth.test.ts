import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient } from '@tanstack/react-query';
import { 
  useCurrentUser, 
  useLogin, 
  useSignUp, 
  useLogout, 
  useAuthInit 
} from '@/hooks/useAuth';
import { createTestQueryClient, renderWithProviders } from '../test-utils';
import { useAuthStore } from '@/stores/authStore';
import { mockSupabaseClient } from '../setup';
import type { User } from '@/types';

// Mock the auth store
jest.mock('@/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

const mockStoreLogin = jest.fn();
const mockStoreLogout = jest.fn();
const mockSetUser = jest.fn();
const mockSetLoading = jest.fn();

const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  avatarUrl: null,
  isAdmin: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockSession = {
  access_token: 'access-token-123',
  refresh_token: 'refresh-token-123',
  expires_at: Date.now() + 3600000,
};

describe('useCurrentUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches current user successfully', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockUser);
    expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
  });

  it('handles error when fetching user fails', async () => {
    const error = new Error('Unauthorized');
    mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error,
    });

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBe(error);
  });

  it('returns null when no user is authenticated', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeNull();
  });
});

describe('useLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      login: mockStoreLogin,
    });
  });

  it('logs in successfully', async () => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: mockUser, session: mockSession },
      error: null,
    });

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useLogin(), {
      wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
    });

    result.current.mutate({ email: 'test@example.com', password: 'password123' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(mockStoreLogin).toHaveBeenCalled();
  });

  it('handles login error', async () => {
    const error = new Error('Invalid credentials');
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error,
    });

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useLogin(), {
      wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
    });

    result.current.mutate({ email: 'test@example.com', password: 'wrong' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBe(error);
    expect(mockStoreLogin).not.toHaveBeenCalled();
  });

  it('sets user data in query cache on success', async () => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: mockUser, session: mockSession },
      error: null,
    });

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useLogin(), {
      wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
    });

    await result.current.mutateAsync({ email: 'test@example.com', password: 'password123' });

    const cachedUser = queryClient.getQueryData(['auth', 'user']);
    expect(cachedUser).toEqual(mockUser);
  });
});

describe('useSignUp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      login: mockStoreLogin,
    });
  });

  it('signs up successfully with session', async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValueOnce({
      data: { user: mockUser, session: mockSession },
      error: null,
    });

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useSignUp(), {
      wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
    });

    await result.current.mutateAsync({
      email: 'new@example.com',
      password: 'password123',
      displayName: 'New User',
    });

    expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password123',
      options: { data: { display_name: 'New User' } },
    });
    expect(mockStoreLogin).toHaveBeenCalled();
  });

  it('handles sign up error', async () => {
    const error = new Error('Email already exists');
    mockSupabaseClient.auth.signUp.mockResolvedValueOnce({
      data: { user: null, session: null },
      error,
    });

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useSignUp(), {
      wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
    });

    result.current.mutate({
      email: 'existing@example.com',
      password: 'password123',
      displayName: 'Existing User',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe('Email already exists');
  });
});

describe('useLogout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      logout: mockStoreLogout,
    });
  });

  it('logs out successfully', async () => {
    mockSupabaseClient.auth.signOut.mockResolvedValueOnce({ error: null });

    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['auth', 'user'], mockUser);

    const { result } = renderHook(() => useLogout(), {
      wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
    });

    await result.current.mutateAsync();

    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
    expect(mockStoreLogout).toHaveBeenCalled();
  });

  it('handles logout error', async () => {
    const error = new Error('Network error');
    mockSupabaseClient.auth.signOut.mockResolvedValueOnce({ error });

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useLogout(), {
      wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBe(error);
  });
});

describe('useAuthInit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      setUser: mockSetUser,
      setLoading: mockSetLoading,
    });
  });

  it('initializes with existing session', async () => {
    mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    });
    mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    const { result } = renderHook(() => useAuthInit());

    await result.current.init();

    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetUser).toHaveBeenCalledWith(mockUser);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('handles no session', async () => {
    mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });

    const { result } = renderHook(() => useAuthInit());

    await result.current.init();

    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetUser).not.toHaveBeenCalled();
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });
});
