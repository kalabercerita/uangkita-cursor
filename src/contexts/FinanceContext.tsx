
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from './AuthContext';
import {
  Wallet,
  Transaction,
  Category,
  FinanceState,
  Report,
  Period
} from '@/types';

// Default categories
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Salary', type: 'income', color: '#48BB78', icon: 'wallet' },
  { id: 'cat2', name: 'Food', type: 'expense', color: '#F56565', icon: 'utensils' },
  { id: 'cat3', name: 'Transportation', type: 'expense', color: '#4299E1', icon: 'car' },
  { id: 'cat4', name: 'Shopping', type: 'expense', color: '#ECC94B', icon: 'shopping-bag' },
  { id: 'cat5', name: 'Entertainment', type: 'expense', color: '#9F7AEA', icon: 'film' },
  { id: 'cat6', name: 'Bills', type: 'expense', color: '#ED8936', icon: 'file-invoice' },
  { id: 'cat7', name: 'Health', type: 'expense', color: '#38B2AC', icon: 'heart' },
  { id: 'cat8', name: 'Investment', type: 'income', color: '#48BB78', icon: 'chart-line' },
  { id: 'cat9', name: 'Gifts', type: 'income', color: '#9F7AEA', icon: 'gift' },
];

// Default wallets
const DEFAULT_WALLETS: Wallet[] = [
  { id: 'wallet1', name: 'Cash', balance: 1000, currency: 'USD', userId: '1', color: '#48BB78', icon: 'cash' },
  { id: 'wallet2', name: 'Bank Account', balance: 5000, currency: 'USD', userId: '1', color: '#4299E1', icon: 'bank' },
];

type FinanceContextType = {
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
  getReport: () => ({ 
    period: 'monthly', 
    totalIncome: 0, 
    totalExpense: 0, 
    balance: 0, 
    categorySummary: [] 
  }),
});

