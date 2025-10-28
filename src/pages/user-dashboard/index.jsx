import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  const { isAuthenticated, userProfile } = useAuth();

  useEffect(() => {
    // Mock active services
    const mockActiveServices = [
      {
        id: 1,
        category: "AC Repair",
        status: "on-the-way",
        location: "Koramangala 5th Block, Bangalore",
        eta: "15 mins",
        budget: 800,
        technician: {
          id: 101,
          name: "Suresh Reddy",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          rating: 4.8,
          phone: "+91 9876543211"
        },
        createdAt: new Date(Date.now() - 3600000)
      },
      {
        id: 2,
        category: "Plumbing",
        status: "assigned",
        location: "Koramangala 6th Block, Bangalore",
        eta: "45 mins",
        budget: 500,
        technician: {
          id: 102,
          name: "Ramesh Sharma",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          rating: 4.6,
          phone: "+91 9876543212"
        },
        createdAt: new Date(Date.now() - 7200000)
      }
    ];

    // Mock recent bookings
    const mockRecentBookings = [
      {
        id: 3,
        category: "Electrical Work",
        status: "completed",
        date: "28 Aug 2025",
        amount: 650,
        rating: 5,
        technician: {
          id: 103,
          name: "Vikram Singh",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
        }
      },
      {
        id: 4,
        category: "Appliance Repair",
        status: "pending-review",
        date: "25 Aug 2025",
        amount: 1200,
        technician: {
          id: 104,
          name: "Amit Patel",
          avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face"
        }
      },
      {
        id: 5,
        category: "Carpentry",
        status: "completed",
        date: "22 Aug 2025",
        amount: 2500,
        rating: 4,
        technician: {
          id: 105,
          name: "Deepak Kumar",
          avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face"
        }
      },
      {
        id: 6,
        category: "Cleaning Service",
        status: "completed",
        date: "20 Aug 2025",
        amount: 800,
        rating: 5,
        technician: {
          id: 106,
          name: "Priya Sharma",
          avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
        }
      }
    ];

    // Mock wallet data
    const mockWalletData = {
      balance: 2450,
      earned: 350,
      points: 1250,
      pendingReviews: 2,
      recommendations: [
        {
          name: "AC Maintenance",
          price: 299,
          icon: "Wind",
          iconColor: "text-blue-600",
          bgColor: "bg-blue-100"
        },
        {
          name: "Home Cleaning",
          price: 499,
          icon: "Sparkles",
          iconColor: "text-pink-600",
          bgColor: "bg-pink-100"
        }
      ]
    };

    // Mock stats
    const mockStats = {
      totalBookings: 24,
      completedServices: 22,
      moneySaved: 3200,
      avgRatingGiven: 4.8
    };

    // Simulate API loading
    setTimeout(() => {
      // Only set personalized user data if authenticated
      if (isAuthenticated && userProfile) {
        setUser({
          name: userProfile?.full_name || userProfile?.name,
          email: userProfile?.email,
          location: userProfile?.location
        });
      } else {
        setUser(null);
      }
      setActiveServices(mockActiveServices);
      setRecentBookings(mockRecentBookings);
      setWalletData(mockWalletData);
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, [isAuthenticated, userProfile]);

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
                  <Button size="sm" variant="outline" iconName="Phone" iconPosition="left">
                    Call Support
                  </Button>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>24/7 Helpline: +91-800-123-4567</p>
                  <p>Email: support@smarttechconnect.com</p>
                  <p>WhatsApp: +91-900-123-4567</p>
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