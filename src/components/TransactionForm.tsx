
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ImagePlus } from 'lucide-react';
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
import { Transaction } from '@/types';

// Update the schema to allow decimal amounts
const formSchema = z.object({
  description: z.string().min(2, { message: 'Deskripsi diperlukan' }),
  amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Jumlah harus berupa angka positif',
  }),
  type: z.enum(['income', 'expense', 'transfer']),
  categoryId: z.string({ required_error: 'Silakan pilih kategori' }),
  date: z.date({ required_error: 'Silakan pilih tanggal' }),
  walletId: z.string().optional(),
  receipt: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  walletId?: string;
  transaction?: Transaction;
  onSuccess?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ walletId, transaction, onSuccess }) => {
  const { categories, wallets, addTransaction, updateTransaction } = useFinance();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const isEditMode = !!transaction;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: transaction?.description || '',
      amount: transaction?.amount.toString() || '',
      type: transaction?.type || 'expense',
      categoryId: transaction?.categoryId || '',
      date: transaction?.date ? new Date(transaction.date) : new Date(),
      walletId: transaction?.walletId || walletId || '',
    },
  });
  
  useEffect(() => {
    if (transaction) {
      form.reset({
        description: transaction.description,
        amount: transaction.amount.toString(),
        type: transaction.type,
        categoryId: transaction.categoryId,
        date: new Date(transaction.date),
        walletId: transaction.walletId,
      });
    }
  }, [transaction, form]);
  
  // Filter categories based on selected type
  const selectedType = form.watch('type');
  
  // Only show income and expense categories (skip transfer for now)
  const filteredCategories = categories.filter(category => 
    (selectedType === 'income' || selectedType === 'expense') ? 
    category.type === selectedType : category.type === 'expense');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      form.setValue('receipt', file);
      
      // Show image preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          setSelectedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeReceipt = async () => {
    const receipt = form.getValues('receipt');
    if (!receipt) return;

    try {
      // Here we'd call the AI service to analyze the receipt
      // This is a placeholder for now
      alert('AI receipt analysis akan diimplementasikan nanti');
    } catch (error) {
      console.error('Error analyzing receipt:', error);
    }
  };
  
  const onSubmit = (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const transactionData = {
        description: values.description,
        // Ensure amount correctly handles decimal values
        amount: parseFloat(values.amount.replace(',', '.')),
        type: values.type,
        categoryId: values.categoryId,
        date: values.date,
        walletId: values.walletId || walletId || '',
      };
      
      if (isEditMode && transaction) {
        updateTransaction({
          ...transaction,
          ...transactionData,
        });
      } else {
        addTransaction(transactionData);
      }
      
      // Reset form if not editing
      if (!isEditMode) {
        form.reset({
          description: '',
          amount: '',
          type: 'expense',
          categoryId: undefined,
          date: new Date(),
          walletId: walletId || '',
        });
        setSelectedImage(null);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error handling transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-h-[80vh] overflow-y-auto pb-4">
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle>{isEditMode ? 'Edit Transaksi' : 'Tambah Transaksi'}</CardTitle>
          <CardDescription>
            {isEditMode ? 'Perbarui detail transaksi' : 'Catat transaksi baru'}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
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
                        {/* We can add transfer later if needed */}
                        {/* <SelectItem value="transfer">Transfer</SelectItem> */}
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
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        {...field} 
                        onChange={(e) => {
                          // Allow only numbers and one decimal point
                          const value = e.target.value.replace(/[^0-9.,]/g, '');
                          // Replace comma with dot for decimal
                          const formattedValue = value.replace(',', '.');
                          field.onChange(formattedValue);
                        }}
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

              {/* Image upload for receipt analysis */}
              <FormField
                control={form.control}
                name="receipt"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Foto Bukti (Opsional)</FormLabel>
                    <div className="grid gap-2">
                      <div className="border rounded-md p-4 flex flex-col items-center justify-center gap-2">
                        {selectedImage ? (
                          <div className="relative w-full">
                            <img 
                              src={selectedImage} 
                              alt="Receipt preview" 
                              className="w-full h-auto object-contain max-h-[200px]" 
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                setSelectedImage(null);
                                onChange(undefined);
                              }}
                            >
                              Hapus Foto
                            </Button>
                          </div>
                        ) : (
                          <>
                            <ImagePlus className="h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Upload foto untuk analisis transaksi
                            </p>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="relative"
                                onClick={() => document.getElementById('receipt-upload')?.click()}
                              >
                                Pilih Foto
                                <input
                                  id="receipt-upload"
                                  type="file"
                                  accept="image/*"
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  onChange={handleImageChange}
                                  {...fieldProps}
                                />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                      {selectedImage && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAnalyzeReceipt}
                        >
                          Analisis dengan AI
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-finance-teal to-finance-purple"
                disabled={isSubmitting}
              >
                {isSubmitting 
                  ? (isEditMode ? 'Memperbarui...' : 'Menambahkan...') 
                  : (isEditMode ? 'Perbarui Transaksi' : 'Tambah Transaksi')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionForm;
