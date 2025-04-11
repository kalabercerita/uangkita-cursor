import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ImagePlus, Camera } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinance } from '@/contexts/FinanceContext';
import { cn } from '@/lib/utils';
import { Transaction } from '@/types';
import ReceiptAnalyzer from './ReceiptAnalyzer';

const formSchema = z.object({
  description: z.string().min(2, { message: 'Deskripsi diperlukan' }),
  amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Jumlah harus berupa angka positif',
  }),
  type: z.enum(['income', 'expense', 'transfer']),
  categoryId: z.string({ required_error: 'Silakan pilih kategori' }),
  date: z.date({ required_error: 'Silakan pilih tanggal' }),
  walletId: z.string().optional(),
  receipt: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  walletId?: string;
  transaction?: Transaction;
  onSuccess?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ walletId, transaction, onSuccess }) => {
  const { categories, wallets, addTransaction, updateTransaction } = useFinance();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"manual" | "photo">("manual");
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  const isEditMode = !!transaction;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: transaction?.description || '',
      amount: transaction?.amount.toString() || '',
      type: transaction?.type || 'expense',
      categoryId: transaction?.categoryId || '',
      date: transaction?.date ? new Date(transaction.date) : new Date(),
      walletId: transaction?.walletId || walletId || '',
    },
  });
  
  useEffect(() => {
    if (transaction) {
      form.reset({
        description: transaction.description,
        amount: transaction.amount.toString(),
        type: transaction.type,
        categoryId: transaction.categoryId,
        date: new Date(transaction.date),
        walletId: transaction.walletId,
      });
    }
  }, [transaction, form]);
  
  const selectedType = form.watch('type');
  
  const filteredCategories = categories.filter(category => 
    (selectedType === 'income' || selectedType === 'expense') ? 
    category.type === selectedType : category.type === 'expense');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      form.setValue('receipt', file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          setSelectedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Gagal mengakses kamera. Pastikan kamera perangkat Anda berfungsi dan izin kamera diberikan.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setSelectedImage(imageDataUrl);
        
        stopCamera();
      }
    }
  };

  const handleReceiptAnalysisResult = (result: { description: string, amount: number, date?: Date }) => {
    form.setValue('description', result.description);
    form.setValue('amount', result.amount.toString());
    if (result.date) {
      form.setValue('date', result.date);
    }
    
    const cashWallet = wallets.find(w => w.name.toLowerCase().includes('tunai') || w.name.toLowerCase().includes('cash'));
    if (cashWallet) {
      form.setValue('walletId', cashWallet.id);
    }

    const lowerDescription = result.description.toLowerCase();
    
    const categoryKeywords: Record<string, string[]> = {
      "Makanan": ["makanan", "food", "makan", "resto", "restaurant", "cafe", "kafe", "warteg", "warung", "nasi", "mie", "burger", "pizza", "ayam"],
      "Transportasi": ["transport", "bensin", "BBM", "pertamax", "solar", "parkir", "toll", "busway", "kereta", "train", "bus", "mrt", "grab", "gojek", "ojek", "taxi", "taksi"],
      "Belanja": ["belanja", "shopping", "toko", "supermarket", "mall", "pasar", "market", "baju", "fashion", "sepatu", "tas", "alfamart", "indomaret", "minimarket"],
      "Hiburan": ["hiburan", "entertainment", "movie", "film", "bioskop", "cinema", "konser", "concert", "game", "tiket", "ticket"],
      "Tagihan": ["tagihan", "bill", "listrik", "electricity", "air", "pdam", "internet", "wifi", "pulsa", "telepon", "phone", "gas"],
      "Kesehatan": ["kesehatan", "health", "dokter", "doctor", "rumah sakit", "hospital", "klinik", "clinic", "obat", "medicine", "apotek"]
    };
    
    let matchedCategory = null;
    for (const [categoryName, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerDescription.includes(keyword))) {
        matchedCategory = categories.find(c => c.name === categoryName && c.type === 'expense');
        if (matchedCategory) break;
      }
    }
    
    if (matchedCategory) {
      form.setValue('categoryId', matchedCategory.id);
    }
    
    setActiveTab("manual");
  };
  
  const onSubmit = (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const transactionData = {
        description: values.description,
        amount: parseFloat(values.amount.replace(',', '.')),
        type: values.type,
        categoryId: values.categoryId,
        date: values.date,
        walletId: values.walletId || walletId || '',
      };
      
      if (isEditMode && transaction) {
        updateTransaction({
          ...transaction,
          ...transactionData,
        });
      } else {
        addTransaction(transactionData);
      }
      
      if (!isEditMode) {
        form.reset({
          description: '',
          amount: '',
          type: 'expense',
          categoryId: undefined,
          date: new Date(),
          walletId: walletId || '',
        });
        setSelectedImage(null);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error handling transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  
  return (
    <div className="max-h-[80vh] overflow-y-auto pb-4">
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle>{isEditMode ? 'Edit Transaksi' : 'Tambah Transaksi'}</CardTitle>
          <CardDescription>
            {isEditMode ? 'Perbarui detail transaksi' : 'Catat transaksi baru'}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Tabs defaultValue="manual" value={activeTab} onValueChange={(value) => setActiveTab(value as "manual" | "photo")}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="manual" className="flex-1">Input Manual</TabsTrigger>
              <TabsTrigger value="photo" className="flex-1">Dari Foto</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis Transaksi</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih jenis" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="income">Pemasukan</SelectItem>
                            <SelectItem value="expense">Pengeluaran</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deskripsi</FormLabel>
                        <FormControl>
                          <Input placeholder="mis., Belanja, Gaji" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jumlah</FormLabel>
                        <FormControl>
                          <Input 
                            type="text"
                            inputMode="decimal"
                            placeholder="0"
                            {...field} 
                            onChange={(e) => {
                              const value = e.target.value;
                              const decimalRegex = /^[0-9]*([.,][0-9]*)?$/;
                              if (value === '' || decimalRegex.test(value)) {
                                const normalizedValue = value.replace(',', '.');
                                field.onChange(normalizedValue);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategori</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredCategories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {!walletId && (
                    <FormField
                      control={form.control}
                      name="walletId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dompet</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih dompet" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {wallets.map(wallet => (
                                <SelectItem key={wallet.id} value={wallet.id}>
                                  {wallet.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Tanggal</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd MMMM yyyy")
                                ) : (
                                  <span>Pilih tanggal</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className="pointer-events-auto p-3"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-finance-teal to-finance-purple"
                    disabled={isSubmitting}
                  >
                    {isSubmitting 
                      ? (isEditMode ? 'Memperbarui...' : 'Menambahkan...') 
                      : (isEditMode ? 'Perbarui Transaksi' : 'Tambah Transaksi')}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="photo">
              <div className="space-y-4">
                {cameraActive ? (
                  <div className="relative border rounded-md overflow-hidden">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-auto"
                    />
                    <Button
                      type="button"
                      onClick={capturePhoto}
                      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-3"
                    >
                      <div className="w-12 h-12 rounded-full border-4 border-finance-teal flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-finance-teal"></div>
                      </div>
                    </Button>
                  </div>
                ) : selectedImage ? (
                  <div className="space-y-3">
                    <div className="border rounded-md overflow-hidden">
                      <img 
                        src={selectedImage}
                        alt="Captured receipt" 
                        className="w-full h-auto object-contain"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedImage(null);
                          startCamera();
                        }}
                      >
                        Ambil Ulang
                      </Button>
                      
                      <Button
                        className="flex-1 bg-gradient-to-r from-finance-teal to-finance-purple"
                        onClick={() => {
                          // Process with AI receipt analyzer
                        }}
                      >
                        Gunakan Foto Ini
                      </Button>
                    </div>
                    
                    <ReceiptAnalyzer 
                      imageUrl={selectedImage}
                      onResult={handleReceiptAnalysisResult}
                    />
                  </div>
                ) : (
                  <div className="border rounded-md p-8 flex flex-col items-center gap-4">
                    <ImagePlus className="h-12 w-12 text-muted-foreground" />
                    <p className="text-center text-muted-foreground">
                      Ambil foto struk atau bukti transaksi untuk menganalisis secara otomatis dengan AI
                    </p>
                    
                    <div className="flex flex-col gap-2 w-full">
                      <Button
                        onClick={startCamera}
                        className="w-full bg-gradient-to-r from-finance-teal to-finance-purple"
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Ambil Foto
                      </Button>
                      
                      <div className="relative">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => document.getElementById('receipt-upload')?.click()}
                        >
                          <ImagePlus className="mr-2 h-4 w-4" />
                          Pilih dari Galeri
                        </Button>
                        <input
                          id="receipt-upload"
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={handleImageChange}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionForm;
