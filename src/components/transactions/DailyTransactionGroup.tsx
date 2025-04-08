
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { Transaction, Category } from '@/types';
import TransactionItem from './TransactionItem';

interface DailyTransactionGroupProps {
  date: string;
  transactions: Transaction[];
  categories: Category[];
  dailyBalance: number;
  formatRupiah: (amount: number) => string;
  formatDate: (dateString: string | Date) => string;
}

const DailyTransactionGroup: React.FC<DailyTransactionGroupProps> = ({
  date,
  transactions,
  categories,
  dailyBalance,
  formatRupiah,
  formatDate
}) => {
  const getCategoryDetails = (categoryId: string) => {
    return categories.find(category => category.id === categoryId);
  };

  return (
    <Card key={date} className="overflow-hidden">
      <div className="bg-muted p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">{date}</h3>
        </div>
        <div className="text-sm">
          <span className={dailyBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
            {formatRupiah(dailyBalance)}
          </span>
        </div>
      </div>
      <CardContent className="p-0">
        <ScrollArea className="max-h-[400px]">
          <div className="divide-y">
            {transactions.map(transaction => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                category={getCategoryDetails(transaction.categoryId)}
                formatRupiah={formatRupiah}
                formatDate={formatDate}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DailyTransactionGroup;
