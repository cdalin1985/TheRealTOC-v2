import { create } from 'zustand';
import type { Transaction, PlayerFinancialSummary } from '@/types';

interface TreasuryState {
  transactions: Transaction[];
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  playerSummary: PlayerFinancialSummary | null;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateBalance: () => void;
}

export const useTreasuryStore = create<TreasuryState>()((set, get) => ({
  transactions: [],
  currentBalance: 0,
  totalIncome: 0,
  totalExpenses: 0,
  playerSummary: null,

  setTransactions: (transactions) => {
    set({ transactions });
    get().updateBalance();
  },

  addTransaction: (transaction) => {
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    }));
    get().updateBalance();
  },

  updateBalance: () => {
    const { transactions } = get();
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    set({
      totalIncome: income,
      totalExpenses: expenses,
      currentBalance: income - expenses,
    });
  },
}));