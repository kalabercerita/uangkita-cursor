
import React, { useState } from 'react';
import { 
  Calendar,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinance } from '@/contexts/FinanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Period } from '@/types';
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

const Dashboard = () => {
  const { user } = useAuth();
  const { wallets, transactions, categories, getReport } = useFinance();
  const [period, setPeriod] = useState<Period>('monthly');
  
  const report = getReport(period);
  
  const categoryData = report.categorySummary;
  
  // Mock data for line chart (in a real app this would be calculated from transactions)
  const trendData = [
    { name: 'Jan', income: 4000, expense: 2400 },
    { name: 'Feb', income: 3000, expense: 1398 },
    { name: 'Mar', income: 2000, expense: 9800 },
    { name: 'Apr', income: 2780, expense: 3908 },
    { name: 'May', income: 1890, expense: 4800 },
    { name: 'Jun', income: 2390, expense: 3800 },
    { name: 'Jul', income: 3490, expense: 4300 },
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const latestTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  return (
    <div className="space-y-6 py-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name || 'User'}
        </h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" /> 
            Select Date
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> 
            Add Transaction
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(wallets.reduce((sum, wallet) => sum + wallet.balance, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {wallets.length} wallet{wallets.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        
        <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Income
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-finance-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-finance-green">
              {formatCurrency(report.totalIncome)}
            </div>
            <div className="flex items-center text-xs text-finance-green">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              <span>+12.5% from last {period}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-finance-red" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-finance-red">
              {formatCurrency(report.totalExpense)}
            </div>
            <div className="flex items-center text-xs text-finance-red">
              <ArrowDownRight className="mr-1 h-4 w-4" />
              <span>-4.3% from last {period}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Savings Rate
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {report.totalIncome > 0 
                ? `${Math.round(((report.totalIncome - report.totalExpense) / report.totalIncome) * 100)}%` 
                : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              {report.totalIncome > report.totalExpense ? 'Good job!' : 'Spending exceeds income'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Income vs Expenses</CardTitle>
                <CardDescription>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setPeriod('daily')} className={period === 'daily' ? 'bg-finance-teal text-white' : ''}>
                      Day
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPeriod('weekly')} className={period === 'weekly' ? 'bg-finance-teal text-white' : ''}>
                      Week
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPeriod('monthly')} className={period === 'monthly' ? 'bg-finance-teal text-white' : ''}>
                      Month
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPeriod('yearly')} className={period === 'yearly' ? 'bg-finance-teal text-white' : ''}>
                      Year
                    </Button>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData}
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
                      stroke="#48BB78" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expense" 
                      stroke="#F56565" 
                      strokeWidth={2} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>
                  Top spending categories for this {period}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData.filter(cat => cat.amount < 0).map(cat => ({
                        name: cat.categoryName,
                        value: Math.abs(cat.amount)
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Your latest 5 transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {latestTransactions.length === 0 ? (
                    <div className="text-center p-4">
                      <p className="text-muted-foreground">No transactions yet</p>
                      <Button className="mt-2" size="sm">
                        <Plus className="mr-2 h-4 w-4" /> 
                        Add Transaction
                      </Button>
                    </div>
                  ) : (
                    latestTransactions.map(transaction => {
                      const category = categories.find(c => c.id === transaction.categoryId);
                      const wallet = wallets.find(w => w.id === transaction.walletId);
                      
                      return (
                        <div key={transaction.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-full bg-gray-100">
                              {transaction.type === 'income' ? (
                                <TrendingUp className="h-4 w-4 text-finance-green" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-finance-red" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <span className="mr-2">{category?.name || 'Uncategorized'}</span>
                                <span>•</span>
                                <span className="ml-2">{wallet?.name || 'Unknown wallet'}</span>
                              </div>
                            </div>
                          </div>
                          <div className={transaction.type === 'income' ? 'text-finance-green font-medium' : 'text-finance-red font-medium'}>
                            {transaction.type === 'income' ? '+' : '-'} 
                            {formatCurrency(transaction.amount)}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>My Wallets</CardTitle>
                <CardDescription>Your wallet balances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wallets.map(wallet => (
                    <div key={wallet.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-gray-100">
                          <CreditCard className="h-4 w-4 text-finance-teal" />
                        </div>
                        <div>
                          <p className="font-medium">{wallet.name}</p>
                          <p className="text-xs text-muted-foreground">{wallet.currency}</p>
                        </div>
                      </div>
                      <div className="font-medium">
                        {formatCurrency(wallet.balance)}
                      </div>
                    </div>
                  ))}
                  
                  <Button className="w-full" variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> 
                    Add New Wallet
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4">
          {/* Transactions tab content - would be expanded in a real app */}
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>
                View and manage your transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>This section would contain a full transaction list with filters and search.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          {/* Analytics tab content - would be expanded in a real app */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Detailed financial analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>This section would contain more detailed charts and reports.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
