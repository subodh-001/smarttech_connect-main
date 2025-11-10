import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import { useAuth } from '../../contexts/NewAuthContext';

const Header = ({ user: userProp = null, initialLocation = null, activeService = null }) => {
  const { user, signOut } = useAuth();
  const [resolvedLocation, setResolvedLocation] = useState(initialLocation);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const currentLocation = useLocation();
  const navigate = useNavigate();

  // ✅ Role-based navigation
  const pathname = currentLocation?.pathname || '';
  const roleFromPath = (() => {
    // Only infer technician/admin role from their dashboards
    if (pathname.startsWith('/admin-dashboard')) return 'admin';
    if (pathname.startsWith('/technician-dashboard')) return 'technician';
    return null; // Do NOT infer technician for '/technician-selection'
  })();
  const roleRaw = (user?.role || user?.type || userProp?.role || userProp?.type);
  const role = (roleRaw === 'customer' ? 'user' : roleRaw) || roleFromPath || 'user';

  let navigationItems = [];
  
  if (role === 'technician') {
    navigationItems = [];
  } else if (role === 'admin') {
    navigationItems = [];
  } else {
    navigationItems = [
      { label: 'Dashboard', path: '/user-dashboard', icon: 'LayoutDashboard' },
      { label: 'Request Service', path: '/service-request-creation', icon: 'Plus' },
      { label: 'Find Technicians', path: '/technician-selection', icon: 'Users' },
      { label: 'Track Service', path: '/live-tracking', icon: 'MapPin' },
    ];
  }

  const isActivePath = (path) => {
    // For dashboard pages with tabs, check both path and query parameters
    if (path.startsWith('/technician-dashboard') || path.startsWith('/admin-dashboard')) {
      const currentTab = new URLSearchParams(currentLocation.search).get('tab') || 'overview';
      const pathTab = new URL(path, window.location.origin).searchParams.get('tab');
      const dashboardPath = path.startsWith('/technician-dashboard') ? '/technician-dashboard' : '/admin-dashboard';
      
      // If current location is the dashboard
      if (currentLocation.pathname === dashboardPath) {
        // For the overview tab (no query param)
        if (path === dashboardPath && !pathTab) {
          return currentTab === 'overview' || !currentTab;
        }
        // For other tabs with query params
        return pathTab === currentTab;
      }
    }
    
    // For other paths, just check the pathname
    return currentLocation?.pathname === path;
  };

  useEffect(() => {
    try {
      if (!initialLocation) {
        const cached = localStorage.getItem('user_location_label');
        if (cached) setResolvedLocation(cached);
      }
    } catch (_) {}

    const onStorage = (e) => {
      if (e.key === 'user_location_label') {
        setResolvedLocation(e.newValue || null);
      }
    };

    const handleClickOutside = (event) => {
      if (isProfileDropdownOpen && !event?.target?.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
    };

    window.addEventListener('storage', onStorage);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen, initialLocation]);

  const handleLocationClick = () => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const label = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setResolvedLocation(label);
        try {
          localStorage.setItem('user_location_label', label);
          localStorage.setItem('user_location_coords', JSON.stringify({ latitude, longitude }));
        } catch (_) {}
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 10000 }
    );
  };

  const handleProfileClick = () => setIsProfileDropdownOpen(!isProfileDropdownOpen);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (_) {}
    setIsProfileDropdownOpen(false);
    navigate('/user-login');
  };



  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border trust-shadow">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Logo */}
        <Link to={role === 'technician' ? '/technician-dashboard' : role === 'admin' ? '/admin-dashboard' : '/user-dashboard'} className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
            <Icon name="Zap" size={20} color="white" />
          </div>
          <span className="text-xl font-semibold text-foreground">SmartTech Connect</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navigationItems?.map((item) => (
            <Link
              key={item?.path}
              to={item?.path}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium trust-transition ${
                isActivePath(item?.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name={item?.icon} size={16} />
              <span className="hidden lg:inline">{item?.label}</span>
            </Link>
          ))}


        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Location Indicator */}
          {(resolvedLocation || initialLocation) && (
            <button
              onClick={handleLocationClick}
              className="hidden lg:flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground trust-transition"
            >
              <Icon name="MapPin" size={16} />
              <span className="max-w-32 truncate">{resolvedLocation || initialLocation}</span>
            </button>
          )}

          {/* Active Service Badge */}
          {activeService && role === 'user' && (
            <Link
              to="/live-tracking"
              className="hidden lg:flex items-center space-x-2 px-3 py-2 bg-success text-success-foreground rounded-md text-sm font-medium trust-transition hover:bg-success/90"
            >
              <div className="w-2 h-2 bg-success-foreground rounded-full animate-pulse-soft"></div>
              <span>Active Service</span>
            </Link>
          )}

          {/* Quick Search */}
          {role === 'user' && (
            <div className="hidden lg:block">
              <div className="relative">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search technicians..."
                  className="w-64 pl-10 pr-4 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* User Profile */}
          {user ? (
            <div className="relative profile-dropdown">
              <button
                onClick={handleProfileClick}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted trust-transition"
              >
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  {(user?.fullName || user?.name || 'U')?.charAt(0)}
                </div>
                <Icon name="ChevronDown" size={16} className="text-muted-foreground" />
              </button>

              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-md trust-shadow-lg z-50">
                  <div className="p-3 border-b border-border">
                    <p className="text-sm font-medium text-foreground">{user?.fullName || user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</p>
                  </div>
                  <div className="py-1">
                    {role === 'technician' ? (
                      <>
                        <Link
                          to="/profile-management"
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-foreground hover:bg-muted trust-transition"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Icon name="User" size={16} />
                          <span>Profile</span>
                        </Link>
                        <Link
                          to="/technician-dashboard?tab=schedule"
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-foreground hover:bg-muted trust-transition"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Icon name="Calendar" size={16} />
                          <span>Schedule</span>
                        </Link>
                        <Link
                          to="/help"
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-foreground hover:bg-muted trust-transition"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Icon name="LifeBuoy" size={16} />
                          <span>Support</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/account"
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-foreground hover:bg-muted trust-transition"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Icon name="User" size={16} />
                          <span>Profile</span>
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-foreground hover:bg-muted trust-transition"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Icon name="Settings" size={16} />
                          <span>Settings</span>
                        </Link>
                        <Link
                          to="/help"
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-foreground hover:bg-muted trust-transition"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Icon name="HelpCircle" size={16} />
                          <span>Help</span>
                        </Link>
                      </>
                    )}

                    <div className="border-t border-border my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-destructive hover:bg-muted trust-transition"
                    >
                      <Icon name="LogOut" size={16} />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/user-login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/user-registration">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-muted trust-transition"
            aria-label="Toggle menu"
          >
            <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <div className="px-4 py-2 space-y-1">
            {/* Location for Mobile */}
            {resolvedLocation && (
              <button
                onClick={handleLocationClick}
                className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md trust-transition"
              >
                <Icon name="MapPin" size={16} />
                <span>{resolvedLocation}</span>
              </button>
            )}

            {/* Navigation Items */}
            {navigationItems?.map((item) => (
              <Link
                key={item?.path}
                to={item?.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium trust-transition ${
                  isActivePath(item?.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item?.icon} size={16} />
                <span>{item?.label}</span>
              </Link>
            ))}

            {/* Active Service for Mobile */}
            {activeService && role === 'user' && (
              <Link
                to="/live-tracking"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 bg-success text-success-foreground rounded-md text-sm font-medium trust-transition"
              >
                <div className="w-2 h-2 bg-success-foreground rounded-full animate-pulse-soft"></div>
                <span>Active Service</span>
              </Link>
            )}

            {/* Search for Mobile */}
            {role === 'user' && (
              <div className="px-3 py-2">
                <div className="relative">
                  <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search technicians..."
                    className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>
              </div>
            )}


          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
