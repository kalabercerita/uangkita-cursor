
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home,
  Wallet,
  BarChart4,
  ListTodo,
  Settings,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useFinance } from '@/contexts/FinanceContext';

const Sidebar = () => {
  const { wallets } = useFinance();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Transactions', path: '/transactions', icon: ListTodo },
    { name: 'Wallets', path: '/wallets', icon: CreditCard },
    { name: 'Reports', path: '/reports', icon: BarChart4 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white shadow-md z-20">
      <div className="p-4 flex items-center space-x-2">
        <Wallet className="h-8 w-8 text-finance-teal" />
        <span className="text-xl font-bold bg-gradient-to-r from-finance-teal to-finance-purple bg-clip-text text-transparent">
          FinnyTracker
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
            My Wallets
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
                    {wallet.balance.toLocaleString('en-US', {
                      style: 'currency',
                      currency: wallet.currency,
                    })}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="p-4 border-t">
        <Button className="w-full bg-gradient-to-r from-finance-teal to-finance-purple hover:from-finance-teal/90 hover:to-finance-purple/90">
          <CreditCard className="mr-2 h-4 w-4" /> Add Wallet
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
