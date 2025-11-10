import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/ui/Header';
import StatusControlPanel from './components/StatusControlPanel';
import JobRequestCard from './components/JobRequestCard';
import ActiveJobsSection from './components/ActiveJobsSection';
import EarningsPanel from './components/EarningsPanel';
import CalendarView from './components/CalendarView';
import NotificationCenter from './components/NotificationCenter';
import QuickActions from './components/QuickActions';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/NewAuthContext';

const MS_IN_MINUTE = 60 * 1000;
const MS_IN_DAY = 24 * MS_IN_MINUTE * 60;

const formatRelativeTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  if (diff < MS_IN_MINUTE) return 'just now';
  if (diff < MS_IN_MINUTE * 60) {
    const minutes = Math.round(diff / MS_IN_MINUTE);
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }
  if (diff < MS_IN_DAY) {
    const hours = Math.round(diff / (MS_IN_MINUTE * 60));
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  const days = Math.round(diff / MS_IN_DAY);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

const formatClockTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const minutesToDuration = (minutes) => {
  if (!minutes) return '—';
  if (minutes < 60) return `${minutes} mins`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!remainder) return `${hours} hr${hours === 1 ? '' : 's'}`;
  return `${hours} hr ${remainder} mins`;
};

const calculateEarnings = (completedRequests, allAssigned) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - 6);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const bucket = {
    daily: { total: 0, jobs: 0 },
    weekly: { total: 0, jobs: 0 },
    monthly: { total: 0, jobs: 0 },
  };

  let totalRevenue = 0;
  let ratingSum = 0;
  completedRequests.forEach((request) => {
    const amount = request.finalCost ?? request.budgetMax ?? request.budgetMin ?? 0;
    totalRevenue += amount;
    const completedAt = request.completionDate ? new Date(request.completionDate) : null;
    if (completedAt && completedAt >= startOfDay) {
      bucket.daily.total += amount;
      bucket.daily.jobs += 1;
    }
    if (completedAt && completedAt >= startOfWeek) {
      bucket.weekly.total += amount;
      bucket.weekly.jobs += 1;
    }
    if (completedAt && completedAt >= startOfMonth) {
      bucket.monthly.total += amount;
      bucket.monthly.jobs += 1;
    }
    if (request.reviewRating) {
      ratingSum += request.reviewRating;
    }
  });

  const activeCount = allAssigned.filter((req) => ['confirmed', 'in_progress'].includes(req.status)).length;
  const completionRate = allAssigned.length
    ? Math.round((completedRequests.length / allAssigned.length) * 100)
    : 0;
  const averageRating = completedRequests.length ? (ratingSum / completedRequests.length).toFixed(1) : '—';

  const buildBucket = (key) => ({
    total: bucket[key].total,
    jobsCompleted: bucket[key].jobs,
    avgPerJob: bucket[key].jobs ? Math.round(bucket[key].total / bucket[key].jobs) : 0,
    completionRate,
    rating: averageRating,
    responseTime: '< 10 mins',
  });

  return {
    daily: buildBucket('daily'),
    weekly: buildBucket('weekly'),
    monthly: buildBucket('monthly'),
    availableBalance: Math.max(totalRevenue - activeCount * 50, 0),
  };
};

const buildNotifications = (available, active, completed) => {
  const items = [];

  available.slice(0, 5).forEach((request) => {
    items.push({
      id: `available-${request.id}`,
      type: 'job-alert',
      title: 'New job request available',
      message: `${request.title} • ${request.locationAddress}`,
      timeAgo: formatRelativeTime(request.createdAt),
      read: false,
      priority: request.priority === 'urgent' ? 'high' : 'medium',
      actionRequired: true,
    });
  });

  active.slice(0, 5).forEach((request) => {
    items.push({
      id: `active-${request.id}`,
      type: 'booking',
      title: 'Upcoming job',
      message: `${request.title} with ${request.customer?.name || 'customer'} at ${
        request.locationAddress
      }`,
      timeAgo: formatRelativeTime(request.scheduledDate || request.updatedAt),
      read: false,
      priority: 'medium',
      actionRequired: false,
    });
  });

  completed.slice(0, 5).forEach((request) => {
    items.push({
      id: `completed-${request.id}`,
      type: 'payment',
      title: 'Payment ready for withdrawal',
      message: `${request.title} • ${formatClockTime(request.completionDate)} • ₹${(
        request.finalCost ?? request.budgetMax ?? request.budgetMin ?? 0
      ).toLocaleString('en-IN')}`,
      timeAgo: formatRelativeTime(request.completionDate || request.updatedAt),
      read: false,
      priority: 'low',
      actionRequired: false,
    });
  });

  return items;
};

