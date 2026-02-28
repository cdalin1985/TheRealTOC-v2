import { renderHook, waitFor } from '@testing-library/react-native';
import {
  useChallenges,
  useMyChallenges,
  useSendChallenge,
  useRespondToChallenge,
} from '@/hooks/useChallenges';
import { createTestQueryClient, renderWithProviders } from '../test-utils';
import { mockSupabaseClient } from '../setup';
import type { Challenge, ChallengeStatus } from '@/types';

const mockChallenge: Challenge = {
  id: 'challenge-1',
  challengerId: 'player-1',
  challengedId: 'player-2',
  status: 'pending',
  proposedDate: '2024-02-01',
  proposedTime: '14:00',
  location: 'Main Hall',
  notes: 'Casual match',
  expiresAt: '2024-02-08T00:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  challenger: {
    id: 'player-1',
    displayName: 'John Doe',
    fargoRating: 600,
  },
  challenged: {
    id: 'player-2',
    displayName: 'Jane Smith',
    fargoRating: 650,
  },
};

const mockChallenges: Challenge[] = [
  mockChallenge,
  {
    ...mockChallenge,
    id: 'challenge-2',
    status: 'accepted',
  },
];

describe('useChallenges', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches all challenges successfully', async () => {
    mockSupabaseClient.rpc.mockResolvedValueOnce({ data: null, error: null });
    mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.order.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.then.mockResolvedValueOnce({
      data: mockChallenges,
      error: null,
    });

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useChallenges(), {
      wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockChallenges);
  });

  it('handles fetch error', async () => {
    const error = new Error('Database error');
    mockSupabaseClient.rpc.mockResolvedValueOnce({ data: null, error: null });
    mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.order.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.then.mockResolvedValueOnce({
      data: null,
      error,
    });

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useChallenges(), {
      wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBe(error);
  });

  it('returns empty array when no challenges', async () => {
    mockSupabaseClient.rpc.mockResolvedValueOnce({ data: null, error: null });
    mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.order.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.then.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useChallenges(), {
      wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });
});

describe('useMyChallenges', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches challenges for specific player', async () => {
    mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.or.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.order.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.then.mockResolvedValueOnce({
      data: [mockChallenge],
      error: null,
    });

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useMyChallenges('player-1'), {
      wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([mockChallenge]);
    expect(mockSupabaseClient.or).toHaveBeenCalledWith(
      'challenger_id.eq.player-1,challenged_id.eq.player-1'
    );
  });

  it('does not fetch when playerId is null', async () => {
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useMyChallenges(null), {
      wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('returns empty array for null playerId', async () => {
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useMyChallenges(null), {
      wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
    });

    expect(result.current.data).toEqual([]);
  });
});

describe('useSendChallenge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends challenge successfully', async () => {
    mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.insert.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: mockChallenge,
      error: null,
    });

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useSendChallenge(), {
      wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
    });

    const challengeData = {
      challengerId: 'player-1',
      challengedId: 'player-2',
      proposedDate: '2024-02-01',
      proposedTime: '14:00',
      location: 'Main Hall',
      notes: 'Casual match',
    };

    await result.current.mutateAsync(challengeData);

    expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        challenger_id: 'player-1',
        challenged_id: 'player-2',
        proposed_date: '2024-02-01',
        proposed_time: '14:00',
        location: 'Main Hall',
        notes: 'Casual match',
      })
    );
    expect(result.current.data).toEqual(mockChallenge);
  });

  it('sets default expires_at (7 days)', async () => {
    mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.insert.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: mockChallenge,
      error: null,
    });

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useSendChallenge(), {
      wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
    });

    await result.current.mutateAsync({
      challengerId: 'player-1',
      challengedId: 'player-2',
    });

    const insertCall = mockSupabaseClient.insert.mock.calls[0][0];
    expect(insertCall.expires_at).toBeDefined();
  });

  it('handles null values for optional fields', async () => {
    mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.insert.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: mockChallenge,
      error: null,
    });

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useSendChallenge(), {
      wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
    });

    await result.current.mutateAsync({
      challengerId: 'player-1',
      challengedId: 'player-2',
      proposedDate: undefined,
      proposedTime: undefined,
      location: undefined,
      notes: undefined,
    });

    expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        proposed_date: null,
        proposed_time: null,
        location: null,
        notes: null,
      })
    );
  });

  it('invalidates challenges query on success', async () => {
    mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.insert.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: mockChallenge,
      error: null,
    });

    const queryClient = createTestQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useSendChallenge(), {
      wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
    });

    await result.current.mutateAsync({
      challengerId: 'player-1',
      challengedId: 'player-2',
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenges'] });
  });

  it('handles error when sending fails', async () => {
    const error = new Error('Failed to send challenge');
    mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.insert.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: null,
      error,
    });

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useSendChallenge(), {
      wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
    });

    result.current.mutate({
      challengerId: 'player-1',
      challengedId: 'player-2',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBe(error);
  });
});

describe('useRespondToChallenge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(['accepted', 'declined', 'cancelled'] as ChallengeStatus[])(
    'updates challenge status to %s',
    async (status) => {
      const updatedChallenge = { ...mockChallenge, status };
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.update.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: updatedChallenge,
        error: null,
      });

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useRespondToChallenge(), {
        wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
      });

      await result.current.mutateAsync({
        challengeId: 'challenge-1',
        status,
      });

      expect(mockSupabaseClient.update).toHaveBeenCalledWith({ status });
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'challenge-1');
      expect(result.current.data).toEqual(updatedChallenge);
    }
  );

  it('invalidates challenges query on success', async () => {
    mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.update.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: mockChallenge,
      error: null,
    });

    const queryClient = createTestQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useRespondToChallenge(), {
      wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
    });

    await result.current.mutateAsync({
      challengeId: 'challenge-1',
      status: 'accepted',
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenges'] });
  });

  it('handles error when updating fails', async () => {
    const error = new Error('Challenge not found');
    mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.update.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: null,
      error,
    });

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useRespondToChallenge(), {
      wrapper: ({ children }) => renderWithProviders(children as any, { queryClient }).wrapper as any,
    });

    result.current.mutate({
      challengeId: 'invalid-id',
      status: 'accepted',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBe(error);
  });
});
