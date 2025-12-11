import { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Package, 
  Star, 
  Users, 
  Bell, 
  Settings, 
  Plus,
  Edit,
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  Upload
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';

interface RestaurantDashboardProps {
  onBack: () => void;
  restaurantId?: number; // Optional restaurant ID prop
  restaurantStatus?: string; // Restaurant approval status
  restaurantName?: string; // Restaurant name for approval modal
}

export default function RestaurantDashboard({ onBack, restaurantId, restaurantStatus, restaurantName }: RestaurantDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]); // All orders for stats calculation
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [showAddMenuItemModal, setShowAddMenuItemModal] = useState(false);
  const [showEditMenuItemModal, setShowEditMenuItemModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<any>(null);
  const [savingMenuItem, setSavingMenuItem] = useState(false);
  const [updatingAvailability, setUpdatingAvailability] = useState<number | null>(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Form state for settings
  const [formData, setFormData] = useState({
    restaurantName: '',
    phone: '',
    description: '',
    deliveryFee: '',
    minimumOrder: '',
    preparationTime: '',
    pictureUrl: '',
    imageFile: null as File | null,
    imagePreview: null as string | null,
  });

  // Form state for new menu item
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    isAvailable: true,
    pictureUrl: '',
    imageFile: null as File | null,
    imagePreview: null as string | null,
  });

  // Form state for editing menu item
  const [editMenuItem, setEditMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    isAvailable: true,
    pictureUrl: '',
    imageFile: null as File | null,
    imagePreview: null as string | null,
  });
  
  // Get restaurant ID from localStorage (set during login) or prop
  const [currentRestaurantId, setCurrentRestaurantId] = useState<number | null>(
    restaurantId || parseInt(localStorage.getItem('restaurantId') || '0') || null
  );

  // Operating hours state - will be populated from database
  const [operatingHours, setOperatingHours] = useState({
    monday: { open: '', close: '', closed: true },
    tuesday: { open: '', close: '', closed: true },
    wednesday: { open: '', close: '', closed: true },
    thursday: { open: '', close: '', closed: true },
    friday: { open: '', close: '', closed: true },
    saturday: { open: '', close: '', closed: true },
    sunday: { open: '', close: '', closed: true }
  });

  useEffect(() => {
    // Check localStorage again in case it was set after component mount
    if (!currentRestaurantId) {
      const storedId = localStorage.getItem('restaurantId');
      if (storedId) {
        const id = parseInt(storedId);
        if (id > 0) {
          setCurrentRestaurantId(id);
          return; // Will trigger useEffect again with the ID
        }
      }
    }

    async function fetchRestaurantData() {
      if (!currentRestaurantId || currentRestaurantId === 0) {
        setError('Restaurant ID not found. Please sign in again.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
        
        // Fetch restaurant data (always fetch to show info even if pending)
        const restaurantResponse = await fetch(`${API_BASE_URL}/restaurants/${currentRestaurantId}`);
        if (!restaurantResponse.ok) throw new Error('Failed to fetch restaurant');
        const restaurantData = await restaurantResponse.json();
        const restaurantInfo = restaurantData.restaurant;
        setRestaurant(restaurantInfo);
        
        // Check approval status (from props or fetched data)
        const status = (restaurantStatus || restaurantInfo?.status || 'pending').toLowerCase();
        
        if (status !== 'approved') {
          // Show pending approval page
          setIsPendingApproval(true);
          setLoading(false);
          return;
        }
        
        // Restaurant is approved - check if first login
        const firstLoginKey = `restaurant_${currentRestaurantId}_first_login`;
        const hasLoggedInBefore = localStorage.getItem(firstLoginKey);
        
        if (!hasLoggedInBefore) {
          // Mark as logged in and show approval modal
          localStorage.setItem(firstLoginKey, 'true');
          setShowApprovalModal(true);
        }
        
        // Initialize form data
        setFormData({
          restaurantName: restaurantInfo?.restaurantName || '',
          phone: restaurantInfo?.phone || '',
          description: restaurantInfo?.description || '',
          deliveryFee: restaurantInfo?.deliveryFee?.toString() || '0',
          minimumOrder: restaurantInfo?.minimumOrder?.toString() || '0',
          preparationTime: restaurantInfo?.preparationTime?.toString() || '30',
          pictureUrl: restaurantInfo?.pictureUrl || '',
          imageFile: null,
          imagePreview: restaurantInfo?.pictureUrl || null,
        });

        // Fetch all orders for this restaurant (for stats)
        const ordersResponse = await fetch(`${API_BASE_URL}/orders/restaurant/${currentRestaurantId}`);
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          const orders = ordersData.orders || [];
          setAllOrders(orders);
          // Set recent orders (last 10)
          setRecentOrders(orders.slice(0, 10));
        }

        // Fetch menu items
        const menuResponse = await fetch(`${API_BASE_URL}/restaurants/${currentRestaurantId}/menu`);
        if (menuResponse.ok) {
          const menuData = await menuResponse.json();
          setMenuItems(menuData.menuItems || []);
        }

        // Fetch operating hours
        const hoursResponse = await fetch(`${API_BASE_URL}/restaurants/${currentRestaurantId}/hours`);
        if (hoursResponse.ok) {
          const hoursData = await hoursResponse.json();
          const hours = hoursData.hours || [];
          
          // Map database hours to component state
          const hoursMap: any = {
            monday: { open: '', close: '', closed: true },
            tuesday: { open: '', close: '', closed: true },
            wednesday: { open: '', close: '', closed: true },
            thursday: { open: '', close: '', closed: true },
            friday: { open: '', close: '', closed: true },
            saturday: { open: '', close: '', closed: true },
            sunday: { open: '', close: '', closed: true }
          };
          
          // Backend returns dayOfWeek as string (e.g., "monday") or weekday as number (0-6)
          // Handle both cases for compatibility
          hours.forEach((h: any) => {
            const dayName = h.dayOfWeek || (h.weekday !== undefined ? ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][h.weekday] : null);
            if (dayName && hoursMap[dayName]) {
              hoursMap[dayName] = {
                open: h.openTime || '',
                close: h.closeTime || '',
                closed: h.isClosed || false
              };
            }
          });
          
          setOperatingHours(hoursMap);
        }

        setError(null);
      } catch (err: any) {
        console.error('Error fetching restaurant data:', err);
        setError(err.message || 'Failed to load restaurant data');
      } finally {
        setLoading(false);
      }
    }

    if (currentRestaurantId && currentRestaurantId > 0) {
      fetchRestaurantData();
    }
  }, [currentRestaurantId]);

  // Handle image upload for menu item
  const handleMenuItemImageUpload = async (file: File | null) => {
    if (!file) {
      setNewMenuItem(prev => ({ ...prev, imageFile: null, imagePreview: null, pictureUrl: '' }));
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Create preview URL for immediate display
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewMenuItem(prev => ({ ...prev, imagePreview: reader.result as string, imageFile: file }));
    };
    reader.readAsDataURL(file);

    // Upload image to backend and get URL
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/restaurants/upload-image`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image');
      }

      // Update menu item with the image URL from backend
      setNewMenuItem(prev => ({ ...prev, pictureUrl: data.imageUrl }));
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
      setNewMenuItem(prev => ({ ...prev, imageFile: null, imagePreview: null }));
    }
  };

  // Handle save new menu item
  const handleSaveMenuItem = async () => {
    if (!currentRestaurantId) {
      alert('Restaurant ID not found');
      return;
    }

    if (!newMenuItem.name || !newMenuItem.price) {
      alert('Please fill in all required fields (name and price)');
      return;
    }

    try {
      setSavingMenuItem(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

      const response = await fetch(`${API_BASE_URL}/restaurants/${currentRestaurantId}/menu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newMenuItem.name,
          description: newMenuItem.description || '',
          price: parseFloat(newMenuItem.price),
          isAvailable: newMenuItem.isAvailable,
          pictureUrl: newMenuItem.pictureUrl || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create menu item');
      }

      // Refresh menu items
      const menuResponse = await fetch(`${API_BASE_URL}/restaurants/${currentRestaurantId}/menu`);
      if (menuResponse.ok) {
        const menuData = await menuResponse.json();
        setMenuItems(menuData.menuItems || []);
      }

      // Reset form and close modal
      setNewMenuItem({
        name: '',
        description: '',
        price: '',
        isAvailable: true,
        pictureUrl: '',
        imageFile: null,
        imagePreview: null,
      });
      setShowAddMenuItemModal(false);
      alert('Menu item created successfully!');
    } catch (error: any) {
      console.error('Error creating menu item:', error);
      alert('Failed to create menu item: ' + error.message);
    } finally {
      setSavingMenuItem(false);
    }
  };

  // Handle edit menu item
  const handleEditMenuItem = (item: any) => {
    setEditingMenuItem(item);
    setEditMenuItem({
      name: item.name || '',
      description: item.description || '',
      price: item.price?.toString() || '',
      isAvailable: item.isAvailable !== false,
      pictureUrl: item.imageUrl || '',
      imageFile: null,
      imagePreview: item.imageUrl || null,
    });
    setShowEditMenuItemModal(true);
  };

  // Handle image upload for edit menu item
  const handleEditMenuItemImageUpload = async (file: File | null) => {
    if (!file) {
      setEditMenuItem(prev => ({ ...prev, imageFile: null, imagePreview: null, pictureUrl: '' }));
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Create preview URL for immediate display
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditMenuItem(prev => ({ ...prev, imagePreview: reader.result as string, imageFile: file }));
    };
    reader.readAsDataURL(file);

    // Upload image to backend and get URL
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/restaurants/upload-image`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image');
      }

      // Update menu item with the image URL from backend
      setEditMenuItem(prev => ({ ...prev, pictureUrl: data.imageUrl }));
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
      setEditMenuItem(prev => ({ ...prev, imageFile: null, imagePreview: null }));
    }
  };

  // Handle save edited menu item
  const handleSaveEditMenuItem = async () => {
    if (!currentRestaurantId || !editingMenuItem) {
      alert('Restaurant ID or menu item not found');
      return;
    }

    if (!editMenuItem.name || !editMenuItem.price) {
      alert('Please fill in all required fields (name and price)');
      return;
    }

    try {
      setSavingMenuItem(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

      const response = await fetch(`${API_BASE_URL}/restaurants/${currentRestaurantId}/menu/${editingMenuItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editMenuItem.name,
          description: editMenuItem.description || '',
          price: parseFloat(editMenuItem.price),
          isAvailable: editMenuItem.isAvailable,
          pictureUrl: editMenuItem.pictureUrl || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update menu item');
      }

      // Refresh menu items
      const menuResponse = await fetch(`${API_BASE_URL}/restaurants/${currentRestaurantId}/menu`);
      if (menuResponse.ok) {
        const menuData = await menuResponse.json();
        setMenuItems(menuData.menuItems || []);
      }

      // Reset form and close modal
      setEditMenuItem({
        name: '',
        description: '',
        price: '',
        isAvailable: true,
        pictureUrl: '',
        imageFile: null,
        imagePreview: null,
      });
      setEditingMenuItem(null);
      setShowEditMenuItemModal(false);
      alert('Menu item updated successfully!');
    } catch (error: any) {
      console.error('Error updating menu item:', error);
      alert('Failed to update menu item: ' + error.message);
    } finally {
      setSavingMenuItem(false);
    }
  };

  // Handle toggle availability
  const handleToggleAvailability = async (item: any) => {
    if (!currentRestaurantId) {
      alert('Restaurant ID not found');
      return;
    }

    const newAvailability = !item.isAvailable;
    setUpdatingAvailability(item.id);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

      const response = await fetch(`${API_BASE_URL}/restaurants/${currentRestaurantId}/menu/${item.id}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isAvailable: newAvailability,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update availability');
      }

      // Refresh menu items
      const menuResponse = await fetch(`${API_BASE_URL}/restaurants/${currentRestaurantId}/menu`);
      if (menuResponse.ok) {
        const menuData = await menuResponse.json();
        setMenuItems(menuData.menuItems || []);
      }
    } catch (error: any) {
      console.error('Error toggling availability:', error);
      alert('Failed to update availability: ' + error.message);
    } finally {
      setUpdatingAvailability(null);
    }
  };

  // Calculate stats from orders using useMemo to recalculate when allOrders changes
  const stats = useMemo(() => {
    if (!allOrders || allOrders.length === 0) {
      return {
        todayRevenue: 0,
        ordersToday: 0,
        avgOrderValue: 0,
        revenueChange: '0',
        orderChange: '0',
        totalOrders: 0
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter today's orders
    const todayOrders = allOrders.filter((order: any) => {
      if (!order.orderTime) return false;
      try {
        const orderDate = new Date(order.orderTime);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      } catch (e) {
        return false;
      }
    });
    
    // Calculate today's revenue
    const todayRevenue = todayOrders.reduce((sum: number, order: any) => {
      return sum + (parseFloat(order.grandTotal) || 0);
    }, 0);
    
    // Count today's orders
    const ordersToday = todayOrders.length;
    
    // Calculate average order value (all time)
    const avgOrderValue = allOrders.length > 0
      ? allOrders.reduce((sum: number, order: any) => sum + (parseFloat(order.grandTotal) || 0), 0) / allOrders.length
      : 0;
    
    // Get yesterday's orders for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayOrders = allOrders.filter((order: any) => {
      if (!order.orderTime) return false;
      try {
        const orderDate = new Date(order.orderTime);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === yesterday.getTime();
      } catch (e) {
        return false;
      }
    });
    const yesterdayRevenue = yesterdayOrders.reduce((sum: number, order: any) => {
      return sum + (parseFloat(order.grandTotal) || 0);
    }, 0);
    const yesterdayCount = yesterdayOrders.length;
    
    // Calculate revenue change
    const revenueChange = yesterdayRevenue > 0
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1)
      : todayRevenue > 0 ? '100' : '0';
    
    // Calculate order count change
    const orderChange = yesterdayCount > 0
      ? (todayOrders.length - yesterdayCount).toString()
      : todayOrders.length > 0 ? `+${todayOrders.length}` : '0';
    
    return {
      todayRevenue,
      ordersToday,
      avgOrderValue,
      revenueChange,
      orderChange,
      totalOrders: allOrders.length
    };
  }, [allOrders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'ready':
        return 'bg-green-500/20 text-green-500';
      case 'delivered':
        return 'bg-blue-500/20 text-blue-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'preparing':
        return <Clock className="h-3 w-3" />;
      case 'ready':
        return <CheckCircle className="h-3 w-3" />;
      case 'delivered':
        return <Package className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const updateOperatingHours = (day: string, field: string, value: any) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [field]: value
      }
    }));
  };

  // Handle restaurant picture upload
  const handleRestaurantImageUpload = async (file: File | null) => {
    if (!file) {
      setFormData(prev => ({ ...prev, imageFile: null, imagePreview: null, pictureUrl: '' }));
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Create preview URL for immediate display
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imagePreview: reader.result as string, imageFile: file }));
    };
    reader.readAsDataURL(file);

    // Upload image to backend and get URL
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const response = await fetch(`${API_BASE_URL}/restaurants/upload-image`, {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image');
      }

      // Update form data with the image URL from backend
      setFormData(prev => ({ ...prev, pictureUrl: data.imageUrl }));
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
      setFormData(prev => ({ ...prev, imageFile: null, imagePreview: null }));
    }
  };

  const handleSaveChanges = async () => {
    if (!currentRestaurantId) {
      setError('Restaurant ID not found');
      return;
    }

    try {
      setSaving(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

      // Update restaurant information with all fields
      const restaurantUpdates: any = {
        restaurantName: formData.restaurantName,
        phone: formData.phone,
        description: formData.description || '',
        deliveryFee: formData.deliveryFee ? parseFloat(formData.deliveryFee) : undefined,
        minimumOrder: formData.minimumOrder ? parseFloat(formData.minimumOrder) : undefined,
        preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : undefined,
        pictureUrl: formData.pictureUrl || undefined,
      };

      const updateResponse = await fetch(`${API_BASE_URL}/restaurants/${currentRestaurantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(restaurantUpdates),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Failed to update restaurant information');
      }

      // Update operating hours
      // Include all days - closed days will have isClosed: true, open days will have times
      const hoursArray = Object.entries(operatingHours).map(([day, hours]) => ({
        restaurantId: currentRestaurantId,
        dayOfWeek: day as any,
        openTime: hours.closed ? '00:00' : (hours.open || '09:00'),
        closeTime: hours.closed ? '00:00' : (hours.close || '17:00'),
        isClosed: hours.closed || false,
      }));
      
      console.log('📤 Sending hours array to backend:', hoursArray);

      const hoursResponse = await fetch(`${API_BASE_URL}/restaurants/${currentRestaurantId}/hours`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hours: hoursArray }),
      });

      if (!hoursResponse.ok) {
        const errorData = await hoursResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update operating hours');
      }

      // Refresh restaurant data
      const restaurantResponse = await fetch(`${API_BASE_URL}/restaurants/${currentRestaurantId}`);
      if (restaurantResponse.ok) {
        const restaurantData = await restaurantResponse.json();
        setRestaurant(restaurantData.restaurant);
        // Update form data with refreshed values
        setFormData({
          restaurantName: restaurantData.restaurant?.restaurantName || '',
          phone: restaurantData.restaurant?.phone || '',
          description: restaurantData.restaurant?.description || '',
          deliveryFee: restaurantData.restaurant?.deliveryFee?.toString() || '0',
          minimumOrder: restaurantData.restaurant?.minimumOrder?.toString() || '0',
          preparationTime: restaurantData.restaurant?.preparationTime?.toString() || '30',
          pictureUrl: restaurantData.restaurant?.pictureUrl || '',
          imageFile: null,
          imagePreview: restaurantData.restaurant?.pictureUrl || null,
        });
      }

      // Refresh operating hours to show updated values
      const refreshedHoursResponse = await fetch(`${API_BASE_URL}/restaurants/${currentRestaurantId}/hours`);
      if (refreshedHoursResponse.ok) {
        const refreshedHoursData = await refreshedHoursResponse.json();
        const refreshedHours = refreshedHoursData.hours || [];
        
        // Map database hours to component state
        const hoursMap: any = {
          monday: { open: '', close: '', closed: true },
          tuesday: { open: '', close: '', closed: true },
          wednesday: { open: '', close: '', closed: true },
          thursday: { open: '', close: '', closed: true },
          friday: { open: '', close: '', closed: true },
          saturday: { open: '', close: '', closed: true },
          sunday: { open: '', close: '', closed: true }
        };
        
        // Backend returns dayOfWeek as string (e.g., "monday") or weekday as number (0-6)
        // Handle both cases for compatibility
        refreshedHours.forEach((h: any) => {
          const dayName = h.dayOfWeek || (h.weekday !== undefined ? ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][h.weekday] : null);
          if (dayName && hoursMap[dayName]) {
            hoursMap[dayName] = {
              open: h.openTime || '',
              close: h.closeTime || '',
              closed: h.isClosed || false
            };
          }
        });
        
        setOperatingHours(hoursMap);
      }

      // Show success message
      alert('Settings saved successfully!');
    } catch (err: any) {
      console.error('Error saving changes:', err);
      setError(err.message || 'Failed to save changes');
      alert('Failed to save changes: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLeaveFrontDash = async () => {
    if (!currentRestaurantId) {
      alert('Restaurant ID not found. Please sign in again.');
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
      const response = await fetch(`${API_BASE_URL}/restaurants/${currentRestaurantId}/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.error || 'Failed to submit withdrawal request');
        return;
      }

      alert('Withdrawal request submitted successfully. Your request is pending admin approval.');
      setIsLeaveDialogOpen(false);
      // Optionally redirect to homepage
      onBack();
    } catch (error: any) {
      console.error('Withdrawal request error:', error);
      alert('Failed to submit withdrawal request: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading restaurant data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={onBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show pending approval page if restaurant is not approved
  if (isPendingApproval) {
    return (
      <div className="min-h-screen bg-background frontdash-animated-bg">
        <header className="border-b border-white/10 bg-background/80 backdrop-blur-md">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-primary">FrontDash</h1>
                <div className="w-4 h-4 border border-primary rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                </div>
                <span className="text-muted-foreground">|</span>
                <span className="text-foreground">Restaurant Dashboard</span>
              </div>
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto space-y-8">
            <Card className="frontdash-card-bg frontdash-border-glow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
                <CardTitle className="text-2xl">Registration Pending Approval</CardTitle>
                <Badge variant="secondary" className="w-fit mx-auto mt-2">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending Review
                </Badge>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">
                    Your restaurant registration is currently under review by our admin team.
                  </p>
                  {restaurant && (
                    <p className="text-foreground font-medium">
                      {restaurant.restaurantName || restaurantName || 'Your Restaurant'}
                    </p>
                  )}
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-medium text-primary mb-3">What happens next?</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-xs font-medium text-primary">1</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Review Process</p>
                        <p className="text-xs text-muted-foreground">
                          Our team will review your restaurant information, business documents, and menu details.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-xs font-medium text-primary">2</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Verification</p>
                        <p className="text-xs text-muted-foreground">
                          We'll verify your business license, tax information, and contact details.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-xs font-medium text-primary">3</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Approval & Access</p>
                        <p className="text-xs text-muted-foreground">
                          Once approved, you'll receive full access to your restaurant dashboard and can start accepting orders.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <h4 className="font-medium text-green-400 mb-2">Expected Timeline</h4>
                  <p className="text-sm text-green-300">
                    Most restaurant applications are reviewed within <span className="font-medium">2-3 business days</span>. 
                    Complex applications may take up to 5 business days for thorough review.
                  </p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="font-medium text-blue-400 mb-3">Need Help?</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-blue-300">
                      <Mail className="h-4 w-4" />
                      <span>support@frontdash.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-300">
                      <Phone className="h-4 w-4" />
                      <span>1-800-FRONTDASH</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-primary">FrontDash</h1>
                <div className="w-4 h-4 border border-primary rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                </div>
              </div>
              <span className="text-muted-foreground">|</span>
              <span className="text-foreground font-medium">
                {loading ? 'Loading...' : restaurant?.restaurantName || 'Restaurant Dashboard'}
              </span>
              <Badge className={restaurant?.status === 'approved' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}>
                {restaurant?.status === 'approved' ? 'Active' : restaurant?.status || 'Pending'}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" onClick={onBack}>
                Back to FrontDash
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-card/40 border border-white/10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-card/60 backdrop-blur-sm border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Today's Revenue</p>
                      <p className="text-2xl font-bold text-foreground">
                        ${stats.todayRevenue.toFixed(2)}
                      </p>
                      {parseFloat(stats.revenueChange) !== 0 && (
                        <p className={`text-xs flex items-center mt-1 ${
                          parseFloat(stats.revenueChange) > 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                        <TrendingUp className="h-3 w-3 mr-1" />
                          {parseFloat(stats.revenueChange) > 0 ? '+' : ''}{stats.revenueChange}% from yesterday
                      </p>
                      )}
                    </div>
                    <div className="p-3 bg-primary/20 rounded-lg">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-sm border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Orders Today</p>
                      <p className="text-2xl font-bold text-foreground">{stats.ordersToday}</p>
                      {parseInt(stats.orderChange) !== 0 && (
                        <p className={`text-xs flex items-center mt-1 ${
                          parseInt(stats.orderChange) > 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                        <TrendingUp className="h-3 w-3 mr-1" />
                          {parseInt(stats.orderChange) > 0 ? '+' : ''}{stats.orderChange} from yesterday
                      </p>
                      )}
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-lg">
                      <Package className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-sm border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                      <p className="text-2xl font-bold text-foreground">
                        ${stats.avgOrderValue.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Based on {stats.totalOrders} {stats.totalOrders === 1 ? 'order' : 'orders'}
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-500/20 rounded-lg">
                      <Star className="h-6 w-6 text-yellow-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-sm border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Prep Time</p>
                      <p className="text-2xl font-bold text-foreground">
                        {restaurant?.preparationTime || 30}m
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Average preparation time
                      </p>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <Clock className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card className="bg-card/60 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Orders
                  <Button variant="outline" size="sm" className="border-white/20">
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No recent orders</p>
                  ) : (
                    recentOrders.map((order: any) => {
                      const orderDate = new Date(order.orderTime);
                      const formattedTime = orderDate.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                      const orderNumber = order.orderNumber || `#${order.orderId}`;
                      const customerCode = order.uniqueCustomerCode ? `Customer #${order.uniqueCustomerCode}` : 'Guest';
                      
                      return (
                        <div key={order.orderId} className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-4">
                        <div>
                              <p className="font-medium text-foreground">Order {orderNumber}</p>
                              <p className="text-sm text-muted-foreground">{customerCode}</p>
                        </div>
                        <div>
                              <p className="text-sm text-foreground">${order.grandTotal?.toFixed(2) || '0.00'}</p>
                              <p className="text-sm text-muted-foreground">{formattedTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                              <p className="text-xs text-muted-foreground">
                                Subtotal: ${order.subtotal?.toFixed(2) || '0.00'}
                              </p>
                              {order.tip > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  Tip: ${order.tip?.toFixed(2) || '0.00'}
                                </p>
                              )}
                        </div>
                            <Badge className={`${getStatusColor(order.orderStatus || order.status)} flex items-center space-x-1`}>
                              {getStatusIcon(order.orderStatus || order.status)}
                              <span className="capitalize">{order.orderStatus || order.status}</span>
                        </Badge>
                      </div>
                    </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6 mt-6">
            <Card className="bg-card/60 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <p className="text-muted-foreground">Manage incoming orders and update their status</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No orders found</p>
                  ) : (
                    recentOrders.map((order: any) => {
                      const orderDate = new Date(order.orderTime);
                      const formattedTime = orderDate.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                      const orderNumber = order.orderNumber || `#${order.orderId}`;
                      const customerCode = order.uniqueCustomerCode ? `Customer #${order.uniqueCustomerCode}` : 'Guest';
                      const orderStatus = order.orderStatus || order.status;
                      
                      return (
                        <div key={order.orderId} className="p-4 bg-background/50 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                              <h4 className="font-medium text-foreground">Order {orderNumber}</h4>
                              <p className="text-sm text-muted-foreground">
                                {customerCode} • {formattedTime}
                              </p>
                        </div>
                            <Badge className={getStatusColor(orderStatus)}>
                              {getStatusIcon(orderStatus)}
                              <span className="ml-1 capitalize">{orderStatus}</span>
                        </Badge>
                      </div>
                      
                      <div className="mb-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Subtotal:</span>
                              <span className="text-foreground">${order.subtotal?.toFixed(2) || '0.00'}</span>
                            </div>
                            {order.tip > 0 && (
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-muted-foreground">Tip:</span>
                                <span className="text-foreground">${order.tip?.toFixed(2) || '0.00'}</span>
                              </div>
                            )}
                            <div className="flex justify-between mt-2 pt-2 border-t border-white/10">
                              <span className="text-foreground font-medium">Total:</span>
                              <span className="text-lg font-bold text-foreground">${order.grandTotal?.toFixed(2) || '0.00'}</span>
                            </div>
                      </div>

                          {(orderStatus === 'preparing' || orderStatus === 'confirmed' || orderStatus === 'pending') && (
                        <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                className="bg-green-500 hover:bg-green-600"
                                onClick={async () => {
                                  try {
                                    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
                                    const response = await fetch(`${API_BASE_URL}/orders/${order.orderId}/status`, {
                                      method: 'PATCH',
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                      body: JSON.stringify({ status: 'ready' }),
                                    });
                                    
                                    if (response.ok) {
                                      // Refresh orders
                                      const ordersResponse = await fetch(`${API_BASE_URL}/orders/restaurant/${currentRestaurantId}`);
                                      if (ordersResponse.ok) {
                                        const ordersData = await ordersResponse.json();
                                        const orders = ordersData.orders || [];
                                        setAllOrders(orders);
                                        setRecentOrders(orders.slice(0, 10));
                                      }
                                      alert('Order marked as ready!');
                                    } else {
                                      throw new Error('Failed to update order status');
                                    }
                                  } catch (err: any) {
                                    console.error('Error updating order status:', err);
                                    alert('Failed to update order status: ' + err.message);
                                  }
                                }}
                              >
                            Mark Ready
                          </Button>
                          <Button size="sm" variant="outline" className="border-white/20">
                            Contact Customer
                          </Button>
                        </div>
                      )}
                    </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menu" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-foreground">Menu Management</h3>
                <p className="text-muted-foreground">Add, edit, and manage your menu items</p>
              </div>
              <Button 
                className="bg-primary hover:bg-primary/80"
                onClick={() => setShowAddMenuItemModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Menu Item
              </Button>
            </div>

            <div className="grid gap-4">
              {menuItems.map((item) => {
                const isUnavailable = item.isAvailable === false;
                return (
                  <Card 
                    key={item.id} 
                    className={`bg-card/60 backdrop-blur-sm border-white/10 ${isUnavailable ? 'opacity-50' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-muted/20 rounded-lg overflow-hidden">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className={`w-full h-full object-cover ${isUnavailable ? 'grayscale' : ''}`}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                No Image
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className={`font-medium ${isUnavailable ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                {item.name}
                              </h4>
                              {item.popular && <Badge className="bg-yellow-500/20 text-yellow-500">Popular</Badge>}
                            </div>
                            <p className={`text-sm mb-1 ${isUnavailable ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                              {item.description}
                            </p>
                            <p className={`text-sm ${isUnavailable ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                              Category: {item.category}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className={`text-lg font-medium ${isUnavailable ? 'text-muted-foreground' : 'text-foreground'}`}>
                              ${item.price}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Switch 
                                checked={item.isAvailable !== false} 
                                onCheckedChange={() => handleToggleAvailability(item)}
                                disabled={updatingAvailability === item.id}
                              />
                              <span className={`text-xs ${isUnavailable ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                                {updatingAvailability === item.id 
                                  ? 'Updating...' 
                                  : item.isAvailable !== false 
                                    ? 'Available' 
                                    : 'Unavailable'
                                }
                              </span>
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleEditMenuItem(item)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Item
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <XCircle className="h-4 w-4 mr-2" />
                                Remove Item
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card/60 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Revenue Trend</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted/10 rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Revenue chart would go here</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Customer Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Repeat Customers</span>
                      <span className="font-medium">67%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Order Value</span>
                      <span className="font-medium">${stats.avgOrderValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Peak Hours</span>
                      <span className="font-medium">6-8 PM</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-6">
            <Card className="bg-card/60 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle>Restaurant Settings</CardTitle>
                <p className="text-muted-foreground">Manage your restaurant information and preferences</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Restaurant Picture Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Restaurant Picture</label>
                  <div className="space-y-4">
                    {formData.imagePreview && (
                      <div className="relative w-full h-64 bg-muted/20 rounded-lg overflow-hidden">
                        <img
                          src={formData.imagePreview}
                          alt="Restaurant preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          handleRestaurantImageUpload(file);
                        }}
                        className="hidden"
                        id="restaurant-image-upload"
                      />
                      <Label
                        htmlFor="restaurant-image-upload"
                        className="cursor-pointer"
                      >
                        <Button
                          type="button"
                          variant="outline"
                          className="border-white/20"
                          onClick={() => document.getElementById('restaurant-image-upload')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {formData.imagePreview ? 'Change Picture' : 'Upload Picture'}
                        </Button>
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, or GIF (max 5MB)
                    </p>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Restaurant Name</label>
                    <Input 
                      value={formData.restaurantName}
                      onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                      className="bg-card/50 border-white/10" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <Input 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-card/50 border-white/10" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-card/50 border-white/10"
                    placeholder="Describe your restaurant..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Delivery Fee</label>
                    <Input 
                      value={formData.deliveryFee}
                      onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value.replace('$', '') })}
                      placeholder="$0.00"
                      className="bg-card/50 border-white/10" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Minimum Order</label>
                    <Input 
                      value={formData.minimumOrder}
                      onChange={(e) => setFormData({ ...formData, minimumOrder: e.target.value.replace('$', '') })}
                      placeholder="$0.00"
                      className="bg-card/50 border-white/10" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Prep Time (minutes)</label>
                    <Input 
                      value={formData.preparationTime}
                      onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value.replace(/\D/g, '') })}
                      placeholder="30"
                      className="bg-card/50 border-white/10" 
                    />
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Operating Hours Section */}
                <div>
                  <h4 className="font-medium mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary" />
                    Operating Hours
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(operatingHours).map(([day, hours]) => (
                      <div key={day} className="flex items-center space-x-4">
                        <div className="w-20">
                          <span className="text-sm font-medium capitalize">{day}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`${day}-closed`}
                            checked={hours.closed}
                            onCheckedChange={(checked) => {
                              updateOperatingHours(day, 'closed', checked);
                              if (checked) {
                                updateOperatingHours(day, 'open', '');
                                updateOperatingHours(day, 'close', '');
                              }
                            }}
                          />
                          <label htmlFor={`${day}-closed`} className="text-sm text-muted-foreground">
                            Closed
                          </label>
                        </div>

                        {!hours.closed && (
                          <>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">Open:</span>
                              <Select
                                value={hours.open}
                                onValueChange={(value) => updateOperatingHours(day, 'open', value)}
                              >
                                <SelectTrigger className="w-24 bg-card/50 border-white/10">
                                  <SelectValue placeholder="--" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 24 }, (_, i) => {
                                    const hour = i.toString().padStart(2, '0');
                                    return (
                                      <SelectItem key={`${hour}:00`} value={`${hour}:00`}>{`${hour}:00`}</SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">Close:</span>
                              <Select
                                value={hours.close}
                                onValueChange={(value) => updateOperatingHours(day, 'close', value)}
                              >
                                <SelectTrigger className="w-24 bg-card/50 border-white/10">
                                  <SelectValue placeholder="--" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 24 }, (_, i) => {
                                    const hour = i.toString().padStart(2, '0');
                                    return (
                                      <SelectItem key={`${hour}:00`} value={`${hour}:00`}>{`${hour}:00`}</SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm text-blue-400">
                      Keep your operating hours updated so customers know when they can order from you. Changes are reflected immediately on your restaurant page.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <div className="flex items-center gap-4">
                    <Button 
                      className="bg-primary hover:bg-primary/80"
                      onClick={handleSaveChanges}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      onClick={() => setShowChangePasswordModal(true)}
                      className="bg-primary hover:bg-primary/80"
                    >
                      Change Password
                    </Button>
                  </div>
                  
                  <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-red-600 hover:bg-red-700 text-white">
                        Leave FrontDash
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card/95 backdrop-blur-sm border-white/20">
                      <DialogHeader>
                        <DialogTitle className="text-red-400">Leave FrontDash</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                          Are you sure you want to leave FrontDash? We're sorry to see you go.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                          <p className="text-sm text-red-400 mb-3">
                            <strong>Important Warning:</strong>
                          </p>
                          <ul className="text-sm text-red-400 space-y-2 list-disc list-inside">
                            <li>Your restaurant will be immediately removed from the FrontDash platform</li>
                            <li>Customers will no longer be able to find or order from your restaurant</li>
                            <li>All pending orders will need to be completed before removal</li>
                            <li><strong>If you want to return to FrontDash in the future, you will need to apply from the beginning again</strong></li>
                          </ul>
                        </div>
                        <div className="bg-muted/10 border border-muted/20 rounded-lg p-3">
                          <p className="text-sm text-muted-foreground">
                            If you're experiencing issues, please contact our support team before leaving. 
                            We're here to help resolve any problems you may have.
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsLeaveDialogOpen(false)}
                          className="border-white/20"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleLeaveFrontDash}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Yes, Leave FrontDash
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Menu Item Modal */}
      <Dialog open={showAddMenuItemModal} onOpenChange={setShowAddMenuItemModal}>
        <DialogContent className="bg-card/95 backdrop-blur-sm border-white/20 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">Add New Menu Item</DialogTitle>
            <DialogDescription className="text-base text-foreground pt-2">
              Create a new menu item for your restaurant
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="item-name" className="text-foreground">Name *</Label>
              <Input
                id="item-name"
                value={newMenuItem.name}
                onChange={(e) => setNewMenuItem(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter item name"
                className="bg-background/50 border-white/10"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="item-description" className="text-foreground">Description</Label>
              <Textarea
                id="item-description"
                value={newMenuItem.description}
                onChange={(e) => setNewMenuItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter item description"
                className="bg-background/50 border-white/10 min-h-[100px]"
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="item-price" className="text-foreground">Price *</Label>
              <Input
                id="item-price"
                type="number"
                step="0.01"
                min="0"
                value={newMenuItem.price}
                onChange={(e) => setNewMenuItem(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                className="bg-background/50 border-white/10"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-foreground">Picture</Label>
              <div className="space-y-4">
                {newMenuItem.imagePreview && (
                  <div className="relative w-full h-48 bg-muted/20 rounded-lg overflow-hidden">
                    <img
                      src={newMenuItem.imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleMenuItemImageUpload(file);
                    }}
                    className="hidden"
                    id="menu-item-image-upload"
                  />
                  <Label
                    htmlFor="menu-item-image-upload"
                    className="cursor-pointer"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-white/20"
                      onClick={() => document.getElementById('menu-item-image-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {newMenuItem.imagePreview ? 'Change Image' : 'Upload Image'}
                    </Button>
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, or GIF (max 5MB)
                </p>
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="item-available" className="text-foreground">Available</Label>
                <p className="text-xs text-muted-foreground">
                  Make this item available for ordering
                </p>
              </div>
              <Switch
                id="item-available"
                checked={newMenuItem.isAvailable}
                onCheckedChange={(checked) => setNewMenuItem(prev => ({ ...prev, isAvailable: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddMenuItemModal(false);
                setNewMenuItem({
                  name: '',
                  description: '',
                  price: '',
                  isAvailable: true,
                  pictureUrl: '',
                  imageFile: null,
                  imagePreview: null,
                });
              }}
              disabled={savingMenuItem}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveMenuItem}
              disabled={savingMenuItem || !newMenuItem.name || !newMenuItem.price}
              className="bg-primary hover:bg-primary/80"
            >
              {savingMenuItem ? 'Saving...' : 'Save New Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Menu Item Modal */}
      <Dialog open={showEditMenuItemModal} onOpenChange={setShowEditMenuItemModal}>
        <DialogContent className="bg-card/95 backdrop-blur-sm border-white/20 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">Edit Menu Item</DialogTitle>
            <DialogDescription className="text-base text-foreground pt-2">
              Update menu item details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-item-name" className="text-foreground">Name *</Label>
              <Input
                id="edit-item-name"
                value={editMenuItem.name}
                onChange={(e) => setEditMenuItem(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter item name"
                className="bg-background/50 border-white/10"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-item-description" className="text-foreground">Description</Label>
              <Textarea
                id="edit-item-description"
                value={editMenuItem.description}
                onChange={(e) => setEditMenuItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter item description"
                className="bg-background/50 border-white/10 min-h-[100px]"
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="edit-item-price" className="text-foreground">Price *</Label>
              <Input
                id="edit-item-price"
                type="number"
                step="0.01"
                min="0"
                value={editMenuItem.price}
                onChange={(e) => setEditMenuItem(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                className="bg-background/50 border-white/10"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-foreground">Picture</Label>
              <div className="space-y-4">
                {editMenuItem.imagePreview && (
                  <div className="relative w-full h-48 bg-muted/20 rounded-lg overflow-hidden">
                    <img
                      src={editMenuItem.imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleEditMenuItemImageUpload(file);
                    }}
                    className="hidden"
                    id="edit-menu-item-image-upload"
                  />
                  <Label
                    htmlFor="edit-menu-item-image-upload"
                    className="cursor-pointer"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-white/20"
                      onClick={() => document.getElementById('edit-menu-item-image-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {editMenuItem.imagePreview ? 'Change Image' : 'Upload Image'}
                    </Button>
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, or GIF (max 5MB)
                </p>
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="edit-item-available" className="text-foreground">Available</Label>
                <p className="text-xs text-muted-foreground">
                  Make this item available for ordering
                </p>
              </div>
              <Switch
                id="edit-item-available"
                checked={editMenuItem.isAvailable}
                onCheckedChange={(checked) => setEditMenuItem(prev => ({ ...prev, isAvailable: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditMenuItemModal(false);
                setEditingMenuItem(null);
                setEditMenuItem({
                  name: '',
                  description: '',
                  price: '',
                  isAvailable: true,
                  pictureUrl: '',
                  imageFile: null,
                  imagePreview: null,
                });
              }}
              disabled={savingMenuItem}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEditMenuItem}
              disabled={savingMenuItem || !editMenuItem.name || !editMenuItem.price}
              className="bg-primary hover:bg-primary/80"
            >
              {savingMenuItem ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Modal - Shows on first login after approval */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="bg-card/95 backdrop-blur-sm border-white/20 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <DialogTitle className="text-2xl text-primary">Congratulations! Your Restaurant is Approved!</DialogTitle>
            </div>
            <DialogDescription className="text-base text-foreground pt-2">
              Your restaurant has been approved and is now live on FrontDash!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {restaurant && (
              <div className="space-y-4">
                {/* Restaurant Information */}
                <Card className="frontdash-card-bg">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Restaurant Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Restaurant Name</Label>
                        <p className="font-medium">{restaurant.restaurantName || restaurantName || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Cuisine Type</Label>
                        <p className="font-medium">{restaurant.cuisineType || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Average Price</Label>
                        <p className="font-medium">{restaurant.averagePrice || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Preparation Time</Label>
                        <p className="font-medium">{restaurant.preparationTime || 'N/A'} min</p>
                      </div>
                    </div>
                    {restaurant.description && (
                      <div>
                        <Label className="text-muted-foreground">Description</Label>
                        <p className="font-medium mt-1">{restaurant.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="frontdash-card-bg">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label className="text-muted-foreground text-xs">Email</Label>
                        <p className="font-medium">{restaurant.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label className="text-muted-foreground text-xs">Phone</Label>
                        <p className="font-medium">{restaurant.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label className="text-muted-foreground text-xs">Address</Label>
                        <p className="font-medium">
                          {restaurant.address ? 
                            `${restaurant.address}, ${restaurant.city}, ${restaurant.state} ${restaurant.zipCode}` 
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Business Details */}
                <Card className="frontdash-card-bg">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Business Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Delivery Fee</Label>
                        <p className="font-medium">${typeof restaurant.deliveryFee === 'number' ? restaurant.deliveryFee.toFixed(2) : restaurant.deliveryFee || '0.00'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Minimum Order</Label>
                        <p className="font-medium">${typeof restaurant.minimumOrder === 'number' ? restaurant.minimumOrder.toFixed(2) : restaurant.minimumOrder || '0.00'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Menu Items</Label>
                        <p className="font-medium">{menuItems.length} items</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-primary">What's Next?</p>
              <ul className="text-sm text-foreground space-y-1 list-disc list-inside">
                <li>Start managing your menu and orders</li>
                <li>Update your restaurant information and hours</li>
                <li>View analytics and track your performance</li>
                <li>Start accepting orders from customers</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setShowApprovalModal(false)}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Get Started
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={showChangePasswordModal} onOpenChange={setShowChangePasswordModal}>
        <DialogContent className="bg-card/95 backdrop-blur-sm border-white/20">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new password
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setPasswordErrors({});
              setPasswordSuccess(null);

              // Validate passwords match
              if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
                setPasswordErrors({ confirmPassword: 'New passwords do not match' });
                return;
              }

              // Validate password strength
              if (changePasswordForm.newPassword.length < 6) {
                setPasswordErrors({ newPassword: 'Password must be at least 6 characters long' });
                return;
              }

              try {
                setChangingPassword(true);
                // Use restaurant email as username (same as login)
                const restaurantUsername = restaurant?.email;
                if (!restaurantUsername) {
                  setPasswordErrors({ currentPassword: 'Restaurant email not found. Please sign in again.' });
                  setChangingPassword(false);
                  return;
                }

                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
                const response = await fetch(`${API_BASE_URL}/auth/restaurant/change-password`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    username: restaurantUsername,
                    currentPassword: changePasswordForm.currentPassword,
                    newPassword: changePasswordForm.newPassword,
                  }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                  // Success - clear form and show success message
                  setChangePasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordSuccess('Password changed successfully!');
                  setPasswordErrors({});
                  
                  // Close modal after 2 seconds
                  setTimeout(() => {
                    setShowChangePasswordModal(false);
                    setPasswordSuccess(null);
                  }, 2000);
                } else {
                  // Error from backend
                  const errorMessage = data.error || 'Failed to change password';
                  if (errorMessage.toLowerCase().includes('current password')) {
                    setPasswordErrors({ currentPassword: errorMessage });
                  } else {
                    setPasswordErrors({ newPassword: errorMessage });
                  }
                }
              } catch (err: any) {
                console.error('Change password error:', err);
                setPasswordErrors({ currentPassword: 'Failed to change password. Please try again.' });
              } finally {
                setChangingPassword(false);
              }
            }}
            className="space-y-4"
          >
            {passwordSuccess && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-400">{passwordSuccess}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="restaurant-current-password">Current Password</Label>
              <Input
                id="restaurant-current-password"
                type="password"
                value={changePasswordForm.currentPassword}
                onChange={(e) => setChangePasswordForm({ ...changePasswordForm, currentPassword: e.target.value })}
                className="bg-background/50 border-white/10"
                required
              />
              {passwordErrors.currentPassword && (
                <p className="text-sm text-red-400">{passwordErrors.currentPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="restaurant-new-password">New Password</Label>
              <Input
                id="restaurant-new-password"
                type="password"
                value={changePasswordForm.newPassword}
                onChange={(e) => setChangePasswordForm({ ...changePasswordForm, newPassword: e.target.value })}
                className="bg-background/50 border-white/10"
                required
              />
              {passwordErrors.newPassword && (
                <p className="text-sm text-red-400">{passwordErrors.newPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="restaurant-confirm-password">Confirm New Password</Label>
              <Input
                id="restaurant-confirm-password"
                type="password"
                value={changePasswordForm.confirmPassword}
                onChange={(e) => setChangePasswordForm({ ...changePasswordForm, confirmPassword: e.target.value })}
                className="bg-background/50 border-white/10"
                required
              />
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-red-400">{passwordErrors.confirmPassword}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setChangePasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordErrors({});
                  setPasswordSuccess(null);
                }}
                disabled={changingPassword}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={changingPassword}
              >
                {changingPassword ? 'Saving...' : 'Save New Password'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}