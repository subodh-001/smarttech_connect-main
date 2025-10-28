import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { User, Settings, Bell, Shield, MapPin, Phone, Mail, Save, Edit2, Star, Briefcase, Clock } from 'lucide-react';
import ProfileImageUpload from './components/ProfileImageUpload';
import NotificationSettings from './components/NotificationSettings';
import TechnicianSettings from './components/TechnicianSettings';
import { useAuth } from '../../contexts/NewAuthContext';
import axios from 'axios';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, userProfile, loading, fetchUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [settingsData, setSettingsData] = useState({});

  // Initialize from authenticated context
  useEffect(() => {
    const init = async () => {
      if (user && !userProfile) {
        await fetchUserProfile();
      }
      if (userProfile) {
        setFormData({
          full_name: userProfile.full_name || '',
          email: userProfile.email || '',
          phone: userProfile.phone || '',
          address: userProfile.address || '',
          city: userProfile.city || '',
          postal_code: userProfile.postal_code || '',
          avatar_url: userProfile.avatar_url || ''
        });
        setSettingsData({
          notifications_enabled: userProfile.user_settings?.notifications_enabled ?? true,
          email_notifications: userProfile.user_settings?.email_notifications ?? true,
          sms_notifications: userProfile.user_settings?.sms_notifications ?? false,
          push_notifications: userProfile.user_settings?.push_notifications ?? true,
          language_preference: userProfile.user_settings?.language_preference || 'en',
          timezone: userProfile.user_settings?.timezone || 'UTC',
          privacy_level: userProfile.user_settings?.privacy_level || 'normal'
        });
      }
    };
    init();
  }, [user, userProfile, fetchUserProfile]);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSettingsChange = (name, value) => {
    setSettingsData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    try {
      // Save profile via API
      await axios.put('/api/users/me', {
        fullName: formData.full_name,
        phone: formData.phone,
        avatarUrl: formData.avatar_url,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postal_code
      });
      await fetchUserProfile();
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
    
    setIsSaving(false);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Update local state with new settings
      setUserProfile(prev => ({
        ...prev,
        user_settings: [{
          ...prev.user_settings[0],
          ...settingsData
        }]
      }));
      
      alert('Settings updated successfully!');
      // Save settings via API
      await axios.put('/api/users/me/settings', {
        notificationsEnabled: settingsData.notifications_enabled,
        emailNotifications: settingsData.email_notifications,
        smsNotifications: settingsData.sms_notifications,
        pushNotifications: settingsData.push_notifications,
        languagePreference: settingsData.language_preference,
        timezone: settingsData.timezone,
        privacyLevel: settingsData.privacy_level
      });
      await fetchUserProfile();
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Error updating settings. Please try again.');
    }
    
    setIsSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in to view your profile.</p>
          <Button onClick={() => navigate('/user-login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    ...(userProfile?.role === 'technician' ? [{ id: 'technician', label: 'Technician Settings', icon: Briefcase }] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} location="New York" />
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-6">
            <ProfileImageUpload 
              currentImage={userProfile?.avatar_url}
              onImageUpdate={(url) => handleInputChange('avatar_url', url)}
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {userProfile?.full_name || 'User Profile'}
              </h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{userProfile?.email}</span>
                </div>
                {userProfile?.phone && (
                  <div className="flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{userProfile?.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    userProfile?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    userProfile?.role === 'technician'? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {userProfile?.role?.charAt(0)?.toUpperCase() + userProfile?.role?.slice(1) || 'Customer'}
                  </span>
                </div>
              </div>
              {userProfile?.role === 'technician' && userProfile?.technician_profiles?.[0] && (
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {userProfile?.technician_profiles?.[0]?.rating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Briefcase className="h-4 w-4" />
                    <span className="text-sm">
                      {userProfile?.technician_profiles?.[0]?.total_jobs || 0} jobs completed
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      ${userProfile?.technician_profiles?.[0]?.hourly_rate || '0'}/hour
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs?.map((tab) => {
              const IconComponent = tab?.icon;
              return (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab?.id
                      ? 'border-blue-500 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{tab?.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                <Button
                  variant="outline"
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                  disabled={isSaving}
                  className="flex items-center space-x-2"
                >
                  {isEditing ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                  <span>{isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  value={formData?.full_name || ''}
                  onChange={(e) => handleInputChange('full_name', e?.target?.value)}
                  disabled={!isEditing}
                  icon={User}
                />

                <Input
                  label="Email"
                  type="email"
                  value={formData?.email || ''}
                  onChange={(e) => handleInputChange('email', e?.target?.value)}
                  disabled={!isEditing}
                  icon={Mail}
                />

                <Input
                  label="Phone Number"
                  value={formData?.phone || ''}
                  onChange={(e) => handleInputChange('phone', e?.target?.value)}
                  disabled={!isEditing}
                  icon={Phone}
                />

                <Input
                  label="City"
                  value={formData?.city || ''}
                  onChange={(e) => handleInputChange('city', e?.target?.value)}
                  disabled={!isEditing}
                  icon={MapPin}
                />
              </div>

              <div className="space-y-4">
                <Input
                  label="Address"
                  value={formData?.address || ''}
                  onChange={(e) => handleInputChange('address', e?.target?.value)}
                  disabled={!isEditing}
                  icon={MapPin}
                />

                <Input
                  label="Postal Code"
                  value={formData?.postal_code || ''}
                  onChange={(e) => handleInputChange('postal_code', e?.target?.value)}
                  disabled={!isEditing}
                />
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form data
                      if (userProfile) {
                        setFormData({
                          full_name: userProfile?.full_name || '',
                          email: userProfile?.email || '',
                          phone: userProfile?.phone || '',
                          address: userProfile?.address || '',
                          city: userProfile?.city || '',
                          postal_code: userProfile?.postal_code || '',
                          avatar_url: userProfile?.avatar_url || ''
                        });
                      }
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <NotificationSettings
              settings={settingsData}
              onSettingsChange={handleSettingsChange}
              onSave={handleSaveSettings}
              isSaving={isSaving}
            />
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Privacy & Security Settings</h2>
              
              <div className="space-y-4">
                <Select
                  label="Privacy Level"
                  value={settingsData?.privacy_level || 'normal'}
                  onChange={(value) => handleSettingsChange('privacy_level', value)}
                  options={[
                    { value: 'private', label: 'Private - Minimal visibility' },
                    { value: 'normal', label: 'Normal - Standard visibility' },
                    { value: 'public', label: 'Public - Maximum visibility' }
                  ]}
                />

                <Select
                  label="Language"
                  value={settingsData?.language_preference || 'en'}
                  onChange={(value) => handleSettingsChange('language_preference', value)}
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Spanish' },
                    { value: 'fr', label: 'French' },
                    { value: 'de', label: 'German' }
                  ]}
                />

                <Select
                  label="Timezone"
                  value={settingsData?.timezone || 'UTC'}
                  onChange={(value) => handleSettingsChange('timezone', value)}
                  options={[
                    { value: 'UTC', label: 'UTC' },
                    { value: 'America/New_York', label: 'Eastern Time' },
                    { value: 'America/Chicago', label: 'Central Time' },
                    { value: 'America/Denver', label: 'Mountain Time' },
                    { value: 'America/Los_Angeles', label: 'Pacific Time' }
                  ]}
                />
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Privacy Settings'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'technician' && userProfile?.role === 'technician' && (
            <TechnicianSettings
              technicianProfile={userProfile?.technician_profiles?.[0]}
              onUpdate={() => {
                window.location?.reload();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;