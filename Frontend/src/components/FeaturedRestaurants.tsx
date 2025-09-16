import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Star, Clock, Truck } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const restaurants = [
  {
    id: 1,
    name: "Mario's Pizzeria",
    cuisine: "Italian",
    rating: 4.8,
    deliveryTime: "25-35 min",
    deliveryFee: "Free",
    image: "https://images.unsplash.com/photo-1563245738-9169ff58eccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzU2ODMzNDk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    featured: true,
    promo: "20% OFF",
    description: "Authentic Italian pizzas made with fresh ingredients and traditional recipes"
  },
  {
    id: 2,
    name: "Burger Palace",
    cuisine: "American",
    rating: 4.6,
    deliveryTime: "30-40 min",
    deliveryFee: "$2.99",
    image: "https://images.unsplash.com/photo-1643757412923-619484c906f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBmb29kfGVufDF8fHx8MTc1NjgyMzQ5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    featured: false,
    promo: null,
    description: "Gourmet burgers made with premium beef and fresh toppings"
  },
  {
    id: 3,
    name: "Sakura Sushi",
    cuisine: "Japanese",
    rating: 4.9,
    deliveryTime: "35-45 min",
    deliveryFee: "Free",
    image: "https://images.unsplash.com/photo-1696449241254-11cf7f18ce32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXNoaSUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzU2NzUwNzg4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    featured: true,
    promo: "Buy 1 Get 1",
    description: "Fresh sushi and Japanese cuisine prepared by skilled chefs using premium ingredients"
  },
  {
    id: 4,
    name: "Nonna's Kitchen",
    cuisine: "Italian",
    rating: 4.7,
    deliveryTime: "20-30 min",
    deliveryFee: "Free",
    image: "https://images.unsplash.com/photo-1662197480393-2a82030b7b83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwcGFzdGF8ZW58MXx8fHwxNzU2ODIzNDk0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    featured: false,
    promo: null,
    description: "Traditional Italian comfort food and homemade pasta dishes"
  }
];

interface FeaturedRestaurantsProps {
  onViewAllRestaurants?: () => void;
  onRestaurantSelect?: (restaurant: any) => void;
}

export default function FeaturedRestaurants({ onViewAllRestaurants, onRestaurantSelect }: FeaturedRestaurantsProps) {
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