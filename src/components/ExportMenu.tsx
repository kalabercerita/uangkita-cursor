
import React, { useRef } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, FileImage, File } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useFinance } from '@/contexts/FinanceContext';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

interface ExportMenuProps {
  contentRef: React.RefObject<HTMLDivElement>;
  title?: string;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ contentRef, title = 'UangKita' }) => {
  const { toast } = useToast();
  const { wallets, transactions, categories } = useFinance();
  
  const exportToPDF = async () => {
    if (!contentRef.current) return;
    
    try {
      toast({
        title: "Mempersiapkan PDF",
        description: "Sedang membuat file PDF...",
      });
      
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${title}_${new Date().toISOString().slice(0, 10)}.pdf`);
      
      toast({
        title: "PDF Berhasil Dibuat",
        description: "File PDF telah berhasil diunduh",
      });
    } catch (error) {
      console.error('Export to PDF error:', error);
      toast({
        title: "Gagal Membuat PDF",
        description: "Terjadi kesalahan saat membuat file PDF",
        variant: "destructive",
      });
    }
  };
  
  const exportToPNG = async () => {
    if (!contentRef.current) return;
    
    try {
      toast({
        title: "Mempersiapkan Gambar",
        description: "Sedang membuat file gambar...",
      });
      
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const link = document.createElement('a');
      link.download = `${title}_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast({
        title: "Gambar Berhasil Dibuat",
        description: "File PNG telah berhasil diunduh",
      });
    } catch (error) {
      console.error('Export to PNG error:', error);
      toast({
        title: "Gagal Membuat Gambar",
        description: "Terjadi kesalahan saat membuat file gambar",
        variant: "destructive",
      });
    }
  };
  
  const exportToExcel = () => {
    try {
      toast({
        title: "Mempersiapkan Excel",
        description: "Sedang membuat file Excel...",
      });
      
      // Create workbook and worksheets
      const wb = XLSX.utils.book_new();
      
      // Transactions worksheet
      const transactionsData = transactions.map(t => {
        // Find category and wallet info
        const category = categories.find(c => c.id === t.categoryId);
        const wallet = wallets.find(w => w.id === t.walletId);
        
        return {
          'Tanggal': new Date(t.date).toLocaleDateString('id-ID'),
          'Deskripsi': t.description,
          'Tipe': t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
          'Jumlah': t.amount,
          'Kategori': category?.name || '-',
          'Dompet': wallet?.name || '-'
        };
      });
      
      const transactionsWs = XLSX.utils.json_to_sheet(transactionsData);
      XLSX.utils.book_append_sheet(wb, transactionsWs, "Transaksi");
      
      // Wallets worksheet
      const walletsData = wallets.map(w => ({
        'Nama Dompet': w.name,
        'Saldo': w.balance,
        'Mata Uang': w.currency,
        'Warna': w.color || '-'
      }));
      
      const walletsWs = XLSX.utils.json_to_sheet(walletsData);
      XLSX.utils.book_append_sheet(wb, walletsWs, "Dompet");
      
      // Summary worksheet
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
      
      const summaryData = [
        { 'Ringkasan': 'Total Pemasukan', 'Nilai': totalIncome },
        { 'Ringkasan': 'Total Pengeluaran', 'Nilai': totalExpense },
        { 'Ringkasan': 'Saldo Bersih', 'Nilai': totalBalance }
      ];
      
      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, "Ringkasan");
      
      // Export file
      XLSX.writeFile(wb, `${title}_${new Date().toISOString().slice(0, 10)}.xlsx`);
      
      toast({
        title: "Excel Berhasil Dibuat",
        description: "File Excel telah berhasil diunduh",
      });
    } catch (error) {
      console.error('Export to Excel error:', error);
      toast({
        title: "Gagal Membuat Excel",
        description: "Terjadi kesalahan saat membuat file Excel",
        variant: "destructive",
      });
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={exportToPDF}>
          <File className="mr-2 h-4 w-4" />
          Export ke PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPNG}>
          <FileImage className="mr-2 h-4 w-4" />
          Export ke PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export ke Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportMenu;