export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<FinanceState>({
    wallets: [],
    transactions: [],
    categories: [],
    currentWallet: null,
    isLoading: true,
    error: null,
  });

  // Load user data
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setState({
        wallets: [],
        transactions: [],
        categories: [],
        currentWallet: null,
        isLoading: false,
        error: null,
      });
    }
  }, [user]);

  const loadUserData = useCallback(() => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Mock loading from localStorage - will be replaced with Supabase
      const savedWallets = localStorage.getItem(`finny_wallets_${user?.id}`);
      const savedTransactions = localStorage.getItem(`finny_transactions_${user?.id}`);
      const savedCategories = localStorage.getItem(`finny_categories_${user?.id}`);
      
      const wallets = savedWallets ? JSON.parse(savedWallets) : DEFAULT_WALLETS;
      const transactions = savedTransactions ? JSON.parse(savedTransactions) : [];
      const categories = savedCategories ? JSON.parse(savedCategories) : DEFAULT_CATEGORIES;
      
      setState({
        wallets,
        transactions,
        categories,
        currentWallet: wallets.length > 0 ? wallets[0] : null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Failed to load user data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load your financial data'
      }));
      toast({
        title: "Error loading data",
        description: "There was a problem loading your financial data",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Save state to localStorage
  useEffect(() => {
    if (user && !state.isLoading) {
      localStorage.setItem(`finny_wallets_${user.id}`, JSON.stringify(state.wallets));
      localStorage.setItem(`finny_transactions_${user.id}`, JSON.stringify(state.transactions));
      localStorage.setItem(`finny_categories_${user.id}`, JSON.stringify(state.categories));
    }
  }, [user, state.wallets, state.transactions, state.categories, state.isLoading]);

  // Wallet operations
  const addWallet = (walletData: Omit<Wallet, 'id' | 'userId'>) => {
    if (!user) return;
    
    const newWallet: Wallet = {
      ...walletData,
      id: `wallet_${Date.now()}`,
      userId: user.id,
    };
    
    setState(prev => ({
      ...prev,
      wallets: [...prev.wallets, newWallet],
      currentWallet: prev.currentWallet || newWallet,
    }));
    
    toast({
      title: "Wallet added",
      description: `${walletData.name} has been added to your wallets`,
    });
  };

  const updateWallet = (wallet: Wallet) => {
    setState(prev => ({
      ...prev,
      wallets: prev.wallets.map(w => w.id === wallet.id ? wallet : w),
      currentWallet: prev.currentWallet?.id === wallet.id ? wallet : prev.currentWallet,
    }));
    
    toast({
      title: "Wallet updated",
      description: `${wallet.name} has been updated`,
    });
  };

  const deleteWallet = (walletId: string) => {
    setState(prev => {
      const updatedWallets = prev.wallets.filter(w => w.id !== walletId);
      return {
        ...prev,
        wallets: updatedWallets,
        transactions: prev.transactions.filter(t => t.walletId !== walletId),
        currentWallet: prev.currentWallet?.id === walletId
          ? (updatedWallets.length > 0 ? updatedWallets[0] : null)
          : prev.currentWallet,
      };
    });
    
    toast({
      title: "Wallet deleted",
      description: "The wallet and its transactions have been deleted",
    });
  };

  const setCurrentWallet = (wallet: Wallet | null) => {
    setState(prev => ({
      ...prev,
      currentWallet: wallet,
    }));
  };

  // Transaction operations
  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'userId'>) => {
    if (!user) return;
    
    const newTransaction: Transaction = {
      ...transactionData,
      id: `trans_${Date.now()}`,
      userId: user.id,
    };
    
    // Update wallet balance
    const updatedWallets = state.wallets.map(wallet => {
      if (wallet.id === transactionData.walletId) {
        const balanceChange = 
          transactionData.type === 'income' ? transactionData.amount :
          transactionData.type === 'expense' ? -transactionData.amount : 0;
        
        return {
          ...wallet,
          balance: wallet.balance + balanceChange
        };
      }
      return wallet;
    });
    
    setState(prev => ({
      ...prev,
      transactions: [...prev.transactions, newTransaction],
      wallets: updatedWallets,
      currentWallet: prev.currentWallet 
        ? updatedWallets.find(w => w.id === prev.currentWallet?.id) || null
        : null
    }));
    
    toast({
      title: "Transaction added",
      description: `${transactionData.description} has been recorded`,
    });
  };

  const updateTransaction = (transaction: Transaction) => {
    // Find original transaction
    const originalTransaction = state.transactions.find(t => t.id === transaction.id);
    
    if (!originalTransaction) return;
    
    // Calculate balance adjustment for the wallet
    let originalBalanceEffect = 
      originalTransaction.type === 'income' ? originalTransaction.amount :
      originalTransaction.type === 'expense' ? -originalTransaction.amount : 0;
    
    let newBalanceEffect = 
      transaction.type === 'income' ? transaction.amount :
      transaction.type === 'expense' ? -transaction.amount : 0;
    
    // Update wallets
    const updatedWallets = state.wallets.map(wallet => {
      if (wallet.id === originalTransaction.walletId) {
        // Remove the effect of the original transaction
        let newBalance = wallet.balance - originalBalanceEffect;
        
        // If the wallet is still the same, add the new effect
        if (wallet.id === transaction.walletId) {
          newBalance += newBalanceEffect;
        }
        
        return { ...wallet, balance: newBalance };
      } 
      else if (wallet.id === transaction.walletId && wallet.id !== originalTransaction.walletId) {
        // This is a different wallet than the original transaction
        return { ...wallet, balance: wallet.balance + newBalanceEffect };
      }
      return wallet;
    });
    
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => t.id === transaction.id ? transaction : t),
      wallets: updatedWallets,
      currentWallet: prev.currentWallet 
        ? updatedWallets.find(w => w.id === prev.currentWallet?.id) || null
        : null
    }));
    
    toast({
      title: "Transaction updated",
      description: `${transaction.description} has been updated`,
    });
  };

  const deleteTransaction = (transactionId: string) => {
    const transactionToDelete = state.transactions.find(t => t.id === transactionId);
    
    if (!transactionToDelete) return;
    
    // Calculate the effect on wallet balance
    const balanceEffect = 
      transactionToDelete.type === 'income' ? -transactionToDelete.amount :
      transactionToDelete.type === 'expense' ? transactionToDelete.amount : 0;
    
    // Update wallets
    const updatedWallets = state.wallets.map(wallet => {
      if (wallet.id === transactionToDelete.walletId) {
        return { ...wallet, balance: wallet.balance + balanceEffect };
      }
      return wallet;
    });
    
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== transactionId),
      wallets: updatedWallets,
      currentWallet: prev.currentWallet 
        ? updatedWallets.find(w => w.id === prev.currentWallet?.id) || null
        : null
    }));
    
    toast({
      title: "Transaction deleted",
      description: "The transaction has been deleted",
    });
  };

  // Category operations
  const addCategory = (categoryData: Omit<Category, 'id' | 'userId'>) => {
    if (!user) return;
    
    const newCategory: Category = {
      ...categoryData,
      id: `cat_${Date.now()}`,
      userId: user.id,
    };
    
    setState(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory],
    }));
    
    toast({
      title: "Category added",
      description: `${categoryData.name} has been added to your categories`,
    });
  };

  const updateCategory = (category: Category) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === category.id ? category : c),
    }));
    
    toast({
      title: "Category updated",
      description: `${category.name} has been updated`,
    });
  };

  const deleteCategory = (categoryId: string) => {
    // Check if category is in use
    const inUse = state.transactions.some(t => t.categoryId === categoryId);
    
    if (inUse) {
      toast({
        title: "Cannot delete category",
        description: "This category is being used by transactions",
        variant: "destructive",
      });
      return;
    }
    
    setState(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== categoryId),
    }));
    
    toast({
      title: "Category deleted",
      description: "The category has been deleted",
    });
  };

  // Reporting functions
  const getReport = (period: Period, startDate?: Date, endDate?: Date): Report => {
    let filteredTransactions = [...state.transactions];
    const now = new Date();
    
    if (period === 'daily') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filteredTransactions = filteredTransactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate >= today;
      });
    } else if (period === 'weekly') {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      filteredTransactions = filteredTransactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate >= lastWeek;
      });
    } else if (period === 'monthly') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      filteredTransactions = filteredTransactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate >= lastMonth;
      });
    } else if (period === 'yearly') {
      const lastYear = new Date();
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      filteredTransactions = filteredTransactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate >= lastYear;
      });
    } else if (period === 'custom' && startDate && endDate) {
      filteredTransactions = filteredTransactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate >= startDate && transDate <= endDate;
      });
    }
    
    // Calculate totals
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Group by category
    const categoryGroups = filteredTransactions.reduce((groups, transaction) => {
      const category = state.categories.find(c => c.id === transaction.categoryId) || 
                      { id: transaction.categoryId, name: 'Unknown', type: transaction.type as 'income' | 'expense' };
      
      if (!groups[category.id]) {
        groups[category.id] = {
          categoryId: category.id,
          categoryName: category.name,
          amount: 0,
          percentage: 0,
        };
      }
      
      if (transaction.type === 'income' || transaction.type === 'expense') {
        groups[category.id].amount += 
          transaction.type === 'income' ? transaction.amount : transaction.amount;
      }
      
      return groups;
    }, {} as Record<string, { categoryId: string; categoryName: string; amount: number; percentage: number; }>);
    
    // Calculate percentages
    const categorySummary = Object.values(categoryGroups).map(group => {
      const total = group.amount > 0 ? totalIncome : totalExpense;
      return {
        ...group,
        percentage: Math.abs(total > 0 ? (group.amount / total) * 100 : 0),
      };
    });
    
    return {
      period,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      categorySummary: categorySummary.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)),
    };
  };

  return (
    <FinanceContext.Provider
      value={{
        ...state,
        addWallet,
        updateWallet,
        deleteWallet,
        setCurrentWallet,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        getReport,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};
