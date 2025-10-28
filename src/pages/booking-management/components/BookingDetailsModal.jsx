import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const BookingDetailsModal = ({ booking, isOpen, onClose, onTrack, onReschedule, onCancel, onContact }) => {
  if (!isOpen || !booking) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time?.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-success text-success-foreground';
      case 'upcoming':
        return 'bg-primary text-primary-foreground';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      case 'cancelled':
        return 'bg-error text-error-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">{booking?.service}</h2>
            <p className="text-sm text-text-secondary">Booking ID: #{booking?.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking?.status)}`}>
              {booking?.status}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Technician Information */}
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-medium text-text-primary mb-3">Technician Details</h3>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Image
                  src={booking?.technician?.avatar}
                  alt={booking?.technician?.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                {booking?.technician?.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-text-primary">{booking?.technician?.name}</h4>
                <div className="flex items-center gap-2 text-sm text-text-secondary mb-1">
                  <div className="flex items-center gap-1">
                    <Icon name="Star" size={14} className="text-warning fill-current" />
                    <span>{booking?.technician?.rating}</span>
                  </div>
                  <span>•</span>
                  <span>{booking?.technician?.experience} years experience</span>
                </div>
                <p className="text-sm text-text-secondary">{booking?.technician?.specialization}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onContact(booking)}
              >
                <Icon name="MessageCircle" size={16} className="mr-2" />
                Contact
              </Button>
            </div>
          </div>

          {/* Service Details */}
          <div>
            <h3 className="font-medium text-text-primary mb-3">Service Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon name="Calendar" size={16} className="text-text-secondary" />
                  <div>
                    <p className="text-sm text-text-secondary">Date</p>
                    <p className="font-medium text-text-primary">{formatDate(booking?.scheduledDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Clock" size={16} className="text-text-secondary" />
                  <div>
                    <p className="text-sm text-text-secondary">Time</p>
                    <p className="font-medium text-text-primary">{formatTime(booking?.scheduledTime)}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon name="DollarSign" size={16} className="text-text-secondary" />
                  <div>
                    <p className="text-sm text-text-secondary">Price</p>
                    <p className="font-medium text-text-primary">${booking?.price}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Tag" size={16} className="text-text-secondary" />
                  <div>
                    <p className="text-sm text-text-secondary">Category</p>
                    <p className="font-medium text-text-primary">{booking?.category}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="font-medium text-text-primary mb-3">Service Location</h3>
            <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
              <Icon name="MapPin" size={16} className="text-text-secondary mt-1" />
              <div>
                <p className="font-medium text-text-primary">{booking?.address}</p>
                <p className="text-sm text-text-secondary">{booking?.fullAddress}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-medium text-text-primary mb-3">Service Description</h3>
            <p className="text-text-secondary bg-muted p-3 rounded-lg">{booking?.description}</p>
          </div>

          {/* Special Instructions */}
          {booking?.specialInstructions && (
            <div>
              <h3 className="font-medium text-text-primary mb-3">Special Instructions</h3>
              <p className="text-text-secondary bg-muted p-3 rounded-lg">{booking?.specialInstructions}</p>
            </div>
          )}

          {/* Progress for Active Bookings */}
          {booking?.status === 'active' && (
            <div>
              <h3 className="font-medium text-text-primary mb-3">Service Progress</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Progress</span>
                  <span className="text-primary font-medium">{booking?.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className="bg-primary h-3 rounded-full transition-all duration-300"
                    style={{ width: `${booking?.progress}%` }}
                  ></div>
                </div>
                {booking?.eta && (
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Navigation" size={16} className="text-primary" />
                    <span className="text-text-primary">
                      Estimated arrival: <span className="font-medium">{booking?.eta}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Booking History */}
          <div>
            <h3 className="font-medium text-text-primary mb-3">Booking Timeline</h3>
            <div className="space-y-3">
              {booking?.timeline?.map((event, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{event?.title}</p>
                    <p className="text-xs text-text-secondary">{event?.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 p-6 border-t border-border">
          {booking?.status === 'active' && (
            <>
              <Button
                variant="default"
                onClick={() => onTrack(booking)}
                iconName="MapPin"
                iconPosition="left"
                className="flex-1 sm:flex-none"
              >
                Track Technician
              </Button>
              <Button
                variant="outline"
                onClick={() => onCancel(booking)}
                iconName="X"
                iconPosition="left"
                className="flex-1 sm:flex-none"
              >
                Cancel Booking
              </Button>
            </>
          )}

          {booking?.status === 'upcoming' && (
            <>
              <Button
                variant="default"
                onClick={() => onReschedule(booking)}
                iconName="Calendar"
                iconPosition="left"
                className="flex-1 sm:flex-none"
              >
                Reschedule
              </Button>
              <Button
                variant="outline"
                onClick={() => onCancel(booking)}
                iconName="X"
                iconPosition="left"
                className="flex-1 sm:flex-none"
              >
                Cancel Booking
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 sm:flex-none"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;