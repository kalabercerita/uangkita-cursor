
import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  BarChart2,
  PieChart as PieChartIcon,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { useFinance } from '@/contexts/FinanceContext';
import { Period } from '@/types';

const Reports = () => {
  const { getReport, categories } = useFinance();
  const [period, setPeriod] = useState<Period>('monthly');
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [isCustomPeriod, setIsCustomPeriod] = useState(false);
  
  // Generate report based on period
  const report = React.useMemo(() => {
    if (isCustomPeriod && dateRange.from && dateRange.to) {
      return getReport('custom', dateRange.from, dateRange.to);
    } else {
      return getReport(period);
    }
  }, [isCustomPeriod, period, dateRange.from, dateRange.to, getReport]);
  
  // Format large numbers for better display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Generate data for expense categories chart
  const expenseCategoriesData = report.categorySummary
    .filter(cat => cat.amount < 0)
    .map(cat => ({
      name: cat.categoryName,
      value: Math.abs(cat.amount),
      color: categories.find(c => c.id === cat.categoryId)?.color || '#888'
    }))
    .sort((a, b) => b.value - a.value);
  
  // Generate data for income categories chart
  const incomeCategoriesData = report.categorySummary
    .filter(cat => cat.amount > 0)
    .map(cat => ({
      name: cat.categoryName,
      value: cat.amount,
      color: categories.find(c => c.id === cat.categoryId)?.color || '#888'
    }))
    .sort((a, b) => b.value - a.value);
  
  // Data for month-by-month chart
  const monthlyData = [
    { name: 'Jan', income: 4000, expense: 2400 },
    { name: 'Feb', income: 3000, expense: 1398 },
    { name: 'Mar', income: 2000, expense: 9800 },
    { name: 'Apr', income: 2780, expense: 3908 },
    { name: 'May', income: 1890, expense: 4800 },
    { name: 'Jun', income: 2390, expense: 3800 },
    { name: 'Jul', income: 3490, expense: 4300 },
    { name: 'Aug', income: 3490, expense: 4300 },
    { name: 'Sep', income: 3490, expense: 4300 },
    { name: 'Oct', income: 3490, expense: 4300 },
    { name: 'Nov', income: 3490, expense: 4300 },
    { name: 'Dec', income: 3490, expense: 4300 },
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#a4de6c'];
  
  // Handle period change
  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
    setIsCustomPeriod(false);
  };
  
  // Handle custom date range selection
  const handleDateRangeSelect = (range: { from?: Date; to?: Date }) => {
    setDateRange({
      from: range.from,
      to: range.to
    });
    
    if (range.from && range.to) {
      setIsCustomPeriod(true);
    }
  };

  // Format period name
  const formatPeriodName = () => {
    if (isCustomPeriod) return "periode yang dipilih";
    
    switch(period) {
      case 'daily': return "harian";
      case 'weekly': return "mingguan";
      case 'monthly': return "bulanan";
      case 'yearly': return "tahunan";
      default: return period;
    }
  };
  
  return (
    <div className="space-y-6 py-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">
          Laporan Keuangan
        </h2>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" /> 
                {isCustomPeriod && dateRange.from && dateRange.to
                  ? `${format(dateRange.from, "dd MMM")} - ${format(dateRange.to, "dd MMM")}`
                  : "Pilih Periode"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={handleDateRangeSelect}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> 
            Ekspor
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pemasukan
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-finance-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-finance-green">
              {formatCurrency(report.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              Untuk periode {formatPeriodName()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pengeluaran
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-finance-red rotate-180" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-finance-red">
              {formatCurrency(report.totalExpense)}
            </div>
            <p className="text-xs text-muted-foreground">
              Untuk periode {formatPeriodName()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo Bersih
            </CardTitle>
            <BarChart2 className="h-4 w-4 text-finance-teal" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${report.balance >= 0 ? 'text-finance-green' : 'text-finance-red'}`}>
              {formatCurrency(report.balance)}
            </div>
            <div className="text-xs text-muted-foreground flex items-center justify-between mt-1">
              <span>Tingkat Tabungan:</span>
              <span className={report.balance >= 0 ? 'text-finance-green' : 'text-finance-red'}>
                {report.totalIncome > 0 
                  ? `${Math.round(((report.totalIncome - report.totalExpense) / report.totalIncome) * 100)}%` 
                  : '0%'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handlePeriodChange('daily')} 
          className={!isCustomPeriod && period === 'daily' ? 'bg-finance-teal text-white' : ''}
        >
          Harian
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handlePeriodChange('weekly')} 
          className={!isCustomPeriod && period === 'weekly' ? 'bg-finance-teal text-white' : ''}
        >
          Mingguan
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handlePeriodChange('monthly')} 
          className={!isCustomPeriod && period === 'monthly' ? 'bg-finance-teal text-white' : ''}
        >
          Bulanan
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handlePeriodChange('yearly')} 
          className={!isCustomPeriod && period === 'yearly' ? 'bg-finance-teal text-white' : ''}
        >
          Tahunan
        </Button>
        <div className="ml-auto flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Jenis Grafik:</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setChartType('bar')} 
            className={chartType === 'bar' ? 'bg-gray-100' : ''}
          >
            <BarChart2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setChartType('pie')} 
            className={chartType === 'pie' ? 'bg-gray-100' : ''}
          >
            <PieChartIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Ikhtisar</TabsTrigger>
          <TabsTrigger value="expenses">Pengeluaran</TabsTrigger>
          <TabsTrigger value="income">Pemasukan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pemasukan vs Pengeluaran</CardTitle>
              <CardDescription>
                Perbandingan pemasukan dan pengeluaran dari waktu ke waktu
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart
                    data={monthlyData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="income" name="Pemasukan" fill="#48BB78" />
                    <Bar dataKey="expense" name="Pengeluaran" fill="#F56565" />
                  </BarChart>
                ) : (
                  <PieChart>
                    <Legend />
                    <Pie
                      data={[
                        { name: 'Pemasukan', value: report.totalIncome },
                        { name: 'Pengeluaran', value: Math.abs(report.totalExpense) },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#48BB78" />
                      <Cell fill="#F56565" />
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Rincian Pemasukan</CardTitle>
                <CardDescription>Berdasarkan kategori</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incomeCategoriesData.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      Tidak ada data pemasukan untuk periode ini.
                    </div>
                  ) : incomeCategoriesData.map((category, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-sm text-finance-green">{formatCurrency(category.value)}</span>
                      </div>
                      <Progress
                        value={category.value / report.totalIncome * 100}
                        className="h-2 mt-1"
                        style={{ backgroundColor: '#E2E8F0' }}
                        indicatorClassName="bg-finance-green"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Rincian Pengeluaran</CardTitle>
                <CardDescription>Berdasarkan kategori</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenseCategoriesData.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      Tidak ada data pengeluaran untuk periode ini.
                    </div>
                  ) : expenseCategoriesData.map((category, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-sm text-finance-red">{formatCurrency(category.value)}</span>
                      </div>
                      <Progress
                        value={category.value / Math.abs(report.totalExpense) * 100}
                        className="h-2 mt-1"
                        style={{ backgroundColor: '#E2E8F0' }}
                        indicatorClassName="bg-finance-red"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Analysis</CardTitle>
              <CardDescription>Detailed breakdown of your expenses</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategoriesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseCategoriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Expense Trends</CardTitle>
              <CardDescription>How your expenses have changed over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    name="Expenses"
                    stroke="#F56565"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="income" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Income Analysis</CardTitle>
              <CardDescription>Detailed breakdown of your income</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeCategoriesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incomeCategoriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Income Trends</CardTitle>
              <CardDescription>How your income has changed over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#48BB78"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
