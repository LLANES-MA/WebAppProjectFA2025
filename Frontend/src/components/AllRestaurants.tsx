import { ArrowLeft, Star, Clock, Menu, ShoppingBag, User, Search, Settings, MapPin, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Input } from './ui/input';
import { useState, useMemo } from 'react';

interface AllRestaurantsProps {
  onBack: () => void;
  onRestaurantSelect: (restaurant: any) => void;
  onRestaurantSignup?: () => void;
  onViewCart?: () => void;
  onGoToAccount?: () => void;
  onGoToSettings?: () => void;
  onGoToSignIn?: () => void;
  searchQuery?: string;
  deliveryAddress?: string;
  onDeliveryAddressChange?: (address: string) => void;
}

const allRestaurants = [
  {
    id: 1,
    name: "Chick-fil-A",
    cuisine: "Fast Food",
    rating: 4.8,
    deliveryTime: "15-25 min",
    deliveryFee: "Free",
    image: "https://images.unsplash.com/photo-1643757412923-619484c906f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBmb29kfGVufDF8fHx8MTc1NjgyMzQ5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    promo: "Free Delivery",
    description: "America's favorite chicken restaurant serving delicious sandwiches, nuggets and salads"
  },
  {
    id: 2,
    name: "Mario's Pizzeria",
    cuisine: "Italian",
    rating: 4.9,
    deliveryTime: "25-35 min",
    deliveryFee: "$2.99",
    image: "https://images.unsplash.com/photo-1563245738-9169ff58eccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzU2ODMzNDk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    promo: "20% OFF",
    description: "Authentic Italian pizzas made with fresh ingredients and traditional recipes"
  },
  {
    id: 3,
    name: "Sakura Sushi",
    cuisine: "Japanese",
    rating: 4.7,
    deliveryTime: "30-40 min",
    deliveryFee: "$3.99",
    image: "https://images.unsplash.com/photo-1696449241254-11cf7f18ce32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXNoaSUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzU2NzUwNzg4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Fresh sushi and Japanese cuisine prepared by skilled chefs using premium ingredients"
  },
  {
    id: 4,
    name: "Nonna's Kitchen",
    cuisine: "Italian",
    rating: 4.6,
    deliveryTime: "20-30 min",
    deliveryFee: "$2.49",
    image: "https://images.unsplash.com/photo-1662197480393-2a82030b7b83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwcGFzdGF8ZW58MXx8fHwxNzU2ODIzNDk0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Traditional Italian comfort food and homemade pasta dishes"
  },
  {
    id: 5,
    name: "Burger Palace",
    cuisine: "American",
    rating: 4.5,
    deliveryTime: "25-35 min",
    deliveryFee: "$1.99",
    image: "https://images.unsplash.com/photo-1643757412923-619484c906f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBmb29kfGVufDF8fHx8MTc1NjgyMzQ5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Gourmet burgers made with premium beef and fresh toppings"
  },
  {
    id: 6,
    name: "Taco Express",
    cuisine: "Mexican",
    rating: 4.4,
    deliveryTime: "20-30 min",
    deliveryFee: "$2.99",
    image: "https://images.unsplash.com/photo-1696449241254-11cf7f18ce32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXNoaSUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzU2NzUwNzg4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Authentic Mexican street food and fresh tacos made to order"
  },
  {
    id: 7,
    name: "Dragon Garden",
    cuisine: "Chinese",
    rating: 4.3,
    deliveryTime: "25-35 min",
    deliveryFee: "$3.49",
    image: "https://images.unsplash.com/photo-1696449241254-11cf7f18ce32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXNoaSUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzU2NzUwNzg4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Traditional Chinese cuisine with bold flavors and generous portions"
  },
  {
    id: 8,
    name: "The Steakhouse",
    cuisine: "American",
    rating: 4.8,
    deliveryTime: "35-45 min",
    deliveryFee: "$4.99",
    image: "https://images.unsplash.com/photo-1643757412923-619484c906f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBmb29kfGVufDF8fHx8MTc1NjgyMzQ5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Premium steaks and fine dining experience with exceptional service"
  }
];

