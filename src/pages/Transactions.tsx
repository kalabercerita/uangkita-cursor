
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown,
  Calendar
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
import { Input } from '@/components/ui/input';
import { useFinance } from '@/contexts/FinanceContext';
import { Transaction as TransactionType } from '@/types';

const Transactions = () => {
  const { transactions, categories, wallets } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low'>('newest');
  
  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(transaction => {
      // Type filter
      if (filterType !== 'all' && transaction.type !== filterType) return false;
      
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <div className="space-y-6 py-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">
          Transactions
        </h2>
        <Button className="bg-gradient-to-r from-finance-teal to-finance-purple hover:from-finance-teal/90 hover:to-finance-purple/90">
          <Plus className="mr-2 h-4 w-4" /> 
          Add Transaction
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search transactions..."
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
                {filterType === 'all' ? 'All Types' : 
                 filterType === 'income' ? 'Income' : 'Expense'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilterType('all')}>
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('income')}>
                Income
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('expense')}>
                Expense
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortOrder('newest')}>
                Newest first
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder('oldest')}>
                Oldest first
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder('amount_high')}>
                Amount (High to Low)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder('amount_low')}>
                Amount (Low to High)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>
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
                <div className="grid grid-cols-6 bg-muted/50 p-4 font-medium">
                  <div className="col-span-2">Description</div>
                  <div>Category</div>
                  <div>Date</div>
                  <div>Wallet</div>
                  <div className="text-right">Amount</div>
                </div>
                <div className="divide-y">
                  {filteredTransactions.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No transactions found.
                    </div>
                  ) : (
                    filteredTransactions.map(transaction => {
                      const category = categories.find(c => c.id === transaction.categoryId);
                      const wallet = wallets.find(w => w.id === transaction.walletId);
                      
                      return (
                        <div key={transaction.id} className="grid grid-cols-6 p-4 hover:bg-muted/20 transition-colors">
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
                          <div className={`self-center text-right font-medium ${transaction.type === 'income' ? 'text-finance-green' : 'text-finance-red'}`}>
                            {transaction.type === 'income' ? '+' : '-'} 
                            {formatCurrency(transaction.amount)}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="income">
          {/* Income tab would have similar content but pre-filtered */}
          <Card>
            <CardHeader>
              <CardTitle>Income Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This tab would show only income transactions.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expense">
          {/* Expense tab would have similar content but pre-filtered */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This tab would show only expense transactions.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Transactions;
