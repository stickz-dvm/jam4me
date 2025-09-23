import { Link, Outlet, useLocation } from "react-router-dom";
import { Home, Wallet, User, HelpCircle, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar } from "./ui/avatar";
import { LogoPlaceholder } from "./LogoPlaceholder";
import { useAuth } from "../context/AuthContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState, useEffect } from "react";
import { LogoutConfirmDialog } from "./LogoutConfirmDialog";

export function DjLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  // Add state to force re-render on route changes
  const [activeRoute, setActiveRoute] = useState(location.pathname);

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  // Update active route when location changes
  useEffect(() => {
    setActiveRoute(location.pathname);
  }, [location.pathname]);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutDialog(false);
  };

  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto p-4 flex justify-between items-center flex-col md:flex-row gap-2 md:gap-0">
          <Link to="/dj/dashboard" className="flex items-center gap-2 mx-auto md:mx-0">
            <LogoPlaceholder className="w-7 h-7" />
            <div className="flex flex-col">
              <span className="gradient-text font-bold text-lg">Jam4me</span>
              <span className="text-xs text-accent font-medium -mt-1">DJ Mode</span>
            </div>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0">
                <Avatar className="h-9 w-9">
                  {user?.avatar ? (
                    <ImageWithFallback
                      src={user.avatar}
                      alt={user.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user?.djName || user?.username}</span>
                  
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dj/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dj/wallet" className="cursor-pointer">
                  <Wallet className="mr-2 h-4 w-4" />
                  <span>Wallet & Earnings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dj/support" className="cursor-pointer">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help & Support</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogoutClick} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main content with AnimatePresence properly scoped */}
      <div className="flex-1 container mx-auto p-4 pt-6 bg-background">
        <AnimatePresence mode="wait">
          <motion.div 
            key={location.pathname}
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer navigation */}
      <nav className="sticky bottom-0 border-t border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto">
          <div className="flex justify-around items-center p-3">
            <NavItem 
              to="/dj/dashboard" 
              label="Dashboard" 
              icon={<Home className="w-5 h-5" />} 
              isActive={isActive("/dj/dashboard")} 
              key={`nav-dashboard-${activeRoute}`}
            />
            <NavItem 
              to="/dj/wallet" 
              label="Wallet" 
              icon={<Wallet className="w-5 h-5" />} 
              isActive={isActive("/dj/wallet")} 
              key={`nav-wallet-${activeRoute}`}
            />
            <NavItem 
              to="/dj/profile" 
              label="Profile" 
              icon={<User className="w-5 h-5" />} 
              isActive={isActive("/dj/profile")} 
              key={`nav-profile-${activeRoute}`}
            />
            <NavItem 
              to="/dj/support" 
              label="Support" 
              icon={<HelpCircle className="w-5 h-5" />} 
              isActive={isActive("/dj/support")} 
              key={`nav-support-${activeRoute}`}
            />
          </div>
        </div>
      </nav>

      {/* Logout confirmation dialog */}
      <LogoutConfirmDialog 
        isOpen={showLogoutDialog} 
        onClose={handleCancelLogout} 
        onConfirm={handleConfirmLogout} 
      />
    </div>
  );
}

type NavItemProps = {
  to: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
};

function NavItem({ to, label, icon, isActive }: NavItemProps) {
  return (
    <Link to={to} className="relative flex flex-col items-center px-4 py-2">
      {isActive && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute inset-0 rounded-xl bg-primary/15 border border-primary/20"
          initial={false}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          style={{ 
            // Force hardware acceleration to fix mobile rendering issues
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "translateZ(0)",
            WebkitTransform: "translateZ(0)"
          }}
        />
      )}
      <div 
        className={`relative z-10 p-2 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-foreground/60'}`}
        style={{ willChange: "color" }}
      >
        {icon}
      </div>
      <span 
        className={`relative z-10 text-xs mt-1 transition-colors duration-200 ${isActive ? 'text-primary font-medium' : 'text-foreground/60'}`}
        style={{ willChange: "color" }}
      >
        {label}
      </span>
    </Link>
  );
}