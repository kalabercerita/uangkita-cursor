

import { supabase } from "@/integrations/supabase/client";
import { Category } from '@/types';
import { DbCategory } from '@/utils/supabase-types';
import { ToastType } from './types';

export const loadCategories = async () => {
  const { data: categoriesData, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .order('name') as { data: DbCategory[] | null; error: any };
  
  if (categoriesError) throw categoriesError;
  
  return categoriesData || [];
};

export const addCategoryOperation = async (
  categoryData: Omit<Category, 'id' | 'userId'>, 
  userId: string,
  showToast: ToastType
) => {
  try {
    const newCategoryData = {
      name: categoryData.name,
      type: categoryData.type,
      color: categoryData.color,
      icon: categoryData.icon,
      user_id: userId,
    };
    
    const { data, error } = await supabase
      .from('categories')
      .insert(newCategoryData)
      .select()
      .single() as { data: DbCategory | null; error: any };
    
    if (error) throw error;
    
    if (data) {
      const newCategory: Category = {
        id: data.id,
        name: data.name,
        type: data.type as 'income' | 'expense',
        color: data.color,
        icon: data.icon,
        userId: data.user_id
      };
      
      showToast({
        title: "Kategori ditambahkan",
        description: `${categoryData.name} telah ditambahkan ke kategori Anda`,
      });

      return newCategory;
    }
    return null;
  } catch (error) {
    console.error('Error adding category:', error);
    showToast({
      title: "Gagal menambahkan kategori",
      description: "Terjadi kesalahan saat mencoba menambahkan kategori baru",
      variant: "destructive",
    });
    throw error;
  }
};

export const updateCategoryOperation = async (category: Category, showToast: ToastType) => {
  try {
    const { error } = await supabase
      .from('categories')
      .update({
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon
      })
      .eq('id', category.id) as { error: any };
    
    if (error) throw error;
    
    showToast({
      title: "Kategori diperbarui",
      description: `${category.name} telah diperbarui`,
    });

    return category;
  } catch (error) {
    console.error('Error updating category:', error);
    showToast({
      title: "Gagal memperbarui kategori",
      description: "Terjadi kesalahan saat mencoba memperbarui kategori",
      variant: "destructive",
    });
    throw error;
  }
};

export const deleteCategoryOperation = async (
  categoryId: string, 
  transactions: any[],
  showToast: ToastType
) => {
  try {
    // Check if category is in use
    const inUse = transactions.some(t => t.categoryId === categoryId);
    
    if (inUse) {
      showToast({
        title: "Tidak dapat menghapus kategori",
        description: "Kategori ini sedang digunakan oleh transaksi",
        variant: "destructive",
      });
      return false;
    }
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId) as { error: any };
    
    if (error) throw error;
    
    showToast({
      title: "Kategori dihapus",
      description: "Kategori telah dihapus",
    });

    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    showToast({
      title: "Gagal menghapus kategori",
      description: "Terjadi kesalahan saat mencoba menghapus kategori",
      variant: "destructive",
    });
    throw error;
  }
};

