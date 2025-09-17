import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { CheckCircle, XCircle, UserPlus, UserX, Car, LogOut, Building2, Users, Truck, Eye, MapPin, Phone, Mail, Clock, DollarSign } from 'lucide-react';

interface AdminDashboardProps {
  onBack: () => void;
  pendingRegistrations?: any[];
  onApproveRestaurant?: (id: number) => void;
  onRejectRestaurant?: (id: number) => void;
}

// Mock data with detailed registration information
const pendingRegistrations = [
  { 
    id: 1, 
    name: "Mario's Pizza", 
    email: "mario@pizza.com", 
    phone: "+1234567890", 
    status: "pending", 
    submittedAt: "2024-01-15",
    details: {
      restaurantName: "Mario's Pizza",
      description: "Authentic Italian pizzas made with fresh ingredients and traditional recipes. Family-owned restaurant serving the community for over 20 years.",
      cuisineType: "Italian",
      establishedYear: "2003",
      address: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      website: "https://www.mariospizza.com",
      averagePrice: "$",
      deliveryFee: "2.99",
      minimumOrder: "15.00",
      preparationTime: "25",
      businessLicense: "BL123456789",
      taxId: "12-3456789", 
      ownerName: "Mario Giuseppe",
      operatingHours: {
        monday: { open: '11:00', close: '22:00', closed: false },
        tuesday: { open: '11:00', close: '22:00', closed: false },
        wednesday: { open: '11:00', close: '22:00', closed: false },
        thursday: { open: '11:00', close: '22:00', closed: false },
        friday: { open: '11:00', close: '23:00', closed: false },
        saturday: { open: '11:00', close: '23:00', closed: false },
        sunday: { open: '12:00', close: '21:00', closed: false }
      },
      menuItems: [
        { name: "Margherita Pizza", description: "Fresh mozzarella, basil, tomato sauce", price: "16.99", category: "Pizza" },
        { name: "Pepperoni Pizza", description: "Classic pepperoni with mozzarella cheese", price: "18.99", category: "Pizza" },
        { name: "Caesar Salad", description: "Romaine lettuce, parmesan, croutons, caesar dressing", price: "12.99", category: "Salads" }
      ]
    }
  },
  { 
    id: 2, 
    name: "Sushi Express", 
    email: "info@sushiexpress.com", 
    phone: "+1234567891", 
    status: "pending", 
    submittedAt: "2024-01-16",
    details: {
      restaurantName: "Sushi Express",
      description: "Fresh sushi and Japanese cuisine prepared by experienced chefs. Fast delivery with the highest quality ingredients.",
      cuisineType: "Japanese",
      establishedYear: "2019",
      address: "456 Oak Avenue",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      website: "https://www.sushiexpress.com",
      averagePrice: "$$",
      deliveryFee: "3.99",
      minimumOrder: "25.00",
      preparationTime: "35",
      businessLicense: "BL987654321",
      taxId: "98-7654321",
      ownerName: "Hiroshi Tanaka",
      operatingHours: {
        monday: { open: '11:30', close: '21:30', closed: false },
        tuesday: { open: '11:30', close: '21:30', closed: false },
        wednesday: { open: '11:30', close: '21:30', closed: false },
        thursday: { open: '11:30', close: '21:30', closed: false },
        friday: { open: '11:30', close: '22:00', closed: false },
        saturday: { open: '11:30', close: '22:00', closed: false },
        sunday: { open: '', close: '', closed: true }
      },
      menuItems: [
        { name: "California Roll", description: "Crab, avocado, cucumber with sesame seeds", price: "8.99", category: "Rolls" },
        { name: "Salmon Nigiri", description: "Fresh salmon over seasoned rice (2 pieces)", price: "6.99", category: "Nigiri" },
        { name: "Chicken Teriyaki", description: "Grilled chicken with teriyaki sauce and steamed rice", price: "14.99", category: "Entrees" }
      ]
    }
  },
  { 
    id: 3, 
    name: "Burger Palace", 
    email: "contact@burgerpalace.com", 
    phone: "+1234567892", 
    status: "pending", 
    submittedAt: "2024-01-17",
    details: {
      restaurantName: "Burger Palace",
      description: "Gourmet burgers made with premium beef and fresh toppings. Locally sourced ingredients and craft beer selection.",
      cuisineType: "American",
      establishedYear: "2021",
      address: "789 Elm Street",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      website: "https://www.burgerpalace.com",
      averagePrice: "$",
      deliveryFee: "2.49",
      minimumOrder: "12.00",
      preparationTime: "20",
      businessLicense: "BL456789123",
      taxId: "45-6789123",
      ownerName: "Jake Williams", 
      operatingHours: {
        monday: { open: '10:00', close: '21:00', closed: false },
        tuesday: { open: '10:00', close: '21:00', closed: false },
        wednesday: { open: '10:00', close: '21:00', closed: false },
        thursday: { open: '10:00', close: '22:00', closed: false },
        friday: { open: '10:00', close: '23:00', closed: false },
        saturday: { open: '10:00', close: '23:00', closed: false },
        sunday: { open: '11:00', close: '20:00', closed: false }
      },
      menuItems: [
        { name: "Palace Burger", description: "Double beef patty, cheddar, lettuce, tomato, special sauce", price: "13.99", category: "Burgers" },
        { name: "BBQ Bacon Burger", description: "Beef patty, bacon, BBQ sauce, onion rings, cheddar", price: "15.99", category: "Burgers" },
        { name: "Sweet Potato Fries", description: "Crispy sweet potato fries with chipotle mayo", price: "7.99", category: "Sides" }
      ]
    }
  },
];

