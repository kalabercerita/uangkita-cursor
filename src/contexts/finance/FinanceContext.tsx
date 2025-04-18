import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Wallet, Category, Transaction } from '@/types/finance';

export type FinanceContextType = {
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  refreshWallets: () => Promise<void>;
};

export const FinanceContext = createContext<FinanceContextType>({
  wallets: [],
  categories: [],
  transactions: [],
  refreshWallets: async () => {},
});

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { user } = useAuth();

  const refreshWallets = async () => {
    if (!user) return;
    
    const { data: walletsData, error: walletsError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .order('name');

    if (walletsError) {
      console.error('Error loading wallets:', walletsError);
      return;
    }

    setWallets(walletsData || []);
  };

  useEffect(() => {
    if (!user) return;

    // Load wallets
    refreshWallets();

    // Load categories
    const loadCategories = async () => {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('name');

      if (categoriesError) {
        console.error('Error loading categories:', categoriesError);
        return;
      }

      setCategories(categoriesData || []);
    };

    // Load transactions
    const loadTransactions = async () => {
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (transactionsError) {
        console.error('Error loading transactions:', transactionsError);
        return;
      }

      setTransactions(transactionsData || []);
    };

    loadCategories();
    loadTransactions();
  }, [user]);

  return (
    <FinanceContext.Provider value={{ 
      wallets, 
      categories, 
      transactions,
      refreshWallets
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}; 