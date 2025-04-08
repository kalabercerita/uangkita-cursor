
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Palette, 
  KeyRound, 
  User, 
  Trash2, 
  Plus, 
  Settings as SettingsIcon,
  Tag
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { useFinance } from '@/contexts/FinanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types';

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password must be at least 6 characters'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Category schema
const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['income', 'expense']),
  color: z.string(),
  icon: z.string().optional(),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;
type CategoryFormValues = z.infer<typeof categorySchema>;

const themes = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const colorOptions = [
  { value: '#48BB78', label: 'Green' },
  { value: '#F56565', label: 'Red' },
  { value: '#4299E1', label: 'Blue' },
  { value: '#ECC94B', label: 'Yellow' },
  { value: '#9F7AEA', label: 'Purple' },
  { value: '#ED8936', label: 'Orange' },
  { value: '#38B2AC', label: 'Teal' },
  { value: '#A0AEC0', label: 'Gray' },
];

const iconOptions = [
  { value: 'shopping-bag', label: 'Shopping' },
  { value: 'utensils', label: 'Food' },
  { value: 'home', label: 'Home' },
  { value: 'car', label: 'Transport' },
  { value: 'heart', label: 'Health' },
  { value: 'film', label: 'Entertainment' },
  { value: 'file-invoice', label: 'Bills' },
  { value: 'wallet', label: 'Salary' },
  { value: 'gift', label: 'Gift' },
  { value: 'chart-line', label: 'Investments' },
];

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const { categories, addCategory, updateCategory, deleteCategory, transactions } = useFinance();
  
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [isDeleteCategoryOpen, setIsDeleteCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Get current theme from localStorage or default to 'light'
    return localStorage.getItem('theme') || 'light';
  });

  // Password change form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Category form
  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'expense',
      color: '#48BB78',
      icon: 'shopping-bag',
    },
  });

  // Edit category form
  const editCategoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'expense',
      color: '#48BB78',
      icon: 'shopping-bag',
    },
  });

  // Password change handler
  const onPasswordChange = async (data: PasswordFormValues) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been successfully updated",
      });

      passwordForm.reset();
    } catch (error: any) {
      console.error('Password change error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    }
  };

  // Theme change handler
  const handleThemeChange = (value: string) => {
    setCurrentTheme(value);
    localStorage.setItem('theme', value);
    
    // Apply theme to document
    if (value === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    toast({
      title: "Theme updated",
      description: `Theme switched to ${value} mode`,
    });
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(user?.id || '');
      
      if (error) throw error;
      
      await logout();
      navigate('/login');
      
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted",
      });
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
      setIsDeleteAccountOpen(false);
    }
  };

  // Add category handler
  const onAddCategory = async (data: CategoryFormValues) => {
    try {
      await addCategory({
        name: data.name,
        type: data.type,
        color: data.color,
        icon: data.icon || 'tag',
      });
      
      setIsAddCategoryOpen(false);
      categoryForm.reset();
      
      toast({
        title: "Category added",
        description: `${data.name} has been added to your categories`,
      });
    } catch (error: any) {
      console.error('Add category error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add category",
        variant: "destructive",
      });
    }
  };

  // Edit category handler
  const onEditCategory = async (data: CategoryFormValues) => {
    if (!selectedCategory) return;
    
    try {
      await updateCategory({
        ...selectedCategory,
        name: data.name,
        type: data.type,
        color: data.color,
        icon: data.icon || 'tag',
      });
      
      setIsEditCategoryOpen(false);
      setSelectedCategory(null);
      
      toast({
        title: "Category updated",
        description: `${data.name} has been updated`,
      });
    } catch (error: any) {
      console.error('Edit category error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive",
      });
    }
  };

  // Delete category handler
  const onDeleteCategory = async () => {
    if (!selectedCategory) return;
    
    try {
      await deleteCategory(selectedCategory.id);
      
      setIsDeleteCategoryOpen(false);
      setSelectedCategory(null);
      
      toast({
        title: "Category deleted",
        description: `${selectedCategory.name} has been deleted`,
      });
    } catch (error: any) {
      console.error('Delete category error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  // Open edit category dialog
  const openEditCategory = (category: Category) => {
    setSelectedCategory(category);
    editCategoryForm.reset({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon,
    });
    setIsEditCategoryOpen(true);
  };

  // Open delete category dialog
  const openDeleteCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteCategoryOpen(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <SettingsIcon className="h-6 w-6 text-muted-foreground" />
      </div>

      <Tabs defaultValue="categories">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="categories">
            <Tag className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="theme">
            <Palette className="h-4 w-4 mr-2" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="password">
            <KeyRound className="h-4 w-4 mr-2" />
            Password
          </TabsTrigger>
          <TabsTrigger value="account">
            <User className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Categories</CardTitle>
                <CardDescription>
                  Manage your income and expense categories
                </CardDescription>
              </div>
              <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-finance-teal to-finance-purple hover:from-finance-teal/90 hover:to-finance-purple/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Category</DialogTitle>
                    <DialogDescription>
                      Create a new category for your transactions.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...categoryForm}>
                    <form onSubmit={categoryForm.handleSubmit(onAddCategory)} className="space-y-4">
                      <FormField
                        control={categoryForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Category name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={categoryForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="income">Income</SelectItem>
                                <SelectItem value="expense">Expense</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={categoryForm.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color</FormLabel>
                            <div className="grid grid-cols-4 gap-2">
                              {colorOptions.map((color) => (
                                <div 
                                  key={color.value} 
                                  className={`h-8 rounded-md cursor-pointer border-2 transition-all ${
                                    field.value === color.value ? 'border-black dark:border-white scale-110' : 'border-transparent'
                                  }`}
                                  style={{ backgroundColor: color.value }}
                                  onClick={() => field.onChange(color.value)}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={categoryForm.control}
                        name="icon"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Icon</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select icon" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {iconOptions.map((icon) => (
                                  <SelectItem key={icon.value} value={icon.value}>
                                    {icon.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit">Add Category</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Income Categories</h3>
                <div className="grid gap-2">
                  {categories
                    .filter((cat) => cat.type === 'income')
                    .map((category) => (
                      <div 
                        key={category.id} 
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                      >
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: category.color }}
                          >
                            <Tag className="h-4 w-4 text-white" />
                          </div>
                          <span>{category.name}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openEditCategory(category)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-500 hover:text-red-700" 
                            onClick={() => openDeleteCategory(category)}
                            disabled={transactions.some(t => t.categoryId === category.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>

                <h3 className="text-lg font-medium pt-4">Expense Categories</h3>
                <div className="grid gap-2">
                  {categories
                    .filter((cat) => cat.type === 'expense')
                    .map((category) => (
                      <div 
                        key={category.id} 
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                      >
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: category.color }}
                          >
                            <Tag className="h-4 w-4 text-white" />
                          </div>
                          <span>{category.name}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openEditCategory(category)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-500 hover:text-red-700" 
                            onClick={() => openDeleteCategory(category)}
                            disabled={transactions.some(t => t.categoryId === category.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Category Dialog */}
          <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogDescription>
                  Update this category's details.
                </DialogDescription>
              </DialogHeader>
              <Form {...editCategoryForm}>
                <form onSubmit={editCategoryForm.handleSubmit(onEditCategory)} className="space-y-4">
                  <FormField
                    control={editCategoryForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Category name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editCategoryForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editCategoryForm.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <div className="grid grid-cols-4 gap-2">
                          {colorOptions.map((color) => (
                            <div 
                              key={color.value} 
                              className={`h-8 rounded-md cursor-pointer border-2 transition-all ${
                                field.value === color.value ? 'border-black dark:border-white scale-110' : 'border-transparent'
                              }`}
                              style={{ backgroundColor: color.value }}
                              onClick={() => field.onChange(color.value)}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editCategoryForm.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select icon" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {iconOptions.map((icon) => (
                              <SelectItem key={icon.value} value={icon.value}>
                                {icon.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Update Category</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Delete Category Dialog */}
          <AlertDialog open={isDeleteCategoryOpen} onOpenChange={setIsDeleteCategoryOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  {transactions.some(t => t?.categoryId === selectedCategory?.id) 
                    ? "This category can't be deleted because it's used in transactions."
                    : "This action cannot be undone. This will permanently delete this category."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDeleteCategory}
                  className="bg-red-500 hover:bg-red-600"
                  disabled={transactions.some(t => t?.categoryId === selectedCategory?.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        {/* Theme Tab */}
        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>
                Customize the appearance of the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Color Theme</h3>
                  <RadioGroup 
                    value={currentTheme} 
                    onValueChange={handleThemeChange}
                    className="grid grid-cols-3 gap-4"
                  >
                    {themes.map((theme) => (
                      <div key={theme.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={theme.value} id={theme.value} />
                        <label htmlFor={theme.value} className="cursor-pointer">
                          {theme.label}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your account password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordChange)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Update Password
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Permanently delete your account and all your data
                </p>
                <Button 
                  variant="destructive" 
                  onClick={() => setIsDeleteAccountOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Delete Account Dialog */}
      <AlertDialog open={isDeleteAccountOpen} onOpenChange={setIsDeleteAccountOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
