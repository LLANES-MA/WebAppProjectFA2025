import { CheckCircle, Clock, MapPin, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface OrderConfirmationProps {
  onBackToHome: () => void;
  onTrackOrder: () => void;
}

export default function OrderConfirmation({ onBackToHome, onTrackOrder }: OrderConfirmationProps) {
  const orderNumber = `FD${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/40 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-semibold text-primary">FrontDash</h1>
              <div className="w-4 h-4 border border-primary rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>
          
          {/* Success Message */}
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold text-foreground">Order Confirmed!</h1>
            <p className="text-lg text-muted-foreground">
              Thank you for your order. Your delicious food is being prepared.
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-lg">
              <span className="text-primary font-semibold">Order #{orderNumber}</span>
            </div>
          </div>

          {/* Order Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card/40 backdrop-blur-sm border-white/10">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Estimated Delivery</h3>
                  <p className="text-sm text-muted-foreground">25-35 minutes</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-sm border-white/10">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Delivery Address</h3>
                  <p className="text-sm text-muted-foreground">Your saved address</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-sm border-white/10">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Need Help?</h3>
                  <p className="text-sm text-muted-foreground">Contact support</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Tracking */}
          <Card className="bg-card/40 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground text-center">Order Progress</h3>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-4 h-4 bg-primary rounded-full"></div>
                    <span className="text-xs text-foreground">Order Placed</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-primary/30 mx-2"></div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-xs text-primary">Preparing</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-muted mx-2"></div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-4 h-4 bg-muted rounded-full"></div>
                    <span className="text-xs text-muted-foreground">Out for Delivery</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-muted mx-2"></div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-4 h-4 bg-muted rounded-full"></div>
                    <span className="text-xs text-muted-foreground">Delivered</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onTrackOrder}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Track Your Order
            </Button>
            <Button
              onClick={onBackToHome}
              variant="outline"
              className="border-white/20"
            >
              Back to Home
            </Button>
          </div>

          {/* Additional Info */}
          <div className="bg-primary/5 p-6 rounded-lg space-y-2">
            <h4 className="font-semibold text-foreground">What's Next?</h4>
            <p className="text-sm text-muted-foreground">
              You'll receive SMS updates about your order status. Our delivery partner will contact you 
              when they're nearby. Make sure to keep your phone handy!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}