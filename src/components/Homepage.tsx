import { MapPin, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import Header from './Header';
import FeaturedRestaurants from './FeaturedRestaurants';
import FoodCategories from './FoodCategories';
import Footer from './Footer';


interface HomepageProps {
  onFindFood: (searchQuery: string) => void;
  onViewAllRestaurants: () => void;
  onRestaurantSelect: (restaurant: any) => void;
  onRestaurantSignup?: () => void;
  onGoToAccount?: () => void;
  onGoToSettings?: () => void;
  onGoToSignIn?: () => void;
  onViewCart?: () => void;
  onGoToRestaurantDashboard?: () => void;
  deliveryAddress?: string;
  onDeliveryAddressChange?: (address: string) => void;
}

export default function Homepage({ onFindFood, onViewAllRestaurants, onRestaurantSelect, onRestaurantSignup, onGoToAccount, onGoToSettings, onGoToSignIn, onViewCart, onGoToRestaurantDashboard, deliveryAddress, onDeliveryAddressChange }: HomepageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [address, setAddress] = useState('');

  const handleFindFood = () => {
    onFindFood(searchQuery);
  };

  return (
    <div className="min-h-screen bg-background frontdash-animated-bg">
      <Header 
        onRestaurantSignup={onRestaurantSignup} 
        onFindFood={onFindFood}
        onViewAllRestaurants={onViewAllRestaurants}
        onGoToSignIn={onGoToSignIn}
        onGoToAccount={onGoToAccount}
        onGoToSettings={onGoToSettings}
        onViewCart={onViewCart}
        deliveryAddress={deliveryAddress}
        onDeliveryAddressChange={onDeliveryAddressChange}
      />
      {/* Main Content */}
      <div className="relative">
        {/* Hero Section from Sketches */}
        <section className="container mx-auto px-6 py-16 frontdash-hero-bg">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-8 mb-16">
              <h1 className="text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight frontdash-text-glow">
                FrontDash Brings<br />
                you Fast Delivery &<br />
                Delicious Food
              </h1>
              
              {/* Action Buttons from Sketches */}
              <div className="space-y-4 max-w-md mx-auto">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter your address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="h-12 pl-10 bg-transparent frontdash-border-glow text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for restaurants, cuisine, or dishes"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleFindFood()}
                    className="h-12 pl-10 bg-transparent frontdash-border-glow text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                
                <Button 
                  onClick={handleFindFood}
                  className="w-full h-12 bg-primary hover:bg-primary/80 text-primary-foreground frontdash-glow-strong"
                >
                  Find Food
                </Button>
                
                {onGoToRestaurantDashboard && (
                  <Button 
                    onClick={onGoToRestaurantDashboard}
                    variant="outline"
                    className="w-full h-12 border-primary/30 bg-transparent hover:bg-primary/10 text-foreground frontdash-border-glow"
                  >
                    Restaurant Dashboard
                  </Button>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-primary/20 mb-12 frontdash-glow"></div>
          </div>
        </section>

        {/* Original Website Sections */}
        <FoodCategories />
        <FeaturedRestaurants 
          onViewAllRestaurants={onViewAllRestaurants}
          onRestaurantSelect={onRestaurantSelect}
        />
        <Footer />
      </div>
    </div>
  );
}