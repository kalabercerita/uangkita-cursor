

// This file contains TypeScript interfaces that match our Supabase database schema
// This is a workaround since we can't modify the auto-generated types.ts file

export interface DbWallet {
  id: string;
  user_id: string;
  name: string;
  balance: number;
  currency: string;
  color: string;
  icon: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbCategory {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbTransaction {
  id: string;
  user_id: string;
  wallet_id: string;
  category_id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  created_at?: string;
  updated_at?: string;
}

