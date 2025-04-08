
import { Wallet, Transaction, Category, Report, Period, FinanceState } from '@/types';

export type ToastType = (props: { 
  title: string; 
  description: string; 
  variant?: "default" | "destructive" 
}) => void;

export type FinanceContextType = {
  wallets: Wallet[];
  transactions: Transaction[];
  categories: Category[];
  currentWallet: Wallet | null;
  isLoading: boolean;
  error: string | null;
  addWallet: (wallet: Omit<Wallet, 'id' | 'userId'>) => void;
  updateWallet: (wallet: Wallet) => void;
  deleteWallet: (walletId: string) => void;
  setCurrentWallet: (wallet: Wallet | null) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (transactionId: string) => void;
  addCategory: (category: Omit<Category, 'id' | 'userId'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  getReport: (period: Period, startDate?: Date, endDate?: Date) => Report;
};
