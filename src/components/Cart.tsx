import { ArrowLeft, Plus, Minus, Trash2, Menu, ShoppingBag, User, Search, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Input } from './ui/input';
import { useState } from 'react';

interface CartProps {
  cartItems: any[];
  onBack: () => void;
  onProceedToCheckout: (items: any[], total: number) => void;
  onRestaurantSignup?: () => void;
  onGoToAdmin?: () => void;
  onGoToStaff?: () => void;
  onViewAllRestaurants?: () => void;
  onGoToAccount?: () => void;
  onGoToSettings?: () => void;
}

export default function Cart({ cartItems: initialCartItems, onBack, onProceedToCheckout, onRestaurantSignup, onGoToAdmin, onGoToStaff, onViewAllRestaurants, onGoToAccount, onGoToSettings }: CartProps) {
  const [cartItems, setCartItems] = useState(initialCartItems);

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } else {
      setCartItems(cartItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeItem = (itemId: number) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTax = () => {
    return getSubtotal() * 0.08; // 8% tax
  };

  const getDeliveryFee = () => {
    return getSubtotal() > 25 ? 0 : 2.99; // Free delivery over $25
  };

  const getTotal = () => {
    return getSubtotal() + getTax() + getDeliveryFee();
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card/40 backdrop-blur-sm border-b border-white/10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-semibold text-foreground">Your Cart</h1>
            </div>
          </div>
        </header>
        
        <div className="container mx-auto px-6 py-16 text-center">
          <div className="space-y-4">
            <h2 className="text-xl text-muted-foreground">Your cart is empty</h2>
            <p className="text-muted-foreground">Add some delicious items to get started!</p>
            <Button onClick={onBack} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/40 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Your Cart</h1>
                <p className="text-sm text-muted-foreground">
                  {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} from {cartItems[0]?.restaurantName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold text-primary">FrontDash</h2>
                <div className="w-4 h-4 border border-primary rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                </div>
              </div>
              
              {/* Menu Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] bg-background/95 backdrop-blur-sm border-white/10">
                  <SheetHeader>
                    <SheetTitle className="flex items-center space-x-2 text-left">
                      <div className="font-semibold text-primary">FrontDash</div>
                      <div className="w-3 h-3 border border-primary rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 bg-primary rounded-full"></div>
                      </div>
                    </SheetTitle>
                    <SheetDescription>
                      Navigate through FrontDash's features and services
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="flex flex-col mt-6 h-full">
                    {/* Search Section */}
                    <div className="space-y-4 pb-6">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search restaurants, dishes..."
                          className="pl-12 h-12 bg-card/50 border-white/10 text-foreground rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Main Navigation */}
                    <div className="space-y-2 pb-6">
                      <div className="text-xs font-semibold text-muted-foreground/80 mb-3 px-2 tracking-wider">EXPLORE</div>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start h-12 text-foreground hover:text-primary hover:bg-primary/5 rounded-xl group"
                        onClick={() => {
                          if (onViewAllRestaurants) onViewAllRestaurants();
                        }}
                      >
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg mr-3 group-hover:bg-primary/20 transition-colors">
                          <ShoppingBag className="h-4 w-4 text-primary" />
                        </div>
                        Food & Restaurants
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start h-12 text-primary hover:text-primary/80 hover:bg-primary/5 rounded-xl relative group"
                      >
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg mr-3 group-hover:bg-primary/20 transition-colors">
                          <ShoppingBag className="h-4 w-4 text-primary" />
                        </div>
                        Cart
                        {cartItems.length > 0 && (
                          <span className="absolute right-3 h-6 w-6 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center font-medium">
                            {cartItems.length}
                          </span>
                        )}
                      </Button>
                    </div>

                    {/* Business Section */}
                    <div className="border-t border-white/5 pt-6 space-y-2 pb-6">
                      <div className="text-xs font-semibold text-muted-foreground/80 mb-3 px-2 tracking-wider">BUSINESS</div>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start h-12 text-primary hover:text-primary/80 hover:bg-primary/5 rounded-xl"
                        onClick={() => {
                          if (onRestaurantSignup) onRestaurantSignup();
                        }}
                      >
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg mr-3">
                          <ShoppingBag className="h-4 w-4 text-primary" />
                        </div>
                        For Restaurants
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start h-12 text-muted-foreground hover:text-foreground hover:bg-muted/5 rounded-xl"
                        onClick={() => {
                          if (onGoToAdmin) onGoToAdmin();
                        }}
                      >
                        <div className="flex items-center justify-center w-8 h-8 bg-muted/10 rounded-lg mr-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        Admin Portal
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start h-12 text-muted-foreground hover:text-foreground hover:bg-muted/5 rounded-xl"
                        onClick={() => {
                          if (onGoToStaff) onGoToStaff();
                        }}
                      >
                        <div className="flex items-center justify-center w-8 h-8 bg-muted/10 rounded-lg mr-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        Staff Portal
                      </Button>
                    </div>

                    {/* Account Section */}
                    <div className="border-t border-white/5 pt-6 space-y-2 pb-6">
                      <div className="text-xs font-semibold text-muted-foreground/80 mb-3 px-2 tracking-wider">ACCOUNT</div>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start h-12 text-foreground hover:text-foreground/80 hover:bg-muted/5 rounded-xl"
                        onClick={() => {
                          if (onGoToAccount) onGoToAccount();
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
                        }}
                      >
                        <div className="flex items-center justify-center w-8 h-8 bg-muted/10 rounded-lg mr-3">
                          <Settings className="h-4 w-4 text-muted-foreground" />
                        </div>
                        Settings
                      </Button>
                    </div>

                    {/* Navigation Actions */}
                    <div className="border-t border-white/5 pt-6 space-y-2 mt-auto">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start h-12 text-primary hover:text-primary/80 hover:bg-primary/5 rounded-xl"
                        onClick={onBack}
                      >
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg mr-3">
                          <ArrowLeft className="h-4 w-4 text-primary" />
                        </div>
                        Back to Menu
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="bg-card/40 backdrop-blur-sm border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-muted/20 to-muted/5 rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-semibold text-primary">${item.price}</span>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-semibold text-foreground w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0 bg-primary hover:bg-primary/90"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeItem(item.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <Card className="bg-card/40 backdrop-blur-sm border-white/10 sticky top-24">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Order Summary</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">${getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="text-foreground">${getTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="text-foreground">
                      {getDeliveryFee() === 0 ? 'Free' : `$${getDeliveryFee().toFixed(2)}`}
                    </span>
                  </div>
                  {getDeliveryFee() === 0 && (
                    <p className="text-xs text-green-500">Free delivery on orders over $25!</p>
                  )}
                  <div className="border-t border-white/10 pt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-foreground">Total</span>
                      <span className="text-primary">${getTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => onProceedToCheckout(cartItems, getTotal())}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  Proceed to Checkout
                </Button>
                
                <Button
                  onClick={onBack}
                  variant="outline"
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}