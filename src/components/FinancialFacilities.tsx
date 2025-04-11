
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, RefreshCw, DollarSign, TrendingUp, BadgeJapaneseYen, BadgeDollarSign, BadgePoundSterling, Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CurrencyConverter from './CurrencyConverter';

// Settings storage key (must match the one in Settings.tsx)
const SETTINGS_STORAGE_KEY = 'uangkita_app_settings';

const FinancialFacilities = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('currency');
  const [metalPrices, setMetalPrices] = useState<any>({
    loading: true,
    data: null,
    error: null
  });
  const [exchangeRates, setExchangeRates] = useState<any>({
    loading: true,
    data: null,
    error: null
  });
  const [stockSymbol, setStockSymbol] = useState<string>('BBCA.JK');
  const [stockPrice, setStockPrice] = useState<any>({
    loading: false,
    data: null,
    error: null
  });
  const [showFeature, setShowFeature] = useState<boolean>(false);

  // Popular Indonesian stocks
  const popularStocks = [
    { code: 'BBCA.JK', name: 'Bank Central Asia' },
    { code: 'BBRI.JK', name: 'Bank Rakyat Indonesia' },
    { code: 'BMRI.JK', name: 'Bank Mandiri' },
    { code: 'TLKM.JK', name: 'Telkom Indonesia' },
    { code: 'ASII.JK', name: 'Astra International' },
    { code: 'UNVR.JK', name: 'Unilever Indonesia' },
    { code: 'HMSP.JK', name: 'HM Sampoerna' },
    { code: 'ICBP.JK', name: 'Indofood CBP' },
    { code: 'INDF.JK', name: 'Indofood Sukses Makmur' },
    { code: 'GGRM.JK', name: 'Gudang Garam' },
  ];

  // Check if the feature should be shown
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        setShowFeature(settings.showFinancialFacilities || false);
      } else {
        setShowFeature(false); // Default to hidden
      }
    } catch (error) {
      console.error('Error loading app settings:', error);
      setShowFeature(false);
    }
  }, []);

  // Only fetch data if the feature is shown
  useEffect(() => {
    if (showFeature) {
      fetchMetalPrices();
      fetchExchangeRates();
    }
  }, [showFeature]);

  // Fetch metal prices
  const fetchMetalPrices = async () => {
    setMetalPrices({ loading: true, data: null, error: null });
    
    try {
      const { data, error } = await supabase.functions.invoke('get-metal-prices');
      
      if (error) throw error;
      
      setMetalPrices({
        loading: false,
        data,
        error: null
      });
    } catch (error) {
      console.error('Error fetching metal prices:', error);
      setMetalPrices({
        loading: false,
        data: null,
        error: 'Failed to fetch metal prices'
      });
      
      toast({
        title: 'Error',
        description: 'Gagal memuat harga logam mulia',
        variant: 'destructive'
      });
    }
  };

  // Fetch exchange rates
  const fetchExchangeRates = async () => {
    setExchangeRates({ loading: true, data: null, error: null });
    
    try {
      const { data, error } = await supabase.functions.invoke('get-exchange-rates');
      
      if (error) throw error;
      
      setExchangeRates({
        loading: false,
        data,
        error: null
      });
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      setExchangeRates({
        loading: false,
        data: null,
        error: 'Failed to fetch exchange rates'
      });
      
      toast({
        title: 'Error',
        description: 'Gagal memuat nilai tukar mata uang',
        variant: 'destructive'
      });
    }
  };

  // Fetch stock price
  const fetchStockPrice = async (symbol: string) => {
    setStockPrice({ loading: true, data: null, error: null });
    
    try {
      const { data, error } = await supabase.functions.invoke('get-stock-price', {
        body: { symbol }
      });
      
      if (error) throw error;
      
      setStockPrice({
        loading: false,
        data,
        error: null
      });
    } catch (error) {
      console.error('Error fetching stock price:', error);
      setStockPrice({
        loading: false,
        data: null,
        error: 'Failed to fetch stock price'
      });
      
      toast({
        title: 'Error',
        description: 'Gagal memuat harga saham',
        variant: 'destructive'
      });
    }
  };

  // Format prices with IDR
  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // If feature is hidden based on settings, return null
  if (!showFeature) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 space-y-6 px-4 sm:px-6">
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
              <TabsTrigger value="currency" className="rounded-none">Konversi Mata Uang</TabsTrigger>
              <TabsTrigger value="metals" className="rounded-none">Harga Logam Mulia</TabsTrigger>
              <TabsTrigger value="stocks" className="rounded-none">Harga Saham</TabsTrigger>
            </TabsList>

            {/* Currency Converter Tab */}
            <TabsContent value="currency" className="p-4 border-none">
              <CurrencyConverter />
            </TabsContent>

            {/* Precious Metals Tab */}
            <TabsContent value="metals" className="p-4 border-none">
              {metalPrices.loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : metalPrices.error ? (
                <div className="text-center py-8 text-destructive">
                  <p>Gagal memuat data harga logam mulia</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={fetchMetalPrices}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Coba Lagi
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="bg-yellow-50 dark:bg-yellow-950/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <BadgeDollarSign className="h-5 w-5 mr-2 text-yellow-600" />
                          Emas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Per Gram</span>
                            <span className="font-semibold">{formatIDR(metalPrices.data.gold_per_gram)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Per Troy Ounce</span>
                            <span className="font-semibold">{formatIDR(metalPrices.data.gold)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-50 dark:bg-gray-950/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <BadgeDollarSign className="h-5 w-5 mr-2 text-gray-500" />
                          Perak
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Per Gram</span>
                            <span className="font-semibold">{formatIDR(metalPrices.data.silver_per_gram)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Per Troy Ounce</span>
                            <span className="font-semibold">{formatIDR(metalPrices.data.silver)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Terakhir diperbarui: {new Date(metalPrices.data.last_updated).toLocaleString('id-ID')}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={fetchMetalPrices}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Perbarui
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Stocks Tab */}
            <TabsContent value="stocks" className="p-4 border-none">
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-2/3">
                    <Label htmlFor="stock-symbol" className="mb-2 block">Pilih Perusahaan</Label>
                    <Select 
                      value={stockSymbol} 
                      onValueChange={(value) => {
                        setStockSymbol(value);
                        fetchStockPrice(value);
                      }}
                    >
                      <SelectTrigger id="stock-symbol">
                        <SelectValue placeholder="Pilih perusahaan" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="w-full bg-white z-50">
                        {popularStocks.map(stock => (
                          <SelectItem key={stock.code} value={stock.code}>
                            {stock.name} ({stock.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full md:w-1/3 flex items-end">
                    <Button 
                      className="w-full" 
                      onClick={() => fetchStockPrice(stockSymbol)}
                      disabled={stockPrice.loading}
                    >
                      {stockPrice.loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Cek Harga
                    </Button>
                  </div>
                </div>

                {stockPrice.data && (
                  <Card className="bg-green-50 dark:bg-green-950/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">
                        {popularStocks.find(s => s.code === stockSymbol)?.name || stockSymbol}
                      </CardTitle>
                      <CardDescription>{stockPrice.data.code || stockSymbol}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-3xl font-bold">{formatIDR(stockPrice.data.price)}</div>
                          <div className="text-sm mt-1">
                            <span 
                              className={
                                Number(stockPrice.data.change) > 0 
                                  ? "text-green-600" 
                                  : Number(stockPrice.data.change) < 0 
                                    ? "text-red-600" 
                                    : "text-gray-600"
                              }
                            >
                              {Number(stockPrice.data.change) > 0 ? "+" : ""}
                              {stockPrice.data.change}%
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date().toLocaleString('id-ID')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="text-sm text-muted-foreground">
                  <p>Harga saham pada umumnya tertunda 15 menit dari harga pasar sebenarnya.</p>
                </div>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fetchStockPrice(stockSymbol)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Perbarui Harga Saham
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialFacilities;
