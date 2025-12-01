import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, User, Lock, Mail, UserCircle, Shield, Users, Utensils, ArrowRight } from 'lucide-react';

interface SignInProps {
  onBack: () => void;
  onSignInSuccess?: (userType: string) => void;
  onGoToAdminSignIn?: () => void;
  onGoToStaffSignIn?: () => void;
  onGoToRestaurantSignIn?: () => void;
}

export default function SignIn({ onBack, onSignInSuccess, onGoToAdminSignIn, onGoToStaffSignIn, onGoToRestaurantSignIn }: SignInProps) {
  const [signInForm, setSignInForm] = useState({ email: '', password: '' });
  const [signUpForm, setSignUpForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: ''
  });
  const [activeTab, setActiveTab] = useState('signin');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock sign in - in real app, validate against backend
    console.log('Customer signing in:', signInForm);
    if (onSignInSuccess) onSignInSuccess('customer');
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock sign up - in real app, create account in backend
    if (signUpForm.password !== signUpForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    console.log('Customer signing up:', signUpForm);
    if (onSignInSuccess) onSignInSuccess('customer');
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
              <p className="text-sm text-muted-foreground">Sign in to your account or create a new one</p>
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

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Customer Access</span>
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
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      type="email"
                      value={signInForm.email}
                      onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                      className="pl-10 bg-background/50 border-white/20"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-password"
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
                  <UserCircle className="h-4 w-4 mr-2" />
                  Sign In as Customer
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
                      onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                      className="pl-10 bg-background/50 border-white/20"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
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
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-confirm-password"
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
                  <UserCircle className="h-4 w-4 mr-2" />
                  Create Customer Account
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
