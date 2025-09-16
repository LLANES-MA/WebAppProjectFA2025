import { Bell, User, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface DashboardProps {
  onRestaurantSelect?: (restaurant: any) => void;
  onBackToHomepage?: () => void;
  onGoToAllRestaurants?: () => void;
}

const foodPlaces = [
  {
    id: 1,
    name: "Chick-fil-A",
    cuisine: "Fast Food",
    rating: 4.8,
    deliveryTime: "15-25 min",
    image: "https://images.unsplash.com/photo-1643757412923-619484c906f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBmb29kfGVufDF8fHx8MTc1NjgyMzQ5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    promo: "Free Delivery"
  },
  {
    id: 2,
    name: "Mario's Pizzeria",
    cuisine: "Italian",
    rating: 4.9,
    deliveryTime: "25-35 min",
    image: "https://images.unsplash.com/photo-1563245738-9169ff58eccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzU2ODMzNDk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    promo: "20% OFF"
  },
  {
    id: 3,
    name: "Sakura Sushi",
    cuisine: "Japanese",
    rating: 4.7,
    deliveryTime: "30-40 min",
    image: "https://images.unsplash.com/photo-1696449241254-11cf7f18ce32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXNoaSUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzU2NzUwNzg4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: 4,
    name: "Nonna's Kitchen",
    cuisine: "Italian",
    rating: 4.6,
    deliveryTime: "20-30 min",
    image: "https://images.unsplash.com/photo-1662197480393-2a82030b7b83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwcGFzdGF8ZW58MXx8fHwxNzU2ODIzNDk0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: 5,
    name: "Burger Palace",
    cuisine: "American",
    rating: 4.5,
    deliveryTime: "25-35 min",
    image: "https://images.unsplash.com/photo-1643757412923-619484c906f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBmb29kfGVufDF8fHx8MTc1NjgyMzQ5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: 6,
    name: "Taco Express",
    cuisine: "Mexican",
    rating: 4.4,
    deliveryTime: "20-30 min",
    image: "https://images.unsplash.com/photo-1696449241254-11cf7f18ce32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXNoaSUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzU2NzUwNzg4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  }
];

export default function Dashboard({ 
  onRestaurantSelect, 
  onBackToHomepage, 
  onGoToAllRestaurants
}: DashboardProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="w-full">
        {/* Header */}
        <header className="h-16 bg-background border-b border-white/10 flex items-center justify-between px-8">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-semibold text-primary">FrontDash</h1>
            <div className="w-4 h-4 border border-primary rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <User className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className="border border-white/20 text-foreground hover:bg-white/10">
              Menu
            </Button>
          </div>
        </header>

        {/* Food Places Section */}
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-medium text-foreground">Food Places</h2>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground border border-white/20">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Grid of Food Places - 4x3 layout matching your sketch */}
          <div className="grid grid-cols-4 gap-6 max-w-6xl">
            {foodPlaces.map((place) => (
              <Card
                key={place.id}
                className="group cursor-pointer transition-all duration-300 hover:scale-105 bg-card/40 backdrop-blur-sm border-white/10 hover:border-primary/30 overflow-hidden"
                onClick={() => onRestaurantSelect && onRestaurantSelect(place)}
              >
                <div className="relative">
                  <div className="aspect-square bg-gradient-to-br from-muted/20 to-muted/5 relative overflow-hidden">
                    <ImageWithFallback
                      src={place.image}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  {place.promo && (
                    <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
                      {place.promo}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors mb-1 text-sm">
                    {place.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">{place.cuisine}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>★ {place.rating}</span>
                    <span>{place.deliveryTime}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}