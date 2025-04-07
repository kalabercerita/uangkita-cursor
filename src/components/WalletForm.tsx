
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFinance } from '@/contexts/FinanceContext';
import { Wallet, Plus } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Nama dompet diperlukan' }),
  balance: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Saldo awal harus berupa angka non-negatif',
  }),
  currency: z.string().min(1, { message: 'Mata uang diperlukan' }),
  color: z.string().optional(),
  icon: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface WalletFormProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const WalletForm: React.FC<WalletFormProps> = ({ 
  trigger, 
  onSuccess 
}) => {
  const { addWallet } = useFinance();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      balance: '0',
      currency: 'IDR',
      color: 'teal',
      icon: 'wallet',
    },
  });
  
  const onSubmit = (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const walletData = {
        name: values.name,
        balance: Number(values.balance),
        currency: values.currency,
        color: values.color || 'teal',
        icon: values.icon || 'wallet',
      };
      
      addWallet(walletData);
      
      // Reset form and close dialog
      form.reset();
      setOpen(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding wallet:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const colorOptions = [
    { value: 'teal', label: 'Teal' },
    { value: 'purple', label: 'Ungu' },
    { value: 'blue', label: 'Biru' },
    { value: 'green', label: 'Hijau' },
    { value: 'yellow', label: 'Kuning' },
    { value: 'orange', label: 'Oranye' },
    { value: 'red', label: 'Merah' },
    { value: 'pink', label: 'Merah Muda' },
  ];
  
  const currencyOptions = [
    { value: 'IDR', label: 'Rupiah Indonesia (IDR)' },
    { value: 'USD', label: 'Dolar AS (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'Pound Inggris (GBP)' },
    { value: 'JPY', label: 'Yen Jepang (JPY)' },
    { value: 'CNY', label: 'Yuan Tiongkok (CNY)' },
  ];
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full bg-gradient-to-r from-finance-teal to-finance-purple hover:from-finance-teal/90 hover:to-finance-purple/90">
            <Plus className="mr-2 h-4 w-4" /> Tambah Dompet
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Dompet Baru</DialogTitle>
          <DialogDescription>
            Buat dompet baru untuk melacak keuangan Anda
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Dompet</FormLabel>
                  <FormControl>
                    <Input placeholder="mis., Tunai, Rekening Bank" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Saldo Awal</FormLabel>
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
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mata Uang</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih mata uang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencyOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warna</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih warna" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {colorOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-finance-teal to-finance-purple"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Menambahkan...' : 'Tambah Dompet'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default WalletForm;