const pendingWithdrawals = [
  { id: 1, restaurantName: "Tony's Italian", amount: "$2,450.00", requestedAt: "2024-01-18", status: "pending" },
  { id: 2, restaurantName: "Dragon Wok", amount: "$1,800.50", requestedAt: "2024-01-19", status: "pending" },
];

const staffMembers = [
  { id: 1, name: "Sarah Johnson", role: "Support Manager", email: "sarah@frontdash.com", joinedAt: "2023-06-15" },
  { id: 2, name: "Mike Chen", role: "Operations Lead", email: "mike@frontdash.com", joinedAt: "2023-08-20" },
  { id: 3, name: "Lisa Rodriguez", role: "Customer Success", email: "lisa@frontdash.com", joinedAt: "2023-09-10" },
];

const drivers = [
  { id: 1, name: "Alex Thompson", vehicle: "Honda Civic", license: "DL123456", status: "active", joinedAt: "2024-01-10" },
  { id: 2, name: "Jordan Williams", vehicle: "Toyota Camry", license: "DL789012", status: "active", joinedAt: "2024-01-12" },
  { id: 3, name: "Casey Brown", vehicle: "Ford Focus", license: "DL345678", status: "inactive", joinedAt: "2024-01-14" },
];

export default function AdminDashboard({ 
  onBack, 
  pendingRegistrations: propPendingRegistrations = [], 
  onApproveRestaurant, 
  onRejectRestaurant 
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("drivers");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [newStaffForm, setNewStaffForm] = useState({ name: "", role: "", email: "" });
  const [newDriverForm, setNewDriverForm] = useState({ name: "", vehicle: "", license: "" });
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock login - in real app, validate against backend
    if (loginForm.email && loginForm.password) {
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginForm({ email: "", password: "" });
  };

  const handleApproveRegistration = (id: number) => {
    console.log(`Approved registration ${id}`);
    if (onApproveRestaurant) {
      onApproveRestaurant(id);
    }
  };

  const handleRejectRegistration = (id: number) => {
    console.log(`Rejected registration ${id}`);
    if (onRejectRestaurant) {
      onRejectRestaurant(id);
    }
  };

  const handleApproveWithdrawal = (id: number) => {
    console.log(`Approved withdrawal ${id}`);
    // In real app, process withdrawal
  };

  const handleRejectWithdrawal = (id: number) => {
    console.log(`Rejected withdrawal ${id}`);
    // In real app, reject withdrawal
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Adding staff:", newStaffForm);
    setNewStaffForm({ name: "", role: "", email: "" });
  };

  const handleDeleteStaff = (id: number) => {
    console.log(`Deleting staff ${id}`);
    // In real app, remove from backend
  };

  const handleHireDriver = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Hiring driver:", newDriverForm);
    setNewDriverForm({ name: "", vehicle: "", license: "" });
  };

  const handleFireDriver = (id: number) => {
    console.log(`Firing driver ${id}`);
    // In real app, update driver status
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md p-8 bg-card/80 backdrop-blur-sm border border-white/10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary mb-2">FrontDash Admin</h1>
            <p className="text-muted-foreground">Please sign in to continue</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="bg-background/50 border-white/20"
                placeholder="admin@frontdash.com"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="bg-background/50 border-white/20"
                placeholder="••••••••"
                required
              />
            </div>
            
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              Sign In
            </Button>
            
            <Button 
              type="button"
              onClick={onBack}
              variant="ghost" 
              className="w-full text-muted-foreground hover:text-primary"
            >
              Back to Homepage
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background frontdash-animated-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-card/80 backdrop-blur-sm frontdash-border-glow">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold text-primary frontdash-text-glow">FrontDash Admin</h1>
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary"
            >
              Back to Homepage
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/10 bg-card/40 backdrop-blur-sm frontdash-card-bg">
          <nav className="p-4">
            <div className="grid w-full grid-cols-1 gap-2">
              <button
                onClick={() => setActiveTab("drivers")}
                className={`w-full justify-start gap-2 flex items-center px-3 py-2 rounded-md transition-colors ${
                  activeTab === "drivers" 
                    ? "bg-primary/20 text-primary frontdash-glow" 
                    : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                }`}
              >
                <Truck className="h-4 w-4" />
                Driver Management
              </button>
              <button
                onClick={() => setActiveTab("staff")}
                className={`w-full justify-start gap-2 flex items-center px-3 py-2 rounded-md transition-colors ${
                  activeTab === "staff" 
                    ? "bg-primary/20 text-primary frontdash-glow" 
                    : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                }`}
              >
                <Users className="h-4 w-4" />
                Staff Management
              </button>
              <button
                onClick={() => setActiveTab("registrations")}
                className={`w-full justify-start gap-2 flex items-center px-3 py-2 rounded-md transition-colors ${
                  activeTab === "registrations" 
                    ? "bg-primary/20 text-primary frontdash-glow" 
                    : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                }`}
              >
                <Building2 className="h-4 w-4" />
                Restaurant Registration
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Driver Management */}
            <TabsContent value="drivers" className="space-y-6 mt-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Driver Management</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90">
                      <Car className="h-4 w-4 mr-2" />
                      Hire Driver
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card/95 backdrop-blur-sm border-white/20">
                    <DialogHeader>
                      <DialogTitle>Hire New Driver</DialogTitle>
                      <DialogDescription>
                        Enter the driver's information to add them to your delivery team.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleHireDriver} className="space-y-4">
                      <div>
                        <Label htmlFor="driverName">Name</Label>
                        <Input
                          id="driverName"
                          value={newDriverForm.name}
                          onChange={(e) => setNewDriverForm({ ...newDriverForm, name: e.target.value })}
                          className="bg-background/50 border-white/20"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="driverVehicle">Vehicle</Label>
                        <Input
                          id="driverVehicle"
                          value={newDriverForm.vehicle}
                          onChange={(e) => setNewDriverForm({ ...newDriverForm, vehicle: e.target.value })}
                          className="bg-background/50 border-white/20"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="driverLicense">License Number</Label>
                        <Input
                          id="driverLicense"
                          value={newDriverForm.license}
                          onChange={(e) => setNewDriverForm({ ...newDriverForm, license: e.target.value })}
                          className="bg-background/50 border-white/20"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                        Hire Driver
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="frontdash-card-bg">
                <div className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead>Name</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>License</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drivers.map((driver) => (
                        <TableRow key={driver.id} className="border-white/10">
                          <TableCell className="font-medium">{driver.name}</TableCell>
                          <TableCell>{driver.vehicle}</TableCell>
                          <TableCell>{driver.license}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={driver.status === 'active' ? 'default' : 'secondary'}
                              className={driver.status === 'active' ? 'bg-green-600' : ''}
                            >
                              {driver.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{driver.joinedAt}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFireDriver(driver.id)}
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Fire
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </TabsContent>

            {/* Staff Management */}
            <TabsContent value="staff" className="space-y-6 mt-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Staff Management</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add New Staff
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card/95 backdrop-blur-sm border-white/20">
                    <DialogHeader>
                      <DialogTitle>Add New Staff Member</DialogTitle>
                      <DialogDescription>
                        Fill out the form below to add a new staff member to your team.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddStaff} className="space-y-4">
                      <div>
                        <Label htmlFor="staffName">Name</Label>
                        <Input
                          id="staffName"
                          value={newStaffForm.name}
                          onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                          className="bg-background/50 border-white/20"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="staffRole">Role</Label>
                        <Input
                          id="staffRole"
                          value={newStaffForm.role}
                          onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value })}
                          className="bg-background/50 border-white/20"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="staffEmail">Email</Label>
                        <Input
                          id="staffEmail"
                          type="email"
                          value={newStaffForm.email}
                          onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                          className="bg-background/50 border-white/20"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                        Add Staff Member
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="frontdash-card-bg">
                <div className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staffMembers.map((staff) => (
                        <TableRow key={staff.id} className="border-white/10">
                          <TableCell className="font-medium">{staff.name}</TableCell>
                          <TableCell>{staff.role}</TableCell>
                          <TableCell>{staff.email}</TableCell>
                          <TableCell>{staff.joinedAt}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteStaff(staff.id)}
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </TabsContent>

            {/* Restaurant Registration Management */}
            <TabsContent value="registrations" className="space-y-6 mt-0">
              <div>
                <h2 className="text-xl font-semibold mb-4">Restaurant Registration</h2>
                
                {/* Pending Registrations */}
                <Card className="frontdash-card-bg mb-6">
                  <div className="p-6">
                    <h3 className="text-lg font-medium mb-4">Pending Registrations</h3>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead>Restaurant Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(propPendingRegistrations.length > 0 ? propPendingRegistrations : pendingRegistrations).map((registration) => (
                          <TableRow key={registration.id} className="border-white/10">
                            <TableCell className="font-medium">{registration.name}</TableCell>
                            <TableCell>{registration.email}</TableCell>
                            <TableCell>{registration.phone}</TableCell>
                            <TableCell>{registration.submittedAt}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setSelectedRegistration(registration)}
                                      className="border-primary/50 text-primary hover:bg-primary/10"
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      Details
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[80vh] bg-card/95 backdrop-blur-sm border-white/20">
                                    <DialogHeader>
                                      <DialogTitle className="text-xl text-primary">
                                        {registration.name} - Registration Details
                                      </DialogTitle>
                                      <DialogDescription>
                                        Complete registration information submitted on {registration.submittedAt}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <ScrollArea className="h-[60vh] pr-4">
                                      {selectedRegistration && (
                                        <div className="space-y-6">
                                          {/* Basic Information */}
                                          <Card className="frontdash-card-bg">
                                            <CardHeader>
                                              <CardTitle className="text-lg flex items-center gap-2">
                                                <Building2 className="h-5 w-5" />
                                                Basic Information
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                              <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                  <Label className="text-muted-foreground">Restaurant Name</Label>
                                                  <p className="font-medium">{selectedRegistration.details.restaurantName}</p>
                                                </div>
                                                <div>
                                                  <Label className="text-muted-foreground">Cuisine Type</Label>
                                                  <p className="font-medium">{selectedRegistration.details.cuisineType}</p>
                                                </div>
                                                <div>
                                                  <Label className="text-muted-foreground">Established Year</Label>
                                                  <p className="font-medium">{selectedRegistration.details.establishedYear}</p>
                                                </div>
                                                <div>
                                                  <Label className="text-muted-foreground">Owner Name</Label>
                                                  <p className="font-medium">{selectedRegistration.details.ownerName}</p>
                                                </div>
                                              </div>
                                              <div>
                                                <Label className="text-muted-foreground">Description</Label>
                                                <p className="font-medium mt-1">{selectedRegistration.details.description}</p>
                                              </div>
                                            </CardContent>
                                          </Card>

                                          {/* Location & Contact */}
                                          <Card className="frontdash-card-bg">
                                            <CardHeader>
                                              <CardTitle className="text-lg flex items-center gap-2">
                                                <MapPin className="h-5 w-5" />
                                                Location & Contact
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                              <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                  <Label className="text-muted-foreground">Address</Label>
                                                  <p className="font-medium">{selectedRegistration.details.address}</p>
                                                </div>
                                                <div>
                                                  <Label className="text-muted-foreground">City, State ZIP</Label>
                                                  <p className="font-medium">
                                                    {selectedRegistration.details.city}, {selectedRegistration.details.state} {selectedRegistration.details.zipCode}
                                                  </p>
                                                </div>
                                                <div>
                                                  <Label className="text-muted-foreground">Phone</Label>
                                                  <p className="font-medium">{selectedRegistration.phone}</p>
                                                </div>
                                                <div>
                                                  <Label className="text-muted-foreground">Email</Label>
                                                  <p className="font-medium">{selectedRegistration.email}</p>
                                                </div>
                                              </div>
                                              {selectedRegistration.details.website && (
                                                <div>
                                                  <Label className="text-muted-foreground">Website</Label>
                                                  <p className="font-medium">{selectedRegistration.details.website}</p>
                                                </div>
                                              )}
                                            </CardContent>
                                          </Card>

                                          {/* Business Information */}
                                          <Card className="frontdash-card-bg">
                                            <CardHeader>
                                              <CardTitle className="text-lg flex items-center gap-2">
                                                <DollarSign className="h-5 w-5" />
                                                Business & Operations
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                              <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                  <Label className="text-muted-foreground">Average Price Range</Label>
                                                  <p className="font-medium">{selectedRegistration.details.averagePrice}</p>
                                                </div>
                                                <div>
                                                  <Label className="text-muted-foreground">Delivery Fee</Label>
                                                  <p className="font-medium">${selectedRegistration.details.deliveryFee}</p>
                                                </div>
                                                <div>
                                                  <Label className="text-muted-foreground">Minimum Order</Label>
                                                  <p className="font-medium">${selectedRegistration.details.minimumOrder}</p>
                                                </div>
                                                <div>
                                                  <Label className="text-muted-foreground">Preparation Time</Label>
                                                  <p className="font-medium">{selectedRegistration.details.preparationTime} min</p>
                                                </div>
                                                <div>
                                                  <Label className="text-muted-foreground">Business License</Label>
                                                  <p className="font-medium">{selectedRegistration.details.businessLicense}</p>
                                                </div>
                                                <div>
                                                  <Label className="text-muted-foreground">Tax ID</Label>
                                                  <p className="font-medium">{selectedRegistration.details.taxId}</p>
                                                </div>
                                              </div>
                                            </CardContent>
                                          </Card>

                                          {/* Operating Hours */}
                                          {selectedRegistration.details.operatingHours && (
                                            <Card className="frontdash-card-bg">
                                              <CardHeader>
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                  <Clock className="h-5 w-5" />
                                                  Operating Hours
                                                </CardTitle>
                                              </CardHeader>
                                              <CardContent>
                                                <div className="grid grid-cols-1 gap-2">
                                                  {Object.entries(selectedRegistration.details.operatingHours).map(([day, hours]: [string, any]) => (
                                                    <div key={day} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
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
                                          )}

                                          {/* Sample Menu Items */}
                                          <Card className="frontdash-card-bg">
                                            <CardHeader>
                                              <CardTitle className="text-lg">Sample Menu Items</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                              <div className="space-y-4">
                                                {selectedRegistration.details.menuItems.map((item: any, index: number) => (
                                                  <div key={index} className="border border-white/10 rounded-lg p-4 bg-background/50">
                                                    <div className="flex justify-between items-start mb-2">
                                                      <h4 className="font-medium">{item.name}</h4>
                                                      <Badge variant="outline" className="text-primary border-primary/50">
                                                        ${item.price}
                                                      </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground text-sm">{item.description}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">Category: {item.category}</p>
                                                  </div>
                                                ))}
                                              </div>
                                            </CardContent>
                                          </Card>
                                        </div>
                                      )}
                                    </ScrollArea>
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveRegistration(registration.id)}
                                  className="bg-green-600 hover:bg-green-700 frontdash-glow"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectRegistration(registration.id)}
                                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>

                {/* Pending Withdrawals */}
                <Card className="frontdash-card-bg">
                  <div className="p-6">
                    <h3 className="text-lg font-medium mb-4">Pending Withdrawals</h3>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead>Restaurant</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Requested</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingWithdrawals.map((withdrawal) => (
                          <TableRow key={withdrawal.id} className="border-white/10">
                            <TableCell className="font-medium">{withdrawal.restaurantName}</TableCell>
                            <TableCell>{withdrawal.amount}</TableCell>
                            <TableCell>{withdrawal.requestedAt}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{withdrawal.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveWithdrawal(withdrawal.id)}
                                  className="bg-green-600 hover:bg-green-700 frontdash-glow"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectWithdrawal(withdrawal.id)}
                                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}