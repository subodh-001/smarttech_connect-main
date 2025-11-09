import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const CancelBookingModal = ({ booking, isOpen, onClose, onConfirm }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  if (!isOpen || !booking) return null;

  const cancellationReasons = [
    'Schedule conflict',
    'Found alternative service',
    'Emergency situation',
    'Service no longer needed',
    'Technician unavailable',
    'Price concerns',
    'Other'
  ];

  const handleConfirm = async () => {
    if (!selectedReason || !agreedToPolicy) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onConfirm({
        bookingId: booking?.id,
        reason: selectedReason === 'Other' ? customReason : selectedReason
      });
      setIsLoading(false);
      onClose();
      // Reset form
      setSelectedReason('');
      setCustomReason('');
      setAgreedToPolicy(false);
    }, 1500);
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    setAgreedToPolicy(false);
    onClose();
  };

  // Calculate refund amount based on cancellation timing
  const getRefundInfo = () => {
    const now = new Date();
    const scheduledDateTime = new Date(`${booking.scheduledDate}T${booking.scheduledTime}`);
    const hoursUntilService = (scheduledDateTime - now) / (1000 * 60 * 60);
    
    if (hoursUntilService > 24) {
      return { amount: booking?.price, percentage: 100 };
    } else if (hoursUntilService > 2) {
      return { amount: (booking?.price * 0.8)?.toFixed(2), percentage: 80 };
    } else {
      return { amount: 0, percentage: 0 };
    }
  };

  const refundInfo = getRefundInfo();

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-elevated max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Cancel Booking</h2>
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
        <div className="p-6 space-y-4">
          {/* Booking Details */}
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-medium text-text-primary mb-2">Booking Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Icon name="Calendar" size={16} className="text-text-secondary" />
                <span className="text-text-primary">{booking?.scheduledDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Clock" size={16} className="text-text-secondary" />
                <span className="text-text-primary">{booking?.scheduledTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="DollarSign" size={16} className="text-text-secondary" />
                <span className="text-text-primary">${booking?.price}</span>
              </div>
            </div>
          </div>

          {/* Refund Information */}
          <div className={`rounded-lg p-4 border ${
            refundInfo?.percentage > 0 
              ? 'bg-success/10 border-success/20' :'bg-error/10 border-error/20'
          }`}>
            <div className="flex items-start gap-2">
              <Icon 
                name={refundInfo?.percentage > 0 ? "CheckCircle" : "AlertCircle"} 
                size={16} 
                className={`mt-0.5 ${refundInfo?.percentage > 0 ? 'text-success' : 'text-error'}`}
              />
              <div className="text-sm">
                <p className="font-medium text-text-primary mb-1">Refund Information</p>
                <p className="text-text-secondary">
                  You will receive <span className="font-medium">${refundInfo?.amount}</span> ({refundInfo?.percentage}% refund)
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  Refund will be processed within 3-5 business days
                </p>
              </div>
            </div>
          </div>

          {/* Cancellation Reason */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Reason for Cancellation *
            </label>
            <div className="space-y-2">
              {cancellationReasons?.map((reason) => (
                <label key={reason} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="cancellationReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e?.target?.value)}
                    className="w-4 h-4 text-primary border-border focus:ring-primary"
                  />
                  <span className="text-sm text-text-primary">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Reason */}
          {selectedReason === 'Other' && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Please specify
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e?.target?.value)}
                placeholder="Please provide details..."
                className="w-full p-3 border border-border rounded-md text-sm text-text-primary bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
                required
              />
            </div>
          )}

          {/* Policy Agreement */}
          <div className="space-y-3">
            <Checkbox
              checked={agreedToPolicy}
              onChange={(e) => setAgreedToPolicy(e?.target?.checked)}
              label="I understand the cancellation policy and refund terms"
              required
            />
          </div>

          {/* Warning */}
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-text-primary mb-1">Important Notice</p>
                <p className="text-text-secondary">
                  Cancelling this booking will notify the technician immediately. 
                  This action cannot be undone.
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
            Keep Booking
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!selectedReason || !agreedToPolicy || (selectedReason === 'Other' && !customReason?.trim()) || isLoading}
            loading={isLoading}
            className="flex-1"
          >
            Cancel Booking
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal;