
import React, { useState } from 'react';
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
import { ArrowLeftRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Simplified exchange rates - these would ideally come from an API
const exchangeRates = {
  IDR: 1,
  USD: 15000,
  EUR: 16500,
  JPY: 100,
  SGD: 11000,
  MYR: 3500
};

type Currency = keyof typeof exchangeRates;

const CurrencyConverter = () => {
  const [amount, setAmount] = useState<string>('1000000');
  const [fromCurrency, setFromCurrency] = useState<Currency>('IDR');
  const [toCurrency, setToCurrency] = useState<Currency>('USD');
  const [result, setResult] = useState<string>('');
  const { toast } = useToast();

  const handleConvert = () => {
    if (!amount || isNaN(Number(amount))) {
      toast({
        title: "Input Tidak Valid",
        description: "Silakan masukkan jumlah yang valid",
        variant: "destructive"
      });
      return;
    }

    // Convert to IDR first, then to target currency
    const amountInIDR = fromCurrency === 'IDR' 
      ? Number(amount) 
      : Number(amount) * exchangeRates[fromCurrency];
    
    const convertedAmount = toCurrency === 'IDR'
      ? amountInIDR
      : amountInIDR / exchangeRates[toCurrency];
    
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
    const symbols = {
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
        <CardTitle>Konversi Mata Uang</CardTitle>
        <CardDescription>Konversi antar mata uang dengan kurs terkini</CardDescription>
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
                {Object.keys(exchangeRates).map((currency) => (
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
                {Object.keys(exchangeRates).map((currency) => (
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
          >
            Konversi
          </Button>
          
          {result && (
            <div className="mt-4 p-4 bg-muted rounded-md text-center">
              <p className="text-sm text-muted-foreground">Hasil Konversi:</p>
              <p className="text-xl font-bold">
                {formatCurrency(fromCurrency, amount)} = {formatCurrency(toCurrency, result)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Kurs: 1 {fromCurrency} = {(exchangeRates[toCurrency] / exchangeRates[fromCurrency]).toFixed(4)} {toCurrency}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrencyConverter;
