import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import { FinanceProvider } from "./contexts/FinanceContext";
import AppLayout from "./components/Layout/AppLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import WalletDetail from "./pages/WalletDetail";
import Profile from "./pages/Profile";
import FinancialFacilities from "./components/FinancialFacilities";
import Wallets from "./pages/Wallets";
import Settings from "./pages/Settings";
import Index from "./pages/Index";

// Initialize QueryClient inside the component to ensure it's created during rendering
const App = () => {
  const queryClient = React.useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false, // Don't refetch on window focus for better performance
      },
    },
  }), []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <FinanceProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner position="top-right" />
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
                  <Route path="/transactions" element={<AppLayout><Transactions /></AppLayout>} />
                  <Route path="/reports" element={<AppLayout><Reports /></AppLayout>} />
                  <Route path="/wallets" element={<AppLayout><Wallets /></AppLayout>} />
                  <Route path="/wallet/:walletId" element={<AppLayout><WalletDetail /></AppLayout>} />
                  <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
                  <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
                  <Route path="/currency-converter" element={<AppLayout><FinancialFacilities /></AppLayout>} />
                  
                  <Route path="/index" element={<Index />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </FinanceProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
