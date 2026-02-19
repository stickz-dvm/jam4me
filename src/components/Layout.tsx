import { Link, Outlet, useLocation } from "react-router-dom";
import { Wallet, User, PartyPopper, HelpCircle, LogOut, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LogoPlaceholder } from "./LogoPlaceholder";
import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { useAuth } from "../context/AuthContext";
import { LogoutConfirmDialog } from "./LogoutConfirmDialog";

export function Layout() {
  const location = useLocation();
  const { logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const prevLocationRef = useRef(location.pathname);

  // Determine if current navigation is between navbar pages
  const isNavbarNavigation = () => {
    const navbarPaths = ['/parties', '/wallet', '/profile', '/support', '/now-playing'];
    const prevPath = prevLocationRef.current;
    const currentPath = location.pathname;

    // Update the ref for next comparison
    prevLocationRef.current = currentPath;

    // Check if both previous and current paths are navbar paths
    return navbarPaths.includes(prevPath) && navbarPaths.includes(currentPath);
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

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
        <div className="container mx-auto p-4 flex justify-center md:justify-between items-center">
          <Link to="/parties" className="flex items-center gap-2 mx-auto md:mx-0">
            <LogoPlaceholder className="w-7 h-7" />
            <div className="flex flex-col">
              <span className="gradient-text font-bold text-lg">Jam4me</span>
              <span className="text-xs text-primary font-medium -mt-1">User Mode</span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogoutClick}
            className="hidden md:flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main content with conditional animation */}
      <div className="flex-1 container mx-auto p-4 pt-6 bg-background">
        {isNavbarNavigation() ? (
          <div className="w-full">
            <Outlet />
          </div>
        ) : (
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
        )}
      </div>

      {/* Footer navigation */}
      <nav className="sticky bottom-0 border-t border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto">
          <div className="flex justify-around items-center p-3">
            <NavItem
              to="/parties"
              label="Parties"
              icon={<PartyPopper className="w-5 h-5" />}
              isActive={isActive("/parties") || isActive("/party/")}
            />
            <NavItem
              to="/wallet"
              label="Wallet"
              icon={<Wallet className="w-5 h-5" />}
              isActive={isActive("/wallet")}
            />
            <NavItem
              to="/profile"
              label="Profile"
              icon={<User className="w-5 h-5" />}
              isActive={isActive("/profile")}
            />
            <NavItem
              to="/now-playing"
              label="Playing"
              icon={<PlayCircle className="w-5 h-5" />}
              isActive={isActive("/now-playing")}
            />
            <NavItem
              to="/support"
              label="Support"
              icon={<HelpCircle className="w-5 h-5" />}
              isActive={isActive("/support")}
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
        />
      )}
      <div className={`relative z-10 p-2 ${isActive ? 'text-primary' : 'text-foreground/60'}`}>
        {icon}
      </div>
      <span className={`relative z-10 text-xs mt-1 ${isActive ? 'text-primary font-medium' : 'text-foreground/60'}`}>
        {label}
      </span>
    </Link>
  );
}