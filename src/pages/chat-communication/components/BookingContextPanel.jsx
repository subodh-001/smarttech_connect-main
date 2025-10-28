import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BookingContextPanel = ({ booking, isExpanded, onToggle }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  if (!booking) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-success bg-success/10';
      case 'in_progress': return 'text-primary bg-primary/10';
      case 'completed': return 'text-success bg-success/10';
      case 'cancelled': return 'text-error bg-error/10';
      default: return 'text-text-secondary bg-muted';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return 'Pending';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`)?.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="bg-surface border-b border-border">
      {/* Collapsed Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Calendar" size={20} className="text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-text-primary">
                Booking #{booking?.id}
              </h4>
              <p className="text-sm text-text-secondary">
                {booking?.serviceType} • {formatDate(booking?.scheduledDate)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking?.status)}`}>
              {getStatusText(booking?.status)}
            </span>
            <Icon 
              name={isExpanded ? "ChevronUp" : "ChevronDown"} 
              size={16} 
              className="text-text-secondary"
            />
          </div>
        </div>
      </div>
      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border bg-muted/30">
          {/* Service Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div>
              <h5 className="text-sm font-medium text-text-primary mb-2">Service Details</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Service:</span>
                  <span className="text-sm text-text-primary font-medium">
                    {booking?.serviceType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Category:</span>
                  <span className="text-sm text-text-primary">
                    {booking?.category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Priority:</span>
                  <span className={`text-sm font-medium ${
                    booking?.priority === 'urgent' ? 'text-error' : 
                    booking?.priority === 'high' ? 'text-warning' : 'text-text-primary'
                  }`}>
                    {booking?.priority?.charAt(0)?.toUpperCase() + booking?.priority?.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-text-primary mb-2">Schedule & Location</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Date:</span>
                  <span className="text-sm text-text-primary font-medium">
                    {formatDate(booking?.scheduledDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Time:</span>
                  <span className="text-sm text-text-primary">
                    {formatTime(booking?.scheduledTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Budget:</span>
                  <span className="text-sm text-text-primary font-medium">
                    ${booking?.budget}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {booking?.description && (
            <div>
              <h5 className="text-sm font-medium text-text-primary mb-2">Description</h5>
              <div className="bg-surface rounded-lg p-3">
                <p className="text-sm text-text-primary leading-relaxed">
                  {showFullDescription || booking?.description?.length <= 150
                    ? booking?.description
                    : `${booking?.description?.substring(0, 150)}...`
                  }
                </p>
                {booking?.description?.length > 150 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-2 p-0 h-auto text-primary hover:text-primary/80"
                  >
                    {showFullDescription ? 'Show less' : 'Show more'}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Location */}
          <div>
            <h5 className="text-sm font-medium text-text-primary mb-2">Service Location</h5>
            <div className="bg-surface rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Icon name="MapPin" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-text-primary font-medium">
                    {booking?.location?.address}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    {booking?.location?.city}, {booking?.location?.state} {booking?.location?.zipCode}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" size="sm">
              <Icon name="MapPin" size={14} className="mr-2" />
              View Location
            </Button>
            <Button variant="outline" size="sm">
              <Icon name="Calendar" size={14} className="mr-2" />
              Reschedule
            </Button>
            <Button variant="outline" size="sm">
              <Icon name="Phone" size={14} className="mr-2" />
              Call
            </Button>
            {booking?.status === 'in_progress' && (
              <Button variant="default" size="sm">
                <Icon name="CheckCircle" size={14} className="mr-2" />
                Mark Complete
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingContextPanel;