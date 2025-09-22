import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Lock, Mail, Users, User, Truck } from 'lucide-react';

interface StaffSignInProps {
  onBack: () => void;
  onSignInSuccess: () => void;
}

export default function StaffSignIn({ onBack, onSignInSuccess }: StaffSignInProps) {
  const [signInForm, setSignInForm] = useState({ username: '', password: '' });
  const [signUpForm, setSignUpForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    phone: '',
    vehicleType: ''
  });
  const [activeTab, setActiveTab] = useState('signin');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  function validateUsername(username: string) {
    if (!/^[A-Za-z]{2,}\d{2,}$/.test(username)) {
      return 'Username must have at least 2 letters followed by at least 2 digits';
    }
    return '';
  }
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
    newErrors.username = validateUsername(signInForm.username);
    newErrors.password = validatePassword(signInForm.password);
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;
    console.log('Staff signing in:', signInForm);
    onSignInSuccess();
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
    console.log('Staff signing up:', signUpForm);
    onSignInSuccess();
  };

  const vehicleTypes = [
    { value: 'bicycle', label: 'Bicycle' },
    { value: 'motorcycle', label: 'Motorcycle' },
    { value: 'car', label: 'Car' },
    { value: 'walking', label: 'Walking' }
  ];

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
                <Users className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold text-primary">Staff Portal</h1>
              </div>
              <p className="text-sm text-muted-foreground">Join our delivery team</p>
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
                  <Label htmlFor="staff-signin-username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="staff-signin-username"
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
                  <Label htmlFor="staff-signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="staff-signin-password"
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
                  <Users className="h-4 w-4 mr-2" />
                  Access Staff Portal
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
                  <Label htmlFor="staff-signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="staff-signup-name"
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
                  <Label htmlFor="staff-signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="staff-signup-email"
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
                  <Label htmlFor="staff-signup-phone">Phone Number</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="staff-signup-phone"
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
                  <Label htmlFor="staff-signup-vehicle">Vehicle Type</Label>
                  <Select value={signUpForm.vehicleType} onValueChange={(value) => setSignUpForm({ ...signUpForm, vehicleType: value })}>
                    <SelectTrigger className="bg-background/50 border-white/20">
                      <SelectValue placeholder="Select your vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map((vehicle) => (
                        <SelectItem key={vehicle.value} value={vehicle.value}>
                          <div className="flex items-center space-x-2">
                            <Truck className="h-4 w-4" />
                            <span>{vehicle.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="staff-signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="staff-signup-password"
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
                  <Label htmlFor="staff-signup-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="staff-signup-confirm-password"
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
                  <Users className="h-4 w-4 mr-2" />
                  Join Delivery Team
                </Button>

                <div className="text-center text-xs text-muted-foreground mt-4">
                  Account subject to verification and background check
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}