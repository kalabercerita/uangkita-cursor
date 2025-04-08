
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

  // Find top expense and income categories
  const topExpenseCategory = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1])[0];

  const topIncomeCategory = Object.entries(incomesByCategory)
    .sort((a, b) => b[1] - a[1])[0];

  // Calculate percentages
  const topExpensePercentage = totalExpense > 0 
    ? ((topExpenseCategory?.[1] || 0) / totalExpense * 100).toFixed(1) 
    : 0;

  const savingsRate = totalIncome > 0 
    ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1)
    : 0;

  // Generate insights
  let insights = [];

  // Overall financial health
  if (balance >= 0) {
    insights.push(`Anda memiliki saldo positif sebesar Rp ${balance.toLocaleString('id-ID')}. Pendapatan Anda lebih besar dari pengeluaran, yang merupakan indikator kesehatan keuangan yang baik.`);
  } else {
    insights.push(`Anda memiliki saldo negatif sebesar Rp ${Math.abs(balance).toLocaleString('id-ID')}. Pengeluaran Anda melebihi pendapatan, yang dapat menyebabkan masalah keuangan jika berlanjut.`);
  }

  // Saving rate insights
  const savingsRateNumber = parseFloat(savingsRate.toString());
  if (savingsRateNumber > 20) {
    insights.push(`Tingkat tabungan Anda sangat baik (${savingsRate}%). Anda menyimpan sebagian besar pendapatan Anda.`);
  } else if (savingsRateNumber > 10) {
    insights.push(`Tingkat tabungan Anda cukup baik (${savingsRate}%). Anda berhasil menyimpan sebagian pendapatan Anda.`);
  } else if (savingsRateNumber > 0) {
    insights.push(`Tingkat tabungan Anda rendah (${savingsRate}%). Pertimbangkan untuk meningkatkan jumlah yang Anda tabung.`);
  } else {
    insights.push(`Anda tidak menabung dari pendapatan Anda. Pengeluaran Anda lebih besar dari pendapatan.`);
  }

  // Category insights
  if (topExpenseCategory) {
    insights.push(`Kategori pengeluaran terbesar Anda adalah ${topExpenseCategory[0]} (${topExpensePercentage}% dari total pengeluaran).`);
  }

  if (topIncomeCategory) {
    insights.push(`Sumber pendapatan utama Anda adalah dari kategori ${topIncomeCategory[0]}.`);
  }

  // Get transactions from last month
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
  
  const lastMonthTransactions = transactions.filter(t => {
    const transDate = new Date(t.date);
    return transDate >= lastMonth;
  });

  const lastMonthExpense = lastMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Provide recommendations
  const recommendations = [];

  // Fix: Ensure we're comparing numbers, not strings
  const topExpensePercentageNumber = parseFloat(topExpensePercentage.toString());
  
  if (savingsRateNumber < 20) {
    recommendations.push("Tingkatkan tabungan Anda dengan menetapkan target tabungan minimal 20% dari pendapatan.");
  }

  if (topExpenseCategory && topExpensePercentageNumber > 30) {
    recommendations.push(`Pertimbangkan untuk mengurangi pengeluaran di kategori ${topExpenseCategory[0]} yang menyumbang persentase besar dari total pengeluaran Anda.`);
  }

  if (balance < 0) {
    recommendations.push("Prioritaskan penurunan pengeluaran atau peningkatan pendapatan untuk mencapai saldo positif.");
  }

  let finalAnalysis = insights.join(" ");
  
  if (recommendations.length > 0) {
    finalAnalysis += "\n\nRekomendasi:\n- " + recommendations.join("\n- ");
  }

  return finalAnalysis;
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
          {analysis.split('\n\n').map((paragraph, idx) => (
            <React.Fragment key={idx}>
              {paragraph.startsWith('Rekomendasi:') ? (
                <>
                  <h4 className="font-semibold mt-4 mb-2">Rekomendasi:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {paragraph.replace('Rekomendasi:\n', '').split('\n').map((rec, recIdx) => (
                      <li key={recIdx}>{rec.replace('- ', '')}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="mb-2">{paragraph}</p>
              )}
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
