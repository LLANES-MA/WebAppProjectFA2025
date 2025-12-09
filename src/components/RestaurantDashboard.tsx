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
  AlertCircle
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
}

export default function RestaurantDashboard({ onBack, restaurantId }: RestaurantDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]); // All orders for stats calculation
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state for settings
  const [formData, setFormData] = useState({
    restaurantName: '',
    phone: '',
    description: '',
    deliveryFee: '',
    minimumOrder: '',
    preparationTime: '',
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
        
        // Fetch restaurant data
        const restaurantResponse = await fetch(`${API_BASE_URL}/restaurants/${currentRestaurantId}`);
        if (!restaurantResponse.ok) throw new Error('Failed to fetch restaurant');
        const restaurantData = await restaurantResponse.json();
        const restaurantInfo = restaurantData.restaurant;
        setRestaurant(restaurantInfo);
        
        // Initialize form data
        setFormData({
          restaurantName: restaurantInfo?.restaurantName || '',
          phone: restaurantInfo?.phone || '',
          description: restaurantInfo?.description || '',
          deliveryFee: restaurantInfo?.deliveryFee?.toString() || '0',
          minimumOrder: restaurantInfo?.minimumOrder?.toString() || '0',
          preparationTime: restaurantInfo?.preparationTime?.toString() || '30',
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
          
          // Map weekday numbers to day names
          const dayMap: { [key: number]: string } = {
            0: 'sunday',
            1: 'monday',
            2: 'tuesday',
            3: 'wednesday',
            4: 'thursday',
            5: 'friday',
            6: 'saturday'
          };
          
          hours.forEach((h: any) => {
            const dayName = dayMap[h.weekday];
            if (dayName) {
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

  const handleSaveChanges = async () => {
    if (!currentRestaurantId) {
      setError('Restaurant ID not found');
      return;
    }

    try {
      setSaving(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

      // Update restaurant information
      const restaurantUpdates: any = {
        restaurantName: formData.restaurantName,
        phone: formData.phone,
      };

      const updateResponse = await fetch(`${API_BASE_URL}/restaurants/${currentRestaurantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(restaurantUpdates),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update restaurant information');
      }

      // Update operating hours
      const hoursArray = Object.entries(operatingHours).map(([day, hours]) => ({
        restaurantId: currentRestaurantId,
        dayOfWeek: day as any,
        openTime: hours.open || '09:00',
        closeTime: hours.close || '17:00',
        isClosed: hours.closed || false,
      }));

      const hoursResponse = await fetch(`${API_BASE_URL}/restaurants/${currentRestaurantId}/hours`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hours: hoursArray }),
      });

      if (!hoursResponse.ok) {
        throw new Error('Failed to update operating hours');
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
        });
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
              <Button className="bg-primary hover:bg-primary/80">
                <Plus className="h-4 w-4 mr-2" />
                Add Menu Item
              </Button>
            </div>

            <div className="grid gap-4">
              {menuItems.map((item) => (
                <Card key={item.id} className="bg-card/60 backdrop-blur-sm border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-muted/20 rounded-lg"></div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-foreground">{item.name}</h4>
                            {item.popular && <Badge className="bg-yellow-500/20 text-yellow-500">Popular</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{item.description}</p>
                          <p className="text-sm text-muted-foreground">Category: {item.category}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-lg font-medium text-foreground">${item.price}</p>
                          <div className="flex items-center space-x-2">
                            <Switch checked={item.isAvailable !== false} />
                            <span className="text-xs text-muted-foreground">
                              {item.isAvailable !== false ? 'Available' : 'Unavailable'}
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
                            <DropdownMenuItem>
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
              ))}
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
                      💡 Tip: Keep your operating hours updated so customers know when they can order from you. These changes will be reflected immediately on your restaurant page.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <Button 
                    className="bg-primary hover:bg-primary/80"
                    onClick={handleSaveChanges}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  
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
                            ⚠️ <strong>Important Warning:</strong>
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
    </div>
  );
}