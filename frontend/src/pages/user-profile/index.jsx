import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import ProfileHeader from '../profile-management/components/ProfileHeader';
import JobDetailsModal from '../profile-management/components/JobDetailsModal';
import { useAuth } from '../../contexts/NewAuthContext';
import {
  Mail,
  Phone,
  MapPin,
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

const buildProfileForm = (profile) => ({
  fullName: profile?.full_name ?? profile?.fullName ?? '',
  email: profile?.email ?? '',
  phone: profile?.phone ?? '',
  address: profile?.address ?? '',
  city: profile?.city ?? '',
  postalCode: profile?.postal_code ?? profile?.postalCode ?? '',
});

const buildSettingsForm = (profile) => ({
  notificationsEnabled: profile?.user_settings?.notifications_enabled ?? true,
  emailNotifications: profile?.user_settings?.email_notifications ?? true,
  smsNotifications: profile?.user_settings?.sms_notifications ?? false,
  pushNotifications: profile?.user_settings?.push_notifications ?? true,
});

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '₹0';
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(value));
  } catch {
    return `₹${value}`;
  }
};

const StatBadge = ({ icon: Icon, label, value }) => (
  <div className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm sm:w-auto">
    <div className="rounded-md bg-blue-100 p-2 text-blue-600">
      <Icon size={18} />
    </div>
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
    </div>
  </div>
);

const EmptyState = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
    <AlertCircle className="mb-3 h-8 w-8 text-slate-400" />
    <h3 className="text-base font-medium text-slate-900">{title}</h3>
    <p className="mt-1 text-sm text-slate-500">{description}</p>
  </div>
);

