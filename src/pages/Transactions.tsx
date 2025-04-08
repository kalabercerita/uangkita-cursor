
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Search,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import TransactionForm from '@/components/TransactionForm';
import { Transaction } from '@/types';
import ExportMenu from '@/components/ExportMenu';

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
  
  // Format number as Indonesian Rupiah
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Format date for display
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get category details
  const getCategoryDetails = (categoryId: string) => {
    return categories.find(category => category.id === categoryId);
  };
  
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
      
      <div className="flex flex-col sm:flex-row gap-2 items-center mb-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Cari transaksi..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setFilterType(value as 'all' | 'income' | 'expense')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="income">Pemasukan</TabsTrigger>
          <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div ref={contentRef} className="space-y-4">
        {Object.keys(groupedTransactions).length > 0 ? (
          Object.entries(groupedTransactions).map(([date, dayTransactions]) => {
            // Find the daily total for this date
            const dailyTotal = dailyTotals.find(dt => dt.date === date);
            
            return (
              <Card key={date} className="overflow-hidden">
                <div className="bg-muted p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
                    <h3 className="font-medium">{date}</h3>
                  </div>
                  <div className="text-sm">
                    <span className={dailyTotal?.balance && dailyTotal.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatRupiah(dailyTotal?.balance || 0)}
                    </span>
                  </div>
                </div>
                <CardContent className="p-0">
                  <ScrollArea className="max-h-[400px]">
                    <div className="divide-y">
                      {dayTransactions.map(transaction => {
                        const category = getCategoryDetails(transaction.categoryId);
                        
                        return (
                          <div key={transaction.id} className="p-4 flex items-center justify-between">
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
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
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
