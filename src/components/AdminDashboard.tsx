import { useState, useEffect } from 'react';
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
import { CheckCircle, XCircle, UserPlus, UserX, Car, LogOut, Building2, Users, Truck, Eye, MapPin, Phone, Mail, Clock, DollarSign, Settings } from 'lucide-react';
import { getPendingRestaurants, getApprovedRestaurants, getRestaurantMenu, getRestaurantHours } from '../services/restaurantService';
import { approveRestaurant } from '../services/emailService';

interface AdminDashboardProps {
  onBack: () => void;
  pendingRegistrations?: any[];
  onApproveRestaurant?: (id: number) => void;
  onRejectRestaurant?: (id: number) => void;
}

// Removed hardcoded data - now fetched from API

// Removed hardcoded data - now fetched from API

export default function AdminDashboard({ 
  onBack, 
  pendingRegistrations: propPendingRegistrations = [], 
  onApproveRestaurant, 
  onRejectRestaurant 
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("drivers");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [newStaffForm, setNewStaffForm] = useState({ firstName: "", lastName: "" });
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [createdStaffInfo, setCreatedStaffInfo] = useState<{ username: string; password: string; name: string } | null>(null);
  const [newDriverForm, setNewDriverForm] = useState({ firstName: "", lastName: "" });
  const [driverDialogOpen, setDriverDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  const [selectedMenuItems, setSelectedMenuItems] = useState<any[]>([]);
  const [selectedOperatingHours, setSelectedOperatingHours] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [pendingRegistrations, setPendingRegistrations] = useState<any[]>([]);
  const [approvedRestaurants, setApprovedRestaurants] = useState<any[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [removedStaff, setRemovedStaff] = useState<Set<string>>(new Set());
  const [deactivatedDrivers, setDeactivatedDrivers] = useState<Set<number>>(new Set());
  const [approvedWithdrawals, setApprovedWithdrawals] = useState<Set<number>>(new Set());
  const [approvingRestaurant, setApprovingRestaurant] = useState<number | null>(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080/api';

  // Fetch all data from API
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [pending, approved, withdrawalsData, staffData, driversData] = await Promise.all([
        getPendingRestaurants(),
        getApprovedRestaurants(),
        fetch(`${API_BASE_URL}/admin/restaurants/withdrawals`).then(r => r.json()),
        fetch(`${API_BASE_URL}/staff`).then(r => r.json()),
        fetch(`${API_BASE_URL}/drivers`).then(r => r.json()),
      ]);
      setPendingRegistrations(pending);
      setApprovedRestaurants(approved);
      setPendingWithdrawals(withdrawalsData.withdrawals || []);
      setStaffMembers(staffData.staff || []);
      setDrivers(driversData.drivers || []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchAllData();
    }
  }, [isLoggedIn]);

  // Refresh data when registrations tab is opened
  useEffect(() => {
    if (isLoggedIn && activeTab === 'registrations') {
      fetchAllData();
    }
  }, [activeTab, isLoggedIn]);

  const handleApproveRestaurant = async (id: number) => {
    if (approvingRestaurant === id) {
      console.log('⏳ Approval already in progress for restaurant', id);
      return; // Prevent double-clicks
    }

    try {
      setApprovingRestaurant(id);
      
      // Find restaurant to get email and name
      const restaurant = pendingRegistrations.find(r => r.id === id);
      if (!restaurant) {
        alert('Restaurant not found');
        return;
      }

      const result = await approveRestaurant(id, restaurant.email, restaurant.restaurantName || restaurant.name);
      
      if (result.success) {
        const [pending, approved] = await Promise.all([
          getPendingRestaurants(),
          getApprovedRestaurants(),
        ]);
        setPendingRegistrations(pending);
        setApprovedRestaurants(approved);
        
        if (onApproveRestaurant) {
          onApproveRestaurant(id);
        }
        
        alert(`Restaurant approved successfully!\n\nCredentials have been sent to ${restaurant.email}\n\nMenu items from registration have been preserved.`);
      } else {
        console.error('Approval failed:', result.error);
        alert(`Failed to approve restaurant: ${result.error || 'Unknown error'}\n\nPlease check the console for more details.`);
      }
    } catch (err: any) {
      console.error('Error approving restaurant:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        restaurantId: id,
      });
      alert(`Error approving restaurant: ${err.message || 'Unknown error'}\n\nPlease check the console for more details.`);
    } finally {
      setApprovingRestaurant(null);
    }
  };

  const handleViewDetails = async (registration: any) => {
    setSelectedRegistration(registration);
    setLoadingDetails(true);
    try {
      // Fetch menu items and operating hours from API
      const [menuItems, hours] = await Promise.all([
        getRestaurantMenu(registration.id).catch(() => []),
        getRestaurantHours(registration.id).catch(() => [])
      ]);
      setSelectedMenuItems(menuItems);
      
      // Convert hours array to object format for display
      const hoursObj: any = {};
      hours.forEach((h: any) => {
        hoursObj[h.dayOfWeek] = {
          open: h.openTime,
          close: h.closeTime,
          closed: h.isClosed
        };
      });
      setSelectedOperatingHours(hoursObj);
    } catch (err: any) {
      console.error('Error fetching details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginForm.email,
          password: loginForm.password,
        }),
      });
      
      if (response.ok) {
        // Store admin username in localStorage
        localStorage.setItem('adminUsername', loginForm.email);
        setIsLoggedIn(true);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Login failed');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      alert('Login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginForm({ email: "", password: "" });
  };

  const handleApproveRegistration = async (id: number) => {
    console.log(`Approved registration ${id}`);
    await handleApproveRestaurant(id);
  };

  const handleRejectRegistration = async (id: number) => {
    if (!confirm(`Are you sure you want to reject restaurant registration #${id}?`)) {
      return;
    }

    try {
      const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080/api';
      const response = await fetch(`${API_BASE_URL}/admin/restaurants/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.error || 'Failed to reject restaurant');
        return;
      }

      // Remove from local pending registrations state immediately
      setPendingRegistrations(prev => prev.filter(reg => reg.id !== id));
      
      // Also call the parent handler if provided (for App.tsx state sync)
      if (onRejectRestaurant) {
        onRejectRestaurant(id);
      }
      
      // Refresh data to ensure consistency with backend
      await fetchAllData();
      
      alert('Restaurant has been rejected successfully');
    } catch (err: any) {
      console.error('Error rejecting restaurant:', err);
      alert('Failed to reject restaurant: ' + err.message);
    }
  };

  const handleApproveWithdrawal = async (id: number) => {
    if (!confirm(`Are you sure you want to approve the withdrawal request for restaurant #${id}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/restaurants/${id}/approve-withdrawal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.error || 'Failed to approve withdrawal');
        return;
      }

      // Mark as approved (will grey out)
      setApprovedWithdrawals(prev => new Set(prev).add(id));
      
      // Remove from pending withdrawals list
      setPendingWithdrawals(prev => prev.filter(w => w.id !== id));
      
      // Also update approved restaurants list to show it as withdrawn
      setApprovedRestaurants(prev => prev.map(r => 
        r.id === id ? { ...r, status: 'inactive' } : r
      ));

      alert('Withdrawal approved successfully. Restaurant has been removed from FrontDash.');
    } catch (err: any) {
      console.error('Error approving withdrawal:', err);
      alert('Failed to approve withdrawal: ' + err.message);
    }
  };

  const handleRejectWithdrawal = async (id: number) => {
    if (!confirm(`Are you sure you want to reject the withdrawal request for restaurant #${id}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/restaurants/${id}/reject-withdrawal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.error || 'Failed to reject withdrawal');
        return;
      }

      // Remove from pending withdrawals
      setPendingWithdrawals(prev => prev.filter(w => w.id !== id));
      
      // Update approved restaurants list to show it's still active
      setApprovedRestaurants(prev => prev.map(r => 
        r.id === id ? { ...r, status: 'approved' } : r
      ));

      alert('Withdrawal rejected successfully. Restaurant remains active on FrontDash.');
    } catch (err: any) {
      console.error('Error rejecting withdrawal:', err);
      alert('Failed to reject withdrawal: ' + err.message);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newStaffForm.firstName || !newStaffForm.firstName.trim()) {
        alert('First name is required');
        return;
      }
      if (!newStaffForm.lastName || !newStaffForm.lastName.trim()) {
        alert('Last name is required');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: newStaffForm.firstName.trim(),
          lastName: newStaffForm.lastName.trim(),
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        // Store the created staff info to display
        setCreatedStaffInfo({
          username: result.username,
          password: result.password,
          name: `${newStaffForm.firstName} ${newStaffForm.lastName}`,
        });
        
        // Add the new staff to the state immediately
        if (result.staff) {
          setStaffMembers(prevStaff => [...prevStaff, result.staff]);
        }
        
        // Refresh all data to ensure consistency
        await fetchAllData();
        
        // Reset form but keep dialog open to show credentials
        setNewStaffForm({ firstName: "", lastName: "" });
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create staff');
      }
    } catch (err: any) {
      console.error('Error adding staff:', err);
      alert('Failed to add staff: ' + err.message);
    }
  };

  const handleDeleteStaff = (username: string) => {
    if (!confirm(`Are you sure you want to remove staff member ${username}?`)) {
      return;
    }
    
    // Grey out the staff member (UI only)
    setRemovedStaff(prev => new Set(prev).add(username));
    alert(`Staff member ${username} has been marked as removed`);
  };

  const handleHireDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverForm.firstName.trim()) {
      alert('First name is required');
      return;
    }
    if (!newDriverForm.lastName.trim()) {
      alert('Last name is required');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/drivers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: newDriverForm.firstName.trim(),
          lastName: newDriverForm.lastName.trim(),
          isActive: true,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const newDriver = data.driver;
        
        // Add the new driver to the state immediately
        if (newDriver) {
          setDrivers(prevDrivers => [...prevDrivers, newDriver]);
        }
        
        // Also refresh all data to ensure consistency
        await fetchAllData();
        
        // Close dialog and reset form
        setDriverDialogOpen(false);
        setNewDriverForm({ firstName: "", lastName: "" });
        alert('Driver hired successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to hire driver');
      }
    } catch (err: any) {
      console.error('Error hiring driver:', err);
      alert('Failed to hire driver: ' + err.message);
    }
  };

  const handleFireDriver = async (driverId: number) => {
    if (!confirm(`Are you sure you want to deactivate this driver?`)) {
      return;
    }
    
    try {
      // Call backend API to update driver status in database
      const response = await fetch(`${API_BASE_URL}/drivers/${driverId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to deactivate driver');
      }

      // Update local state after successful database update
      setDeactivatedDrivers(prev => new Set(prev).add(driverId));
      setDrivers(prevDrivers => 
        prevDrivers.map(driver => 
          driver.driverId === driverId 
            ? { ...driver, isActive: false }
            : driver
        )
      );
      
      alert('Driver has been deactivated successfully');
    } catch (err: any) {
      console.error('Error deactivating driver:', err);
      alert('Failed to deactivate driver: ' + err.message);
    }
  };

  const handleReactivateDriver = async (driverId: number) => {
    try {
      // Call backend API to update driver status in database
      const response = await fetch(`${API_BASE_URL}/drivers/${driverId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to reactivate driver');
      }

      // Update local state after successful database update
      setDeactivatedDrivers(prev => {
        const newSet = new Set(prev);
        newSet.delete(driverId);
        return newSet;
      });
      setDrivers(prevDrivers => 
        prevDrivers.map(driver => 
          driver.driverId === driverId 
            ? { ...driver, isActive: true }
            : driver
        )
      );
      
      alert('Driver has been reactivated successfully');
    } catch (err: any) {
      console.error('Error reactivating driver:', err);
      alert('Failed to reactivate driver: ' + err.message);
    }
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
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full justify-start gap-2 flex items-center px-3 py-2 rounded-md transition-colors ${
                  activeTab === "settings" 
                    ? "bg-primary/20 text-primary frontdash-glow" 
                    : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                }`}
              >
                <Settings className="h-4 w-4" />
                Settings
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
                <Dialog open={driverDialogOpen} onOpenChange={setDriverDialogOpen}>
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
                        <Label htmlFor="driverFirstName">First Name *</Label>
                        <Input
                          id="driverFirstName"
                          value={newDriverForm.firstName}
                          onChange={(e) => setNewDriverForm({ ...newDriverForm, firstName: e.target.value })}
                          className="bg-background/50 border-white/20"
                          placeholder="Enter first name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="driverLastName">Last Name *</Label>
                        <Input
                          id="driverLastName"
                          value={newDriverForm.lastName}
                          onChange={(e) => setNewDriverForm({ ...newDriverForm, lastName: e.target.value })}
                          className="bg-background/50 border-white/20"
                          placeholder="Enter last name"
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Note: Duplicate names (same first and last name) are not allowed. Vehicle and license information can be added later if needed.
                      </p>
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
                        <TableHead>Driver ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <p className="text-muted-foreground">Loading drivers...</p>
                          </TableCell>
                        </TableRow>
                      ) : drivers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <p className="text-muted-foreground">No drivers found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        drivers.map((driver: any) => {
                          // Use database isActive status (persists after refresh)
                          // Check if driver is explicitly inactive (false) or if it's in the deactivated set (immediate UI feedback)
                          const isDeactivated = deactivatedDrivers.has(driver.driverId);
                          const displayActive = isDeactivated ? false : (driver.isActive === true);
                          
                          return (
                            <TableRow 
                              key={driver.driverId} 
                              className={`border-white/10 ${isDeactivated ? 'opacity-50 bg-muted/20' : ''}`}
                            >
                              <TableCell className={`font-medium ${isDeactivated ? 'text-muted-foreground' : ''}`}>
                                #{driver.driverId}
                              </TableCell>
                              <TableCell className={`font-medium ${isDeactivated ? 'text-muted-foreground' : ''}`}>
                                {driver.firstName && driver.lastName 
                                  ? `${driver.firstName} ${driver.lastName}`
                                  : driver.name || 'Unknown Driver'}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={displayActive ? 'default' : 'secondary'}
                                  className={displayActive ? 'bg-green-600' : ''}
                                >
                                  {displayActive ? 'active' : 'inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {isDeactivated ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReactivateDriver(driver.driverId)}
                                    className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Restore
                                  </Button>
                                ) : displayActive ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleFireDriver(driver.driverId)}
                                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                                  >
                                    <UserX className="h-4 w-4 mr-1" />
                                    Deactivate
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReactivateDriver(driver.driverId)}
                                    className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Activate
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </TabsContent>

            {/* Staff Management */}
            <TabsContent value="staff" className="space-y-6 mt-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Staff Management</h2>
                <Dialog open={staffDialogOpen} onOpenChange={(open) => {
                  setStaffDialogOpen(open);
                  if (!open) {
                    setCreatedStaffInfo(null);
                    setNewStaffForm({ firstName: "", lastName: "" });
                  }
                }}>
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
                    {createdStaffInfo ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <p className="text-green-400 font-semibold mb-2">✓ Staff member created successfully!</p>
                          <p className="text-sm text-muted-foreground mb-4">
                            Account created for: <span className="font-medium text-foreground">{createdStaffInfo.name}</span>
                          </p>
                          <div className="space-y-2">
                            <div>
                              <Label className="text-xs text-muted-foreground">Username (auto-generated)</Label>
                              <div className="p-2 bg-background/50 border border-white/20 rounded font-mono text-sm">
                                {createdStaffInfo.username}
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Initial Password (auto-generated)</Label>
                              <div className="p-2 bg-background/50 border border-white/20 rounded font-mono text-sm">
                                {createdStaffInfo.password}
                              </div>
                            </div>
                            <p className="text-xs text-yellow-400 mt-2">
                              Please save these credentials. The password cannot be retrieved later.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={() => {
                              setCreatedStaffInfo(null);
                              setStaffDialogOpen(false);
                            }}
                            className="flex-1 bg-primary hover:bg-primary/90"
                          >
                            Close
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              // Copy credentials to clipboard
                              const text = `Username: ${createdStaffInfo.username}\nPassword: ${createdStaffInfo.password}`;
                              navigator.clipboard.writeText(text);
                              alert('Credentials copied to clipboard!');
                            }}
                            className="flex-1"
                          >
                            Copy Credentials
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleAddStaff} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="staffFirstName">First Name *</Label>
                            <Input
                              id="staffFirstName"
                              value={newStaffForm.firstName}
                              onChange={(e) => setNewStaffForm({ ...newStaffForm, firstName: e.target.value })}
                              className="bg-background/50 border-white/20"
                              placeholder="Enter first name"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="staffLastName">Last Name *</Label>
                            <Input
                              id="staffLastName"
                              value={newStaffForm.lastName}
                              onChange={(e) => setNewStaffForm({ ...newStaffForm, lastName: e.target.value })}
                              className="bg-background/50 border-white/20"
                              placeholder="Enter last name"
                              required
                            />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Username will be auto-generated as: lastname + two digits (e.g., smith01). 
                          Password will be auto-generated. Full name must be unique within FrontDash.
                        </p>
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                          Add Staff Member
                        </Button>
                      </form>
                    )}
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="frontdash-card-bg">
                <div className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead>Username</TableHead>
                        <TableHead>First Name</TableHead>
                        <TableHead>Last Name</TableHead>
                        <TableHead>First Login</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <p className="text-muted-foreground">Loading staff...</p>
                          </TableCell>
                        </TableRow>
                      ) : staffMembers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <p className="text-muted-foreground">No staff members found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        staffMembers.map((staff: any) => {
                          const isRemoved = removedStaff.has(staff.username);
                          
                          return (
                            <TableRow 
                              key={staff.username} 
                              className={`border-white/10 ${isRemoved ? 'opacity-50 bg-muted/20' : ''}`}
                            >
                              <TableCell className={`font-medium ${isRemoved ? 'text-muted-foreground' : ''}`}>
                                {staff.username}
                              </TableCell>
                              <TableCell className={isRemoved ? 'text-muted-foreground' : ''}>
                                {staff.firstName || '-'}
                              </TableCell>
                              <TableCell className={isRemoved ? 'text-muted-foreground' : ''}>
                                {staff.lastName || '-'}
                              </TableCell>
                              <TableCell>
                                <Badge variant={staff.firstLogin ? 'secondary' : 'default'}>
                                  {staff.firstLogin ? 'Yes' : 'No'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {isRemoved ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      // Restore the staff member
                                      setRemovedStaff(prev => {
                                        const newSet = new Set(prev);
                                        newSet.delete(staff.username);
                                        return newSet;
                                      });
                                      alert(`Staff member ${staff.username} has been restored`);
                                    }}
                                    className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Restore
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteStaff(staff.username)}
                                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                                  >
                                    <UserX className="h-4 w-4 mr-1" />
                                    Remove
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
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
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              <p className="text-muted-foreground">Loading pending registrations...</p>
                            </TableCell>
                          </TableRow>
                        ) : pendingRegistrations.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              <p className="text-muted-foreground">No pending registrations</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          pendingRegistrations.map((registration) => {
                            // Handle both old format (with name) and new format (with restaurantName)
                            const restaurantName = registration.restaurantName || registration.name;
                            const submittedAt = registration.createdAt 
                              ? new Date(registration.createdAt).toLocaleDateString()
                              : registration.submittedAt || 'N/A';
                            
                            return (
                              <TableRow key={registration.id} className="border-white/10">
                                <TableCell className="font-medium">{restaurantName}</TableCell>
                                <TableCell>{registration.email}</TableCell>
                                <TableCell>{registration.phone}</TableCell>
                                <TableCell>{submittedAt}</TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleViewDetails(registration)}
                                          className="border-primary/50 text-primary hover:bg-primary/10"
                                        >
                                          <Eye className="h-4 w-4 mr-1" />
                                          Details
                                        </Button>
                                      </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[80vh] bg-card/95 backdrop-blur-sm border-white/20">
                                    <DialogHeader>
                                      <DialogTitle className="text-xl text-primary">
                                        {selectedRegistration?.restaurantName || selectedRegistration?.name} - Registration Details
                                      </DialogTitle>
                                      <DialogDescription>
                                        Complete registration information submitted on {
                                          selectedRegistration?.createdAt 
                                            ? new Date(selectedRegistration.createdAt).toLocaleDateString()
                                            : selectedRegistration?.submittedAt || 'N/A'
                                        }
                                      </DialogDescription>
                                    </DialogHeader>
                                    <ScrollArea className="h-[60vh] pr-4">
                                      {loadingDetails ? (
                                        <div className="text-center py-8">
                                          <p className="text-muted-foreground">Loading details...</p>
                                        </div>
                                      ) : selectedRegistration && (
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
                                                  <p className="font-medium">{selectedRegistration.restaurantName || selectedRegistration.name}</p>
                                                </div>
                                                <div>
                                                  <Label className="text-muted-foreground">Cuisine Type</Label>
                                                  <p className="font-medium">{selectedRegistration.cuisineType || 'N/A'}</p>
                                                </div>
                                                <div>
                                                  <Label className="text-muted-foreground">Established Year</Label>
                                                  <p className="font-medium">{selectedRegistration.establishedYear || 'N/A'}</p>
                                                </div>
                                              </div>
                                              <div>
                                                <Label className="text-muted-foreground">Description</Label>
                                                <p className="font-medium mt-1">{selectedRegistration.description || 'N/A'}</p>
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
                                                  <p className="font-medium">{selectedRegistration.address || 'N/A'}</p>
                                                </div>
                                                <div>
                                                  <Label className="text-muted-foreground">City, State ZIP</Label>
                                                  <p className="font-medium">
                                                    {selectedRegistration.city || 'N/A'}, {selectedRegistration.state || 'N/A'} {selectedRegistration.zipCode || 'N/A'}
                                                  </p>
                                                </div>
                                                <div>
                                                  <Label className="text-muted-foreground">Phone</Label>
                                                  <p className="font-medium">{selectedRegistration.phone || 'N/A'}</p>
                                                </div>
                                                <div>
                                                  <Label className="text-muted-foreground">Email</Label>
                                                  <p className="font-medium">{selectedRegistration.email || 'N/A'}</p>
                                                </div>
                                              </div>
                                              {selectedRegistration.website && (
                                                <div>
                                                  <Label className="text-muted-foreground">Website</Label>
                                                  <p className="font-medium">{selectedRegistration.website}</p>
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
                                                  <p className="font-medium">{selectedRegistration.averagePrice || 'N/A'}</p>
                                                </div>
                                                <div>
                                                  <Label className="text-muted-foreground">Delivery Fee</Label>
                                                  <p className="font-medium">${typeof selectedRegistration.deliveryFee === 'number' ? selectedRegistration.deliveryFee.toFixed(2) : selectedRegistration.deliveryFee || '0.00'}</p>
                                                </div>
                                                <div>
                                                  <Label className="text-muted-foreground">Minimum Order</Label>
                                                  <p className="font-medium">${typeof selectedRegistration.minimumOrder === 'number' ? selectedRegistration.minimumOrder.toFixed(2) : selectedRegistration.minimumOrder || '0.00'}</p>
                                                </div>
                                                <div>
                                                  <Label className="text-muted-foreground">Preparation Time</Label>
                                                  <p className="font-medium">{selectedRegistration.preparationTime || 'N/A'} min</p>
                                                </div>
                                              </div>
                                            </CardContent>
                                          </Card>

                                          {/* Operating Hours */}
                                          {(selectedOperatingHours && Object.keys(selectedOperatingHours).length > 0) && (
                                            <Card className="frontdash-card-bg">
                                              <CardHeader>
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                  <Clock className="h-5 w-5" />
                                                  Operating Hours
                                                </CardTitle>
                                              </CardHeader>
                                              <CardContent>
                                                <div className="grid grid-cols-1 gap-2">
                                                  {Object.entries(selectedOperatingHours).map(([day, hours]: [string, any]) => (
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
                                          {selectedMenuItems.length > 0 && (
                                            <Card className="frontdash-card-bg">
                                              <CardHeader>
                                                <CardTitle className="text-lg">Sample Menu Items</CardTitle>
                                              </CardHeader>
                                              <CardContent>
                                                <div className="space-y-4">
                                                  {selectedMenuItems.map((item: any, index: number) => (
                                                    <div key={item.id || index} className="border border-white/10 rounded-lg p-4 bg-background/50">
                                                      <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-medium">{item.name}</h4>
                                                        <Badge variant="outline" className="text-primary border-primary/50">
                                                          ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                                                        </Badge>
                                                      </div>
                                                      <p className="text-muted-foreground text-sm">{item.description || 'No description'}</p>
                                                      <p className="text-xs text-muted-foreground mt-1">Category: {item.category || 'Other'}</p>
                                                    </div>
                                                  ))}
                                                </div>
                                              </CardContent>
                                            </Card>
                                          )}
                                          {selectedMenuItems.length === 0 && (
                                            <Card className="frontdash-card-bg">
                                              <CardHeader>
                                                <CardTitle className="text-lg">Sample Menu Items</CardTitle>
                                              </CardHeader>
                                              <CardContent>
                                                <p className="text-muted-foreground">No menu items submitted</p>
                                              </CardContent>
                                            </Card>
                                          )}
                                        </div>
                                      )}
                                    </ScrollArea>
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveRegistration(registration.id)}
                                  disabled={approvingRestaurant === registration.id}
                                  className="bg-green-600 hover:bg-green-700 frontdash-glow disabled:opacity-50"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  {approvingRestaurant === registration.id ? 'Approving...' : 'Approve'}
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
                            );
                          })
                        )}
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
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              <p className="text-muted-foreground">Loading withdrawals...</p>
                            </TableCell>
                          </TableRow>
                        ) : pendingWithdrawals.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              <p className="text-muted-foreground">No pending withdrawals</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          pendingWithdrawals.map((withdrawal: any) => {
                            const isApproved = approvedWithdrawals.has(withdrawal.id);
                            return (
                              <TableRow 
                                key={withdrawal.id} 
                                className={`border-white/10 ${isApproved ? 'opacity-50 bg-muted/20' : ''}`}
                              >
                                <TableCell className={`font-medium ${isApproved ? 'text-muted-foreground' : ''}`}>
                                  {withdrawal.restaurantName}
                                </TableCell>
                                <TableCell className={isApproved ? 'text-muted-foreground' : ''}>
                                  {withdrawal.email || '-'}
                                </TableCell>
                                <TableCell className={isApproved ? 'text-muted-foreground' : ''}>
                                  {withdrawal.phone || '-'}
                                </TableCell>
                                <TableCell>
                                  {isApproved ? (
                                    <Badge variant="secondary" className="bg-red-600/20 text-red-400">
                                      Removed from FrontDash
                                    </Badge>
                                  ) : (
                                    <Badge variant="default" className="bg-yellow-600/20 text-yellow-400">
                                      Pending
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isApproved ? (
                                    <Badge variant="secondary" className="bg-red-600/20 text-red-400">
                                      Approved
                                    </Badge>
                                  ) : (
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleApproveWithdrawal(withdrawal.id)}
                                        className="border-green-500/50 text-green-400 hover:bg-green-500/10"
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
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6 mt-0">
              <Card className="frontdash-card-bg">
                <CardHeader>
                  <CardTitle>Admin Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Account Settings</h3>
                    <div className="flex items-center gap-4 pt-4">
                      <Button
                        onClick={() => setShowChangePasswordModal(true)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Change Password
                      </Button>
                      <Button
                        className="bg-primary hover:bg-primary/90"
                        disabled
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Change Password Modal */}
      <Dialog open={showChangePasswordModal} onOpenChange={setShowChangePasswordModal}>
        <DialogContent className="bg-card/95 backdrop-blur-sm border-white/20">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new password
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setPasswordErrors({});
              setPasswordSuccess(null);

              // Validate passwords match
              if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
                setPasswordErrors({ confirmPassword: 'New passwords do not match' });
                return;
              }

              // Validate password strength
              if (changePasswordForm.newPassword.length < 6) {
                setPasswordErrors({ newPassword: 'Password must be at least 6 characters long' });
                return;
              }

              try {
                setChangingPassword(true);
                const adminUsername = localStorage.getItem('adminUsername') || loginForm.email;
                if (!adminUsername) {
                  setPasswordErrors({ currentPassword: 'You must be logged in to change your password' });
                  setChangingPassword(false);
                  return;
                }

                const response = await fetch(`${API_BASE_URL}/auth/admin/change-password`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    username: adminUsername,
                    currentPassword: changePasswordForm.currentPassword,
                    newPassword: changePasswordForm.newPassword,
                  }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                  // Success - clear form and show success message
                  setChangePasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordSuccess('Password changed successfully!');
                  setPasswordErrors({});
                  
                  // Close modal after 2 seconds
                  setTimeout(() => {
                    setShowChangePasswordModal(false);
                    setPasswordSuccess(null);
                  }, 2000);
                } else {
                  // Error from backend
                  const errorMessage = data.error || 'Failed to change password';
                  if (errorMessage.toLowerCase().includes('current password')) {
                    setPasswordErrors({ currentPassword: errorMessage });
                  } else {
                    setPasswordErrors({ newPassword: errorMessage });
                  }
                }
              } catch (err: any) {
                console.error('Change password error:', err);
                setPasswordErrors({ currentPassword: 'Failed to change password. Please try again.' });
              } finally {
                setChangingPassword(false);
              }
            }}
            className="space-y-4"
          >
            {passwordSuccess && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-400">{passwordSuccess}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={changePasswordForm.currentPassword}
                onChange={(e) => setChangePasswordForm({ ...changePasswordForm, currentPassword: e.target.value })}
                className="bg-background/50 border-white/10"
                required
              />
              {passwordErrors.currentPassword && (
                <p className="text-sm text-red-400">{passwordErrors.currentPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={changePasswordForm.newPassword}
                onChange={(e) => setChangePasswordForm({ ...changePasswordForm, newPassword: e.target.value })}
                className="bg-background/50 border-white/10"
                required
              />
              {passwordErrors.newPassword && (
                <p className="text-sm text-red-400">{passwordErrors.newPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={changePasswordForm.confirmPassword}
                onChange={(e) => setChangePasswordForm({ ...changePasswordForm, confirmPassword: e.target.value })}
                className="bg-background/50 border-white/10"
                required
              />
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-red-400">{passwordErrors.confirmPassword}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setChangePasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordErrors({});
                  setPasswordSuccess(null);
                }}
                disabled={changingPassword}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={changingPassword}
              >
                {changingPassword ? 'Saving...' : 'Save New Password'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}