const kycStatusConfig = {
  not_submitted: {
    title: 'Verification required',
    description:
      'Upload a government-issued ID and a live selfie so we can verify your identity before you begin accepting jobs.',
    badgeLabel: 'Action required',
    badgeClass: 'bg-amber-100 text-amber-700',
  },
  under_review: {
    title: 'Verification in review',
    description:
      'Thanks for submitting your documents. Our compliance team is reviewing them. You will be notified once verification is complete.',
    badgeLabel: 'Under review',
    badgeClass: 'bg-blue-100 text-blue-700',
  },
  approved: {
    title: 'Verification approved',
    description:
      'Your identity has been verified. You can continue accepting jobs without any additional steps.',
    badgeLabel: 'Verified',
    badgeClass: 'bg-emerald-100 text-emerald-700',
  },
  rejected: {
    title: 'Verification needs attention',
    description:
      'We were unable to approve your documents. Please review the feedback below and upload updated files.',
    badgeLabel: 'Update required',
    badgeClass: 'bg-rose-100 text-rose-700',
  },
};

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, userProfile, loading, fetchUserProfile } = useAuth();

  const [profileForm, setProfileForm] = useState(null);
  const [settingsForm, setSettingsForm] = useState(null);
  const [activeServices, setActiveServices] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [allServices, setAllServices] = useState([]);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [jobModalFilter, setJobModalFilter] = useState(null);
  const [jobModalTitle, setJobModalTitle] = useState('Job Details');
  const [fetchingDashboard, setFetchingDashboard] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const isTechnician = useMemo(
    () => (userProfile?.role || user?.role) === 'technician',
    [userProfile, user]
  );
  const [kycInfo, setKycInfo] = useState({ status: 'loading' });
  const [kycUploading, setKycUploading] = useState(false);
  const [kycError, setKycError] = useState(null);
  const [kycSuccess, setKycSuccess] = useState(null);
  const [kycFiles, setKycFiles] = useState({ governmentId: null, selfie: null });
  const [technicianProfile, setTechnicianProfile] = useState(null);
  const [specialtyOptions, setSpecialtyOptions] = useState([]);
  const [expertiseForm, setExpertiseForm] = useState(null);
  const [certificationsInput, setCertificationsInput] = useState('');
  const [expertiseSaving, setExpertiseSaving] = useState(false);
  const [expertiseMessage, setExpertiseMessage] = useState(null);
  const [expertiseError, setExpertiseError] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    if (!loading && user && !userProfile) {
      fetchUserProfile();
    }
  }, [loading, user, userProfile, fetchUserProfile]);

  useEffect(() => {
    if (userProfile) {
      setProfileForm(buildProfileForm(userProfile));
      setSettingsForm(buildSettingsForm(userProfile));
      setProfilePhoto(userProfile.avatarUrl || userProfile.avatar_url || '');
    }
  }, [userProfile]);

  useEffect(() => {
    if (!user) return;

    const loadDashboard = async () => {
      setFetchingDashboard(true);
      try {
        const headers = {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
        };

        if (isTechnician) {
          const { data: requestsData } = await axios.get('/api/service-requests', { headers });
          const requests = Array.isArray(requestsData) ? requestsData : [];
          const activeStatusSet = new Set(['pending', 'confirmed', 'in_progress']);

          const active = requests
            .filter((request) => activeStatusSet.has(request.status))
            .map((request) => ({
              id: request.id || request._id,
              _id: request._id || request.id,
              title: request.title || request.category,
              category: request.title || request.category,
              service: request.service,
              description: request.description,
              location: request.locationAddress,
              locationAddress: request.locationAddress,
              status: request.status,
              scheduledDate: request.scheduledDate,
              createdAt: request.createdAt,
              updatedAt: request.updatedAt,
              finalCost: request.finalCost,
              budgetMax: request.budgetMax,
              budgetMin: request.budgetMin,
              amount: request.finalCost || request.budgetMax || request.budgetMin || null,
              technician: request.technician || null,
              customer: request.customer || null,
              customerId: request.customerId,
              technicianId: request.technicianId,
              partyLabel: 'Customer',
              partyName: request.customer?.name || request.customer?.fullName || request.customerId?.name || request.customer?.email || 'Customer',
            }));

          const completed = requests
            .filter((request) => request.status === 'completed')
            .sort((a, b) => new Date(b.updatedAt || b.completionDate || 0) - new Date(a.updatedAt || a.completionDate || 0));

          const recent = completed.slice(0, 5).map((request) => ({
            id: request.id || request._id,
            _id: request._id || request.id,
            title: request.title || request.category,
            category: request.title || request.category,
            service: request.service,
            description: request.description,
            locationAddress: request.locationAddress,
            status: request.status,
            scheduledDate: request.scheduledDate,
            createdAt: request.createdAt,
            updatedAt: request.updatedAt,
            completionDate: request.completionDate,
            finalCost: request.finalCost,
            budgetMax: request.budgetMax,
            budgetMin: request.budgetMin,
            amount: request.finalCost || request.budgetMax || request.budgetMin || null,
            technician: request.technician || null,
            customer: request.customer || null,
            customerId: request.customerId,
            technicianId: request.technicianId,
            partyLabel: 'Customer',
            partyName: request.customer?.name || request.customer?.fullName || request.customerId?.name || request.customer?.email || 'Customer',
            reviewRating: request.reviewRating,
            reviewComment: request.reviewComment,
          }));

          // Format all services for modal display
          const formattedServices = requests.map((request) => ({
            id: request.id || request._id,
            _id: request._id || request.id,
            title: request.title || request.category,
            category: request.category,
            service: request.service,
            status: request.status,
            description: request.description,
            locationAddress: request.locationAddress || request.location,
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
            partyName: request.customer?.name || request.customer?.fullName || request.customerId?.name || request.customer?.email || 'Customer',
            reviewRating: request.reviewRating,
            reviewComment: request.reviewComment,
          }));

          setAllServices(formattedServices);

          const totalEarned = completed.reduce((sum, request) => sum + (request.finalCost || 0), 0);
          const averageRating =
            completed.length > 0
              ? (
                  completed.reduce((sum, request) => sum + (request.reviewRating || 0), 0) /
                  completed.length
                ).toFixed(1)
              : 0;

          setActiveServices(active);
          setRecentBookings(recent);
          setStats({
            activeJobs: active.length,
            totalBookings: requests.length,
            completedServices: completed.length,
            totalSpent: Number(totalEarned.toFixed(0)),
            moneySaved: Number(totalEarned.toFixed(0)),
            avgRatingGiven: averageRating,
          });
        } else {
          const { data } = await axios.get('/api/dashboard/user', { headers });
          const normalizedActive = (data?.activeServices ?? []).map((service) => ({
            ...service,
            id: service.id || service._id,
            _id: service._id || service.id,
            title: service.title || service.category || service.service,
            locationAddress: service.locationAddress || service.location,
            partyLabel: 'Technician',
            partyName: service?.technician?.name || service?.technicianId?.name || null,
          }));
          const normalizedRecent = (data?.recentBookings ?? []).slice(0, 5).map((booking) => ({
            ...booking,
            id: booking.id || booking._id,
            _id: booking._id || booking.id,
            title: booking.title || booking.category || booking.service,
            locationAddress: booking.locationAddress || booking.location,
            partyLabel: 'Technician',
            partyName: booking?.technician?.name || booking?.technicianId?.name || null,
          }));

          setActiveServices(normalizedActive);
          setRecentBookings(normalizedRecent);
          
          // Format all services for modal display
          const activeServicesFormatted = (data?.activeServices || []).map((service) => ({
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
          
          const recentBookingsFormatted = (data?.recentBookings || []).map((booking) => ({
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
          setAllServices([...activeServicesFormatted, ...recentBookingsFormatted]);
          
          setStats(data?.stats ?? null);
        }
      } catch (error) {
        console.error('Failed to load dashboard overview:', error);
        setActiveServices([]);
        setRecentBookings([]);
        setStats(null);
      } finally {
        setFetchingDashboard(false);
      }
    };

    loadDashboard();
  }, [user, isTechnician]);

  useEffect(() => {
    if (!isTechnician) {
      setKycInfo(null);
      return;
    }

    const loadKyc = async () => {
      try {
        const { data } = await axios.get('/api/technicians/me/kyc', {
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        });
        setKycInfo(data);
      } catch (error) {
        console.error('Failed to load KYC status:', error);
        setKycInfo({ status: 'not_submitted' });
      }
    };

    loadKyc();
  }, [isTechnician]);

  useEffect(() => {
    if (!isTechnician) {
      setTechnicianProfile(null);
      setSpecialtyOptions([]);
      setExpertiseForm(null);
      return;
    }

    const loadTechnicianProfile = async () => {
      try {
        const { data } = await axios.get('/api/technicians/me/profile');
        const profile = data?.technician || {};
        const options = data?.specialties || [];
        setTechnicianProfile(profile);
        setSpecialtyOptions(options);
        setExpertiseForm({
          specialties: profile.specialties || [],
          yearsOfExperience: profile.yearsOfExperience ?? 0,
          serviceRadius: profile.serviceRadius ?? 10,
          hourlyRate: profile.hourlyRate ?? 0,
          bio: profile.bio || '',
          certifications: profile.certifications || [],
        });
        setCertificationsInput((profile.certifications || []).join(', '));
      } catch (error) {
        console.error('Failed to load technician profile:', error);
      }
    };

    loadTechnicianProfile();
  }, [isTechnician]);

  const memberSince = useMemo(() => {
    if (!userProfile?.created_at && !userProfile?.createdAt) return null;
    const source = userProfile.created_at ?? userProfile.createdAt;
    try {
      return new Date(source).getFullYear();
    } catch {
      return null;
    }
  }, [userProfile]);

  const handleKycFileChange = (field, file) => {
    setKycFiles((prev) => ({
      ...prev,
      [field]: file || null,
    }));
    setKycError(null);
    setKycSuccess(null);
  };

  const handleSubmitKycDocuments = async () => {
    if (!kycFiles.governmentId) {
      setKycError('Please select a government ID document before submitting.');
      return;
    }

    const formData = new FormData();
    formData.append('governmentId', kycFiles.governmentId);
    if (kycFiles.selfie) {
      formData.append('selfie', kycFiles.selfie);
    }

    try {
      setKycUploading(true);
      setKycError(null);
      setKycSuccess(null);
      const { data } = await axios.post('/api/technicians/me/kyc', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setKycInfo(data);
      setKycSuccess(
        'Documents submitted successfully. We will notify you once verification is completed.'
      );
      setKycFiles({ governmentId: null, selfie: null });
    } catch (error) {
      console.error('Failed to submit KYC documents:', error);
      setKycError(
        error.response?.data?.error ||
          'We could not upload the documents. Please try again or contact support.'
      );
    } finally {
      setKycUploading(false);
    }
  };

  const toggleSpecialty = (id) => {
    setExpertiseForm((prev) => {
      if (!prev) return prev;
      const set = new Set(prev.specialties || []);
      if (set.has(id)) {
        set.delete(id);
      } else {
        set.add(id);
      }
      return {
        ...prev,
        specialties: Array.from(set),
      };
    });
    setExpertiseMessage(null);
    setExpertiseError(null);
  };

  const handleExpertiseFieldChange = (field, value) => {
    setExpertiseForm((prev) => (prev ? { ...prev, [field]: value } : prev));
    setExpertiseMessage(null);
    setExpertiseError(null);
  };

  const handleExpertiseReset = () => {
    if (!technicianProfile) return;
    setExpertiseForm({
      specialties: technicianProfile.specialties || [],
      yearsOfExperience: technicianProfile.yearsOfExperience ?? 0,
      serviceRadius: technicianProfile.serviceRadius ?? 10,
      hourlyRate: technicianProfile.hourlyRate ?? 0,
      bio: technicianProfile.bio || '',
      certifications: technicianProfile.certifications || [],
    });
    setCertificationsInput((technicianProfile.certifications || []).join(', '));
    setExpertiseMessage(null);
    setExpertiseError(null);
  };

  const handleExpertiseSave = async () => {
    if (!expertiseForm) return;
    if (!expertiseForm.specialties || expertiseForm.specialties.length === 0) {
      setExpertiseError('Select at least one service you provide.');
      return;
    }

    setExpertiseSaving(true);
    setExpertiseMessage(null);
    setExpertiseError(null);

    try {
      const payload = {
        ...expertiseForm,
        certifications: certificationsInput
          ? certificationsInput.split(',').map((item) => item.trim()).filter(Boolean)
          : [],
      };
      const { data } = await axios.put('/api/technicians/me/profile', payload);
      const profile = data?.technician || payload;
      setTechnicianProfile(profile);
      setExpertiseForm({
        specialties: profile.specialties || [],
        yearsOfExperience: profile.yearsOfExperience ?? 0,
        serviceRadius: profile.serviceRadius ?? 10,
        hourlyRate: profile.hourlyRate ?? 0,
        bio: profile.bio || '',
        certifications: profile.certifications || [],
      });
      setCertificationsInput((profile.certifications || []).join(', '));
      setExpertiseMessage('Service expertise updated successfully.');
    } catch (error) {
      console.error('Failed to update technician profile:', error);
      setExpertiseError(error.response?.data?.error || 'Failed to update expertise. Please try again.');
    } finally {
      setExpertiseSaving(false);
    }
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    if (!profileForm) return;

    setSavingProfile(true);
    setFeedback(null);

    try {
      await axios.put('/api/users/me', {
        fullName: profileForm.fullName?.trim(),
        phone: profileForm.phone?.trim(),
        address: profileForm.address?.trim(),
        city: profileForm.city?.trim(),
        postalCode: profileForm.postalCode?.trim(),
      });

      await fetchUserProfile();
      setFeedback({ type: 'success', message: 'Profile updated successfully.' });
    } catch (error) {
      console.error('Failed to update profile:', error);
      setFeedback({
        type: 'error',
        message:
          error.response?.data?.error || 'Unable to update your profile right now. Please try again.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSettingsSubmit = async (event) => {
    event.preventDefault();
    if (!settingsForm) return;

    setSavingSettings(true);
    setFeedback(null);

    try {
      await axios.put('/api/users/me/settings', {
        notificationsEnabled: settingsForm.notificationsEnabled,
        emailNotifications: settingsForm.emailNotifications,
        smsNotifications: settingsForm.smsNotifications,
        pushNotifications: settingsForm.pushNotifications,
      });

      await fetchUserProfile();
      setFeedback({ type: 'success', message: 'Notification preferences saved.' });
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      setFeedback({
        type: 'error',
        message:
          error.response?.data?.error ||
          'Unable to update notification preferences right now. Please try again.',
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSettingToggle = (field) => {
    setSettingsForm((prev) => ({
      ...prev,
      [field]: !prev?.[field],
    }));
  };

  const handleProfilePhotoUpdate = async (newPhotoUrl) => {
    setProfilePhoto(newPhotoUrl);
    try {
      await axios.put('/api/users/me', { avatarUrl: newPhotoUrl });
      await fetchUserProfile();
    } catch (err) {
      console.error('Failed to update profile photo:', err);
    }
  };

  const profileHeaderData = useMemo(() => {
    if (!profileForm) {
      return {
        name: 'User',
        email: '',
        phone: '',
        profilePhoto: profilePhoto || '',
        isVerified: true,
        stats: {
          activeJobs: 0,
          totalBookings: 0,
          completedServices: 0,
          totalSpent: 0,
          memberSince: '',
        },
      };
    }
    return {
      name: profileForm.fullName || 'User',
      email: profileForm.email || '',
      phone: profileForm.phone || '',
      profilePhoto: profilePhoto || '',
      isVerified: userProfile?.isActive ?? true,
      stats: {
        activeJobs: stats?.activeJobs ?? 0,
        totalBookings: stats?.totalBookings ?? 0,
        completedServices: stats?.completedServices ?? 0,
        totalSpent: stats?.totalSpent ?? 0,
        memberSince: memberSince ?? '',
      },
    };
  }, [profileForm, profilePhoto, userProfile, stats, memberSince]);

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

  const handleServiceClick = (service) => {
    // Find the full service details from allServices
    const fullService = allServices.find(
      (s) => (s.id === service.id || s._id === service._id || s.id === service._id || s._id === service.id)
    ) || service;
    
    setJobModalFilter([fullService]);
    setJobModalTitle('Service Details');
    setJobModalOpen(true);
  };

  const handleBookingClick = (booking) => {
    // Find the full booking details from allServices
    const fullBooking = allServices.find(
      (b) => (b.id === booking.id || b._id === booking._id || b.id === booking._id || b._id === booking.id)
    ) || booking;
    
    setJobModalFilter([fullBooking]);
    setJobModalTitle('Booking Details');
    setJobModalOpen(true);
  };

  const kycStatus = isTechnician ? kycInfo?.status || 'not_submitted' : null;
  const kycMeta = kycStatus ? kycStatusConfig[kycStatus] : null;
  const canSubmitKyc = !!kycFiles.governmentId && kycStatus !== 'under_review';
  const showKycUpload = ['not_submitted', 'rejected'].includes(kycStatus);

  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">You need to sign in</h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Access to account details is available only for authenticated users. Please log in to
            continue.
          </p>
          <Button className="mt-6" onClick={() => navigate('/user-login')}>
            Go to login
          </Button>
        </div>
      </div>
    );
  }

  if (loading || !profileForm || !settingsForm) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center py-24">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Header user={user} />
      <div className="mx-auto mt-16 w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Quick Access to Profile Management */}
        <div className="mb-6 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <div className="flex items-center space-x-3">
            <Icon name="Settings" size={20} className="text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">Manage Profile Settings</p>
              <p className="text-xs text-blue-700">
                {isTechnician 
                  ? 'Access payment settings, addresses, and more' 
                  : 'Access addresses, notifications, and security settings'}
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/profile-management')}
            iconName="ArrowRight"
            iconPosition="right"
          >
            Go to Settings
          </Button>
        </div>
        
        {/* Profile Header with Photo Change */}
        <ProfileHeader
          userProfile={profileHeaderData}
          onProfilePhotoUpdate={handleProfilePhotoUpdate}
          onStatCardClick={handleStatCardClick}
        />

        {isTechnician && kycStatus && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-[2fr_1.5fr]">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{kycMeta?.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {kycMeta?.description}
                </p>

                {kycInfo?.submittedAt ? (
                  <p className="mt-3 text-xs text-slate-500">
                    Submitted on{' '}
                    <span className="font-medium text-slate-700">
                      {new Date(kycInfo.submittedAt).toLocaleString()}
                    </span>
                    {kycInfo?.reviewedAt
                      ? ` • Reviewed ${new Date(kycInfo.reviewedAt).toLocaleString()}`
                      : ''}
                  </p>
                ) : null}

                {kycInfo?.documents?.governmentId ? (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Submitted documents
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                      <a
                        href={resolveDocumentUrl(kycInfo.documents.governmentId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-500"
                      >
                        View government ID
                      </a>
                      {kycInfo.documents.selfie ? (
                        <a
                          href={resolveDocumentUrl(kycInfo.documents.selfie)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-500"
                        >
                          View selfie
                        </a>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {kycInfo?.feedback ? (
                  <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    <p className="font-semibold">Feedback</p>
                    <p className="mt-1 leading-6">{kycInfo.feedback}</p>
                  </div>
                ) : null}
              </div>

              {showKycUpload ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">Upload documents</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Accepted formats: PDF, JPG, PNG. Maximum file size 5MB.
                  </p>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="text-xs font-medium text-slate-600">Government ID *</label>
                      <div className="mt-2 flex items-center gap-3">
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(event) =>
                            handleKycFileChange('governmentId', event.target.files?.[0] || null)
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
                        />
                      </div>
                      {kycFiles.governmentId ? (
                        <p className="mt-1 text-xs text-slate-500">
                          Selected: {kycFiles.governmentId.name}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-600">Live selfie</label>
                      <div className="mt-2 flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) =>
                            handleKycFileChange('selfie', event.target.files?.[0] || null)
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
                        />
                      </div>
                      {kycFiles.selfie ? (
                        <p className="mt-1 text-xs text-slate-500">
                          Selected: {kycFiles.selfie.name}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <Button
                    className="mt-4 w-full"
                    onClick={handleSubmitKycDocuments}
                    disabled={!canSubmitKyc || kycUploading}
                    loading={kycUploading}
                  >
                    Submit for verification
                  </Button>

                  {kycError ? (
                    <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                      {kycError}
                    </div>
                  ) : null}
                  {kycSuccess ? (
                    <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                      {kycSuccess}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  {kycStatus === 'under_review'
                    ? 'Your documents are currently under review. You will be able to re-upload if we need more information.'
                    : 'Verification is complete. You can re-submit documents by contacting support if any detail changes.'}
                </div>
              )}
            </div>
          </section>
        )}

        {isTechnician && expertiseForm && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Service expertise</h2>
              <p className="text-sm text-slate-600">
                Choose the services you offer so customers can book you for the right jobs. This also helps us
                match new requests with your skills.
              </p>
            </div>

            {expertiseError ? (
              <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {expertiseError}
              </div>
            ) : null}
            {expertiseMessage ? (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                {expertiseMessage}
              </div>
            ) : null}

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                Select specialties
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {specialtyOptions.map((option) => {
                  const selected = expertiseForm.specialties?.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleSpecialty(option.id)}
                      className={`rounded-lg border px-4 py-3 text-left hover:border-blue-400 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        selected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <p className="text-sm font-medium">{option.label}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {selected ? 'Added to your services' : 'Tap to add this service'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Experience (years)</label>
                <Input
                  type="number"
                  min={0}
                  max={60}
                  value={expertiseForm.yearsOfExperience}
                  onChange={(event) =>
                    handleExpertiseFieldChange('yearsOfExperience', Number(event.target.value))
                  }
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Service radius (km)</label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={expertiseForm.serviceRadius}
                  onChange={(event) =>
                    handleExpertiseFieldChange('serviceRadius', Number(event.target.value))
                  }
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hourly rate (₹)</label>
                <Input
                  type="number"
                  min={0}
                  max={10000}
                  value={expertiseForm.hourlyRate}
                  onChange={(event) => handleExpertiseFieldChange('hourlyRate', Number(event.target.value))}
                />
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">About your services</label>
                <textarea
                  value={expertiseForm.bio}
                  onChange={(event) => handleExpertiseFieldChange('bio', event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  placeholder="Tell customers about your expertise, brands you support, or any unique offerings."
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Certifications (comma separated)
                </label>
                <textarea
                  value={certificationsInput}
                  onChange={(event) => setCertificationsInput(event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  placeholder="e.g. Blue Star AC Pro, Certified Plumber, ISO cleaning partner"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleExpertiseReset} disabled={expertiseSaving}>
                Reset
              </Button>
              <Button onClick={handleExpertiseSave} loading={expertiseSaving} disabled={expertiseSaving}>
                Save expertise
              </Button>
            </div>
          </section>
        )}

        {feedback ? (
          <div
            className={`mt-6 rounded-lg border px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
            <div className="mb-6 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Personal information</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Update the information technicians use to reach you.
                </p>
              </div>
            </div>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Full name"
                  value={profileForm.fullName}
                  onChange={(event) =>
                    setProfileForm((prev) => ({ ...prev, fullName: event.target.value }))
                  }
                  required
                />
                <Input label="Email" value={profileForm.email} disabled type="email" />
                <Input
                  label="Phone number"
                  value={profileForm.phone}
                  onChange={(event) =>
                    setProfileForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                />
                <Input
                  label="City"
                  value={profileForm.city}
                  onChange={(event) =>
                    setProfileForm((prev) => ({ ...prev, city: event.target.value }))
                  }
                />
              </div>
              <Input
                label="Street address"
                value={profileForm.address}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, address: event.target.value }))
                }
              />
              <Input
                label="Postal code"
                value={profileForm.postalCode}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, postalCode: event.target.value }))
                }
              />
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setProfileForm(buildProfileForm(userProfile))}
                  disabled={savingProfile}
                >
                  Reset
                </Button>
                <Button type="submit" loading={savingProfile}>
                  Save changes
                </Button>
              </div>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900">Notification preferences</h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose how you want to receive reminders and service updates.
            </p>
            <form onSubmit={handleSettingsSubmit} className="mt-6 space-y-4">
              <ToggleRow
                label="Enable notifications"
                description="Pause or resume all SmartTech notifications."
                checked={settingsForm.notificationsEnabled}
                onChange={() => handleSettingToggle('notificationsEnabled')}
              />
              <ToggleRow
                label="Email updates"
                description="Booking confirmations, invoices, and technician updates."
                checked={settingsForm.emailNotifications}
                onChange={() => handleSettingToggle('emailNotifications')}
              />
              <ToggleRow
                label="SMS alerts"
                description="Urgent technician arrival and service status changes."
                checked={settingsForm.smsNotifications}
                onChange={() => handleSettingToggle('smsNotifications')}
              />
              <ToggleRow
                label="Push notifications"
                description="Reminders and offers inside SmartTech Connect."
                checked={settingsForm.pushNotifications}
                onChange={() => handleSettingToggle('pushNotifications')}
              />
              <div className="flex justify-end">
                <Button type="submit" loading={savingSettings}>
                  Save preferences
                </Button>
              </div>
            </form>
          </section>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Active services</h2>
              {fetchingDashboard ? (
                <span className="text-xs text-slate-400">Refreshing…</span>
              ) : null}
            </div>
            {activeServices.length === 0 ? (
              <EmptyState
                title="No active service requests"
                description="When you create a request, you’ll see the live technician updates here."
              />
            ) : (
              <ul className="mt-4 space-y-3">
                {activeServices.map((service) => (
                  <li
                    key={service.id || service._id}
                    onClick={() => handleServiceClick(service)}
                    className="flex flex-col rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between cursor-pointer hover:bg-slate-100 hover:border-primary/30 transition-all"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{service.category || service.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{service.location || service.locationAddress}</p>
                    </div>
                    <div className="mt-3 flex items-center gap-3 sm:mt-0">
                      {(service.partyName || service.technician?.name) ? (
                        <span className="text-xs text-slate-500">
                          {(service.partyLabel || 'Technician')}:{' '}
                          <span className="font-medium">
                            {service.partyName || service.technician?.name}
                          </span>
                        </span>
                      ) : null}
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {service.status?.replace('_', ' ') || service.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900">Recent bookings</h2>
            {recentBookings.length === 0 ? (
              <EmptyState
                title="No completed bookings yet"
                description="Once your service requests are completed, receipts and ratings will appear here."
              />
            ) : (
              <ul className="mt-4 space-y-3">
                {recentBookings.map((booking) => (
                  <li
                    key={booking.id || booking._id}
                    onClick={() => handleBookingClick(booking)}
                    className="rounded-lg border border-slate-200 px-4 py-3 cursor-pointer hover:bg-slate-50 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900">{booking.category || booking.title}</p>
                      <span className="text-xs uppercase tracking-wide text-slate-400">
                        {booking.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {booking.partyName || booking.technician?.name
                        ? `${isTechnician ? booking.partyLabel || 'Customer' : booking.partyLabel || 'Technician'} • ${
                            booking.partyName || booking.technician?.name
                          }`
                        : isTechnician
                        ? 'Waiting for customer confirmation'
                        : 'Technician assignment pending'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {booking.amount ? formatCurrency(booking.amount) : 'Awaiting invoice'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
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

const ToggleRow = ({ label, description, checked, onChange }) => (
  <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-slate-300">
    <div>
      <p className="text-sm font-medium text-slate-900">{label}</p>
      {description ? <p className="mt-1 text-xs text-slate-500">{description}</p> : null}
    </div>
    <input
      type="checkbox"
      checked={Boolean(checked)}
      onChange={onChange}
      className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
    />
  </label>
);

export default UserProfile;
const resolveDocumentUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const apiBase =
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') ||
    (window.location.origin.includes('localhost:5173') ? 'http://localhost:5000' : window.location.origin);
  return `${apiBase.replace(/\/$/, '')}${url}`;
};
