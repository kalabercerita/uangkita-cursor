
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFinance } from '@/contexts/FinanceContext';
import { Wallet } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Nama dompet diperlukan' }),
});

type FormValues = z.infer<typeof formSchema>;

interface WalletEditFormProps {
  wallet: Wallet;
  onSuccess?: () => void;
}

const WalletEditForm: React.FC<WalletEditFormProps> = ({ wallet, onSuccess }) => {
  const { updateWallet } = useFinance();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: wallet.name,
    },
  });
  
  useEffect(() => {
    form.reset({
      name: wallet.name,
    });
  }, [wallet, form]);
  
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const updatedWallet = {
        ...wallet,
        name: values.name,
      };
      
      await updateWallet(updatedWallet);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating wallet:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <CardHeader className="px-0 pt-0">
        <CardTitle>Edit Dompet</CardTitle>
        <CardDescription>Perbarui nama dompet</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Dompet</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama dompet" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-finance-teal to-finance-purple"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Memperbarui...' : 'Perbarui Dompet'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </div>
  );
};

export default WalletEditForm;
