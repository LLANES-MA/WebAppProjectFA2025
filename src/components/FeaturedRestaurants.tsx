import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Star, Clock, Truck } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect } from 'react';
import { getApprovedRestaurants, transformRestaurantForDisplay } from '../services/restaurantService';

interface FeaturedRestaurantsProps {
  onViewAllRestaurants?: () => void;
  onRestaurantSelect?: (restaurant: any) => void;
}

export default function FeaturedRestaurants({ onViewAllRestaurants, onRestaurantSelect }: FeaturedRestaurantsProps) {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        setLoading(true);
        const approvedRestaurants = await getApprovedRestaurants();
        // Transform and limit to 4 featured restaurants
        const transformed = approvedRestaurants
          .slice(0, 4)
          .map(restaurant => ({
            ...transformRestaurantForDisplay(restaurant),
            featured: true,
            promo: restaurant.deliveryFee === 0 || restaurant.deliveryFee === 'Free' ? 'Free Delivery' : null,
          }));
        setRestaurants(transformed);
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
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-primary/5">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Featured Restaurants
          </h2>
          <p className="text-xl text-muted-foreground">
            Top-rated restaurants near you
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading restaurants...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {!loading && !error && restaurants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No restaurants available at the moment.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {restaurants.map((restaurant) => (
            <Card
              key={restaurant.id}
              className="group cursor-pointer transition-all duration-300 hover:scale-105 frontdash-card-bg hover:frontdash-glow overflow-hidden"
              onClick={() => onRestaurantSelect && onRestaurantSelect(restaurant)}
            >
              <div className="relative">
                <ImageWithFallback
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {restaurant.promo && (
                  <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                    {restaurant.promo}
                  </Badge>
                )}
                {restaurant.featured && (
                  <Badge className="absolute top-3 right-3 bg-yellow-500 text-black">
                    Featured
                  </Badge>
                )}
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {restaurant.name}
                    </h3>
                    <p className="text-muted-foreground">{restaurant.cuisine}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{restaurant.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{restaurant.deliveryTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Truck className="h-4 w-4" />
                      <span>{restaurant.deliveryFee}</span>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-primary hover:bg-primary/80"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRestaurantSelect && onRestaurantSelect(restaurant);
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

        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={onViewAllRestaurants}
          >
            View All Restaurants
          </Button>
        </div>
      </div>
    </section>
  );
}