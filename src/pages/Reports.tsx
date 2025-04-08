
import React, { useState, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar as CalendarIcon, Download, BarChart4, PieChart, TrendingUp, LineChart } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RPieChart,
  Pie,
  Cell,
  Line,
  LineChart as RLineChart,
  Area,
  AreaChart
} from 'recharts';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Period } from '@/types';
import TransactionAIAnalysis from '@/components/TransactionAIAnalysis';

const Reports = () => {
  // State for date range picker
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date()
  });
  
  // Period type for reports (daily, weekly, monthly, yearly, custom)
  const [period, setPeriod] = useState<Period>('monthly');
  
  // Report type (income, expense, balance)
  const [reportType, setReportType] = useState('expense');
  
  const { transactions, categories, getReport } = useFinance();
  
  // Get report data based on selected period
  const reportData = getReport(
    period, 
    date?.from, 
    date?.to
  );
  
  // Check if we have data to display
  const hasData = period === 'custom' 
    ? reportData.totalIncome > 0 || reportData.totalExpense > 0
    : transactions.length > 0;
    
  // Generate the title based on period
  const getReportTitle = () => {
    if (period === 'daily') return 'Laporan Harian';
    if (period === 'weekly') return 'Laporan Mingguan';
    if (period === 'monthly') return 'Laporan Bulanan';
    if (period === 'yearly') return 'Laporan Tahunan';
    if (period === 'custom') {
      if (date?.from && date?.to) {
        return `Laporan ${format(date.from, 'd MMMM', { locale: id })} - ${format(date.to, 'd MMMM yyyy', { locale: id })}`;
      }
      return 'Laporan Kustom';
    }
    return 'Laporan';
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFACE4'];
  
  // Prepare pie chart data
  const pieChartData = reportData.categorySummary
    .filter(item => (reportType === 'income' ? item.amount > 0 : 
                     reportType === 'expense' ? item.amount < 0 : true))
    .map(item => ({
      name: item.categoryName,
      value: Math.abs(item.amount)
    }));
    
  // Sum for calculating percentages
  const pieTotal = pieChartData.reduce((sum, item) => sum + item.value, 0);
  
  // Prepare bar chart data (top categories)
  const barChartData = [...reportData.categorySummary]
    .filter(item => (reportType === 'income' ? item.amount > 0 : 
                     reportType === 'expense' ? item.amount < 0 : true))
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 5)
    .map(item => ({
      name: item.categoryName,
      value: Math.abs(item.amount)
    }));

  // Prepare line chart data for income and expenses by date
  const generateDailyTransactionData = () => {
    if (!date?.from || !date?.to) return [];
    
    // Create array of all days in the range
    const days = eachDayOfInterval({ start: date.from, end: date.to });
    
    return days.map(day => {
      // Find transactions for this day
      const dayTransactions = transactions.filter(t => {
        const transDate = new Date(t.date);
        return isSameDay(transDate, day);
      });
      
      // Calculate totals
      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const expense = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
      return {
        date: format(day, 'dd/MM'),
        income,
        expense,
        balance: income - expense
      };
    });
  };

  // Generate comparison data for current month vs previous month
  const generateMonthComparisonData = () => {
    const currentMonth = new Date();
    const previousMonth = subMonths(currentMonth, 1);
    
    // Current month transactions
    const currentMonthStart = startOfMonth(currentMonth);
    const currentMonthTransactions = transactions.filter(t => {
      const transDate = new Date(t.date);
      return transDate >= currentMonthStart && transDate <= currentMonth;
    });
    
    // Previous month transactions
    const previousMonthStart = startOfMonth(previousMonth);
    const previousMonthEnd = endOfMonth(previousMonth);
    const previousMonthTransactions = transactions.filter(t => {
      const transDate = new Date(t.date);
      return transDate >= previousMonthStart && transDate <= previousMonthEnd;
    });
    
    // Calculate totals
    const currentIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const currentExpense = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const previousIncome = previousMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const previousExpense = previousMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    return {
      current: {
        income: currentIncome,
        expense: currentExpense,
        balance: currentIncome - currentExpense
      },
      previous: {
        income: previousIncome,
        expense: previousExpense,
        balance: previousIncome - previousExpense
      }
    };
  };
  
  const lineChartData = generateDailyTransactionData();
  const comparisonData = generateMonthComparisonData();
  
  // Custom tooltip formatter for line chart
  const lineChartTooltipFormatter = (value: number) => {
    return formatCurrency(value);
  };

  // Compare current month with same period last month
  const renderTrendComparison = () => {
    if (!comparisonData || !comparisonData.current) return null;
    
    const expenseDiff = comparisonData.current.expense - comparisonData.previous.expense;
    const expensePercentChange = comparisonData.previous.expense === 0 
      ? 100 
      : (expenseDiff / comparisonData.previous.expense) * 100;
      
    const incomeDiff = comparisonData.current.income - comparisonData.previous.income;
    const incomePercentChange = comparisonData.previous.income === 0 
      ? 100 
      : (incomeDiff / comparisonData.previous.income) * 100;
      
    return (
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tren Pengeluaran</CardTitle>
            <div className="flex justify-between items-center">
              <CardDescription className="text-2xl font-bold">
                {formatCurrency(comparisonData.current.expense)}
              </CardDescription>
              <div className={`text-sm font-medium ${expenseDiff > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {expenseDiff > 0 ? '+' : ''}{expensePercentChange.toFixed(1)}% dari bulan lalu
              </div>
            </div>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tren Pendapatan</CardTitle>
            <div className="flex justify-between items-center">
              <CardDescription className="text-2xl font-bold">
                {formatCurrency(comparisonData.current.income)}
              </CardDescription>
              <div className={`text-sm font-medium ${incomeDiff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {incomeDiff > 0 ? '+' : ''}{incomePercentChange.toFixed(1)}% dari bulan lalu
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold">{getReportTitle()}</h1>
        
        <div className="flex mt-2 sm:mt-0 space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-9 flex items-center text-gray-600">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, 'dd/MM/yyyy')} - {format(date.to, 'dd/MM/yyyy')}
                    </>
                  ) : (
                    format(date.from, 'dd/MM/yyyy')
                  )
                ) : (
                  <span>Pilih tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={(range) => {
                  setDate(range);
                  if (range?.from && range?.to) {
                    setPeriod('custom');
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          
          <Button variant="outline" size="sm" className="h-9">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue={period} onValueChange={(value) => setPeriod(value as Period)}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="daily">Harian</TabsTrigger>
          <TabsTrigger value="weekly">Mingguan</TabsTrigger>
          <TabsTrigger value="monthly">Bulanan</TabsTrigger>
          <TabsTrigger value="yearly">Tahunan</TabsTrigger>
        </TabsList>
        
        {['daily', 'weekly', 'monthly', 'yearly', 'custom'].map((periodValue) => (
          <TabsContent key={periodValue} value={periodValue}>
            {hasData ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Pemasukan
                      </CardTitle>
                      <CardDescription className="text-2xl font-bold text-green-600">
                        {formatCurrency(reportData.totalIncome)}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Pengeluaran
                      </CardTitle>
                      <CardDescription className="text-2xl font-bold text-red-600">
                        {formatCurrency(reportData.totalExpense)}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Saldo
                      </CardTitle>
                      <CardDescription className={`text-2xl font-bold ${reportData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(reportData.balance)}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
                
                {/* Line chart for income and expense trends */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Tren Keuangan</CardTitle>
                      <CardDescription>
                        Pemasukan dan pengeluaran dari waktu ke waktu
                      </CardDescription>
                    </div>
                    <LineChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {lineChartData.length > 0 ? (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RLineChart
                            data={lineChartData}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 10,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip 
                              formatter={lineChartTooltipFormatter}
                              labelFormatter={(label) => `Tanggal: ${label}`}
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="income" 
                              name="Pemasukan"
                              stroke="#10b981" 
                              strokeWidth={2}
                              activeDot={{ r: 8 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="expense" 
                              name="Pengeluaran"
                              stroke="#ef4444" 
                              strokeWidth={2}
                            />
                          </RLineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center">
                        <p className="text-muted-foreground">Tidak ada data untuk ditampilkan</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Month comparison data */}
                {renderTrendComparison()}

                <Tabs defaultValue={reportType} onValueChange={setReportType}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
                    <TabsTrigger value="income">Pemasukan</TabsTrigger>
                    <TabsTrigger value="all">Semua</TabsTrigger>
                  </TabsList>
                  
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {/* Pie Chart */}
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Distribusi {reportType === 'income' ? 'Pemasukan' : reportType === 'expense' ? 'Pengeluaran' : 'Transaksi'}</CardTitle>
                          <CardDescription>
                            Berdasarkan kategori
                          </CardDescription>
                        </div>
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        {pieChartData.length > 0 ? (
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <RPieChart>
                                <Pie
                                  data={pieChartData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                              </RPieChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="h-[300px] flex items-center justify-center">
                            <p className="text-muted-foreground">Tidak ada data untuk ditampilkan</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    {/* Bar Chart */}
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>
                            Top Kategori
                          </CardTitle>
                          <CardDescription>
                            {reportType === 'income' ? 'Pemasukan' : reportType === 'expense' ? 'Pengeluaran' : 'Transaksi'} terbesar
                          </CardDescription>
                        </div>
                        <BarChart4 className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        {barChartData.length > 0 ? (
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={barChartData}
                                margin={{
                                  top: 20,
                                  right: 30,
                                  left: 20,
                                  bottom: 5,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => formatCurrency(value).split(',')[0]} />
                                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                <Bar 
                                  dataKey="value" 
                                  fill={reportType === 'income' ? '#10b981' : reportType === 'expense' ? '#ef4444' : '#3b82f6'} 
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="h-[300px] flex items-center justify-center">
                            <p className="text-muted-foreground">Tidak ada data untuk ditampilkan</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Category Details */}
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>Detail Kategori</CardTitle>
                      <CardDescription>
                        Rincian {reportType === 'income' ? 'pemasukan' : reportType === 'expense' ? 'pengeluaran' : 'transaksi'} per kategori
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {pieChartData.length > 0 ? (
                        <div className="space-y-2">
                          {pieChartData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between py-2 border-b">
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2" 
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                ></div>
                                <span>{item.name}</span>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{formatCurrency(item.value)}</div>
                                <div className="text-xs text-muted-foreground">
                                  {pieTotal > 0 ? `${((item.value / pieTotal) * 100).toFixed(1)}%` : '0%'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <p className="text-muted-foreground">Tidak ada data untuk ditampilkan</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Tabs>

                {/* AI Analysis Card */}
                <Card className="mt-4">
                  <CardContent className="pt-6">
                    <TransactionAIAnalysis />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="mt-4">
                <CardContent className="py-8 text-center">
                  <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">Tidak Ada Data</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Tidak ada transaksi dalam periode yang dipilih. Silakan pilih periode lain atau tambahkan transaksi.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Reports;
