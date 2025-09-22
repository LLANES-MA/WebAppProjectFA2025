import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, User, Lock, Mail, Users, Shield, Utensils, UserCircle, ArrowRight } from 'lucide-react';

interface SignInProps {
  onBack: () => void;
  onSignInSuccess?: (userType: string) => void;
  onGoToAdmin?: () => void;
  onGoToStaff?: () => void;
  onGoToRestaurantDashboard?: () => void;
  onGoToAdminSignIn?: () => void;
  onGoToStaffSignIn?: () => void;
  onGoToRestaurantSignIn?: () => void;
  targetUserType?: 'customer' | 'admin' | 'staff' | 'restaurant';
}

export default function SignIn({ onBack, onSignInSuccess, onGoToAdmin, onGoToStaff, onGoToRestaurantDashboard, onGoToAdminSignIn, onGoToStaffSignIn, onGoToRestaurantSignIn, targetUserType = 'customer' }: SignInProps) {
  const [signInForm, setSignInForm] = useState({ username: '', password: '' });
  const [signUpForm, setSignUpForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    adminCode: '',
    staffId: '',
    restaurantCode: ''
  });
  const [activeTab, setActiveTab] = useState('signin');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Username validation: min 2 chars + 2 digits (except admin)
  function validateUsername(username: string, isAdmin: boolean) {
    if (isAdmin) return '';
    if (!/^[A-Za-z]{2,}\d{2,}$/.test(username)) {
      return 'Username must have at least 2 letters followed by at least 2 digits';
    }
    return '';
  }

  // Password validation: min 6 chars, 1 upper, 1 lower, 1 number
  function validatePassword(password: string) {
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain a number';
    return '';
  }

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {[key: string]: string} = {};
    newErrors.username = validateUsername(signInForm.username, targetUserType === 'admin');
    newErrors.password = validatePassword(signInForm.password);
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;
    // Mock sign in - in real app, validate against backend
    console.log(`${targetUserType} signing in:`, signInForm);
    
    // Route to appropriate dashboard based on target user type
    switch (targetUserType) {
      case 'admin':
        if (onGoToAdmin) onGoToAdmin();
        break;
      case 'staff':
        if (onGoToStaff) onGoToStaff();
        break;
      case 'restaurant':
        if (onGoToRestaurantDashboard) onGoToRestaurantDashboard();
        break;
      case 'customer':
      default:
        if (onSignInSuccess) onSignInSuccess('customer');
        break;
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {[key: string]: string} = {};
    newErrors.email = validateUsername(signUpForm.email, targetUserType === 'admin');
    newErrors.password = validatePassword(signUpForm.password);
    if (signUpForm.password !== signUpForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;
    // Mock sign up - in real app, create account in backend
    if (signUpForm.password !== signUpForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    // Validation for specialized accounts
    if (targetUserType === 'admin' && (!signUpForm.adminCode || signUpForm.adminCode !== 'ADMIN2024')) {
      alert('Invalid admin authorization code');
      return;
    }
    if (targetUserType === 'staff' && !signUpForm.staffId) {
      alert('Staff ID is required');
      return;
    }
    if (targetUserType === 'restaurant' && (!signUpForm.restaurantCode || signUpForm.restaurantCode !== 'REST2024')) {
      alert('Invalid restaurant registration code');
      return;
    }
    
    console.log(`${targetUserType} signing up:`, signUpForm);
    
    // Route to appropriate dashboard based on target user type
    switch (targetUserType) {
      case 'admin':
        if (onGoToAdmin) onGoToAdmin();
        break;
      case 'staff':
        if (onGoToStaff) onGoToStaff();
        break;
      case 'restaurant':
        if (onGoToRestaurantDashboard) onGoToRestaurantDashboard();
        break;
      case 'customer':
      default:
        if (onSignInSuccess) onSignInSuccess('customer');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border border-white/10">
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
              <h1 className="text-2xl font-bold text-primary">Welcome to FrontDash</h1>
              <p className="text-sm text-muted-foreground">
                {targetUserType === 'admin' ? 'Admin Portal Access' :
                 targetUserType === 'staff' ? 'Staff Portal Access' :
                 targetUserType === 'restaurant' ? 'Restaurant Portal Access' :
                 'Sign in to your account or create a new one'}
              </p>
            </div>
          </div>

          {/* Navigation Buttons for Specialized Access - Only show for customer mode */}
          {targetUserType === 'customer' && (
            <div className="mb-6 space-y-3">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">Specialized Access</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  onClick={onGoToAdminSignIn}
                  className="w-full justify-between bg-background/50 border-white/20 hover:bg-primary/10 hover:border-primary/50"
                >
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Admin Portal</span>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={onGoToStaffSignIn}
                  className="w-full justify-between bg-background/50 border-white/20 hover:bg-primary/10 hover:border-primary/50"
                >
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>Staff Portal</span>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={onGoToRestaurantSignIn}
                  className="w-full justify-between bg-background/50 border-white/20 hover:bg-primary/10 hover:border-primary/50"
                >
                  <div className="flex items-center space-x-2">
                    <Utensils className="h-4 w-4 text-primary" />
                    <span>Restaurant Portal</span>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Divider - Only show for customer mode */}
          {targetUserType === 'customer' && (
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Customer Access</span>
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Sign In Form */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="signin-username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-username"
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
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-password"
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

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-6 frontdash-glow">
                  {targetUserType === 'admin' && <Shield className="h-4 w-4 mr-2" />}
                  {targetUserType === 'staff' && <Users className="h-4 w-4 mr-2" />}
                  {targetUserType === 'restaurant' && <Utensils className="h-4 w-4 mr-2" />}
                  {targetUserType === 'customer' && <UserCircle className="h-4 w-4 mr-2" />}
                  Sign In {targetUserType === 'admin' ? 'as Admin' :
                          targetUserType === 'staff' ? 'as Staff' :
                          targetUserType === 'restaurant' ? 'as Restaurant Owner' :
                          'as Customer'}
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
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      value={signUpForm.name}
                      onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                      className="pl-10 bg-background/50 border-white/20"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      value={signUpForm.email}
                      onChange={(e) => {
                        setSignUpForm({ ...signUpForm, email: e.target.value });
                        if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                      }}
                      className={`pl-10 bg-background/50 border-white/20${errors.email ? ' border-destructive' : ''}`}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
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
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-confirm-password"
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

                {/* Admin-specific fields */}
                {targetUserType === 'admin' && (
                  <div>
                    <Label htmlFor="signup-admin-code">Admin Authorization Code</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-admin-code"
                        type="text"
                        value={signUpForm.adminCode}
                        onChange={(e) => setSignUpForm({ ...signUpForm, adminCode: e.target.value })}
                        className="pl-10 bg-background/50 border-white/20"
                        placeholder="Enter admin code"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Contact system administrator for the authorization code
                    </p>
                  </div>
                )}

                {/* Staff-specific fields */}
                {targetUserType === 'staff' && (
                  <div>
                    <Label htmlFor="signup-staff-id">Staff ID</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-staff-id"
                        type="text"
                        value={signUpForm.staffId}
                        onChange={(e) => setSignUpForm({ ...signUpForm, staffId: e.target.value })}
                        className="pl-10 bg-background/50 border-white/20"
                        placeholder="Enter your staff ID"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Provided by your manager or HR department
                    </p>
                  </div>
                )}

                {/* Restaurant-specific fields */}
                {targetUserType === 'restaurant' && (
                  <div>
                    <Label htmlFor="signup-restaurant-code">Restaurant Registration Code</Label>
                    <div className="relative">
                      <Utensils className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-restaurant-code"
                        type="text"
                        value={signUpForm.restaurantCode}
                        onChange={(e) => setSignUpForm({ ...signUpForm, restaurantCode: e.target.value })}
                        className="pl-10 bg-background/50 border-white/20"
                        placeholder="Enter restaurant code"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Contact FrontDash support for restaurant registration
                    </p>
                  </div>
                )}

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-6 frontdash-glow">
                  {targetUserType === 'admin' && <Shield className="h-4 w-4 mr-2" />}
                  {targetUserType === 'staff' && <Users className="h-4 w-4 mr-2" />}
                  {targetUserType === 'restaurant' && <Utensils className="h-4 w-4 mr-2" />}
                  {targetUserType === 'customer' && <UserCircle className="h-4 w-4 mr-2" />}
                  Create {targetUserType === 'admin' ? 'Admin Account' :
                         targetUserType === 'staff' ? 'Staff Account' :
                         targetUserType === 'restaurant' ? 'Restaurant Account' :
                         'Customer Account'}
                </Button>

                <div className="text-center text-xs text-muted-foreground mt-4">
                  By creating an account, you agree to our{' '}
                  <Button variant="link" className="text-xs p-0 h-auto text-primary hover:text-primary/80">
                    Terms of Service
                  </Button>{' '}
                  and{' '}
                  <Button variant="link" className="text-xs p-0 h-auto text-primary hover:text-primary/80">
                    Privacy Policy
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