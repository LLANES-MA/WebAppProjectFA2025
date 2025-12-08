import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { User, Lock, ArrowLeft } from 'lucide-react';

interface StaffSignInProps {
  onBack: () => void;
  onSignInSuccess: () => void;
}

export default function StaffSignIn({ onBack, onSignInSuccess }: StaffSignInProps) {
  const [signInForm, setSignInForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
    const newErrors: { [key: string]: string } = {};
    newErrors.username = validateUsername(signInForm.username);
    newErrors.password = validatePassword(signInForm.password);
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;
    console.log('Staff signing in:', signInForm);
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
                <User className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold text-primary">Staff Portal</h1>
              </div>
              <p className="text-sm text-muted-foreground">Join our delivery team</p>
            </div>
          </div>

          {/* Only Sign In Tab */}
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
              <User className="h-4 w-4 mr-2" />
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
        </div>
      </Card>
    </div>
  );
}