
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFinance } from '@/contexts/FinanceContext';
import { 
  ArrowLeftRight, 
  TrendingUp, 
  TrendingDown, 
  Edit, 
  Trash2,
  AlertTriangle
} from 'lucide-react';
import TransactionForm from '@/components/TransactionForm';
import WalletEditForm from '@/components/WalletEditForm';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const WalletDetail = () => {
  const { walletId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { wallets, transactions, setCurrentWallet, deleteWallet } = useFinance();
  const [isEditWalletOpen, setIsEditWalletOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const wallet = wallets.find(w => w.id === walletId);
  
  useEffect(() => {
    if (wallet) {
      setCurrentWallet(wallet);
    } else {
      toast({
        title: "Wallet tidak ditemukan",
        description: "Dompet yang Anda cari tidak ada.",
        variant: "destructive"
      });
      navigate('/');
    }
    
    return () => {
      setCurrentWallet(null);
    };
  }, [walletId, wallet, setCurrentWallet, navigate, toast]);
  
  if (!wallet) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  
  // Get transactions for this wallet
  const walletTransactions = transactions
    .filter(t => t.walletId === walletId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Calculate totals
  const income = walletTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const expense = walletTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: wallet.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDeleteWallet = async () => {
    try {
      setIsDeleting(true);
      await deleteWallet(walletId!);
      navigate('/wallets');
      toast({
        title: "Dompet dihapus",
        description: `${wallet.name} telah dihapus`,
      });
    } catch (error) {
      console.error('Error deleting wallet:', error);
      toast({
        title: "Gagal menghapus dompet",
        description: "Terjadi kesalahan saat mencoba menghapus dompet",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteAlertOpen(false);
    }
  };
  
  return (
    <div className="space-y-6 py-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="mr-2"
            onClick={() => navigate('/wallets')}
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
          <span className={`w-3 h-3 rounded-full bg-${wallet.color || 'finance-teal'}`}></span>
          {wallet.name}
        </h2>
        <div className="flex gap-2">
          <Dialog open={isEditWalletOpen} onOpenChange={setIsEditWalletOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="flex gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <WalletEditForm 
                wallet={wallet} 
                onSuccess={() => setIsEditWalletOpen(false)} 
              />
            </DialogContent>
          </Dialog>

          <Button 
            variant="destructive" 
            size="sm"
            className="flex gap-2"
            onClick={() => setIsDeleteAlertOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Hapus
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saldo Saat Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(wallet.balance)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-finance-green">Total Pemasukan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-finance-green">{formatCurrency(income)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-finance-red">Total Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-finance-red">{formatCurrency(expense)}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Transaksi Terbaru</CardTitle>
              <CardDescription>
                Aktivitas terbaru di dompet ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              {walletTransactions.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  Tidak ada transaksi untuk dompet ini.
                </div>
              ) : (
                <div className="space-y-4">
                  {walletTransactions.slice(0, 5).map(transaction => (
                    <div 
                      key={transaction.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className="h-4 w-4 text-finance-green" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-finance-red" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(transaction.date)}
                          </div>
                        </div>
                      </div>
                      <div className={`font-medium ${
                        transaction.type === 'income' ? 'text-finance-green' : 'text-finance-red'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'} 
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                  
                  {walletTransactions.length > 5 && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/transactions')}
                    >
                      Lihat Semua Transaksi
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <TransactionForm walletId={walletId} />
        </div>
      </div>

      {/* Alert Dialog for Delete Confirmation */}
      <AlertDialog
        open={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Hapus Dompet
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus dompet "{wallet.name}"? 
              Semua transaksi yang terkait dengan dompet ini juga akan dihapus.
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWallet}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus Dompet'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WalletDetail;
