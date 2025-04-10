
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

  // Load data on initial render
  useEffect(() => {
    fetchMetalPrices();
    fetchExchangeRates();
  }, []);

  // Format prices with IDR
  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h2 className="text-3xl font-bold mb-6">Fasilitas Keuangan</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="currency">Konversi Mata Uang</TabsTrigger>
          <TabsTrigger value="metals">Harga Logam Mulia</TabsTrigger>
          <TabsTrigger value="forex">Nilai Tukar</TabsTrigger>
          <TabsTrigger value="stocks">Harga Saham</TabsTrigger>
        </TabsList>

        {/* Currency Converter Tab */}
        <TabsContent value="currency" className="mt-0">
          <CurrencyConverter />
        </TabsContent>

        {/* Precious Metals Tab */}
        <TabsContent value="metals" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Harga Logam Mulia Terkini
              </CardTitle>
              <CardDescription>
                Harga emas dan perak dalam Rupiah (IDR)
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exchange Rates Tab */}
        <TabsContent value="forex" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgeJapaneseYen className="h-5 w-5" />
                Nilai Tukar Mata Uang
              </CardTitle>
              <CardDescription>
                Nilai tukar terhadap Rupiah Indonesia (IDR)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {exchangeRates.loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : exchangeRates.error ? (
                <div className="text-center py-8 text-destructive">
                  <p>Gagal memuat data nilai tukar</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={fetchExchangeRates}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Coba Lagi
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-blue-50 dark:bg-blue-950/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                          USD / IDR
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatIDR(metalPrices.data?.usd_to_idr || 15850)}</div>
                        <div className="text-xs text-muted-foreground mt-1">1 US Dollar</div>
                      </CardContent>
                    </Card>

                    <Card className="bg-blue-50 dark:bg-blue-950/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <BadgePoundSterling className="h-5 w-5 mr-2 text-blue-600" />
                          EUR / IDR
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatIDR(Math.round((metalPrices.data?.usd_to_idr || 15850) * 1.09))}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">1 Euro</div>
                      </CardContent>
                    </Card>

                    <Card className="bg-blue-50 dark:bg-blue-950/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <BadgePoundSterling className="h-5 w-5 mr-2 text-purple-600" />
                          GBP / IDR
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatIDR(Math.round((metalPrices.data?.usd_to_idr || 15850) * 1.28))}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">1 British Pound</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Terakhir diperbarui: {new Date().toLocaleString('id-ID')}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={fetchExchangeRates}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Perbarui
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stocks Tab */}
        <TabsContent value="stocks" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Harga Saham Indonesia
              </CardTitle>
              <CardDescription>
                Harga saham perusahaan Indonesia
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                      <SelectContent>
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
                  <p>Catatan: Harga saham ditampilkan dengan penundaan dan hanya untuk tujuan informasi saja. Tidak untuk digunakan sebagai dasar keputusan investasi.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialFacilities;
