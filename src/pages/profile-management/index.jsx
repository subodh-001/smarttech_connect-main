import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ProfileHeader from './components/ProfileHeader';
import PersonalInfoSection from './components/PersonalInfoSection';
import AddressSection from './components/AddressSection';
import NotificationSettings from './components/NotificationSettings';
import SecuritySection from './components/SecuritySection';

const ProfileManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [userProfile, setUserProfile] = useState({
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1990-05-15",
    emergencyContact: "Michael Johnson",
    emergencyPhone: "+1 (555) 987-6543",
    profilePhoto: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    isVerified: true,
    stats: {
      totalBookings: 24,
      totalSpent: "1,250",
      memberSince: "2023"
    }
  });

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      label: "Home",
      street: "123 Oak Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      isDefault: true,
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    {
      id: 2,
      label: "Office",
      street: "456 Business Ave",
      city: "New York",
      state: "NY",
      zipCode: "10002",
      isDefault: false,
      coordinates: { lat: 40.7589, lng: -73.9851 }
    }
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    deliveryMethods: {
      push: true,
      email: true,
      sms: false
    },
    bookings: {
      newBooking: true,
      statusUpdates: true,
      reminders: true,
      cancellations: true
    },
    technician: {
      assignment: true,
      location: true,
      arrival: true,
      completion: true
    },
    payments: {
      invoices: true,
      payments: true,
      refunds: true,
      failures: true
    },
    marketing: {
      offers: false,
      newsletter: false,
      tips: true,
      surveys: false
    }
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    lastPasswordChange: "2024-06-15",
    loginNotifications: true
  });

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: 'User' },
    { id: 'addresses', label: 'Addresses', icon: 'MapPin' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    { id: 'security', label: 'Security', icon: 'Shield' }
  ];

  const handleProfileUpdate = (updatedData) => {
    setUserProfile(prev => ({ ...prev, ...updatedData }));
  };

  const handleProfilePhotoUpdate = (newPhotoUrl) => {
    setUserProfile(prev => ({ ...prev, profilePhoto: newPhotoUrl }));
  };

  const handleAddressesUpdate = (updatedAddresses) => {
    setAddresses(updatedAddresses);
  };

  const handleNotificationUpdate = (updatedSettings) => {
    setNotificationSettings(updatedSettings);
  };

  const handleSecurityUpdate = (updatedSettings) => {
    setSecuritySettings(updatedSettings);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <PersonalInfoSection
            userProfile={userProfile}
            onUpdateProfile={handleProfileUpdate}
          />
        );
      case 'addresses':
        return (
          <AddressSection
            addresses={addresses}
            onUpdateAddresses={handleAddressesUpdate}
          />
        );
      case 'notifications':
        return (
          <NotificationSettings
            settings={notificationSettings}
            onUpdateSettings={handleNotificationUpdate}
          />
        );
      case 'security':
        return (
          <SecuritySection
            securitySettings={securitySettings}
            onUpdateSecurity={handleSecurityUpdate}
          />
        );
      default:
        return null;
    }
  };

  return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Profile Management</h1>
              <p className="text-text-secondary mt-2">
                Manage your personal information and account settings
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/user-dashboard')}
              iconName="ArrowLeft"
              iconPosition="left"
            >
              Back to Dashboard
            </Button>
          </div>

          {/* Profile Header */}
          <ProfileHeader
            userProfile={userProfile}
            onProfilePhotoUpdate={handleProfilePhotoUpdate}
          />

          {/* Tab Navigation */}
          <div className="bg-surface border border-border rounded-lg mb-6">
            <div className="border-b border-border">
              <nav className="flex space-x-8 px-6" aria-label="Profile sections">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-smooth ${
                      activeTab === tab?.id
                        ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                    }`}
                  >
                    <Icon 
                      name={tab?.icon} 
                      size={18}
                      color={activeTab === tab?.id ? 'var(--color-primary)' : 'currentColor'}
                    />
                    <span>{tab?.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Mobile Tab Navigation */}
          <div className="md:hidden mb-6">
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-2">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium text-sm transition-smooth ${
                      activeTab === tab?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-text-secondary hover:bg-muted/80'
                    }`}
                  >
                    <Icon 
                      name={tab?.icon} 
                      size={16}
                      color={activeTab === tab?.id ? 'white' : 'currentColor'}
                    />
                    <span>{tab?.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mb-8">
            {renderTabContent()}
          </div>

          {/* Account Actions */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Account Actions</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                iconName="Download"
                iconPosition="left"
                onClick={() => {
                  // Mock download functionality
                  const data = {
                    profile: userProfile,
                    addresses: addresses,
                    settings: { notifications: notificationSettings, security: securitySettings }
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'profile-data.json';
                  a?.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Download My Data
              </Button>
              
              <Button
                variant="destructive"
                iconName="Trash2"
                iconPosition="left"
                onClick={() => {
                  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    // Mock account deletion
                    alert('Account deletion request submitted. You will receive a confirmation email.');
                  }
                }}
              >
                Delete Account
              </Button>
            </div>
            <p className="text-xs text-text-secondary mt-3">
              Account deletion is permanent and cannot be undone. All your data will be removed within 30 days.
            </p>
          </div>
        </div>
      </div>
  );
};

export default ProfileManagement;