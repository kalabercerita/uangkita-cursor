import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LoaderIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { getReportOperation } from '@/contexts/finance/reportOperations';
import { useFinance } from '@/contexts/FinanceContext';
import ReportsExport from '@/components/ReportsExport';

const Reports = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { transactions, categories } = useFinance();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'>('monthly');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [showCustomDateFields, setShowCustomDateFields] = useState(false);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#8dd1e1'];

  useEffect(() => {
    setShowCustomDateFields(period === 'custom');
  }, [period]);

  const generateReport = () => {
    setLoading(true);
    try {
      const report = getReportOperation(period, transactions, categories, startDate, endDate);
      setReportData(report);
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Gagal',
        description: 'Terjadi kesalahan saat membuat laporan',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (transactions.length > 0 && categories.length > 0) {
      generateReport();
    }
  }, [transactions, categories, period]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getPeriodText = () => {
    switch (period) {
      case 'daily':
        return 'Harian';
      case 'weekly':
        return 'Mingguan';
      case 'monthly':
        return 'Bulanan';
      case 'yearly':
        return 'Tahunan';
      case 'custom':
        return `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`;
      default:
        return '';
    }
  };

  const incomeExpenseData = reportData ? [
    {
      name: 'Pendapatan',
      value: reportData.totalIncome
    },
    {
      name: 'Pengeluaran',
      value: reportData.totalExpense
    }
  ] : [];

  const pieData = reportData?.categorySummary?.map((item: any) => ({
    name: item.categoryName,
    value: Math.abs(item.amount)
  })) || [];

  const barData = reportData?.categorySummary?.map((item: any) => ({
    name: item.categoryName,
    amount: Math.abs(item.amount),
    type: item.amount > 0 ? 'Pendapatan' : 'Pengeluaran'
  })) || [];

  if (!user) {
    return <div>Anda harus login untuk melihat laporan</div>;
  }

  return (
    <div className="py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">Laporan Keuangan</h1>
        {reportData && (
          <ReportsExport 
            data={[
              ...reportData.categorySummary,
              { 
                categoryName: "Total Pendapatan", 
                amount: reportData.totalIncome, 
                percentage: 100
              },
              { 
                categoryName: "Total Pengeluaran", 
                amount: reportData.totalExpense, 
                percentage: 100
              },
              { 
                categoryName: "Saldo", 
                amount: reportData.balance, 
                percentage: 0
              }
            ]} 
            filename={`laporan-keuangan-${getPeriodText().replace(/\//g, '-')}`}
            title={`Laporan Keuangan - ${getPeriodText()}`}
          />
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Periode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Harian</SelectItem>
                <SelectItem value="weekly">Mingguan</SelectItem>
                <SelectItem value="monthly">Bulanan</SelectItem>
                <SelectItem value="yearly">Tahunan</SelectItem>
                <SelectItem value="custom">Kustom</SelectItem>
              </SelectContent>
            </Select>

            {showCustomDateFields && (
              <div className="grid gap-4 mt-4">
                <div>
                  <Label htmlFor="start-date">Tanggal Mulai</Label>
                  <DatePicker 
                    date={startDate} 
                    onSelect={setStartDate}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">Tanggal Akhir</Label>
                  <DatePicker 
                    date={endDate} 
                    onSelect={setEndDate}
                    disabled={loading}
                  />
                </div>
                <Button onClick={generateReport} disabled={loading}>
                  {loading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
                  Terapkan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pendapatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(reportData?.totalIncome || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pengeluaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(reportData?.totalExpense || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(reportData?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(reportData?.balance || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Pendapatan & Pengeluaran</CardTitle>
            <CardDescription>
              Perbandingan total pendapatan dan pengeluaran
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {reportData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeExpenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                  >
                    {incomeExpenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#4ade80' : '#f87171'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Tidak ada data</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribusi per Kategori</CardTitle>
            <CardDescription>
              Distribusi transaksi berdasarkan kategori
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {reportData && pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${formatPercentage(percent * 100)}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Tidak ada data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail Kategori</CardTitle>
          <CardDescription>
            Detail transaksi per kategori
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          {reportData && barData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 70,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70} 
                  interval={0}
                />
                <YAxis 
                  tickFormatter={(value) => new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    notation: 'compact',
                    compactDisplay: 'short',
                  }).format(value)}
                />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar 
                  dataKey="amount" 
                  name="Jumlah" 
                  fill="#8884d8" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Tidak ada data</p>
            </div>
          )}
        </CardContent>
      </Card>

      {reportData && reportData.categorySummary && reportData.categorySummary.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Tabel Kategori</CardTitle>
            <CardDescription>
              Detail transaksi per kategori dalam bentuk tabel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[400px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border p-2 text-left">Kategori</th>
                    <th className="border p-2 text-right">Jumlah</th>
                    <th className="border p-2 text-right">Persentase</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.categorySummary.map((category: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-slate-50">
                      <td className="border p-2">{category.categoryName}</td>
                      <td className={`border p-2 text-right ${category.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(category.amount)}
                      </td>
                      <td className="border p-2 text-right">{formatPercentage(category.percentage)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-bold">
                    <td className="border p-2">Total Pendapatan</td>
                    <td className="border p-2 text-right text-green-600">{formatCurrency(reportData.totalIncome)}</td>
                    <td className="border p-2 text-right">100%</td>
                  </tr>
                  <tr className="bg-slate-100 font-bold">
                    <td className="border p-2">Total Pengeluaran</td>
                    <td className="border p-2 text-right text-red-600">{formatCurrency(reportData.totalExpense)}</td>
                    <td className="border p-2 text-right">100%</td>
                  </tr>
                  <tr className="bg-slate-200 font-bold">
                    <td className="border p-2">Saldo</td>
                    <td className={`border p-2 text-right ${reportData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(reportData.balance)}
                    </td>
                    <td className="border p-2 text-right">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;
