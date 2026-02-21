import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/api/supabase';

const TREASURY_KEY = 'treasury';

export function useTreasury() {
  return useQuery({
    queryKey: [TREASURY_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          player:players!transactions_player_id_fkey(id, display_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTreasuryBalance() {
  return useQuery({
    queryKey: [TREASURY_KEY, 'balance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('type, amount')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transactions = data ?? [];
      const income = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        balance: income - expenses,
        totalIncome: income,
        totalExpenses: expenses,
        transactionCount: transactions.length,
      };
    },
  });
}

export function useAddTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      playerId,
      type,
      category,
      amount,
      description,
      relatedMatchId,
      adminId,
    }: {
      playerId?: string | undefined;
      type: 'income' | 'expense';
      category: string;
      amount: number;
      description: string;
      relatedMatchId?: string | undefined;
      adminId: string;
    }) => {
      // Get current balance to calculate balance_after
      const { data: existing } = await supabase
        .from('transactions')
        .select('type, amount');

      const currentTransactions = existing ?? [];
      const currentIncome = currentTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const currentExpenses = currentTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      const currentBalance = currentIncome - currentExpenses;
      const balanceAfter = type === 'income'
        ? currentBalance + amount
        : currentBalance - amount;

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          player_id: playerId || null,
          type,
          category,
          amount,
          description,
          related_match_id: relatedMatchId || null,
          admin_id: adminId,
          balance_after: balanceAfter,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TREASURY_KEY] });
    },
  });
}
