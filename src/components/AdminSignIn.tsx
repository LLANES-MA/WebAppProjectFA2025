import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, Lock, Mail, Shield, User } from 'lucide-react';

interface AdminSignInProps {
  onBack: () => void;
  onSignInSuccess: () => void;
}

export default function AdminSignIn({ onBack, onSignInSuccess }: AdminSignInProps) {
  const [signInForm, setSignInForm] = useState({ username: '', password: '' });
  const [signUpForm, setSignUpForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    adminCode: ''
  });
  const [activeTab, setActiveTab] = useState('signin');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Admin username: no special rule, but still validate email format
  function validateUsername(username: string) {
    if (!username.trim()) return 'Email is required';
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
    console.log('Admin signing in:', signInForm);
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
    if (!signUpForm.adminCode || signUpForm.adminCode !== 'ADMIN2024') {
      newErrors.adminCode = 'Invalid admin code';
    }
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;
    console.log('Admin signing up:', signUpForm);
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
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold text-primary">Admin Portal</h1>
              </div>
              <p className="text-sm text-muted-foreground">Administrative access to FrontDash</p>
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
                  <Label htmlFor="admin-signin-username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="admin-signin-username"
                      type="text"
                      value={signInForm.username}
                      onChange={(e) => {
                        setSignInForm({ ...signInForm, username: e.target.value });
                        if (errors.username) setErrors(prev => ({ ...prev, username: '' }));
                      }}
                      className={`pl-10 bg-background/50 border-white/20${errors.username ? ' border-destructive' : ''}`}
                      placeholder="Admin username"
                      required
                    />
                  </div>
                  {errors.username && <p className="text-xs text-destructive mt-1">{errors.username}</p>}
                </div>

                <div>
                  <Label htmlFor="admin-signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="admin-signin-password"
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
                  <Shield className="h-4 w-4 mr-2" />
                  Access Admin Portal
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Forgot admin credentials?
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Sign Up Form */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="admin-signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="admin-signup-name"
                      type="text"
                      value={signUpForm.name}
                      onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                      className="pl-10 bg-background/50 border-white/20"
                      placeholder="Admin Name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="admin-signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="admin-signup-email"
                      type="email"
                      value={signUpForm.email}
                      onChange={(e) => {
                        setSignUpForm({ ...signUpForm, email: e.target.value });
                        if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                      }}
                      className={`pl-10 bg-background/50 border-white/20${errors.email ? ' border-destructive' : ''}`}
                      placeholder="admin@frontdash.com"
                      required
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="admin-signup-admincode">Admin Authorization Code</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="admin-signup-admincode"
                      type="text"
                      value={signUpForm.adminCode}
                      onChange={(e) => {
                        setSignUpForm({ ...signUpForm, adminCode: e.target.value });
                        if (errors.adminCode) setErrors(prev => ({ ...prev, adminCode: '' }));
                      }}
                      className={`pl-10 bg-background/50 border-white/20${errors.adminCode ? ' border-destructive' : ''}`}
                      placeholder="Enter admin code"
                      required
                    />
                  </div>
                  {errors.adminCode && <p className="text-xs text-destructive mt-1">{errors.adminCode}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    Contact system administrator for the authorization code
                  </p>
                </div>

                <div>
                  <Label htmlFor="admin-signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="admin-signup-password"
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
                  <Label htmlFor="admin-signup-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="admin-signup-confirm-password"
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
                  <Shield className="h-4 w-4 mr-2" />
                  Create Admin Account
                </Button>

                <div className="text-center text-xs text-muted-foreground mt-4">
                  Admin accounts require authorization and are subject to security verification
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}