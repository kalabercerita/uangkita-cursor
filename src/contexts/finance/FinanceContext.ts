
import { createContext, useContext } from 'react';
import { FinanceContextType } from './types';
import { Report } from '@/types';

const defaultReport: Report = {
  period: 'monthly', 
  totalIncome: 0, 
  totalExpense: 0, 
  balance: 0, 
  categorySummary: [] 
};

const FinanceContext = createContext<FinanceContextType>({
  wallets: [],
  transactions: [],
  categories: [],
  currentWallet: null,
  isLoading: false,
  error: null,
  addWallet: () => {},
  updateWallet: () => {},
  deleteWallet: () => {},
  setCurrentWallet: () => {},
  addTransaction: () => {},
  updateTransaction: () => {},
  deleteTransaction: () => {},
  addCategory: () => {},
  updateCategory: () => {},
  deleteCategory: () => {},
  getReport: () => defaultReport,
});

export const useFinance = () => useContext(FinanceContext);
export default FinanceContext;
