
import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePicker } from '@/components/ui/date-picker';
import { useFinance } from '@/contexts/FinanceContext';
import { Period } from '@/types';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import ExportMenu from '@/components/ExportMenu';

const Reports = () => {
  const { getReport } = useFinance();
  const [period, setPeriod] = React.useState<Period>('monthly');
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Get report based on selected period
  const report = getReport(period, startDate, endDate);
  
  // Colors for charts
  const COLORS = ['#48BB78', '#F56565', '#4299E1', '#ECC94B', '#9F7AEA', '#ED8936', '#38B2AC', '#667EEA'];
  
  // Format number as Indonesian Rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Custom tooltip formatter for charts
  const tooltipFormatter = (value: number) => formatRupiah(value);
  
  // Prepare monthly data for line/bar charts
  const getMonthlyData = () => {
    const today = new Date();
    const months = [];
    
    for (let i = 6; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = month.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      months.push(monthStr);
    }
    
    return months.map(month => {
      // Mock data - would be replaced with actual data in a real app
      return {
        name: month,
        income: Math.random() * 5000000 + 1000000,
        expense: Math.random() * 3000000 + 500000,
        balance: Math.random() * 2000000
      };
    });
  };
  
  const monthlyData = getMonthlyData();
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Laporan</h1>
        <ExportMenu contentRef={contentRef} title="Laporan_UangKita" />
      </div>
      
      <div ref={contentRef} className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <CardTitle>Periode Laporan</CardTitle>
              <div className="flex mt-2 md:mt-0 space-x-2">
                <Tabs defaultValue="monthly" 
                  onValueChange={(value) => setPeriod(value as Period)}
                  className="w-full md:w-auto">
                  <TabsList>
                    <TabsTrigger value="daily">Harian</TabsTrigger>
                    <TabsTrigger value="weekly">Mingguan</TabsTrigger>
                    <TabsTrigger value="monthly">Bulanan</TabsTrigger>
                    <TabsTrigger value="yearly">Tahunan</TabsTrigger>
                    <TabsTrigger value="custom">Kustom</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {period === 'custom' && (
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <p className="mb-2 text-sm">Tanggal Mulai</p>
                  <DatePicker date={startDate} setDate={setStartDate} />
                </div>
                <div className="flex-1">
                  <p className="mb-2 text-sm">Tanggal Akhir</p>
                  <DatePicker date={endDate} setDate={setEndDate} />
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pemasukan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatRupiah(report.totalIncome)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pengeluaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatRupiah(report.totalExpense)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatRupiah(report.balance)}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Perbandingan Pemasukan dan Pengeluaran</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatRupiah(value).split(',')[0]} />
                      <Tooltip formatter={tooltipFormatter} />
                      <Legend />
                      <Bar dataKey="income" name="Pemasukan" fill="#48BB78" />
                      <Bar dataKey="expense" name="Pengeluaran" fill="#F56565" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Tren Keuangan</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatRupiah(value).split(',')[0]} />
                      <Tooltip formatter={tooltipFormatter} />
                      <Legend />
                      <Line type="monotone" dataKey="income" name="Pemasukan" stroke="#48BB78" strokeWidth={2} />
                      <Line type="monotone" dataKey="expense" name="Pengeluaran" stroke="#F56565" strokeWidth={2} />
                      <Line type="monotone" dataKey="balance" name="Saldo" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Pengeluaran per Kategori</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={report.categorySummary.filter(cat => cat.amount < 0).map(cat => ({
                          name: cat.categoryName,
                          value: Math.abs(cat.amount)
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {report.categorySummary.filter(cat => cat.amount < 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={tooltipFormatter} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
