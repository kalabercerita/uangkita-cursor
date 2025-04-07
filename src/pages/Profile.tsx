
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-3xl font-bold mb-6">Profil Pengguna</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p>{user?.email || 'Belum login'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">ID Pengguna</p>
              <p>{user?.id || 'Belum login'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
