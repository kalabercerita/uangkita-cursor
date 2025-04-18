import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CurrencyConverter from '@/components/CurrencyConverter';
import { MetalPrices } from '@/components/MetalPrices';
import { StockPrices } from '@/components/StockPrices';

export default function Financial() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Fasilitas Keuangan</h1>
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="currency">
            <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
              <TabsTrigger value="currency" className="rounded-none">
                Konversi Mata Uang
              </TabsTrigger>
              <TabsTrigger value="metals" className="rounded-none">
                Harga Logam Mulia
              </TabsTrigger>
              <TabsTrigger value="stocks" className="rounded-none">
                Harga Saham
              </TabsTrigger>
            </TabsList>

            <TabsContent value="currency">
              <CurrencyConverter />
            </TabsContent>

            <TabsContent value="metals">
              <MetalPrices />
            </TabsContent>

            <TabsContent value="stocks">
              <StockPrices />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 