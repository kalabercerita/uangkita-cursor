
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const { toast } = useToast();

  const analyzeReceipt = async () => {
    setIsAnalyzing(true);
    
    try {
      // Call the Supabase Edge Function to analyze the receipt with AI
      const { data, error } = await supabase.functions.invoke('analyze-receipt', {
        body: { imageUrl },
      });
      
      if (error) throw error;
      
      if (data) {
        // Process the result from AI analysis
        const result = {
          description: data.description || 'Transaksi',
          amount: data.amount || 0,
          date: data.date ? new Date(data.date) : new Date()
        };
        
        onResult(result);
        
        toast({
          title: "Analisis selesai",
          description: "Berhasil menganalisis struk belanja",
        });
      }
    } catch (error) {
      console.error('Error analyzing receipt:', error);
      toast({
        title: "Gagal menganalisis",
        description: "Terjadi kesalahan saat menganalisis foto",
        variant: "destructive"
      });
      
      // Provide a fallback result for demo purposes
      const fallbackResult = {
        description: 'Belanja Supermarket',
        amount: 187500,
        date: new Date()
      };
      
      onResult(fallbackResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <img 
        src={imageUrl} 
        alt="Receipt" 
        className="w-full h-auto max-h-[200px] object-contain rounded-md" 
      />
      
      <Button 
        className="w-full"
        onClick={analyzeReceipt}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Menganalisis...
          </>
        ) : (
          'Analisis Foto dengan AI'
        )}
      </Button>
      
      <p className="text-sm text-muted-foreground text-center">
        Catatan: Fitur ini menggunakan AI untuk mengidentifikasi detail transaksi dari foto struk.
        Hasil analisis mungkin tidak selalu 100% akurat.
      </p>
    </div>
  );
};

export default ReceiptAnalyzer;
