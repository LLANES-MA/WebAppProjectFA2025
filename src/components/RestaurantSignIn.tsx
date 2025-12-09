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
  const [signInForm, setSignInForm] = useState({ username: '', password: '' });
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
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  function validateUsername(username: string) {
    if (!username.trim()) {
      return 'Username is required';
    }
    // Restaurant usernames can be email addresses or any format
    // Just check that it's not empty
    return '';
  }
  function validatePassword(password: string) {
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain a number';
    return '';
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    const newErrors: {[key: string]: string} = {};
    newErrors.username = validateUsername(signInForm.username);
    newErrors.password = validatePassword(signInForm.password);
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;
    
    setIsLoading(true);
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
      const response = await fetch(`${API_BASE_URL}/auth/restaurant/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: signInForm.username,
          password: signInForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setAuthError(data.error || 'Invalid username or password');
        setIsLoading(false);
        return;
      }

      // Authentication successful
      console.log('✅ Restaurant authentication successful:', data);
      console.log('📝 Storing restaurantId:', data.restaurantId);
      
      // Store restaurant ID in localStorage for dashboard access
      if (data.restaurantId) {
        localStorage.setItem('restaurantId', data.restaurantId.toString());
        console.log('✅ restaurantId stored in localStorage:', localStorage.getItem('restaurantId'));
      } else {
        console.error('❌ No restaurantId in response:', data);
      }
      
      setIsLoading(false);
      onSignInSuccess();
    } catch (error: any) {
      console.error('Authentication error:', error);
      setAuthError('Failed to connect to server. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {[key: string]: string} = {};
    newErrors.email = validateUsername(signUpForm.email);
    newErrors.password = validatePassword(signUpForm.password);
    if (signUpForm.password !== signUpForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;
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
                  <Label htmlFor="restaurant-signin-username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="restaurant-signin-username"
                      type="text"
                      value={signInForm.username}
                      onChange={(e) => {
                        setSignInForm({ ...signInForm, username: e.target.value });
                        if (errors.username) setErrors(prev => ({ ...prev, username: '' }));
                      }}
                      className={`pl-10 bg-background/50 border-white/20${errors.username ? ' border-destructive' : ''}`}
                      placeholder="Your username"
                      required
                    />
                  </div>
                  {errors.username && <p className="text-xs text-destructive mt-1">{errors.username}</p>}
                </div>

                <div>
                  <Label htmlFor="restaurant-signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="restaurant-signin-password"
                      type="password"
                      value={signInForm.password}
                      onChange={(e) => {
                        setSignInForm({ ...signInForm, password: e.target.value });
                        if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                      }}
                      className={`pl-10 bg-background/50 border-white/20${errors.password ? ' border-destructive' : ''}`}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
                </div>

                {authError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive">{authError}</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 mt-6 frontdash-glow"
                  disabled={isLoading}
                >
                  <Utensils className="h-4 w-4 mr-2" />
                  {isLoading ? 'Signing in...' : 'Access Restaurant Portal'}
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
                      onChange={(e) => {
                        setSignUpForm({ ...signUpForm, email: e.target.value });
                        if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                      }}
                      className={`pl-10 bg-background/50 border-white/20${errors.email ? ' border-destructive' : ''}`}
                      placeholder="restaurant@email.com"
                      required
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
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
                      onChange={(e) => {
                        setSignUpForm({ ...signUpForm, password: e.target.value });
                        if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                      }}
                      className={`pl-10 bg-background/50 border-white/20${errors.password ? ' border-destructive' : ''}`}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
                </div>

                <div>
                  <Label htmlFor="restaurant-signup-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="restaurant-signup-confirm-password"
                      type="password"
                      value={signUpForm.confirmPassword}
                      onChange={(e) => {
                        setSignUpForm({ ...signUpForm, confirmPassword: e.target.value });
                        if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                      }}
                      className={`pl-10 bg-background/50 border-white/20${errors.confirmPassword ? ' border-destructive' : ''}`}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
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