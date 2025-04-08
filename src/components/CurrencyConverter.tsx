
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from '@/components/ui/select';
import { ArrowLeftRight, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

type Currency = 'IDR' | 'USD' | 'EUR' | 'JPY' | 'SGD' | 'MYR';

interface ExchangeRates {
  [key: string]: number;
}

const CurrencyConverter = () => {
  const [amount, setAmount] = useState<string>('1000000');
  const [fromCurrency, setFromCurrency] = useState<Currency>('IDR');
  const [toCurrency, setToCurrency] = useState<Currency>('USD');
  const [result, setResult] = useState<string>('');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  // Fetch latest exchange rates
  const fetchExchangeRates = async () => {
    try {
      setLoading(true);
      
      // Using a free API that doesn't require authentication
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      
      const data = await response.json();
      
      // Ensure we have all currencies we want to use
      const rates: ExchangeRates = {
        USD: 1, // Base currency in the API
        IDR: data.rates.IDR || 15000,
        EUR: data.rates.EUR || 0.9,
        JPY: data.rates.JPY || 110,
        SGD: data.rates.SGD || 1.35,
        MYR: data.rates.MYR || 4.2
      };
      
      setExchangeRates(rates);
      setLastUpdated(new Date());
      setError(null);
      
      toast({
        title: "Kurs Mata Uang Diperbarui",
        description: "Data kurs mata uang telah diperbarui",
      });
    } catch (err) {
      console.error('Error fetching exchange rates:', err);
      setError('Failed to load exchange rates. Using fallback rates.');
      
      // Fallback rates in case the API fails
      setExchangeRates({
        USD: 1,
        IDR: 15000,
        EUR: 0.9,
        JPY: 110,
        SGD: 1.35,
        MYR: 4.2
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch exchange rates on load and every hour
  useEffect(() => {
    fetchExchangeRates();
    
    // Refresh exchange rates every hour
    const intervalId = setInterval(fetchExchangeRates, 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleConvert = () => {
    if (!amount || isNaN(Number(amount))) {
      toast({
        title: "Input Tidak Valid",
        description: "Silakan masukkan jumlah yang valid",
        variant: "destructive"
      });
      return;
    }

    if (!exchangeRates) {
      return;
    }

    // Convert to USD first (as it's our base rate), then to target currency
    const amountInUSD = fromCurrency === 'USD' 
      ? Number(amount) 
      : Number(amount) / exchangeRates[fromCurrency];
    
    const convertedAmount = toCurrency === 'USD'
      ? amountInUSD
      : amountInUSD * exchangeRates[toCurrency];
    
    setResult(convertedAmount.toLocaleString('id-ID', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }));
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult('');
  };

  const formatCurrency = (currency: Currency, value: string) => {
    const symbols: Record<Currency, string> = {
      IDR: 'Rp',
      USD: '$',
      EUR: '€',
      JPY: '¥',
      SGD: 'S$',
      MYR: 'RM'
    };
    
    return `${symbols[currency]} ${value}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Konversi Mata Uang</CardTitle>
            <CardDescription>
              Konversi antar mata uang dengan kurs terkini
              {loading ? ' (Mengambil data kurs terbaru...)' : ''}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={fetchExchangeRates}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh Rates</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Jumlah</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Masukkan jumlah"
            />
          </div>
          
          <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2">
            <Select value={fromCurrency} onValueChange={(val) => setFromCurrency(val as Currency)}>
              <SelectTrigger>
                <SelectValue placeholder="Dari" />
              </SelectTrigger>
              <SelectContent>
                {exchangeRates && Object.keys(exchangeRates).map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleSwapCurrencies}
              className="rounded-full h-8 w-8"
            >
              <ArrowLeftRight className="h-4 w-4" />
              <span className="sr-only">Tukar Mata Uang</span>
            </Button>
            
            <Select value={toCurrency} onValueChange={(val) => setToCurrency(val as Currency)}>
              <SelectTrigger>
                <SelectValue placeholder="Ke" />
              </SelectTrigger>
              <SelectContent>
                {exchangeRates && Object.keys(exchangeRates).map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleConvert} 
            className="w-full bg-gradient-to-r from-finance-teal to-finance-purple"
            disabled={loading || !exchangeRates}
          >
            Konversi
          </Button>
          
          {result && (
            <div className="mt-4 p-4 bg-muted rounded-md text-center">
              <p className="text-sm text-muted-foreground">Hasil Konversi:</p>
              <p className="text-xl font-bold">
                {formatCurrency(fromCurrency, amount)} = {formatCurrency(toCurrency, result)}
              </p>
              {exchangeRates && (
                <p className="text-xs text-muted-foreground mt-2">
                  Kurs: 1 {fromCurrency} = {
                    ((exchangeRates[toCurrency] || 1) / (exchangeRates[fromCurrency] || 1)).toFixed(4)
                  } {toCurrency}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {lastUpdated 
                  ? `Data kurs diperbarui pada ${lastUpdated.toLocaleString('id-ID')}` 
                  : 'Data kurs diperbarui secara berkala'}
              </p>
            </div>
          )}
          
          {error && (
            <div className="mt-2 text-sm text-amber-600">
              {error}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrencyConverter;
