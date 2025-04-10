
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sun, Moon, Languages, RefreshCw } from 'lucide-react';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [language, setLanguage] = useState<string>('id');
  const [currency, setCurrency] = useState<string>('IDR');
  
  // App version
  const appVersion = "1.0.0.2";

  const handleResetData = () => {
    toast({
      title: "Fitur belum tersedia",
      description: "Fitur ini akan tersedia di versi mendatang",
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h2 className="text-3xl font-bold">Pengaturan</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              <Moon className="h-5 w-5" />
              Tampilan
            </CardTitle>
            <CardDescription>
              Atur tampilan dan tema aplikasi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                <span>Mode Gelap</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Aktifkan tema gelap untuk mengurangi beban mata
                </span>
              </Label>
              <Switch 
                id="dark-mode" 
                checked={theme === 'dark'}
                onCheckedChange={(checked) => {
                  setTheme(checked ? 'dark' : 'light');
                }}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Bahasa dan Mata Uang
            </CardTitle>
            <CardDescription>
              Atur bahasa dan mata uang default
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Bahasa</Label>
              <Select 
                value={language} 
                onValueChange={setLanguage}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Pilih bahasa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">Bahasa Indonesia</SelectItem>
                  <SelectItem value="en" disabled>English (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Mata Uang Utama</Label>
              <Select 
                value={currency} 
                onValueChange={setCurrency}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Pilih mata uang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IDR">Rupiah (IDR)</SelectItem>
                  <SelectItem value="USD" disabled>US Dollar (Coming Soon)</SelectItem>
                  <SelectItem value="SGD" disabled>Singapore Dollar (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Reset Data
            </CardTitle>
            <CardDescription>
              Reset semua data aplikasi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Menghapus semua data aplikasi termasuk dompet, transaksi, kategori, dan preferensi.
              Tindakan ini tidak dapat dibatalkan.
            </p>
            
            <Button 
              variant="destructive" 
              onClick={handleResetData}
            >
              Reset Semua Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Tentang Aplikasi
            </CardTitle>
            <CardDescription>
              Informasi tentang aplikasi UangKita
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">Versi Aplikasi</div>
              <div className="text-sm text-right">{appVersion}</div>
              
              <div className="text-sm font-medium">Dibuat oleh</div>
              <div className="text-sm text-right">Tim UangKita</div>
              
              <div className="text-sm font-medium">Kontak</div>
              <div className="text-sm text-right">support@uangkita.id</div>
            </div>
            
            <p className="text-xs text-muted-foreground mt-4">
              © {new Date().getFullYear()} UangKita. Semua hak dilindungi.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
