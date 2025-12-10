import { useState, useEffect } from 'react';
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
import { Label } from './ui/label';

interface RestaurantRegistrationProps {
  onComplete: (registrationData: any) => void;
  onBack: () => void;
  initialAccountData?: { email: string; password: string };
}

const steps = [
  { id: 1, title: 'Basic Information', description: 'Tell us about your restaurant' },
  { id: 2, title: 'Location & Contact', description: 'Where can customers find you?' },
  { id: 3, title: 'Menu & Pricing', description: 'Showcase your delicious offerings' },
  { id: 4, title: 'Review & Submit', description: 'Review and submit your application' }
];

const cuisineTypes = [
  'Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'Thai', 'American',
  'Mediterranean', 'French', 'Korean', 'Vietnamese', 'Pizza', 'Burgers', 'Seafood'
  // "Other" will be handled separately
];

const usStates = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

export default function RestaurantRegistration({ onComplete, onBack, initialAccountData }: RestaurantRegistrationProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [accountPassword, setAccountPassword] = useState<string>(initialAccountData?.password || '');
  const [formData, setFormData] = useState<{
    restaurantName: string;
    description: string;
    cuisineType: string[];
    establishedYear: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    contactPerson: string;
    email: string;
    website: string;
    averagePrice: string;
    deliveryFee: string;
    minimumOrder: string;
    preparationTime: string;
    operatingHours: {
      [key: string]: {
        open: string;
        close: string;
        closed: boolean;
        allDay: boolean;
      };
    };
  }>({
    // Basic Info
    restaurantName: '',
    description: '',
    cuisineType: [],
    establishedYear: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    contactPerson: '',
    email: initialAccountData?.email || '',
    website: '',
    averagePrice: '',
    deliveryFee: '',
    minimumOrder: '',
    preparationTime: '',
    operatingHours: {
      monday: { open: '', close: '', closed: false, allDay: false },
      tuesday: { open: '', close: '', closed: false, allDay: false },
      wednesday: { open: '', close: '', closed: false, allDay: false },
      thursday: { open: '', close: '', closed: false, allDay: false },
      friday: { open: '', close: '', closed: false, allDay: false },
      saturday: { open: '', close: '', closed: false, allDay: false },
      sunday: { open: '', close: '', closed: false, allDay: false }
    }
  });

    

  const [errors, setErrors] = useState<{ [key: string]: any }>({});

  const [menuItems, setMenuItems] = useState([
    { name: '', description: '', price: '', category: '', image: null, imageFile: null as File | null, imageUrl: null as string | null }
  ]);

  const [customCuisine, setCustomCuisine] = useState('');
  const [otherChecked, setOtherChecked] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Update email and password when initialAccountData is provided
  useEffect(() => {
    if (initialAccountData) {
      setFormData(prev => ({ ...prev, email: initialAccountData.email }));
      setAccountPassword(initialAccountData.password);
    }
  }, [initialAccountData]);

  const addMenuItem = () => {
    setMenuItems(prev => [...prev, { name: '', description: '', price: '', category: '', image: null, imageFile: null, imageUrl: null }]);
  };

  const removeMenuItem = (index: number) => {
    setMenuItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateMenuItem = (index: number, field: string, value: string) => {
    setMenuItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleImageUpload = async (index: number, file: File | null) => {
    if (!file) {
      setMenuItems(prev => prev.map((item, i) =>
        i === index ? { ...item, image: null, imageFile: null, imageUrl: null } : item
      ));
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Create preview URL for immediate display
    const reader = new FileReader();
    reader.onloadend = () => {
      setMenuItems(prev => prev.map((item, i) =>
        i === index ? { ...item, image: reader.result as string, imageFile: file } : item
      ));
    };
    reader.readAsDataURL(file);

    // Upload image to backend and get URL
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/restaurants/upload-image`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image');
      }

      // Update menu item with the image URL from backend
      setMenuItems(prev => prev.map((item, i) =>
        i === index ? { ...item, imageUrl: data.imageUrl } : item
      ));
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
      // Remove the preview if upload failed
      setMenuItems(prev => prev.map((item, i) =>
        i === index ? { ...item, image: null, imageFile: null } : item
      ));
    }
  };

  const validateStep = () => {
    // Basic validation for required fields in each step
    const newErrors: { [key: string]: any } = {};
    if (currentStep === 1) {
      if (!formData.restaurantName) newErrors.restaurantName = 'Restaurant name is required';
      if (!formData.description) newErrors.description = 'Description is required';
      if (!formData.cuisineType || formData.cuisineType.length === 0) newErrors.cuisineType = 'Select at least one cuisine type';

    } else if (currentStep === 2) {
      if (!formData.address) newErrors.address = 'Address is required';
      if (!formData.city) newErrors.city = 'City is required';

      // State validation
      if (!formData.state) {
        newErrors.state = 'State is required';
      } else if (!usStates.includes(formData.state)) {
        newErrors.state = 'Select a valid state';
      }

      // ZIP code validation
      if (!formData.zipCode) {
        newErrors.zipCode = 'ZIP code is required';
      } else if (!/^\d{5}$/.test(formData.zipCode)) {
        newErrors.zipCode = 'ZIP code must be 5 digits';
      }

      // Contact person validation
      if (!formData.contactPerson || !formData.contactPerson.trim()) {
        newErrors.contactPerson = 'Contact person is required';
      } else if (formData.contactPerson.trim().length < 2) {
        newErrors.contactPerson = 'Contact person name must be at least 2 characters';
      }

      // Phone validation (10 digits, first digit cannot be 0)
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else {
        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
          newErrors.phone = 'Phone number must be exactly 10 digits';
        } else if (phoneDigits[0] === '0') {
          newErrors.phone = 'Phone number cannot start with 0';
        }
      }

      // Email validation
      if (!formData.email) {
        newErrors.email = 'Email address is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Enter a valid email address';
      }

      // Validate operating hours
      const opHoursErrors: { [day: string]: string } = {};
      Object.entries(formData.operatingHours).forEach(([day, hours]) => {
        if (!hours.closed && !hours.allDay) {
          if (!hours.open || !hours.close) {
            opHoursErrors[day] = 'Set open and close time or mark as closed/all day';
          } else {
            // Compare times
            const [openHour, openMin] = hours.open.split(':').map(Number);
            const [closeHour, closeMin] = hours.close.split(':').map(Number);
            const openTotal = openHour * 60 + openMin;
            const closeTotal = closeHour * 60 + closeMin;
            if (closeTotal <= openTotal) {
              opHoursErrors[day] = 'Closing time must be after opening time';
            }
          }
        }
      });
      if (Object.keys(opHoursErrors).length > 0) {
        newErrors.operatingHours = opHoursErrors;
      }

    } else if (currentStep === 3) {
      if (!formData.averagePrice) newErrors.averagePrice = 'Average price range is required';
      if (!formData.deliveryFee) newErrors.deliveryFee = 'Delivery fee is required';
      if (!formData.minimumOrder) newErrors.minimumOrder = 'Minimum order amount is required';
      if (!formData.preparationTime) newErrors.preparationTime = 'Preparation time is required';
      // Validate menu items
      const menuErrors: { [index: number]: { [field: string]: string } } = {};
      menuItems.forEach((item, idx) => {
        const itemErrors: { [field: string]: string } = {};
        if (!item.name) itemErrors.name = 'Name is required';
        if (!item.price) itemErrors.price = 'Price is required';
        if (!item.description) itemErrors.description = 'Description is required';
        if (Object.keys(itemErrors).length > 0) {
          menuErrors[idx] = itemErrors;
        }
      });
      if (Object.keys(menuErrors).length > 0) {
        newErrors.menuItems = menuErrors;
      }
    } else if (currentStep === 4) {
      if (!termsAccepted) {
        newErrors.termsAccepted = 'You must accept the Terms of Service and Privacy Policy';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
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
                  className={`bg-card/50 border-white/10 ${errors.restaurantName ? 'border-destructive' : ''}`}
                />
                {errors.restaurantName && <p className="text-xs text-destructive mt-1">{errors.restaurantName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <Textarea
                  placeholder="Describe your restaurant, specialties, and what makes you unique..."
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  className={`bg-card/50 border-white/10 min-h-[100px] ${errors.description ? 'border-destructive' : ''}`}
                />
                {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Cuisine Type *</label>
                  <div className={`bg-card/50 border-white/10 rounded-md p-2 ${errors.cuisineType ? 'border-destructive' : ''}`}>
                    <div className="grid grid-cols-2 gap-2">
                      {cuisineTypes.map((cuisine) => (
                        <label key={cuisine} className="flex items-center space-x-2 cursor-pointer">
                          <Checkbox
                            checked={formData.cuisineType.includes(cuisine)}
                            onCheckedChange={(checked) => {
                              let updated: string[];
                              if (checked) {
                                updated = [...formData.cuisineType, cuisine];
                              } else {
                                updated = formData.cuisineType.filter((c) => c !== cuisine);
                              }
                              updateFormData('cuisineType', updated);
                            }}
                          />
                          <span className="text-sm">{cuisine}</span>
                        </label>
                      ))}
                      {/* Other option */}
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                          checked={otherChecked}
                          onCheckedChange={(checked) => {
                            setOtherChecked(!!checked);
                            if (!checked) {
                              // Remove custom cuisine from selected
                              updateFormData('cuisineType', formData.cuisineType.filter(c => c !== customCuisine));
                              setCustomCuisine('');
                            }
                          }}
                        />
                        <span className="text-sm">Other</span>
                      </label>
                    </div>
                    {otherChecked && (
                      <div className="mt-2">
                        <Input
                          placeholder="Enter custom cuisine type"
                          value={customCuisine}
                          onChange={e => {
                            const value = e.target.value;
                            setCustomCuisine(value);
                            // Remove previous custom cuisine, add new one if not empty
                            let updated = formData.cuisineType.filter(c => c !== customCuisine);
                            if (value.trim()) {
                              updated = [...updated, value.trim()];
                            }
                            updateFormData('cuisineType', updated);
                          }}
                          className="bg-background/50 border-white/10"
                        />
                      </div>
                    )}
                  </div>
                  {errors.cuisineType && <p className="text-xs text-destructive mt-1">{errors.cuisineType}</p>}
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
                  className={`bg-card/50 border-white/10 ${errors.address ? 'border-destructive' : ''}`}
                />
                {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City *</label>
                  <Input
                    placeholder="New York"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    className={`bg-card/50 border-white/10 ${errors.city ? 'border-destructive' : ''}`}
                  />
                  {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">State *</label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => updateFormData('state', value)}
                  >
                    <SelectTrigger className={`bg-card/50 border-white/10 ${errors.state ? 'border-destructive' : ''}`}>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {usStates.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.state && <p className="text-xs text-destructive mt-1">{errors.state}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">ZIP Code *</label>
                  <Input
                    placeholder="10001"
                    value={formData.zipCode}
                    onChange={(e) => updateFormData('zipCode', e.target.value)}
                    className={`bg-card/50 border-white/10 ${errors.zipCode ? 'border-destructive' : ''}`}
                  />
                  {errors.zipCode && <p className="text-xs text-destructive mt-1">{errors.zipCode}</p>}
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div>
                <label className="block text-sm font-medium mb-2">Contact Person *</label>
                <Input
                  placeholder="John Doe"
                  value={formData.contactPerson}
                  onChange={(e) => updateFormData('contactPerson', e.target.value)}
                  className={`bg-card/50 border-white/10 ${errors.contactPerson ? 'border-destructive' : ''}`}
                />
                {errors.contactPerson && <p className="text-xs text-destructive mt-1">{errors.contactPerson}</p>}
                <p className="text-xs text-muted-foreground mt-1">This person will be contacted for questions, concerns, and inquiries</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number *</label>
                  <Input
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    className={`bg-card/50 border-white/10 ${errors.phone ? 'border-destructive' : ''}`}
                  />
                  {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address *</label>
                  <Input
                    placeholder="restaurant@example.com"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className={`bg-card/50 border-white/10 ${errors.email ? 'border-destructive' : ''}`}
                  />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
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
                              updatedHours[day as keyof typeof formData.operatingHours].allDay = false;
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
                          <Button
                            variant={hours.allDay ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const updatedHours = { ...formData.operatingHours };
                              updatedHours[day as keyof typeof formData.operatingHours].allDay = !hours.allDay;
                              if (updatedHours[day as keyof typeof formData.operatingHours].allDay) {
                                updatedHours[day as keyof typeof formData.operatingHours].open = '00:00';
                                updatedHours[day as keyof typeof formData.operatingHours].close = '23:59';
                              } else {
                                updatedHours[day as keyof typeof formData.operatingHours].open = '';
                                updatedHours[day as keyof typeof formData.operatingHours].close = '';
                              }
                              updateFormData('operatingHours', updatedHours);
                            }}
                          >
                            All Day
                          </Button>

                          {!hours.allDay && (
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
                {errors.operatingHours && (
                  <div className="mt-2">
                    {Object.entries(errors.operatingHours).map(([day, msg]) => (
                      <p key={day} className="text-xs text-destructive">{day}: {String(msg)}</p>
                    ))}
                  </div>
                )}
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
                  <SelectTrigger className={`bg-card/50 border-white/10 ${errors.averagePrice ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$">$ (Under $15)</SelectItem>
                    <SelectItem value="$$">$$ ($15-30)</SelectItem>
                    <SelectItem value="$$$">$$$ ($30-50)</SelectItem>
                    <SelectItem value="$$$$">$$$$ ($50+)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.averagePrice && <p className="text-xs text-destructive mt-1">{errors.averagePrice}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Delivery Fee *</label>
                <Input
                  placeholder="2.99"
                  value={formData.deliveryFee}
                  onChange={(e) => updateFormData('deliveryFee', e.target.value)}
                  className={`bg-card/50 border-white/10 ${errors.deliveryFee ? 'border-destructive' : ''}`}
                />
                {errors.deliveryFee && <p className="text-xs text-destructive mt-1">{errors.deliveryFee}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Minimum Order ($) *</label>
                <Input
                  placeholder="15.00"
                  value={formData.minimumOrder}
                  onChange={(e) => updateFormData('minimumOrder', e.target.value)}
                  className={`bg-card/50 border-white/10 ${errors.minimumOrder ? 'border-destructive' : ''}`}
                />
                {errors.minimumOrder && <p className="text-xs text-destructive mt-1">{errors.minimumOrder}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Avg. Preparation Time (min) *</label>
                <Input
                  placeholder="25"
                  value={formData.preparationTime}
                  onChange={(e) => updateFormData('preparationTime', e.target.value)}
                  className={`bg-card/50 border-white/10 ${errors.preparationTime ? 'border-destructive' : ''}`}
                />
                {errors.preparationTime && <p className="text-xs text-destructive mt-1">{errors.preparationTime}</p>}
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
                            className={`bg-background/50 border-white/10 ${errors.menuItems && errors.menuItems[index]?.name ? 'border-destructive' : ''}`}
                          />
                          {errors.menuItems && errors.menuItems[index]?.name && (
                            <p className="text-xs text-destructive mt-1">{errors.menuItems[index].name}</p>
                          )}
                        </div>
                        <div>
                          <Input
                            placeholder="Price (e.g., 12.99)"
                            value={item.price}
                            onChange={(e) => updateMenuItem(index, 'price', e.target.value)}
                            className={`bg-background/50 border-white/10 ${errors.menuItems && errors.menuItems[index]?.price ? 'border-destructive' : ''}`}
                          />
                          {errors.menuItems && errors.menuItems[index]?.price && (
                            <p className="text-xs text-destructive mt-1">{errors.menuItems[index].price}</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <Textarea
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) => updateMenuItem(index, 'description', e.target.value)}
                          className={`bg-background/50 border-white/10 ${errors.menuItems && errors.menuItems[index]?.description ? 'border-destructive' : ''}`}
                        />
                        {errors.menuItems && errors.menuItems[index]?.description && (
                          <p className="text-xs text-destructive mt-1">{errors.menuItems[index].description}</p>
                        )}
                      </div>

                      <div className="mt-4">
                        <Label className="text-sm font-medium mb-2 block">Category</Label>
                        <Input
                          placeholder="e.g., Appetizers, Main Course, Desserts"
                          value={item.category}
                          onChange={(e) => updateMenuItem(index, 'category', e.target.value)}
                          className="bg-background/50 border-white/10"
                        />
                      </div>

                      <div className="mt-4">
                        <Label className="text-sm font-medium mb-2 block">Item Image</Label>
                        <div className="flex items-center gap-4">
                          {(item.image || item.imageUrl) ? (
                            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-white/20">
                              <img
                                src={item.imageUrl || item.image}
                                alt={item.name || 'Menu item'}
                                className="w-full h-full object-cover"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 h-6 w-6 p-0"
                                onClick={() => handleImageUpload(index, null)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="w-32 h-32 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center bg-background/30">
                              <Camera className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                handleImageUpload(index, file);
                              }}
                              className="hidden"
                              id={`menu-item-image-${index}`}
                            />
                            <Label
                              htmlFor={`menu-item-image-${index}`}
                              className="cursor-pointer"
                            >
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => document.getElementById(`menu-item-image-${index}`)?.click()}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                {item.image ? 'Change Image' : 'Upload Image'}
                              </Button>
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              JPG, PNG, or GIF (max 5MB)
                            </p>
                          </div>
                        </div>
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
                    <p className="font-medium">
                      {formData.cuisineType.filter(c => c && c.trim()).join(', ') || 'Not provided'}
                    </p>
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
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={checked => setTermsAccepted(!!checked)}
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>
            {errors.termsAccepted && (
              <p className="text-xs text-destructive mt-1">{errors.termsAccepted}</p>
            )}
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
            <div className="grid grid-cols-4 gap-3">
              {steps.map((step) => (
                <div key={step.id} className="text-center">
                  <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-medium ${step.id <= currentStep
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
              <Button
                onClick={() => {
                  if (validateStep()) {
                    // Prepare complete registration data including menu items and account password
                    const registrationData = {
                      ...formData,
                      cuisineType: Array.isArray(formData.cuisineType) 
                        ? formData.cuisineType.join(', ') 
                        : formData.cuisineType,
                      menuItems: menuItems
                        .filter(item => item.name && item.price && item.description)
                        .map(item => ({
                          name: item.name,
                          description: item.description,
                          price: item.price,
                          category: item.category,
                          imageUrl: item.imageUrl || undefined // Include image URL from backend
                        })),
                      password: accountPassword // Include password from account creation
                    };
                    onComplete(registrationData);
                  }
                }}
                className="bg-primary hover:bg-primary/80"
              >
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