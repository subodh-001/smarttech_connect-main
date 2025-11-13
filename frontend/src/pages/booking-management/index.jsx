import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
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

const STATUS_GROUP_MAP = {
  pending: 'upcoming',
  confirmed: 'active',
  in_progress: 'active',
  completed: 'completed',
  cancelled: 'cancelled',
};

const STATUS_LABELS = {
  active: 'Active',
  upcoming: 'Upcoming',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const PROGRESS_BY_STATUS = {
  pending: 15,
  confirmed: 35,
  in_progress: 70,
  completed: 100,
  cancelled: 0,
};

const toLocaleDateTime = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const buildTimeline = (request) => {
  const events = [];
  const created = toLocaleDateTime(request?.createdAt);
  if (created) {
    events.push({ title: 'Request created', timestamp: created });
  }

  const scheduled = toLocaleDateTime(request?.scheduledDate);
  if (scheduled) {
    events.push({ title: 'Scheduled visit', timestamp: scheduled });
  }

  if (request?.status) {
    const statusLabel = request.status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const statusTime = toLocaleDateTime(request?.updatedAt) || created;
    events.push({
      title: `Status updated: ${statusLabel}`,
      timestamp: statusTime,
    });
  }

  if (request?.reviewComment) {
    const feedbackTime =
      toLocaleDateTime(request?.updatedAt) ||
      toLocaleDateTime(request?.completionDate) ||
      created;
    events.push({
      title: 'Customer feedback submitted',
      timestamp: feedbackTime,
    });
  }

  return events;
};

const mapServiceRequestToBooking = (request) => {
  if (!request) return null;

  const group = STATUS_GROUP_MAP[request.status] || 'upcoming';
  const statusLabel = STATUS_LABELS[group] || group;

  const scheduledDate = request.scheduledDate ? new Date(request.scheduledDate) : null;
  const createdDate = request.createdAt ? new Date(request.createdAt) : null;
  const anchorDate = scheduledDate && !Number.isNaN(scheduledDate.getTime())
    ? scheduledDate
    : createdDate && !Number.isNaN(createdDate.getTime())
    ? createdDate
    : null;

  const scheduledDateString = anchorDate
    ? anchorDate.toISOString().split('T')[0]
    : null;
  const scheduledTimeString = anchorDate
    ? anchorDate.toISOString().slice(11, 16)
    : null;

  const price =
    request.finalCost ??
    request.budgetMax ??
    request.budgetMin ??
    0;

  // Handle technician data - backend formatServiceRequest returns request.technician with name property
  const technicianUser = request.technician || null;
  
  // Extract technician name - backend returns technician.name (which is fullName || email)
  let technicianName = 'Awaiting assignment';
  if (technicianUser && typeof technicianUser === 'object') {
    // Backend formatServiceRequest sets: name: technicianUser.fullName || technicianUser.email
    technicianName = technicianUser.name || technicianUser.fullName || technicianUser.email || 'Awaiting assignment';
    
    // If name is generic "technician" or "Technician", try to get actual name
    if (technicianName && (technicianName.toLowerCase() === 'technician' || technicianName === 'Technician')) {
      technicianName = technicianUser.fullName || technicianUser.email || 'Awaiting assignment';
    }
  }
  const technicianAvatar =
    technicianUser?.avatar ||
    technicianUser?.avatarUrl ||
    `https://ui-avatars.com/api/?background=2563EB&color=fff&name=${encodeURIComponent(
      technicianName,
    )}`;

  const progress = PROGRESS_BY_STATUS[request.status] ?? null;

  let eta = null;
  if (group === 'active' && anchorDate) {
    const diffMinutes = Math.round((anchorDate.getTime() - Date.now()) / 60000);
    if (diffMinutes > 0) {
      eta =
        diffMinutes >= 60
          ? `${Math.floor(diffMinutes / 60)} hr ${diffMinutes % 60} mins`
          : `${diffMinutes} mins`;
    }
  }

  const requirements = request.requirements || {};
  const specialInstructions =
    requirements.specialInstructions ||
    requirements.instructions ||
    requirements.notes ||
    requirements.rescheduleReason ||
    null;

  const searchText = [
    request.title,
    request.category,
    request.locationAddress,
    technicianName,
    request.id,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return {
    id: request.id,
    service: request.title || request.category,
    category: request.category,
    status: statusLabel,
    filterStatus: group,
    rawStatus: request.status,
    scheduledDate: scheduledDateString,
    scheduledTime: scheduledTimeString,
    address: request.locationAddress,
    fullAddress: request.locationAddress,
    price,
    technician: {
      id: technicianUser?.id || technicianUser?._id || null,
      name: technicianName,
      rating: technicianUser?.rating ?? technicianUser?.averageRating ?? null,
      experience: technicianUser?.experience ?? technicianUser?.yearsOfExperience ?? null,
      specialization: technicianUser?.specialization ?? null,
      phone: technicianUser?.phone || null,
      email: technicianUser?.email || null,
      avatar: technicianAvatar,
      isOnline: technicianUser?.isOnline ?? null,
      distance: technicianUser?.distance ?? null,
    },
    progress,
    eta,
    description: request.description,
    specialInstructions,
    timeline: buildTimeline(request),
    isRated: typeof request.reviewRating === 'number' && request.reviewRating > 0,
    userRating: request.reviewRating || null,
    reviewComment: request.reviewComment || null,
    cancellationReason: request.cancellationReason || null,
    locationCoordinates: request.locationCoordinates || null,
    scheduledDateTime: anchorDate ? anchorDate.toISOString() : null,
    searchText,
  };
};

const BookingManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're coming from "Write Reviews" button
  const initialTab = location?.state?.activeTab || 'active';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  
  // Modal states
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.get('/api/service-requests');
      const mappedBookings = Array.isArray(data)
        ? data
            .map(mapServiceRequestToBooking)
            .filter(Boolean)
        : [];
      setBookings(mappedBookings);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setBookings([]);
      setError(err?.response?.data?.error || 'Unable to load bookings right now.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Handle navigation state for active tab
  useEffect(() => {
    if (location?.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // Clear the state to prevent it from persisting on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location?.state?.activeTab, navigate, location.pathname]);

  // Filter bookings based on active tab and search
  useEffect(() => {
    const query = searchQuery?.trim().toLowerCase();

    let filtered = bookings.filter((booking) => booking?.filterStatus === activeTab);

    if (query) {
      filtered = filtered.filter((booking) => {
        if (booking?.searchText) return booking.searchText.includes(query);
        const haystack = [
          booking?.service,
          booking?.technician?.name,
          booking?.id,
          booking?.category,
          booking?.address,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      });
    }

    setFilteredBookings(filtered);
  }, [bookings, activeTab, searchQuery]);

  const bookingCounts = useMemo(() => {
    return {
      active: bookings.filter((b) => b?.filterStatus === 'active').length,
      upcoming: bookings.filter((b) => b?.filterStatus === 'upcoming').length,
      completed: bookings.filter((b) => b?.filterStatus === 'completed').length,
      cancelled: bookings.filter((b) => b?.filterStatus === 'cancelled').length,
    };
  }, [bookings]);

  // Handle booking actions
  const handleTrackTechnician = (booking) => {
    if (!booking?.id) return;
    navigate('/live-tracking', {
      state: {
        serviceRequestId: booking.id,
      },
    });
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
  const handleRescheduleConfirm = async ({ bookingId, newDate, newTime, reason }) => {
    if (!bookingId || !newDate || !newTime) {
      throw new Error('Please select a new date and time.');
    }

    const isoDateTime = new Date(`${newDate}T${newTime}:00`);
    if (Number.isNaN(isoDateTime.getTime())) {
      throw new Error('Invalid schedule selected.');
    }

    try {
      await axios.patch(`/api/service-requests/${bookingId}/status`, {
        scheduledDate: isoDateTime.toISOString(),
        rescheduleReason: reason || undefined,
      });
      await fetchBookings();
      setSelectedBooking(null);
    } catch (error) {
      console.error('Failed to reschedule booking:', error);
      throw new Error(
        error?.response?.data?.error || 'Unable to reschedule booking right now.',
      );
    }
  };

  const handleCancelConfirm = async ({ bookingId, reason }) => {
    if (!bookingId) {
      throw new Error('Invalid booking selected.');
    }

    try {
      await axios.patch(`/api/service-requests/${bookingId}/status`, {
        status: 'cancelled',
        cancellationReason: reason || undefined,
      });
      await fetchBookings();
      setSelectedBooking(null);
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      throw new Error(
        error?.response?.data?.error || 'Unable to cancel booking right now.',
      );
    }
  };

  const handleRatingSubmit = async ({ bookingId, rating, review }) => {
    if (!bookingId || !rating) {
      throw new Error('Rating is required.');
    }

    const booking = bookings.find((item) => item.id === bookingId);
    const payload = {
      reviewRating: rating,
      reviewComment: review || '',
    };
    if (booking?.rawStatus && booking.rawStatus !== 'completed') {
      payload.status = 'completed';
    }

    try {
      await axios.patch(`/api/service-requests/${bookingId}/status`, payload);
      await fetchBookings();
      setSelectedBooking(null);
    } catch (error) {
      console.error('Failed to submit rating:', error);
      throw new Error(
        error?.response?.data?.error || 'Unable to submit rating right now.',
      );
    }
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
      <Header />

      <main className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          {/* Page Hero */}
          <div className="rounded-2xl border border-border bg-card/90 backdrop-blur-sm shadow-subtle px-6 py-6 md:px-8 md:py-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                  My Bookings
                </p>
                <h1 className="text-3xl font-bold text-text-primary md:text-4xl">
                  Booking Management
                </h1>
                <p className="text-sm text-text-secondary mt-3 max-w-xl">
                  Track, reschedule, and manage every appointment from a single dashboard. Stay updated on technician status, progress, and invoices in real time.
                </p>
              </div>
              <Button
                variant="default"
                onClick={() => navigate('/service-request-creation')}
                iconName="Plus"
                iconPosition="left"
                size="lg"
                className="self-start md:self-auto"
              >
                New Booking
              </Button>
            </div>
            {error ? (
              <div className="mt-4 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
                {error}
              </div>
            ) : null}
            <div className="relative mt-6 max-w-xl">
              <Icon
                name="Search"
                size={18}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search bookings, technicians, or IDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
                className="w-full h-12 pl-11 pr-4 border border-border rounded-xl bg-background/80 text-text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Booking Tabs */}
          <BookingTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            bookingCounts={bookingCounts}
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
                    onClick={() => navigate('/service-request-creation')}
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
            onClick={() => navigate('/service-request-creation')}
              className="w-14 h-14 rounded-full shadow-elevated"
            >
              <Icon name="Plus" size={24} />
            </Button>
          </div>
        </div>
      </main>

        {/* Modals */}
        <BookingDetailsModal
          booking={selectedBooking}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBooking(null);
          }}
          onTrack={handleTrackTechnician}
          onReschedule={handleReschedule}
          onCancel={handleCancelBooking}
          onContact={handleContactTechnician}
        />

        <RescheduleModal
          booking={selectedBooking}
          isOpen={showRescheduleModal}
          onClose={() => {
            setShowRescheduleModal(false);
            setSelectedBooking(null);
          }}
          onConfirm={handleRescheduleConfirm}
        />

        <CancelBookingModal
          booking={selectedBooking}
          isOpen={showCancelModal}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedBooking(null);
          }}
          onConfirm={handleCancelConfirm}
        />

        <RatingModal
          booking={selectedBooking}
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedBooking(null);
          }}
          onSubmit={handleRatingSubmit}
        />
      </div>
  );
};

export default BookingManagement;