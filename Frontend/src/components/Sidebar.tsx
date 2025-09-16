import { LayoutGrid, UtensilsCrossed, ShoppingCart, User, Settings } from 'lucide-react';
import { Button } from './ui/button';

interface SidebarProps {
  activeTab?: string;
  onGoToDashboard?: () => void;
  onGoToFood?: () => void;
  onGoToCart?: () => void;
  onGoToProfile?: () => void;
  onGoToSettings?: () => void;
  onSignInLogin?: () => void;
}

const sidebarItems = [
  { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard', handler: 'onGoToDashboard' },
  { id: 'food', icon: UtensilsCrossed, label: 'Food', handler: 'onGoToFood' },
  { id: 'cart', icon: ShoppingCart, label: 'Cart', handler: 'onGoToCart' },
  { id: 'account', icon: User, label: 'Profile', handler: 'onGoToProfile' },
  { id: 'settings', icon: Settings, label: 'Settings', handler: 'onGoToSettings' },
];

export default function Sidebar({ 
  activeTab = 'food', 
  onGoToDashboard,
  onGoToFood,
  onGoToCart,
  onGoToProfile,
  onGoToSettings,
  onSignInLogin
}: SidebarProps) {
  const handleNavigation = (itemId: string, handler: string) => {
    const handlers = {
      onGoToDashboard,
      onGoToFood,
      onGoToCart,
      onGoToProfile,
      onGoToSettings
    } as any;
    
    const handlerFunction = handlers[handler];
    if (handlerFunction) {
      handlerFunction();
    }
  };

  return (
    <div className="fixed right-0 top-0 z-40 h-screen w-60 bg-background/80 backdrop-blur-md border-l border-white/10">
      <div className="flex flex-col py-8 px-6 space-y-6 h-full">
        {/* Sign In/Login Button at Top */}
        <div className="border-b border-white/10 pb-6">
          <Button 
            className="w-full bg-primary hover:bg-primary/80 text-primary-foreground"
            onClick={onSignInLogin}
          >
            <User className="h-4 w-4 mr-2" />
            Sign Up / Login
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col space-y-6 flex-1 justify-center">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <div key={item.id} className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`w-10 h-10 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
                  }`}
                  onClick={() => handleNavigation(item.id, item.handler)}
                >
                  <Icon className="h-5 w-5" />
                </Button>
                <span className={`text-sm ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}