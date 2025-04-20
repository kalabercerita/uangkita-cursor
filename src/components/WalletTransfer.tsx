import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFinance } from '@/contexts/finance/FinanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowRightLeft, Loader2, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { addTransactionOperation } from '@/contexts/finance/transactionOperations';
import { supabase } from '@/lib/supabase';
import { transferBetweenWallets } from '@/contexts/finance/walletOperations';

const transferSchema = z.object({
  fromWalletId: z.string().min(1, 'Pilih wallet sumber'),
  toWalletId: z.string().min(1, 'Pilih wallet tujuan'),
  amount: z.string().refine(val => {
    const num = Number(val);
    return !isNaN(num) && num > 0 && Number.isFinite(num) && /^\d+(\.\d{0,2})?$/.test(val);
  }, {
    message: 'Jumlah harus berupa angka positif dengan maksimal 2 angka desimal',
  }),
  description: z.string().optional()
});

type TransferFormValues = z.infer<typeof transferSchema>;

export function WalletTransfer() {
  const { wallets, refreshWallets } = useFinance();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      description: ''
    }
  });

  const onSubmit = async (data: TransferFormValues) => {
    try {
      setIsLoading(true);
      await transferBetweenWallets(
        data.fromWalletId,
        data.toWalletId,
        Number(data.amount),
        data.description || ''
      );
      
      await refreshWallets();
      toast({
        title: 'Transfer Berhasil',
        description: `Berhasil transfer ${formatCurrency(Number(data.amount), 'IDR')}`,
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: 'Transfer Gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat transfer',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer Antar Wallet</CardTitle>
        <CardDescription>Pindahkan dana antar wallet Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fromWalletId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dari Wallet</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih wallet sumber" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name} ({wallet.balance.toLocaleString('id-ID', { style: 'currency', currency: wallet.currency })})
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
              name="toWalletId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ke Wallet</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih wallet tujuan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name} ({wallet.balance.toLocaleString('id-ID', { style: 'currency', currency: wallet.currency })})
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="Masukkan jumlah transfer"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow numbers and one decimal point
                        if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
                          field.onChange(value);
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Masukkan jumlah dengan format angka (contoh: 18512 atau 18512.50)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan deskripsi transfer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Memproses...' : 'Transfer'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 