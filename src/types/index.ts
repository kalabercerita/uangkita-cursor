
export type User = {
  id: string;
  email: string;
  name?: string;
};

export type Wallet = {
  id: string;
  name: string;
  balance: number;
  currency: string;
  userId: string;
  collaborators?: string[];
  color?: string;
  icon?: string;
};

export type Category = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  userId?: string;
};

export type Transaction = {
  id: string;
  amount: number;
  description: string;
  date: Date | string;
  categoryId: string;
  category?: Category;
  walletId: string;
  wallet?: Wallet;
  userId: string;
  type: 'income' | 'expense' | 'transfer';
};

export type Report = {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categorySummary: {
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
  }[];
};

export type FinanceState = {
  wallets: Wallet[];
  transactions: Transaction[];
  categories: Category[];
  currentWallet: Wallet | null;
  isLoading: boolean;
  error: string | null;
};

export type Period = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
