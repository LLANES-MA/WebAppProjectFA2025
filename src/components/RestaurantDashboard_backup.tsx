import { useState } from 'react';
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
}

const recentOrders = [
  {
    id: '1234',
    customer: 'John D.',
    items: 'Margherita Pizza, Caesar Salad',
    total: 28.50,
    status: 'preparing',
    time: '10 min ago',
    estimatedReady: '15 min'
  },
  {
    id: '1235',
    customer: 'Sarah M.',
    items: 'Chicken Alfredo, Garlic Bread',
    total: 24.99,
    status: 'ready',
    time: '5 min ago',
    estimatedReady: 'Ready now'
  },
  {
    id: '1236',
    customer: 'Mike R.',
    items: 'BBQ Pizza, Wings',
    total: 35.75,
    status: 'delivered',
    time: '25 min ago',
    estimatedReady: 'Delivered'
  }
];

const menuItems = [
  {
    id: 1,
    name: 'Margherita Pizza',
    description: 'Fresh mozzarella, tomato sauce, basil',
    price: 18.99,
    category: 'Pizza',
    available: true,
    popular: true
  },
  {
    id: 2,
    name: 'Chicken Alfredo',
    description: 'Grilled chicken with creamy alfredo sauce',
    price: 22.99,
    category: 'Pasta',
    available: true,
    popular: false
  },
  {
    id: 3,
    name: 'Caesar Salad',
    description: 'Fresh romaine, parmesan, croutons, caesar dressing',
    price: 12.99,
    category: 'Salads',
    available: false,
    popular: false
  }
];

export default function RestaurantDashboard({ onBack }: RestaurantDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  
  // Operating hours state
  const [operatingHours, setOperatingHours] = useState({
    monday: { open: '09:00', close: '22:00', closed: false },
    tuesday: { open: '09:00', close: '22:00', closed: false },
    wednesday: { open: '09:00', close: '22:00', closed: false },
    thursday: { open: '09:00', close: '22:00', closed: false },
    friday: { open: '09:00', close: '23:00', closed: false },
    saturday: { open: '10:00', close: '23:00', closed: false },
    sunday: { open: '10:00', close: '21:00', closed: false }
  });

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

  const handleLeaveFrontDash = () => {
    // In a real app, this would remove the restaurant from the platform
    console.log('Restaurant leaving FrontDash platform');
    setIsLeaveDialogOpen(false);
    // Redirect to homepage or show success message
    onBack();
  };

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
              <span className="text-foreground font-medium">Mario's Pizzeria</span>
              <Badge className="bg-green-500/20 text-green-500">Active</Badge>
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
                      <p className="text-2xl font-bold text-foreground">$543.20</p>
                      <p className="text-xs text-green-500 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +12% from yesterday
                      </p>
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
                      <p className="text-2xl font-bold text-foreground">23</p>
                      <p className="text-xs text-green-500 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +5 from yesterday
                      </p>
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
                      <p className="text-sm text-muted-foreground">Avg. Rating</p>
                      <p className="text-2xl font-bold text-foreground">4.8</p>
                      <p className="text-xs text-muted-foreground mt-1">Based on 127 reviews</p>
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
                      <p className="text-2xl font-bold text-foreground">22m</p>
                      <p className="text-xs text-green-500 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        2m faster than avg
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
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium text-foreground">Order #{order.id}</p>
                          <p className="text-sm text-muted-foreground">{order.customer}</p>
                        </div>
                        <div>
                          <p className="text-sm text-foreground">{order.items}</p>
                          <p className="text-sm text-muted-foreground">{order.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium text-foreground">${order.total}</p>
                          <p className="text-xs text-muted-foreground">{order.estimatedReady}</p>
                        </div>
                        <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </Badge>
                      </div>
                    </div>
                  ))}
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
                  {recentOrders.map((order) => (
                    <div key={order.id} className="p-4 bg-background/50 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-foreground">Order #{order.id}</h4>
                          <p className="text-sm text-muted-foreground">Customer: {order.customer} • {order.time}</p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </Badge>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-foreground">{order.items}</p>
                        <p className="text-lg font-medium text-foreground mt-1">Total: ${order.total}</p>
                      </div>

                      {order.status === 'preparing' && (
                        <div className="flex space-x-2">
                          <Button size="sm" className="bg-green-500 hover:bg-green-600">
                            Mark Ready
                          </Button>
                          <Button size="sm" variant="outline" className="border-white/20">
                            Contact Customer
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
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
                            <Switch checked={item.available} />
                            <span className="text-xs text-muted-foreground">
                              {item.available ? 'Available' : 'Unavailable'}
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
                      <span className="font-medium">$23.60</span>
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
                    <Input defaultValue="Mario's Pizzeria" className="bg-card/50 border-white/10" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <Input defaultValue="(555) 123-4567" className="bg-card/50 border-white/10" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea 
                    defaultValue="Authentic Italian cuisine with fresh ingredients and traditional recipes passed down through generations."
                    className="bg-card/50 border-white/10"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Delivery Fee</label>
                    <Input defaultValue="$2.99" className="bg-card/50 border-white/10" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Minimum Order</label>
                    <Input defaultValue="$15.00" className="bg-card/50 border-white/10" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Prep Time</label>
                    <Input defaultValue="25 minutes" className="bg-card/50 border-white/10" />
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
                  <Button className="bg-primary hover:bg-primary/80">
                    Save Changes
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