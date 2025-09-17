import React, { useState, Suspense } from 'react';

// Lazy load all components
const Homepage = React.lazy(() => import('./components/Homepage'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const RestaurantRegistration = React.lazy(() => import('./components/RestaurantRegistration'));
const RestaurantDashboard = React.lazy(() => import('./components/RestaurantDashboard'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const StaffDashboard = React.lazy(() => import('./components/StaffDashboard'));
const AllRestaurants = React.lazy(() => import('./components/AllRestaurants'));
const RestaurantMenu = React.lazy(() => import('./components/RestaurantMenu'));
const Cart = React.lazy(() => import('./components/Cart'));
const Checkout = React.lazy(() => import('./components/Checkout'));
const OrderConfirmation = React.lazy(() => import('./components/OrderConfirmation'));
const Account = React.lazy(() => import('./components/Account'));
const Settings = React.lazy(() => import('./components/Settings'));
const SignIn = React.lazy(() => import('./components/SignIn'));
const RegistrationPending = React.lazy(() => import('./components/RegistrationPending'));

// Fallback component for Suspense
const ErrorFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Loading Error</h1>
      <p className="text-muted-foreground">Please refresh the page.</p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
      >
        Refresh
      </button>
    </div>
  </div>
);

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('homepage');
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pendingRegistrations, setPendingRegistrations] = useState<any[]>([]);
  const [approvedRestaurants, setApprovedRestaurants] = useState<any[]>([]);
  const [currentRegistration, setCurrentRegistration] = useState<any>(null);

  const handleRestaurantSelect = (restaurant: any) => {
    setSelectedRestaurant(restaurant);
    setCurrentScreen('restaurant-menu');
  };

  const handleViewCart = (items: any[]) => {
    setCartItems(items);
    setCurrentScreen('cart');
  };

  const handleContinueShopping = () => {
    setCurrentScreen('homepage');
    setSearchQuery('');
  };

  const handleProceedToCheckout = (items: any[], total: number) => {
    setCartItems(items);
    setOrderTotal(total);
    setCurrentScreen('checkout');
  };

  const handleRestaurantRegistrationComplete = (registrationData: any) => {
    const newRegistration = {
      id: Date.now(),
      ...registrationData,
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0]
    };
    setPendingRegistrations(prev => [...prev, newRegistration]);
    setCurrentRegistration(newRegistration);
    setCurrentScreen('registration-pending');
  };

  const handleApproveRestaurant = (registrationId: number) => {
    setPendingRegistrations(prev => 
      prev.filter(reg => reg.id !== registrationId)
    );
    const approvedRegistration = pendingRegistrations.find(reg => reg.id === registrationId);
    if (approvedRegistration) {
      setApprovedRestaurants(prev => [...prev, { ...approvedRegistration, status: 'approved' }]);
    }
  };

  const handleRejectRestaurant = (registrationId: number) => {
    setPendingRegistrations(prev => 
      prev.filter(reg => reg.id !== registrationId)
    );
  };

  // Render logic wrapped in Suspense for lazy loading
  return (
    <div className="dark min-h-screen frontdash-animated-bg">
      <Suspense fallback={<ErrorFallback />}>
        {currentScreen === 'homepage' && (
          <Homepage
            onFindFood={(query: string) => {
              setSearchQuery(query);
              setCurrentScreen('all-restaurants');
            }}
            onViewAllRestaurants={() => {
              setSearchQuery('');
              setCurrentScreen('all-restaurants');
            }}
            onRestaurantSelect={handleRestaurantSelect}
            onRestaurantSignup={() => setCurrentScreen('restaurant-registration')}
            onGoToAccount={() => setCurrentScreen('account')}
            onGoToSettings={() => setCurrentScreen('settings')}
            onGoToSignIn={() => setCurrentScreen('signin')}
            onViewCart={() => setCurrentScreen('cart')}
            onGoToRestaurantDashboard={() => setCurrentScreen('restaurant-dashboard')}
            deliveryAddress={deliveryAddress}
            onDeliveryAddressChange={setDeliveryAddress}
          />
        )}

        {currentScreen === 'dashboard' && (
          <Dashboard
            onRestaurantSelect={handleRestaurantSelect}
            onBackToHomepage={() => setCurrentScreen('homepage')}
            onGoToAllRestaurants={() => setCurrentScreen('all-restaurants')}
            onGoToAccount={() => setCurrentScreen('account')}
            onGoToSettings={() => setCurrentScreen('settings')}
          />
        )}

        {currentScreen === 'all-restaurants' && (
          <AllRestaurants
            onBack={() => setCurrentScreen('homepage')}
            onRestaurantSelect={handleRestaurantSelect}
            searchQuery={searchQuery}
            onRestaurantSignup={() => setCurrentScreen('restaurant-registration')}
            onViewCart={() => setCurrentScreen('cart')}
            onGoToAccount={() => setCurrentScreen('account')}
            onGoToSettings={() => setCurrentScreen('settings')}
            onGoToSignIn={() => setCurrentScreen('signin')}
            deliveryAddress={deliveryAddress}
            onDeliveryAddressChange={setDeliveryAddress}
          />
        )}

        {currentScreen === 'restaurant-menu' && selectedRestaurant && (
          <RestaurantMenu
            restaurant={selectedRestaurant}
            onBack={() => setCurrentScreen('all-restaurants')}
            onViewCart={handleViewCart}
            onRestaurantSignup={() => setCurrentScreen('restaurant-registration')}
            onViewAllRestaurants={() => setCurrentScreen('all-restaurants')}
            onGoToAccount={() => setCurrentScreen('account')}
            onGoToSettings={() => setCurrentScreen('settings')}
            onGoToSignIn={() => setCurrentScreen('signin')}
            deliveryAddress={deliveryAddress}
            onDeliveryAddressChange={setDeliveryAddress}
          />
        )}

        {currentScreen === 'cart' && (
          <Cart
            cartItems={cartItems}
            onBack={handleContinueShopping}
            onProceedToCheckout={handleProceedToCheckout}
            onRestaurantSignup={() => setCurrentScreen('restaurant-registration')}
            onViewAllRestaurants={() => setCurrentScreen('all-restaurants')}
            onGoToAccount={() => setCurrentScreen('account')}
            onGoToSettings={() => setCurrentScreen('settings')}
            onGoToSignIn={() => setCurrentScreen('signin')}
            deliveryAddress={deliveryAddress}
            onDeliveryAddressChange={setDeliveryAddress}
          />
        )}

        {currentScreen === 'checkout' && (
          <Checkout
            cartItems={cartItems}
            total={orderTotal}
            onBack={() => setCurrentScreen('cart')}
            onOrderComplete={() => setCurrentScreen('order-confirmation')}
            onRestaurantSignup={() => setCurrentScreen('restaurant-registration')}
            onViewAllRestaurants={() => setCurrentScreen('all-restaurants')}
            onGoToAccount={() => setCurrentScreen('account')}
            onGoToSettings={() => setCurrentScreen('settings')}
            onGoToSignIn={() => setCurrentScreen('signin')}
            deliveryAddress={deliveryAddress}
            onDeliveryAddressChange={setDeliveryAddress}
          />
        )}

        {currentScreen === 'order-confirmation' && (
          <OrderConfirmation
            onBackToHome={() => {
              setCurrentScreen('homepage');
              setCartItems([]);
              setSelectedRestaurant(null);
              setOrderTotal(0);
              setSearchQuery('');
            }}
            onTrackOrder={() => {
              setCurrentScreen('homepage');
              setCartItems([]);
              setSelectedRestaurant(null);
              setOrderTotal(0);
              setSearchQuery('');
            }}
          />
        )}

        {currentScreen === 'restaurant-registration' && (
          <RestaurantRegistration
            onComplete={handleRestaurantRegistrationComplete}
            onBack={() => setCurrentScreen('homepage')}
          />
        )}

        {currentScreen === 'registration-pending' && (
          <RegistrationPending
            registration={currentRegistration}
            onBack={() => setCurrentScreen('homepage')}
          />
        )}

        {currentScreen === 'restaurant-dashboard' && (
          <RestaurantDashboard
            onBack={() => setCurrentScreen('homepage')}
          />
        )}

        {currentScreen === 'admin' && (
          <AdminDashboard
            onBack={() => setCurrentScreen('homepage')}
            pendingRegistrations={pendingRegistrations}
            onApproveRestaurant={handleApproveRestaurant}
            onRejectRestaurant={handleRejectRestaurant}
          />
        )}

        {currentScreen === 'staff' && (
          <StaffDashboard
            onBack={() => setCurrentScreen('homepage')}
          />
        )}

        {currentScreen === 'account' && (
          <Account
            onBack={() => setCurrentScreen('homepage')}
            onRestaurantSignup={() => setCurrentScreen('restaurant-registration')}
            onViewAllRestaurants={() => setCurrentScreen('all-restaurants')}
            onViewCart={() => setCurrentScreen('cart')}
            onGoToSettings={() => setCurrentScreen('settings')}
            onGoToSignIn={() => setCurrentScreen('signin')}
          />
        )}

        {currentScreen === 'settings' && (
          <Settings
            onBack={() => setCurrentScreen('homepage')}
            onRestaurantSignup={() => setCurrentScreen('restaurant-registration')}
            onViewAllRestaurants={() => setCurrentScreen('all-restaurants')}
            onViewCart={() => setCurrentScreen('cart')}
            onGoToAccount={() => setCurrentScreen('account')}
            onGoToSignIn={() => setCurrentScreen('signin')}
          />
        )}

        {currentScreen === 'signin' && (
          <SignIn
            onBack={() => setCurrentScreen('homepage')}
            onSignInSuccess={(userType: string) => setCurrentScreen('homepage')}
            onGoToAdmin={() => setCurrentScreen('admin')}
            onGoToStaff={() => setCurrentScreen('staff')}
            onGoToRestaurantDashboard={() => setCurrentScreen('restaurant-dashboard')}
            onGoToAdminSignIn={() => setCurrentScreen('admin-signin')}
            onGoToStaffSignIn={() => setCurrentScreen('staff-signin')}
            onGoToRestaurantSignIn={() => setCurrentScreen('restaurant-signin')}
            targetUserType="customer"
          />
        )}

        {currentScreen === 'admin-signin' && (
          <SignIn
            onBack={() => setCurrentScreen('signin')}
            onSignInSuccess={(userType: string) => setCurrentScreen('homepage')}
            onGoToAdmin={() => setCurrentScreen('admin')}
            onGoToStaff={() => setCurrentScreen('staff')}
            onGoToRestaurantDashboard={() => setCurrentScreen('restaurant-dashboard')}
            targetUserType="admin"
          />
        )}

        {currentScreen === 'staff-signin' && (
          <SignIn
            onBack={() => setCurrentScreen('signin')}
            onSignInSuccess={(userType: string) => setCurrentScreen('homepage')}
            onGoToAdmin={() => setCurrentScreen('admin')}
            onGoToStaff={() => setCurrentScreen('staff')}
            onGoToRestaurantDashboard={() => setCurrentScreen('restaurant-dashboard')}
            targetUserType="staff"
          />
        )}

        {currentScreen === 'restaurant-signin' && (
          <SignIn
            onBack={() => setCurrentScreen('signin')}
            onSignInSuccess={(userType: string) => setCurrentScreen('homepage')}
            onGoToAdmin={() => setCurrentScreen('admin')}
            onGoToStaff={() => setCurrentScreen('staff')}
            onGoToRestaurantDashboard={() => setCurrentScreen('restaurant-dashboard')}
            targetUserType="restaurant"
          />
        )}
      </Suspense>
    </div>
  );
}