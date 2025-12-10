import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { ArrowLeft, Lock, Mail, Utensils, User, Clock, Phone } from 'lucide-react';
import { getPendingRestaurants } from '../services/restaurantService';

interface RestaurantSignInProps {
  onBack: () => void;
  onSignInSuccess: (restaurantData?: { restaurantId: number; restaurantStatus: string; restaurantName: string }) => void;
  onAccountCreated?: (accountData: { email: string; password: string }) => void;
}

// Generate a random 9-character password
function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  // Ensure at least one uppercase, one lowercase, and one number
  password += chars[Math.floor(Math.random() * 26)]; // Uppercase
  password += chars[26 + Math.floor(Math.random() * 26)]; // Lowercase
  password += chars[52 + Math.floor(Math.random() * 10)]; // Number
  // Fill remaining 6 characters randomly
  for (let i = 3; i < 9; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export default function RestaurantSignIn({ onBack, onSignInSuccess, onAccountCreated }: RestaurantSignInProps) {
  const [signInForm, setSignInForm] = useState({ username: '', password: '' });
  const [signUpForm, setSignUpForm] = useState({ 
    email: ''
  });
  const [activeTab, setActiveTab] = useState('signin');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPendingApproval, setShowPendingApproval] = useState(false);
  const [pendingRestaurantData, setPendingRestaurantData] = useState<{
    restaurantId: number;
    restaurantName: string;
    email: string;
  } | null>(null);

  function validateUsername(username: string) {
    if (!username.trim()) {
      return 'Username is required';
    }
    // Restaurant usernames can be email addresses or any format
    // Just check that it's not empty
    return '';
  }

  function validatePassword(password: string) {
    if (!password || password.length === 0) {
      return 'Password is required';
    }
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
        // Check if the email/username exists in pending restaurants
        try {
          const pendingRestaurants = await getPendingRestaurants();
          const emailOrUsername = signInForm.username.toLowerCase().trim();
          
          // Check if email matches any pending restaurant
          const pendingRestaurant = pendingRestaurants.find((restaurant: any) => 
            restaurant.email && restaurant.email.toLowerCase().trim() === emailOrUsername
          );
          
          if (pendingRestaurant) {
            // Found in pending restaurants - show pending approval page
            setPendingRestaurantData({
              restaurantId: pendingRestaurant.id,
              restaurantName: pendingRestaurant.restaurantName || pendingRestaurant.name || 'Your Restaurant',
              email: pendingRestaurant.email || signInForm.username
            });
            setShowPendingApproval(true);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error checking pending restaurants:', error);
        }
        
        // If not found in pending restaurants, show error
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
      
      // Check restaurant status
      const status = (data.restaurantStatus || 'pending').toLowerCase();
      
      if (status !== 'approved') {
        // Show pending approval page
        setPendingRestaurantData({
          restaurantId: data.restaurantId,
          restaurantName: data.restaurantName || 'Your Restaurant',
          email: data.username || signInForm.username
        });
        setShowPendingApproval(true);
      } else {
        // Restaurant is approved - navigate to dashboard
        const restaurantData = {
          restaurantId: data.restaurantId,
          restaurantStatus: data.restaurantStatus || 'approved',
          restaurantName: data.restaurantName || 'Your Restaurant'
        };
        onSignInSuccess(restaurantData);
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setAuthError('Failed to connect to server. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {[key: string]: string} = {};
    
    // Validate email
    if (!signUpForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpForm.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;
    
    // Generate a 9-character password automatically
    const generatedPassword = generatePassword();
    console.log('Restaurant account creation:', { email: signUpForm.email, passwordGenerated: true });
    
    // Pass account data to parent component to navigate to registration form
    if (onAccountCreated) {
      onAccountCreated({
        email: signUpForm.email,
        password: generatedPassword
      });
    }
  };

  // Show pending approval page if restaurant is pending
  if (showPendingApproval && pendingRestaurantData) {
    return (
      <div className="min-h-screen bg-background frontdash-animated-bg">
        <header className="border-b border-white/10 bg-background/80 backdrop-blur-md">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Utensils className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold text-primary">Restaurant Portal</h1>
                <div className="w-4 h-4 border border-primary rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                </div>
                <span className="text-muted-foreground">|</span>
                <span className="text-foreground">Pending Approval</span>
              </div>
              <Button variant="ghost" onClick={() => {
                setShowPendingApproval(false);
                setPendingRestaurantData(null);
                setSignInForm({ username: '', password: '' });
              }}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
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
                  <p className="text-foreground font-medium text-lg">
                    {pendingRestaurantData.restaurantName}
                  </p>
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

            <div className="flex justify-center">
              <Button 
                onClick={() => {
                  setShowPendingApproval(false);
                  setPendingRestaurantData(null);
                  setSignInForm({ username: '', password: '' });
                }}
                className="bg-primary hover:bg-primary/90 frontdash-glow"
              >
                Return to Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  <Label htmlFor="restaurant-signup-email">Email Address</Label>
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

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-sm text-blue-400">
                    🔐 A secure 9-character password will be automatically generated for your account.
                  </p>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-6 frontdash-glow">
                  Create Account & Continue
                </Button>

                <div className="text-center mt-4">
                  <span className="text-sm text-muted-foreground">Already have an account? </span>
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-primary hover:text-primary/80 p-0 h-auto"
                    onClick={() => setActiveTab('signin')}
                  >
                    Sign in instead
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </Card>

    </div>
  );
}