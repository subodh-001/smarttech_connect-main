import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import InteractiveMap from '../../../components/maps/InteractiveMap';

const AddressSection = ({ addresses, onUpdateAddresses }) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingAddress, setEditingAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    label: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [updatingLocationId, setUpdatingLocationId] = useState(null);
  const [hasAutoFixed, setHasAutoFixed] = useState(false);

  const handleInputChange = (field, value) => {
    setNewAddress(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateAddress = () => {
    const newErrors = {};
    
    if (!newAddress?.label?.trim()) {
      newErrors.label = 'Address label is required';
    }
    if (!newAddress?.street?.trim()) {
      newErrors.street = 'Street address is required';
    }
    if (!newAddress?.city?.trim()) {
      newErrors.city = 'City is required';
    }
    if (!newAddress?.state?.trim()) {
      newErrors.state = 'State is required';
    }
    if (!newAddress?.zipCode?.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const geocodeAddress = async (street, city, state, zipCode) => {
    try {
      // Special handling for known Mumbai areas
      const addressLower = `${street} ${city} ${state}`.toLowerCase();
      const isPowai = addressLower.includes('powai');
      const isAndheri = addressLower.includes('andheri');
      const isMulund = addressLower.includes('mulund');
      const isChandivali = addressLower.includes('chandivali') || addressLower.includes('chandivli');
      
      // Known coordinates for Mumbai areas
      const mumbaiAreas = {
        powai: { lat: 19.1183, lng: 72.9067 },
        andheri: { lat: 19.1136, lng: 72.8697 },
        mulund: { lat: 19.1717, lng: 72.9569 },
        chandivali: { lat: 19.1083, lng: 72.9067 }, // Chandivali coordinates
      };
      
      // Try multiple geocoding strategies for better accuracy
      const geocodeStrategies = [
        // Strategy 1: Full address with street, area, city
        `${street}, ${city}, ${state} ${zipCode}, India`,
        // Strategy 2: Area name + Mumbai (for areas like Chandivali)
        isChandivali ? `Chandivali, Mumbai, Maharashtra, India` : null,
        // Strategy 3: Street + area (if street contains area name)
        street?.includes(',') ? street.split(',')[0] + `, ${city}, ${state}, India` : null,
        // Strategy 4: Area + city (extract area from street if possible)
        city && state ? `${city}, ${state}, India` : null,
        // Strategy 5: For Mumbai addresses, try with "Mumbai" explicitly
        (city?.toLowerCase().includes('mumbai') || state?.toLowerCase().includes('maharashtra')) 
          ? `${street}, Mumbai, Maharashtra, India` : null,
      ].filter(Boolean);
      
      // Try each strategy
      for (const queryString of geocodeStrategies) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryString)}&countrycodes=in&limit=10&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'SmartTechConnect/1.0'
              }
            }
          );
          
          const data = await response.json();
          
          if (data && data.length > 0) {
            // For Powai, Andheri, Mulund - find exact match
            if (isPowai) {
              const powaiResult = data.find(result => 
                result.display_name?.toLowerCase().includes('powai') ||
                (result.address?.suburb?.toLowerCase().includes('powai')) ||
                (result.address?.neighbourhood?.toLowerCase().includes('powai'))
              );
              if (powaiResult) {
                const lat = parseFloat(powaiResult.lat);
                const lng = parseFloat(powaiResult.lon);
                if (lat >= 6 && lat <= 37 && lng >= 68 && lng <= 97) {
                  return { lat, lng };
                }
              }
            }
            
            if (isAndheri) {
              const andheriResult = data.find(result => 
                result.display_name?.toLowerCase().includes('andheri') ||
                (result.address?.suburb?.toLowerCase().includes('andheri')) ||
                (result.address?.neighbourhood?.toLowerCase().includes('andheri'))
              );
              if (andheriResult) {
                const lat = parseFloat(andheriResult.lat);
                const lng = parseFloat(andheriResult.lon);
                if (lat >= 6 && lat <= 37 && lng >= 68 && lng <= 97) {
                  return { lat, lng };
                }
              }
            }
            
            if (isMulund) {
              const mulundResult = data.find(result => 
                result.display_name?.toLowerCase().includes('mulund') ||
                (result.address?.suburb?.toLowerCase().includes('mulund')) ||
                (result.address?.neighbourhood?.toLowerCase().includes('mulund'))
              );
              if (mulundResult) {
                const lat = parseFloat(mulundResult.lat);
                const lng = parseFloat(mulundResult.lon);
                if (lat >= 6 && lat <= 37 && lng >= 68 && lng <= 97) {
                  return { lat, lng };
                }
              }
            }
            
            if (isChandivali) {
              const chandivaliResult = data.find(result => 
                result.display_name?.toLowerCase().includes('chandivali') ||
                result.display_name?.toLowerCase().includes('chandivli') ||
                (result.address?.suburb?.toLowerCase().includes('chandivali')) ||
                (result.address?.neighbourhood?.toLowerCase().includes('chandivali'))
              );
              if (chandivaliResult) {
                const lat = parseFloat(chandivaliResult.lat);
                const lng = parseFloat(chandivaliResult.lon);
                // Validate it's in Mumbai area (not Delhi)
                if (lat >= 18.5 && lat <= 19.5 && lng >= 72.5 && lng <= 73.5) {
                  return { lat, lng };
                }
              }
            }
            
            // For Mumbai addresses, prioritize Mumbai results and filter out Delhi
            const isMumbaiAddress = city?.toLowerCase().includes('mumbai') || 
                                   state?.toLowerCase().includes('maharashtra');
            
            if (isMumbaiAddress) {
              // Filter out Delhi results (Delhi is around 28.6, 77.2)
              const mumbaiResults = data.filter(result => {
                const lat = parseFloat(result.lat);
                const lng = parseFloat(result.lon);
                // Mumbai area: 18.5-19.5 lat, 72.5-73.5 lng
                // Delhi area: 28-29 lat, 77-78 lng
                return lat >= 18.5 && lat <= 19.5 && lng >= 72.5 && lng <= 73.5;
              });
              
              if (mumbaiResults.length > 0) {
                // Prefer results that mention Mumbai or the area name
                const cityMatch = mumbaiResults.find(result => 
                  result.display_name?.toLowerCase().includes(city?.toLowerCase() || '') ||
                  result.display_name?.toLowerCase().includes('mumbai') ||
                  result.address?.city?.toLowerCase() === city?.toLowerCase() ||
                  result.address?.town?.toLowerCase() === city?.toLowerCase()
                );
                
                const bestResult = cityMatch || mumbaiResults[0];
                const lat = parseFloat(bestResult.lat);
                const lng = parseFloat(bestResult.lon);
                return { lat, lng };
              }
            }
            
            // For other addresses, prefer results that match city/state
            const cityMatch = data.find(result => 
              result.display_name?.toLowerCase().includes(city?.toLowerCase() || '') ||
              result.address?.city?.toLowerCase() === city?.toLowerCase() ||
              result.address?.town?.toLowerCase() === city?.toLowerCase()
            );
            
            const bestResult = cityMatch || data[0];
            const lat = parseFloat(bestResult.lat);
            const lng = parseFloat(bestResult.lon);
            
            // Validate coordinates are in India
            if (lat >= 6 && lat <= 37 && lng >= 68 && lng <= 97) {
              return { lat, lng };
            }
          }
        } catch (strategyError) {
          console.warn('Geocoding strategy failed:', strategyError);
          continue; // Try next strategy
        }
      }
      
      // Fallback to known coordinates for specific areas
      if (isPowai) return mumbaiAreas.powai;
      if (isAndheri) return mumbaiAreas.andheri;
      if (isMulund) return mumbaiAreas.mulund;
      if (isChandivali) return mumbaiAreas.chandivali;
      
      // Final fallback: city center
      if (city?.toLowerCase().includes('mumbai') || state?.toLowerCase().includes('maharashtra')) {
        return { lat: 19.0760, lng: 72.8777 }; // Mumbai center
      }
      
      // Default: try to get city coordinates
      try {
        const cityResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${city}, ${state}, India`)}&countrycodes=in&limit=1`,
          {
            headers: {
              'User-Agent': 'SmartTechConnect/1.0'
            }
          }
        );
        const cityData = await cityResponse.json();
        if (cityData && cityData.length > 0) {
          const lat = parseFloat(cityData[0].lat);
          const lng = parseFloat(cityData[0].lon);
          if (lat >= 6 && lat <= 37 && lng >= 68 && lng <= 97) {
            return { lat, lng };
          }
        }
      } catch (e) {
        console.warn('City geocoding failed:', e);
      }
      
      // Ultimate fallback
      return { lat: 19.0760, lng: 72.8777 }; // Mumbai center
    } catch (error) {
      console.error('Geocoding error:', error);
      // Fallback based on address content
      const addressLower = `${street} ${city}`.toLowerCase();
      if (addressLower.includes('powai')) return { lat: 19.1183, lng: 72.9067 };
      if (addressLower.includes('andheri')) return { lat: 19.1136, lng: 72.8697 };
      if (addressLower.includes('mulund')) return { lat: 19.1717, lng: 72.9569 };
      if (addressLower.includes('chandivali') || addressLower.includes('chandivli')) return { lat: 19.1083, lng: 72.9067 };
      return { lat: 19.0760, lng: 72.8777 }; // Mumbai center
    }
  };

  const handleSaveAddress = async () => {
    if (!validateAddress()) return;

    setIsLoading(true);
    try {
      // Geocode the address to get coordinates
      const coordinates = await geocodeAddress(
        newAddress.street,
        newAddress.city,
        newAddress.state,
        newAddress.zipCode
      );
      
      const updatedAddresses = [...addresses, { 
        ...newAddress, 
        id: Date.now().toString(),
        coordinates: coordinates
      }];
      onUpdateAddresses(updatedAddresses);
      setNewAddress({
        label: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        isDefault: false
      });
      setIsAddingNew(false);
    } catch (error) {
      console.error('Failed to save address:', error);
      alert('Failed to save address. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = (addressId) => {
    const updatedAddresses = addresses?.map(addr => ({
      ...addr,
      isDefault: addr?.id === addressId
    }));
    onUpdateAddresses(updatedAddresses);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!addressId) return;
    
    const addressToDelete = addresses?.find(addr => addr?.id === addressId);
    if (!addressToDelete) return;
    
    if (window.confirm(`Are you sure you want to delete "${addressToDelete.label}" address? This action cannot be undone.`)) {
      const updatedAddresses = addresses?.filter(addr => addr?.id !== addressId);
      
      // Show loading state
      setIsLoading(true);
      
      try {
        // Wait for the save to complete
        await onUpdateAddresses(updatedAddresses);
      } catch (error) {
        // Error is already handled in onUpdateAddresses, just log it
        console.error('Delete failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUpdateLocation = async (address) => {
    if (!address) return;
    
    setUpdatingLocationId(address.id);
    try {
      const coordinates = await geocodeAddress(
        address.street || '',
        address.city || '',
        address.state || '',
        address.zipCode || ''
      );
      
      if (!coordinates || !coordinates.lat || !coordinates.lng) {
        throw new Error('Could not geocode address');
      }
      
      const updatedAddresses = addresses.map(addr =>
        addr.id === address.id
          ? { ...addr, coordinates }
          : addr
      );
      onUpdateAddresses(updatedAddresses);
    } catch (error) {
      console.error('Failed to update location:', error);
      alert(`Failed to update location: ${error.message || 'Please try again.'}`);
    } finally {
      setUpdatingLocationId(null);
    }
  };

  // Check if coordinates are likely incorrect (e.g., New York coordinates for Indian address)
  const hasIncorrectCoordinates = (address) => {
    if (!address?.coordinates?.lat || !address?.coordinates?.lng) return true;
    
    const lat = address.coordinates.lat;
    const lng = address.coordinates.lng;
    
    // New York coordinates (the old hardcoded value)
    const isNewYork = Math.abs(lat - 40.7128) < 0.1 && 
                      Math.abs(lng - (-74.0060)) < 0.1;
    
    // Delhi coordinates (another common hardcoded value) - 28.6139, 77.209
    const isDelhi = Math.abs(lat - 28.6139) < 0.5 && 
                    Math.abs(lng - 77.209) < 0.5;
    
    // Check if address mentions specific Indian locations
    const addressText = `${address?.street || ''} ${address?.city || ''} ${address?.state || ''}`.toLowerCase();
    const isMumbaiAddress = addressText.includes('mumbai') || 
                           addressText.includes('maharashtra') ||
                           addressText.includes('mulund');
    
    // If address is Mumbai but coordinates are Delhi, it's wrong
    if (isMumbaiAddress && isDelhi) return true;
    
    // If address is Mumbai but coordinates are not in Mumbai area (roughly 18.5-19.5 lat, 72.5-73.5 lng)
    if (isMumbaiAddress) {
      const isMumbaiArea = lat >= 18.5 && lat <= 19.5 && lng >= 72.5 && lng <= 73.5;
      if (!isMumbaiArea) return true;
    }
    
    const isIndianAddress = addressText.includes('mumbai') || 
                           addressText.includes('maharashtra') ||
                           addressText.includes('delhi') ||
                           addressText.includes('bangalore') ||
                           addressText.includes('kolkata') ||
                           addressText.includes('chennai') ||
                           addressText.includes('hyderabad') ||
                           addressText.includes('pune');
    
    // If address is in India but coordinates are clearly in US (lat > 25 and lng < -50)
    const isUSCoordinates = lat > 25 && lat < 50 && lng < -50 && lng > -130;
    
    // If address is in India but coordinates are in wrong hemisphere
    const isWrongHemisphere = isIndianAddress && (lat < 0 || lng < 0);
    
    return isNewYork || (isDelhi && isMumbaiAddress) || (isIndianAddress && isUSCoordinates) || isWrongHemisphere;
  };

  // Auto-fix addresses with incorrect coordinates on component mount (only once)
  useEffect(() => {
    if (hasAutoFixed || !addresses || addresses.length === 0) return;
    
    const autoFixIncorrectAddresses = async () => {
      const addressesToFix = addresses.filter(addr => hasIncorrectCoordinates(addr));
      
      if (addressesToFix.length === 0) {
        setHasAutoFixed(true);
        return;
      }
      
      // Fix addresses one by one to avoid rate limiting
      for (const address of addressesToFix) {
        try {
          const coordinates = await geocodeAddress(
            address.street,
            address.city,
            address.state,
            address.zipCode
          );
          
          // Only update if coordinates are significantly different
          if (coordinates && 
              (Math.abs(coordinates.lat - (address.coordinates?.lat || 0)) > 0.01 ||
               Math.abs(coordinates.lng - (address.coordinates?.lng || 0)) > 0.01)) {
            const updatedAddresses = addresses.map(addr =>
              addr.id === address.id
                ? { ...addr, coordinates }
                : addr
            );
            onUpdateAddresses(updatedAddresses);
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error('Auto-fix failed for address:', address.id, error);
        }
      }
      
      setHasAutoFixed(true);
    };

    autoFixIncorrectAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Saved Addresses</h2>
        <Button
          variant="outline"
          onClick={() => setIsAddingNew(true)}
          iconName="Plus"
          iconPosition="left"
          disabled={isAddingNew}
        >
          Add Address
        </Button>
      </div>
      <div className="space-y-4">
        {/* Existing Addresses */}
        {addresses?.map((address) => {
          // Calculate markers outside of JSX to avoid hooks in render
          const addressMarkers = address?.coordinates?.lat && address?.coordinates?.lng
            ? [
                {
                  id: `addr-${address?.id}`,
                  type: 'destination',
                  position: [address.coordinates.lat, address.coordinates.lng],
                  accent: '#2563eb',
                },
              ]
            : [];

          return (
          <div key={address?.id} className="border border-border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-medium text-text-primary">{address?.label}</h3>
                  {address?.isDefault && (
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-text-secondary text-sm mb-2">
                  {address?.street}, {address?.city}, {address?.state} {address?.zipCode}
                </p>
                
                {/* Map Preview */}
                <div className="mb-3 h-32 overflow-hidden rounded-lg border border-border relative">
                  <InteractiveMap
                    markers={addressMarkers}
                    center={
                      address?.coordinates?.lat && address?.coordinates?.lng
                        ? [address.coordinates.lat, address.coordinates.lng]
                        : undefined
                    }
                    zoom={14}
                  />
                  {hasIncorrectCoordinates(address) && (
                    <div className="absolute top-2 right-2 bg-warning/90 text-warning-foreground px-2 py-1 rounded text-xs flex items-center gap-1">
                      <Icon name="AlertTriangle" size={12} />
                      <span>Location may be incorrect</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateLocation(address)}
                    iconName="MapPin"
                    iconPosition="left"
                    loading={updatingLocationId === address.id}
                    className={hasIncorrectCoordinates(address) ? "border-warning text-warning hover:bg-warning/10" : ""}
                  >
                    Update Location
                  </Button>
                  {!address?.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(address?.id)}
                      iconName="Star"
                      iconPosition="left"
                    >
                      Set as Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingId(address?.id);
                      setEditingAddress({ ...address });
                    }}
                    iconName="Edit"
                    iconPosition="left"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAddress(address?.id)}
                    iconName="Trash2"
                    iconPosition="left"
                    className="text-error hover:text-error"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
          );
        })}

        {/* Edit Address Form */}
        {editingId && editingAddress && (
          <div className="border border-border rounded-lg p-4 bg-muted/30">
            <h3 className="font-medium text-text-primary mb-4">Edit Address</h3>
            
            <div className="space-y-4">
              <Input
                label="Address Label"
                type="text"
                value={editingAddress?.label || ''}
                onChange={(e) => setEditingAddress({ ...editingAddress, label: e.target.value })}
                placeholder="e.g., Home, Office, Apartment"
                required
              />
              
              <Input
                label="Street Address"
                type="text"
                value={editingAddress?.street || ''}
                onChange={(e) => setEditingAddress({ ...editingAddress, street: e.target.value })}
                placeholder="Enter street address"
                required
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="City"
                  type="text"
                  value={editingAddress?.city || ''}
                  onChange={(e) => setEditingAddress({ ...editingAddress, city: e.target.value })}
                  required
                />
                
                <Input
                  label="State"
                  type="text"
                  value={editingAddress?.state || ''}
                  onChange={(e) => setEditingAddress({ ...editingAddress, state: e.target.value })}
                  required
                />
                
                <Input
                  label="ZIP Code"
                  type="text"
                  value={editingAddress?.zipCode || ''}
                  onChange={(e) => setEditingAddress({ ...editingAddress, zipCode: e.target.value })}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`edit-default-${editingId}`}
                  checked={editingAddress?.isDefault || false}
                  onChange={(e) => setEditingAddress({ ...editingAddress, isDefault: e.target.checked })}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <label htmlFor={`edit-default-${editingId}`} className="text-sm text-text-secondary">
                  Set as default address
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  variant="default"
                  onClick={async () => {
                    if (!editingAddress.label || !editingAddress.street || !editingAddress.city || !editingAddress.state || !editingAddress.zipCode) {
                      alert('Please fill in all required fields');
                      return;
                    }
                    
                    setIsLoading(true);
                    try {
                      // Re-geocode the address
                      const coordinates = await geocodeAddress(
                        editingAddress.street,
                        editingAddress.city,
                        editingAddress.state,
                        editingAddress.zipCode
                      );
                      
                      const updatedAddresses = addresses.map(addr =>
                        addr.id === editingId
                          ? { ...editingAddress, coordinates }
                          : addr
                      );
                      
                      // If setting as default, unset others
                      if (editingAddress.isDefault) {
                        updatedAddresses.forEach(addr => {
                          if (addr.id !== editingId) {
                            addr.isDefault = false;
                          }
                        });
                      }
                      
                      onUpdateAddresses(updatedAddresses);
                      setEditingId(null);
                      setEditingAddress(null);
                    } catch (error) {
                      console.error('Failed to save edited address:', error);
                      alert('Failed to save address. Please try again.');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  loading={isLoading}
                  iconName="Save"
                  iconPosition="left"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setEditingAddress(null);
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Add New Address Form */}
        {isAddingNew && (
          <div className="border border-border rounded-lg p-4 bg-muted/30">
            <h3 className="font-medium text-text-primary mb-4">Add New Address</h3>
            
            <div className="space-y-4">
              <Input
                label="Address Label"
                type="text"
                value={newAddress?.label}
                onChange={(e) => handleInputChange('label', e?.target?.value)}
                error={errors?.label}
                placeholder="e.g., Home, Office, Apartment"
                required
              />
              
              <Input
                label="Street Address"
                type="text"
                value={newAddress?.street}
                onChange={(e) => handleInputChange('street', e?.target?.value)}
                error={errors?.street}
                placeholder="Enter street address"
                required
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="City"
                  type="text"
                  value={newAddress?.city}
                  onChange={(e) => handleInputChange('city', e?.target?.value)}
                  error={errors?.city}
                  required
                />
                
                <Input
                  label="State"
                  type="text"
                  value={newAddress?.state}
                  onChange={(e) => handleInputChange('state', e?.target?.value)}
                  error={errors?.state}
                  required
                />
                
                <Input
                  label="ZIP Code"
                  type="text"
                  value={newAddress?.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e?.target?.value)}
                  error={errors?.zipCode}
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  variant="default"
                  onClick={handleSaveAddress}
                  loading={isLoading}
                  iconName="Save"
                  iconPosition="left"
                >
                  Save Address
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingNew(false);
                    setNewAddress({
                      label: '',
                      street: '',
                      city: '',
                      state: '',
                      zipCode: '',
                      isDefault: false
                    });
                    setErrors({});
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {addresses?.length === 0 && !isAddingNew && (
          <div className="text-center py-8">
            <Icon name="MapPin" size={48} className="mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">No addresses saved yet</p>
            <p className="text-sm text-text-secondary mt-1">
              Add your first address to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressSection;