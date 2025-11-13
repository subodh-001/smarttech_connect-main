import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ProfileHeader from './components/ProfileHeader';
import PersonalInfoSection from './components/PersonalInfoSection';
import AddressSection from './components/AddressSection';
import NotificationSettings from './components/NotificationSettings';
import SecuritySection from './components/SecuritySection';
import PayoutSettingsSection from './components/PayoutSettingsSection';
import JobDetailsModal from './components/JobDetailsModal';
import { useAuth } from '../../contexts/NewAuthContext';

const ProfileManagement = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, userProfile, loading: authLoading, fetchUserProfile } = useAuth();

  // Get initial tab from URL params, default to 'personal'
  const [activeTab, setActiveTab] = useState(() => {
    const tabFromUrl = searchParams.get('tab');
    return tabFromUrl || 'personal';
  });

  // Update active tab when URL param changes
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, activeTab]);
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
  const [allServices, setAllServices] = useState([]);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [jobModalFilter, setJobModalFilter] = useState(null);
  const [jobModalTitle, setJobModalTitle] = useState('Job Details');

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
        const isTechnician = user?.role === 'technician' || user?.type === 'technician';
        
        if (isTechnician) {
          // For technicians, fetch service requests to calculate stats
          const { data: requestsData } = await axios.get('/api/service-requests');
          const requests = Array.isArray(requestsData) ? requestsData : [];
          
          const activeStatusSet = new Set(['pending', 'confirmed', 'in_progress']);
          const activeJobs = requests.filter((r) => activeStatusSet.has(r.status)).length;
          const completedServices = requests.filter((r) => r.status === 'completed').length;
          const totalBookings = requests.length;
          
          // Format all services for modal display
          const formattedServices = requests.map((request) => ({
            id: request.id || request._id,
            _id: request._id || request.id,
            title: request.title || request.category,
            category: request.category,
            service: request.service,
            status: request.status,
            description: request.description,
            locationAddress: request.locationAddress,
            scheduledDate: request.scheduledDate,
            createdAt: request.createdAt,
            updatedAt: request.updatedAt,
            completionDate: request.completionDate,
            finalCost: request.finalCost,
            budgetMax: request.budgetMax,
            budgetMin: request.budgetMin,
            amount: request.finalCost || request.budgetMax || request.budgetMin,
            customer: request.customer,
            customerId: request.customerId,
            technician: request.technician,
            technicianId: request.technicianId,
            partyLabel: 'Customer',
            partyName: request.customer?.name || request.customer?.fullName || request.customerId?.name || 'Customer',
            reviewRating: request.reviewRating,
            reviewComment: request.reviewComment,
          }));
          
          setAllServices(formattedServices);
          
          setDashboardSummary({
            stats: {
              activeJobs,
              completedServices,
              totalBookings,
            },
          });
        } else {
          // For regular users, use the dashboard API
          const { data } = await axios.get('/api/dashboard/user');
          
          // Format services for modal display
          const activeServices = (data?.activeServices || []).map((service) => ({
            id: service.id || service._id,
            _id: service._id || service.id,
            title: service.title || service.category || service.service,
            category: service.category,
            service: service.service,
            status: service.status,
            description: service.description,
            locationAddress: service.locationAddress,
            scheduledDate: service.scheduledDate,
            createdAt: service.createdAt,
            updatedAt: service.updatedAt,
            completionDate: service.completionDate,
            finalCost: service.finalCost,
            budgetMax: service.budgetMax,
            budgetMin: service.budgetMin,
            amount: service.finalCost || service.budgetMax || service.budgetMin,
            technician: service.technician,
            technicianId: service.technicianId,
            partyLabel: 'Technician',
            partyName: service.technician?.name || service.technicianId?.name || 'Technician',
          }));
          
          const recentBookings = (data?.recentBookings || []).map((booking) => ({
            id: booking.id || booking._id,
            _id: booking._id || booking.id,
            title: booking.title || booking.category || booking.service,
            category: booking.category,
            service: booking.service,
            status: booking.status || 'completed',
            description: booking.description,
            locationAddress: booking.locationAddress,
            scheduledDate: booking.scheduledDate,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
            completionDate: booking.completionDate,
            finalCost: booking.finalCost,
            budgetMax: booking.budgetMax,
            budgetMin: booking.budgetMin,
            amount: booking.finalCost || booking.budgetMax || booking.budgetMin,
            technician: booking.technician,
            technicianId: booking.technicianId,
            partyLabel: 'Technician',
            partyName: booking.technician?.name || booking.technicianId?.name || 'Technician',
          }));
          
          // Combine all services for modal
          setAllServices([...activeServices, ...recentBookings]);
          
          setDashboardSummary(data);
        }
        setError(null);
      } catch (err) {
        console.error('Failed to load dashboard summary:', err);
        setError('Unable to load full account summary right now.');
        setDashboardSummary(null);
      }
    };

    const loadNotificationSettings = async () => {
      try {
        const { data } = await axios.get('/api/users/me/settings');
        if (data) {
          setNotificationSettings({
            deliveryMethods: {
              push: data.deliveryMethods?.push ?? data.pushNotifications ?? true,
              email: data.deliveryMethods?.email ?? data.emailNotifications ?? true,
              sms: data.deliveryMethods?.sms ?? data.smsNotifications ?? false,
            },
            bookings: data.bookings || {
              newBooking: true,
              statusUpdates: true,
              reminders: true,
              cancellations: true,
            },
            technician: data.technician || {
              assignment: true,
              location: true,
              arrival: true,
              completion: true,
            },
            payments: data.payments || {
              invoices: true,
              payments: true,
              refunds: true,
              failures: true,
            },
            marketing: data.marketing || {
              offers: false,
              newsletter: false,
              tips: true,
              surveys: false,
            },
          });
        }
      } catch (err) {
        console.error('Failed to load notification settings:', err);
        // Use defaults if API fails
      }
    };

    loadSummary();
    loadNotificationSettings();
  }, [authLoading, user]);

  useEffect(() => {
    if (!userProfile) {
      return;
    }

    const stats = dashboardSummary?.stats || {};
    const summaryUser = dashboardSummary?.user || {};
    const isTechnician = user?.role === 'technician' || user?.type === 'technician';
    
    // Calculate member since year
    const memberSince = userProfile.created_at 
      ? new Date(userProfile.created_at).getFullYear() 
      : (userProfile.createdAt 
        ? new Date(userProfile.createdAt).getFullYear() 
        : new Date().getFullYear());

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
      role: isTechnician ? 'technician' : (user?.role || user?.type || 'user'),
      stats: {
        activeJobs: stats.activeJobs ?? 0,
        completedServices: stats.completedServices ?? 0,
        totalBookings: stats.totalBookings ?? 0,
        memberSince: memberSince || new Date().getFullYear(),
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

  const isTechnician = user?.role === 'technician' || user?.type === 'technician' || userProfile?.role === 'technician';
  
  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: 'User' },
    { id: 'addresses', label: 'Addresses', icon: 'MapPin' },
    ...(isTechnician ? [{ id: 'payment', label: 'Payment', icon: 'DollarSign' }] : []),
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
    // Update UI immediately
    setProfileData((prev) => (prev ? { ...prev, profilePhoto: newPhotoUrl } : null));
    
    // Update user context if available
    try {
      const stored = localStorage.getItem('smarttech_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.avatarUrl = newPhotoUrl;
        localStorage.setItem('smarttech_user', JSON.stringify(parsed));
      }
    } catch (storageError) {
      console.warn('Failed to update localStorage:', storageError);
    }
    
    // The ProfileHeader component already handles the backend upload
    // So we don't need to do it here to avoid double uploads
    // Just refresh the profile after a delay to get the latest data
    setTimeout(async () => {
      try {
        await fetchUserProfile();
      } catch (err) {
        console.error('Failed to refresh profile:', err);
      }
    }, 1000);
  };

  const handleAddressesUpdate = (updatedAddresses) => {
    setAddresses(updatedAddresses);
  };

  const handleNotificationUpdate = async (updatedSettings) => {
    setNotificationSettings(updatedSettings);
    // The NotificationSettings component now handles the API call directly
    // This is just for state synchronization
    try {
      await fetchUserProfile();
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  const handleSecurityUpdate = (updatedSettings) => {
    setSecuritySettings(updatedSettings);
  };

  const handleStatCardClick = (statType) => {
    if (!allServices || allServices.length === 0) {
      return;
    }

    let filteredJobs = [];
    let title = 'Job Details';

    switch (statType) {
      case 'activeJobs':
        filteredJobs = allServices.filter((job) =>
          ['pending', 'confirmed', 'in_progress'].includes(job.status)
        );
        title = 'Active Jobs';
        break;
      case 'completed':
        filteredJobs = allServices.filter((job) => job.status === 'completed');
        title = 'Completed Jobs';
        break;
      case 'totalBookings':
        filteredJobs = allServices;
        title = 'All Bookings';
        break;
      default:
        filteredJobs = allServices;
    }

    setJobModalFilter(filteredJobs);
    setJobModalTitle(title);
    setJobModalOpen(true);
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
      case 'payment':
        return (
          <PayoutSettingsSection
            userProfile={profileData}
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 relative z-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Profile Management</h1>
            <p className="text-text-secondary mt-2">
              Manage your personal information and account settings
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/account')}
            iconName="ArrowLeft"
            iconPosition="left"
          >
            Back to Profile
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
          onStatCardClick={handleStatCardClick}
        />

        <div className="bg-surface border border-border rounded-lg mb-6">
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6" aria-label="Profile sections">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    // Update URL params
                    const params = new URLSearchParams(searchParams);
                    params.set('tab', tab.id);
                    setSearchParams(params);
                  }}
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
                  onClick={() => {
                    setActiveTab(tab.id);
                    // Update URL params
                    const params = new URLSearchParams(searchParams);
                    params.set('tab', tab.id);
                    setSearchParams(params);
                  }}
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

      {/* Job Details Modal */}
      <JobDetailsModal
        isOpen={jobModalOpen}
        onClose={() => setJobModalOpen(false)}
        jobs={jobModalFilter || []}
        title={jobModalTitle}
      />
    </div>
  );
};

export default ProfileManagement;