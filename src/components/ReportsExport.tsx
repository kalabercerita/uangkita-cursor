
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToCSV, exportToPDF } from '@/utils/exportUtils';

interface ReportsExportProps {
  data: any[];
  filename?: string;
  title?: string;
}

const ReportsExport = ({ data, filename = 'laporan', title = 'Laporan Keuangan' }: ReportsExportProps) => {
  const { toast } = useToast();
  
  const handleExport = async (format: 'csv' | 'pdf') => {
    if (!data || data.length === 0) {
      toast({
        title: 'Data Kosong',
        description: 'Tidak ada data untuk diekspor',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      let blob: Blob;
      
      if (format === 'csv') {
        blob = await exportToCSV(data, filename);
        // Create download link for CSV
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `${filename}.csv`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        toast({
          title: 'Ekspor Berhasil',
          description: `Laporan telah diekspor ke ${filename}.csv`,
        });
      } else if (format === 'pdf') {
        blob = await exportToPDF(data, filename, title);
        // The actual PDF is created in the print dialog from exportToPDF
        toast({
          title: 'Ekspor PDF Berhasil',
          description: 'Silakan cetak atau simpan sebagai PDF di jendela yang terbuka',
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Ekspor Gagal',
        description: 'Terjadi kesalahan saat mengekspor data',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          <Download className="mr-2 h-4 w-4" />
          Ekspor
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          Ekspor CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          Ekspor PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ReportsExport;
