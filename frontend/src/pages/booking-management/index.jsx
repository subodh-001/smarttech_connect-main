import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import BookingCard from './components/BookingCard';
import BookingFilters from './components/BookingFilters';
import BookingTabs from './components/BookingTabs';
import BookingDetailsModal from './components/BookingDetailsModal';
import RescheduleModal from './components/RescheduleModal';
import CancelBookingModal from './components/CancelBookingModal';
import RatingModal from './components/RatingModal';

const BookingManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Mock booking data
  const mockBookings = [
    {
      id: "BK001",
      service: "AC Repair & Maintenance",
      category: "ac-repair",
      status: "active",
      scheduledDate: "2025-01-07",
      scheduledTime: "14:00",
      address: "123 Main Street, Apt 4B",
      fullAddress: "123 Main Street, Apartment 4B, Downtown District, New York, NY 10001",
      price: 85,
      progress: 65,
      eta: "25 minutes",
      description: "Air conditioning unit not cooling properly. Requires inspection and potential refrigerant refill. Unit is making unusual noises.",
      specialInstructions: "Please call before arriving. Building requires visitor registration at front desk.",
      technician: {
        id: "T001",
        name: "Michael Rodriguez",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        rating: 4.8,
        experience: 8,
        specialization: "HVAC Specialist",
        isOnline: true
      },
      timeline: [
        { title: "Booking Confirmed", timestamp: "Jan 7, 2025 at 9:00 AM" },
        { title: "Technician Assigned", timestamp: "Jan 7, 2025 at 9:15 AM" },
        { title: "Technician En Route", timestamp: "Jan 7, 2025 at 1:30 PM" },
        { title: "Service Started", timestamp: "Jan 7, 2025 at 2:00 PM" }
      ]
    },
    {
      id: "BK002",
      service: "Plumbing - Kitchen Sink Repair",
      category: "plumbing",
      status: "upcoming",
      scheduledDate: "2025-01-08",
      scheduledTime: "10:00",
      address: "456 Oak Avenue, Unit 12",
      fullAddress: "456 Oak Avenue, Unit 12, Riverside Complex, Brooklyn, NY 11201",
      price: 65,
      description: "Kitchen sink faucet is leaking and water pressure is low. May need faucet replacement or pipe cleaning.",
      technician: {
        id: "T002",
        name: "Sarah Johnson",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        rating: 4.9,
        experience: 6,
        specialization: "Plumbing Expert",
        isOnline: false
      },
      timeline: [
        { title: "Booking Confirmed", timestamp: "Jan 6, 2025 at 3:30 PM" },
        { title: "Technician Assigned", timestamp: "Jan 6, 2025 at 4:00 PM" }
      ]
    },
    {
      id: "BK003",
      service: "Electrical - Outlet Installation",
      category: "electrical",
      status: "completed",
      scheduledDate: "2025-01-05",
      scheduledTime: "16:00",
      address: "789 Pine Street, Floor 3",
      fullAddress: "789 Pine Street, Floor 3, Heritage Building, Manhattan, NY 10003",
      price: 120,
      description: "Install 3 new electrical outlets in home office. Includes GFCI outlets for safety compliance.",
      isRated: true,
      userRating: 5,
      technician: {
        id: "T003",
        name: "David Chen",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        rating: 4.7,
        experience: 12,
        specialization: "Licensed Electrician",
        isOnline: true
      },
      timeline: [
        { title: "Booking Confirmed", timestamp: "Jan 4, 2025 at 2:00 PM" },
        { title: "Technician Assigned", timestamp: "Jan 4, 2025 at 2:30 PM" },
        { title: "Service Completed", timestamp: "Jan 5, 2025 at 5:30 PM" },
        { title: "Payment Processed", timestamp: "Jan 5, 2025 at 5:45 PM" }
      ]
    },
    {
      id: "BK004",
      service: "Computer Repair - Laptop Screen",
      category: "computer",
      status: "completed",
      scheduledDate: "2025-01-03",
      scheduledTime: "11:00",
      address: "321 Elm Drive, Suite 8",
      fullAddress: "321 Elm Drive, Suite 8, Tech Plaza, Queens, NY 11375",
      price: 180,
      description: "Laptop screen replacement for Dell XPS 13. Screen is cracked and displaying distorted colors.",
      isRated: false,
      technician: {
        id: "T004",
        name: "Alex Thompson",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        rating: 4.6,
        experience: 5,
        specialization: "Computer Technician",
        isOnline: false
      },
      timeline: [
        { title: "Booking Confirmed", timestamp: "Jan 2, 2025 at 4:15 PM" },
        { title: "Technician Assigned", timestamp: "Jan 2, 2025 at 4:45 PM" },
        { title: "Service Completed", timestamp: "Jan 3, 2025 at 1:30 PM" },
        { title: "Payment Processed", timestamp: "Jan 3, 2025 at 1:45 PM" }
      ]
    },
    {
      id: "BK005",
      service: "Carpentry - Shelf Installation",
      category: "carpentry",
      status: "cancelled",
      scheduledDate: "2025-01-02",
      scheduledTime: "09:00",
      address: "654 Maple Court, Apt 7A",
      fullAddress: "654 Maple Court, Apartment 7A, Garden View Complex, Bronx, NY 10451",
      price: 95,
      description: "Install floating shelves in living room. Customer provided materials, installation service only.",
      technician: {
        id: "T005",
        name: "Robert Wilson",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
        rating: 4.5,
        experience: 10,
        specialization: "Carpenter & Handyman",
        isOnline: true
      },
      timeline: [
        { title: "Booking Confirmed", timestamp: "Jan 1, 2025 at 6:00 PM" },
        { title: "Technician Assigned", timestamp: "Jan 1, 2025 at 6:30 PM" },
        { title: "Booking Cancelled", timestamp: "Jan 2, 2025 at 8:00 AM" }
      ]
    }
  ];

  // Initialize bookings
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setBookings(mockBookings);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter bookings based on active tab and search
  useEffect(() => {
    let filtered = bookings?.filter(booking => booking?.status === activeTab);
    
    if (searchQuery) {
      filtered = filtered?.filter(booking =>
        booking?.service?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        booking?.technician?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        booking?.id?.toLowerCase()?.includes(searchQuery?.toLowerCase())
      );
    }
    
    setFilteredBookings(filtered);
  }, [bookings, activeTab, searchQuery]);

  // Get booking counts for tabs
  const getBookingCounts = () => {
    return {
      active: bookings?.filter(b => b?.status === 'active')?.length,
      upcoming: bookings?.filter(b => b?.status === 'upcoming')?.length,
      completed: bookings?.filter(b => b?.status === 'completed')?.length,
      cancelled: bookings?.filter(b => b?.status === 'cancelled')?.length
    };
  };

  // Handle booking actions
  const handleTrackTechnician = (booking) => {
    // In a real app, this would navigate to a tracking page
    console.log('Tracking technician for booking:', booking?.id);
    // For demo, we'll show an alert
    alert(`Tracking ${booking?.technician?.name} - ETA: ${booking?.eta || 'Calculating...'}`);
  };

  const handleReschedule = (booking) => {
    setSelectedBooking(booking);
    setShowRescheduleModal(true);
  };

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const handleContactTechnician = (booking) => {
    navigate('/chat-communication', { 
      state: { 
        technicianId: booking?.technician?.id,
        bookingId: booking?.id 
      }
    });
  };

  const handleRateService = (booking) => {
    setSelectedBooking(booking);
    setShowRatingModal(true);
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  // Handle modal confirmations
  const handleRescheduleConfirm = (rescheduleData) => {
    console.log('Rescheduling booking:', rescheduleData);
    // Update booking in state
    setBookings(prev => prev?.map(booking => 
      booking?.id === rescheduleData?.bookingId 
        ? { 
            ...booking, 
            scheduledDate: rescheduleData?.newDate,
            scheduledTime: rescheduleData?.newTime,
            timeline: [
              ...booking?.timeline,
              { 
                title: "Booking Rescheduled", 
                timestamp: new Date()?.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }) + ' at ' + new Date()?.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })
              }
            ]
          }
        : booking
    ));
  };

  const handleCancelConfirm = (cancelData) => {
    console.log('Cancelling booking:', cancelData);
    // Update booking status
    setBookings(prev => prev?.map(booking => 
      booking?.id === cancelData?.bookingId 
        ? { 
            ...booking, 
            status: 'cancelled',
            timeline: [
              ...booking?.timeline,
              { 
                title: "Booking Cancelled", 
                timestamp: new Date()?.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }) + ' at ' + new Date()?.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })
              }
            ]
          }
        : booking
    ));
  };

  const handleRatingSubmit = (ratingData) => {
    console.log('Submitting rating:', ratingData);
    // Update booking with rating
    setBookings(prev => prev?.map(booking => 
      booking?.id === ratingData?.bookingId 
        ? { 
            ...booking, 
            isRated: true,
            userRating: ratingData?.rating,
            userReview: ratingData?.review
          }
        : booking
    ));
  };

  // Handle filters
  const handleFilterChange = (filters) => {
    console.log('Applying filters:', filters);
    // In a real app, this would filter the bookings based on the filters
  };

  const handleClearFilters = () => {
    console.log('Clearing filters');
    // Reset any applied filters
  };

  return (
      <div className="min-h-screen bg-background">
        <Header 
          messageBadgeCount={3}
          bookingBadgeCount={getBookingCounts()?.active + getBookingCounts()?.upcoming}
          onToggleSidebar={() => {}} // Add missing required prop
        />
        
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-text-primary">Booking Management</h1>
                <p className="text-text-secondary mt-1">
                  Track and manage your service appointments
                </p>
              </div>
              <Button
                variant="default"
                onClick={() => navigate('/user-dashboard')}
                iconName="Plus"
                iconPosition="left"
                className="hidden sm:flex"
              >
                New Booking
              </Button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Icon 
                name="Search" 
                size={20} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
              />
              <input
                type="text"
                placeholder="Search bookings, technicians, or IDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Booking Tabs */}
          <BookingTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            bookingCounts={getBookingCounts()}
          />

          {/* Filters */}
          <BookingFilters
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />

          {/* Booking List */}
          <div className="space-y-4">
            {isLoading ? (
              // Loading skeleton
              (<div className="space-y-4">
                {[1, 2, 3]?.map((i) => (
                  <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="h-5 bg-muted rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                      </div>
                      <div className="h-6 bg-muted rounded w-16"></div>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-muted rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-1/4 mb-1"></div>
                        <div className="h-3 bg-muted rounded w-1/3"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-muted rounded w-20"></div>
                      <div className="h-8 bg-muted rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>)
            ) : filteredBookings?.length === 0 ? (
              // Empty state
              (<div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Calendar" size={24} className="text-text-secondary" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  No {activeTab} bookings found
                </h3>
                <p className="text-text-secondary mb-4">
                  {searchQuery 
                    ? `No bookings match your search "${searchQuery}"`
                    : `You don't have any ${activeTab} bookings at the moment.`
                  }
                </p>
                {activeTab === 'upcoming' && !searchQuery && (
                  <Button
                    variant="default"
                    onClick={() => navigate('/user-dashboard')}
                    iconName="Plus"
                    iconPosition="left"
                  >
                    Book a Service
                  </Button>
                )}
              </div>)
            ) : (
              // Booking cards
              (filteredBookings?.map((booking) => (
                <BookingCard
                  key={booking?.id}
                  booking={booking}
                  onTrack={handleTrackTechnician}
                  onReschedule={handleReschedule}
                  onCancel={handleCancelBooking}
                  onContact={handleContactTechnician}
                  onRate={handleRateService}
                  onViewDetails={handleViewDetails}
                />
              )))
            )}
          </div>

          {/* Mobile New Booking Button */}
          <div className="fixed bottom-20 right-4 sm:hidden">
            <Button
              variant="default"
              size="icon"
              onClick={() => navigate('/user-dashboard')}
              className="w-14 h-14 rounded-full shadow-elevated"
            >
              <Icon name="Plus" size={24} />
            </Button>
          </div>
        </main>

        {/* Modals */}
        <BookingDetailsModal
          booking={selectedBooking}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          onTrack={handleTrackTechnician}
          onReschedule={handleReschedule}
          onCancel={handleCancelBooking}
          onContact={handleContactTechnician}
        />

        <RescheduleModal
          booking={selectedBooking}
          isOpen={showRescheduleModal}
          onClose={() => setShowRescheduleModal(false)}
          onConfirm={handleRescheduleConfirm}
        />

        <CancelBookingModal
          booking={selectedBooking}
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelConfirm}
        />

        <RatingModal
          booking={selectedBooking}
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleRatingSubmit}
        />
      </div>
  );
};

export default BookingManagement;