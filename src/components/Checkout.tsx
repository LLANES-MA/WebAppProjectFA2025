import { ArrowLeft, CreditCard, MapPin, Clock, CheckCircle, Menu, ShoppingBag, User, Search, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { useState } from 'react';

interface CheckoutProps {
  cartItems: any[];
  total: number;
  onBack: () => void;
  onOrderComplete: () => void;
  onRestaurantSignup?: () => void;
  onGoToAdmin?: () => void;
  onGoToStaff?: () => void;
  onViewAllRestaurants?: () => void;
  selectedRestaurant?: any; // Restaurant info for order creation
}

export default function Checkout({ cartItems, total, onBack, onOrderComplete, onRestaurantSignup, onGoToAdmin, onGoToStaff, onViewAllRestaurants, selectedRestaurant }: CheckoutProps) {
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Confirmation
  const [formData, setFormData] = useState({
    // Address
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Payment
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    
    // Contact
    phone: '',
    email: '',
    
    // Delivery Instructions
    instructions: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const validateStep1 = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.street.trim()) newErrors.street = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Basic phone validation
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
    if (!formData.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
    if (!formData.cvv.trim()) newErrors.cvv = 'CVV is required';
    if (!formData.cardName.trim()) newErrors.cardName = 'Cardholder name is required';
    
    // Simple card number validation (Luhn algorithm simulation)
    const cardNumber = formData.cardNumber.replace(/\s/g, '');
    if (cardNumber && (cardNumber.length < 13 || cardNumber.length > 19)) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }
    
    // Simple expiry date validation
    if (formData.expiryDate) {
      const [month, year] = formData.expiryDate.split('/');
      const currentDate = new Date();
      const expiry = new Date(parseInt('20' + year), parseInt(month) - 1);
      if (expiry < currentDate) {
        newErrors.expiryDate = 'Card has expired';
      }
    }
    
    // CVV validation
    if (formData.cvv && (formData.cvv.length < 3 || formData.cvv.length > 4)) {
      newErrors.cvv = 'CVV must be 3 or 4 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedRestaurant || !selectedRestaurant.id) {
      alert('Restaurant information is missing. Please go back and try again.');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    setIsProcessing(true);
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
      
      // Calculate subtotal, tax, tip, and delivery fee
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * 0.08; // 8% tax
      const deliveryFee = subtotal > 25 ? 0 : 2.99;
      const tip = 0; // Can be added later if needed
      const grandTotal = subtotal + tax + deliveryFee + tip;
      
      // Create order payload
      const orderData = {
        restaurantId: selectedRestaurant.id,
        subtotal: subtotal,
        tip: tip,
        grandTotal: grandTotal,
        orderStatus: 'pending',
        address: {
          street: formData.street,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        customer: {
          email: formData.email,
          phone: formData.phone,
          fullName: formData.cardName || formData.email.split('@')[0],
        },
        items: cartItems.map(item => ({
          itemId: item.id,
          itemName: item.name,
          itemPrice: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
        })),
      };
      
      console.log('📝 Creating order:', orderData);
      
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }
      
      const result = await response.json();
      console.log('✅ Order created successfully:', result);
      
      setIsProcessing(false);
      onOrderComplete();
    } catch (err: any) {
      console.error('❌ Error creating order:', err);
      setIsProcessing(false);
      alert('Failed to place order: ' + err.message);
    }
  };

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
                <h1 className="text-2xl font-semibold text-foreground">Checkout</h1>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span className={step >= 1 ? 'text-primary' : ''}>Address</span>
                  <span>→</span>
                  <span className={step >= 2 ? 'text-primary' : ''}>Payment</span>
                  <span>→</span>
                  <span className={step >= 3 ? 'text-primary' : ''}>Confirmation</span>
                </div>
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
                        className="w-full justify-start h-12 text-foreground hover:text-primary hover:bg-primary/5 rounded-xl relative group"
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
                        Back to Cart
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
          {/* Main Form */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <Card className="bg-card/40 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>Delivery Address</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="street">Street Address *</Label>
                      <Input
                        id="street"
                        value={formData.street}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                        className={errors.street ? 'border-destructive' : ''}
                        placeholder="123 Main Street"
                      />
                      {errors.street && <p className="text-xs text-destructive mt-1">{errors.street}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="apartment">Apartment/Suite</Label>
                      <Input
                        id="apartment"
                        value={formData.apartment}
                        onChange={(e) => handleInputChange('apartment', e.target.value)}
                        placeholder="Apt 4B"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={errors.city ? 'border-destructive' : ''}
                        placeholder="New York"
                      />
                      {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className={errors.state ? 'border-destructive' : ''}
                        placeholder="NY"
                      />
                      {errors.state && <p className="text-xs text-destructive mt-1">{errors.state}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        className={errors.zipCode ? 'border-destructive' : ''}
                        placeholder="10001"
                      />
                      {errors.zipCode && <p className="text-xs text-destructive mt-1">{errors.zipCode}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={errors.phone ? 'border-destructive' : ''}
                        placeholder="(555) 123-4567"
                      />
                      {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={errors.email ? 'border-destructive' : ''}
                        placeholder="john@example.com"
                      />
                      {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="instructions">Delivery Instructions</Label>
                      <Input
                        id="instructions"
                        value={formData.instructions}
                        onChange={(e) => handleInputChange('instructions', e.target.value)}
                        placeholder="Leave at front door, ring doorbell"
                      />
                    </div>
                  </div>
                  
                  <Button onClick={handleNext} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Continue to Payment
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card className="bg-card/40 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span>Payment Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="cardNumber">Card Number *</Label>
                      <Input
                        id="cardNumber"
                        value={formData.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                        className={errors.cardNumber ? 'border-destructive' : ''}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                      {errors.cardNumber && <p className="text-xs text-destructive mt-1">{errors.cardNumber}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date *</Label>
                      <Input
                        id="expiryDate"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                        className={errors.expiryDate ? 'border-destructive' : ''}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                      {errors.expiryDate && <p className="text-xs text-destructive mt-1">{errors.expiryDate}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="cvv">CVV *</Label>
                      <Input
                        id="cvv"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                        className={errors.cvv ? 'border-destructive' : ''}
                        placeholder="123"
                        maxLength={4}
                      />
                      {errors.cvv && <p className="text-xs text-destructive mt-1">{errors.cvv}</p>}
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="cardName">Cardholder Name *</Label>
                      <Input
                        id="cardName"
                        value={formData.cardName}
                        onChange={(e) => handleInputChange('cardName', e.target.value)}
                        className={errors.cardName ? 'border-destructive' : ''}
                        placeholder="John Doe"
                      />
                      {errors.cardName && <p className="text-xs text-destructive mt-1">{errors.cardName}</p>}
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handleNext} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                      Review Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card className="bg-card/40 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Order Confirmation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Delivery Info */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Delivery Address</h3>
                    <div className="text-sm text-muted-foreground">
                      <p>{formData.street} {formData.apartment}</p>
                      <p>{formData.city}, {formData.state} {formData.zipCode}</p>
                      <p>Phone: {formData.phone}</p>
                      <p>Email: {formData.email}</p>
                      {formData.instructions && <p>Instructions: {formData.instructions}</p>}
                    </div>
                  </div>
                  
                  {/* Payment Info */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Payment Method</h3>
                    <div className="text-sm text-muted-foreground">
                      <p>**** **** **** {formData.cardNumber.slice(-4)}</p>
                      <p>{formData.cardName}</p>
                    </div>
                  </div>
                  
                  {/* Estimated Delivery */}
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 text-primary">
                      <Clock className="h-4 w-4" />
                      <span className="font-semibold">Estimated Delivery: 25-35 minutes</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                      Back
                    </Button>
                    <Button 
                      onClick={handlePlaceOrder} 
                      disabled={isProcessing}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isProcessing ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="bg-card/40 backdrop-blur-sm border-white/10 sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-white/10 pt-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">${(total - (total * 0.08) - (total > 25 ? 0 : 2.99)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="text-foreground">${(total * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-foreground">{total > 25 ? 'Free' : '$2.99'}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t border-white/10">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}