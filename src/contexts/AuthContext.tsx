
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { User } from '@/types';
import { supabase } from "@/integrations/supabase/client";
import { Session } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  loginWithGoogle: async () => {},
  register: async () => {},
  logout: async () => {},
  updatePassword: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing session on load
  useEffect(() => {
    // Set up the auth state change listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event, newSession);
        setSession(newSession);
        setUser(newSession?.user ? {
          id: newSession.user.id,
          email: newSession.user.email || '',
          name: newSession.user.user_metadata?.name || newSession.user.email?.split('@')[0] || ''
        } : null);
      }
    );
    
    // Check for existing session
    const getInitialSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession) {
          setSession(initialSession);
          setUser({
            id: initialSession.user.id,
            email: initialSession.user.email || '',
            name: initialSession.user.user_metadata?.name || initialSession.user.email?.split('@')[0] || ''
          });
        }
      } catch (error) {
        console.error('Error getting session:', error);
        toast({
          title: "Error",
          description: "Gagal memuat data sesi",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    getInitialSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Specifically handle email confirmation error
        if (error.message.includes('Email not confirmed')) {
          toast({
            title: "Konfirmasi email diperlukan",
            description: "Silakan cek email Anda untuk tautan konfirmasi",
            variant: "default",
          });
        } else {
          toast({
            title: "Login gagal",
            description: "Email atau password tidak valid",
            variant: "destructive",
          });
        }
        throw error;
      }
      
      if (!data.session) {
        toast({
          title: "Login gagal",
          description: "Silakan cek email untuk konfirmasi akun",
          variant: "default",
        });
        throw new Error('Email not confirmed');
      }
      
      toast({
        title: "Login berhasil",
        description: "Selamat datang kembali!",
      });

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;
      
      // No need for toast here as we're redirecting to Google
      
    } catch (error) {
      console.error('Google login error:', error);
      toast({
        title: "Login gagal",
        description: "Gagal login dengan Google",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0]
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (error) throw error;
      
      toast({
        title: "Registrasi berhasil",
        description: "Akun Anda telah dibuat, silakan periksa email Anda untuk verifikasi",
      });

    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registrasi gagal",
        description: "Tidak dapat membuat akun Anda",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: "Logout berhasil",
        description: "Anda telah keluar dari aplikasi",
      });

    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout gagal",
        description: "Terjadi masalah saat mencoba keluar",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setIsLoading(true);
      
      // First verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword
      });
      
      if (signInError) {
        throw new Error("Password saat ini tidak valid");
      }
      
      // Update to the new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Password diperbarui",
        description: "Password Anda telah berhasil diperbarui",
      });
      
    } catch (error) {
      console.error('Password update error:', error);
      toast({
        title: "Gagal memperbarui password",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat memperbarui password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        register,
        logout,
        updatePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
