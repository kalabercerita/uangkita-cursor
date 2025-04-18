import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const stockOptions = [
  { symbol: 'BBCA.JK', name: 'Bank Central Asia Tbk' },
  { symbol: 'BBRI.JK', name: 'Bank Rakyat Indonesia' },
  { symbol: 'BMRI.JK', name: 'Bank Mandiri' },
  { symbol: 'TLKM.JK', name: 'Telkom Indonesia' },
  { symbol: 'ASII.JK', name: 'Astra International' },
  { symbol: 'UNVR.JK', name: 'Unilever Indonesia' },
  { symbol: 'HMSP.JK', name: 'HM Sampoerna' },
  { symbol: 'ICBP.JK', name: 'Indofood CBP' },
  { symbol: 'INDF.JK', name: 'Indofood Sukses Makmur' },
  { symbol: 'GGRM.JK', name: 'Gudang Garam' }
];

interface StockPrice {
  price: number;
  change: number;
  code: string;
}

export function StockPrices() {
  const [stockSymbol, setStockSymbol] = useState<string>('BBCA.JK');
  const [stockPrice, setStockPrice] = useState<StockPrice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStockPrice = async (symbol: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.functions.invoke('get-stock-price', {
        body: { symbol }
      });
      
      if (error) throw error;
      
      setStockPrice(data);
    } catch (err) {
      console.error('Error fetching stock price:', err);
      setError('Gagal memuat harga saham');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <Label htmlFor="stock-symbol">Pilih Saham</Label>
        <Select 
          value={stockSymbol} 
          onValueChange={(value) => {
            setStockSymbol(value);
            fetchStockPrice(value);
          }}
        >
          <SelectTrigger id="stock-symbol">
            <SelectValue placeholder="Pilih saham" />
          </SelectTrigger>
          <SelectContent>
            {stockOptions.map((stock) => (
              <SelectItem key={stock.symbol} value={stock.symbol}>
                {stock.name} ({stock.symbol})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <div className="text-center py-4">
          <p className="text-destructive mb-4">{error}</p>
          <Button variant="outline" onClick={() => fetchStockPrice(stockSymbol)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Coba Lagi
          </Button>
        </div>
      ) : (
        <Card className="bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-green-200 dark:bg-green-900 p-2 rounded-full mr-3">
                  <TrendingUp className="h-5 w-5 text-green-800 dark:text-green-200" />
                </div>
                <div>
                  <div className="font-semibold">
                    {stockOptions.find(s => s.symbol === stockSymbol)?.name || stockSymbol}
                  </div>
                  <div className="text-sm text-muted-foreground">{stockSymbol}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-xl">
                  {isLoading ? (
                    <div className="animate-pulse bg-gray-200 dark:bg-gray-800 h-7 w-32 rounded"></div>
                  ) : stockPrice ? (
                    formatCurrency(stockPrice.price)
                  ) : (
                    '-'
                  )}
                </div>
                {stockPrice && !isLoading && (
                  <div className={`text-sm ${
                    stockPrice.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stockPrice.change >= 0 ? '+' : ''}{stockPrice.change.toFixed(2)}%
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        className="w-full"
        onClick={() => fetchStockPrice(stockSymbol)}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
            Memuat...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Perbarui Harga Saham
          </>
        )}
      </Button>

      <div className="text-xs text-muted-foreground">
        Harga saham pada umumnya tertunda 15 menit dari harga pasar sebenarnya.
      </div>
    </div>
  );
} 