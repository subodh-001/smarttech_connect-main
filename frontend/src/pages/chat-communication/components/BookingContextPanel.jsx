import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const formatCurrencyINR = (amount) => {
  if (amount == null) return '—';
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  } catch (_) {
    return `₹${amount}`;
  }
};

const BookingContextPanel = ({ booking, isExpanded, onToggle, onReschedule, onCall }) => {
  const navigate = useNavigate();
  const [showFullDescription, setShowFullDescription] = useState(false);

  if (!booking) return null;

  const handleViewLocation = () => {
    if (booking?.location?.lat && booking?.location?.lng) {
      // Open location in Google Maps
      const url = `https://www.google.com/maps?q=${booking.location.lat},${booking.location.lng}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (booking?.location?.address) {
      // Try to open with address if coordinates not available
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.location.address)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert('Location information is not available for this booking.');
    }
  };

  const handleReschedule = () => {
    if (onReschedule) {
      onReschedule(booking);
    } else {
      // Navigate to booking management with reschedule intent
      navigate(`/booking-management?bookingId=${booking?.id}&action=reschedule`);
    }
  };

  const handleCall = () => {
    if (onCall) {
      onCall(booking);
    } else {
      // Try to get technician phone number from booking or conversation participant
      // The phone number might be in the participant object passed from parent
      const phoneNumber = booking?.technician?.phone || 
                         booking?.technicianPhone ||
                         booking?.participant?.phone ||
                         (booking?.participant?.role === 'technician' ? booking?.participant?.phone : null);
      
      if (phoneNumber) {
        // Clean phone number: keep digits and + sign
        const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
        if (cleanPhone && cleanPhone.length >= 10) {
          window.location.href = `tel:${cleanPhone}`;
        } else {
          alert('Invalid phone number format. Please contact support.');
        }
      } else {
        alert('Technician contact information is not available. Please use the chat feature to contact them.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-success bg-success/10';
      case 'in_progress':
        return 'text-primary bg-primary/10';
      case 'completed':
        return 'text-success bg-success/10';
      case 'cancelled':
        return 'text-error bg-error/10';
      default:
        return 'text-text-secondary bg-muted';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Scheduled';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '—';
    return date?.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '—';
    const date = new Date(`2000-01-01T${timeString}`);
    if (Number.isNaN(date.getTime())) return '—';
    return date?.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const budgetLabel = booking?.formattedBudget || formatCurrencyINR(booking?.budget);

  return (
    <div className="bg-surface border-b border-border">
      <div className="p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Calendar" size={20} className="text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-text-primary">Booking #{booking?.id}</h4>
              <p className="text-sm text-text-secondary">
                {booking?.serviceType} • {formatDate(booking?.scheduledDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                booking?.status
              )}`}
            >
              {getStatusText(booking?.status)}
            </span>
            <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-text-secondary" />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border bg-muted/30">
          {/* Service Details & Schedule Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {/* Service Details Card */}
            <div className="bg-surface rounded-lg p-4 border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Wrench" size={16} className="text-primary" />
                </div>
                <h5 className="text-sm font-semibold text-text-primary">Service Details</h5>
              </div>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-text-secondary font-medium">Service</span>
                  <span className="text-sm text-text-primary font-medium text-right flex-1">
                    {booking?.serviceType || '—'}
                  </span>
                </div>
                <div className="h-px bg-border"></div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-text-secondary font-medium">Category</span>
                  <span className="text-sm text-text-primary text-right flex-1 capitalize">
                    {booking?.category?.replace(/_/g, ' ') || '—'}
                  </span>
                </div>
                <div className="h-px bg-border"></div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-text-secondary font-medium">Priority</span>
                  <span
                    className={`text-sm font-semibold text-right flex-1 ${
                      booking?.priority === 'urgent'
                        ? 'text-error'
                        : booking?.priority === 'high'
                        ? 'text-warning'
                        : 'text-text-primary'
                    }`}
                  >
                    {booking?.priority ? (
                      <span className="inline-flex items-center gap-1">
                        {booking?.priority === 'urgent' && <Icon name="AlertCircle" size={12} />}
                        {capitalize(booking?.priority)}
                      </span>
                    ) : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Schedule & Budget Card */}
            <div className="bg-surface rounded-lg p-4 border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Clock" size={16} className="text-primary" />
                </div>
                <h5 className="text-sm font-semibold text-text-primary">Schedule & Budget</h5>
              </div>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-text-secondary font-medium">Date</span>
                  <span className="text-sm text-text-primary font-medium text-right flex-1">
                    {formatDate(booking?.scheduledDate)}
                  </span>
                </div>
                <div className="h-px bg-border"></div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-text-secondary font-medium">Time</span>
                  <span className="text-sm text-text-primary text-right flex-1">
                    {formatTime(booking?.scheduledTime)}
                  </span>
                </div>
                <div className="h-px bg-border"></div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-text-secondary font-medium">Budget</span>
                  <span className="text-sm text-text-primary font-semibold text-right flex-1 text-primary">
                    {budgetLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description Card */}
          {booking?.description && (
            <div className="bg-surface rounded-lg p-4 border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="FileText" size={16} className="text-primary" />
                </div>
                <h5 className="text-sm font-semibold text-text-primary">Description</h5>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                  {showFullDescription || booking?.description?.length <= 150
                    ? booking?.description
                    : `${booking?.description?.substring(0, 150)}...`}
                </p>
                {booking?.description?.length > 150 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFullDescription((prev) => !prev);
                    }}
                    className="mt-2 p-0 h-auto text-primary hover:text-primary/80 font-medium"
                  >
                    {showFullDescription ? 'Show less' : 'Show more'}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Service Location Card */}
          <div className="bg-surface rounded-lg p-4 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="MapPin" size={16} className="text-primary" />
              </div>
              <h5 className="text-sm font-semibold text-text-primary">Service Location</h5>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="MapPin" size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary font-semibold mb-1 break-words">
                    {booking?.location?.address || booking?.locationAddress || 'Current location'}
                  </p>
                  {([booking?.location?.city, booking?.location?.state, booking?.location?.postalCode].filter(Boolean).length > 0) && (
                    <p className="text-xs text-text-secondary">
                      {[booking?.location?.city, booking?.location?.state, booking?.location?.postalCode]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleViewLocation();
              }}
              type="button"
              className="w-full justify-center"
            >
              <Icon name="MapPin" size={16} className="mr-2" />
              View Location
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleReschedule();
              }}
              type="button"
              className="w-full justify-center"
            >
              <Icon name="Calendar" size={16} className="mr-2" />
              Reschedule
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCall();
              }}
              type="button"
              className="w-full justify-center"
            >
              <Icon name="Phone" size={16} className="mr-2" />
              Call
            </Button>
          </div>
          {booking?.status === 'in_progress' && (
            <Button 
              variant="default" 
              size="sm"
              className="w-full"
            >
              <Icon name="CheckCircle" size={16} className="mr-2" />
              Mark Complete
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const capitalize = (value) => {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export default BookingContextPanel;