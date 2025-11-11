import React, { useMemo, useState } from 'react';
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

  const handleSaveAddress = async () => {
    if (!validateAddress()) return;

    setIsLoading(true);
    // Mock API call
    setTimeout(() => {
      const updatedAddresses = [...addresses, { 
        ...newAddress, 
        id: Date.now(),
        coordinates: { lat: 40.7128, lng: -74.0060 }
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
      setIsLoading(false);
    }, 1500);
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
        {addresses?.map((address) => (
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
                <div className="mb-3 h-32 overflow-hidden rounded-lg border border-border">
                  <InteractiveMap
                    markers={useMemo(
                      () =>
                        address?.coordinates?.lat && address?.coordinates?.lng
                          ? [
                              {
                                id: `addr-${address?.id}`,
                                type: 'destination',
                                position: [address.coordinates.lat, address.coordinates.lng],
                                accent: '#2563eb',
                              },
                            ]
                          : [],
                      [address],
                    )}
                    center={
                      address?.coordinates?.lat && address?.coordinates?.lng
                        ? [address.coordinates.lat, address.coordinates.lng]
                        : undefined
                    }
                    zoom={14}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
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
        ))}

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