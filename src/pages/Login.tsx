
import React, { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

// Define form schema
const loginFormSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter' }),
});

const resetPasswordFormSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid' }),
});

const Login = () => {
  const location = useLocation();
  const { login, loginWithGoogle, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "reset">("login");
  const [googleError, setGoogleError] = useState<string | null>(null);
  
  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const resetPasswordForm = useForm<z.infer<typeof resetPasswordFormSchema>>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      email: '',
    },
  });
  
  const onSubmitLogin = async (data: z.infer<typeof loginFormSchema>) => {
    try {
      setIsSubmitting(true);
      await login(data.email, data.password);
      // If we got here without error but not redirected, 
      // it might be because the email confirmation is pending
      setEmailSent(true);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error?.message?.includes('Email not confirmed')) {
        setEmailSent(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitResetPassword = async (data: z.infer<typeof resetPasswordFormSchema>) => {
    try {
      setIsSubmitting(true);
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setResetEmailSent(true);
      resetPasswordForm.reset();
      
      toast({
        title: "Email terkirim",
        description: "Silakan cek email Anda untuk melanjutkan proses reset password",
      });
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast({
        title: "Gagal mengirim email",
        description: error?.message || "Terjadi kesalahan saat mengirim email reset password",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      setGoogleError(null);
      
      // Get the current origin for proper redirect
      const currentOrigin = window.location.origin;
      const redirectTo = `${currentOrigin}/`;
      
      console.log("Starting Google login with redirect to:", redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('Google OAuth error:', error);
        setGoogleError(error.message);
        throw error;
      }
      
      console.log("Google login initiated, data:", data);
      // No need for toast here as we're redirecting to Google
      
    } catch (error: any) {
      console.error('Google login error:', error);
      setGoogleError(error?.message || 'Error connecting to Google');
      toast({
        title: "Login gagal",
        description: "Gagal login dengan Google: " + (error?.message || "Kesalahan jaringan"),
        variant: "destructive",
      });
    }
  };
  
  // Check for error in URL params (after returning from Google auth)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    if (error) {
      console.error('OAuth error from URL:', error, errorDescription);
      setGoogleError(errorDescription || 'Error connecting to Google');
      toast({
        title: "Login gagal",
        description: errorDescription || "Terjadi masalah dengan autentikasi Google",
        variant: "destructive",
      });
    }
  }, [location, toast]);
  
  // Redirect if already logged in
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-finance-purple/20 to-finance-teal/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">UangKita</CardTitle>
          <CardDescription>Masuk ke akun Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "reset")}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="reset">Lupa Password</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              {emailSent && (
                <Alert className="mb-4 bg-amber-50 text-amber-800 border-amber-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Konfirmasi Email Diperlukan</AlertTitle>
                  <AlertDescription>
                    Kami telah mengirimkan email konfirmasi ke alamat email Anda. 
                    Silakan cek inbox atau folder spam dan klik link konfirmasi untuk menyelesaikan proses login.
                  </AlertDescription>
                </Alert>
              )}
              
              {googleError && (
                <Alert className="mb-4 bg-red-50 text-red-800 border-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Login Google Gagal</AlertTitle>
                  <AlertDescription>
                    {googleError}
                  </AlertDescription>
                </Alert>
              )}

              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onSubmitLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@domain.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="******" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-finance-teal to-finance-purple"
                    disabled={isSubmitting || isLoading}
                  >
                    {isSubmitting ? 'Loading...' : 'Masuk'}
                  </Button>
                </form>
              </Form>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Atau</span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Login dengan Google
              </Button>
            </TabsContent>

            <TabsContent value="reset">
              {resetEmailSent && (
                <Alert className="mb-4 bg-teal-50 text-teal-800 border-teal-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Email Reset Password Terkirim</AlertTitle>
                  <AlertDescription>
                    Kami telah mengirimkan tautan reset password ke email Anda.
                    Silakan cek inbox atau folder spam Anda untuk melanjutkan proses reset password.
                  </AlertDescription>
                </Alert>
              )}

              <Form {...resetPasswordForm}>
                <form onSubmit={resetPasswordForm.handleSubmit(onSubmitResetPassword)} className="space-y-4">
                  <FormField
                    control={resetPasswordForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="email@domain.com" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-finance-teal to-finance-purple"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Mengirim...' : 'Kirim Link Reset Password'}
                  </Button>
                </form>
              </Form>

              <p className="text-sm text-muted-foreground mt-4">
                Kami akan mengirimkan tautan reset password ke alamat email yang terdaftar.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-muted-foreground w-full">
            Belum punya akun? <Link to="/register" className="underline text-blue-600">Daftar</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
