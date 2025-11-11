import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const BookingCard = ({ booking, onTrack, onReschedule, onCancel, onContact, onRate, onViewDetails }) => {
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

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '—';
    const time = new Date(`2000-01-01T${timeString}`);
    if (Number.isNaN(time.getTime())) return '—';
    return time.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '₹0';
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(Number(value) || 0);
    } catch {
      return `₹${value}`;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-subtle hover:shadow-elevated transition-smooth">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-text-primary">{booking?.service}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking?.status)}`}>
              {booking?.status}
            </span>
          </div>
          <p className="text-sm text-text-secondary">Booking ID: #{booking?.id}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onViewDetails(booking)}
          className="text-text-secondary hover:text-text-primary"
        >
          <Icon name="MoreVertical" size={20} />
        </Button>
      </div>
      {/* Technician Info */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-muted rounded-lg">
        <div className="relative">
          <Image
            src={booking?.technician?.avatar}
            alt={booking?.technician?.name || 'Technician'}
            className="w-12 h-12 rounded-full object-cover"
          />
          {booking?.technician?.isOnline ? (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white"></div>
          ) : null}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-text-primary">
            {booking?.technician?.name || 'Awaiting assignment'}
          </h4>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <div className="flex items-center gap-1">
              <Icon name="Star" size={14} className="text-warning fill-current" />
              <span>{booking?.technician?.rating ?? '—'}</span>
            </div>
            {booking?.technician?.experience != null && (
              <>
                <span>•</span>
                <span>{booking?.technician?.experience} years exp</span>
              </>
            )}
          </div>
        </div>
        {onContact && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onContact(booking)}
            className="text-primary hover:text-primary/80"
          >
            <Icon name="MessageCircle" size={16} className="mr-1" />
            Chat
          </Button>
        )}
      </div>
      {/* Schedule Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Icon name="Calendar" size={16} className="text-text-secondary" />
          <span className="text-text-primary">{formatDate(booking?.scheduledDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Icon name="Clock" size={16} className="text-text-secondary" />
          <span className="text-text-primary">{formatTime(booking?.scheduledTime)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Icon name="MapPin" size={16} className="text-text-secondary" />
          <span className="text-text-primary truncate">{booking?.address}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Icon name="DollarSign" size={16} className="text-text-secondary" />
          <span className="text-text-primary font-medium">
            {formatCurrency(booking?.price)}
          </span>
        </div>
      </div>
      {/* Progress Bar for Active Bookings */}
      {booking?.status === 'active' && typeof booking?.progress === 'number' && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-text-secondary">Progress</span>
            <span className="text-primary font-medium">{booking?.progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${booking?.progress}%` }}
            ></div>
          </div>
        </div>
      )}
      {/* ETA for Active Bookings */}
      {booking?.status === 'active' && booking?.eta && (
        <div className="mb-4 p-3 bg-primary/10 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Icon name="Navigation" size={16} className="text-primary" />
            <span className="text-text-primary">
              Technician arriving in <span className="font-medium">{booking?.eta}</span>
            </span>
          </div>
        </div>
      )}
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {booking?.status === 'active' && (
          <>
            <Button
              variant="default"
              size="sm"
              onClick={() => onTrack(booking)}
              iconName="MapPin"
              iconPosition="left"
              className="flex-1 sm:flex-none"
            >
              Track
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancel(booking)}
              iconName="X"
              iconPosition="left"
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
          </>
        )}

        {booking?.status === 'upcoming' && (
          <>
            <Button
              variant="default"
              size="sm"
              onClick={() => onReschedule(booking)}
              iconName="Calendar"
              iconPosition="left"
              className="flex-1 sm:flex-none"
            >
              Reschedule
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancel(booking)}
              iconName="X"
              iconPosition="left"
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
          </>
        )}

        {booking?.status === 'completed' && !booking?.isRated && (
          <Button
            variant="default"
            size="sm"
            onClick={() => onRate(booking)}
            iconName="Star"
            iconPosition="left"
            className="flex-1 sm:flex-none"
          >
            Rate Service
          </Button>
        )}

        {booking?.status === 'completed' && booking?.isRated && (
          <div className="flex items-center gap-1 text-sm text-text-secondary">
            <Icon name="Star" size={14} className="text-warning fill-current" />
            <span>Rated {booking?.userRating}/5</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCard;