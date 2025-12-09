import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  LogOut, 
  Key, 
  Package, 
  Clock, 
  Car, 
  CheckCircle, 
  Search,
  MapPin,
  User,
  Phone,
  AlertCircle
} from 'lucide-react';

interface StaffDashboardProps {
  onBack: () => void;
}

// Mock data for orders
const mockOrders = [
  { 
    id: "ORD001", 
    restaurant: "Mario's Pizza", 
    customer: "John Smith", 
    address: "123 Main St, Downtown", 
    phone: "+1234567890",
    items: ["Margherita Pizza x1", "Caesar Salad x1"],
    total: "$28.50",
    status: "preparing", 
    orderTime: "2024-01-20 14:30",
    estimatedDelivery: "15:15",
    driverId: null,
    driver: null
  },
  { 
    id: "ORD002", 
    restaurant: "Sushi Express", 
    customer: "Emily Johnson", 
    address: "456 Oak Ave, Midtown", 
    phone: "+1234567891",
    items: ["California Roll x2", "Miso Soup x1"],
    total: "$32.75",
    status: "ready", 
    orderTime: "2024-01-20 14:45",
    estimatedDelivery: "15:30",
    driverId: null,
    driver: null
  },
  { 
    id: "ORD003", 
    restaurant: "Burger Palace", 
    customer: "Mike Wilson", 
    address: "789 Pine Rd, Uptown", 
    phone: "+1234567892",
    items: ["Double Cheeseburger x1", "Fries x1", "Coke x1"],
    total: "$19.25",
    status: "delivering", 
    orderTime: "2024-01-20 13:15",
    estimatedDelivery: "14:45",
    driverId: 1,
    driver: "Alex Thompson"
  },
  { 
    id: "ORD004", 
    restaurant: "Thai Garden", 
    customer: "Sarah Davis", 
    address: "321 Elm St, Downtown", 
    phone: "+1234567893",
    items: ["Pad Thai x1", "Tom Yum Soup x1"],
    total: "$24.80",
    status: "delivered", 
    orderTime: "2024-01-20 12:30",
    estimatedDelivery: "13:15",
    driverId: 2,
    driver: "Jordan Williams"
  }
];

// Mock data for available drivers
const availableDrivers = [
  { id: 1, name: "Alex Thompson", vehicle: "Honda Civic", license: "DL123456", status: "available" },
  { id: 2, name: "Jordan Williams", vehicle: "Toyota Camry", license: "DL789012", status: "busy" },
  { id: 3, name: "Casey Brown", vehicle: "Ford Focus", license: "DL345678", status: "available" },
];

export default function StaffDashboard({ onBack }: StaffDashboardProps) {
  const [activeTab, setActiveTab] = useState("orders");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [changePasswordForm, setChangePasswordForm] = useState({ 
    currentPassword: "", 
    newPassword: "", 
    confirmPassword: "" 
  });
  const [searchOrderNumber, setSearchOrderNumber] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restaurantNames, setRestaurantNames] = useState<{ [key: number]: string }>({});
  const [orderDrivers, setOrderDrivers] = useState<{ [key: number]: { name: string; id: number; firstName?: string; lastName?: string } }>({});
  
  const API_BASE_URL = (import.meta as unknown as { env: { VITE_API_BASE_URL?: string } }).env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  
  // Test backend connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const healthUrl = API_BASE_URL.replace('/api', '/health');
        const response = await fetch(healthUrl);
        if (response.ok) {
          console.log('✅ Backend connection successful');
        } else {
          console.warn('⚠️ Backend health check failed');
        }
      } catch (err) {
        console.error('❌ Backend connection failed:', err);
        setError('Cannot connect to backend server. Please ensure it is running on port 8080.');
      }
    };
    testConnection();
  }, []);

  // Fetch orders and drivers when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchOrders();
      fetchDrivers();
    }
  }, [isLoggedIn]);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/orders`);
      if (response.ok) {
        const data = await response.json();
        const ordersList = data.orders || [];
        setOrders(ordersList);
        
        // Fetch restaurant names and driver info for all orders
        const restaurantIds = [...new Set(ordersList.map((o: any) => o.restaurantId))];
        const restaurantNamesMap: { [key: number]: string } = {};
        for (const id of restaurantIds) {
          const restaurantId = Number(id);
          if (isNaN(restaurantId)) continue;
          try {
            const resResponse = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}`);
            if (resResponse.ok) {
              const resData = await resResponse.json();
              restaurantNamesMap[restaurantId] = resData.restaurant?.restaurantName || 'Unknown Restaurant';
            }
          } catch (err) {
            restaurantNamesMap[restaurantId] = 'Unknown Restaurant';
          }
        }
        setRestaurantNames(restaurantNamesMap);
        
        // Fetch driver assignments for all orders
        const driverMap: { [key: number]: { name: string; id: number; firstName?: string; lastName?: string } } = {};
        for (const order of ordersList) {
          try {
            const deliveryResponse = await fetch(`${API_BASE_URL}/deliveries/order/${order.orderId}`);
            if (deliveryResponse.ok) {
              const deliveryData = await deliveryResponse.json();
              if (deliveryData.assignments && deliveryData.assignments.length > 0) {
                const assignment = deliveryData.assignments[0];
                if (assignment.driverId) {
                  const driverResponse = await fetch(`${API_BASE_URL}/drivers/${assignment.driverId}`);
                  if (driverResponse.ok) {
                    const driverData = await driverResponse.json();
                    const driver = driverData.driver;
                    const driverName = driver?.firstName && driver?.lastName
                      ? `${driver.firstName} ${driver.lastName}`
                      : driver?.name || 'Unknown Driver';
                    driverMap[order.orderId] = {
                      name: driverName,
                      id: assignment.driverId,
                      firstName: driver?.firstName,
                      lastName: driver?.lastName,
                    };
                  }
                }
              }
            }
          } catch (err) {
            // No driver assigned
          }
        }
        setOrderDrivers(driverMap);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchDrivers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/drivers/active`);
      if (response.ok) {
        const data = await response.json();
        setDrivers(data.drivers || []);
      }
    } catch (err: any) {
      console.error('Error fetching drivers:', err);
    }
  };
  
  const fetchOrderDetails = async (orderNumber: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderNumber}`);
      if (response.ok) {
        const data = await response.json();
        return { order: data.order, items: data.items || [] };
      }
      return null;
    } catch (err: any) {
      console.error('Error fetching order details:', err);
      return null;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting login to:', `${API_BASE_URL}/auth/staff/login`);
      console.log('Login data:', { username: loginForm.username, password: '***' });
      
      const response = await fetch(`${API_BASE_URL}/auth/staff/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginForm.username,
          password: loginForm.password,
        }),
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);
        setIsLoggedIn(true);
        localStorage.setItem('staffUsername', loginForm.username);
        // Fetch orders and drivers
        await fetchOrders();
        await fetchDrivers();
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { error: `Server error: ${response.status} ${response.statusText}` };
        }
        const errorMessage = errorData.error || 'Login failed';
        setError(errorMessage);
        alert(errorMessage);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.message || 'Failed to connect to server. Please ensure the backend is running.';
      setError(errorMessage);
      alert('Login failed: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginForm({ username: "", password: "" });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (changePasswordForm.newPassword === changePasswordForm.confirmPassword) {
      console.log("Password changed successfully");
      setChangePasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      // In real app, send to backend
    } else {
      alert("New passwords don't match!");
    }
  };

  const handleSearchOrder = async () => {
    if (!searchOrderNumber.trim()) {
      alert('Please enter an order number');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const orderNumber = searchOrderNumber.trim();
      const orderData = await fetchOrderDetails(orderNumber);
      
      if (orderData && orderData.order) {
        // Fetch delivery assignment if exists (using orderId from fetched order)
        const orderId = orderData.order.orderId;
        let delivery: any = null;
        
        try {
          const deliveryResponse = await fetch(`${API_BASE_URL}/deliveries/order/${orderId}`);
          if (deliveryResponse.ok) {
            const deliveryData = await deliveryResponse.json();
            if (deliveryData.assignments && deliveryData.assignments.length > 0) {
              delivery = deliveryData.assignments[0];
              // Fetch driver info
              if (delivery && delivery.driverId) {
                const driverResponse = await fetch(`${API_BASE_URL}/drivers/${delivery.driverId}`);
                if (driverResponse.ok) {
                  const driverData = await driverResponse.json();
                  if (delivery) {
                    delivery.driver = driverData.driver;
                  }
                }
              }
            }
          }
        } catch (deliveryErr) {
          console.error('Error fetching delivery:', deliveryErr);
          // Continue without delivery info
        }
        
        // Fetch restaurant info
        let restaurant: any = null;
        if (orderData.order.restaurantId) {
          try {
            const restaurantResponse = await fetch(`${API_BASE_URL}/restaurants/${orderData.order.restaurantId}`);
            if (restaurantResponse.ok) {
              const restaurantData = await restaurantResponse.json();
              restaurant = restaurantData.restaurant;
            }
          } catch (restaurantErr) {
            console.error('Error fetching restaurant:', restaurantErr);
            // Continue without restaurant info
          }
        }
        
        setSelectedOrder({
          ...orderData.order,
          items: orderData.items || [],
          restaurant: restaurant?.restaurantName || restaurant?.name || 'Unknown Restaurant',
          delivery: delivery,
        });
      } else {
        setError('Order not found. Please check the order number and try again.');
        setSelectedOrder(null);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError('Failed to search order: ' + (err.message || 'Unknown error'));
      setSelectedOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDeliveryEstimate = async (orderId: number, newEstimate: string) => {
    // Note: Delivery estimate might be stored in delivery assignment or calculated
    // For now, we'll just update the local state
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.orderId === orderId 
          ? { ...order, estimatedDelivery: newEstimate }
          : order
      )
    );
    console.log(`Updated delivery estimate for ${orderId} to ${newEstimate}`);
    // TODO: If there's a backend endpoint for updating delivery estimates, call it here
  };

  const handleAssignDriver = async (orderId: number, driverId: number, driverName: string) => {
    try {
      const staffUsername = localStorage.getItem('staffUsername') || 'staff';
      const response = await fetch(`${API_BASE_URL}/deliveries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          driverId: driverId,
          assignedByStaff: staffUsername,
          deliveryStatus: 'assigned',
        }),
      });
      
      if (response.ok) {
        // Update order status to out_for_delivery
        await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'out_for_delivery' }),
        });
        
        // Refresh orders
        await fetchOrders();
        alert(`Driver ${driverName} assigned to order ${orderId}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign driver');
      }
    } catch (err: any) {
      console.error('Assign driver error:', err);
      alert('Failed to assign driver: ' + err.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        // Refresh orders
        await fetchOrders();
        alert(`Order ${orderId} status updated to ${newStatus}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order status');
      }
    } catch (err: any) {
      console.error('Update order status error:', err);
      alert('Failed to update order status: ' + err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-600';
      case 'confirmed': return 'bg-blue-600';
      case 'preparing': return 'bg-yellow-600';
      case 'ready': return 'bg-blue-600';
      case 'out_for_delivery': return 'bg-purple-600';
      case 'delivering': return 'bg-purple-600';
      case 'delivered': return 'bg-green-600';
      case 'cancelled': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };
  
  const getRestaurantName = async (restaurantId: number): Promise<string> => {
    try {
      const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}`);
      if (response.ok) {
        const data = await response.json();
        return data.restaurant?.restaurantName || 'Unknown Restaurant';
      }
    } catch (err) {
      console.error('Error fetching restaurant:', err);
    }
    return 'Unknown Restaurant';
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md p-8 bg-card/80 backdrop-blur-sm border border-white/10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary mb-2">FrontDash Staff</h1>
            <p className="text-muted-foreground">Please sign in to continue</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={loginForm.username}
                onChange={(e) => {
                  setLoginForm({ ...loginForm, username: e.target.value });
                  setError(null); // Clear error when user types
                }}
                className="bg-background/50 border-white/20"
                placeholder="Enter your username (e.g., smith01)"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={loginForm.password}
                onChange={(e) => {
                  setLoginForm({ ...loginForm, password: e.target.value });
                  setError(null); // Clear error when user types
                }}
                className="bg-background/50 border-white/20"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center mt-6">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="text-muted-foreground hover:text-primary"
            >
              Back to Homepage
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 bg-card/30 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold text-primary">FrontDash Staff</h1>
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary"
            >
              Back to Homepage
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/10 bg-card/20 backdrop-blur-sm min-h-[calc(100vh-73px)]">
          <nav className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
              <TabsList className="grid w-full grid-cols-1 gap-2 bg-transparent h-auto">
                <TabsTrigger 
                  value="orders" 
                  className="w-full justify-start gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                >
                  <Package className="h-4 w-4" />
                  Order Management
                </TabsTrigger>
                <TabsTrigger 
                  value="search" 
                  className="w-full justify-start gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                >
                  <Search className="h-4 w-4" />
                  Retrieve Orders
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="w-full justify-start gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                >
                  <Key className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Order Management */}
            <TabsContent value="orders" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Order Management</h2>
                
                <Card className="bg-card/80 backdrop-blur-sm border-white/10">
                  <div className="p-6">
                    <h3 className="text-lg font-medium mb-4">Active Orders</h3>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead>Order Number</TableHead>
                          <TableHead>Restaurant</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Est. Delivery</TableHead>
                          <TableHead>Driver</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <p className="text-muted-foreground">Loading orders...</p>
                            </TableCell>
                          </TableRow>
                        ) : orders.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <p className="text-muted-foreground">No orders found</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          orders.map((order: any) => {
                            const restaurantName = restaurantNames[order.restaurantId] || 'Loading...';
                            const orderDate = new Date(order.orderTime);
                            const formattedTime = orderDate.toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            });
                            const orderStatus = order.orderStatus || order.status;
                            const customerCode = order.uniqueCustomerCode ? `Customer #${order.uniqueCustomerCode}` : 'Guest';
                            const driverInfo = orderDrivers[order.orderId];
                            const driverName = driverInfo 
                              ? (driverInfo.firstName && driverInfo.lastName 
                                  ? `${driverInfo.firstName} ${driverInfo.lastName}`
                                  : driverInfo.name || "Unassigned")
                              : "Unassigned";
                            
                            return (
                              <TableRow key={order.orderId} className="border-white/10">
                                <TableCell className="font-medium">{order.orderNumber || `#${order.orderId}`}</TableCell>
                                <TableCell>{restaurantName}</TableCell>
                                <TableCell>{customerCode}</TableCell>
                                <TableCell>
                                  <Badge className={`${getStatusColor(orderStatus)} text-white`}>
                                    {orderStatus}
                                  </Badge>
                                </TableCell>
                                <TableCell>{formattedTime}</TableCell>
                                <TableCell>{driverName}</TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    {!driverInfo && (
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button size="sm" variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                                            <Car className="h-3 w-3" />
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-card/95 backdrop-blur-sm border-white/20">
                                          <DialogHeader>
                                            <DialogTitle>Assign Driver - Order #{order.orderId}</DialogTitle>
                                            <DialogDescription>
                                              Select an available driver to handle the delivery of this order.
                                            </DialogDescription>
                                          </DialogHeader>
                                          <div className="space-y-4">
                                            {drivers.length === 0 ? (
                                              <p className="text-muted-foreground">No available drivers</p>
                                            ) : (
                                              drivers.map((driver: any) => (
                                                <div key={driver.driverId} className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
                                                  <div>
                                                    <p className="font-medium">
                                                      {driver.firstName && driver.lastName 
                                                        ? `${driver.firstName} ${driver.lastName}`
                                                        : driver.name || 'Unknown Driver'}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">{driver.vehicle || 'N/A'}</p>
                                                  </div>
                                                  <Button
                                                    size="sm"
                                                    onClick={() => {
                                                      const fullName = driver.firstName && driver.lastName 
                                                        ? `${driver.firstName} ${driver.lastName}`
                                                        : driver.name || 'Unknown Driver';
                                                      handleAssignDriver(order.orderId, driver.driverId, fullName);
                                                    }}
                                                    className="bg-primary hover:bg-primary/90"
                                                  >
                                                    Assign
                                                  </Button>
                                                </div>
                                              ))
                                            )}
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                    )}

                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button size="sm" variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/10">
                                          <CheckCircle className="h-3 w-3" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="bg-card/95 backdrop-blur-sm border-white/20">
                                        <DialogHeader>
                                          <DialogTitle>Update Order Status - Order #{order.orderId}</DialogTitle>
                                          <DialogDescription>
                                            Change the current status of this order to keep customers informed about their delivery progress.
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div>
                                            <Label>New Status</Label>
                                            <Select onValueChange={(value) => handleUpdateOrderStatus(order.orderId, value)}>
                                              <SelectTrigger className="bg-background/50 border-white/20">
                                                <SelectValue placeholder="Select status" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                                <SelectItem value="preparing">Preparing</SelectItem>
                                                <SelectItem value="ready">Ready</SelectItem>
                                                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                                <SelectItem value="delivered">Delivered</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <Button className="w-full bg-primary hover:bg-primary/90">
                                            Update Status
                                          </Button>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Retrieve Orders */}
            <TabsContent value="search" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Retrieve Orders</h2>
                
                <Card className="bg-card/80 backdrop-blur-sm border-white/10 mb-6">
                  <div className="p-6">
                    <h3 className="text-lg font-medium mb-4">Search Order</h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleSearchOrder();
                    }} className="flex gap-4 mb-4">
                      <Input
                        placeholder="Enter Order Number (e.g., FD123ABC)"
                        value={searchOrderNumber}
                        onChange={(e) => {
                          setSearchOrderNumber(e.target.value);
                          setSelectedOrder(null); // Clear previous results when typing
                          setError(null); // Clear error when typing
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSearchOrder();
                          }
                        }}
                        className="bg-background/50 border-white/20"
                        disabled={loading}
                      />
                      <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={loading}>
                        <Search className="h-4 w-4 mr-2" />
                        {loading ? 'Searching...' : 'Search'}
                      </Button>
                    </form>
                    
                    {error && (
                      <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                        {error}
                      </div>
                    )}
                    
                    {selectedOrder && (
                      <Card className="bg-background/50 border-white/10 p-4 mt-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold">Order Details</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedOrder(null)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              Clear
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium mb-2 text-sm text-muted-foreground">Order Information</h5>
                              <p className="mb-1"><strong>Order Number:</strong> {selectedOrder.orderNumber || `#${selectedOrder.orderId}`}</p>
                              <p className="mb-1"><strong>Restaurant:</strong> {selectedOrder.restaurant || 'Unknown'}</p>
                              <p className="mb-1"><strong>Order Time:</strong> {selectedOrder.orderTime ? new Date(selectedOrder.orderTime).toLocaleString() : 'N/A'}</p>
                              <p className="mb-1"><strong>Status:</strong> <Badge className={`${getStatusColor(selectedOrder.orderStatus || selectedOrder.status)} text-white ml-2`}>{selectedOrder.orderStatus || selectedOrder.status}</Badge></p>
                            </div>
                            <div>
                              <h5 className="font-medium mb-2 text-sm text-muted-foreground">Customer Information</h5>
                              <p className="mb-1"><User className="h-4 w-4 inline mr-2" />{selectedOrder.customer || 'Guest Customer'}</p>
                              {selectedOrder.phone && <p className="mb-1"><Phone className="h-4 w-4 inline mr-2" />{selectedOrder.phone}</p>}
                              {selectedOrder.address && <p className="mb-1"><MapPin className="h-4 w-4 inline mr-2" />{selectedOrder.address}</p>}
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <h5 className="font-medium mb-2 text-sm text-muted-foreground">Order Items</h5>
                            {selectedOrder.items && selectedOrder.items.length > 0 ? (
                              <div className="space-y-2">
                                {selectedOrder.items.map((item: any, index: number) => (
                                  <div key={index} className="flex justify-between items-center p-2 bg-background/30 rounded">
                                    <div>
                                      <p className="font-medium">{item.itemName || item.name || `Item ${index + 1}`}</p>
                                      {item.quantity && <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>}
                                    </div>
                                    <p className="font-medium">${((item.itemPrice || item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                                  </div>
                                ))}
                                <div className="mt-3 pt-3 border-t border-white/10">
                                  <div className="flex justify-between mb-1">
                                    <span>Subtotal:</span>
                                    <span>${(selectedOrder.subtotal || 0).toFixed(2)}</span>
                                  </div>
                                  {selectedOrder.tip > 0 && (
                                    <div className="flex justify-between mb-1">
                                      <span>Tip:</span>
                                      <span>${(selectedOrder.tip || 0).toFixed(2)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between font-bold text-lg mt-2">
                                    <span>Total:</span>
                                    <span>${(selectedOrder.grandTotal || selectedOrder.total || 0).toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-muted-foreground">No items found</p>
                            )}
                          </div>
                          
                          {selectedOrder.delivery && (
                            <div className="mt-4">
                              <h5 className="font-medium mb-2 text-sm text-muted-foreground">Delivery Information</h5>
                              <p><strong>Driver:</strong> {selectedOrder.delivery.driver ? 
                                (selectedOrder.delivery.driver.firstName && selectedOrder.delivery.driver.lastName 
                                  ? `${selectedOrder.delivery.driver.firstName} ${selectedOrder.delivery.driver.lastName}`
                                  : selectedOrder.delivery.driver.name || 'Unknown')
                                : "Unassigned"}</p>
                              {selectedOrder.delivery.deliveryStatus && (
                                <p><strong>Delivery Status:</strong> {selectedOrder.delivery.deliveryStatus}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    )}
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Settings</h2>
                
                <Card className="bg-card/80 backdrop-blur-sm border-white/10">
                  <div className="p-6">
                    <h3 className="text-lg font-medium mb-4">Change Password</h3>
                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={changePasswordForm.currentPassword}
                          onChange={(e) => setChangePasswordForm({ 
                            ...changePasswordForm, 
                            currentPassword: e.target.value 
                          })}
                          className="bg-background/50 border-white/20"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={changePasswordForm.newPassword}
                          onChange={(e) => setChangePasswordForm({ 
                            ...changePasswordForm, 
                            newPassword: e.target.value 
                          })}
                          className="bg-background/50 border-white/20"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={changePasswordForm.confirmPassword}
                          onChange={(e) => setChangePasswordForm({ 
                            ...changePasswordForm, 
                            confirmPassword: e.target.value 
                          })}
                          className="bg-background/50 border-white/20"
                          required
                        />
                      </div>
                      <Button type="submit" className="bg-primary hover:bg-primary/90">
                        <Key className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                    </form>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}