export default function AllRestaurants({ onBack, onRestaurantSelect, onRestaurantSignup, onViewCart, onGoToAccount, onGoToSettings, onGoToSignIn, searchQuery = '', deliveryAddress = '', onDeliveryAddressChange }: AllRestaurantsProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Filter restaurants based on search query
  const filteredRestaurants = useMemo(() => {
    const query = localSearchQuery.toLowerCase();
    if (!query) return allRestaurants;
    
    return allRestaurants.filter(restaurant => 
      restaurant.name.toLowerCase().includes(query) ||
      restaurant.cuisine.toLowerCase().includes(query) ||
      restaurant.description.toLowerCase().includes(query)
    );
  }, [localSearchQuery]);

  const displayQuery = localSearchQuery || searchQuery;
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
                <h1 className="text-2xl font-semibold text-foreground">All Restaurants</h1>
                <p className="text-sm text-muted-foreground">{allRestaurants.length} restaurants available</p>
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
                    {/* Sign In Section */}
                    <div className="space-y-4 pb-6">
                      <Button 
                        onClick={onGoToSignIn}
                        className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In / Sign Up
                      </Button>
                    </div>

                    {/* Delivery Address & Search Section */}
                    <div className="space-y-4 pb-6">
                      <div className="space-y-3">
                        <div className="text-xs font-semibold text-muted-foreground/80 px-2 tracking-wider">DELIVERY ADDRESS</div>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Enter your delivery address..."
                            value={deliveryAddress}
                            onChange={(e) => onDeliveryAddressChange?.(e.target.value)}
                            className="pl-12 h-12 bg-card/50 border-white/10 text-foreground rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search restaurants, dishes..."
                          value={localSearchQuery}
                          onChange={(e) => setLocalSearchQuery(e.target.value)}
                          className="pl-12 h-12 bg-card/50 border-white/10 text-foreground rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Main Navigation */}
                    <div className="space-y-2 pb-6">
                      <div className="text-xs font-semibold text-muted-foreground/80 mb-3 px-2 tracking-wider">EXPLORE</div>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start h-12 text-primary hover:text-primary/80 hover:bg-primary/5 rounded-xl group"
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
                        Back to Home
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Search Results Header */}
      {displayQuery && (
        <div className="container mx-auto px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Search Results for "{displayQuery}"
              </h2>
              <p className="text-muted-foreground">
                {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
              </p>
            </div>
            {displayQuery !== localSearchQuery && (
              <Button
                variant="outline"
                onClick={() => setLocalSearchQuery('')}
                className="border-white/20"
              >
                Clear Search
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Restaurant Grid */}
      <div className="container mx-auto px-6 py-8">
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No restaurants found</h3>
            <p className="text-muted-foreground mb-6">
              {displayQuery 
                ? `No restaurants match "${displayQuery}". Try a different search term.`
                : "No restaurants available at the moment."
              }
            </p>
            <Button
              variant="outline"
              onClick={() => setLocalSearchQuery('')}
              className="border-white/20"
            >
              Browse All Restaurants
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRestaurants.map((restaurant) => (
            <Card
              key={restaurant.id}
              className="group cursor-pointer transition-all duration-300 hover:scale-105 bg-card/40 backdrop-blur-sm border-white/10 hover:border-primary/30 overflow-hidden"
              onClick={() => onRestaurantSelect(restaurant)}
            >
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-muted/20 to-muted/5 relative overflow-hidden">
                  <ImageWithFallback
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                {restaurant.promo && (
                  <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                    {restaurant.promo}
                  </Badge>
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {restaurant.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-foreground">{restaurant.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{restaurant.deliveryTime}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Delivery: {restaurant.deliveryFee}
                    </span>
                    <Button 
                      size="sm" 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRestaurantSelect(restaurant);
                      }}
                    >
                      Order Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}