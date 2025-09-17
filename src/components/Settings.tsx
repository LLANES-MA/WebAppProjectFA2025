import { ArrowLeft, Bell, Shield, Eye, Globe, Smartphone, CreditCard, Menu, ShoppingBag, Search, User, Settings as SettingsIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { useState } from 'react';

interface SettingsProps {
  onBack: () => void;
  onRestaurantSignup?: () => void;
  onGoToAdmin?: () => void;
  onGoToStaff?: () => void;
  onViewAllRestaurants?: () => void;
  onViewCart?: () => void;
  onGoToAccount?: () => void;
}

export default function Settings({ 
  onBack, 
  onRestaurantSignup, 
  onGoToAdmin, 
  onGoToStaff, 
  onViewAllRestaurants, 
  onViewCart,
  onGoToAccount 
}: SettingsProps) {
  const [settings, setSettings] = useState({
    // Notifications
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotionalOffers: true,
    
    // Privacy
    shareData: false,
    locationServices: true,
    cookieConsent: true,
    
    // Preferences
    language: 'en',
    currency: 'usd',
    theme: 'dark',
    defaultAddress: '',
    
    // Security
    twoFactorAuth: false,
    biometricAuth: true,
    sessionTimeout: '30'
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
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
                <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground">Manage your app preferences and privacy</p>
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
                        className="w-full justify-start text-foreground hover:text-foreground/80 hover:bg-muted/10"
                        onClick={() => {
                          if (onGoToAccount) onGoToAccount();
                        }}
                      >
                        <User className="h-4 w-4 mr-3" />
                        My Account
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-primary hover:text-primary/80 hover:bg-primary/10"
                      >
                        <SettingsIcon className="h-4 w-4 mr-3" />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Notifications Settings */}
          <Card className="bg-card/40 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                />
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get updates via email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive text messages</p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                />
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Order Updates</Label>
                  <p className="text-sm text-muted-foreground">Track your order status</p>
                </div>
                <Switch
                  checked={settings.orderUpdates}
                  onCheckedChange={(checked) => handleSettingChange('orderUpdates', checked)}
                />
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Promotional Offers</Label>
                  <p className="text-sm text-muted-foreground">Special deals and discounts</p>
                </div>
                <Switch
                  checked={settings.promotionalOffers}
                  onCheckedChange={(checked) => handleSettingChange('promotionalOffers', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="bg-card/40 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Privacy & Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Extra security for your account</p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                />
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Biometric Authentication</Label>
                  <p className="text-sm text-muted-foreground">Use fingerprint or face ID</p>
                </div>
                <Switch
                  checked={settings.biometricAuth}
                  onCheckedChange={(checked) => handleSettingChange('biometricAuth', checked)}
                />
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Location Services</Label>
                  <p className="text-sm text-muted-foreground">Allow location access</p>
                </div>
                <Switch
                  checked={settings.locationServices}
                  onCheckedChange={(checked) => handleSettingChange('locationServices', checked)}
                />
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Share Usage Data</Label>
                  <p className="text-sm text-muted-foreground">Help improve our service</p>
                </div>
                <Switch
                  checked={settings.shareData}
                  onCheckedChange={(checked) => handleSettingChange('shareData', checked)}
                />
              </div>
              <Separator className="bg-white/10" />
              <div className="space-y-2">
                <Label>Session Timeout</Label>
                <Select value={settings.sessionTimeout} onValueChange={(value) => handleSettingChange('sessionTimeout', value)}>
                  <SelectTrigger className="bg-background/50 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* App Preferences */}
          <Card className="bg-card/40 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5 text-primary" />
                <span>App Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                  <SelectTrigger className="bg-background/50 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={settings.currency} onValueChange={(value) => handleSettingChange('currency', value)}>
                  <SelectTrigger className="bg-background/50 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                    <SelectItem value="gbp">GBP (£)</SelectItem>
                    <SelectItem value="cad">CAD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={settings.theme} onValueChange={(value) => handleSettingChange('theme', value)}>
                  <SelectTrigger className="bg-background/50 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Default Delivery Address</Label>
                <Input
                  value={settings.defaultAddress}
                  onChange={(e) => handleSettingChange('defaultAddress', e.target.value)}
                  placeholder="Enter your default address"
                  className="bg-background/50 border-white/20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="bg-card/40 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <span>Account Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start border-white/20"
                onClick={() => {
                  if (onGoToAccount) onGoToAccount();
                }}
              >
                <User className="h-4 w-4 mr-2" />
                View Account Details
              </Button>
              <Button variant="outline" className="w-full justify-start border-white/20">
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Payment Methods
              </Button>
              <Button variant="outline" className="w-full justify-start border-white/20">
                <Eye className="h-4 w-4 mr-2" />
                Download Your Data
              </Button>
              <Separator className="bg-white/10" />
              <Button variant="outline" className="w-full justify-start border-red-500/50 text-red-400 hover:bg-red-500/10">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Save Changes */}
        <div className="mt-8 flex justify-center">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
            Save All Changes
          </Button>
        </div>
      </div>
    </div>
  );
}