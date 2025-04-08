
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from './AuthContext';
import { supabase } from "@/integrations/supabase/client";
import {
  Wallet,
  Transaction,
  Category,
  FinanceState,
  Report,
  Period
} from '@/types';
import { DbWallet, DbCategory, DbTransaction } from '@/utils/supabase-types';

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
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (categoriesError) throw categoriesError;
      
      // Fetch wallets
      const { data: walletsData, error: walletsError } = await supabase
        .from('wallets')
        .select('*')
        .order('name');
      
      if (walletsError) throw walletsError;
      
      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (transactionsError) throw transactionsError;
      
      // Create a new wallet if none exist
      if (walletsData && walletsData.length === 0 && user) {
        const defaultWallet = {
          name: 'Tunai',
          balance: 0,
          currency: 'IDR',
          user_id: user.id,
          color: '#48BB78',
          icon: 'cash'
        };
        
        const { data: newWallet, error: newWalletError } = await supabase
          .from('wallets')
          .insert(defaultWallet)
          .select()
          .single();
        
        if (newWalletError) throw newWalletError;
        
        if (newWallet) {
          walletsData.push(newWallet);
        }
      }
      
      // Convert from database format to app format
      const categories = categoriesData ? categoriesData.map(c => ({
        id: c.id,
        name: c.name,
        type: c.type as 'income' | 'expense',
        color: c.color,
        icon: c.icon,
        userId: c.user_id
      })) : [];
      
      const wallets = walletsData ? walletsData.map(w => ({
        id: w.id,
        name: w.name,
        balance: w.balance,
        currency: 'IDR', // Always use IDR
        color: w.color,
        icon: w.icon,
        userId: w.user_id
      })) : [];
      
      const transactions = transactionsData ? transactionsData.map(t => ({
        id: t.id,
        description: t.description,
        amount: t.amount,
        type: t.type as 'income' | 'expense',
        date: t.date,
        categoryId: t.category_id,
        walletId: t.wallet_id,
        userId: t.user_id
      })) : [];
      
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
      const newWalletData = {
        name: walletData.name,
        balance: walletData.balance,
        currency: 'IDR', // Always use IDR
        color: walletData.color,
        icon: walletData.icon,
        user_id: user.id,
      };
      
      const { data, error } = await supabase
        .from('wallets')
        .insert(newWalletData)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        const newWallet: Wallet = {
          id: data.id,
          name: data.name,
          balance: data.balance,
          currency: 'IDR',
          color: data.color,
          icon: data.icon,
          userId: data.user_id
        };
        
        setState(prev => ({
          ...prev,
          wallets: [...prev.wallets, newWallet],
          currentWallet: prev.currentWallet || newWallet,
        }));
        
        toast({
          title: "Dompet ditambahkan",
          description: `${walletData.name} telah ditambahkan ke dompet Anda`,
        });
      }
    } catch (error) {
      console.error('Error adding wallet:', error);
      toast({
        title: "Gagal menambahkan dompet",
        description: "Terjadi kesalahan saat mencoba menambahkan dompet baru",
        variant: "destructive",
      });
    }
  };

  const updateWallet = async (wallet: Wallet) => {
    try {
      const { error } = await supabase
        .from('wallets')
        .update({
          name: wallet.name,
          balance: wallet.balance,
          color: wallet.color,
          icon: wallet.icon
        })
        .eq('id', wallet.id);
      
      if (error) throw error;
      
      setState(prev => ({
        ...prev,
        wallets: prev.wallets.map(w => w.id === wallet.id ? wallet : w),
        currentWallet: prev.currentWallet?.id === wallet.id ? wallet : prev.currentWallet,
      }));
      
      toast({
        title: "Dompet diperbarui",
        description: `${wallet.name} telah diperbarui`,
      });
    } catch (error) {
      console.error('Error updating wallet:', error);
      toast({
        title: "Gagal memperbarui dompet",
        description: "Terjadi kesalahan saat mencoba memperbarui dompet",
        variant: "destructive",
      });
    }
  };

  const deleteWallet = async (walletId: string) => {
    try {
      const { error } = await supabase
        .from('wallets')
        .delete()
        .eq('id', walletId);
      
      if (error) throw error;
      
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
      
      toast({
        title: "Dompet dihapus",
        description: "Dompet dan transaksinya telah dihapus",
      });
    } catch (error) {
      console.error('Error deleting wallet:', error);
      toast({
        title: "Gagal menghapus dompet",
        description: "Terjadi kesalahan saat mencoba menghapus dompet",
        variant: "destructive",
      });
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
      const newTransactionData = {
        description: transactionData.description,
        amount: transactionData.amount,
        type: transactionData.type,
        category_id: transactionData.categoryId,
        wallet_id: transactionData.walletId,
        date: transactionData.date,
        user_id: user.id,
      };
      
      // Add the transaction
      const { data, error } = await supabase
        .from('transactions')
        .insert(newTransactionData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update wallet balance
      const walletToUpdate = state.wallets.find(w => w.id === transactionData.walletId);
      
      if (walletToUpdate && data) {
        const balanceChange = 
          transactionData.type === 'income' ? transactionData.amount :
          transactionData.type === 'expense' ? -transactionData.amount : 0;
        
        const updatedWallet = {
          ...walletToUpdate,
          balance: walletToUpdate.balance + balanceChange
        };
        
        // Update wallet in database
        const { error: walletError } = await supabase
          .from('wallets')
          .update({ balance: updatedWallet.balance })
          .eq('id', updatedWallet.id);
        
        if (walletError) throw walletError;
        
        // Update state
        const newTransaction: Transaction = {
          id: data.id,
          description: data.description,
          amount: data.amount,
          type: data.type as 'income' | 'expense',
          categoryId: data.category_id,
          walletId: data.wallet_id,
          date: data.date,
          userId: data.user_id
        };
        
        setState(prev => ({
          ...prev,
          transactions: [newTransaction, ...prev.transactions],
          wallets: prev.wallets.map(w => w.id === updatedWallet.id ? updatedWallet : w),
          currentWallet: prev.currentWallet?.id === updatedWallet.id ? updatedWallet : prev.currentWallet
        }));
      }
      
      toast({
        title: "Transaksi ditambahkan",
        description: `${transactionData.description} telah dicatat`,
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Gagal menambahkan transaksi",
        description: "Terjadi kesalahan saat mencoba menambahkan transaksi baru",
        variant: "destructive",
      });
    }
  };

  const updateTransaction = async (transaction: Transaction) => {
    try {
      // Find original transaction
      const originalTransaction = state.transactions.find(t => t.id === transaction.id);
      
      if (!originalTransaction) return;
      
      // Calculate balance adjustments
      let originalBalanceEffect = 
        originalTransaction.type === 'income' ? originalTransaction.amount :
        originalTransaction.type === 'expense' ? -originalTransaction.amount : 0;
      
      let newBalanceEffect = 
        transaction.type === 'income' ? transaction.amount :
        transaction.type === 'expense' ? -transaction.amount : 0;
      
      // Update transaction in database
      const { error } = await supabase
        .from('transactions')
        .update({
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
          category_id: transaction.categoryId,
          wallet_id: transaction.walletId,
          date: transaction.date
        })
        .eq('id', transaction.id);
      
      if (error) throw error;
      
      // Update wallets if necessary
      const updatedWallets = [...state.wallets];
      
      // Remove effect from original wallet
      const originalWalletIndex = updatedWallets.findIndex(w => w.id === originalTransaction.walletId);
      if (originalWalletIndex >= 0) {
        updatedWallets[originalWalletIndex] = {
          ...updatedWallets[originalWalletIndex],
          balance: updatedWallets[originalWalletIndex].balance - originalBalanceEffect
        };
        
        // Update in database
        await supabase
          .from('wallets')
          .update({ balance: updatedWallets[originalWalletIndex].balance })
          .eq('id', updatedWallets[originalWalletIndex].id);
      }
      
      // Add effect to new wallet (if different)
      if (transaction.walletId !== originalTransaction.walletId) {
        const newWalletIndex = updatedWallets.findIndex(w => w.id === transaction.walletId);
        if (newWalletIndex >= 0) {
          updatedWallets[newWalletIndex] = {
            ...updatedWallets[newWalletIndex],
            balance: updatedWallets[newWalletIndex].balance + newBalanceEffect
          };
          
          // Update in database
          await supabase
            .from('wallets')
            .update({ balance: updatedWallets[newWalletIndex].balance })
            .eq('id', updatedWallets[newWalletIndex].id);
        }
      } else if (originalWalletIndex >= 0) {
        // Same wallet, but need to apply the new effect
        updatedWallets[originalWalletIndex] = {
          ...updatedWallets[originalWalletIndex],
          balance: updatedWallets[originalWalletIndex].balance + newBalanceEffect
        };
        
        // Already updated in database above
      }
      
      // Update state
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(t => t.id === transaction.id ? transaction : t),
        wallets: updatedWallets,
        currentWallet: prev.currentWallet 
          ? updatedWallets.find(w => w.id === prev.currentWallet?.id) || null
          : null
      }));
      
      toast({
        title: "Transaksi diperbarui",
        description: `${transaction.description} telah diperbarui`,
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: "Gagal memperbarui transaksi",
        description: "Terjadi kesalahan saat mencoba memperbarui transaksi",
        variant: "destructive",
      });
    }
  };

  const deleteTransaction = async (transactionId: string) => {
    try {
      const transactionToDelete = state.transactions.find(t => t.id === transactionId);
      
      if (!transactionToDelete) return;
      
      // Calculate the effect on wallet balance
      const balanceEffect = 
        transactionToDelete.type === 'income' ? -transactionToDelete.amount :
        transactionToDelete.type === 'expense' ? transactionToDelete.amount : 0;
      
      // Delete from database
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);
      
      if (error) throw error;
      
      // Update wallet balance
      const walletToUpdate = state.wallets.find(w => w.id === transactionToDelete.walletId);
      
      if (walletToUpdate) {
        const updatedWallet = {
          ...walletToUpdate,
          balance: walletToUpdate.balance + balanceEffect
        };
        
        // Update in database
        const { error: walletError } = await supabase
          .from('wallets')
          .update({ balance: updatedWallet.balance })
          .eq('id', updatedWallet.id);
        
        if (walletError) throw walletError;
        
        // Update state
        setState(prev => ({
          ...prev,
          transactions: prev.transactions.filter(t => t.id !== transactionId),
          wallets: prev.wallets.map(w => w.id === updatedWallet.id ? updatedWallet : w),
          currentWallet: prev.currentWallet?.id === updatedWallet.id ? updatedWallet : prev.currentWallet
        }));
      }
      
      toast({
        title: "Transaksi dihapus",
        description: "Transaksi telah dihapus",
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Gagal menghapus transaksi",
        description: "Terjadi kesalahan saat mencoba menghapus transaksi",
        variant: "destructive",
      });
    }
  };

  // Category operations
  const addCategory = async (categoryData: Omit<Category, 'id' | 'userId'>) => {
    if (!user) return;
    
    try {
      const newCategoryData = {
        name: categoryData.name,
        type: categoryData.type,
        color: categoryData.color,
        icon: categoryData.icon,
        user_id: user.id,
      };
      
      const { data, error } = await supabase
        .from('categories')
        .insert(newCategoryData)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        const newCategory: Category = {
          id: data.id,
          name: data.name,
          type: data.type as 'income' | 'expense',
          color: data.color,
          icon: data.icon,
          userId: data.user_id
        };
        
        setState(prev => ({
          ...prev,
          categories: [...prev.categories, newCategory],
        }));
        
        toast({
          title: "Kategori ditambahkan",
          description: `${categoryData.name} telah ditambahkan ke kategori Anda`,
        });
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Gagal menambahkan kategori",
        description: "Terjadi kesalahan saat mencoba menambahkan kategori baru",
        variant: "destructive",
      });
    }
  };

  const updateCategory = async (category: Category) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: category.name,
          type: category.type,
          color: category.color,
          icon: category.icon
        })
        .eq('id', category.id);
      
      if (error) throw error;
      
      setState(prev => ({
        ...prev,
        categories: prev.categories.map(c => c.id === category.id ? category : c),
      }));
      
      toast({
        title: "Kategori diperbarui",
        description: `${category.name} telah diperbarui`,
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Gagal memperbarui kategori",
        description: "Terjadi kesalahan saat mencoba memperbarui kategori",
        variant: "destructive",
      });
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      // Check if category is in use
      const inUse = state.transactions.some(t => t.categoryId === categoryId);
      
      if (inUse) {
        toast({
          title: "Tidak dapat menghapus kategori",
          description: "Kategori ini sedang digunakan oleh transaksi",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) throw error;
      
      setState(prev => ({
        ...prev,
        categories: prev.categories.filter(c => c.id !== categoryId),
      }));
      
      toast({
        title: "Kategori dihapus",
        description: "Kategori telah dihapus",
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Gagal menghapus kategori",
        description: "Terjadi kesalahan saat mencoba menghapus kategori",
        variant: "destructive",
      });
    }
  };

  // Reports with improved period filtering
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
      // For custom period, ensure end date includes the entire day
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setHours(23, 59, 59, 999);
      
      filteredTransactions = filteredTransactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate >= startDate && transDate <= adjustedEndDate;
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
      
      if (transaction.type === 'income') {
        groups[category.id].amount += transaction.amount;
      } else if (transaction.type === 'expense') {
        groups[category.id].amount -= transaction.amount;
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
