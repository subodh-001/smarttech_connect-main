import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const StatusControlPanel = ({
  isAvailable,
  onToggleAvailability,
  currentLocation,
  workingHours,
  onUpdateLocation,
  onUpdateWorkingHours,
  availabilityDisabled = false,
  availabilityDisabledReason = '',
}) => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showHoursModal, setShowHoursModal] = useState(false);

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-subtle">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Status Control</h2>
        <div className="flex items-center space-x-2">
          <span className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-success' : 'bg-error'}`}></span>
          <span className="text-sm font-medium text-text-secondary">
            {isAvailable ? 'Available' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Availability Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-3">
            <Icon name="Power" size={20} color={isAvailable ? 'var(--color-success)' : 'var(--color-error)'} />
            <div>
              <p className="font-medium text-text-primary">Availability Status</p>
              <p className="text-sm text-text-secondary">
                {isAvailable ? 'You are accepting new jobs' : 'You are not accepting new jobs'}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button
              variant={isAvailable ? 'destructive' : 'success'}
              onClick={onToggleAvailability}
              className="min-w-24"
              disabled={availabilityDisabled}
            >
              {isAvailable ? 'Go Offline' : 'Go Online'}
            </Button>
            {availabilityDisabled && availabilityDisabledReason ? (
              <p className="max-w-xs text-right text-xs text-text-secondary">{availabilityDisabledReason}</p>
            ) : null}
          </div>
        </div>

        {/* Current Location */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-3">
            <Icon name="MapPin" size={20} color="var(--color-primary)" />
            <div>
              <p className="font-medium text-text-primary">Current Location</p>
              <p className="text-sm text-text-secondary">{currentLocation}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLocationModal(true)}
          >
            Update
          </Button>
        </div>

        {/* Working Hours */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-3">
            <Icon name="Clock" size={20} color="var(--color-accent)" />
            <div>
              <p className="font-medium text-text-primary">Working Hours</p>
              <p className="text-sm text-text-secondary">{workingHours}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHoursModal(true)}
          >
            Edit
          </Button>
        </div>

        {/* Job Matching Status */}
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center space-x-3">
            <Icon name="Target" size={20} color="var(--color-primary)" />
            <div>
              <p className="font-medium text-primary">Real-time Matching Active</p>
              <p className="text-sm text-primary/80">
                Receiving job requests based on your location and skills
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusControlPanel;