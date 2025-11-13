import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ActiveServiceCard from './components/ActiveServiceCard';
import QuickServicePanel from './components/QuickServicePanel';
import RecentBookingCard from './components/RecentBookingCard';
import WalletSidebar from './components/WalletSidebar';
import StatsOverview from './components/StatsOverview';
import { useAuth } from '../../contexts/NewAuthContext';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeServices, setActiveServices] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [walletData, setWalletData] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, userProfile, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/dashboard/user');
        const data = response.data || {};

        setUser(data.user || null);
        setActiveServices(Array.isArray(data.activeServices) ? data.activeServices : []);
        setRecentBookings(Array.isArray(data.recentBookings) ? data.recentBookings : []);
        setWalletData(data.wallet || {});
        setStats(data.stats || {});
      } catch (error) {
        console.error('Failed to load dashboard data:', error);

        setUser(
          isAuthenticated && userProfile
            ? {
          name: userProfile?.full_name || userProfile?.name,
          email: userProfile?.email,
                location: userProfile?.location,
              }
            : null
        );
        setActiveServices([]);
        setRecentBookings([]);
        setWalletData({});
        setStats({});
      } finally {
      setLoading(false);
      }
    };

    loadDashboard();
  }, [authLoading, isAuthenticated, userProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} location="Koramangala, Bangalore" />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user} 
        location={user?.location} 
        activeService={activeServices?.length > 0 ? activeServices?.[0] : null} 
      />
      <main className="pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                {/* Personalized greeting only after sign-in */}
                {isAuthenticated && user?.name ? (
                  <h1 className="text-3xl font-bold text-foreground">
                    Welcome back, {user?.name?.split(' ')?.[0]}!
                  </h1>
                ) : (
                  <h1 className="text-3xl font-bold text-foreground">
                    Welcome to SmartTech Connect
                  </h1>
                )}
                <p className="text-muted-foreground mt-1">
                  Manage your services and track your bookings
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-3">
                <Link to="/service-request-creation">
                  <Button iconName="Plus" iconPosition="left">
                    Request Service
                  </Button>
                </Link>
                <Button variant="outline" iconName="Search" iconPosition="left">
                  Find Technicians
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <StatsOverview stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Active Services */}
              {activeServices?.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">Active Services</h2>
                    <Link to="/live-tracking" className="text-primary hover:underline text-sm">
                      View All
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {activeServices?.map(service => (
                      <ActiveServiceCard key={service?.id} service={service} />
                    ))}
                  </div>
                </section>
              )}

              {/* Quick Service Panel */}
              <QuickServicePanel />

              {/* Recent Bookings */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">Recent Bookings</h2>
                  <Link to="/booking-management" className="text-primary hover:underline text-sm">
                    View All
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentBookings?.map(booking => (
                    <RecentBookingCard key={booking?.id} booking={booking} />
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <WalletSidebar wallet={walletData} />

              {/* Emergency Contact */}
              <section className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Emergency Contact</h2>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    iconName="Phone" 
                    iconPosition="left"
                    onClick={() => window.location.href = 'tel:+918001234567'}
                    type="button"
                  >
                    Call Support
                  </Button>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    24/7 Helpline:{' '}
                    <a
                      href="tel:+918001234567"
                      className="text-primary hover:underline"
                    >
                      +91-800-123-4567
                    </a>
                  </p>
                  <p>
                    Email:{' '}
                    <a
                      href="mailto:support@smarttechconnect.com"
                      className="text-primary hover:underline"
                    >
                      support@smarttechconnect.com
                    </a>
                  </p>
                  <p>
                    WhatsApp:{' '}
                    <a
                      href="https://wa.me/919001234567"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      +91-900-123-4567
                    </a>
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;