import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, Lock, Mail, Utensils, User, Phone, MapPin } from 'lucide-react';

interface RestaurantSignInProps {
  onBack: () => void;
  onSignInSuccess: () => void;
}

export default function RestaurantSignIn({ onBack, onSignInSuccess }: RestaurantSignInProps) {
  const [signInForm, setSignInForm] = useState({ email: '', password: '' });
  const [signUpForm, setSignUpForm] = useState({ 
    ownerName: '', 
    restaurantName: '',
    email: '', 
    password: '', 
    confirmPassword: '',
    phone: '',
    address: ''
  });
  const [activeTab, setActiveTab] = useState('signin');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Restaurant owner signing in:', signInForm);
    onSignInSuccess();
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpForm.password !== signUpForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    console.log('Restaurant owner signing up:', signUpForm);
    onSignInSuccess();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border border-white/10 frontdash-border-glow">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="mr-2 text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center space-x-2">
                <Utensils className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold text-primary">Restaurant Portal</h1>
              </div>
              <p className="text-sm text-muted-foreground">Manage your restaurant on FrontDash</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Sign In Form */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="restaurant-signin-email">Restaurant Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="restaurant-signin-email"
                      type="email"
                      value={signInForm.email}
                      onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                      className="pl-10 bg-background/50 border-white/20"
                      placeholder="restaurant@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="restaurant-signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="restaurant-signin-password"
                      type="password"
                      value={signInForm.password}
                      onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                      className="pl-10 bg-background/50 border-white/20"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-6 frontdash-glow">
                  <Utensils className="h-4 w-4 mr-2" />
                  Access Restaurant Portal
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Forgot your password?
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Sign Up Form */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="restaurant-signup-owner-name">Owner Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="restaurant-signup-owner-name"
                      type="text"
                      value={signUpForm.ownerName}
                      onChange={(e) => setSignUpForm({ ...signUpForm, ownerName: e.target.value })}
                      className="pl-10 bg-background/50 border-white/20"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="restaurant-signup-restaurant-name">Restaurant Name</Label>
                  <div className="relative">
                    <Utensils className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="restaurant-signup-restaurant-name"
                      type="text"
                      value={signUpForm.restaurantName}
                      onChange={(e) => setSignUpForm({ ...signUpForm, restaurantName: e.target.value })}
                      className="pl-10 bg-background/50 border-white/20"
                      placeholder="Your Restaurant Name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="restaurant-signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="restaurant-signup-email"
                      type="email"
                      value={signUpForm.email}
                      onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                      className="pl-10 bg-background/50 border-white/20"
                      placeholder="restaurant@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="restaurant-signup-phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="restaurant-signup-phone"
                      type="tel"
                      value={signUpForm.phone}
                      onChange={(e) => setSignUpForm({ ...signUpForm, phone: e.target.value })}
                      className="pl-10 bg-background/50 border-white/20"
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="restaurant-signup-address">Restaurant Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="restaurant-signup-address"
                      type="text"
                      value={signUpForm.address}
                      onChange={(e) => setSignUpForm({ ...signUpForm, address: e.target.value })}
                      className="pl-10 bg-background/50 border-white/20"
                      placeholder="123 Main St, City, State 12345"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="restaurant-signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="restaurant-signup-password"
                      type="password"
                      value={signUpForm.password}
                      onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                      className="pl-10 bg-background/50 border-white/20"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="restaurant-signup-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="restaurant-signup-confirm-password"
                      type="password"
                      value={signUpForm.confirmPassword}
                      onChange={(e) => setSignUpForm({ ...signUpForm, confirmPassword: e.target.value })}
                      className="pl-10 bg-background/50 border-white/20"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-6 frontdash-glow">
                  <Utensils className="h-4 w-4 mr-2" />
                  Register Restaurant
                </Button>

                <div className="text-center text-xs text-muted-foreground mt-4">
                  Restaurant registration requires verification and approval
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}