import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useFinance } from '@/contexts/FinanceContext';
import { Wallet, Plus, ArrowRight } from 'lucide-react';
import WalletForm from '@/components/WalletForm';
import { WalletTransfer } from '@/components/WalletTransfer';

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
  
  // Calculate total assets (sum of all wallet balances)
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
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="col-span-full md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Total Aset</CardTitle>
              <CardDescription>Total saldo dari semua wallet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {wallets.reduce((total, wallet) => total + wallet.balance, 0)
                  .toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-full md:col-span-1">
          <WalletTransfer />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wallets.map((wallet) => (
          <Card key={wallet.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2" style={{ backgroundColor: wallet.color }}>
                  <Wallet className="h-4 w-4 text-white" />
                </div>
                {wallet.name}
              </CardTitle>
              <CardDescription>Saldo saat ini</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(wallet.balance, wallet.currency)}</p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(`/wallets/${wallet.id}`)}
              >
                Lihat Detail <ArrowRight className="ml-2 h-4 w-4" />
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
