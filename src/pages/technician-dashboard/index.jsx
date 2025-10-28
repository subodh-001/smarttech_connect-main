import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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

const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAvailable, setIsAvailable] = useState(true);
  const { isAuthenticated, userProfile } = useAuth();
  
  // Get active tab from URL query parameter or default to 'overview'
  const activeTab = searchParams.get('tab') || 'overview';

  // Mock data
  const [jobRequests] = useState([
    {
      id: 1,
      title: "Kitchen Sink Repair",
      category: "plumbing",
      location: "Downtown Plaza, Apt 4B",
      distance: "0.8 miles",
      budget: 85,
      urgency: "high",
      customerRating: 4.5,
      preferredTime: "Today 2:00 PM",
      description: "Kitchen sink is completely blocked and water is overflowing. Need immediate assistance to fix the drainage issue.",
      timeAgo: "5 minutes ago",
      applicants: 3
    },
    {
      id: 2,
      title: "AC Unit Not Cooling",
      category: "ac-repair",
      location: "Maple Street, House #23",
      distance: "1.2 miles",
      budget: 120,
      urgency: "urgent",
      customerRating: 4.8,
      preferredTime: "Today 4:00 PM",
      description: "Air conditioning unit stopped working suddenly. Room temperature is very high and need urgent repair.",
      timeAgo: "12 minutes ago",
      applicants: 7
    },
    {
      id: 3,
      title: "Laptop Screen Replacement",
      category: "computer",
      location: "Tech Hub, Office 301",
      distance: "2.1 miles",
      budget: 200,
      urgency: "medium",
      customerRating: 4.2,
      preferredTime: "Tomorrow 10:00 AM",
      description: "Laptop screen is cracked and needs replacement. Dell Inspiron 15 model. Have the replacement screen ready.",
      timeAgo: "25 minutes ago",
      applicants: 2
    }
  ]);

  const [activeJobs] = useState([
    {
      id: 1,
      title: "Electrical Wiring Repair",
      customerName: "Sarah Johnson",
      status: "in-progress",
      address: "Oak Avenue, House #45",
      startTime: "10:30 AM",
      amount: 150,
      customerPhone: "+1 (555) 123-4567",
      eta: "30 mins",
      customerRating: 4.7
    },
    {
      id: 2,
      title: "Washing Machine Fix",
      customerName: "Mike Chen",
      status: "on-way",
      address: "Pine Street, Apt 2A",
      startTime: "2:00 PM",
      amount: 95,
      customerPhone: "+1 (555) 987-6543",
      eta: "15 mins",
      customerRating: 4.3
    }
  ]);

  const [earningsData] = useState({
    daily: {
      total: 245,
      jobsCompleted: 3,
      avgPerJob: 82,
      completionRate: 95,
      rating: 4.8,
      responseTime: "< 5 mins"
    },
    weekly: {
      total: 1680,
      jobsCompleted: 18,
      avgPerJob: 93,
      completionRate: 94,
      rating: 4.7,
      responseTime: "< 6 mins"
    },
    monthly: {
      total: 6850,
      jobsCompleted: 72,
      avgPerJob: 95,
      completionRate: 96,
      rating: 4.8,
      responseTime: "< 5 mins"
    },
    availableBalance: 1245
  });

  const [appointments] = useState([
    {
      id: 1,
      title: "Refrigerator Repair",
      customerName: "Emma Wilson",
      date: "2025-01-07",
      time: "9:00 AM",
      duration: "2 hours",
      location: "Cedar Lane #12",
      amount: 120
    },
    {
      id: 2,
      title: "Computer Virus Removal",
      customerName: "David Brown",
      date: "2025-01-07",
      time: "2:30 PM",
      duration: "1.5 hours",
      location: "Business Center",
      amount: 80
    },
    {
      id: 3,
      title: "Ceiling Fan Installation",
      customerName: "Lisa Garcia",
      date: "2025-01-08",
      time: "11:00 AM",
      duration: "3 hours",
      location: "Sunset Drive #78",
      amount: 180
    }
  ]);

  const [notifications] = useState([
    {
      id: 1,
      type: "job-alert",
      title: "New Job Request",
      message: "High-priority plumbing job available 0.5 miles away. Budget: $150",
      timeAgo: "2 minutes ago",
      read: false,
      priority: "high",
      actionRequired: true
    },
    {
      id: 2,
      type: "message",
      title: "Customer Message",
      message: "Sarah Johnson sent you a message about the electrical repair job",
      timeAgo: "15 minutes ago",
      read: false,
      priority: "medium"
    },
    {
      id: 3,
      type: "payment",
      title: "Payment Received",
      message: "You received $95 for washing machine repair job completion",
      timeAgo: "1 hour ago",
      read: true,
      priority: "low"
    },
    {
      id: 4,
      type: "rating",
      title: "New Review",
      message: "Mike Chen rated you 5 stars for excellent service",
      timeAgo: "2 hours ago",
      read: false,
      priority: "medium"
    },
    {
      id: 5,
      type: "system",
      title: "Profile Update Required",
      message: "Please update your service categories to receive more relevant jobs",
      timeAgo: "1 day ago",
      read: true,
      priority: "low"
    }
  ]);

  // Handlers
  const handleToggleAvailability = () => {
    setIsAvailable(!isAvailable);
  };

  const handleAcceptJob = (jobId) => {
    console.log('Accepting job:', jobId);
    // Navigate to job details or show confirmation
  };

  const handleDeclineJob = (jobId) => {
    console.log('Declining job:', jobId);
  };

  const handleNavigateToJob = (jobId) => {
    console.log('Navigating to job:', jobId);
    // Open navigation app or show directions
  };

  const handleContactCustomer = (jobId, method = 'call') => {
    console.log('Contacting customer for job:', jobId, 'via', method);
    if (method === 'message') {
      navigate('/chat-communication');
    }
  };

  const handleUpdateJobStatus = (jobId) => {
    console.log('Updating status for job:', jobId);
  };

  const handleWithdraw = () => {
    console.log('Initiating withdrawal');
  };

  const handleBlockTime = (date) => {
    console.log('Blocking time for date:', date);
  };

  const handleManageAppointment = (appointmentId, action) => {
    console.log('Managing appointment:', appointmentId, 'action:', action);
  };

  const handleMarkNotificationAsRead = (notificationId) => {
    console.log('Marking notification as read:', notificationId);
  };

  const handleMarkAllNotificationsAsRead = () => {
    console.log('Marking all notifications as read');
  };

  const handleEditProfile = () => {
    navigate('/profile-management');
  };

  const handleUploadDocuments = () => {
    navigate('/profile-management?tab=documents');
  };

  const handleManageServices = () => {
    navigate('/profile-management?tab=services');
  };

  const handleViewAnalytics = () => {
    console.log('Viewing analytics');
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const newJobRequests = jobRequests.length;

  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'Home' },
    { key: 'jobs', label: 'Job Requests', icon: 'Briefcase', badge: newJobRequests },
    { key: 'active', label: 'Active Jobs', icon: 'Play', badge: activeJobs.length },
    { key: 'earnings', label: 'Earnings', icon: 'DollarSign' },
    { key: 'schedule', label: 'Schedule', icon: 'Calendar' },
    { key: 'notifications', label: 'Notifications', icon: 'Bell', badge: unreadNotifications }
  ];
  
  // Function to update active tab via URL
  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  return (
      <div className="min-h-screen bg-background">
        <Header 
          messageBadgeCount={unreadNotifications}
          bookingBadgeCount={newJobRequests}
          onToggleSidebar={() => {}}
        />
        
        <div className="container mx-auto px-4 pt-24 pb-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-text-primary mb-2">
                  {isAuthenticated && (userProfile?.full_name || userProfile?.name) ? (
                    <>Welcome back, {(userProfile?.full_name || userProfile?.name)?.split(' ')?.[0]}!</>
                  ) : (
                    <>Technician Dashboard</>
                  )}
                </h1>
                <p className="text-text-secondary">
                  {isAvailable ? 'You are currently available for new jobs' : 'You are offline'}
                  • {activeJobs.length} active jobs • ${earningsData.daily.total} earned today
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-text-secondary">Current Status</p>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-success' : 'bg-error'}`}></div>
                    <span className="font-medium text-text-primary">
                      {isAvailable ? 'Available' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <StatusControlPanel
                    isAvailable={isAvailable}
                    onToggleAvailability={handleToggleAvailability}
                    currentLocation="Downtown Business District"
                    workingHours="9:00 AM - 6:00 PM"
                    onUpdateLocation={() => console.log('Update location')}
                    onUpdateWorkingHours={() => console.log('Update working hours')}
                  />
                  
                  <div>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">Recent Job Requests</h2>
                    <div className="grid grid-cols-1 gap-4">
                      {jobRequests.slice(0, 2).map((job) => (
                        <JobRequestCard
                          key={job.id}
                          job={job}
                          onAccept={handleAcceptJob}
                          onDecline={handleDeclineJob}
                        />
                      ))}
                    </div>
                    {jobRequests.length > 2 && (
                      <div className="mt-4 text-center">
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab('jobs')}
                        >
                          View All Job Requests ({jobRequests.length})
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <EarningsPanel
                    earningsData={earningsData}
                    onWithdraw={handleWithdraw}
                  />
                  <QuickActions
                    onEditProfile={handleEditProfile}
                    onUploadDocuments={handleUploadDocuments}
                    onManageServices={handleManageServices}
                    onViewAnalytics={handleViewAnalytics}
                  />
                </div>
              </div>
            )}

            {activeTab === 'jobs' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-text-primary">Job Requests</h2>
                  <div className="flex items-center space-x-2 text-sm text-text-secondary">
                    <Icon name="RefreshCw" size={16} />
                    <span>Auto-refreshing every 30 seconds</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {jobRequests.map((job) => (
                    <JobRequestCard
                      key={job.id}
                      job={job}
                      onAccept={handleAcceptJob}
                      onDecline={handleDeclineJob}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'active' && (
              <div>
                <h2 className="text-2xl font-semibold text-text-primary mb-6">Active Jobs</h2>
                <ActiveJobsSection
                  activeJobs={activeJobs}
                  onNavigate={handleNavigateToJob}
                  onContactCustomer={handleContactCustomer}
                  onUpdateStatus={handleUpdateJobStatus}
                />
              </div>
            )}

            {activeTab === 'earnings' && (
              <div className="max-w-4xl">
                <EarningsPanel
                  earningsData={earningsData}
                  onWithdraw={handleWithdraw}
                />
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="max-w-6xl">
                <CalendarView
                  appointments={appointments}
                  onBlockTime={handleBlockTime}
                  onManageAppointment={handleManageAppointment}
                />
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="max-w-4xl">
                <NotificationCenter
                  notifications={notifications}
                  onMarkAsRead={handleMarkNotificationAsRead}
                  onMarkAllAsRead={handleMarkAllNotificationsAsRead}
                />
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default TechnicianDashboard;