import React, { useState, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain, RefreshCw } from 'lucide-react';

// Helper function to generate AI analysis
const generateAnalysis = (transactions: any[], categories: any[]) => {
  // Check if there are any transactions
  if (transactions.length === 0) {
    return "Belum ada transaksi untuk dianalisis. Tambahkan transaksi untuk mendapatkan wawasan keuangan.";
  }

  // Calculate total income, expense, and balance
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Group by category
  const expensesByCategory: Record<string, number> = {};
  const incomesByCategory: Record<string, number> = {};

  transactions.forEach(transaction => {
    const category = categories.find(c => c.id === transaction.categoryId);
    const categoryName = category ? category.name : 'Tanpa Kategori';

    if (transaction.type === 'expense') {
      expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + transaction.amount;
    } else if (transaction.type === 'income') {
      incomesByCategory[categoryName] = (incomesByCategory[categoryName] || 0) + transaction.amount;
    }
  });

  // Find top expense categories
  const sortedExpenses = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1]);
  
  const topExpenseCategories = sortedExpenses.slice(0, 3);

  // Find top income categories
  const sortedIncomes = Object.entries(incomesByCategory)
    .sort((a, b) => b[1] - a[1]);
  
  const topIncomeCategories = sortedIncomes.slice(0, 3);

  // Calculate key financial metrics
  const savingsRate = totalIncome > 0 
    ? ((totalIncome - totalExpense) / totalIncome * 100)
    : 0;

  const expenseToIncomeRatio = totalIncome > 0
    ? (totalExpense / totalIncome * 100)
    : 0;

  // Generate professional insights
  let insights = [];

  // 1. Overall Financial Health Assessment
  insights.push("📊 Analisis Kesehatan Keuangan:");
  if (balance >= 0) {
    insights.push(`• Posisi Keuangan: POSITIF dengan surplus Rp ${balance.toLocaleString('id-ID')}`);
    insights.push(`• Rasio Pengeluaran/Pendapatan: ${expenseToIncomeRatio.toFixed(1)}% (${expenseToIncomeRatio <= 70 ? 'BAIK' : 'PERLU PERHATIAN'})`);
    insights.push(`• Tingkat Tabungan: ${savingsRate.toFixed(1)}% dari pendapatan${savingsRate >= 20 ? ' (SANGAT BAIK)' : savingsRate >= 10 ? ' (CUKUP)' : ' (PERLU DITINGKATKAN)'}`)
  } else {
    insights.push(`• Posisi Keuangan: DEFISIT sebesar Rp ${Math.abs(balance).toLocaleString('id-ID')}`);
    insights.push("• PERHATIAN: Pengeluaran melebihi pendapatan");
    insights.push("• Rekomendasi: Evaluasi pengeluaran dan tingkatkan pendapatan");
  }

  // 2. Income Analysis
  insights.push("\n💰 Analisis Pendapatan:");
  insights.push(`• Total Pendapatan: Rp ${totalIncome.toLocaleString('id-ID')}`);
  if (topIncomeCategories.length > 0) {
    insights.push("• Sumber Pendapatan Utama:");
    topIncomeCategories.forEach(([category, amount]) => {
      const percentage = (amount / totalIncome * 100).toFixed(1);
      insights.push(`  - ${category}: Rp ${amount.toLocaleString('id-ID')} (${percentage}%)`);
    });
  }

  // 3. Expense Analysis
  insights.push("\n💳 Analisis Pengeluaran:");
  insights.push(`• Total Pengeluaran: Rp ${totalExpense.toLocaleString('id-ID')}`);
  if (topExpenseCategories.length > 0) {
    insights.push("• Kategori Pengeluaran Terbesar:");
    topExpenseCategories.forEach(([category, amount]) => {
      const percentage = (amount / totalExpense * 100).toFixed(1);
      insights.push(`  - ${category}: Rp ${amount.toLocaleString('id-ID')} (${percentage}%)`);
    });
  }

  // 4. Recommendations
  insights.push("\n🎯 Rekomendasi:");
  
  // Savings recommendations
  if (savingsRate < 10) {
    insights.push("• Tingkatkan tabungan hingga minimal 10% dari pendapatan");
  } else if (savingsRate < 20) {
    insights.push("• Pertimbangkan untuk meningkatkan tabungan hingga 20% dari pendapatan");
  } else {
    insights.push("• Pertahankan tingkat tabungan yang baik");
  }

  // Expense management recommendations
  if (expenseToIncomeRatio > 70) {
    insights.push("• Kurangi pengeluaran non-esensial");
    insights.push("• Buat anggaran bulanan yang lebih ketat");
  }

  // Investment recommendations if applicable
  if (savingsRate >= 20) {
    insights.push("• Pertimbangkan untuk mulai berinvestasi atau tingkatkan portofolio investasi");
  }

  // Budget planning
  if (topExpenseCategories.length > 0) {
    const [topCategory, amount] = topExpenseCategories[0];
    const percentage = (amount / totalExpense * 100).toFixed(1);
    if (percentage > 40) {
      insights.push(`• Evaluasi pengeluaran untuk kategori ${topCategory} yang mencapai ${percentage}% dari total pengeluaran`);
    }
  }

  return insights.join("\n");
};

const TransactionAIAnalysis = () => {
  const { transactions, categories } = useFinance();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Generate analysis on initial load and when transactions change
  useEffect(() => {
    generateInsights();
  }, [transactions, categories]);

  const generateInsights = () => {
    setLoading(true);
    
    // Simulating AI processing time for better UX
    setTimeout(() => {
      const result = generateAnalysis(transactions, categories);
      setAnalysis(result);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Brain className="h-5 w-5 text-finance-purple mr-2" />
          <h3 className="text-lg font-medium">Analisis Keuangan</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={generateInsights}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Perbarui
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-finance-teal" />
        </div>
      ) : analysis ? (
        <div className="text-gray-700">
          {analysis.split('\n').map((paragraph, idx) => (
            <React.Fragment key={idx}>
              <p className="mb-2">{paragraph}</p>
            </React.Fragment>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">Tidak dapat menghasilkan analisis. Silakan coba lagi.</p>
      )}
    </div>
  );
};

export default TransactionAIAnalysis;
