import React from 'react';

import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const RecentBookingCard = ({ booking }) => {
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
              src={booking?.technician?.avatar}
              alt={booking?.technician?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="font-medium text-foreground">{booking?.technician?.name}</h4>
            <p className="text-sm text-muted-foreground">{booking?.category}</p>
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
            >
              Rebook
            </Button>
            <Button
              variant="ghost"
              size="sm"
              iconName="Eye"
              iconPosition="left"
              className="flex-1"
            >
              Details
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default RecentBookingCard;