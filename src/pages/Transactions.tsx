
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogTrigger,
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
  const { transactions, categories, wallets, deleteTransaction } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low'>('newest');
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isEditTransactionOpen, setIsEditTransactionOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<TransactionType | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(transaction => {
      // Type filter
      if (filterType !== 'all' && transaction.type !== filterType) return false;
      
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
  
  const renderTransactionRow = (transaction: TransactionType) => {
    const category = categories.find(c => c.id === transaction.categoryId);
    const wallet = wallets.find(w => w.id === transaction.walletId);
    
    return (
      <div key={transaction.id} className="grid grid-cols-7 p-4 hover:bg-muted/20 transition-colors">
        <div className="col-span-2 flex items-center space-x-3">
          <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
            {transaction.type === 'income' ? (
              <TrendingUp className="h-4 w-4 text-finance-green" />
            ) : (
              <TrendingDown className="h-4 w-4 text-finance-red" />
            )}
          </div>
          <div>
            <p className="font-medium">{transaction.description}</p>
          </div>
        </div>
        <div className="self-center">
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100">
            {category?.name || 'Uncategorized'}
          </span>
        </div>
        <div className="self-center text-muted-foreground">
          {formatDate(transaction.date)}
        </div>
        <div className="self-center">
          {wallet?.name || 'Unknown'}
        </div>
        <div className={`self-center font-medium ${transaction.type === 'income' ? 'text-finance-green' : 'text-finance-red'}`}>
          {transaction.type === 'income' ? '+' : '-'} 
          {formatCurrency(transaction.amount)}
        </div>
        <div className="self-center flex space-x-2 justify-end">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleEditTransaction(transaction)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleDeleteTransaction(transaction.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6 py-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">
          Transaksi
        </h2>
        <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-finance-teal to-finance-purple hover:from-finance-teal/90 hover:to-finance-purple/90">
              <Plus className="mr-2 h-4 w-4" /> 
              Tambah Transaksi
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <TransactionForm onSuccess={() => setIsAddTransactionOpen(false)} />
          </DialogContent>
        </Dialog>
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
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                {filterType === 'all' ? 'Semua Jenis' : 
                 filterType === 'income' ? 'Pemasukan' : 'Pengeluaran'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter berdasarkan Jenis</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilterType('all')}>
                Semua Jenis
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('income')}>
                Pemasukan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('expense')}>
                Pengeluaran
              </DropdownMenuItem>
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
                  "Rentang Tanggal"
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
      
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expense">Expense</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <div className="grid grid-cols-7 bg-muted/50 p-4 font-medium">
                  <div className="col-span-2">Description</div>
                  <div>Category</div>
                  <div>Date</div>
                  <div>Wallet</div>
                  <div>Amount</div>
                  <div className="text-right">Actions</div>
                </div>
                <div className="divide-y">
                  {filteredTransactions.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No transactions found.
                    </div>
                  ) : (
                    filteredTransactions.map(transaction => renderTransactionRow(transaction))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="income">
          <Card>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <div className="grid grid-cols-7 bg-muted/50 p-4 font-medium">
                  <div className="col-span-2">Description</div>
                  <div>Category</div>
                  <div>Date</div>
                  <div>Wallet</div>
                  <div>Amount</div>
                  <div className="text-right">Actions</div>
                </div>
                <div className="divide-y">
                  {filteredTransactions.filter(t => t.type === 'income').length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No income transactions found.
                    </div>
                  ) : (
                    filteredTransactions
                      .filter(t => t.type === 'income')
                      .map(transaction => renderTransactionRow(transaction))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expense">
          <Card>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <div className="grid grid-cols-7 bg-muted/50 p-4 font-medium">
                  <div className="col-span-2">Description</div>
                  <div>Category</div>
                  <div>Date</div>
                  <div>Wallet</div>
                  <div>Amount</div>
                  <div className="text-right">Actions</div>
                </div>
                <div className="divide-y">
                  {filteredTransactions.filter(t => t.type === 'expense').length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No expense transactions found.
                    </div>
                  ) : (
                    filteredTransactions
                      .filter(t => t.type === 'expense')
                      .map(transaction => renderTransactionRow(transaction))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
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
    </div>
  );
};

export default Transactions;
