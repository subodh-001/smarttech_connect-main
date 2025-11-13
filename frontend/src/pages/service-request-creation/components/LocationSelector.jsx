import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import InteractiveMap from '../../../components/maps/InteractiveMap';
import Input from '../../../components/ui/Input';

const LocationSelector = ({
  currentLocation,
  coordinates,
  onLocationChange,
  onCoordinatesChange,
  onUseCurrentLocation,
  onAddressDetailsChange, // New prop to pass full address details
}) => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [tempLocation, setTempLocation] = useState(currentLocation);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [isGeocoding, setIsGeocoding] = useState(false);

  React.useEffect(() => {
    setTempLocation(currentLocation);
  }, [currentLocation]);

  // Fetch saved addresses from user profile
  useEffect(() => {
    const loadSavedAddresses = async () => {
      setLoadingAddresses(true);
      try {
        const { data } = await axios.get('/api/users/me');
        if (data?.addresses && Array.isArray(data.addresses) && data.addresses.length > 0) {
          setSavedAddresses(data.addresses);
        }
      } catch (error) {
        console.error('Failed to load saved addresses:', error);
      } finally {
        setLoadingAddresses(false);
      }
    };
    
    if (showLocationModal) {
      loadSavedAddresses();
    }
  }, [showLocationModal]);

  // Geocode address to get coordinates
  const geocodeAddress = async (street, city, state, zipCode) => {
    setIsGeocoding(true);
    try {
      const addressLower = `${street} ${city} ${state}`.toLowerCase();
      const isMumbai = city?.toLowerCase().includes('mumbai') || state?.toLowerCase().includes('maharashtra');
      
      const geocodeStrategies = [
        `${street}, ${city}, ${state} ${zipCode}, India`,
        city && state ? `${city}, ${state}, India` : null,
        isMumbai ? `${street}, Mumbai, Maharashtra, India` : null,
      ].filter(Boolean);

      for (const queryString of geocodeStrategies) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryString)}&countrycodes=in&limit=5&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'SmartTechConnect/1.0'
              }
            }
          );
          
          const data = await response.json();
          
          if (data && data.length > 0) {
            const result = data[0];
            const lat = parseFloat(result.lat);
            const lng = parseFloat(result.lon);
            
            // Validate coordinates are in India
            if (lat >= 6 && lat <= 37 && lng >= 68 && lng <= 97) {
              return { lat, lng };
            }
          }
        } catch (strategyError) {
          console.warn('Geocoding strategy failed:', strategyError);
          continue;
        }
      }
      
      // Fallback to Mumbai center if geocoding fails
      if (isMumbai) {
        return { lat: 19.0760, lng: 72.8777 };
      }
      
      // Fallback to Bangalore center
      return { lat: 12.9716, lng: 77.5946 };
    } catch (error) {
      console.error('Geocoding error:', error);
      return { lat: 12.9716, lng: 77.5946 }; // Default fallback
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
    });
    setIsEditing(true);
    setTempLocation(`${address.street}, ${address.city}, ${address.state} ${address.zipCode}`);
  };

  const handleSaveEditedAddress = async () => {
    if (!addressForm.street || !addressForm.city || !addressForm.state || !addressForm.zipCode) {
      alert('Please fill in all address fields');
      return;
    }

    setIsGeocoding(true);
    try {
      const coords = await geocodeAddress(
        addressForm.street,
        addressForm.city,
        addressForm.state,
        addressForm.zipCode
      );
      
      const fullAddress = `${addressForm.street}, ${addressForm.city}, ${addressForm.state} ${addressForm.zipCode}`;
      
      // Update location and coordinates
      setTempLocation(fullAddress);
      if (onLocationChange) {
        onLocationChange(fullAddress);
      }
      if (onCoordinatesChange) {
        onCoordinatesChange(coords);
      }
      if (onAddressDetailsChange) {
        onAddressDetailsChange({
          street: addressForm.street,
          city: addressForm.city,
          state: addressForm.state,
          postalCode: addressForm.zipCode,
        });
      }
      
      setIsEditing(false);
      setEditingAddress(null);
    } catch (error) {
      console.error('Failed to geocode address:', error);
      alert('Failed to get location coordinates. Please try again.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSelectSavedAddress = async (address) => {
    const fullAddress = `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
    setTempLocation(fullAddress);
    
    // Use saved coordinates if available, otherwise geocode
    let coords = address.coordinates;
    if (!coords || !coords.lat || !coords.lng) {
      setIsGeocoding(true);
      try {
        coords = await geocodeAddress(address.street, address.city, address.state, address.zipCode);
      } catch (error) {
        console.error('Failed to geocode:', error);
        coords = { lat: 12.9716, lng: 77.5946 };
      } finally {
        setIsGeocoding(false);
      }
    }
    
    if (onCoordinatesChange) {
      onCoordinatesChange(coords);
    }
    if (onAddressDetailsChange) {
      onAddressDetailsChange({
        street: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.zipCode,
      });
    }
  };

  const handleLocationSave = async () => {
    if (!tempLocation || tempLocation.trim() === '') {
      alert('Please enter or select a location');
      return;
    }

    // If editing an address, save the edited version
    if (isEditing && editingAddress) {
      await handleSaveEditedAddress();
      setShowLocationModal(false);
      return;
    }

    // If a saved address was selected, use its details
    const selectedAddress = savedAddresses.find(addr => {
      const addrString = `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`;
      return addrString === tempLocation;
    });

    if (selectedAddress) {
      await handleSelectSavedAddress(selectedAddress);
    } else {
      // For manual entry, try to parse or geocode
      setIsGeocoding(true);
      try {
        // Try to extract address components from the string
        const parts = tempLocation.split(',').map(p => p.trim());
        let street = parts[0] || '';
        let city = parts[1] || '';
        let state = parts[2] || '';
        let zipCode = '';

        // Try to extract zip code from state part
        if (state) {
          const zipMatch = state.match(/\d{6}/);
          if (zipMatch) {
            zipCode = zipMatch[0];
            state = state.replace(/\d{6}/, '').trim();
          }
        }

        const coords = await geocodeAddress(street, city, state, zipCode);
        
        if (onLocationChange) {
          onLocationChange(tempLocation);
        }
        if (onCoordinatesChange) {
          onCoordinatesChange(coords);
        }
        if (onAddressDetailsChange && street && city && state) {
          onAddressDetailsChange({
            street,
            city,
            state,
            postalCode: zipCode,
          });
        }
      } catch (error) {
        console.error('Failed to process location:', error);
        alert('Failed to process location. Please try again.');
      } finally {
        setIsGeocoding(false);
      }
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

                {!isEditing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">Saved Addresses</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsEditing(true);
                          setEditingAddress(null);
                          setAddressForm({
                            street: '',
                            city: '',
                            state: '',
                            zipCode: '',
                          });
                          setTempLocation('');
                        }}
                        iconName="Plus"
                        iconPosition="left"
                      >
                        Add New
                      </Button>
                    </div>
                    {loadingAddresses ? (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        Loading addresses...
                      </div>
                    ) : savedAddresses.length > 0 ? (
                      savedAddresses.map((address, index) => {
                        const addressString = `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
                        return (
                          <div key={address.id || index} className="flex items-center gap-2">
                            <button
                              onClick={() => handleSelectSavedAddress(address)}
                              className="flex-1 text-left p-3 border border-border rounded-md hover:bg-muted trust-transition"
                            >
                              <div className="flex items-center space-x-2">
                                <Icon 
                                  name={address.label?.toLowerCase().includes('home') ? "Home" : "Building"} 
                                  size={16} 
                                  className="text-muted-foreground" 
                                />
                                <div className="flex-1">
                                  <span className="text-sm font-medium">{address.label}</span>
                                  <p className="text-xs text-muted-foreground mt-0.5">{addressString}</p>
                                </div>
                              </div>
                            </button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAddress(address)}
                              iconName="Edit"
                            />
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        No saved addresses. Add one to get started.
                      </div>
                    )}
                  </div>
                )}

                {isEditing && (
                  <div className="space-y-3 border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        {editingAddress ? 'Edit Address' : 'Add New Address'}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsEditing(false);
                          setEditingAddress(null);
                          setAddressForm({
                            street: '',
                            city: '',
                            state: '',
                            zipCode: '',
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                    <Input
                      label="Street Address"
                      type="text"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      placeholder="e.g., 123 MG Road"
                      required
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="City"
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        placeholder="e.g., Bangalore"
                        required
                      />
                      <Input
                        label="State"
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        placeholder="e.g., Karnataka"
                        required
                      />
                    </div>
                    <Input
                      label="ZIP Code"
                      type="text"
                      value={addressForm.zipCode}
                      onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                      placeholder="e.g., 560001"
                      required
                    />
                    <Button
                      variant="default"
                      onClick={handleSaveEditedAddress}
                      loading={isGeocoding}
                      className="w-full"
                      iconName="Save"
                      iconPosition="left"
                    >
                      {editingAddress ? 'Save Changes' : 'Add Address'}
                    </Button>
                  </div>
                )}

                {!isEditing && (
                  <div className="flex space-x-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowLocationModal(false);
                        setIsEditing(false);
                        setEditingAddress(null);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleLocationSave}
                      loading={isGeocoding}
                      className="flex-1"
                      disabled={!tempLocation || tempLocation.trim() === ''}
                    >
                      Save Location
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;