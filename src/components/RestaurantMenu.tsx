import { ArrowLeft, Star, Clock, Plus, Minus, ShoppingCart, Menu, ShoppingBag, User, Search, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Input } from './ui/input';
import { useState } from 'react';

interface RestaurantMenuProps {
  restaurant: any;
  onBack: () => void;
  onViewCart: (cartItems: any[]) => void;
  onRestaurantSignup?: () => void;
  onGoToAdmin?: () => void;
  onGoToStaff?: () => void;
  onViewAllRestaurants?: () => void;
  onGoToAccount?: () => void;
  onGoToSettings?: () => void;
  deliveryAddress?: string;
  onDeliveryAddressChange?: (address: string) => void;
}

const menuCategories = [
  {
    name: "Popular Items",
    items: [
      {
        id: 1,
        name: "Classic Burger",
        description: "Juicy beef patty with lettuce, tomato, onion, and our special sauce",
        price: 12.99,
        image: "https://images.unsplash.com/photo-1643757412923-619484c906f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBmb29kfGVufDF8fHx8MTc1NjgyMzQ5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "Main Course"
      },
      {
        id: 2,
        name: "Chicken Wings",
        description: "Crispy wings tossed in your choice of sauce",
        price: 9.99,
        image: "https://images.unsplash.com/photo-1643757412923-619484c906f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBmb29kfGVufDF8fHx8MTc1NjgyMzQ5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "Appetizers"
      },
      {
        id: 3,
        name: "Caesar Salad",
        description: "Fresh romaine lettuce with parmesan cheese and croutons",
        price: 8.99,
        image: "https://images.unsplash.com/photo-1662197480393-2a82030b7b83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwcGFzdGF8ZW58MXx8fHwxNzU2ODIzNDk0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "Salads"
      }
    ]
  },
  {
    name: "Main Courses",
    items: [
      {
        id: 4,
        name: "Grilled Chicken",
        description: "Tender grilled chicken breast with herbs and spices",
        price: 15.99,
        image: "https://images.unsplash.com/photo-1643757412923-619484c906f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBmb29kfGVufDF8fHx8MTc1NjgyMzQ5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "Main Course"
      },
      {
        id: 5,
        name: "Fish & Chips",
        description: "Beer-battered fish with crispy fries and tartar sauce",
        price: 14.99,
        image: "https://images.unsplash.com/photo-1643757412923-619484c906f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBmb29kfGVufDF8fHx8MTc1NjgyMzQ5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "Main Course"
      }
    ]
  },
  {
    name: "Desserts",
    items: [
      {
        id: 6,
        name: "Chocolate Cake",
        description: "Rich chocolate cake with chocolate frosting",
        price: 6.99,
        image: "https://images.unsplash.com/photo-1662197480393-2a82030b7b83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwcGFzdGF8ZW58MXx8fHwxNzU2ODIzNDk0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "Desserts"
      },
      {
        id: 7,
        name: "Ice Cream Sundae",
        description: "Vanilla ice cream with hot fudge and whipped cream",
        price: 5.99,
        image: "https://images.unsplash.com/photo-1662197480393-2a82030b7b83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwcGFzdGF8ZW58MXx8fHwxNzU2ODIzNDk0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "Desserts"
      }
    ]
  }
];

export default function RestaurantMenu({ restaurant, onBack, onViewCart, onRestaurantSignup, onGoToAdmin, onGoToStaff, onViewAllRestaurants, onGoToAccount, onGoToSettings }: RestaurantMenuProps) {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<{[key: number]: number}>({});

  const addToCart = (item: any) => {
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      const updatedCart = cartItems.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      );
      setCartItems(updatedCart);
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1, restaurantName: restaurant.name }]);
    }
    setQuantities(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
  };

  const removeFromCart = (item: any) => {
    const currentQuantity = quantities[item.id] || 0;
    if (currentQuantity > 1) {
      const updatedCart = cartItems.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      );
      setCartItems(updatedCart);
      setQuantities(prev => ({ ...prev, [item.id]: currentQuantity - 1 }));
    } else if (currentQuantity === 1) {
      setCartItems(cartItems.filter(cartItem => cartItem.id !== item.id));
      setQuantities(prev => ({ ...prev, [item.id]: 0 }));
    }
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
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
                <h1 className="text-2xl font-semibold text-foreground">{restaurant.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span>{restaurant.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{restaurant.deliveryTime}</span>
                  </div>
                  <Badge variant="secondary">{restaurant.cuisine}</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {getTotalItems() > 0 && (
                <Button
                  onClick={() => onViewCart(cartItems)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground relative"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  View Cart ({getTotalItems()})
                  <Badge className="ml-2 bg-primary-foreground text-primary">
                    ${getTotalPrice().toFixed(2)}
                  </Badge>
                </Button>
              )}
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
                          onClick={() => {
                            onViewCart(cartItems);
                          }}
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
                          Back to Restaurants
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Restaurant Hero */}
      <div className="relative h-48 bg-gradient-to-r from-primary/20 to-secondary/20">
        <ImageWithFallback
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-6 left-6">
          <p className="text-muted-foreground mb-2">{restaurant.description}</p>
          {restaurant.promo && (
            <Badge className="bg-primary text-primary-foreground">{restaurant.promo}</Badge>
          )}
        </div>
      </div>

      {/* Menu */}
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {menuCategories.map((category) => (
            <div key={category.name} className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground border-b border-white/10 pb-2">
                {category.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items.map((item) => (
                  <Card
                    key={item.id}
                    className="group bg-card/40 backdrop-blur-sm border-white/10 hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="aspect-video bg-gradient-to-br from-muted/20 to-muted/5 relative overflow-hidden">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{item.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-primary">${item.price}</span>
                          
                          {quantities[item.id] > 0 ? (
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeFromCart(item)}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-semibold text-foreground w-8 text-center">
                                {quantities[item.id]}
                              </span>
                              <Button
                                size="sm"
                                onClick={() => addToCart(item)}
                                className="h-8 w-8 p-0 bg-primary hover:bg-primary/90"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => addToCart(item)}
                              className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}