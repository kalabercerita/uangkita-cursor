
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFinance } from '@/contexts/FinanceContext';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  description: z.string().min(2, { message: 'Deskripsi diperlukan' }),
  amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Jumlah harus berupa angka positif',
  }),
  type: z.enum(['income', 'expense']),
  categoryId: z.string({ required_error: 'Silakan pilih kategori' }),
  date: z.date({ required_error: 'Silakan pilih tanggal' }),
  walletId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  walletId?: string;
  onSuccess?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ walletId, onSuccess }) => {
  const { categories, wallets, addTransaction } = useFinance();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: '',
      type: 'expense',
      date: new Date(),
      walletId: walletId || '',
    },
  });
  
  // Filter categories based on selected type
  const selectedType = form.watch('type');
  const filteredCategories = categories.filter(category => category.type === selectedType);
  
  const onSubmit = (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const transactionData = {
        description: values.description,
        amount: Number(values.amount),
        type: values.type,
        categoryId: values.categoryId,
        date: values.date,
        walletId: values.walletId || walletId || '',
      };
      
      addTransaction(transactionData);
      
      // Reset form
      form.reset({
        description: '',
        amount: '',
        type: 'expense',
        categoryId: undefined,
        date: new Date(),
        walletId: walletId || '',
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Transaksi</CardTitle>
        <CardDescription>Catat transaksi baru</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Transaksi</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Pemasukan</SelectItem>
                      <SelectItem value="expense">Pengeluaran</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Input placeholder="mis., Belanja, Gaji" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      min="0" 
                      step="1000" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {!walletId && (
              <FormField
                control={form.control}
                name="walletId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dompet</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih dompet" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {wallets.map(wallet => (
                          <SelectItem key={wallet.id} value={wallet.id}>
                            {wallet.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd MMMM yyyy")
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="pointer-events-auto p-3"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-finance-teal to-finance-purple"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Menambahkan...' : 'Tambah Transaksi'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;
