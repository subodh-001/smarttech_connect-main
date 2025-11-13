import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { formatTechnicianName } from '../../../utils/formatTechnicianName';

const RatingModal = ({ booking, isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [selectedAspects, setSelectedAspects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !booking) return null;

  const ratingAspects = [
    { id: 'punctuality', label: 'Punctuality', icon: 'Clock' },
    { id: 'quality', label: 'Work Quality', icon: 'Award' },
    { id: 'professionalism', label: 'Professionalism', icon: 'User' },
    { id: 'communication', label: 'Communication', icon: 'MessageCircle' },
    { id: 'cleanliness', label: 'Cleanliness', icon: 'Sparkles' },
    { id: 'pricing', label: 'Fair Pricing', icon: 'DollarSign' }
  ];

  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  const handleAspectToggle = (aspectId) => {
    setSelectedAspects(prev => 
      prev?.includes(aspectId)
        ? prev?.filter(id => id !== aspectId)
        : [...prev, aspectId]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      await onSubmit?.({
        bookingId: booking?.id,
        rating,
        review,
        aspects: selectedAspects,
      });
      handleClose();
    } catch (err) {
      setError(err?.message || 'Failed to submit rating. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setReview('');
    setSelectedAspects([]);
    setError(null);
    onClose?.();
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Rate this service';
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-elevated max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Rate Your Service</h2>
            <p className="text-sm text-text-secondary">#{booking?.id} - {booking?.service}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Technician Info */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <Image
              src={booking?.technician?.avatar}
              alt={booking?.technician?.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h3 className="font-medium text-text-primary">
                {formatTechnicianName(booking?.technician)}
              </h3>
              {booking?.technician?.email && (
                <p className="text-xs text-text-secondary mt-0.5">
                  {booking?.technician?.email}
                </p>
              )}
              {booking?.technician?.specialization && (
                <p className="text-sm text-text-secondary mt-1">
                  {booking?.technician?.specialization}
                </p>
              )}
            </div>
          </div>

          {error ? (
            <div className="rounded-md border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
              {error}
            </div>
          ) : null}

          {/* Star Rating */}
          <div className="text-center">
            <h3 className="font-medium text-text-primary mb-2">Overall Rating</h3>
            <div className="flex justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5]?.map((star) => (
                <button
                  key={star}
                  onClick={() => handleStarClick(star)}
                  className="p-1 transition-smooth hover:scale-110"
                >
                  <Icon
                    name="Star"
                    size={32}
                    className={`${
                      star <= rating
                        ? 'text-warning fill-current' :'text-border hover:text-warning/50'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-text-secondary">{getRatingText(rating)}</p>
          </div>

          {/* Rating Aspects */}
          {rating > 0 && (
            <div>
              <h3 className="font-medium text-text-primary mb-3">What did you like? (Optional)</h3>
              <div className="grid grid-cols-2 gap-2">
                {ratingAspects?.map((aspect) => (
                  <button
                    key={aspect?.id}
                    onClick={() => handleAspectToggle(aspect?.id)}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-sm transition-smooth ${
                      selectedAspects?.includes(aspect?.id)
                        ? 'bg-primary/10 border-primary text-primary' :'bg-background border-border text-text-primary hover:border-primary/50'
                    }`}
                  >
                    <Icon name={aspect?.icon} size={16} />
                    <span>{aspect?.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Written Review */}
          {rating > 0 && (
            <div>
              <Input
                type="text"
                label="Write a Review (Optional)"
                placeholder="Share your experience with other users..."
                value={review}
                onChange={(e) => setReview(e?.target?.value)}
                description="Your review will help other users make better decisions"
              />
            </div>
          )}

          {/* Service Summary */}
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-medium text-text-primary mb-2">Service Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Service Date:</span>
                <span className="text-text-primary">{booking?.scheduledDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Duration:</span>
                <span className="text-text-primary">{booking?.duration || '2 hours'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Total Cost:</span>
                <span className="text-text-primary font-medium">
                  ₹{Number(booking?.price || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Icon name="Shield" size={16} className="text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-text-primary mb-1">Privacy Notice</p>
                <p className="text-text-secondary">
                  Your review will be visible to other users. Personal information will not be shared.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={isLoading}
          >
            Skip for Now
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={rating === 0 || isLoading}
            loading={isLoading}
            className="flex-1"
          >
            Submit Rating
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;