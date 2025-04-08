
import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Transaction } from '@/types';
import { Category } from '@/types';

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  formatRupiah: (amount: number) => string;
  formatDate: (dateString: string | Date) => string;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ 
  transaction, 
  category, 
  formatRupiah, 
  formatDate 
}) => {
  return (
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {transaction.type === 'income' ? (
            <ArrowUpRight className="h-5 w-5 text-green-600" />
          ) : (
            <ArrowDownRight className="h-5 w-5 text-red-600" />
          )}
        </div>
        <div className="ml-4">
          <div className="font-medium">{transaction.description}</div>
          <div className="text-sm text-muted-foreground flex items-center">
            <div className={`w-2 h-2 rounded-full bg-${category?.color || 'gray-400'} mr-2`}></div>
            {category?.name || 'Tanpa Kategori'}
          </div>
        </div>
      </div>
      <div className={`text-right ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
        <div className="font-medium">
          {transaction.type === 'income' ? '+' : '-'} {formatRupiah(transaction.amount)}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDate(transaction.date)}
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;
