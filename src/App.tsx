import React, { useState } from 'react';

// Import email service
import { registerRestaurant, approveRestaurant } from './services/emailService';

// Import components using ES modules
import Homepage from './components/Homepage';
import Dashboard from './components/Dashboard';
import RestaurantRegistration from './components/RestaurantRegistration';
import RestaurantDashboard from './components/RestaurantDashboard';
import AdminDashboard from './components/AdminDashboard';
import StaffDashboard from './components/StaffDashboard';
import AllRestaurants from './components/AllRestaurants';
import RestaurantMenu from './components/RestaurantMenu';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderConfirmation from './components/OrderConfirmation';
import Account from './components/Account';
import Settings from './components/Settings';
import SignIn from './components/SignIn';
import AdminSignIn from './components/AdminSignIn';
import StaffSignIn from './components/StaffSignIn';
import RestaurantSignIn from './components/RestaurantSignIn';
import RegistrationPending from './components/RegistrationPending';

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

  const handleRestaurantRegistrationComplete = async (registrationData: any) => {
    // Register restaurant via backend (or mock in dev mode)
    const result = await registerRestaurant(registrationData);
    
    if (result.success) {
      const newRegistration = {
        id: result.restaurantId || Date.now(),
        ...registrationData,
        status: 'pending',
        submittedAt: new Date().toISOString().split('T')[0]
      };
      setPendingRegistrations(prev => [...prev, newRegistration]);
      setCurrentRegistration(newRegistration);
      setCurrentScreen('registration-pending');
    } else {
      // Handle registration error
      console.error('Registration failed:', result.error);
      alert(`Registration failed: ${result.error || 'Unknown error'}`);
    }
  };

  const handleApproveRestaurant = async (registrationId: number) => {
    const approvedRegistration = pendingRegistrations.find(reg => reg.id === registrationId);
    
    if (approvedRegistration) {
      // Approve restaurant via backend (or mock in dev mode)
      const result = await approveRestaurant(
        registrationId,
        approvedRegistration.email,
        approvedRegistration.restaurantName
      );
      
      if (result.success) {
        // Update restaurant status to approved
        setPendingRegistrations(prev => 
          prev.filter(reg => reg.id !== registrationId)
        );
        setApprovedRestaurants(prev => [...prev, { 
          ...approvedRegistration, 
          status: 'approved',
          username: result.credentials?.username || approvedRegistration.email,
          temporaryPassword: result.credentials?.password || '***'
        }]);
      } else {
        // Handle approval error
        console.error('Approval failed:', result.error);
        alert(`Approval failed: ${result.error || 'Unknown error'}`);
      }
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
        onGoToRestaurantDashboard: () => setCurrentScreen('restaurant-signin'),
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
        selectedRestaurant: selectedRestaurant,
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
        onGoToAdminSignIn: () => setCurrentScreen('admin'),
        onGoToStaffSignIn: () => setCurrentScreen('staff'),
        onGoToRestaurantSignIn: () => setCurrentScreen('restaurant-signin')
      })}

      {currentScreen === 'admin-signin' && renderComponent(AdminSignIn, {
        onBack: () => setCurrentScreen('signin'),
        onSignInSuccess: () => setCurrentScreen('admin')
      })}

      {currentScreen === 'staff-signin' && renderComponent(StaffSignIn, {
        onBack: () => setCurrentScreen('signin'),
        onSignInSuccess: () => setCurrentScreen('staff')
      })}

      {currentScreen === 'restaurant-signin' && renderComponent(RestaurantSignIn, {
        onBack: () => setCurrentScreen('signin'),
        onSignInSuccess: () => setCurrentScreen('restaurant-dashboard')
      })}

    </div>
  );
}