const mapAvailableRequest = (request) => ({
  id: request.id,
  title: request.title,
  category: request.category,
  location: request.locationAddress,
  coordinates: request.locationCoordinates || null,
  budget: request.budgetMax ?? request.budgetMin ?? 0,
  urgency: request.priority ?? 'medium',
  customerRating: request.reviewRating ?? '—',
  preferredTime: request.scheduledDate ? new Date(request.scheduledDate).toLocaleString() : 'Flexible schedule',
  description: request.description,
  timeAgo: formatRelativeTime(request.createdAt),
  applicants: request.applicants ?? 0,
  assignedToYou: Boolean(request.technician && request.technician.id),
  customer: request.customer,
});

const mapActiveRequest = (request) => ({
  id: request.id,
  title: request.title,
  customerName: request.customer?.name || 'Customer',
  status: request.status?.replace('_', '-'),
  address: request.locationAddress,
  coordinates: request.locationCoordinates || null,
  startTime: request.scheduledDate ? formatClockTime(request.scheduledDate) : '—',
  amount: request.finalCost ?? request.budgetMax ?? request.budgetMin ?? 0,
  customerPhone: request.customer?.phone || '—',
  eta: request.status === 'in_progress' ? 'On site' : request.status === 'confirmed' ? 'Scheduled' : '—',
  customerRating: request.reviewRating ?? '—',
});

const mapAppointment = (request) => ({
  id: request.id,
  title: request.title,
  customerName: request.customer?.name || 'Customer',
  date: request.scheduledDate,
  time: request.scheduledDate ? formatClockTime(request.scheduledDate) : '—',
  duration: minutesToDuration(request.estimatedDuration),
  location: request.locationAddress,
  amount: request.finalCost ?? request.budgetMax ?? request.budgetMin ?? 0,
});

