
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home,
  Wallet,
  BarChart4,
  ListTodo,
  Settings,
  CreditCard,
  Bell,
  User,
  Menu,
  ArrowLeftRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useFinance } from '@/contexts/FinanceContext';
import WalletForm from '@/components/WalletForm';
import TransactionForm from '@/components/TransactionForm';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import { 
  Drawer, 
  DrawerContent, 
  DrawerTrigger, 
  DrawerClose
} from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger 
} from '@/components/ui/dialog';

const Sidebar = () => {
  const { wallets } = useFinance();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Transaksi', path: '/transactions', icon: ListTodo },
    { name: 'Dompet', path: '/wallets', icon: CreditCard },
    { name: 'Laporan', path: '/reports', icon: BarChart4 },
    { name: 'Konversi Mata Uang', path: '/currency-converter', icon: ArrowLeftRight },
    { name: 'Pengaturan', path: '/settings', icon: Settings },
  ];

  const notifications = [
    { id: 1, title: 'Transaksi Baru', message: 'Rp 100.000 ditambahkan ke dompet utama', time: '15 menit yang lalu' },
    { id: 2, title: 'Pengingat Tagihan', message: 'Tagihan listrik akan jatuh tempo besok', time: '1 jam yang lalu' },
    { id: 3, title: 'Target Tabungan', message: 'Anda telah mencapai 75% target tabungan', time: '2 hari yang lalu' },
  ];

  const sidebarContent = (
    <>
      <div className="p-4 flex items-center space-x-2">
        <Wallet className="h-8 w-8 text-finance-teal" />
        <span className="text-xl font-bold bg-gradient-to-r from-finance-teal to-finance-purple bg-clip-text text-transparent">
          UangKita
        </span>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                    isActive
                      ? "bg-finance-teal text-white font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Dompet Saya
          </h3>
          <ul className="mt-2 space-y-1">
            {wallets.map((wallet) => (
              <li key={wallet.id}>
                <NavLink
                  to={`/wallet/${wallet.id}`}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-between px-3 py-2 rounded-md transition-colors",
                      isActive
                        ? "bg-gray-100 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    )
                  }
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full bg-finance-${wallet.color || 'teal'}`}></div>
                    <span>{wallet.name}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {wallet.balance.toLocaleString('id-ID', {
                      style: 'currency',
                      currency: wallet.currency,
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="p-4 border-t">
        {/* Add Wallet Dialog or Drawer based on device */}
        {isMobile ? (
          <Drawer>
            <DrawerTrigger asChild>
              <Button className="w-full bg-gradient-to-r from-finance-teal to-finance-purple hover:from-finance-teal/90 hover:to-finance-purple/90">
                <CreditCard className="mr-2 h-4 w-4" /> Tambah Dompet
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="p-4">
                <WalletForm 
                  trigger={null}
                  onSuccess={() => {
                    const drawerCloseEl = document.querySelector('[data-drawer-close]');
                    if (drawerCloseEl && 'click' in drawerCloseEl) {
                      (drawerCloseEl as HTMLElement).click();
                    }
                  }}
                />
              </div>
              <DrawerClose className="sr-only">Close</DrawerClose>
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full bg-gradient-to-r from-finance-teal to-finance-purple hover:from-finance-teal/90 hover:to-finance-purple/90">
                <CreditCard className="mr-2 h-4 w-4" /> Tambah Dompet
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <WalletForm trigger={null} />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );

  // For mobile, we'll use a sheet that slides in
  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-40 bg-white shadow-md flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 sm:w-80 p-0">
                <div className="flex flex-col h-full overflow-hidden">
                  {sidebarContent}
                </div>
                <SheetClose className="sr-only">Close</SheetClose>
              </SheetContent>
            </Sheet>
            <div className="flex items-center">
              <Wallet className="h-6 w-6 text-finance-teal" />
              <span className="text-lg font-bold bg-gradient-to-r from-finance-teal to-finance-purple bg-clip-text text-transparent ml-2">
                UangKita
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Add Transaction Button for Mobile */}
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon" className="text-finance-teal">
                  <ListTodo className="h-5 w-5" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="p-4 max-h-[85vh] overflow-y-auto">
                  <TransactionForm 
                    onSuccess={() => {
                      const drawerCloseEl = document.querySelector('[data-drawer-close]');
                      if (drawerCloseEl && 'click' in drawerCloseEl) {
                        (drawerCloseEl as HTMLElement).click();
                      }
                    }}
                  />
                </div>
                <DrawerClose className="sr-only">Close</DrawerClose>
              </DrawerContent>
            </Drawer>

            {/* Notifications */}
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="p-4 max-h-[80vh] overflow-y-auto">
                  <h3 className="font-bold text-lg mb-4">Notifikasi</h3>
                  {notifications.length > 0 ? (
                    <div className="space-y-3">
                      {notifications.map(notification => (
                        <div key={notification.id} className="p-3 border rounded-lg">
                          <div className="font-medium">{notification.title}</div>
                          <div className="text-sm text-gray-600">{notification.message}</div>
                          <div className="text-xs text-gray-400 mt-1">{notification.time}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">Tidak ada notifikasi</p>
                  )}
                </div>
                <DrawerClose className="sr-only">Close</DrawerClose>
              </DrawerContent>
            </Drawer>

            {/* Profile Link */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/profile')}
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Add padding to push content below the fixed header */}
        <div className="h-16"></div>
      </>
    );
  }

  // For desktop, we'll use a traditional sidebar
  return (
    <>
      <aside className="hidden md:flex flex-col w-64 bg-white shadow-md z-20">
        {sidebarContent}
      </aside>
      
      {/* Fixed header for desktop - notifications and profile */}
      <div className="hidden md:block fixed top-4 right-4 z-30">
        <div className="flex items-center space-x-2">
          {/* Add Transaction Button for Desktop */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center">
                <ListTodo className="h-4 w-4 mr-2" />
                Tambah Transaksi
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <TransactionForm />
            </DialogContent>
          </Dialog>
          
          {/* Notifications */}
          <Dialog open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <h3 className="font-bold text-lg mb-4">Notifikasi</h3>
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map(notification => (
                    <div key={notification.id} className="p-3 border rounded-lg">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-gray-600">{notification.message}</div>
                      <div className="text-xs text-gray-400 mt-1">{notification.time}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">Tidak ada notifikasi</p>
              )}
            </DialogContent>
          </Dialog>
          
          {/* Profile Link */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/profile')}
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
