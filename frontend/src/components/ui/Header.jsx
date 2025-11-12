import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import { useAuth } from '../../contexts/NewAuthContext';

const Header = ({
  user: userProp = null,
  initialLocation = null,
  activeService = null,
  messageBadgeCount = 0,
  bookingBadgeCount = 0,
}) => {
  const { user, signOut } = useAuth();
  const [resolvedLocation, setResolvedLocation] = useState(initialLocation);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const currentLocation = useLocation();
  const navigate = useNavigate();

  const pathname = currentLocation?.pathname || '';
  const roleFromPath = (() => {
    if (pathname.startsWith('/admin-dashboard')) return 'admin';
    if (pathname.startsWith('/technician-dashboard')) return 'technician';
    return null;
  })();
  const roleRaw = user?.role || user?.type || userProp?.role || userProp?.type;
  const role = (roleRaw === 'customer' ? 'user' : roleRaw) || roleFromPath || 'user';

  const technicianTabsBase = '/technician-dashboard';
  const adminTabsBase = '/admin-dashboard';

  let navigationItems = [];

  if (role === 'technician') {
    navigationItems = [
      { label: 'Overview', path: `${technicianTabsBase}?tab=overview`, icon: 'Home' },
      { label: 'Job Requests', path: `${technicianTabsBase}?tab=jobs`, icon: 'Briefcase', badge: bookingBadgeCount },
      { label: 'Active Jobs', path: `${technicianTabsBase}?tab=active`, icon: 'Play' },
      { label: 'Earnings', path: `${technicianTabsBase}?tab=earnings`, icon: 'DollarSign' },
      { label: 'Schedule', path: `${technicianTabsBase}?tab=schedule`, icon: 'Calendar' },
      { label: 'Notifications', path: `${technicianTabsBase}?tab=notifications`, icon: 'Bell', badge: messageBadgeCount },
      { label: 'Messages', path: '/chat-communication', icon: 'MessageCircle' },
    ];
  } else if (role === 'admin') {
    navigationItems = [
      { label: 'Overview', path: `${adminTabsBase}?tab=overview`, icon: 'LayoutDashboard' },
      { label: 'Users', path: `${adminTabsBase}?tab=users`, icon: 'Users' },
      { label: 'Technicians', path: `${adminTabsBase}?tab=technicians`, icon: 'UserCog' },
      { label: 'Services', path: `${adminTabsBase}?tab=services`, icon: 'Briefcase' },
      { label: 'Approvals', path: `${adminTabsBase}?tab=approvals`, icon: 'ShieldCheck' },
      { label: 'Reports', path: `${adminTabsBase}?tab=reports`, icon: 'BarChart3' },
      { label: 'Settings', path: `${adminTabsBase}?tab=settings`, icon: 'Settings' },
    ];
  } else {
    navigationItems = [
      { label: 'Dashboard', path: '/user-dashboard', icon: 'LayoutDashboard' },
      { label: 'My Bookings', path: '/booking-management', icon: 'CalendarCheck', badge: bookingBadgeCount },
      { label: 'Request Service', path: '/service-request-creation', icon: 'Plus' },
      { label: 'Find Technicians', path: '/technician-selection', icon: 'Users' },
      { label: 'Track Service', path: '/live-tracking', icon: 'MapPin' },
      { label: 'Messages', path: '/chat-communication', icon: 'MessageCircle', badge: messageBadgeCount },
    ];
  }

  const isActivePath = (path) => {
    if (path.startsWith('/technician-dashboard') || path.startsWith('/admin-dashboard')) {
      const currentTab = new URLSearchParams(currentLocation.search).get('tab') || 'overview';
      const pathUrl = new URL(path, window.location.origin);
      const pathTab = pathUrl.searchParams.get('tab');
      const dashboardPath = path.startsWith('/technician-dashboard')
        ? '/technician-dashboard'
        : '/admin-dashboard';

      if (currentLocation.pathname === dashboardPath) {
        if (path === dashboardPath && !pathTab) {
          return currentTab === 'overview' || !currentTab;
        }
        return pathTab === currentTab;
      }
    }

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

  const navLinkClasses = (active) =>
    `relative flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
      active
        ? 'bg-primary text-white shadow-lg shadow-primary/25'
        : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
    }`;

  const renderBadge = (badge) =>
    badge ? (
      <span className="ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-white/20 px-2 text-[11px] font-semibold text-white">
        {badge > 99 ? '99+' : badge}
      </span>
    ) : null;

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl shadow-lg shadow-slate-950/30">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <Link
          to={
            role === 'technician'
              ? '/technician-dashboard'
              : role === 'admin'
              ? '/admin-dashboard'
              : '/user-dashboard'
          }
          className="flex items-center space-x-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/30">
            <Icon name="Zap" size={20} color="white" />
          </div>
          <span className="text-xl font-semibold text-white">SmartTech Connect</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-2">
          {navigationItems.map((item) => {
            const active = isActivePath(item.path);
            return (
              <Link key={item.path} to={item.path} className={navLinkClasses(active)}>
                <Icon name={item.icon} size={16} />
                <span className="hidden lg:inline">{item.label}</span>
                {renderBadge(item.badge)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center space-x-4">
          {(resolvedLocation || initialLocation) && (
            <button
              onClick={handleLocationClick}
              className="hidden lg:flex items-center space-x-2 rounded-md px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <Icon name="MapPin" size={16} />
              <span className="max-w-32 truncate">{resolvedLocation || initialLocation}</span>
            </button>
          )}

          {activeService && role === 'user' && (
            <Link
              to="/live-tracking"
              className="hidden lg:flex items-center space-x-2 rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500/90"
            >
              <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
              <span>Active Service</span>
            </Link>
          )}

          {role === 'user' && (
            <div className="hidden lg:block">
              <div className="relative">
                <Icon
                  name="Search"
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="text"
                  placeholder="Search technicians..."
                  className="w-64 rounded-md border border-slate-700 bg-slate-900 px-10 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/60"
                />
              </div>
            </div>
          )}

          {user ? (
            <div className="profile-dropdown relative">
              <button
                onClick={handleProfileClick}
                className="flex items-center space-x-2 rounded-md p-2 text-slate-300 hover:bg-slate-800/80 hover:text-white"
              >
                {user?.avatarUrl || user?.avatar_url ? (
                  <div className="relative h-8 w-8 rounded-full overflow-hidden border-2 border-primary/30">
                    <img
                      src={user.avatarUrl || user.avatar_url}
                      alt={user?.fullName || user?.name || 'User'}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden h-full w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
                      {(user?.fullName || user?.name || 'U')?.charAt(0)}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
                    {(user?.fullName || user?.name || 'U')?.charAt(0)}
                  </div>
                )}
                <Icon name="ChevronDown" size={16} className="text-slate-500" />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-lg border border-slate-700 bg-slate-900 shadow-xl shadow-black/50">
                  <div className="border-b border-slate-800 p-3">
                    <div className="flex items-center space-x-3">
                      {user?.avatarUrl || user?.avatar_url ? (
                        <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-primary/30 flex-shrink-0">
                          <img
                            src={user.avatarUrl || user.avatar_url}
                            alt={user?.fullName || user?.name || 'User'}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                          <div className="hidden h-full w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
                            {(user?.fullName || user?.name || 'U')?.charAt(0)}
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-white flex-shrink-0">
                          {(user?.fullName || user?.name || 'U')?.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user?.fullName || user?.name || 'User'}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email || 'user@example.com'}</p>
                        {(user?.role === 'technician' || user?.type === 'technician') && (
                          <p className="text-xs text-primary mt-0.5">Technician</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    {role === 'technician' ? (
                      <>
                        <Link
                          to="/profile-management"
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Icon name="User" size={16} />
                          <span>Profile</span>
                        </Link>
                        <Link
                          to="/technician-dashboard?tab=schedule"
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Icon name="Calendar" size={16} />
                          <span>Schedule</span>
                        </Link>
                        <Link
                          to="/help"
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Icon name="LifeBuoy" size={16} />
                          <span>Support</span>
                        </Link>
                      </>
                    ) : role === 'admin' ? (
                      <>
                        <Link
                          to="/admin-dashboard?tab=settings"
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Icon name="Settings" size={16} />
                          <span>Admin Settings</span>
                        </Link>
                        <Link
                          to="/help"
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Icon name="HelpCircle" size={16} />
                          <span>Help</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/account"
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Icon name="User" size={16} />
                          <span>Profile</span>
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Icon name="Settings" size={16} />
                          <span>Settings</span>
                        </Link>
                        <Link
                          to="/help"
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Icon name="HelpCircle" size={16} />
                          <span>Help</span>
                        </Link>
                      </>
                    )}

                    <div className="my-1 border-t border-slate-800" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center space-x-2 px-3 py-2 text-sm text-rose-400 hover:bg-slate-800/80"
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
                <Button variant="outline" size="sm" className="border-slate-700 bg-slate-900 text-white hover:bg-slate-800">
                  Sign In
                </Button>
              </Link>
              <Link to="/user-registration">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-md p-2 text-slate-400 hover:bg-slate-800/80 hover:text-white md:hidden"
            aria-label="Toggle menu"
          >
            <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={20} />
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl">
          <div className="space-y-1 px-4 py-2">
            {resolvedLocation && (
              <button
                onClick={handleLocationClick}
                className="flex w-full items-center space-x-3 rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white"
              >
                <Icon name="MapPin" size={16} />
                <span>{resolvedLocation}</span>
              </button>
            )}

            {navigationItems.map((item) => {
              const active = isActivePath(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium ${
                    active
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Icon name={item.icon} size={16} />
                  <span>{item.label}</span>
                  {renderBadge(item.badge)}
                </Link>
              );
            })}

            {activeService && role === 'user' && (
              <Link
                to="/live-tracking"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-white"
              >
                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                <span>Active Service</span>
              </Link>
            )}

            {role === 'user' && (
              <div className="px-3 py-2">
                <div className="relative">
                  <Icon
                    name="Search"
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="text"
                    placeholder="Search technicians..."
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-10 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/60"
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
