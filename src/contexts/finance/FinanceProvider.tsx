
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { 
  Wallet, 
  Transaction, 
  Category, 
  FinanceState, 
  Period 
} from '@/types';
import FinanceContext from './FinanceContext';
import { 
  loadWallets, 
  createDefaultWallet,
  addWalletOperation, 
  updateWalletOperation, 
  deleteWalletOperation 
} from './walletOperations';
import { 
  loadTransactions, 
  addTransactionOperation, 
  updateTransactionOperation, 
  deleteTransactionOperation 
} from './transactionOperations';
import { 
  loadCategories, 
  addCategoryOperation, 
  updateCategoryOperation, 
  deleteCategoryOperation 
} from './categoryOperations';
import { getReportOperation } from './reportOperations';
import { DbWallet, DbCategory, DbTransaction } from '@/utils/supabase-types';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<FinanceState>({
    wallets: [],
    transactions: [],
    categories: [],
    currentWallet: null,
    isLoading: true,
    error: null,
  });

  // Load user data from Supabase
  useEffect(() => {
    if (user && session) {
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
  }, [user, session]);

  const loadUserData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Fetch categories
      const categoriesData = await loadCategories();
      
      // Fetch wallets
      const walletsData = await loadWallets();
      
      // Fetch transactions
      const transactionsData = await loadTransactions();
      
      // Create a new wallet if none exist
      if (walletsData.length === 0 && user) {
        const newWallet = await createDefaultWallet(user.id);
        if (newWallet) {
          walletsData.push(newWallet);
        }
      }
      
      // Convert from database format to app format
      const categories = categoriesData.map(c => ({
        id: c.id,
        name: c.name,
        type: c.type as 'income' | 'expense',
        color: c.color,
        icon: c.icon,
        userId: c.user_id
      }));
      
      const wallets = walletsData.map(w => ({
        id: w.id,
        name: w.name,
        balance: w.balance,
        currency: 'IDR', // Always use IDR
        color: w.color,
        icon: w.icon,
        userId: w.user_id
      }));
      
      const transactions = transactionsData.map(t => ({
        id: t.id,
        description: t.description,
        amount: t.amount,
        type: t.type as 'income' | 'expense',
        date: t.date,
        categoryId: t.category_id,
        walletId: t.wallet_id,
        userId: t.user_id
      }));
      
      setState({
        categories,
        wallets,
        transactions,
        currentWallet: wallets.length > 0 ? wallets[0] : null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Failed to load user data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Gagal memuat data keuangan Anda'
      }));
      toast({
        title: "Error saat memuat data",
        description: "Terjadi masalah saat memuat data keuangan Anda",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Wallet operations
  const addWallet = async (walletData: Omit<Wallet, 'id' | 'userId'>) => {
    if (!user) return;
    
    try {
      const newWallet = await addWalletOperation(walletData, user.id, toast);
      
      if (newWallet) {
        setState(prev => ({
          ...prev,
          wallets: [...prev.wallets, newWallet],
          currentWallet: prev.currentWallet || newWallet,
        }));
      }
    } catch (error) {
      console.error('Error in addWallet:', error);
    }
  };

  const updateWallet = async (wallet: Wallet) => {
    try {
      const updatedWallet = await updateWalletOperation(wallet, toast);
      
      setState(prev => ({
        ...prev,
        wallets: prev.wallets.map(w => w.id === wallet.id ? updatedWallet : w),
        currentWallet: prev.currentWallet?.id === wallet.id ? updatedWallet : prev.currentWallet,
      }));
    } catch (error) {
      console.error('Error in updateWallet:', error);
    }
  };

  const deleteWallet = async (walletId: string) => {
    try {
      const success = await deleteWalletOperation(walletId, toast);
      
      if (success) {
        setState(prev => {
          const updatedWallets = prev.wallets.filter(w => w.id !== walletId);
          return {
            ...prev,
            wallets: updatedWallets,
            currentWallet: prev.currentWallet?.id === walletId
              ? (updatedWallets.length > 0 ? updatedWallets[0] : null)
              : prev.currentWallet,
          };
        });
      }
    } catch (error) {
      console.error('Error in deleteWallet:', error);
    }
  };

  const setCurrentWallet = (wallet: Wallet | null) => {
    setState(prev => ({
      ...prev,
      currentWallet: wallet,
    }));
  };

  // Transaction operations
  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'userId'>) => {
    if (!user) return;
    
    try {
      const result = await addTransactionOperation(transactionData, user.id, state.wallets, toast);
      
      if (result) {
        const { transaction, updatedWallet } = result;
        
        setState(prev => ({
          ...prev,
          transactions: [transaction, ...prev.transactions],
          wallets: prev.wallets.map(w => w.id === updatedWallet.id ? updatedWallet : w),
          currentWallet: prev.currentWallet?.id === updatedWallet.id ? updatedWallet : prev.currentWallet
        }));
      }
    } catch (error) {
      console.error('Error in addTransaction:', error);
    }
  };

  const updateTransaction = async (transaction: Transaction) => {
    try {
      const result = await updateTransactionOperation(transaction, state.wallets, toast);
      
      if (result) {
        const { transaction: updatedTransaction, updatedWallets } = result;
        
        setState(prev => ({
          ...prev,
          transactions: prev.transactions.map(t => t.id === transaction.id ? updatedTransaction : t),
          wallets: updatedWallets,
          currentWallet: prev.currentWallet 
            ? updatedWallets.find(w => w.id === prev.currentWallet?.id) || null
            : null
        }));
      }
    } catch (error) {
      console.error('Error in updateTransaction:', error);
    }
  };

  const deleteTransaction = async (transactionId: string) => {
    try {
      const result = await deleteTransactionOperation(transactionId, state.transactions, state.wallets, toast);
      
      if (result.success) {
        const { updatedWallet } = result;
        
        setState(prev => ({
          ...prev,
          transactions: prev.transactions.filter(t => t.id !== transactionId),
          wallets: updatedWallet 
            ? prev.wallets.map(w => w.id === updatedWallet.id ? updatedWallet : w)
            : prev.wallets,
          currentWallet: updatedWallet && prev.currentWallet?.id === updatedWallet.id
            ? updatedWallet
            : prev.currentWallet
        }));
      }
    } catch (error) {
      console.error('Error in deleteTransaction:', error);
    }
  };

  // Category operations
  const addCategory = async (categoryData: Omit<Category, 'id' | 'userId'>) => {
    if (!user) return;
    
    try {
      const newCategory = await addCategoryOperation(categoryData, user.id, toast);
      
      if (newCategory) {
        setState(prev => ({
          ...prev,
          categories: [...prev.categories, newCategory],
        }));
      }
    } catch (error) {
      console.error('Error in addCategory:', error);
    }
  };

  const updateCategory = async (category: Category) => {
    try {
      const updatedCategory = await updateCategoryOperation(category, toast);
      
      setState(prev => ({
        ...prev,
        categories: prev.categories.map(c => c.id === category.id ? updatedCategory : c),
      }));
    } catch (error) {
      console.error('Error in updateCategory:', error);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const success = await deleteCategoryOperation(categoryId, state.transactions, toast);
      
      if (success) {
        setState(prev => ({
          ...prev,
          categories: prev.categories.filter(c => c.id !== categoryId),
        }));
      }
    } catch (error) {
      console.error('Error in deleteCategory:', error);
    }
  };

  // Reports with improved period filtering
  const getReport = (period: Period, startDate?: Date, endDate?: Date) => {
    return getReportOperation(period, state.transactions, state.categories, startDate, endDate);
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
