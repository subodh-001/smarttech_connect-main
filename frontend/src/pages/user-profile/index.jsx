import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
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

  useEffect(() => {
    if (!loading && user && !userProfile) {
      fetchUserProfile();
    }
  }, [loading, user, userProfile, fetchUserProfile]);

  useEffect(() => {
    if (userProfile) {
      setProfileForm(buildProfileForm(userProfile));
      setSettingsForm(buildSettingsForm(userProfile));
    }
  }, [userProfile]);

  useEffect(() => {
    if (!user) return;

    const loadDashboard = async () => {
      setFetchingDashboard(true);
      try {
        const { data } = await axios.get('/api/dashboard/user', {
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        });

        setActiveServices(data?.activeServices ?? []);
        setRecentBookings((data?.recentBookings ?? []).slice(0, 5));
        setStats(data?.stats ?? null);
      } catch (error) {
        console.error('Failed to load dashboard overview:', error);
      } finally {
        setFetchingDashboard(false);
      }
    };

    loadDashboard();
  }, [user]);

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
        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8 sm:py-7">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white sm:h-20 sm:w-20">
                {(profileForm.fullName || profileForm.email)?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                  {profileForm.fullName || 'Your account'}
                </h1>
                <p className="flex items-center gap-2 text-sm text-slate-500">
                  <Mail size={16} className="text-slate-400" />
                  {profileForm.email}
                </p>
                {profileForm.phone ? (
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <Phone size={16} className="text-slate-400" />
                    {profileForm.phone}
                  </p>
                ) : null}
                {isTechnician && kycMeta ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${kycMeta.badgeClass}`}
                    >
                      {kycMeta.badgeLabel}
                    </span>
                    <span className="text-xs text-slate-500">{kycMeta.title}</span>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2 sm:gap-3">
              <StatBadge icon={Activity} label="Active jobs" value={activeServices.length} />
              <StatBadge icon={CheckCircle2} label="Completed" value={stats?.completedServices ?? 0} />
              <StatBadge icon={Calendar} label="Total bookings" value={stats?.totalBookings ?? 0} />
              <StatBadge icon={Clock} label="Member since" value={memberSince ?? '—'} />
            </div>
          </div>
        </section>

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
                        href={kycInfo.documents.governmentId}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-500"
                      >
                        View government ID
                      </a>
                      {kycInfo.documents.selfie ? (
                        <a
                          href={kycInfo.documents.selfie}
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
                    key={service.id}
                    className="flex flex-col rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{service.category}</p>
                      <p className="mt-1 text-xs text-slate-500">{service.location}</p>
                    </div>
                    <div className="mt-3 flex items-center gap-3 sm:mt-0">
                      {service.technician ? (
                        <span className="text-xs text-slate-500">
                          Technician: <span className="font-medium">{service.technician.name}</span>
                        </span>
                      ) : null}
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {service.status.replace('_', ' ')}
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
                  <li key={booking.id} className="rounded-lg border border-slate-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900">{booking.category}</p>
                      <span className="text-xs uppercase tracking-wide text-slate-400">
                        {booking.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {booking.technician?.name
                        ? `Technician • ${booking.technician.name}`
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
