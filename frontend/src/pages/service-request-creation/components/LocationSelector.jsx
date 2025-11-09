import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LocationSelector = ({ currentLocation, onLocationChange }) => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [tempLocation, setTempLocation] = useState(currentLocation);

  const handleLocationSave = () => {
    onLocationChange(tempLocation);
    setShowLocationModal(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Service Location</h3>
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="MapPin" size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Current Location</p>
              <p className="text-sm text-muted-foreground mt-1">{currentLocation}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLocationModal(true)}
            iconName="Edit"
            iconPosition="left"
          >
            Change
          </Button>
        </div>

        {/* Map Preview */}
        <div className="w-full h-48 bg-muted rounded-lg overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            loading="lazy"
            title="Service Location"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=12.9716,77.5946&z=15&output=embed"
            className="border-0"
          />
        </div>
      </div>
      {/* Location Change Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">Change Service Location</h4>
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="p-2 hover:bg-muted rounded-md trust-transition"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Search Location
                  </label>
                  <div className="relative">
                    <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={tempLocation}
                      onChange={(e) => setTempLocation(e?.target?.value)}
                      placeholder="Enter address or landmark"
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Saved Addresses</p>
                  {[
                    "Home - 123 MG Road, Bangalore, Karnataka 560001",
                    "Office - Tech Park, Electronic City, Bangalore 560100"
                  ]?.map((address, index) => (
                    <button
                      key={index}
                      onClick={() => setTempLocation(address)}
                      className="w-full text-left p-3 border border-border rounded-md hover:bg-muted trust-transition"
                    >
                      <div className="flex items-center space-x-2">
                        <Icon name={index === 0 ? "Home" : "Building"} size={16} className="text-muted-foreground" />
                        <span className="text-sm">{address}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowLocationModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleLocationSave}
                    className="flex-1"
                  >
                    Save Location
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;