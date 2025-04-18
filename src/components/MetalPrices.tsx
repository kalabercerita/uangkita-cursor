import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, DollarSign, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MetalPrices {
  gold: number;
  silver: number;
  timestamp: string;
}

export function MetalPrices() {
  const [prices, setPrices] = useState<MetalPrices | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.functions.invoke('get-metal-prices');
      
      if (error) throw error;
      
      setPrices(data);
    } catch (err) {
      console.error('Error fetching metal prices:', err);
      setError('Gagal memuat harga logam mulia');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    // Refresh every hour
    const interval = setInterval(fetchPrices, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Memuat data harga...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{error}</p>
        <Button variant="outline" onClick={fetchPrices}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gold Card */}
        <Card className="bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-amber-200 dark:bg-amber-900 p-2 rounded-full mr-3">
                  <Coins className="h-5 w-5 text-amber-800 dark:text-amber-200" />
                </div>
                <div>
                  <div className="font-semibold">Harga Emas</div>
                  <div className="text-sm text-muted-foreground">per gram</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-xl">
                  {prices ? formatCurrency(prices.gold) : '-'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Silver Card */}
        <Card className="bg-gray-50 dark:bg-gray-950/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-gray-200 dark:bg-gray-800 p-2 rounded-full mr-3">
                  <Coins className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <div className="font-semibold">Harga Perak</div>
                  <div className="text-sm text-muted-foreground">per gram</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-xl">
                  {prices ? formatCurrency(prices.silver) : '-'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>
          Terakhir diperbarui: {prices ? new Date(prices.timestamp).toLocaleString('id-ID') : '-'}
        </span>
        <Button variant="ghost" size="sm" onClick={fetchPrices}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Perbarui
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground">
        Data harga emas dan perak diperbarui setiap jam.
      </div>
    </div>
  );
} 