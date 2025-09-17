import { ArrowLeft, User, Mail, Phone, MapPin, Edit, Shield, Bell, CreditCard, Menu, ShoppingBag, Search, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { useState } from 'react';

interface AccountProps {
  onBack: () => void;
  onRestaurantSignup?: () => void;
  onGoToAdmin?: () => void;
  onGoToStaff?: () => void;
  onViewAllRestaurants?: () => void;
  onViewCart?: () => void;
  onGoToSettings?: () => void;
}

export default function Account({ 
  onBack, 
  onRestaurantSignup, 
  onGoToAdmin, 
  onGoToStaff, 
  onViewAllRestaurants, 
  onViewCart,
  onGoToSettings 
}: AccountProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, New York, NY 10001'
  });

  const [editInfo, setEditInfo] = useState({ ...userInfo });

  const handleSave = () => {
    setUserInfo({ ...editInfo });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditInfo({ ...userInfo });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/40 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">My Account</h1>
                <p className="text-sm text-muted-foreground">Manage your profile and preferences</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold text-primary">FrontDash</h2>
                <div className="w-4 h-4 border border-primary rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                </div>
              </div>
              
              {/* Menu Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] bg-background/95 backdrop-blur-sm border-white/10">
                  <SheetHeader>
                    <SheetTitle className="flex items-center space-x-2 text-left">
                      <div className="font-semibold text-primary">FrontDash</div>
                      <div className="w-3 h-3 border border-primary rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 bg-primary rounded-full"></div>
                      </div>
                    </SheetTitle>
                    <SheetDescription>
                      Navigate through FrontDash's features and services
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="flex flex-col space-y-6 mt-8">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search for restaurants..."
                        className="pl-10 bg-card/50 border-white/10 text-foreground"
                      />
                    </div>

                    {/* Main Navigation */}
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground mb-3 px-2">BROWSE</div>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => {
                          if (onViewAllRestaurants) onViewAllRestaurants();
                        }}
                      >
                        <Search className="h-4 w-4 mr-3" />
                        Food & Restaurants
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => {
                          if (onViewCart) onViewCart();
                        }}
                      >
                        <ShoppingBag className="h-4 w-4 mr-3" />
                        Cart
                      </Button>
                    </div>

                    {/* Account Section */}
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground mb-3 px-2">ACCOUNT</div>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-primary hover:text-primary/80 hover:bg-primary/10"
                      >
                        <User className="h-4 w-4 mr-3" />
                        My Account
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-foreground hover:text-foreground/80 hover:bg-muted/10"
                        onClick={() => {
                          if (onGoToSettings) onGoToSettings();
                        }}
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </Button>
                    </div>

                    {/* Business Section */}
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground mb-3 px-2">BUSINESS</div>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => {
                          if (onRestaurantSignup) onRestaurantSignup();
                        }}
                      >
                        For Restaurants
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/10"
                        onClick={() => {
                          if (onGoToAdmin) onGoToAdmin();
                        }}
                      >
                        Admin Portal
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/10"
                        onClick={() => {
                          if (onGoToStaff) onGoToStaff();
                        }}
                      >
                        Staff Portal
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Info Card */}
            <Card className="bg-card/40 backdrop-blur-sm border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-primary" />
                    <span>Profile Information</span>
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                    className="border-white/20"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-primary/20 text-primary text-lg">
                      {userInfo.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm" className="border-white/20">
                      Change Photo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG max 5MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editInfo.name}
                        onChange={(e) => setEditInfo({ ...editInfo, name: e.target.value })}
                        className="bg-background/50"
                      />
                    ) : (
                      <p className="mt-1 text-foreground">{userInfo.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editInfo.email}
                        onChange={(e) => setEditInfo({ ...editInfo, email: e.target.value })}
                        className="bg-background/50"
                      />
                    ) : (
                      <p className="mt-1 text-foreground">{userInfo.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editInfo.phone}
                        onChange={(e) => setEditInfo({ ...editInfo, phone: e.target.value })}
                        className="bg-background/50"
                      />
                    ) : (
                      <p className="mt-1 text-foreground">{userInfo.phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address</Label>
                    {isEditing ? (
                      <Input
                        id="address"
                        value={editInfo.address}
                        onChange={(e) => setEditInfo({ ...editInfo, address: e.target.value })}
                        className="bg-background/50"
                      />
                    ) : (
                      <p className="mt-1 text-foreground">{userInfo.address}</p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex space-x-3">
                    <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancel} className="border-white/20">
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order History */}
            <Card className="bg-card/40 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((order) => (
                    <div key={order} className="flex items-center justify-between p-4 bg-background/30 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">Order #{1000 + order}</h4>
                          <p className="text-sm text-muted-foreground">Dec {10 + order}, 2024 • $25.99</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                        Delivered
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <Card className="bg-card/40 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-white/20"
                  onClick={() => {
                    if (onGoToSettings) onGoToSettings();
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button variant="outline" className="w-full justify-start border-white/20">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button variant="outline" className="w-full justify-start border-white/20">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Methods
                </Button>
                <Button variant="outline" className="w-full justify-start border-white/20">
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy & Security
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    Premium
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Orders</span>
                  <span className="text-sm font-medium text-foreground">47</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Points Balance</span>
                  <span className="text-sm font-medium text-primary">1,250</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}