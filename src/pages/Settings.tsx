
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  Sun, 
  Moon, 
  Languages, 
  RefreshCw, 
  Plus, 
  Trash, 
  Edit,
  Check,
  X,
  Tag,
  DollarSign
} from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Category } from '@/types';

// Create a new type for app settings
type AppSettings = {
  showFinancialFacilities: boolean;
}

// Default app settings
const defaultSettings: AppSettings = {
  showFinancialFacilities: false
};

// Create a settings key for localStorage
const SETTINGS_STORAGE_KEY = 'uangkita_app_settings';

const Settings = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { toast } = useToast();
  const [language, setLanguage] = useState<string>('id');
  const [currency, setCurrency] = useState<string>('IDR');
  const { categories, addCategory, updateCategory, deleteCategory } = useFinance();
  
  // App settings state
  const [appSettings, setAppSettings] = useState<AppSettings>(defaultSettings);
  
  // New category state - with proper typing for "income" | "expense"
  const [newCategory, setNewCategory] = useState<{
    name: string;
    type: "income" | "expense";
    color: string;
    icon: string;
  }>({
    name: '',
    type: 'expense',
    color: '#48BB78',
    icon: 'tag'
  });
  
  // Edit category state
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  
  // App version
  const appVersion = "1.0.0.3";

  // Load app settings from localStorage on component mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (storedSettings) {
          setAppSettings(JSON.parse(storedSettings));
        }
      } catch (error) {
        console.error('Error loading app settings:', error);
        // If there's an error, use default settings
        setAppSettings(defaultSettings);
      }
    };
    
    loadSettings();
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(appSettings));
  }, [appSettings]);

  // Handle toggle for financial facilities visibility
  const handleToggleFinancialFacilities = (checked: boolean) => {
    setAppSettings(prev => ({
      ...prev,
      showFinancialFacilities: checked
    }));
    
    toast({
      title: checked ? "Fasilitas Keuangan Ditampilkan" : "Fasilitas Keuangan Disembunyikan",
      description: checked 
        ? "Fasilitas keuangan akan ditampilkan di aplikasi" 
        : "Fasilitas keuangan akan disembunyikan di aplikasi",
    });
  };

  const handleResetData = () => {
    toast({
      title: "Fitur belum tersedia",
      description: "Fitur ini akan tersedia di versi mendatang",
    });
  };
  
  const handleAddCategory = () => {
    if (!newCategory.name) {
      toast({
        title: "Error",
        description: "Nama kategori tidak boleh kosong",
        variant: "destructive"
      });
      return;
    }
    
    addCategory(newCategory);
    setNewCategory({
      name: '',
      type: 'expense',
      color: '#48BB78',
      icon: 'tag'
    });
    
    toast({
      title: "Berhasil",
      description: "Kategori baru telah ditambahkan",
    });
  };
  
  const handleUpdateCategory = () => {
    if (!editCategory || !editCategory.name) {
      toast({
        title: "Error",
        description: "Nama kategori tidak boleh kosong",
        variant: "destructive"
      });
      return;
    }
    
    updateCategory(editCategory);
    setEditCategory(null);
    
    toast({
      title: "Berhasil",
      description: "Kategori telah diperbarui",
    });
  };
  
  const handleDeleteCategory = (categoryId: string) => {
    deleteCategory(categoryId);
    toast({
      title: "Berhasil",
      description: "Kategori telah dihapus",
    });
  };
  
  const colorOptions = [
    { value: '#48BB78', label: 'Hijau' },
    { value: '#F56565', label: 'Merah' },
    { value: '#4299E1', label: 'Biru' },
    { value: '#ECC94B', label: 'Kuning' },
    { value: '#9F7AEA', label: 'Ungu' },
    { value: '#ED8936', label: 'Oranye' },
    { value: '#38B2AC', label: 'Teal' },
  ];
  
  const iconOptions = [
    { value: 'tag', label: 'Tag' },
    { value: 'shopping-bag', label: 'Belanja' },
    { value: 'utensils', label: 'Makanan' },
    { value: 'car', label: 'Transportasi' },
    { value: 'home', label: 'Rumah' },
    { value: 'film', label: 'Hiburan' },
    { value: 'heart', label: 'Kesehatan' },
    { value: 'file-invoice', label: 'Tagihan' },
    { value: 'wallet', label: 'Gaji' },
    { value: 'gift', label: 'Hadiah' },
    { value: 'chart-line', label: 'Investasi' },
  ];

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
                checked={resolvedTheme === 'dark'}
                onCheckedChange={(checked) => {
                  setTheme(checked ? 'dark' : 'light');
                }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="show-financial-facilities" className="flex flex-col space-y-1">
                <span>Tampilkan Fasilitas Keuangan</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Tampilkan menu fasilitas keuangan di aplikasi
                </span>
              </Label>
              <Switch 
                id="show-financial-facilities" 
                checked={appSettings.showFinancialFacilities}
                onCheckedChange={handleToggleFinancialFacilities}
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
        
        {/* Category Management Card - Resized to be narrower */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Manajemen Kategori
            </CardTitle>
            <CardDescription>
              Tambah, edit, dan hapus kategori transaksi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cat-name">Nama Kategori</Label>
                  <Input 
                    id="cat-name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    placeholder="Nama kategori"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cat-type">Tipe</Label>
                  <Select 
                    value={newCategory.type} 
                    onValueChange={(value: "income" | "expense") => setNewCategory({...newCategory, type: value})}
                  >
                    <SelectTrigger id="cat-type">
                      <SelectValue placeholder="Pilih tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Pemasukan</SelectItem>
                      <SelectItem value="expense">Pengeluaran</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cat-color">Warna</Label>
                  <Select 
                    value={newCategory.color} 
                    onValueChange={(value) => setNewCategory({...newCategory, color: value})}
                  >
                    <SelectTrigger id="cat-color">
                      <SelectValue placeholder="Pilih warna" />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map(color => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-2" 
                              style={{backgroundColor: color.value}}
                            />
                            <span>{color.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cat-icon">Ikon</Label>
                  <Select 
                    value={newCategory.icon} 
                    onValueChange={(value) => setNewCategory({...newCategory, icon: value})}
                  >
                    <SelectTrigger id="cat-icon">
                      <SelectValue placeholder="Pilih ikon" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map(icon => (
                        <SelectItem key={icon.value} value={icon.value}>
                          {icon.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={handleAddCategory} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Kategori
              </Button>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2">Daftar Kategori</h4>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Warna</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>{category.name}</TableCell>
                        <TableCell>
                          {category.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                        </TableCell>
                        <TableCell>
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{backgroundColor: category.color}}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setEditCategory(category)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Kategori</DialogTitle>
                                </DialogHeader>
                                {editCategory && (
                                  <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-name">Nama</Label>
                                      <Input 
                                        id="edit-name"
                                        value={editCategory.name}
                                        onChange={(e) => setEditCategory({...editCategory, name: e.target.value})}
                                      />
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-type">Tipe</Label>
                                      <Select 
                                        value={editCategory.type}
                                        onValueChange={(value: "income" | "expense") => 
                                          setEditCategory({...editCategory, type: value})
                                        }
                                      >
                                        <SelectTrigger id="edit-type">
                                          <SelectValue placeholder="Pilih tipe" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="income">Pemasukan</SelectItem>
                                          <SelectItem value="expense">Pengeluaran</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-color">Warna</Label>
                                      <Select 
                                        value={editCategory.color || '#48BB78'}
                                        onValueChange={(value) => 
                                          setEditCategory({...editCategory, color: value})
                                        }
                                      >
                                        <SelectTrigger id="edit-color">
                                          <SelectValue placeholder="Pilih warna" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {colorOptions.map(color => (
                                            <SelectItem key={color.value} value={color.value}>
                                              <div className="flex items-center">
                                                <div 
                                                  className="w-4 h-4 rounded-full mr-2" 
                                                  style={{backgroundColor: color.value}}
                                                />
                                                <span>{color.label}</span>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-icon">Ikon</Label>
                                      <Select 
                                        value={editCategory.icon || 'tag'}
                                        onValueChange={(value) => 
                                          setEditCategory({...editCategory, icon: value})
                                        }
                                      >
                                        <SelectTrigger id="edit-icon">
                                          <SelectValue placeholder="Pilih ikon" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {iconOptions.map(icon => (
                                            <SelectItem key={icon.value} value={icon.value}>
                                              {icon.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                )}
                                <DialogFooter>
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setEditCategory(null)}
                                  >
                                    <X className="mr-2 h-4 w-4" />
                                    Batal
                                  </Button>
                                  <Button 
                                    onClick={handleUpdateCategory}
                                  >
                                    <Check className="mr-2 h-4 w-4" />
                                    Simpan
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
