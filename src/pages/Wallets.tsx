
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useFinance } from '@/contexts/FinanceContext';
import { Wallet, Plus, ArrowRight } from 'lucide-react';
import WalletForm from '@/components/WalletForm';

const Wallets = () => {
  const { wallets } = useFinance();
  const navigate = useNavigate();
  
  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculate total assets
  const totalAssets = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <h1 className="text-2xl font-bold">Dompet Saya</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="mt-2 sm:mt-0 bg-gradient-to-r from-finance-teal to-finance-purple">
              <Plus className="mr-2 h-4 w-4" /> Tambah Dompet
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <WalletForm trigger={null} />
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Total Aset</CardTitle>
          <CardDescription>Jumlah total dana di semua dompet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {formatCurrency(totalAssets, 'IDR')}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {wallets.map((wallet) => (
          <Card key={wallet.id} className="overflow-hidden">
            <CardHeader className="border-b bg-muted/50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <div className={`w-3 h-3 rounded-full bg-finance-${wallet.color || 'teal'} mr-2`}></div>
                  {wallet.name}
                </CardTitle>
                <Wallet className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {formatCurrency(wallet.balance, wallet.currency)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {wallet.currency}
              </p>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 p-3">
              <Button 
                variant="ghost" 
                className="w-full justify-between" 
                onClick={() => navigate(`/wallet/${wallet.id}`)}
              >
                <span>Lihat Detail</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {wallets.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Wallet className="mx-auto h-12 w-12 text-finance-teal opacity-50" />
            <h3 className="mt-4 text-lg font-medium">Belum Ada Dompet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Tambahkan dompet untuk mulai melacak transaksi Anda.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-4 bg-gradient-to-r from-finance-teal to-finance-purple">
                  <Plus className="mr-2 h-4 w-4" /> Tambah Dompet Pertama
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <WalletForm trigger={null} />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Wallets;
