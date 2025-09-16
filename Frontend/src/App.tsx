import React, { useState } from 'react';

// Import components with defensive checks
let Homepage: React.ComponentType<any>;
let Dashboard: React.ComponentType<any>;
let RestaurantRegistration: React.ComponentType<any>;
let RestaurantDashboard: React.ComponentType<any>;
let AdminDashboard: React.ComponentType<any>;
let StaffDashboard: React.ComponentType<any>;
let AllRestaurants: React.ComponentType<any>;
let RestaurantMenu: React.ComponentType<any>;
let Cart: React.ComponentType<any>;
let Checkout: React.ComponentType<any>;
let OrderConfirmation: React.ComponentType<any>;
let Account: React.ComponentType<any>;
let Settings: React.ComponentType<any>;
let SignIn: React.ComponentType<any>;

let RegistrationPending: React.ComponentType<any>;

try {
  Homepage = require('./components/Homepage').default;
  Dashboard = require('./components/Dashboard').default;
  RestaurantRegistration = require('./components/RestaurantRegistration').default;
  RestaurantDashboard = require('./components/RestaurantDashboard').default;
  AdminDashboard = require('./components/AdminDashboard').default;
  StaffDashboard = require('./components/StaffDashboard').default;
  AllRestaurants = require('./components/AllRestaurants').default;
  RestaurantMenu = require('./components/RestaurantMenu').default;
  Cart = require('./components/Cart').default;
  Checkout = require('./components/Checkout').default;
  OrderConfirmation = require('./components/OrderConfirmation').default;
  Account = require('./components/Account').default;
  Settings = require('./components/Settings').default;
  SignIn = require('./components/SignIn').default;

  RegistrationPending = require('./components/RegistrationPending').default;
} catch (error) {
  console.error('Error importing components:', error);
}

// Fallback component in case of import errors
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

  // Safe component renderer
  const renderComponent = (Component: React.ComponentType<any> | undefined, props: any) => {
    if (!Component) {
      return <ErrorFallback />;
    }
    
    try {
      return <Component {...props} />;
    } catch (error) {
      console.error('Error rendering component:', error);
      return <ErrorFallback />;
    }
  };

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
    // Clear search query to show the main "what are you craving" section
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

  return (
    <div className="dark min-h-screen frontdash-animated-bg">
      {currentScreen === 'homepage' && renderComponent(Homepage, {
        onFindFood: (query: string) => {
          setSearchQuery(query);
          setCurrentScreen('all-restaurants');
        },
        onViewAllRestaurants: () => {
          setSearchQuery('');
          setCurrentScreen('all-restaurants');
        },
        onRestaurantSelect: handleRestaurantSelect,
        onRestaurantSignup: () => setCurrentScreen('restaurant-registration'),
        onGoToAccount: () => setCurrentScreen('account'),
        onGoToSettings: () => setCurrentScreen('settings'),
        onGoToSignIn: () => setCurrentScreen('signin'),
        onViewCart: () => setCurrentScreen('cart'),
        onGoToRestaurantDashboard: () => setCurrentScreen('restaurant-dashboard'),
        deliveryAddress,
        onDeliveryAddressChange: setDeliveryAddress
      })}
      
      {currentScreen === 'dashboard' && renderComponent(Dashboard, {
        onRestaurantSelect: handleRestaurantSelect,
        onBackToHomepage: () => setCurrentScreen('homepage'),
        onGoToAllRestaurants: () => setCurrentScreen('all-restaurants'),
        onGoToAccount: () => setCurrentScreen('account'),
        onGoToSettings: () => setCurrentScreen('settings')
      })}
      
      {currentScreen === 'all-restaurants' && renderComponent(AllRestaurants, {
        onBack: () => setCurrentScreen('homepage'),
        onRestaurantSelect: handleRestaurantSelect,
        searchQuery: searchQuery,
        onRestaurantSignup: () => setCurrentScreen('restaurant-registration'),
        onViewCart: () => setCurrentScreen('cart'),
        onGoToAccount: () => setCurrentScreen('account'),
        onGoToSettings: () => setCurrentScreen('settings'),
        onGoToSignIn: () => setCurrentScreen('signin'),
        deliveryAddress,
        onDeliveryAddressChange: setDeliveryAddress
      })}
      
      {currentScreen === 'restaurant-menu' && selectedRestaurant && renderComponent(RestaurantMenu, {
        restaurant: selectedRestaurant,
        onBack: () => setCurrentScreen('all-restaurants'),
        onViewCart: handleViewCart,
        onRestaurantSignup: () => setCurrentScreen('restaurant-registration'),
        onViewAllRestaurants: () => setCurrentScreen('all-restaurants'),
        onGoToAccount: () => setCurrentScreen('account'),
        onGoToSettings: () => setCurrentScreen('settings'),
        onGoToSignIn: () => setCurrentScreen('signin'),
        deliveryAddress,
        onDeliveryAddressChange: setDeliveryAddress
      })}
      
      {currentScreen === 'cart' && renderComponent(Cart, {
        cartItems: cartItems,
        onBack: handleContinueShopping,
        onProceedToCheckout: handleProceedToCheckout,
        onRestaurantSignup: () => setCurrentScreen('restaurant-registration'),
        onViewAllRestaurants: () => setCurrentScreen('all-restaurants'),
        onGoToAccount: () => setCurrentScreen('account'),
        onGoToSettings: () => setCurrentScreen('settings'),
        onGoToSignIn: () => setCurrentScreen('signin'),
        deliveryAddress,
        onDeliveryAddressChange: setDeliveryAddress
      })}
      
      {currentScreen === 'checkout' && renderComponent(Checkout, {
        cartItems: cartItems,
        total: orderTotal,
        onBack: () => setCurrentScreen('cart'),
        onOrderComplete: () => setCurrentScreen('order-confirmation'),
        onRestaurantSignup: () => setCurrentScreen('restaurant-registration'),
        onViewAllRestaurants: () => setCurrentScreen('all-restaurants'),
        onGoToAccount: () => setCurrentScreen('account'),
        onGoToSettings: () => setCurrentScreen('settings'),
        onGoToSignIn: () => setCurrentScreen('signin'),
        deliveryAddress,
        onDeliveryAddressChange: setDeliveryAddress
      })}
      
      {currentScreen === 'order-confirmation' && renderComponent(OrderConfirmation, {
        onBackToHome: () => {
          setCurrentScreen('homepage');
          setCartItems([]);
          setSelectedRestaurant(null);
          setOrderTotal(0);
          setSearchQuery(''); // Clear search to show main craving section
        },
        onTrackOrder: () => {
          // For now, just go back to homepage - could implement order tracking later
          setCurrentScreen('homepage');
          setCartItems([]);
          setSelectedRestaurant(null);
          setOrderTotal(0);
          setSearchQuery(''); // Clear search to show main craving section
        }
      })}
      
      {currentScreen === 'restaurant-registration' && renderComponent(RestaurantRegistration, {
        onComplete: handleRestaurantRegistrationComplete,
        onBack: () => setCurrentScreen('homepage')
      })}
      
      {currentScreen === 'registration-pending' && renderComponent(RegistrationPending, {
        registration: currentRegistration,
        onBack: () => setCurrentScreen('homepage')
      })}
      
      {currentScreen === 'restaurant-dashboard' && renderComponent(RestaurantDashboard, {
        onBack: () => setCurrentScreen('homepage')
      })}
      
      {currentScreen === 'admin' && renderComponent(AdminDashboard, {
        onBack: () => setCurrentScreen('homepage'),
        pendingRegistrations: pendingRegistrations,
        onApproveRestaurant: handleApproveRestaurant,
        onRejectRestaurant: handleRejectRestaurant
      })}
      
      {currentScreen === 'staff' && renderComponent(StaffDashboard, {
        onBack: () => setCurrentScreen('homepage')
      })}
      
      {currentScreen === 'account' && renderComponent(Account, {
        onBack: () => setCurrentScreen('homepage'),
        onRestaurantSignup: () => setCurrentScreen('restaurant-registration'),
        onViewAllRestaurants: () => setCurrentScreen('all-restaurants'),
        onViewCart: () => setCurrentScreen('cart'),
        onGoToSettings: () => setCurrentScreen('settings'),
        onGoToSignIn: () => setCurrentScreen('signin')
      })}
      
      {currentScreen === 'settings' && renderComponent(Settings, {
        onBack: () => setCurrentScreen('homepage'),
        onRestaurantSignup: () => setCurrentScreen('restaurant-registration'),
        onViewAllRestaurants: () => setCurrentScreen('all-restaurants'),
        onViewCart: () => setCurrentScreen('cart'),
        onGoToAccount: () => setCurrentScreen('account'),
        onGoToSignIn: () => setCurrentScreen('signin')
      })}
      
      {currentScreen === 'signin' && renderComponent(SignIn, {
        onBack: () => setCurrentScreen('homepage'),
        onSignInSuccess: (userType: string) => setCurrentScreen('homepage'),
        onGoToAdmin: () => setCurrentScreen('admin'),
        onGoToStaff: () => setCurrentScreen('staff'),
        onGoToRestaurantDashboard: () => setCurrentScreen('restaurant-dashboard'),
        onGoToAdminSignIn: () => setCurrentScreen('admin-signin'),
        onGoToStaffSignIn: () => setCurrentScreen('staff-signin'),
        onGoToRestaurantSignIn: () => setCurrentScreen('restaurant-signin'),
        targetUserType: 'customer'
      })}
      
      {currentScreen === 'admin-signin' && renderComponent(SignIn, {
        onBack: () => setCurrentScreen('signin'),
        onSignInSuccess: (userType: string) => setCurrentScreen('homepage'),
        onGoToAdmin: () => setCurrentScreen('admin'),
        onGoToStaff: () => setCurrentScreen('staff'),
        onGoToRestaurantDashboard: () => setCurrentScreen('restaurant-dashboard'),
        targetUserType: 'admin'
      })}
      
      {currentScreen === 'staff-signin' && renderComponent(SignIn, {
        onBack: () => setCurrentScreen('signin'),
        onSignInSuccess: (userType: string) => setCurrentScreen('homepage'),
        onGoToAdmin: () => setCurrentScreen('admin'),
        onGoToStaff: () => setCurrentScreen('staff'),
        onGoToRestaurantDashboard: () => setCurrentScreen('restaurant-dashboard'),
        targetUserType: 'staff'
      })}
      
      {currentScreen === 'restaurant-signin' && renderComponent(SignIn, {
        onBack: () => setCurrentScreen('signin'),
        onSignInSuccess: (userType: string) => setCurrentScreen('homepage'),
        onGoToAdmin: () => setCurrentScreen('admin'),
        onGoToStaff: () => setCurrentScreen('staff'),
        onGoToRestaurantDashboard: () => setCurrentScreen('restaurant-dashboard'),
        targetUserType: 'restaurant'
      })}

    </div>
  );
}