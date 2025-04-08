import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, KeyRound, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Validasi Gagal",
        description: "Semua kolom harus diisi",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Validasi Gagal",
        description: "Kata sandi baru dan konfirmasi tidak sama",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsChangingPassword(true);
      // This is a placeholder - you'll need to implement the real functionality
      // once connected to a backend like Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Berhasil",
        description: "Kata sandi telah diubah",
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Gagal mengubah kata sandi",
        variant: "destructive"
      });
      setIsChangingPassword(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      setIsUploading(true);
      
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        setIsUploading(false);
        toast({
          title: "Berhasil",
          description: "Foto profil telah diperbarui",
        });
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Gagal keluar dari aplikasi",
        variant: "destructive"
      });
    }
  };

  const getInitials = (email: string) => {
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-3xl font-bold mb-6">Profil Pengguna</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Akun</CardTitle>
            <CardDescription>Lihat dan perbarui informasi profil Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileImage || ''} alt={user?.email || 'Pengguna'} />
                  <AvatarFallback className="bg-finance-teal text-white text-2xl">
                    {getInitials(user?.email || '')}
                  </AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="profile-image" 
                  className="absolute bottom-0 right-0 rounded-full bg-finance-teal p-2 text-white cursor-pointer shadow-md hover:bg-finance-teal/90 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  <span className="sr-only">Unggah Foto</span>
                </label>
                <input 
                  id="profile-image" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </div>
              {isUploading && <p className="text-sm text-muted-foreground">Mengunggah...</p>}
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ''} readOnly className="bg-gray-50" />
              </div>
              <div>
                <Label htmlFor="user-id">ID Pengguna</Label>
                <Input id="user-id" value={user?.id || ''} readOnly className="bg-gray-50" />
              </div>
              
              <Button 
                onClick={handleLogout}
                className="w-full bg-red-500 hover:bg-red-600 text-white"
                variant="destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Keluar dari Aplikasi
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Ubah Kata Sandi
            </CardTitle>
            <CardDescription>Perbarui kata sandi akun Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="current-password">Kata Sandi Saat Ini</Label>
                <Input 
                  id="current-password" 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="new-password">Kata Sandi Baru</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Konfirmasi Kata Sandi</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-finance-teal to-finance-purple"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
