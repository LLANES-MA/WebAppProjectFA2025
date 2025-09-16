import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Upload, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  DollarSign,
  Camera,
  Plus,
  X
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';

interface RestaurantRegistrationProps {
  onComplete: (registrationData: any) => void;
  onBack: () => void;
}

const steps = [
  { id: 1, title: 'Basic Information', description: 'Tell us about your restaurant' },
  { id: 2, title: 'Location & Contact', description: 'Where can customers find you?' },
  { id: 3, title: 'Menu & Pricing', description: 'Showcase your delicious offerings' },
  { id: 4, title: 'Business Verification', description: 'Verify your business credentials' },
  { id: 5, title: 'Review & Submit', description: 'Review and submit your application' }
];

const cuisineTypes = [
  'Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'Thai', 'American', 
  'Mediterranean', 'French', 'Korean', 'Vietnamese', 'Pizza', 'Burgers', 'Seafood'
];

export default function RestaurantRegistration({ onComplete, onBack }: RestaurantRegistrationProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Info
    restaurantName: '',
    description: '',
    cuisineType: '',
    establishedYear: '',
    
    // Location & Contact
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    
    // Menu & Operations
    averagePrice: '',
    deliveryFee: '',
    minimumOrder: '',
    preparationTime: '',
    operatingHours: {
      monday: { open: '', close: '', closed: false },
      tuesday: { open: '', close: '', closed: false },
      wednesday: { open: '', close: '', closed: false },
      thursday: { open: '', close: '', closed: false },
      friday: { open: '', close: '', closed: false },
      saturday: { open: '', close: '', closed: false },
      sunday: { open: '', close: '', closed: false }
    },
    
    // Business Info
    businessLicense: '',
    taxId: '',
    ownerName: '',
    bankAccount: ''
  });

  const [menuItems, setMenuItems] = useState([
    { name: '', description: '', price: '', category: '', image: null }
  ]);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addMenuItem = () => {
    setMenuItems(prev => [...prev, { name: '', description: '', price: '', category: '', image: null }]);
  };

  const removeMenuItem = (index: number) => {
    setMenuItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateMenuItem = (index: number, field: string, value: string) => {
    setMenuItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Restaurant Name *</label>
                <Input
                  placeholder="Enter your restaurant name"
                  value={formData.restaurantName}
                  onChange={(e) => updateFormData('restaurantName', e.target.value)}
                  className="bg-card/50 border-white/10"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <Textarea
                  placeholder="Describe your restaurant, specialties, and what makes you unique..."
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  className="bg-card/50 border-white/10 min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Cuisine Type *</label>
                  <Select value={formData.cuisineType} onValueChange={(value) => updateFormData('cuisineType', value)}>
                    <SelectTrigger className="bg-card/50 border-white/10">
                      <SelectValue placeholder="Select cuisine type" />
                    </SelectTrigger>
                    <SelectContent>
                      {cuisineTypes.map((cuisine) => (
                        <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Established Year</label>
                  <Input
                    placeholder="2020"
                    value={formData.establishedYear}
                    onChange={(e) => updateFormData('establishedYear', e.target.value)}
                    className="bg-card/50 border-white/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Restaurant Logo/Photo</label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Click to upload restaurant photo</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Street Address *</label>
                <Input
                  placeholder="123 Main Street"
                  value={formData.address}
                  onChange={(e) => updateFormData('address', e.target.value)}
                  className="bg-card/50 border-white/10"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City *</label>
                  <Input
                    placeholder="New York"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    className="bg-card/50 border-white/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">State *</label>
                  <Input
                    placeholder="NY"
                    value={formData.state}
                    onChange={(e) => updateFormData('state', e.target.value)}
                    className="bg-card/50 border-white/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">ZIP Code *</label>
                  <Input
                    placeholder="10001"
                    value={formData.zipCode}
                    onChange={(e) => updateFormData('zipCode', e.target.value)}
                    className="bg-card/50 border-white/10"
                  />
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number *</label>
                  <Input
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    className="bg-card/50 border-white/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address *</label>
                  <Input
                    placeholder="restaurant@example.com"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="bg-card/50 border-white/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Website (Optional)</label>
                <Input
                  placeholder="https://www.yourrestaurant.com"
                  value={formData.website}
                  onChange={(e) => updateFormData('website', e.target.value)}
                  className="bg-card/50 border-white/10"
                />
              </div>

              <Separator className="bg-white/10" />

              <div>
                <h4 className="font-medium mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  Operating Hours *
                </h4>
                <div className="space-y-3">
                  {Object.entries(formData.operatingHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center space-x-4">
                      <div className="w-20">
                        <span className="text-sm font-medium capitalize">{day}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${day}-closed`}
                          checked={hours.closed}
                          onCheckedChange={(checked) => {
                            const updatedHours = { ...formData.operatingHours };
                            updatedHours[day as keyof typeof formData.operatingHours].closed = checked as boolean;
                            if (checked) {
                              updatedHours[day as keyof typeof formData.operatingHours].open = '';
                              updatedHours[day as keyof typeof formData.operatingHours].close = '';
                            }
                            updateFormData('operatingHours', updatedHours);
                          }}
                        />
                        <label htmlFor={`${day}-closed`} className="text-sm text-muted-foreground">
                          Closed
                        </label>
                      </div>

                      {!hours.closed && (
                        <>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">Open:</span>
                            <Select
                              value={hours.open}
                              onValueChange={(value) => {
                                const updatedHours = { ...formData.operatingHours };
                                updatedHours[day as keyof typeof formData.operatingHours].open = value;
                                updateFormData('operatingHours', updatedHours);
                              }}
                            >
                              <SelectTrigger className="w-24 bg-card/50 border-white/10">
                                <SelectValue placeholder="--" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 24 }, (_, i) => {
                                  const hour = i.toString().padStart(2, '0');
                                  return (
                                    <SelectItem key={`${hour}:00`} value={`${hour}:00`}>{`${hour}:00`}</SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">Close:</span>
                            <Select
                              value={hours.close}
                              onValueChange={(value) => {
                                const updatedHours = { ...formData.operatingHours };
                                updatedHours[day as keyof typeof formData.operatingHours].close = value;
                                updateFormData('operatingHours', updatedHours);
                              }}
                            >
                              <SelectTrigger className="w-24 bg-card/50 border-white/10">
                                <SelectValue placeholder="--" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 24 }, (_, i) => {
                                  const hour = i.toString().padStart(2, '0');
                                  return (
                                    <SelectItem key={`${hour}:00`} value={`${hour}:00`}>{`${hour}:00`}</SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-400">
                    💡 Tip: Set accurate hours so customers know when they can order from you. You can always update these later in your dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Average Price Range *</label>
                <Select value={formData.averagePrice} onValueChange={(value) => updateFormData('averagePrice', value)}>
                  <SelectTrigger className="bg-card/50 border-white/10">
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$">$ (Under $15)</SelectItem>
                    <SelectItem value="$$">$$ ($15-30)</SelectItem>
                    <SelectItem value="$$$">$$$ ($30-50)</SelectItem>
                    <SelectItem value="$$$$">$$$$ ($50+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Delivery Fee *</label>
                <Input
                  placeholder="2.99"
                  value={formData.deliveryFee}
                  onChange={(e) => updateFormData('deliveryFee', e.target.value)}
                  className="bg-card/50 border-white/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Minimum Order ($) *</label>
                <Input
                  placeholder="15.00"
                  value={formData.minimumOrder}
                  onChange={(e) => updateFormData('minimumOrder', e.target.value)}
                  className="bg-card/50 border-white/10"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Avg. Preparation Time (min) *</label>
                <Input
                  placeholder="25"
                  value={formData.preparationTime}
                  onChange={(e) => updateFormData('preparationTime', e.target.value)}
                  className="bg-card/50 border-white/10"
                />
              </div>
            </div>

            <Separator className="bg-white/10" />

            <div>
              <h4 className="font-medium mb-4">Sample Menu Items</h4>
              <div className="space-y-4">
                {menuItems.map((item, index) => (
                  <Card key={index} className="bg-card/40 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <h5 className="font-medium">Item #{index + 1}</h5>
                        {menuItems.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMenuItem(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Input
                            placeholder="Item name"
                            value={item.name}
                            onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
                            className="bg-background/50 border-white/10"
                          />
                        </div>
                        <div>
                          <Input
                            placeholder="Price (e.g., 12.99)"
                            value={item.price}
                            onChange={(e) => updateMenuItem(index, 'price', e.target.value)}
                            className="bg-background/50 border-white/10"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Textarea
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) => updateMenuItem(index, 'description', e.target.value)}
                          className="bg-background/50 border-white/10"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <Button
                  variant="outline"
                  onClick={addMenuItem}
                  className="w-full border-white/20 text-foreground hover:bg-white/5"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Menu Item
                </Button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Business License Number *</label>
                <Input
                  placeholder="Enter your business license number"
                  value={formData.businessLicense}
                  onChange={(e) => updateFormData('businessLicense', e.target.value)}
                  className="bg-card/50 border-white/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tax ID (EIN) *</label>
                <Input
                  placeholder="XX-XXXXXXX"
                  value={formData.taxId}
                  onChange={(e) => updateFormData('taxId', e.target.value)}
                  className="bg-card/50 border-white/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Business Owner Name *</label>
                <Input
                  placeholder="Full name of business owner"
                  value={formData.ownerName}
                  onChange={(e) => updateFormData('ownerName', e.target.value)}
                  className="bg-card/50 border-white/10"
                />
              </div>

              <Separator className="bg-white/10" />

              <div>
                <h4 className="font-medium mb-4">Required Documents</h4>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Upload Business License</p>
                    <p className="text-xs text-muted-foreground">PDF, JPG, PNG up to 5MB</p>
                  </div>
                  
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Upload Food Handler's Permit</p>
                    <p className="text-xs text-muted-foreground">PDF, JPG, PNG up to 5MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Review Your Application</h3>
              <p className="text-muted-foreground">Please review all information before submitting</p>
            </div>

            <Card className="bg-card/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Restaurant Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">{formData.restaurantName || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cuisine:</span>
                    <p className="font-medium">{formData.cuisineType || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location:</span>
                    <p className="font-medium">{formData.city && formData.state ? `${formData.city}, ${formData.state}` : 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Average Price:</span>
                    <p className="font-medium">{formData.averagePrice || 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Operating Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(formData.operatingHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between items-center py-1">
                      <span className="text-sm font-medium capitalize">{day}:</span>
                      <span className="text-sm text-muted-foreground">
                        {hours.closed 
                          ? 'Closed' 
                          : hours.open && hours.close 
                            ? `${hours.open} - ${hours.close}` 
                            : 'Not set'
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <h4 className="font-medium text-primary mb-2">Next Steps</h4>
              <ul className="text-sm text-primary/80 space-y-1">
                <li>• Your application will be reviewed within 2-3 business days</li>
                <li>• You'll receive an email confirmation once approved</li>
                <li>• Access to your restaurant dashboard will be provided</li>
                <li>• Our team will help you set up payment processing</li>
              </ul>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
              <span className="text-foreground">Restaurant Registration</span>
            </div>
            <Button variant="ghost" onClick={onBack}>
              Back to FrontDash
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Join FrontDash as a Restaurant Partner</h2>
              <Badge variant="outline" className="border-primary text-primary">
                Step {currentStep} of {steps.length}
              </Badge>
            </div>
            <Progress value={progress} className="h-2 mb-4" />
            <div className="grid grid-cols-5 gap-4">
              {steps.map((step) => (
                <div key={step.id} className="text-center">
                  <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-medium ${
                    step.id <= currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.id < currentStep ? <Check className="h-4 w-4" /> : step.id}
                  </div>
                  <p className="text-xs text-muted-foreground">{step.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <Card className="bg-card/60 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].title}</CardTitle>
              <p className="text-muted-foreground">{steps[currentStep - 1].description}</p>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="border-white/20 text-foreground hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            {currentStep === steps.length ? (
              <Button onClick={() => onComplete(formData)} className="bg-primary hover:bg-primary/80">
                Submit Application
                <Check className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={nextStep} className="bg-primary hover:bg-primary/80">
                Next Step
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}