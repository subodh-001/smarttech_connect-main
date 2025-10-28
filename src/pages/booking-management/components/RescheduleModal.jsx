import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const RescheduleModal = ({ booking, isOpen, onClose, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !booking) return null;

  // Mock available time slots
  const availableTimeSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onConfirm({
        bookingId: booking?.id,
        newDate: selectedDate,
        newTime: selectedTime,
        reason: reason
      });
      setIsLoading(false);
      onClose();
      // Reset form
      setSelectedDate('');
      setSelectedTime('');
      setReason('');
    }, 1500);
  };

  const handleClose = () => {
    setSelectedDate('');
    setSelectedTime('');
    setReason('');
    onClose();
  };

  // Get minimum date (today)
  const today = new Date()?.toISOString()?.split('T')?.[0];
  
  // Get maximum date (30 days from now)
  const maxDate = new Date();
  maxDate?.setDate(maxDate?.getDate() + 30);
  const maxDateString = maxDate?.toISOString()?.split('T')?.[0];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-elevated max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Reschedule Booking</h2>
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
          {/* Current Schedule */}
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-medium text-text-primary mb-2">Current Schedule</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Icon name="Calendar" size={16} className="text-text-secondary" />
                <span className="text-text-primary">{booking?.scheduledDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Clock" size={16} className="text-text-secondary" />
                <span className="text-text-primary">{booking?.scheduledTime}</span>
              </div>
            </div>
          </div>

          {/* New Schedule */}
          <div className="space-y-4">
            <h3 className="font-medium text-text-primary">Select New Schedule</h3>
            
            <Input
              type="date"
              label="New Date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e?.target?.value)}
              min={today}
              max={maxDateString}
              required
            />

            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Available Time Slots
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimeSlots?.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-2 text-sm rounded-md border transition-smooth ${
                        selectedTime === time
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:border-primary text-text-primary'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Input
              type="text"
              label="Reason for Rescheduling (Optional)"
              placeholder="e.g., Schedule conflict, emergency, etc."
              value={reason}
              onChange={(e) => setReason(e?.target?.value)}
            />
          </div>

          {/* Reschedule Policy */}
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-text-primary mb-1">Reschedule Policy</p>
                <ul className="text-text-secondary space-y-1">
                  <li>• Free rescheduling up to 2 hours before appointment</li>
                  <li>• $5 fee for rescheduling within 2 hours</li>
                  <li>• Maximum 2 reschedules per booking</li>
                </ul>
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
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime || isLoading}
            loading={isLoading}
            className="flex-1"
          >
            Confirm Reschedule
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;