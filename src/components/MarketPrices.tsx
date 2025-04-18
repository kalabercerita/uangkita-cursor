import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getExchangeRate, getMetalPrices } from '@/services/marketData';
import { Loader2 } from 'lucide-react';

export function MarketPrices() {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [goldPrice, setGoldPrice] = useState<number | null>(null);
  const [silverPrice, setSilverPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch exchange rate
      const { rate, timestamp: exchangeTimestamp } = await getExchangeRate();
      setExchangeRate(rate);

      // Fetch metal prices
      const { gold, silver, timestamp: metalTimestamp } = await getMetalPrices();
      setGoldPrice(gold);
      setSilverPrice(silver);

      // Use the most recent timestamp
      setLastUpdate(new Date(Math.max(
        new Date(exchangeTimestamp).getTime(),
        new Date(metalTimestamp).getTime()
      )).toLocaleString('id-ID'));
    } catch (err) {
      setError('Gagal memuat data harga terkini');
      console.error('Error fetching prices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    // Refresh setiap 5 menit
    const interval = setInterval(fetchPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Memuat data harga...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Harga Pasar Terkini</CardTitle>
        <CardDescription>Update terakhir: {lastUpdate}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">USD/IDR</p>
            <p className="text-2xl font-bold">
              {exchangeRate?.toLocaleString('id-ID', { 
                style: 'currency', 
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Emas (per gram)</p>
            <p className="text-2xl font-bold">
              {goldPrice?.toLocaleString('id-ID', { 
                style: 'currency', 
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Perak (per gram)</p>
            <p className="text-2xl font-bold">
              {silverPrice?.toLocaleString('id-ID', { 
                style: 'currency', 
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 