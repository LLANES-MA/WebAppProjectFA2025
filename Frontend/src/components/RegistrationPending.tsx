import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle2, Clock, Mail, Phone, ArrowLeft } from 'lucide-react';

interface RegistrationPendingProps {
  registration: any;
  onBack: () => void;
}

export default function RegistrationPending({ registration, onBack }: RegistrationPendingProps) {
  return (
    <div className="min-h-screen bg-background frontdash-animated-bg">
      {/* Header */}
      <header className="border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-primary">FrontDash</h1>
              <div className="w-4 h-4 border border-primary rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              </div>
              <span className="text-muted-foreground">|</span>
              <span className="text-foreground">Registration Status</span>
            </div>
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Homepage
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Status Card */}
          <Card className="frontdash-card-bg frontdash-border-glow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
              <CardTitle className="text-2xl">Registration Submitted!</CardTitle>
              <Badge variant="secondary" className="w-fit mx-auto">
                <Clock className="h-3 w-3 mr-1" />
                Pending Review
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">
                  Thank you for submitting your restaurant registration to FrontDash. 
                  Your application is currently under review by our team.
                </p>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <h4 className="font-medium text-primary mb-3">What happens next?</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-medium text-primary">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Review Process</p>
                      <p className="text-xs text-muted-foreground">
                        Our team will review your restaurant information, business documents, and menu details.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-medium text-primary">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Verification</p>
                      <p className="text-xs text-muted-foreground">
                        We'll verify your business license, tax information, and contact details.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-medium text-primary">3</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Approval & Setup</p>
                      <p className="text-xs text-muted-foreground">
                        Once approved, you'll receive access to your restaurant dashboard and onboarding support.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Summary */}
              <Card className="bg-card/40 border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg">Application Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Restaurant Name:</span>
                      <p className="font-medium">{registration?.restaurantName || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cuisine Type:</span>
                      <p className="font-medium">{registration?.cuisineType || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Submitted:</span>
                      <p className="font-medium">{registration?.submittedAt || 'Today'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Application ID:</span>
                      <p className="font-medium">FD-{registration?.id || '000000'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="bg-blue-500/10 border border-blue-500/20">
                <CardContent className="p-4">
                  <h4 className="font-medium text-blue-400 mb-3">Need Help?</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-blue-300">
                      <Mail className="h-4 w-4" />
                      <span>support@frontdash.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-300">
                      <Phone className="h-4 w-4" />
                      <span>1-800-FRONTDASH</span>
                    </div>
                    <p className="text-blue-400/80 text-xs mt-3">
                      Reference your Application ID (FD-{registration?.id || '000000'}) when contacting support.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <h4 className="font-medium text-green-400 mb-2">Expected Timeline</h4>
                <p className="text-sm text-green-300">
                  Most restaurant applications are reviewed within <span className="font-medium">2-3 business days</span>. 
                  Complex applications may take up to 5 business days for thorough review.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-center">
            <Button 
              onClick={onBack}
              className="bg-primary hover:bg-primary/90 frontdash-glow"
            >
              Return to Homepage
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}