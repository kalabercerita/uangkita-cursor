
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { useFinance } from '@/contexts/FinanceContext';
import { Transaction as TransactionType } from '@/types';
import TransactionForm from '@/components/TransactionForm';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low'>('newest');
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isEditTransactionOpen, setIsEditTransactionOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<TransactionType | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [activeTab, setActiveTab] = useState('all');
  
  const { transactions, categories, wallets, deleteTransaction } = useFinance();
  
  // Filter and sort transactions based on the active tab and filters
  const filteredTransactions = transactions
    .filter(transaction => {
      // Tab filter
      if (activeTab === 'income' && transaction.type !== 'income') return false;
      if (activeTab === 'expense' && transaction.type !== 'expense') return false;
      
      // Category filter
      if (filterCategory && transaction.categoryId !== filterCategory) return false;
      
      // Date range filter
      if (dateRange?.from && dateRange?.to) {
        const transactionDate = new Date(transaction.date);
        if (transactionDate < dateRange.from || transactionDate > dateRange.to) {
          return false;
        }
      }
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const categoryName = categories.find(c => c.id === transaction.categoryId)?.name.toLowerCase() || '';
        const walletName = wallets.find(w => w.id === transaction.walletId)?.name.toLowerCase() || '';
        
        return (
          transaction.description.toLowerCase().includes(searchLower) ||
          categoryName.includes(searchLower) ||
          walletName.includes(searchLower)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by date or amount
      if (sortOrder === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortOrder === 'oldest') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortOrder === 'amount_high') {
        return b.amount - a.amount;
      } else {
        return a.amount - b.amount;
      }
    });
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Group transactions by date
  const groupTransactionsByDate = () => {
    const grouped: { [date: string]: TransactionType[] } = {};
    
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(transaction);
    });
    
    return grouped;
  };

  const groupedTransactions = groupTransactionsByDate();
  
  const handleEditTransaction = (transaction: TransactionType) => {
    setTransactionToEdit(transaction);
    setIsEditTransactionOpen(true);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    setTransactionToDelete(transactionId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTransaction = async () => {
    if (transactionToDelete) {
      await deleteTransaction(transactionToDelete);
      setTransactionToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };
  
  // Get today and yesterday dates for display
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  // Get day name (Hari ini, Kemarin, or date)
  const getDayName = (dateKey: string) => {
    if (dateKey === today) {
      return 'Hari ini';
    } else if (dateKey === yesterday) {
      return 'Kemarin';
    } else {
      const date = new Date(dateKey);
      // Format: "Senin", "Selasa", etc.
      return date.toLocaleDateString('id-ID', { weekday: 'long' });
    }
  };
  
  // Function to get the total amount for a day
  const getDailyTotal = (transactions: TransactionType[]) => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    return income - expense;
  };
  
  // Render transactions grouped by date
  const renderTransactionsByDate = () => {
    const dateKeys = Object.keys(groupedTransactions).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
    
    if (dateKeys.length === 0) {
      return (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">No transactions found. Add some transactions to get started!</p>
        </div>
      );
    }
    
    return dateKeys.map(dateKey => {
      const transactions = groupedTransactions[dateKey];
      const dayName = getDayName(dateKey);
      const date = new Date(dateKey);
      const dailyTotal = getDailyTotal(transactions);
      
      return (
        <div key={dateKey} className="mb-6">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-2">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4 items-center">
                <div className="text-3xl font-bold">
                  {date.getDate()}
                </div>
                <div>
                  <div className="font-semibold">{dayName}</div>
                  <div className="text-sm text-muted-foreground">
                    {date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
              <div className={`font-semibold ${dailyTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dailyTotal >= 0 ? '+' : ''}{formatCurrency(dailyTotal)}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            {transactions.map(transaction => {
              const category = categories.find(c => c.id === transaction.categoryId);
              const wallet = wallets.find(w => w.id === transaction.walletId);
              
              return (
                <div 
                  key={transaction.id} 
                  className="bg-white dark:bg-gray-900 border rounded-lg p-3 flex justify-between items-center"
                >
                  <div className="flex space-x-3 items-center">
                    <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-5 w-5 text-finance-green" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-finance-red" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground flex items-center space-x-2">
                        <span>{category?.name || 'Uncategorized'}</span>
                        <span>•</span>
                        <span>{wallet?.name || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className={`font-medium ${transaction.type === 'income' ? 'text-finance-green' : 'text-finance-red'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditTransaction(transaction)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };
  
  return (
    <div className="space-y-6 py-6 animate-fade-in relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">
          Transaksi
        </h2>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari transaksi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                {filterCategory ? 
                  categories.find(c => c.id === filterCategory)?.name || 'Kategori' : 
                  'Kategori'
                }
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter berdasarkan Kategori</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilterCategory(null)}>
                Semua Kategori
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Pemasukan</DropdownMenuLabel>
              {categories
                .filter(c => c.type === 'income')
                .map(category => (
                  <DropdownMenuItem 
                    key={category.id} 
                    onClick={() => setFilterCategory(category.id)}
                  >
                    {category.name}
                  </DropdownMenuItem>
                ))
              }
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Pengeluaran</DropdownMenuLabel>
              {categories
                .filter(c => c.type === 'expense')
                .map(category => (
                  <DropdownMenuItem 
                    key={category.id} 
                    onClick={() => setFilterCategory(category.id)}
                  >
                    {category.name}
                  </DropdownMenuItem>
                ))
              }
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Urutkan
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Urutkan berdasarkan</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortOrder('newest')}>
                Terbaru
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder('oldest')}>
                Terlama
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder('amount_high')}>
                Jumlah (Tinggi ke Rendah)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder('amount_low')}>
                Jumlah (Rendah ke Tinggi)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/yy")} -{" "}
                      {format(dateRange.to, "dd/MM/yy")}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yy")
                  )
                ) : (
                  "Pilih Tanggal"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                className="pointer-events-auto p-3"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab} value={activeTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expense">Expense</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              {renderTransactionsByDate()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="income" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              {Object.keys(groupedTransactions).length > 0 ? 
                renderTransactionsByDate() : 
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No income transactions found.</p>
                </div>
              }
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expense" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              {Object.keys(groupedTransactions).length > 0 ? 
                renderTransactionsByDate() : 
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No expense transactions found.</p>
                </div>
              }
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Floating Add Transaction Button */}
      <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <TransactionForm onSuccess={() => setIsAddTransactionOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Transaction Dialog */}
      <Dialog open={isEditTransactionOpen} onOpenChange={setIsEditTransactionOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {transactionToEdit && (
            <TransactionForm 
              transaction={transactionToEdit} 
              onSuccess={() => {
                setIsEditTransactionOpen(false);
                setTransactionToEdit(null);
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Transaction Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteTransaction}
              className="bg-red-500 hover:bg-red-600"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Floating Add Button (moved to bottom right, slightly higher to avoid menu) */}
      <div className="fixed bottom-24 right-6">
        <Button 
          size="lg" 
          className="rounded-full w-14 h-14 shadow-lg bg-finance-teal hover:bg-finance-teal/90 p-0"
          onClick={() => setIsAddTransactionOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default Transactions;
