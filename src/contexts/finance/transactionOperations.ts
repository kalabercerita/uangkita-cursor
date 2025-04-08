

import { supabase } from "@/integrations/supabase/client";
import { Transaction, Wallet } from '@/types';
import { DbTransaction } from '@/utils/supabase-types';
import { ToastType } from './types';

export const loadTransactions = async () => {
  const { data: transactionsData, error: transactionsError } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false }) as { data: DbTransaction[] | null; error: any };
  
  if (transactionsError) throw transactionsError;
  
  return transactionsData || [];
};

export const addTransactionOperation = async (
  transactionData: Omit<Transaction, 'id' | 'userId'>, 
  userId: string, 
  wallets: Wallet[],
  showToast: ToastType
) => {
  try {
    // Convert Date object to ISO string if it's a Date
    const formattedDate = transactionData.date instanceof Date 
      ? transactionData.date.toISOString() 
      : transactionData.date;
    
    const newTransactionData = {
      description: transactionData.description,
      amount: transactionData.amount,
      type: transactionData.type,
      category_id: transactionData.categoryId,
      wallet_id: transactionData.walletId,
      date: formattedDate,
      user_id: userId,
    };
    
    // Add the transaction
    const { data, error } = await supabase
      .from('transactions')
      .insert(newTransactionData)
      .select()
      .single() as { data: DbTransaction | null; error: any };
    
    if (error) throw error;
    
    // Update wallet balance
    const walletToUpdate = wallets.find(w => w.id === transactionData.walletId);
    
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
        .eq('id', updatedWallet.id) as { error: any };
      
      if (walletError) throw walletError;
      
      // Create transaction object
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
      
      showToast({
        title: "Transaksi ditambahkan",
        description: `${transactionData.description} telah dicatat`,
      });

      return { transaction: newTransaction, updatedWallet };
    }
    return null;
  } catch (error) {
    console.error('Error adding transaction:', error);
    showToast({
      title: "Gagal menambahkan transaksi",
      description: "Terjadi kesalahan saat mencoba menambahkan transaksi baru",
      variant: "destructive",
    });
    throw error;
  }
};

export const updateTransactionOperation = async (
  transaction: Transaction, 
  wallets: Wallet[],
  showToast: ToastType
) => {
  try {
    // Find original transaction
    const originalTransaction = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transaction.id)
      .single() as { data: DbTransaction | null; error: any };
    
    if (originalTransaction.error || !originalTransaction.data) {
      throw new Error('Transaction not found');
    }
    
    const original = originalTransaction.data;
    
    // Calculate balance adjustments
    let originalBalanceEffect = 
      original.type === 'income' ? original.amount :
      original.type === 'expense' ? -original.amount : 0;
    
    let newBalanceEffect = 
      transaction.type === 'income' ? transaction.amount :
      transaction.type === 'expense' ? -transaction.amount : 0;
    
    // Convert Date object to ISO string if it's a Date
    const formattedDate = transaction.date instanceof Date 
      ? transaction.date.toISOString() 
      : transaction.date;
    
    // Update transaction in database
    const { error } = await supabase
      .from('transactions')
      .update({
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        category_id: transaction.categoryId,
        wallet_id: transaction.walletId,
        date: formattedDate
      })
      .eq('id', transaction.id) as { error: any };
    
    if (error) throw error;
    
    // Update wallets if necessary
    const updatedWallets = [...wallets];
    const walletUpdates = [];
    
    // Remove effect from original wallet
    const originalWalletIndex = updatedWallets.findIndex(w => w.id === original.wallet_id);
    if (originalWalletIndex >= 0) {
      updatedWallets[originalWalletIndex] = {
        ...updatedWallets[originalWalletIndex],
        balance: updatedWallets[originalWalletIndex].balance - originalBalanceEffect
      };
      
      // Update in database
      const walletUpdatePromise = supabase
        .from('wallets')
        .update({ balance: updatedWallets[originalWalletIndex].balance })
        .eq('id', updatedWallets[originalWalletIndex].id);
      
      walletUpdates.push(walletUpdatePromise);
    }
    
    // Add effect to new wallet (if different)
    if (transaction.walletId !== original.wallet_id) {
      const newWalletIndex = updatedWallets.findIndex(w => w.id === transaction.walletId);
      if (newWalletIndex >= 0) {
        updatedWallets[newWalletIndex] = {
          ...updatedWallets[newWalletIndex],
          balance: updatedWallets[newWalletIndex].balance + newBalanceEffect
        };
        
        // Update in database
        const walletUpdatePromise = supabase
          .from('wallets')
          .update({ balance: updatedWallets[newWalletIndex].balance })
          .eq('id', updatedWallets[newWalletIndex].id);
        
        walletUpdates.push(walletUpdatePromise);
      }
    } else if (originalWalletIndex >= 0) {
      // Same wallet, but need to apply the new effect
      updatedWallets[originalWalletIndex] = {
        ...updatedWallets[originalWalletIndex],
        balance: updatedWallets[originalWalletIndex].balance + newBalanceEffect
      };
      
      // Already updated in database above
      if (walletUpdates.length === 0) {
        const walletUpdatePromise = supabase
          .from('wallets')
          .update({ balance: updatedWallets[originalWalletIndex].balance })
          .eq('id', updatedWallets[originalWalletIndex].id);
        
        walletUpdates.push(walletUpdatePromise);
      }
    }
    
    // Wait for all wallet updates to complete
    await Promise.all(walletUpdates);
    
    showToast({
      title: "Transaksi diperbarui",
      description: `${transaction.description} telah diperbarui`,
    });

    return { transaction, updatedWallets };
  } catch (error) {
    console.error('Error updating transaction:', error);
    showToast({
      title: "Gagal memperbarui transaksi",
      description: "Terjadi kesalahan saat mencoba memperbarui transaksi",
      variant: "destructive",
    });
    throw error;
  }
};

export const deleteTransactionOperation = async (
  transactionId: string, 
  transactions: Transaction[],
  wallets: Wallet[],
  showToast: ToastType
) => {
  try {
    const transactionToDelete = transactions.find(t => t.id === transactionId);
    
    if (!transactionToDelete) return { success: false };
    
    // Calculate the effect on wallet balance
    const balanceEffect = 
      transactionToDelete.type === 'income' ? -transactionToDelete.amount :
      transactionToDelete.type === 'expense' ? transactionToDelete.amount : 0;
    
    // Delete from database
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId) as { error: any };
    
    if (error) throw error;
    
    // Update wallet balance
    const walletToUpdate = wallets.find(w => w.id === transactionToDelete.walletId);
    
    if (walletToUpdate) {
      const updatedWallet = {
        ...walletToUpdate,
        balance: walletToUpdate.balance + balanceEffect
      };
      
      // Update in database
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ balance: updatedWallet.balance })
        .eq('id', updatedWallet.id) as { error: any };
      
      if (walletError) throw walletError;
      
      showToast({
        title: "Transaksi dihapus",
        description: "Transaksi telah dihapus",
      });

      return { success: true, updatedWallet };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting transaction:', error);
    showToast({
      title: "Gagal menghapus transaksi",
      description: "Terjadi kesalahan saat mencoba menghapus transaksi",
      variant: "destructive",
    });
    throw error;
  }
};

