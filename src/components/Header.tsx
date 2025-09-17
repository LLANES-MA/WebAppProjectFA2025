import { useState } from 'react';
import { ShoppingBag, User, Menu, Settings, LogIn, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';

interface HeaderProps {
  onRestaurantSignup?: () => void;
  onFindFood?: () => void;
  onViewAllRestaurants?: () => void;
  onGoToAccount?: () => void;
  onGoToSettings?: () => void;
  onGoToSignIn?: () => void;
  onViewCart?: () => void;
  deliveryAddress?: string;
  onDeliveryAddressChange?: (address: string) => void;
}

export default function Header({ onRestaurantSignup, onFindFood, onViewAllRestaurants, onGoToAccount, onGoToSettings, onGoToSignIn, onViewCart, deliveryAddress, onDeliveryAddressChange }: HeaderProps) {
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

  const handleRestaurantClick = () => {
    if (onRestaurantSignup) {
      onRestaurantSignup();
    } else {
      // Fallback to hash navigation if no handler provided
      window.location.hash = '#restaurant-signup';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md frontdash-border-glow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-primary frontdash-text-glow">FrontDash</div>
            <div className="w-4 h-4 border border-primary rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
            </div>
          </div>

          {/* Delivery Address - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Deliver to: {deliveryAddress || 'Set delivery address'}</span>
          </div>

          {/* Spacer for centering */}
          <div className="flex-1"></div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Sign In Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onGoToSignIn}
              className="border-primary/50 text-primary hover:bg-primary/10"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
            
            <Button variant="ghost" size="icon" className="relative" onClick={onViewCart}>
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                2
              </span>
            </Button>
            
            {/* Desktop Menu Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-background/95 backdrop-blur-sm border-white/10">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-2 text-left">
                    <div className="text-xl font-bold text-primary">FrontDash</div>
                    <div className="w-3 h-3 border border-primary rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-primary rounded-full"></div>
                    </div>
                  </SheetTitle>
                  <SheetDescription>
                    Navigate through FrontDash's features and services
                  </SheetDescription>
                </SheetHeader>
                
                <div className="flex flex-col mt-6 h-full">
                  {/* Sign In Section */}
                  <div className="space-y-4 pb-6">
                    <Button 
                      onClick={() => {
                        if (onGoToSignIn) onGoToSignIn();
                        setIsOffcanvasOpen(false);
                      }}
                      className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In / Sign Up
                    </Button>
                  </div>

                  {/* Main Navigation */}
                  <div className="space-y-2 pb-6">
                    <div className="text-xs font-semibold text-muted-foreground/80 mb-3 px-2 tracking-wider">EXPLORE</div>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-12 text-foreground hover:text-primary hover:bg-primary/5 rounded-xl group"
                      onClick={() => {
                        if (onViewAllRestaurants) onViewAllRestaurants();
                        setIsOffcanvasOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg mr-3 group-hover:bg-primary/20 transition-colors">
                        <ShoppingBag className="h-4 w-4 text-primary" />
                      </div>
                      Food & Restaurants
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-12 text-foreground hover:text-primary hover:bg-primary/5 rounded-xl relative group"
                      onClick={() => {
                        if (onViewCart) onViewCart();
                        setIsOffcanvasOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg mr-3 group-hover:bg-primary/20 transition-colors">
                        <ShoppingBag className="h-4 w-4 text-primary" />
                      </div>
                      Cart
                      <span className="absolute right-3 h-6 w-6 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center font-medium">
                        2
                      </span>
                    </Button>
                  </div>

                  {/* Business Section */}
                  <div className="border-t border-white/5 pt-6 space-y-2 pb-6">
                    <div className="text-xs font-semibold text-muted-foreground/80 mb-3 px-2 tracking-wider">BUSINESS</div>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-12 text-primary hover:text-primary/80 hover:bg-primary/5 rounded-xl"
                      onClick={() => {
                        handleRestaurantClick();
                        setIsOffcanvasOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg mr-3">
                        <ShoppingBag className="h-4 w-4 text-primary" />
                      </div>
                      For Restaurants
                    </Button>
                  </div>

                  {/* Account Section */}
                  <div className="border-t border-white/5 pt-6 space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground/80 mb-3 px-2 tracking-wider">ACCOUNT</div>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-12 text-foreground hover:text-foreground/80 hover:bg-muted/5 rounded-xl"
                      onClick={() => {
                        if (onGoToAccount) onGoToAccount();
                        setIsOffcanvasOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-muted/10 rounded-lg mr-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      My Account
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-12 text-foreground hover:text-foreground/80 hover:bg-muted/5 rounded-xl"
                      onClick={() => {
                        if (onGoToSettings) onGoToSettings();
                        setIsOffcanvasOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-muted/10 rounded-lg mr-3">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                      </div>
                      Settings
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Mobile Navigation */}
          <div className="flex lg:hidden items-center space-x-2">
            {/* Sign In Button - Mobile */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onGoToSignIn}
              className="text-primary hover:text-primary/80"
            >
              <LogIn className="h-4 w-4 mr-1" />
              Sign In
            </Button>
            
            <Button variant="ghost" size="icon" className="relative" onClick={onViewCart}>
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                2
              </span>
            </Button>
            
            {/* Offcanvas Toggle */}
            <Sheet open={isOffcanvasOpen} onOpenChange={setIsOffcanvasOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-background/95 backdrop-blur-sm border-white/10">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-2 text-left">
                    <div className="text-xl font-bold text-primary">FrontDash</div>
                    <div className="w-3 h-3 border border-primary rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-primary rounded-full"></div>
                    </div>
                  </SheetTitle>
                  <SheetDescription>
                    Navigate through FrontDash's features and services
                  </SheetDescription>
                </SheetHeader>
                
                <div className="flex flex-col mt-6 h-full">
                  {/* Sign In Section */}
                  <div className="space-y-4 pb-6">
                    <Button 
                      onClick={() => {
                        if (onGoToSignIn) onGoToSignIn();
                        setIsOffcanvasOpen(false);
                      }}
                      className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In / Sign Up
                    </Button>
                  </div>

                  {/* Main Navigation */}
                  <div className="space-y-2 pb-6">
                    <div className="text-xs font-semibold text-muted-foreground/80 mb-3 px-2 tracking-wider">EXPLORE</div>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-12 text-foreground hover:text-primary hover:bg-primary/5 rounded-xl group"
                      onClick={() => {
                        if (onViewAllRestaurants) onViewAllRestaurants();
                        setIsOffcanvasOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg mr-3 group-hover:bg-primary/20 transition-colors">
                        <ShoppingBag className="h-4 w-4 text-primary" />
                      </div>
                      Food & Restaurants
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-12 text-foreground hover:text-primary hover:bg-primary/5 rounded-xl relative group"
                      onClick={() => {
                        if (onViewCart) onViewCart();
                        setIsOffcanvasOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg mr-3 group-hover:bg-primary/20 transition-colors">
                        <ShoppingBag className="h-4 w-4 text-primary" />
                      </div>
                      Cart
                      <span className="absolute right-3 h-6 w-6 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center font-medium">
                        2
                      </span>
                    </Button>
                  </div>

                  {/* Business Section */}
                  <div className="border-t border-white/5 pt-6 space-y-2 pb-6">
                    <div className="text-xs font-semibold text-muted-foreground/80 mb-3 px-2 tracking-wider">BUSINESS</div>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-12 text-primary hover:text-primary/80 hover:bg-primary/5 rounded-xl"
                      onClick={() => {
                        handleRestaurantClick();
                        setIsOffcanvasOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg mr-3">
                        <ShoppingBag className="h-4 w-4 text-primary" />
                      </div>
                      For Restaurants
                    </Button>
                  </div>

                  {/* Account Section */}
                  <div className="border-t border-white/5 pt-6 space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground/80 mb-3 px-2 tracking-wider">ACCOUNT</div>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-12 text-foreground hover:text-foreground/80 hover:bg-muted/5 rounded-xl"
                      onClick={() => {
                        if (onGoToAccount) onGoToAccount();
                        setIsOffcanvasOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-muted/10 rounded-lg mr-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      My Account
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-12 text-foreground hover:text-foreground/80 hover:bg-muted/5 rounded-xl"
                      onClick={() => {
                        if (onGoToSettings) onGoToSettings();
                        setIsOffcanvasOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-muted/10 rounded-lg mr-3">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                      </div>
                      Settings
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}