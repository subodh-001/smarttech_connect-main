import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const TechnicianCard = ({
  technician,
  onViewProfile,
  onSendMessage,
  onBookNow,
  onCompare,
  isSelected,
  isBooking = false,
}) => {
  const [showCounterOffer, setShowCounterOffer] = useState(false);
  const [counterOfferAmount, setCounterOfferAmount] = useState('');

  const handleCounterOffer = () => {
    if (counterOfferAmount) {
      console.log(`Counter offer of ₹${counterOfferAmount} sent to ${technician?.name}`);
      setShowCounterOffer(false);
      setCounterOfferAmount('');
    }
  };

  const getAvailabilityColor = (status) => {
    switch (status) {
      case 'available': return 'text-success';
      case 'busy': return 'text-warning';
      case 'offline': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getAvailabilityText = (status) => {
    switch (status) {
      case 'available': return 'Available Now';
      case 'busy': return 'Busy';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  return (
    <div className={`bg-card border rounded-lg p-4 trust-shadow hover:trust-shadow-md trust-transition ${
      isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Image
              src={technician?.avatar}
              alt={technician?.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            {technician?.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                <Icon name="Check" size={10} color="white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-foreground truncate">{technician?.name}</h3>
              {technician?.badges?.map((badge, index) => (
                <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                  {badge}
                </span>
              ))}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center space-x-1">
                <Icon name="Star" size={12} className="text-warning fill-current" />
                <span className="text-sm font-medium text-foreground">{technician?.rating}</span>
                <span className="text-xs text-muted-foreground">({technician?.reviewCount})</span>
              </div>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{technician?.experience} exp</span>
            </div>
          </div>
        </div>
        
        {/* Compare Checkbox */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`compare-${technician?.id}`}
            checked={isSelected}
            onChange={() => onCompare(technician)}
            className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
          />
          <label htmlFor={`compare-${technician?.id}`} className="text-xs text-muted-foreground">
            Compare
          </label>
        </div>
      </div>
      {/* Specializations */}
      <div className="mb-3">
        <div className="flex flex-wrap gap-1">
          {technician?.specializations?.slice(0, 3)?.map((spec, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground">
              {spec}
            </span>
          ))}
          {technician?.specializations?.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground">
              +{technician?.specializations?.length - 3} more
            </span>
          )}
        </div>
      </div>
      {/* Location & Availability */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Icon name="MapPin" size={14} />
            <span>{technician?.distance}</span>
          </div>
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Icon name="Clock" size={14} />
            <span>ETA: {technician?.eta}</span>
          </div>
        </div>
        <div className={`flex items-center space-x-1 text-sm ${getAvailabilityColor(technician?.availability)}`}>
          <div className={`w-2 h-2 rounded-full ${
            technician?.availability === 'available' ? 'bg-success' : 
            technician?.availability === 'busy' ? 'bg-warning' : 'bg-muted-foreground'
          }`}></div>
          <span>{getAvailabilityText(technician?.availability)}</span>
        </div>
      </div>
      {/* Pricing */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold text-foreground">
            ₹
            {Number.isFinite(technician?.priceWithSurge)
              ? technician.priceWithSurge.toLocaleString('en-IN')
              : Number.isFinite(technician?.hourlyRate)
              ? technician.hourlyRate.toLocaleString('en-IN')
              : technician?.hourlyRate}
          </span>
          <span className="text-sm text-muted-foreground">/hour</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Icon name="Clock" size={12} />
            <span>Responds in {technician?.responseTime}</span>
          </div>
        </div>
      </div>
      {/* Recent Review */}
      {technician?.recentReview && (
        <div className="mb-4 p-3 bg-muted/50 rounded-md">
          <div className="flex items-center space-x-2 mb-1">
            <div className="flex items-center space-x-1">
              {[...Array(5)]?.map((_, i) => (
                <Icon
                  key={i}
                  name="Star"
                  size={10}
                  className={i < technician?.recentReview?.rating ? 'text-warning fill-current' : 'text-muted-foreground'}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">by {technician?.recentReview?.customerName}</span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{technician?.recentReview?.comment}</p>
        </div>
      )}
      {/* Counter Offer Section */}
      {showCounterOffer && (
        <div className="mb-4 p-3 border border-border rounded-md bg-muted/30">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="MessageSquare" size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">Send Counter Offer</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 flex-1">
              <Icon name="IndianRupee" size={14} className="text-muted-foreground" />
              <input
                type="number"
                value={counterOfferAmount}
                onChange={(e) => setCounterOfferAmount(e?.target?.value)}
                placeholder="Enter amount"
                className="flex-1 px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <span className="text-xs text-muted-foreground">/hour</span>
            </div>
            <Button size="sm" onClick={handleCounterOffer}>
              Send
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowCounterOffer(false)}>
              <Icon name="X" size={14} />
            </Button>
          </div>
        </div>
      )}
      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewProfile(technician)}
          className="flex-1"
        >
          View Profile
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSendMessage(technician)}
          iconName="MessageCircle"
        >
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCounterOffer(!showCounterOffer)}
          iconName="DollarSign"
        >
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => onBookNow(technician)}
          disabled={technician?.availability !== 'available' || isBooking}
          className="flex-1"
        >
          {isBooking
            ? 'Sending...'
            : technician?.availability === 'available'
            ? 'Request Booking'
            : 'Unavailable'}
        </Button>
      </div>
    </div>
  );
};

export default TechnicianCard;