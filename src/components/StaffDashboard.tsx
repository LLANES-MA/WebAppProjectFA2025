import { useState } from 'react';
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
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [changePasswordForm, setChangePasswordForm] = useState({ 
    currentPassword: "", 
    newPassword: "", 
    confirmPassword: "" 
  });
  const [searchOrderId, setSearchOrderId] = useState("");
  const [orders, setOrders] = useState(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock login - in real app, validate against backend
    if (loginForm.email && loginForm.password) {
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginForm({ email: "", password: "" });
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

  const handleSearchOrder = () => {
    const order = orders.find(o => o.id === searchOrderId);
    if (order) {
      setSelectedOrder(order);
    } else {
      alert("Order not found!");
    }
  };

  const handleUpdateDeliveryEstimate = (orderId: string, newEstimate: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, estimatedDelivery: newEstimate }
          : order
      )
    );
    console.log(`Updated delivery estimate for ${orderId} to ${newEstimate}`);
  };

  const handleAssignDriver = (orderId: string, driverId: number, driverName: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, driverId, driver: driverName, status: "delivering" }
          : order
      )
    );
    console.log(`Assigned driver ${driverName} to order ${orderId}`);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      )
    );
    console.log(`Updated order ${orderId} status to ${newStatus}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-600';
      case 'ready': return 'bg-blue-600';
      case 'delivering': return 'bg-purple-600';
      case 'delivered': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
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
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="bg-background/50 border-white/20"
                placeholder="staff@frontdash.com"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="bg-background/50 border-white/20"
                placeholder="••••••••"
                required
              />
            </div>
            
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              Sign In
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
                          <TableHead>Order ID</TableHead>
                          <TableHead>Restaurant</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Est. Delivery</TableHead>
                          <TableHead>Driver</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id} className="border-white/10">
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>{order.restaurant}</TableCell>
                            <TableCell>{order.customer}</TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(order.status)} text-white`}>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{order.estimatedDelivery}</TableCell>
                            <TableCell>{order.driver || "Unassigned"}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                                      <Clock className="h-3 w-3" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-card/95 backdrop-blur-sm border-white/20">
                                    <DialogHeader>
                                      <DialogTitle>Update Delivery Time - {order.id}</DialogTitle>
                                      <DialogDescription>
                                        Modify the estimated delivery time for this order to provide accurate updates to the customer.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label>New Estimated Delivery Time</Label>
                                        <Input
                                          type="time"
                                          defaultValue={order.estimatedDelivery}
                                          className="bg-background/50 border-white/20"
                                          onChange={(e) => handleUpdateDeliveryEstimate(order.id, e.target.value)}
                                        />
                                      </div>
                                      <Button 
                                        onClick={() => handleUpdateDeliveryEstimate(order.id, "15:45")} 
                                        className="w-full bg-primary hover:bg-primary/90"
                                      >
                                        Update Time
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                {!order.driverId && (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button size="sm" variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                                        <Car className="h-3 w-3" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-card/95 backdrop-blur-sm border-white/20">
                                      <DialogHeader>
                                        <DialogTitle>Assign Driver - {order.id}</DialogTitle>
                                        <DialogDescription>
                                          Select an available driver to handle the delivery of this order.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        {availableDrivers.filter(d => d.status === 'available').map((driver) => (
                                          <div key={driver.id} className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
                                            <div>
                                              <p className="font-medium">{driver.name}</p>
                                              <p className="text-sm text-muted-foreground">{driver.vehicle}</p>
                                            </div>
                                            <Button
                                              size="sm"
                                              onClick={() => handleAssignDriver(order.id, driver.id, driver.name)}
                                              className="bg-primary hover:bg-primary/90"
                                            >
                                              Assign
                                            </Button>
                                          </div>
                                        ))}
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
                                      <DialogTitle>Update Order Status - {order.id}</DialogTitle>
                                      <DialogDescription>
                                        Change the current status of this order to keep customers informed about their delivery progress.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label>New Status</Label>
                                        <Select onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}>
                                          <SelectTrigger className="bg-background/50 border-white/20">
                                            <SelectValue placeholder="Select status" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="preparing">Preparing</SelectItem>
                                            <SelectItem value="ready">Ready</SelectItem>
                                            <SelectItem value="delivering">Delivering</SelectItem>
                                            <SelectItem value="delivered">Delivered</SelectItem>
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
                        ))}
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
                    <div className="flex gap-4 mb-4">
                      <Input
                        placeholder="Enter Order ID (e.g., ORD001)"
                        value={searchOrderId}
                        onChange={(e) => setSearchOrderId(e.target.value)}
                        className="bg-background/50 border-white/20"
                      />
                      <Button onClick={handleSearchOrder} className="bg-primary hover:bg-primary/90">
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </Button>
                    </div>
                    
                    {selectedOrder && (
                      <Card className="bg-background/50 border-white/10 p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Order Details</h4>
                            <p><strong>Order ID:</strong> {selectedOrder.id}</p>
                            <p><strong>Restaurant:</strong> {selectedOrder.restaurant}</p>
                            <p><strong>Order Time:</strong> {selectedOrder.orderTime}</p>
                            <p><strong>Status:</strong> <Badge className={`${getStatusColor(selectedOrder.status)} text-white ml-2`}>{selectedOrder.status}</Badge></p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Customer Info</h4>
                            <p><User className="h-4 w-4 inline mr-2" />{selectedOrder.customer}</p>
                            <p><Phone className="h-4 w-4 inline mr-2" />{selectedOrder.phone}</p>
                            <p><MapPin className="h-4 w-4 inline mr-2" />{selectedOrder.address}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Items</h4>
                            <ul className="text-sm space-y-1">
                              {selectedOrder.items.map((item: string, index: number) => (
                                <li key={index}>• {item}</li>
                              ))}
                            </ul>
                            <p className="font-medium mt-2">Total: {selectedOrder.total}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Delivery Info</h4>
                            <p><strong>Estimated:</strong> {selectedOrder.estimatedDelivery}</p>
                            <p><strong>Driver:</strong> {selectedOrder.driver || "Unassigned"}</p>
                          </div>
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