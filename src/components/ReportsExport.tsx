
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
  
  const handleExport = (format: 'csv' | 'pdf') => {
    if (!data || data.length === 0) {
      toast({
        title: 'Data Kosong',
        description: 'Tidak ada data untuk diekspor',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      if (format === 'csv') {
        exportToCSV(data, filename);
        toast({
          title: 'Ekspor Berhasil',
          description: `Laporan telah diekspor ke ${filename}.csv`,
        });
      } else if (format === 'pdf') {
        exportToPDF(data, filename, title);
        toast({
          title: 'Ekspor PDF',
          description: 'Silakan simpan laporan menggunakan dialog cetak',
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
