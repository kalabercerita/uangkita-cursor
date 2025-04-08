
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { User } from '@/types';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  // Adding a stub for password update - would be implemented with a real backend
  updatePassword?: (currentPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing session on load
  useEffect(() => {
    const checkSession = () => {
      // Mock auth for now - will be replaced with Supabase
      const savedUser = localStorage.getItem('finnyUser');
      
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Failed to parse saved user:', error);
          localStorage.removeItem('finnyUser');
        }
      }
      
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Mock login - will be replaced with Supabase
      // In a real app, validate credentials against a database
      const mockUser: User = {
        id: '1',
        email: email,
        name: email.split('@')[0]
      };

      setUser(mockUser);
      localStorage.setItem('finnyUser', JSON.stringify(mockUser));
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "Invalid email or password",
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
      
      // Mock registration - will be replaced with Supabase
      const mockUser: User = {
        id: '1',
        email: email,
        name: name || email.split('@')[0]
      };

      setUser(mockUser);
      localStorage.setItem('finnyUser', JSON.stringify(mockUser));
      
      toast({
        title: "Registration successful",
        description: "Your account has been created",
      });

    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: "Could not create your account",
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
      
      // Mock logout - will be replaced with Supabase
      setUser(null);
      localStorage.removeItem('finnyUser');
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });

    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "There was a problem logging you out",
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
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