const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, userProfile, user, fetchUserProfile } = useAuth();

  const activeTab = searchParams.get('tab') || 'overview';

  const [jobRequests, setJobRequests] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [earningsData, setEarningsData] = useState(null);
  const [technicianLocation, setTechnicianLocation] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);

  const [kycInfo, setKycInfo] = useState({ status: 'loading' });
  const [kycError, setKycError] = useState(null);

  const technicianProfileId = userProfile?.technician_profiles?.id;
  const availabilityFromProfile = useMemo(
    () => (userProfile?.technician_profiles?.current_status || 'offline') === 'available',
    [userProfile]
  );
  const [isAvailable, setIsAvailable] = useState(availabilityFromProfile);

  useEffect(() => {
    setIsAvailable(availabilityFromProfile);
  }, [availabilityFromProfile]);

  const isKycApproved = kycInfo?.status === 'approved';

  const fetchKycInfo = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await axios.get('/api/technicians/me/kyc');
      setKycInfo(data);
    } catch (error) {
      console.error('Failed to fetch technician KYC status:', error);
      setKycInfo({ status: 'not_submitted' });
    }
  }, [isAuthenticated]);

  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingData(true);
    setDataError(null);
    try {
      const [availableRes, assignedRes] = await Promise.all([
        axios.get('/api/service-requests/available'),
        axios.get('/api/service-requests'),
      ]);

      const availableRaw = availableRes.data || [];
      const assignedRaw = assignedRes.data || [];

      const activeRaw = assignedRaw.filter((request) =>
        ['confirmed', 'in_progress'].includes(request.status)
      );
      const completedRaw = assignedRaw.filter((request) => request.status === 'completed');

      setJobRequests(availableRaw.map(mapAvailableRequest));
      setActiveJobs(activeRaw.map(mapActiveRequest));
      setCompletedJobs(completedRaw);
      setAppointments(
        assignedRaw
          .filter((request) =>
            request.scheduledDate && ['confirmed', 'in_progress'].includes(request.status)
          )
          .map(mapAppointment)
      );
      setNotifications(buildNotifications(availableRaw, activeRaw, completedRaw));
      setEarningsData(calculateEarnings(completedRaw, assignedRaw));
    } catch (error) {
      console.error('Failed to load technician dashboard data:', error);
      setDataError('Unable to load the latest jobs right now. Please try again in a moment.');
    } finally {
      setLoadingData(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchKycInfo();
  }, [fetchKycInfo]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, location.key]);

  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    let isMounted = true;

    const updateLocation = (position) => {
      if (!isMounted) return;
      setTechnicianLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    };

    navigator.geolocation.getCurrentPosition(updateLocation, () => {}, {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 60000,
    });

    const watchId = navigator.geolocation.watchPosition(updateLocation, () => {}, {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 60000,
    });

    return () => {
      isMounted = false;
      if (watchId != null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  const handleToggleAvailability = async () => {
    if (!isKycApproved) {
      setKycError('Complete verification in your profile to change availability and take jobs.');
      return;
    }

    if (!technicianProfileId) return;
    const nextStatus = isAvailable ? 'offline' : 'available';
    try {
      await axios.put(`/api/technicians/${technicianProfileId}`, { currentStatus: nextStatus });
      setIsAvailable(!isAvailable);
      fetchUserProfile?.();
      setKycError(null);
    } catch (error) {
      console.error('Failed to update availability:', error);
      setKycError('We could not update your availability. Please try again.');
    }
  };

  const handleAcceptJob = async (jobId) => {
    if (!isKycApproved) {
      setKycError('Verify your account first. Upload your documents on the profile page.');
      return;
    }

    try {
      await axios.patch(`/api/service-requests/${jobId}/status`, {
        status: 'confirmed',
        technicianId: user?._id,
      });
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to accept job:', error);
      setDataError('Unable to accept this job right now. Please try again.');
    }
  };

  const handleDeclineJob = (jobId) => {
    setJobRequests((prev) => prev.filter((job) => job.id !== jobId));
  };

  const handleUpdateJobStatus = async (job, nextStatus) => {
    if (!job?.id || !nextStatus) {
      return;
    }

    try {
      await axios.patch(`/api/service-requests/${job.id}/status`, { status: nextStatus });
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to update job status:', error);
      setDataError('Unable to update job status at the moment.');
    }
  };

  const handleMarkNotificationAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      )
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
  };

  const handleWithdraw = () => {
    console.log('Initiating withdrawal');
  };

  const handleNavigateToJob = useCallback(
    (job) => {
      if (!job) return;
      const coords = job.coordinates;
      let url;
      if (coords?.lat && coords?.lng) {
        const destination = `${coords.lat},${coords.lng}`;
        const origin =
          technicianLocation?.lat && technicianLocation?.lng
            ? `${technicianLocation.lat},${technicianLocation.lng}`
            : null;
        url = origin
          ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`
          : `https://www.google.com/maps/search/?api=1&query=${destination}`;
      } else if (job.address) {
        url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`;
      } else {
        url = 'https://www.google.com/maps';
      }
      window.open(url, '_blank', 'noopener');
    },
    [technicianLocation]
  );

  const handleContactCustomer = (jobId, method = 'call') => {
    if (method === 'message') {
      navigate('/chat-communication');
    } else {
      console.log('Calling customer for job:', jobId);
    }
  };

  const handleBlockTime = (date) => {
    console.log('Blocking time for date:', date);
  };

  const unreadNotifications = notifications.filter((notification) => !notification.read).length;
  const newJobRequests = jobRequests.length;

  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'Home' },
    { key: 'jobs', label: 'Job Requests', icon: 'Briefcase', badge: newJobRequests },
    { key: 'active', label: 'Active Jobs', icon: 'Play', badge: activeJobs.length },
    { key: 'earnings', label: 'Earnings', icon: 'DollarSign' },
    { key: 'schedule', label: 'Schedule', icon: 'Calendar' },
    { key: 'notifications', label: 'Notifications', icon: 'Bell', badge: unreadNotifications },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
          <h2 className="text-2xl font-semibold text-text-primary">Please sign in</h2>
          <p className="mt-2 max-w-md text-sm text-text-secondary">
            Sign in with your technician account to access the dashboard.
          </p>
          <Button className="mt-6" onClick={() => navigate('/user-login')}>
            Go to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header messageBadgeCount={unreadNotifications} bookingBadgeCount={newJobRequests} onToggleSidebar={() => {}} />

      <div className="container mx-auto px-4 pt-24 pb-6">
        {!isKycApproved && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 text-amber-900 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide">Verification required</h2>
                <p className="text-sm">
                  Upload your government ID and live selfie from the profile page to start accepting jobs.
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate('/user-profile')}>
                Go to profile
              </Button>
            </div>
            {kycError ? (
              <p className="mt-3 rounded-md bg-amber-100 px-3 py-2 text-xs text-amber-800">{kycError}</p>
            ) : null}
          </div>
        )}

        {dataError ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {dataError}
          </div>
        ) : null}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Welcome back, {userProfile?.full_name || userProfile?.fullName || 'Technician'}!
            </h1>
            <p className="text-text-secondary">
              {isAvailable ? 'You are currently available for new jobs' : 'You are offline'} • {activeJobs.length}{' '}
              active jobs • ₹{earningsData?.daily?.total ?? 0} earned today
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-text-secondary">Current Status</p>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-success' : 'bg-error'}`}></div>
                <span className="font-medium text-text-primary">{isAvailable ? 'Available' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center space-x-2 rounded-full px-4 py-2 text-sm font-medium transition-smooth ${
                activeTab === tab.key
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
              {tab.badge ? (
                <span className="rounded-full bg-white/20 px-2 text-xs font-semibold text-white">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <StatusControlPanel
                isAvailable={isAvailable}
                onToggleAvailability={handleToggleAvailability}
                currentLocation={userProfile?.address || 'Update your service location'}
                workingHours="9:00 AM - 6:00 PM"
                onUpdateLocation={() => navigate('/profile-management?tab=addresses')}
                onUpdateWorkingHours={() => console.log('Update working hours')}
                availabilityDisabled={!isKycApproved}
                availabilityDisabledReason="Verification required before going online."
              />

              <div>
                <h2 className="mb-4 text-xl font-semibold text-text-primary">Recent Job Requests</h2>
                {loadingData ? (
                  <div className="rounded-lg border border-border bg-card p-6 text-center text-sm text-text-secondary">
                    Loading job requests…
                  </div>
                ) : jobRequests.length === 0 ? (
                  <div className="rounded-lg border border-border bg-card p-6 text-center text-sm text-text-secondary">
                    No new job requests right now.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {jobRequests.slice(0, 2).map((job) => (
                      <JobRequestCard
                        key={job.id}
                        job={job}
                        onAccept={handleAcceptJob}
                        onDecline={handleDeclineJob}
                        disableAccept={!isKycApproved}
                        disableReason="Finish verification to accept jobs."
                        technicianLocation={technicianLocation}
                      />
                    ))}
                  </div>
                )}

                {jobRequests.length > 2 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" onClick={() => setSearchParams({ tab: 'jobs' })}>
                      View All Job Requests ({jobRequests.length})
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <EarningsPanel earningsData={earningsData || undefined} onWithdraw={handleWithdraw} />
              <QuickActions
                onEditProfile={() => navigate('/user-profile')}
                onUploadDocuments={() => navigate('/user-profile#kyc')}
                onManageServices={() => navigate('/user-profile')}
                onViewAnalytics={() => console.log('Viewing analytics')}
              />
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-text-primary">Job Requests</h2>
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <Icon name="RefreshCw" size={16} />
                <span>Auto-refreshing every 30 seconds</span>
              </div>
            </div>
            {loadingData ? (
              <div className="rounded-lg border border-border bg-card p-6 text-center text-sm text-text-secondary">
                Loading job requests…
              </div>
            ) : jobRequests.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-6 text-center text-sm text-text-secondary">
                No job requests available right now.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {jobRequests.map((job) => (
                  <JobRequestCard
                    key={job.id}
                    job={job}
                    onAccept={handleAcceptJob}
                    onDecline={handleDeclineJob}
                    disableAccept={!isKycApproved}
                    disableReason="Finish verification to accept jobs."
                    technicianLocation={technicianLocation}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'active' && (
          <div>
            <h2 className="mb-6 text-2xl font-semibold text-text-primary">Active Jobs</h2>
            <ActiveJobsSection
              activeJobs={activeJobs}
              onNavigate={handleNavigateToJob}
              onContactCustomer={handleContactCustomer}
              onUpdateStatus={handleUpdateJobStatus}
              technicianLocation={technicianLocation}
            />
          </div>
        )}

        {activeTab === 'earnings' && (
          <div>
            <EarningsPanel earningsData={earningsData || undefined} onWithdraw={handleWithdraw} />
          </div>
        )}

        {activeTab === 'schedule' && (
          <div>
            <CalendarView
              appointments={appointments}
              onBlockTime={handleBlockTime}
              onManageAppointment={(appointmentId, action) =>
                console.log('Manage appointment', appointmentId, action)
              }
            />
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <NotificationCenter
              notifications={notifications}
              onMarkAsRead={handleMarkNotificationAsRead}
              onMarkAllAsRead={handleMarkAllNotificationsAsRead}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicianDashboard;
