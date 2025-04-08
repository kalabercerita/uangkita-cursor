
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import TransactionForm from '@/components/TransactionForm';
import { Transaction } from '@/types';
import ExportMenu from '@/components/ExportMenu';
import TransactionFilters from '@/components/transactions/TransactionFilters';
import DailyTransactionGroup from '@/components/transactions/DailyTransactionGroup';
import { formatRupiah, formatDate } from '@/utils/formatters';

const Transactions = () => {
  const { transactions, categories } = useFinance();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Filter transactions based on search query, type, and category
  const filteredTransactions = transactions.filter(transaction => {
    // Filter by search query
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by transaction type
    const matchesType = filterType === 'all' || transaction.type === filterType;
    
    // Filter by category
    const matchesCategory = !selectedCategoryId || transaction.categoryId === selectedCategoryId;
    
    return matchesSearch && matchesType && matchesCategory;
  });
  
  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce<Record<string, Transaction[]>>((groups, transaction) => {
    const date = new Date(transaction.date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(transaction);
    return groups;
  }, {});
  
  // Calculate daily totals
  const dailyTotals = Object.entries(groupedTransactions).map(([date, dayTransactions]) => {
    const income = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { date, income, expense, balance: income - expense };
  });
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-2xl font-bold">Transaksi</h1>
        <div className="flex items-center gap-2">
          <ExportMenu contentRef={contentRef} title="Transaksi_UangKita" />
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-finance-teal to-finance-purple">
                <Plus className="mr-2 h-4 w-4" /> Tambah
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <TransactionForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <TransactionFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterType={filterType}
        setFilterType={setFilterType}
      />
      
      <div ref={contentRef} className="space-y-4">
        {Object.keys(groupedTransactions).length > 0 ? (
          Object.entries(groupedTransactions).map(([date, dayTransactions]) => {
            // Find the daily total for this date
            const dailyTotal = dailyTotals.find(dt => dt.date === date);
            
            return (
              <DailyTransactionGroup
                key={date}
                date={date}
                transactions={dayTransactions}
                categories={categories}
                dailyBalance={dailyTotal?.balance || 0}
                formatRupiah={formatRupiah}
                formatDate={formatDate}
              />
            );
          })
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">Tidak ada transaksi yang ditemukan</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Floating add button for mobile */}
      <div className="fixed bottom-20 right-6 md:hidden z-10">
        <Dialog>
          <DialogTrigger asChild>
            <Button size="icon" className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-finance-teal to-finance-purple">
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <TransactionForm />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Transactions;
