import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import InteractiveMap from '../../../components/maps/InteractiveMap';

const AddressSection = ({ addresses, onUpdateAddresses }) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState(null);
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
      // Build address string for geocoding - prioritize India/Mumbai
      let addressString = `${street}, ${city}, ${state} ${zipCode}, India`;
      
      // Special handling for Mulund (suburb of Mumbai)
      const isMulund = street?.toLowerCase().includes('mulund') || 
                       city?.toLowerCase().includes('mulund') ||
                       addressString.toLowerCase().includes('mulund');
      
      if (isMulund) {
        // Mulund is in Mumbai, use specific Mulund coordinates
        // Mulund coordinates: approximately 19.1717° N, 72.9569° E
        const mulundCoords = { lat: 19.1717, lng: 72.9569 };
        
        // Try to get more precise location first
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`Mulund, ${street}, Mumbai, Maharashtra, India`)}&countrycodes=in&limit=3`,
            {
              headers: {
                'User-Agent': 'SmartTechConnect/1.0'
              }
            }
          );
          
          const data = await response.json();
          if (data && data.length > 0) {
            // Prefer results that mention Mulund or Mumbai
            const mulundResult = data.find(result => 
              result.display_name?.toLowerCase().includes('mulund') ||
              result.display_name?.toLowerCase().includes('mumbai')
            );
            
            if (mulundResult) {
              return {
                lat: parseFloat(mulundResult.lat),
                lng: parseFloat(mulundResult.lon)
              };
            }
          }
        } catch (e) {
          console.warn('Geocoding for Mulund failed, using default:', e);
        }
        
        return mulundCoords;
      }
      
      // Use OpenStreetMap Nominatim API (free, no API key required)
      // Add country code to prioritize India
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}&countrycodes=in&limit=5`,
        {
          headers: {
            'User-Agent': 'SmartTechConnect/1.0' // Required by Nominatim
          }
        }
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        // Prefer results that mention Mumbai or Maharashtra
        const mumbaiResult = data.find(result => 
          result.display_name?.toLowerCase().includes('mumbai') ||
          result.display_name?.toLowerCase().includes('maharashtra') ||
          result.display_name?.toLowerCase().includes('mulund')
        );
        
        const bestResult = mumbaiResult || data[0];
        
        // Validate coordinates are in India (rough bounds)
        const lat = parseFloat(bestResult.lat);
        const lng = parseFloat(bestResult.lon);
        
        // India is roughly between 6°N to 37°N and 68°E to 97°E
        if (lat >= 6 && lat <= 37 && lng >= 68 && lng <= 97) {
          return { lat, lng };
        }
      }
      
      // Fallback: Try with city, state, and country
      const cityStateString = `${city}, ${state}, India`;
      const fallbackResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityStateString)}&countrycodes=in&limit=1`,
        {
          headers: {
            'User-Agent': 'SmartTechConnect/1.0'
          }
        }
      );
      
      const fallbackData = await fallbackResponse.json();
      if (fallbackData && fallbackData.length > 0) {
        const lat = parseFloat(fallbackData[0].lat);
        const lng = parseFloat(fallbackData[0].lon);
        
        // Validate coordinates
        if (lat >= 6 && lat <= 37 && lng >= 68 && lng <= 97) {
          return { lat, lng };
        }
      }
      
      // Final fallback based on city
      if (city?.toLowerCase().includes('mumbai') || state?.toLowerCase().includes('maharashtra')) {
        // Use Mulund coordinates if address mentions Mulund, otherwise Mumbai center
        if (isMulund) {
          return { lat: 19.1717, lng: 72.9569 }; // Mulund
        }
        return { lat: 19.0760, lng: 72.8777 }; // Mumbai center
      }
      
      // Default Mumbai coordinates
      return { lat: 19.0760, lng: 72.8777 };
    } catch (error) {
      console.error('Geocoding error:', error);
      // Fallback based on address content
      const isMulund = street?.toLowerCase().includes('mulund') || 
                       city?.toLowerCase().includes('mulund');
      if (isMulund) {
        return { lat: 19.1717, lng: 72.9569 }; // Mulund
      }
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
        id: Date.now(),
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

  const handleDeleteAddress = (addressId) => {
    const updatedAddresses = addresses?.filter(addr => addr?.id !== addressId);
    onUpdateAddresses(updatedAddresses);
  };

  const handleUpdateLocation = async (address) => {
    if (!address) return;
    
    setUpdatingLocationId(address.id);
    try {
      const coordinates = await geocodeAddress(
        address.street,
        address.city,
        address.state,
        address.zipCode
      );
      
      const updatedAddresses = addresses.map(addr =>
        addr.id === address.id
          ? { ...addr, coordinates }
          : addr
      );
      onUpdateAddresses(updatedAddresses);
    } catch (error) {
      console.error('Failed to update location:', error);
      alert('Failed to update location. Please try again.');
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
                  {hasIncorrectCoordinates(address) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateLocation(address)}
                      iconName="MapPin"
                      iconPosition="left"
                      loading={updatingLocationId === address.id}
                      className="border-warning text-warning hover:bg-warning/10"
                    >
                      Update Location
                    </Button>
                  )}
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
                    onClick={() => setEditingId(address?.id)}
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