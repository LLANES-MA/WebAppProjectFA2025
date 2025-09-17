import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, MapPin } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export default function Hero() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1598546937882-4fa25fa29418?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwZGVsaXZlcnklMjBoZXJvfGVufDF8fHx8MTc1Njg0MjI5OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Food delivery hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-foreground">
            Delicious Food
            <span className="block text-primary">Delivered Fast</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Order from the best local restaurants with easy, on-demand delivery.
          </p>

          {/* Search Section */}
          <div className="bg-card/80 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/10">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Enter your address"
                  className="pl-12 h-12 bg-background/50 border-white/10"
                />
              </div>
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for restaurants or food"
                  className="pl-12 h-12 bg-background/50 border-white/10"
                />
              </div>
              <Button className="h-12 px-8 bg-primary hover:bg-primary/80">
                Find Food
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">Restaurants</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">30min</div>
              <p className="text-muted-foreground">Average Delivery</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">4.8★</div>
              <p className="text-muted-foreground">Customer Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}