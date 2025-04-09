
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinance } from '@/contexts/FinanceContext';
import { ArrowUpRight, ArrowDownRight, Wallet, BarChart4, CalendarDays, Plus } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import TransactionAIAnalysis from '@/components/TransactionAIAnalysis';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import TransactionForm from '@/components/TransactionForm';

const Dashboard = () => {
  const { wallets, transactions, categories, getReport } = useFinance();
  const [transactionDialog, setTransactionDialog] = useState(false);
  
  // Get monthly report
  const monthlyReport = getReport('monthly');
  
  // Check if we have any transactions
  const hasTransactions = transactions.length > 0;
  
  // Calculate the total balance from all wallets
  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  
  // Calculate income and expense totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate this month's income and expenses from the report
  const { totalIncome: monthlyIncome, totalExpense: monthlyExpense } = monthlyReport;
  
  // Prepare transaction history data for chart - last 7 days
  const last7Days = useMemo(() => {
    const result = [];
    const today = new Date();
    let cumulativeBalance = 0; // Track running balance across days
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Format date as string for display
      const dateStr = date.toLocaleDateString('id-ID', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      // Filter transactions for this date
      const dayTransactions = transactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate.getDate() === date.getDate() && 
               transDate.getMonth() === date.getMonth() && 
               transDate.getFullYear() === date.getFullYear();
      });
      
      // Calculate income and expense for this day
      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expense = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      // Update the cumulative balance by adding income and subtracting expense
      cumulativeBalance += (income - expense);
      
      result.push({ 
        name: dateStr, 
        income, 
        expense,
        balance: cumulativeBalance // Use cumulative balance instead of daily balance
      });
    }
    
    return result;
  }, [transactions]);
  
  // Prepare category data for pie chart
  const categoryData = useMemo(() => {
    return monthlyReport.categorySummary.map(cat => ({
      name: cat.categoryName,
      value: Math.abs(cat.amount),
      type: cat.amount > 0 ? 'income' : 'expense'
    }));
  }, [monthlyReport]);
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  
  // Format number as Indonesian Rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {hasTransactions ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-0">
                  <CardDescription>Saldo Saat Ini</CardDescription>
                  <CardTitle className="text-2xl font-bold">
                    {formatRupiah(totalBalance)}
                  </CardTitle>
                </div>
                <Wallet className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  Dari {wallets.length} dompet
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-0">
                  <CardDescription>Pemasukan Bulan Ini</CardDescription>
                  <CardTitle className="text-2xl font-bold text-green-600">
                    {formatRupiah(monthlyIncome)}
                  </CardTitle>
                </div>
                <ArrowUpRight className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {transactions.filter(t => t.type === 'income').length} transaksi pemasukan
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-0">
                  <CardDescription>Pengeluaran Bulan Ini</CardDescription>
                  <CardTitle className="text-2xl font-bold text-red-600">
                    {formatRupiah(monthlyExpense)}
                  </CardTitle>
                </div>
                <ArrowDownRight className="h-5 w-5 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {transactions.filter(t => t.type === 'expense').length} transaksi pengeluaran
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-xl">Analisis Transaksi</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] overflow-y-auto">
                <TransactionAIAnalysis />
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Kategori Pengeluaran</CardTitle>
                <BarChart4 className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {categoryData.filter(cat => cat.type === 'expense').length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData.filter(cat => cat.type === 'expense')}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.filter(cat => cat.type === 'expense').map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip formatter={(value) => formatRupiah(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">Tidak ada data pengeluaran</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Aliran Kas 7 Hari Terakhir</CardTitle>
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={last7Days}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatRupiah(value).split(',')[0]} />
                    <Tooltip formatter={(value) => formatRupiah(Number(value))} />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#10b981" name="Pemasukan" strokeWidth={2} />
                    <Line type="monotone" dataKey="expense" stroke="#ef4444" name="Pengeluaran" strokeWidth={2} />
                    <Line type="monotone" dataKey="balance" stroke="#3b82f6" name="Saldo" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Selamat Datang di UangKita</CardTitle>
            <CardDescription>
              Belum ada data transaksi. Mulai tambahkan transaksi untuk melihat analisis keuangan Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center">
              <Wallet className="mx-auto h-12 w-12 text-finance-teal opacity-50" />
              <h3 className="mt-4 text-lg font-medium">Belum Ada Transaksi</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Tambahkan transaksi pemasukan dan pengeluaran untuk melihat analisis keuangan Anda di dashboard ini.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Floating Action Button */}
      <Dialog open={transactionDialog} onOpenChange={setTransactionDialog}>
        <DialogTrigger asChild>
          <button className="floating-action-button">
            <Plus className="h-6 w-6" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <TransactionForm onSuccess={() => setTransactionDialog(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
