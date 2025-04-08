
import { supabase } from "@/integrations/supabase/client";
import { Wallet } from '@/types';
import { DbWallet } from '@/utils/supabase-types';
import { ToastType } from './types';

export const loadWallets = async () => {
  const { data: walletsData, error: walletsError } = await supabase
    .from('wallets')
    .select('*')
    .order('name');
  
  if (walletsError) throw walletsError;
  
  return walletsData || [];
};

export const createDefaultWallet = async (userId: string) => {
  const defaultWallet = {
    name: 'Tunai',
    balance: 0,
    currency: 'IDR',
    user_id: userId,
    color: '#48BB78',
    icon: 'cash'
  };
  
  const { data: newWallet, error: newWalletError } = await supabase
    .from('wallets')
    .insert(defaultWallet)
    .select()
    .single();
  
  if (newWalletError) throw newWalletError;
  
  return newWallet;
};

export const addWalletOperation = async (walletData: Omit<Wallet, 'id' | 'userId'>, userId: string, showToast: ToastType) => {
  try {
    const newWalletData = {
      name: walletData.name,
      balance: walletData.balance,
      currency: 'IDR', // Always use IDR
      color: walletData.color,
      icon: walletData.icon,
      user_id: userId,
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
      
      showToast({
        title: "Dompet ditambahkan",
        description: `${walletData.name} telah ditambahkan ke dompet Anda`,
      });

      return newWallet;
    }
    return null;
  } catch (error) {
    console.error('Error adding wallet:', error);
    showToast({
      title: "Gagal menambahkan dompet",
      description: "Terjadi kesalahan saat mencoba menambahkan dompet baru",
      variant: "destructive",
    });
    throw error;
  }
};

export const updateWalletOperation = async (wallet: Wallet, showToast: ToastType) => {
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
    
    showToast({
      title: "Dompet diperbarui",
      description: `${wallet.name} telah diperbarui`,
    });

    return wallet;
  } catch (error) {
    console.error('Error updating wallet:', error);
    showToast({
      title: "Gagal memperbarui dompet",
      description: "Terjadi kesalahan saat mencoba memperbarui dompet",
      variant: "destructive",
    });
    throw error;
  }
};

export const deleteWalletOperation = async (walletId: string, showToast: ToastType) => {
  try {
    const { error } = await supabase
      .from('wallets')
      .delete()
      .eq('id', walletId);
    
    if (error) throw error;
    
    showToast({
      title: "Dompet dihapus",
      description: "Dompet dan transaksinya telah dihapus",
    });

    return true;
  } catch (error) {
    console.error('Error deleting wallet:', error);
    showToast({
      title: "Gagal menghapus dompet",
      description: "Terjadi kesalahan saat mencoba menghapus dompet",
      variant: "destructive",
    });
    throw error;
  }
};
