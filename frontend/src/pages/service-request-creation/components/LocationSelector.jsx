import React, { useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import InteractiveMap from '../../../components/maps/InteractiveMap';

const coordinatePresets = {
  "Home - 123 MG Road, Bangalore, Karnataka 560001": { lat: 12.9823, lng: 77.6070 },
  "Office - Tech Park, Electronic City, Bangalore 560100": { lat: 12.8396, lng: 77.6783 },
};

const LocationSelector = ({
  currentLocation,
  coordinates,
  onLocationChange,
  onCoordinatesChange,
  onUseCurrentLocation,
}) => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [tempLocation, setTempLocation] = useState(currentLocation);

  React.useEffect(() => {
    setTempLocation(currentLocation);
  }, [currentLocation]);

  const handleLocationSave = () => {
    onLocationChange(tempLocation);
    const preset = coordinatePresets[tempLocation];
    if (preset && onCoordinatesChange) {
      onCoordinatesChange(preset);
    }
    setShowLocationModal(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Service Location</h3>
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="MapPin" size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Current Location</p>
              <p className="text-sm text-muted-foreground mt-1">{currentLocation}</p>
              {coordinates ? (
                <p className="text-xs text-muted-foreground mt-1">
                  Lat {coordinates.lat.toFixed(4)}, Lng {coordinates.lng.toFixed(4)}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (onUseCurrentLocation) {
                  onUseCurrentLocation();
                }
              }}
              iconName="Navigation"
              iconPosition="left"
            >
              Use Current
            </Button>
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
        </div>

        {/* Map Preview */}
        <div className="w-full h-48 overflow-hidden rounded-lg border border-border bg-muted/40">
          <InteractiveMap
            markers={useMemo(
              () => [
                {
                  id: 'selector-location',
                  type: 'destination',
                  position: [coordinates?.lat ?? 12.9716, coordinates?.lng ?? 77.5946],
                  accent: '#2563eb',
                },
              ],
              [coordinates],
            )}
            fitToMarkers={false}
            center={[coordinates?.lat ?? 12.9716, coordinates?.lng ?? 77.5946]}
            zoom={14}
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
                      onClick={() => {
                        setTempLocation(address);
                        if (coordinatePresets[address] && onCoordinatesChange) {
                          onCoordinatesChange(coordinatePresets[address]);
                        }
                      }}
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