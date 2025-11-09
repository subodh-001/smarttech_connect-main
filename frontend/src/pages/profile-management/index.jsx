import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ProfileHeader from './components/ProfileHeader';
import PersonalInfoSection from './components/PersonalInfoSection';
import AddressSection from './components/AddressSection';
import NotificationSettings from './components/NotificationSettings';
import SecuritySection from './components/SecuritySection';
import { useAuth } from '../../contexts/NewAuthContext';

const ProfileManagement = () => {
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading, fetchUserProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState(null);
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    lastPasswordChange: '',
    loginNotifications: true,
  });
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && user && !userProfile) {
      fetchUserProfile();
    }
  }, [authLoading, user, userProfile, fetchUserProfile]);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    const loadSummary = async () => {
      try {
        const { data } = await axios.get('/api/dashboard/user');
        setDashboardSummary(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load dashboard summary:', err);
        setError('Unable to load full account summary right now.');
        setDashboardSummary(null);
      }
    };

    loadSummary();
  }, [authLoading, user]);

  useEffect(() => {
    if (!userProfile) {
      return;
    }

    const stats = dashboardSummary?.stats || {};
    const summaryUser = dashboardSummary?.user || {};
    const memberSince =
      summaryUser.memberSince ||
      (userProfile.created_at ? new Date(userProfile.created_at).getFullYear() : '');

    setProfileData({
      name:
        userProfile.full_name ||
        userProfile.fullName ||
        summaryUser.name ||
        user?.fullName ||
        'User',
      email: userProfile.email || summaryUser.email || '',
      phone: userProfile.phone || summaryUser.phone || '',
      dateOfBirth: userProfile.dateOfBirth || userProfile.date_of_birth || '',
      emergencyContact: userProfile.emergencyContact || '',
      emergencyPhone: userProfile.emergencyPhone || '',
      profilePhoto: userProfile.avatar_url || userProfile.avatarUrl || '',
      isVerified: userProfile.is_active ?? true,
      stats: {
        totalBookings: stats.totalBookings ?? 0,
        totalSpent: stats.totalSpent ?? 0,
        memberSince: memberSince || '',
      },
    });

    if (!notificationSettings) {
      setNotificationSettings({
        deliveryMethods: {
          push: userProfile.user_settings?.push_notifications ?? true,
          email: userProfile.user_settings?.email_notifications ?? true,
          sms: userProfile.user_settings?.sms_notifications ?? false,
        },
        bookings: {
          newBooking: true,
          statusUpdates: true,
          reminders: true,
          cancellations: true,
        },
        technician: {
          assignment: true,
          location: true,
          arrival: true,
          completion: true,
        },
        payments: {
          invoices: true,
          payments: true,
          refunds: true,
          failures: true,
        },
        marketing: {
          offers: false,
          newsletter: false,
          tips: true,
          surveys: false,
        },
      });
    }

    if (
      addresses.length === 0 &&
      (userProfile.address || userProfile.city || userProfile.postal_code)
    ) {
      setAddresses([
        {
          id: Date.now(),
          label: 'Primary',
          street: userProfile.address || '',
          city: userProfile.city || '',
          state: userProfile.state || '',
          zipCode: userProfile.postal_code || '',
          isDefault: true,
          coordinates: userProfile.coordinates || { lat: 28.6139, lng: 77.209 },
        },
      ]);
    }
  }, [userProfile, dashboardSummary, user, notificationSettings, addresses.length]);

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: 'User' },
    { id: 'addresses', label: 'Addresses', icon: 'MapPin' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    { id: 'security', label: 'Security', icon: 'Shield' },
  ];

  const handleProfileUpdate = async (updatedData) => {
    setProfileData((prev) => (prev ? { ...prev, ...updatedData } : updatedData));
    try {
      await axios.put('/api/users/me', {
        fullName: updatedData.name,
        email: updatedData.email,
        phone: updatedData.phone,
      });
      await fetchUserProfile();
    } catch (err) {
      console.error('Failed to update profile info:', err);
    }
  };

  const handleProfilePhotoUpdate = async (newPhotoUrl) => {
    setProfileData((prev) => (prev ? { ...prev, profilePhoto: newPhotoUrl } : prev));
    try {
      await axios.put('/api/users/me', { avatarUrl: newPhotoUrl });
      await fetchUserProfile();
    } catch (err) {
      console.error('Failed to update profile photo:', err);
    }
  };

  const handleAddressesUpdate = (updatedAddresses) => {
    setAddresses(updatedAddresses);
  };

  const handleNotificationUpdate = async (updatedSettings) => {
    setNotificationSettings(updatedSettings);
    try {
      const delivery = updatedSettings?.deliveryMethods || {};
      await axios.put('/api/users/me/settings', {
        notificationsEnabled: Boolean(delivery.push || delivery.email || delivery.sms),
        emailNotifications: delivery.email ?? true,
        smsNotifications: delivery.sms ?? false,
        pushNotifications: delivery.push ?? true,
      });
      await fetchUserProfile();
    } catch (err) {
      console.error('Failed to update notification settings:', err);
    }
  };

  const handleSecurityUpdate = (updatedSettings) => {
    setSecuritySettings(updatedSettings);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <PersonalInfoSection
            userProfile={profileData}
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

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Please sign in</h2>
          <p className="text-text-secondary">
            You need an account to manage your profile settings.
          </p>
          <Button onClick={() => navigate('/user-login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  if (authLoading || !profileData || !notificationSettings) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-muted border-t-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {error && (
          <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {error}
          </div>
        )}

        <ProfileHeader
          userProfile={profileData}
          onProfilePhotoUpdate={handleProfilePhotoUpdate}
        />

        <div className="bg-surface border border-border rounded-lg mb-6">
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6" aria-label="Profile sections">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-smooth ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                  }`}
                >
                  <Icon
                    name={tab.icon}
                    size={18}
                    color={activeTab === tab.id ? 'var(--color-primary)' : 'currentColor'}
                  />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="md:hidden mb-6">
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium text-sm transition-smooth ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-text-secondary hover:bg-muted/80'
                  }`}
                >
                  <Icon
                    name={tab.icon}
                    size={16}
                    color={activeTab === tab.id ? 'white' : 'currentColor'}
                  />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8">{renderTabContent()}</div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Account Actions</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              iconName="Download"
              iconPosition="left"
              onClick={() => {
                const data = {
                  profile: profileData,
                  addresses,
                  settings: { notifications: notificationSettings, security: securitySettings },
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], {
                  type: 'application/json',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'profile-data.json';
                a.click();
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
                if (
                  confirm(
                    'Are you sure you want to delete your account? This action cannot be undone.'
                  )
                ) {
                  alert(
                    'Account deletion request submitted. You will receive a confirmation email.'
                  );
                }
              }}
            >
              Delete Account
            </Button>
          </div>
          <p className="text-xs text-text-secondary mt-3">
            Account deletion is permanent and cannot be undone. All your data will be removed
            within 30 days.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileManagement;