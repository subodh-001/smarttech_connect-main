import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { formatTechnicianName } from '../../../utils/formatTechnicianName';
import BookingDetailsModal from '../../booking-management/components/BookingDetailsModal';

const RecentBookingCard = ({ booking }) => {
  const navigate = useNavigate();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [fullBookingDetails, setFullBookingDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleRebook = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    
    console.log('Rebook button clicked', { booking });
    
    // Navigate to service request creation with pre-filled data from the booking
    const bookingId = booking?.id || booking?._id || booking?.bookingId || booking?.requestId;
    console.log('Booking ID:', bookingId);
    
    if (bookingId) {
      navigate('/service-request-creation', {
        state: {
          rebookFrom: bookingId,
          category: booking?.category || booking?.serviceCategory,
          location: booking?.location || booking?.locationAddress || booking?.address,
          budget: booking?.amount || booking?.totalAmount ? {
            min: (booking?.amount || booking?.totalAmount) * 0.8, // 20% less than previous
            max: (booking?.amount || booking?.totalAmount) * 1.2, // 20% more than previous
            label: 'Similar to previous booking'
          } : null,
        }
      });
    } else {
      console.warn('No booking ID found in booking data:', booking);
      // Fallback: navigate to service request creation without pre-filled data
      navigate('/service-request-creation');
    }
  };

  const handleDetails = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    
    const bookingId = booking?.id || booking?._id || booking?.bookingId || booking?.requestId;
    
    if (!bookingId) {
      console.warn('No booking ID found in booking data:', booking);
      alert('Service ID is not available. Cannot load details.');
      return;
    }
    
    setLoadingDetails(true);
    try {
      // Fetch full service request details
      const { data } = await axios.get(`/api/service-requests/${bookingId}`);
      
      // Format the data for the modal
      const scheduledDate = data.scheduledDate ? new Date(data.scheduledDate) : null;
      const fullAddress = data.requirements?.city || data.requirements?.state 
        ? [data.locationAddress, data.requirements.city, data.requirements.state, data.requirements.postalCode]
            .filter(Boolean).join(', ')
        : data.locationAddress || 'Current location';
      
      const formattedBooking = {
        id: data.id || data._id,
        service: data.title || data.category || booking?.category,
        category: data.category || booking?.category,
        status: data.status === 'completed' ? 'completed' : 
                data.status === 'in_progress' ? 'active' : 
                data.status === 'confirmed' ? 'upcoming' : 
                data.status || booking?.status || 'pending',
        scheduledDate: scheduledDate ? scheduledDate.toISOString().split('T')[0] : null,
        scheduledTime: scheduledDate ? scheduledDate.toTimeString().slice(0, 5) : null,
        price: data.finalCost || data.budgetMax || data.budgetMin || booking?.amount || 0,
        description: data.description || 'No description provided',
        address: data.locationAddress || booking?.location || 'Current location',
        fullAddress: fullAddress,
        technician: data.technician ? {
          ...data.technician,
          name: data.technician.name || data.technician.fullName || data.technician.email,
          rating: data.technician.rating || data.technician.averageRating || null,
          experience: data.technician.experience || data.technician.yearsOfExperience || null,
          specialization: data.technician.specialization || (Array.isArray(data.technician.specialties) ? data.technician.specialties.join(', ') : null),
        } : booking?.technician || null,
        specialInstructions: data.requirements?.specialInstructions || null,
        timeline: [
          { title: 'Service Request Created', timestamp: data.createdAt ? new Date(data.createdAt).toLocaleString('en-IN') : '—' },
          data.technicianId ? { title: 'Technician Assigned', timestamp: data.updatedAt ? new Date(data.updatedAt).toLocaleString('en-IN') : '—' } : null,
          data.status === 'completed' ? { title: 'Service Completed', timestamp: data.completionDate ? new Date(data.completionDate).toLocaleString('en-IN') : '—' } : null,
        ].filter(Boolean),
        progress: data.status === 'completed' ? 100 : data.status === 'in_progress' ? 50 : data.status === 'confirmed' ? 25 : 0,
        eta: data.estimatedDuration ? `${data.estimatedDuration} mins` : null,
      };
      
      setFullBookingDetails(formattedBooking);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Failed to load booking details:', error);
      alert('Failed to load service details. Please try again.');
    } finally {
      setLoadingDetails(false);
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'cancelled':
        return 'text-red-600';
      case 'pending-review':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const renderRating = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5]?.map((star) => (
          <Icon
            key={star}
            name="Star"
            size={14}
            className={star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">({rating})</span>
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 trust-shadow hover:trust-shadow-md trust-transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <Image
              src={booking?.technician?.avatar || 'https://ui-avatars.com/api/?background=9333EA&color=fff&name=' + encodeURIComponent(booking?.technician?.name || booking?.technician?.email || 'T')}
              alt={booking?.technician?.name || booking?.technician?.email || 'Technician'}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="font-medium text-foreground">
              {booking?.technician 
                ? (formatTechnicianName(booking.technician) || booking.technician.email || 'Technician')
                : booking?.status === 'completed' 
                  ? 'Technician Information Not Available'
                  : 'Awaiting assignment'}
            </h4>
            <p className="text-sm text-muted-foreground">{booking?.category}</p>
            {booking?.technician?.email && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {booking.technician.email}
              </p>
            )}
            {!booking?.technician && booking?.status === 'completed' && (
              <p className="text-xs text-muted-foreground mt-0.5 italic">
                Technician details unavailable
              </p>
            )}
          </div>
        </div>
        <span className={`text-sm font-medium ${getStatusColor(booking?.status)}`}>
          {booking?.status?.replace('-', ' ')?.toUpperCase()}
        </span>
      </div>
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Date:</span>
          <span className="text-foreground">{booking?.date}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Amount:</span>
          <span className="text-foreground font-medium">₹{booking?.amount}</span>
        </div>
        {booking?.rating && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Rating:</span>
            {renderRating(booking?.rating)}
          </div>
        )}
      </div>
      <div className="flex space-x-2">
        {booking?.status === 'pending-review' ? (
          <Button
            variant="outline"
            size="sm"
            iconName="Star"
            iconPosition="left"
            fullWidth
          >
            Rate Service
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              iconName="RotateCcw"
              iconPosition="left"
              className="flex-1"
              onClick={handleRebook}
              type="button"
            >
              Rebook
            </Button>
            <Button
              variant="ghost"
              size="sm"
              iconName="Eye"
              iconPosition="left"
              className="flex-1"
              onClick={handleDetails}
              type="button"
              loading={loadingDetails}
              disabled={loadingDetails}
            >
              Details
            </Button>
          </>
        )}
      </div>
      
      {/* Booking Details Modal */}
      {showDetailsModal && fullBookingDetails && (
        <BookingDetailsModal
          booking={fullBookingDetails}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setFullBookingDetails(null);
          }}
          onTrack={(booking) => {
            const bookingId = booking?.id || booking?._id;
            if (bookingId) {
              navigate(`/live-tracking?id=${bookingId}`);
            }
          }}
          onReschedule={(booking) => {
            const bookingId = booking?.id || booking?._id;
            if (bookingId) {
              navigate('/booking-management', {
                state: { highlightId: bookingId, action: 'reschedule' }
              });
            }
          }}
          onCancel={(booking) => {
            const bookingId = booking?.id || booking?._id;
            if (bookingId) {
              navigate('/booking-management', {
                state: { highlightId: bookingId, action: 'cancel' }
              });
            }
          }}
          onContact={(booking) => {
            const bookingId = booking?.id || booking?._id;
            if (bookingId) {
              navigate(`/chat-communication?conversation=${bookingId}`);
            }
          }}
        />
      )}
    </div>
  );
};

export default RecentBookingCard;