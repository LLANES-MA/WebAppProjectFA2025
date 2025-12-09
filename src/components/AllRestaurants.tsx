import { ArrowLeft, Star, Clock, Menu, ShoppingBag, User, Search, Settings, MapPin, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Input } from './ui/input';
import { useState, useMemo, useEffect } from 'react';
import { getApprovedRestaurants, transformRestaurantForDisplay, getRestaurantHours } from '../services/restaurantService';

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

// All restaurant data is now fetched dynamically from the API

export default function AllRestaurants({ onBack, onRestaurantSelect, onRestaurantSignup, onViewCart, onGoToAccount, onGoToSettings, onGoToSignIn, searchQuery = '', deliveryAddress = '', onDeliveryAddressChange }: AllRestaurantsProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch restaurants and their operating hours from API
  useEffect(() => {
    async function fetchRestaurants() {
      try {
        setLoading(true);
        const approvedRestaurants = await getApprovedRestaurants();
        
        // Fetch operating hours for each restaurant
        const restaurantsWithHours = await Promise.all(
          approvedRestaurants.map(async (restaurant) => {
            const hours = await getRestaurantHours(restaurant.id);
            // Transform hours array into object format
            const operatingHours: any = {};
            hours.forEach(hour => {
              operatingHours[hour.dayOfWeek] = {
                open: hour.openTime,
                close: hour.closeTime,
                closed: hour.isClosed,
              };
            });
            
            return {
              ...transformRestaurantForDisplay(restaurant),
              operatingHours,
            };
          })
        );
        
        setRestaurants(restaurantsWithHours);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching restaurants:', err);
        setError('Failed to load restaurants');
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRestaurants();
  }, []);

  // Function to check if restaurant is currently closed
  const isRestaurantClosed = (restaurant: any) => {
    if (!restaurant.operatingHours || Object.keys(restaurant.operatingHours).length === 0) {
      return false; // Assume open if no hours data
    }
    
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[now.getDay()];
    const currentTime = now.toTimeString().substring(0, 5); // HH:MM format
    
    const dayKey = currentDay as keyof typeof restaurant.operatingHours;
    const todayHours = restaurant.operatingHours[dayKey];
    
    // If restaurant is closed on this day
    if (todayHours?.closed) {
      return true;
    }
    
    // If no operating hours set for this day
    if (!todayHours?.open || !todayHours?.close) {
      return false; // Assume open if no hours specified
    }
    
    // Check if current time is within operating hours
    return currentTime < todayHours.open || currentTime > todayHours.close;
  };

  // Filter and sort restaurants based on search query and operating status
  const filteredRestaurants = useMemo(() => {
    const query = localSearchQuery.toLowerCase();
    let filtered = restaurants;
    
    // Filter by search query
    if (query) {
      filtered = filtered.filter(restaurant => 
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.cuisine.toLowerCase().includes(query) ||
        (restaurant.description && restaurant.description.toLowerCase().includes(query))
      );
    }
    
    // Sort restaurants: open restaurants first, then closed restaurants
    return filtered.sort((a, b) => {
      const aClosed = isRestaurantClosed(a);
      const bClosed = isRestaurantClosed(b);
      
      // If both have same status, maintain original order
      if (aClosed === bClosed) {
        return 0;
      }
      
      // Open restaurants come first
      return aClosed ? 1 : -1;
    });
  }, [localSearchQuery, restaurants]);

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
                <p className="text-sm text-muted-foreground">
                  {loading ? 'Loading...' : `${filteredRestaurants.length} restaurants available`}
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
        ) : loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading restaurants...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {localSearchQuery ? 'No restaurants found matching your search.' : 'No restaurants available at the moment.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRestaurants.map((restaurant) => {
              const isClosed = isRestaurantClosed(restaurant);
              return (
                <Card
                  key={restaurant.id}
                  className={`group cursor-pointer transition-all duration-300 ${
                    isClosed 
                      ? 'opacity-60 grayscale hover:scale-100' 
                      : 'hover:scale-105'
                  } bg-card/40 backdrop-blur-sm border-white/10 hover:border-primary/30 overflow-hidden`}
                  {...(!isClosed && { onClick: () => onRestaurantSelect(restaurant) })}
                >
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-muted/20 to-muted/5 relative overflow-hidden">
                      <ImageWithFallback
                        src={restaurant.image}
                        alt={restaurant.name}
                        className={`w-full h-full object-cover transition-transform duration-300 ${
                          isClosed ? '' : 'group-hover:scale-110'
                        }`}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ${
                        isClosed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`} />
                    </div>
                    {isClosed && (
                      <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                        CLOSED
                      </Badge>
                    )}
                    {restaurant.promo && !isClosed && (
                      <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                        {restaurant.promo}
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className={`font-semibold transition-colors ${
                          isClosed 
                            ? 'text-muted-foreground' 
                            : 'text-foreground group-hover:text-primary'
                        }`}>
                          {restaurant.name}
                        </h3>
                        <p className={`text-sm ${
                          isClosed ? 'text-muted-foreground/60' : 'text-muted-foreground'
                        }`}>
                          {restaurant.cuisine}
                        </p>
                        <p className={`text-xs mt-1 line-clamp-2 ${
                          isClosed ? 'text-muted-foreground/60' : 'text-muted-foreground'
                        }`}>
                          {restaurant.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className={`flex items-center space-x-1 ${
                          isClosed ? 'text-muted-foreground/60' : 'text-yellow-500'
                        }`}>
                          <Star className={`h-4 w-4 ${isClosed ? '' : 'fill-current'}`} />
                          <span className={isClosed ? 'text-muted-foreground/60' : 'text-foreground'}>
                            {restaurant.rating}
                          </span>
                        </div>
                        <div className={`flex items-center space-x-1 ${
                          isClosed ? 'text-muted-foreground/60' : 'text-muted-foreground'
                        }`}>
                          <Clock className="h-4 w-4" />
                          <span>{restaurant.deliveryTime}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${
                          isClosed ? 'text-muted-foreground/60' : 'text-muted-foreground'
                        }`}>
                          Delivery: {restaurant.deliveryFee}
                        </span>
                        <Button 
                          size="sm" 
                          className={`${
                            isClosed 
                              ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onRestaurantSelect(restaurant);
                          }}
                        >
                          {isClosed ? 'Closed' : 'Order Now'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}