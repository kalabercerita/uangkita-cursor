
import { Transaction, Category, Report, Period } from '@/types';

export const getReportOperation = (
  period: Period, 
  transactions: Transaction[], 
  categories: Category[],
  startDate?: Date, 
  endDate?: Date
): Report => {
  let filteredTransactions = [...transactions];
  
  if (period === 'daily') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    filteredTransactions = filteredTransactions.filter(t => {
      const transDate = new Date(t.date);
      return transDate >= today;
    });
  } else if (period === 'weekly') {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    filteredTransactions = filteredTransactions.filter(t => {
      const transDate = new Date(t.date);
      return transDate >= lastWeek;
    });
  } else if (period === 'monthly') {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    filteredTransactions = filteredTransactions.filter(t => {
      const transDate = new Date(t.date);
      return transDate >= lastMonth;
    });
  } else if (period === 'yearly') {
    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    filteredTransactions = filteredTransactions.filter(t => {
      const transDate = new Date(t.date);
      return transDate >= lastYear;
    });
  } else if (period === 'custom' && startDate && endDate) {
    // For custom period, ensure end date includes the entire day
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);
    
    filteredTransactions = filteredTransactions.filter(t => {
      const transDate = new Date(t.date);
      return transDate >= startDate && transDate <= adjustedEndDate;
    });
  }
  
  // Calculate totals
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Group by category
  const categoryGroups = filteredTransactions.reduce((groups, transaction) => {
    const category = categories.find(c => c.id === transaction.categoryId) || 
                    { id: transaction.categoryId, name: 'Unknown', type: transaction.type as 'income' | 'expense' };
    
    if (!groups[category.id]) {
      groups[category.id] = {
        categoryId: category.id,
        categoryName: category.name,
        amount: 0,
        percentage: 0,
      };
    }
    
    // Handle income as positive and expense as negative
    if (transaction.type === 'income') {
      groups[category.id].amount += transaction.amount;
    } else if (transaction.type === 'expense') {
      groups[category.id].amount -= transaction.amount;
    }
    
    return groups;
  }, {} as Record<string, { categoryId: string; categoryName: string; amount: number; percentage: number; }>);
  
  // Calculate percentages
  const categorySummary = Object.values(categoryGroups).map(group => {
    // For percentage calculation, use absolute value of the relevant total
    const total = group.amount > 0 ? totalIncome : Math.abs(totalExpense);
    return {
      ...group,
      percentage: Math.abs(total > 0 ? (group.amount / total) * 100 : 0),
    };
  });
  
  return {
    period,
    totalIncome,
    totalExpense, // This is positive for consistency with the API
    balance: totalIncome - totalExpense, // Calculate balance as income minus expense
    categorySummary: categorySummary.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)),
  };
};
