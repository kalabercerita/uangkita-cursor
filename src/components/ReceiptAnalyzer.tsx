import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ReceiptItem {
  name: string;
  price: number;
}

interface AnalysisResult {
  description: string;
  amount: number;
  date: string;
  items?: ReceiptItem[];
}

interface ReceiptAnalyzerProps {
  imageUrl: string;
  onResult: (result: {
    description: string;
    amount: number;
    date?: Date;
  }) => void;
}

const ReceiptAnalyzer: React.FC<ReceiptAnalyzerProps> = ({ imageUrl, onResult }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const analyzeReceipt = async () => {
    if (!imageUrl) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('analyze-receipt', {
        body: { imageUrl },
      });
      
      if (invokeError) {
        // Check if it's a non-2xx status code error
        if (invokeError.message?.includes('non-2xx status code')) {
          if (retryCount < 2) { // Try up to 2 more times
            setRetryCount(prev => prev + 1);
            setTimeout(() => analyzeReceipt(), 1000); // Retry after 1 second
            return;
          }
        }
        throw invokeError;
      }
      
      if (data) {
        setAnalysisResult(data);
        setRetryCount(0); // Reset retry count on success
        
        // Pass the main transaction details to the parent component
        onResult({
          description: data.description,
          amount: data.amount,
          date: data.date ? new Date(data.date) : new Date()
        });
        
        toast({
          title: "Analisis selesai",
          description: "Berhasil menganalisis struk belanja",
        });
      }
    } catch (error) {
      console.error('Error analyzing receipt:', error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat menganalisis foto';
      setError(errorMessage);
      
      toast({
        title: "Gagal menganalisis",
        description: "Terjadi kesalahan saat menganalisis foto. Silakan coba lagi atau input manual.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-analyze when imageUrl changes
  useEffect(() => {
    if (imageUrl) {
      analyzeReceipt();
    }
  }, [imageUrl]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <img 
          src={imageUrl} 
          alt="Receipt" 
          className="w-full h-auto max-h-[200px] object-contain rounded-md border" 
        />
        
        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
            <div className="bg-white p-4 rounded-lg flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Menganalisis struk{retryCount > 0 ? ` (Percobaan ${retryCount + 1})` : ''}...</span>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="link"
              className="p-0 h-auto font-normal text-destructive hover:text-destructive/90 ml-2"
              onClick={() => {
                setRetryCount(0);
                analyzeReceipt();
              }}
            >
              Coba lagi
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {analysisResult && (
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="font-semibold">Hasil Analisis:</h3>
          
          <div className="grid gap-2 text-sm">
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Deskripsi:</span>
              <span>{analysisResult.description}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Total:</span>
              <span>Rp {analysisResult.amount.toLocaleString('id-ID')}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Tanggal:</span>
              <span>{new Date(analysisResult.date).toLocaleDateString('id-ID')}</span>
            </div>
          </div>
          
          {analysisResult.items && analysisResult.items.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Detail Item:</h4>
              <ScrollArea className="h-[200px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Harga</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysisResult.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-right">
                          Rp {item.price.toLocaleString('id-ID')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}
        </div>
      )}
      
      {!isAnalyzing && !analysisResult && !error && (
        <p className="text-sm text-muted-foreground text-center">
          Catatan: Fitur ini menggunakan AI untuk mengidentifikasi detail transaksi dari foto struk.
          Hasil analisis mungkin tidak selalu 100% akurat. Silakan periksa dan sesuaikan jika diperlukan.
        </p>
      )}
    </div>
  );
};

export default ReceiptAnalyzer;
