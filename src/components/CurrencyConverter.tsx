
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Coins, TrendingUp, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const FinancialFacilities = () => {
  // Currency converter state
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('IDR');
  const [convertedAmount, setConvertedAmount] = useState<string>('Loading...');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Metal prices state
  const [goldPrice, setGoldPrice] = useState<number | null>(null);
  const [goldPriceUSD, setGoldPriceUSD] = useState<number | null>(null);
  const [silverPrice, setSilverPrice] = useState<number | null>(null);
  const [silverPriceUSD, setSilverPriceUSD] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Stock prices state
  const [stockSymbol, setStockSymbol] = useState<string>('BBCA.JK');
  const [stockPrice, setStockPrice] = useState<number | null>(null);
  const [stockChange, setStockChange] = useState<number | null>(null);
  const [stockName, setStockName] = useState<string>('Bank Central Asia Tbk');
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  
  // Popular Indonesia stock options
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
    { symbol: 'GGRM.JK', name: 'Gudang Garam' },
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'HKD', name: 'Hong Kong Dollar' },
    { code: 'NZD', name: 'New Zealand Dollar' },
    { code: 'IDR', name: 'Indonesian Rupiah' },
    { code: 'MYR', name: 'Malaysian Ringgit' },
    { code: 'SGD', name: 'Singapore Dollar' },
    { code: 'KRW', name: 'South Korean Won' },
    { code: 'INR', name: 'Indian Rupee' }
  ];
  
  // Fetch exchange rates data
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setIsLoading(true);
        
        // Call Exchange Rates API through Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('get-exchange-rates');
        
        if (error) {
          console.error('Error fetching exchange rates:', error);
          // Fallback to direct API call if edge function fails
          const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
          const data = await response.json();
          setExchangeRates(data.rates);
        } else if (data && data.rates) {
          setExchangeRates(data.rates);
        }
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
        // Use mock data as fallback
        setExchangeRates({
          USD: 1,
          EUR: 0.92,
          GBP: 0.79,
          JPY: 149.82,
          IDR: 15750,
          SGD: 1.34,
          MYR: 4.73,
          CNY: 7.24
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExchangeRates();
    
    // Refresh exchange rates every 60 minutes
    const intervalId = setInterval(fetchExchangeRates, 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Fetch gold and silver prices
  useEffect(() => {
    const fetchMetalPrices = async () => {
      try {
        // Call Metal Prices API through Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('get-metal-prices');
        
        if (error) {
          console.error('Error fetching metal prices:', error);
        } else if (data) {
          // Set gold price (per gram in USD)
          if (data.gold) {
            setGoldPriceUSD(data.gold / 31.1035); // Convert Troy Ounce to Gram
          }
          
          // Set silver price (per gram in USD)
          if (data.silver) {
            setSilverPriceUSD(data.silver / 31.1035); // Convert Troy Ounce to Gram
          }
          
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error('Error fetching metal prices:', error);
        // Use mock data as fallback
        setGoldPriceUSD(64.5);
        setSilverPriceUSD(0.78);
        setLastUpdated(new Date());
      }
    };
    
    fetchMetalPrices();
    
    // Refresh metal prices every 60 minutes
    const intervalId = setInterval(fetchMetalPrices, 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Convert metal prices to IDR when USD rates are available
  useEffect(() => {
    if (goldPriceUSD && exchangeRates.IDR) {
      setGoldPrice(goldPriceUSD * exchangeRates.IDR);
    }
    
    if (silverPriceUSD && exchangeRates.IDR) {
      setSilverPrice(silverPriceUSD * exchangeRates.IDR);
    }
  }, [goldPriceUSD, silverPriceUSD, exchangeRates]);
  
  // Fetch stock data
  const fetchStockData = async (symbol: string) => {
    try {
      setIsLoadingStock(true);
      
      // Call Stock API through Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('get-stock-price', {
        body: { symbol }
      });
      
      if (error) {
        console.error('Error fetching stock data:', error);
      } else if (data) {
        setStockPrice(data.price);
        setStockChange(data.change);
        
        // Find stock name from options
        const stock = stockOptions.find(s => s.symbol === symbol);
        if (stock) {
          setStockName(stock.name);
        }
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
      // Use mock data as fallback
      setStockPrice(9000);
      setStockChange(0.5);
    } finally {
      setIsLoadingStock(false);
    }
  };
  
  // Initialize stock data
  useEffect(() => {
    fetchStockData(stockSymbol);
  }, [stockSymbol]);
  
  // Calculate converted amount when dependencies change
  useEffect(() => {
    if (!isLoading && Object.keys(exchangeRates).length > 0) {
      const numAmount = parseFloat(amount) || 0;
      
      // Convert through USD as the base currency
      const toUSD = fromCurrency === 'USD' ? 
        numAmount : 
        numAmount / exchangeRates[fromCurrency];
      
      const fromUSDToTarget = toCurrency === 'USD' ? 
        toUSD : 
        toUSD * exchangeRates[toCurrency];
      
      setConvertedAmount(fromUSDToTarget.toFixed(2));
    }
  }, [amount, fromCurrency, toCurrency, exchangeRates, isLoading]);
  
  // Format currency with proper locale
  const formatCurrency = (value: number, currency: string, maximumFractionDigits: number = 2) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency,
      maximumFractionDigits
    }).format(value);
  };
  
  // Handle currency swap
  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };
  
  // Format timestamp
  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Loading...';
    
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Fasilitas Keuangan</CardTitle>
        <CardDescription>
          Alat bantu keuangan untuk memantau kurs, harga emas, dan saham
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="currency">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="currency">Konversi Mata Uang</TabsTrigger>
            <TabsTrigger value="metals">Harga Logam Mulia</TabsTrigger>
            <TabsTrigger value="stocks">Harga Saham</TabsTrigger>
          </TabsList>
          
          {/* Currency Converter Tab */}
          <TabsContent value="currency" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from-amount">Jumlah</Label>
                <Input
                  id="from-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="from-currency">Dari</Label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger id="from-currency">
                    <SelectValue placeholder="Pilih mata uang" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-center py-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSwapCurrencies}
                className="rounded-full"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="to-amount">Hasil Konversi</Label>
                <Input
                  id="to-amount"
                  readOnly
                  value={isLoading ? "Loading..." : convertedAmount}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="to-currency">Ke</Label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger id="to-currency">
                    <SelectValue placeholder="Pilih mata uang" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {isLoading ? (
                "Memuat kurs mata uang terbaru..."
              ) : (
                <>
                  <div>1 {fromCurrency} = {(exchangeRates[toCurrency] / exchangeRates[fromCurrency]).toFixed(4)} {toCurrency}</div>
                  <div>1 {toCurrency} = {(exchangeRates[fromCurrency] / exchangeRates[toCurrency]).toFixed(4)} {fromCurrency}</div>
                </>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground">
              Nilai tukar diperbarui setiap jam.
            </div>
          </TabsContent>
          
          {/* Metal Prices Tab */}
          <TabsContent value="metals" className="pt-4">
            <div className="space-y-4">
              {/* Gold Card */}
              <Card className="bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-amber-200 p-2 rounded-full mr-3">
                        <Coins className="h-5 w-5 text-amber-800" />
                      </div>
                      <div>
                        <div className="font-semibold">Harga Emas</div>
                        <div className="text-sm text-muted-foreground">per gram</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xl">
                        {goldPrice ? formatCurrency(goldPrice, 'IDR', 0) : 'Loading...'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {goldPriceUSD ? `$${goldPriceUSD.toFixed(2)}/gram` : ''}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Silver Card */}
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-gray-200 p-2 rounded-full mr-3">
                        <Coins className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-semibold">Harga Perak</div>
                        <div className="text-sm text-muted-foreground">per gram</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xl">
                        {silverPrice ? formatCurrency(silverPrice, 'IDR', 0) : 'Loading...'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {silverPriceUSD ? `$${silverPriceUSD.toFixed(2)}/gram` : ''}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* USD to IDR Exchange Rate */}
              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-blue-200 p-2 rounded-full mr-3">
                        <DollarSign className="h-5 w-5 text-blue-800" />
                      </div>
                      <div>
                        <div className="font-semibold">USD/IDR</div>
                        <div className="text-sm text-muted-foreground">Kurs Dollar ke Rupiah</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xl">
                        {exchangeRates.IDR ? formatCurrency(exchangeRates.IDR, 'IDR', 0) : 'Loading...'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="text-sm text-muted-foreground">
                Terakhir diperbarui: {formatLastUpdated(lastUpdated)}
              </div>
              <div className="text-xs text-muted-foreground">
                Data harga emas dan perak diperbarui setiap jam.
              </div>
            </div>
          </TabsContent>
          
          {/* Stock Prices Tab */}
          <TabsContent value="stocks" className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stock-symbol">Pilih Saham</Label>
              <Select value={stockSymbol} onValueChange={(value) => {
                setStockSymbol(value);
                fetchStockData(value);
              }}>
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
            
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-gray-200 p-2 rounded-full mr-3">
                      <TrendingUp className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-semibold">{stockName}</div>
                      <div className="text-sm text-muted-foreground">{stockSymbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl">
                      {isLoadingStock ? 'Loading...' : (
                        stockPrice ? formatCurrency(stockPrice, 'IDR', 0) : 'N/A'
                      )}
                    </div>
                    {stockChange !== null && (
                      <div className={`text-sm ${stockChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stockChange >= 0 ? '+' : ''}{stockChange.toFixed(2)}%
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Button
              className="w-full"
              onClick={() => fetchStockData(stockSymbol)}
              disabled={isLoadingStock}
            >
              {isLoadingStock ? 'Memperbarui...' : 'Perbarui Harga Saham'}
            </Button>
            
            <div className="text-xs text-muted-foreground">
              Harga saham pada umumnya tertunda 15 menit dari harga pasar sebenarnya.
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FinancialFacilities;
