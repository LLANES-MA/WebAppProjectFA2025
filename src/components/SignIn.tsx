import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, User, Lock, Mail, Users, Shield, Utensils, UserCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  
  return (
    <SignIn
      onBack={() => navigate('/')}
      onGoToAdminSignIn={() => navigate('/admin-signin')}
      onGoToStaffSignIn={() => navigate('/staff-signin')}
      onGoToRestaurantSignIn={() => navigate('/restaurant-signin')}
    />
  );
}

interface SignInProps {
  onBack: () => void;
  onSignInSuccess?: (userType: string) => void;
  onGoToAdminSignIn?: () => void;
  onGoToStaffSignIn?: () => void;
  onGoToRestaurantSignIn?: () => void;
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
    const newErrors: { [key: string]: string } = {};
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
    const newErrors: { [key: string]: string } = {};
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

          {/* Navigation Buttons for Specialized Access */}
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

          {/* Sign In Form */}
          {targetUserType !== 'customer' && (
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
          )}

        </div>
      </Card>
    </div >
  );
}
