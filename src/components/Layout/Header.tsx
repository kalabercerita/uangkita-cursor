
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useFinance } from '@/contexts/FinanceContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Transaction } from '@/types';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{
    transactions: Transaction[];
    wallets: any[];
    categories: any[];
  }>({
    transactions: [],
    wallets: [],
    categories: [],
  });
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { transactions, wallets, categories } = useFinance();
  const [notifications, setNotifications] = useState<{id: string, title: string, message: string, date: Date}[]>([]);

  // Load profile image from sessionStorage
  useEffect(() => {
    const loadProfileImage = () => {
      const savedImage = sessionStorage.getItem('profileImage') || localStorage.getItem('profileImage');
      if (savedImage) {
        setProfileImage(savedImage);
      }
    };

    loadProfileImage();

    // Listen for profile image updates
    const handleProfileImageUpdate = () => {
      loadProfileImage();
    };

    window.addEventListener('profileImageUpdated', handleProfileImageUpdate);

    return () => {
      window.removeEventListener('profileImageUpdated', handleProfileImageUpdate);
    };
  }, []);

  // Generate mock notifications on component mount
  useEffect(() => {
    if (transactions.length > 0) {
      // Generate notifications from the last 5 transactions
      const transactionNotifications = transactions
        .slice(0, 5)
        .map(transaction => ({
          id: transaction.id,
          title: transaction.type === 'income' ? 'Pemasukan Baru' : 'Pengeluaran Baru',
          message: `${transaction.description}: ${new Intl.NumberFormat('id-ID', { 
            style: 'currency', 
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(transaction.amount)}`,
          date: new Date(transaction.date)
        }));

      setNotifications(transactionNotifications);
    }
  }, [transactions]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (term.length < 2) {
      setShowSearchResults(false);
      return;
    }
    
    const lowerTerm = term.toLowerCase();
    
    // Search transactions
    const matchedTransactions = transactions.filter(transaction => 
      transaction.description.toLowerCase().includes(lowerTerm)
    ).slice(0, 5);
    
    // Search wallets
    const matchedWallets = wallets.filter(wallet => 
      wallet.name.toLowerCase().includes(lowerTerm)
    );
    
    // Search categories
    const matchedCategories = categories.filter(category => 
      category.name.toLowerCase().includes(lowerTerm)
    );
    
    setSearchResults({
      transactions: matchedTransactions,
      wallets: matchedWallets,
      categories: matchedCategories
    });
    
    setShowSearchResults(true);
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast({
        title: 'Berhasil logout',
        description: 'Anda telah keluar dari aplikasi',
      });
    } catch (error) {
      toast({
        title: 'Gagal logout',
        description: 'Terjadi kesalahan, silakan coba lagi',
        variant: 'destructive',
      });
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigateToSearchResult = (path: string) => {
    navigate(path);
    setShowSearchResults(false);
    setSearchTerm('');
  };

  const getInitials = (email: string) => {
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <div className="flex items-center space-x-2 md:space-x-4">
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle menu</span>
          </Button>
          
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">UangKita</span>
          </Link>
        </div>

        <div className="flex-1 md:ml-6">
          <div className="relative hidden md:block max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari transaksi, dompet, kategori..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-full"
            />
            
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-lg rounded-b-lg border mt-1 max-h-[70vh] overflow-y-auto z-50">
                {searchResults.transactions.length === 0 && 
                 searchResults.wallets.length === 0 && 
                 searchResults.categories.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Tidak ada hasil yang ditemukan
                  </div>
                ) : (
                  <>
                    {searchResults.transactions.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                          Transaksi
                        </div>
                        {searchResults.transactions.map(transaction => (
                          <div 
                            key={transaction.id}
                            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer flex justify-between"
                            onClick={() => handleNavigateToSearchResult('/transactions')}
                          >
                            <div>
                              <div className="font-medium">{transaction.description}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(new Date(transaction.date))}
                              </div>
                            </div>
                            <div className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {searchResults.wallets.length > 0 && (
                      <div className="p-2 border-t">
                        <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                          Dompet
                        </div>
                        {searchResults.wallets.map(wallet => (
                          <div 
                            key={wallet.id}
                            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer"
                            onClick={() => handleNavigateToSearchResult(`/wallets/${wallet.id}`)}
                          >
                            <div className="font-medium">{wallet.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatCurrency(wallet.balance)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {searchResults.categories.length > 0 && (
                      <div className="p-2 border-t">
                        <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                          Kategori
                        </div>
                        {searchResults.categories.map(category => (
                          <div 
                            key={category.id}
                            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer"
                            onClick={() => handleNavigateToSearchResult('/transactions')}
                          >
                            <div className="font-medium">{category.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {category.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/search')}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
          
          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {notifications.length}
                  </span>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b">
                <div className="font-semibold">Notifikasi</div>
                <div className="text-sm text-muted-foreground">
                  Aktivitas transaksi terbaru Anda
                </div>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Tidak ada notifikasi
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div key={notification.id} className="border-b last:border-0">
                      <div 
                        className="p-4 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => navigate('/transactions')}
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-medium">{notification.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(notification.date)}
                          </div>
                        </div>
                        <div className="text-sm mt-1">{notification.message}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {notifications.length > 0 && (
                <div className="p-3 border-t text-center">
                  <Button 
                    variant="ghost" 
                    className="text-sm w-full"
                    onClick={() => navigate('/transactions')}
                  >
                    Lihat Semua Transaksi
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          
          {/* User Profile/Login */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profileImage || ''} alt={user.email || 'User'} />
                    <AvatarFallback className="bg-finance-teal text-white">
                      {getInitials(user.email || '')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Pengaturan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" onClick={() => navigate('/login')}>
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
