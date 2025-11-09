import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';


const PersonalInfoSection = ({ userProfile, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    dateOfBirth: userProfile?.dateOfBirth || '',
    emergencyContact: userProfile?.emergencyContact || '',
    emergencyPhone: userProfile?.emergencyPhone || ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData({
      name: userProfile?.name || '',
      email: userProfile?.email || '',
      phone: userProfile?.phone || '',
      dateOfBirth: userProfile?.dateOfBirth || '',
      emergencyContact: userProfile?.emergencyContact || '',
      emergencyPhone: userProfile?.emergencyPhone || ''
    });
  }, [userProfile]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData?.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]{10,}$/?.test(formData?.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onUpdateProfile?.(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: userProfile?.name || '',
      email: userProfile?.email || '',
      phone: userProfile?.phone || '',
      dateOfBirth: userProfile?.dateOfBirth || '',
      emergencyContact: userProfile?.emergencyContact || '',
      emergencyPhone: userProfile?.emergencyPhone || ''
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Personal Information</h2>
        {!isEditing && (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            iconName="Edit"
            iconPosition="left"
          >
            Edit
          </Button>
        )}
      </div>
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Full Name"
            type="text"
            value={formData?.name}
            onChange={(e) => handleInputChange('name', e?.target?.value)}
            error={errors?.name}
            disabled={!isEditing}
            required
          />
          
          <Input
            label="Email Address"
            type="email"
            value={formData?.email}
            onChange={(e) => handleInputChange('email', e?.target?.value)}
            error={errors?.email}
            disabled={!isEditing}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Phone Number"
            type="tel"
            value={formData?.phone}
            onChange={(e) => handleInputChange('phone', e?.target?.value)}
            error={errors?.phone}
            disabled={!isEditing}
            required
          />
          
          <Input
            label="Date of Birth"
            type="date"
            value={formData?.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e?.target?.value)}
            disabled={!isEditing}
          />
        </div>

        {/* Emergency Contact */}
        <div className="border-t border-border pt-6">
          <h3 className="text-lg font-medium text-text-primary mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Emergency Contact Name"
              type="text"
              value={formData?.emergencyContact}
              onChange={(e) => handleInputChange('emergencyContact', e?.target?.value)}
              disabled={!isEditing}
              placeholder="Contact person name"
            />
            
            <Input
              label="Emergency Contact Phone"
              type="tel"
              value={formData?.emergencyPhone}
              onChange={(e) => handleInputChange('emergencyPhone', e?.target?.value)}
              disabled={!isEditing}
              placeholder="Emergency phone number"
            />
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
            <Button
              variant="default"
              onClick={handleSave}
              loading={isLoading}
              iconName="Save"
              iconPosition="left"
              className="sm:w-auto"
            >
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoSection;