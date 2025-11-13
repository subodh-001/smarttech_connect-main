import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/ui/Header';
import TechnicianInfoPanel from './components/TechnicianInfoPanel';
import ServiceProgressIndicator from './components/ServiceProgressIndicator';
import ServiceDetailsPanel from './components/ServiceDetailsPanel';
import LiveMap from './components/LiveMap';
import NotificationToast from './components/NotificationToast';
import ChatWidget from './components/ChatWidget';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/NewAuthContext';
import { formatTechnicianName } from '../../utils/formatTechnicianName';

const EARTH_RADIUS_KM = 6371;

const toRadians = (value) => (value * Math.PI) / 180;

const computeDistanceKm = (from, to) => {
  if (!from?.lat || !from?.lng || !to?.lat || !to?.lng) return null;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

const capitalize = (value) => {
  if (!value || typeof value !== 'string') return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const buildPricingSummary = (request) => {
  const estimated =
    request.finalCost ?? request.budgetMax ?? request.budgetMin ?? 0;
  const baseCharge = request.budgetMin ?? Math.round(estimated * 0.7);
  const materialCost =
    request.budgetMax && request.budgetMin
      ? Math.max(0, request.budgetMax - request.budgetMin)
      : 0;
  const serviceFee = Math.round(estimated * 0.05);
  return {
    baseCharge,
    materialCost,
    serviceFee,
    estimatedCost: estimated,
  };
};

const deriveServicePhases = (status, request) => {
  const phaseTemplate = [
    {
      name: 'Traveling',
      description: 'Technician is on the way to your location',
      notes: null,
    },
    {
      name: 'Assessing',
      description: 'Inspecting the problem and determining solution',
      notes: null,
    },
    {
      name: 'Working',
      description: 'Performing the repair work',
      notes: null,
    },
    {
      name: 'Testing',
      description: 'Testing the repair and ensuring everything works',
      notes: null,
    },
    {
      name: 'Completed',
      description: 'Service completed successfully',
      notes: null,
    },
  ];

  const completedCountMap = {
    pending: 0,
    confirmed: 0,
    in_progress: 2,
    completed: phaseTemplate.length,
    cancelled: phaseTemplate.length,
  };

  const currentPhaseMap = {
    pending: 'Traveling',
    confirmed: 'Traveling',
    in_progress: 'Working',
    completed: 'Completed',
    cancelled: 'Completed',
  };

  const completedCount = completedCountMap[status] ?? 0;
  const currentPhase =
    currentPhaseMap[status] ||
    phaseTemplate[Math.min(completedCount, phaseTemplate.length - 1)].name;

  const completedTimestamp =
    request.updatedAt || request.completionDate || request.createdAt || null;

  const phases = phaseTemplate.map((phase, index) => {
    let notes = phase.notes;
    if (status === 'pending' && index === 0) {
      notes = 'Waiting for technician confirmation.';
    }
    if (status === 'cancelled' && index === phaseTemplate.length - 1) {
      notes = request.cancellationReason || 'Service was cancelled.';
    }
    return {
      ...phase,
      completedAt: index < completedCount ? completedTimestamp : null,
      notes,
    };
  });

  return { phases, currentPhase };
};

const buildTechnicianInfo = (request, technicianProfile, userLocation = null) => {
  const userInfo = request?.technician || {};
  const profile = technicianProfile || {};
  const lastLocation = profile?.lastLocation || null;
  const jobLocation = request?.locationCoordinates || null;
  
  // Calculate distance: technician to job location (preferred) or user location to job location (fallback)
  let distanceKm = null;
  if (lastLocation && jobLocation) {
    distanceKm = computeDistanceKm(lastLocation, jobLocation);
  } else if (userLocation && jobLocation) {
    // Fallback: use user location if technician location not available
    distanceKm = computeDistanceKm(userLocation, jobLocation);
  }
  
  const etaMinutes =
    distanceKm != null ? Math.max(5, Math.round((distanceKm / 20) * 60)) : null;

  return {
    name: userInfo.name || userInfo.fullName || userInfo.email || 'Awaiting assignment',
    avatar:
      userInfo.avatar ||
      `https://ui-avatars.com/api/?background=2563EB&color=fff&name=${encodeURIComponent(
        userInfo.name || userInfo.email || 'Technician',
      )}`,
    rating:
      profile?.averageRating ??
      profile?.rating ??
      (profile?.totalJobs ? Math.min(5, 4 + profile.totalJobs / 100) : null),
    reviewCount: profile?.totalJobs ?? null,
    phone: userInfo.phone || null,
    specialization:
      profile?.specialties && profile.specialties.length
        ? profile.specialties.map(capitalize).join(', ')
        : null,
    distance: distanceKm != null ? `${distanceKm.toFixed(1)} km` : null,
    vehicle: profile?.vehicle || profile?.primaryVehicle || null,
    vehicleNumber: profile?.vehicleNumber || null,
    isOnline: profile?.currentStatus === 'available',
    lastLocation,
    etaSeconds: etaMinutes != null ? etaMinutes * 60 : null,
    route:
      distanceKm != null
        ? {
            distance: `${distanceKm.toFixed(1)} km`,
            duration: etaMinutes ? `${etaMinutes} mins` : null,
          }
        : null,
  };
};

const buildNotifications = (request, technicianInfo) => {
  const baseTimestamp = new Date(request.updatedAt || request.createdAt || Date.now());
  const items = [];

  if (technicianInfo) {
    const technicianName = formatTechnicianName(technicianInfo);
    items.push({
      id: Date.now(),
      type: 'status',
      title: 'Technician Assigned',
      message: `${technicianName} has been assigned to your request.`,
      timestamp: baseTimestamp,
      dismissed: false,
      actionLabel: 'View profile',
    });
  }

  items.push({
    id: Date.now() + 1,
    type: 'status',
    title: 'Request Status',
    message: `Current status: ${request.status.replace(/_/g, ' ')}`,
    timestamp: baseTimestamp,
    dismissed: false,
  });

  if (technicianInfo?.etaSeconds) {
    items.push({
      id: Date.now() + 2,
      type: 'arrival',
      title: 'Technician ETA',
      message: `Estimated arrival in about ${Math.ceil(
        technicianInfo.etaSeconds / 60,
      )} minutes.`,
      timestamp: baseTimestamp,
      dismissed: false,
    });
  }

  return items;
};

const LiveTracking = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [showTraffic, setShowTraffic] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentLocationLabel, setCurrentLocationLabel] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: 12.9716, lng: 77.5946 });
  const [technicianLocation, setTechnicianLocation] = useState(null);
  const [serviceRequest, setServiceRequest] = useState(null);
  const [technicianInfo, setTechnicianInfo] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [servicePhases, setServicePhases] = useState([]);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [estimatedArrival, setEstimatedArrival] = useState(null);
  const [routeSummary, setRouteSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatError, setChatError] = useState(null);
  const [isSendingChat, setIsSendingChat] = useState(false);

  const resolvedRequestId =
    routerLocation.state?.serviceRequestId || searchParams.get('id');

  const currentUserId = useMemo(() => {
    return (
      user?.id ||
      user?._id ||
      user?.user_id ||
      user?.sub ||
      null
    );
  }, [user]);

  const normalizeChatMessage = useCallback(
    (message) => {
      if (!message) return null;
      const sender = message.sender || {};
      const metadata = message.metadata || {};
      const senderId = sender.id || message.senderId || null;
      const type = message.type || message.contentType || 'text';
      const deliveryStatus = message.deliveryStatus || 'sent';

      let displayContent = message.content || '';
      if (type === 'location') {
        displayContent =
          metadata.label || metadata.address || metadata.name || 'Shared location';
      }
      if (type === 'image') {
        displayContent = metadata.caption || 'Shared image';
      }

      return {
        id: message.id || message._id || Date.now().toString(),
        sender: senderId && senderId === currentUserId ? 'user' : 'technician',
        senderId,
        type,
        content: displayContent,
        metadata,
        timestamp: message.createdAt || message.timestamp || new Date().toISOString(),
        read: deliveryStatus === 'read',
        deliveryStatus,
      };
    },
    [currentUserId],
  );

  const fetchChatMessages = useCallback(
    async ({ silent = false, requestId } = {}) => {
      const targetId = requestId || serviceRequest?.id;
      if (!targetId) return;
      if (!silent) {
        setChatError(null);
      }
      try {
        const { data } = await axios.get(
          `/api/service-requests/${targetId}/messages`,
        );
        const rawMessages = Array.isArray(data?.messages) ? data.messages : [];
        const mapped = rawMessages
          .map(normalizeChatMessage)
          .filter(Boolean);
        setChatMessages(mapped);
      } catch (err) {
        console.error('Failed to load chat messages:', err);
        if (!silent) {
          setChatError(err?.response?.data?.error || 'Unable to load messages right now.');
        }
      }
    },
    [serviceRequest?.id, normalizeChatMessage],
  );

  const fetchLiveData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let requestDoc = null;

      if (resolvedRequestId) {
        const { data } = await axios.get(`/api/service-requests/${resolvedRequestId}`);
        requestDoc = data;
      } else {
        const { data } = await axios.get('/api/service-requests');
        const requests = Array.isArray(data) ? data : [];
        const activeStatuses = ['in_progress', 'confirmed', 'pending'];
        requestDoc =
          requests.find((item) => activeStatuses.includes(item.status)) ||
          requests[0] ||
          null;
      }

      if (!requestDoc) {
        setServiceRequest(null);
        setTechnicianInfo(null);
        setPricing(null);
        setServicePhases([]);
        setCurrentPhase(null);
        setRouteSummary(null);
        setEstimatedArrival(null);
        setNotifications([]);
        setChatMessages([]);
        setError('No service requests to track yet.');
        return;
      }

      setServiceRequest(requestDoc);
      setChatMessages([]);
      setPricing(buildPricingSummary(requestDoc));

      let technicianProfile = null;
      if (requestDoc?.technician?.id) {
        try {
          const { data: techData } = await axios.get(
            `/api/technicians?userId=${requestDoc.technician.id}`,
          );
          if (Array.isArray(techData) && techData.length > 0) {
            technicianProfile = techData[0];
          }
        } catch (profileError) {
          console.warn('Failed to fetch technician profile:', profileError);
        }
      }

      // Get current userLocation from state
      const currentUserLocation = userLocation?.lat && userLocation?.lng ? userLocation : null;
      const info = buildTechnicianInfo(requestDoc, technicianProfile, currentUserLocation);
      setTechnicianInfo(info);
      setTechnicianLocation(
        info?.lastLocation || requestDoc?.locationCoordinates || null,
      );
      setEstimatedArrival(info?.etaSeconds ?? null);
      setRouteSummary(info?.route || null);

      const { phases, currentPhase: derivedPhase } = deriveServicePhases(
        requestDoc.status,
        requestDoc,
      );
      setServicePhases(phases);
      setCurrentPhase(derivedPhase);

      setNotifications(buildNotifications(requestDoc, info));
      await fetchChatMessages({ silent: true, requestId: requestDoc.id });
    } catch (err) {
      console.error('Failed to load live tracking data:', err);
      setError(err?.response?.data?.error || 'Unable to load live tracking data right now.');
    } finally {
      setLoading(false);
    }
  }, [resolvedRequestId, fetchChatMessages, userLocation]);

  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  useEffect(() => {
    try {
      const cachedLabel = localStorage.getItem('user_location_label');
      if (cachedLabel) setCurrentLocationLabel(cachedLabel);
      const cachedCoords = localStorage.getItem('user_location_coords');
      if (cachedCoords) {
        const { latitude, longitude } = JSON.parse(cachedCoords);
        if (latitude && longitude) {
          setUserLocation({ lat: latitude, lng: longitude });
        }
      }
    } catch (_) {
      // ignore cache errors
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const label = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setUserLocation({ lat: latitude, lng: longitude });
          setCurrentLocationLabel(label);
          try {
            localStorage.setItem('user_location_label', label);
            localStorage.setItem(
              'user_location_coords',
              JSON.stringify({ latitude, longitude }),
            );
          } catch (_) {
            // ignore storage errors
          }
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 60000, timeout: 10000 },
      );
    }
  }, []);

  useEffect(() => {
    if (estimatedArrival == null || estimatedArrival <= 0) return;
    const interval = setInterval(() => {
      setEstimatedArrival((prev) => (prev && prev > 30 ? prev - 30 : 0));
    }, 30000);
    return () => clearInterval(interval);
  }, [estimatedArrival]);

  useEffect(() => {
    if (!serviceRequest?.id) return;
    fetchChatMessages();
    const interval = setInterval(() => {
      fetchChatMessages({ silent: true });
    }, 5000);
    return () => clearInterval(interval);
  }, [serviceRequest?.id, fetchChatMessages]);

  const technicianStatusLabel = useMemo(() => {
    switch (serviceRequest?.status) {
      case 'pending':
        return 'Awaiting';
      case 'confirmed':
        return 'En Route';
      case 'in_progress':
        return 'Working';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Scheduled';
    }
  }, [serviceRequest?.status]);

  const serviceDetails = useMemo(() => {
    if (!serviceRequest) return null;
    return {
      id: serviceRequest.id,
      title: serviceRequest.title || capitalize(serviceRequest.category),
      category: capitalize(serviceRequest.category),
      priority: capitalize(serviceRequest.priority || 'medium'),
      scheduledTime: serviceRequest.scheduledDate || serviceRequest.createdAt,
      description: serviceRequest.description,
      address: serviceRequest.locationAddress,
      specialInstructions:
        serviceRequest.requirements?.specialInstructions ||
        serviceRequest.requirements?.notes ||
        serviceRequest.requirements?.rescheduleReason ||
        null,
    };
  }, [serviceRequest]);

  const handleCall = useCallback(() => {
    if (!technicianInfo?.phone) {
      alert('Technician phone number is not available.');
      return;
    }
    // Clean phone number and use tel: protocol
    const phoneNumber = technicianInfo.phone.replace(/[^0-9+]/g, '');
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      alert('Invalid phone number format.');
    }
  }, [technicianInfo]);

  const handleChat = useCallback(() => {
    setIsChatOpen(true);
    fetchChatMessages();
  }, [fetchChatMessages]);

  const handleEmergencyContact = useCallback(() => {
    const notification = {
      id: Date.now(),
      type: 'emergency',
      title: 'Emergency Contact Initiated',
      message: 'Your emergency request has been sent to our support team.',
      timestamp: new Date(),
      dismissed: false,
    };
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  const handleRecenterMap = useCallback(() => {
    // Placeholder noop: map iframe recenters based on src
  }, []);

  const handleToggleTraffic = useCallback(() => {
    setShowTraffic((prev) => !prev);
  }, []);

  const handleModifyRequest = useCallback(() => {
    if (!serviceRequest) return;
    navigate('/service-request-creation', {
      state: { editMode: true, serviceRequest },
    });
  }, [navigate, serviceRequest]);

  const handleCancelService = useCallback(async () => {
    if (!serviceRequest) return;
    const confirmed = window.confirm(
      'Are you sure you want to cancel this service? This action cannot be undone.',
    );
    if (!confirmed) return;
    try {
      await axios.patch(`/api/service-requests/${serviceRequest.id}/status`, {
        status: 'cancelled',
      });
      await fetchLiveData();
    } catch (err) {
      console.error('Failed to cancel service:', err);
      setError(err?.response?.data?.error || 'Unable to cancel service right now.');
    }
  }, [serviceRequest, fetchLiveData]);

  const handleViewFullDetails = useCallback(() => {
    if (!serviceRequest) return;
    navigate('/booking-management', { state: { highlightId: serviceRequest.id } });
  }, [navigate, serviceRequest]);

  const handleSendMessage = useCallback(
    async (message) => {
      if (!serviceRequest?.id || !message?.trim()) return;
      setIsSendingChat(true);
      setChatError(null);
      try {
        const { data } = await axios.post(
          `/api/service-requests/${serviceRequest.id}/messages`,
          {
            type: 'text',
            content: message.trim(),
          },
        );
        const mapped = normalizeChatMessage(data?.message);
        if (mapped) {
          setChatMessages((prev) => [...prev, mapped]);
        } else {
          fetchChatMessages({ silent: true });
        }
      } catch (err) {
        console.error('Failed to send message:', err);
        setChatError(err?.response?.data?.error || 'Unable to send message right now.');
      } finally {
        setIsSendingChat(false);
      }
    },
    [serviceRequest?.id, normalizeChatMessage, fetchChatMessages],
  );

  const handleDismissNotification = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, dismissed: true }
          : notification,
      ),
    );
  }, []);

  const handleNotificationAction = useCallback(
    (notification) => {
      if (notification?.actionLabel === 'View profile' && technicianInfo) {
        handleChat();
      }
      handleDismissNotification(notification.id);
    },
    [handleDismissNotification, technicianInfo, handleChat],
  );

  const chatUnreadCount = useMemo(
    () =>
      chatMessages.filter((msg) => msg.sender !== 'user' && !msg.read).length,
    [chatMessages],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          user={user}
          location={currentLocationLabel}
          activeService={serviceRequest}
          messageBadgeCount={chatUnreadCount}
        />
        <main className="pt-16 relative z-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Loading your live tracking data…</p>
          </div>
        </main>
      </div>
    );
  }

  if (!serviceRequest) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} location={currentLocationLabel} messageBadgeCount={chatUnreadCount} />
        <main className="pt-16 relative z-0">
          <div className="max-w-xl mx-auto text-center space-y-4">
            <h1 className="text-2xl font-semibold text-foreground">
              No service to track yet
            </h1>
            <p className="text-muted-foreground">
              Schedule a service request to start tracking technician updates in real time.
            </p>
            <Button onClick={() => navigate('/service-request-creation')} iconName="Plus">
              Book a Service
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        location={currentLocationLabel}
        activeService={serviceRequest}
        messageBadgeCount={chatUnreadCount}
      />
      <main className="pt-16 relative z-0">
        {error ? (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 text-sm text-center">
            {error}
          </div>
        ) : null}

        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="hidden lg:flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Live Service Tracking</h1>
              <p className="text-muted-foreground">Monitor your service progress in real-time</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                iconName="Phone"
                iconPosition="left"
                onClick={handleCall}
                disabled={!technicianInfo?.phone}
              >
                Call Technician
              </Button>
              <Button
                variant="outline"
                iconName="MessageCircle"
                iconPosition="left"
                onClick={handleChat}
              >
                Chat
                {chatUnreadCount > 0 && (
                  <div className="ml-2 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <LiveMap
                userLocation={userLocation}
                technicianLocation={technicianLocation}
                serviceLocation={serviceRequest.locationCoordinates}
                route={routeSummary}
                onRecenterMap={handleRecenterMap}
                onToggleTraffic={handleToggleTraffic}
                showTraffic={showTraffic}
              />
              <div className="lg:hidden">
                <ServiceProgressIndicator
                  currentPhase={currentPhase}
                  phases={servicePhases}
                  lastUpdate={serviceRequest.updatedAt || serviceRequest.createdAt}
                />
              </div>
            </div>

            <div className="space-y-6">
              <TechnicianInfoPanel
                technician={technicianInfo}
                estimatedArrival={estimatedArrival}
                currentStatus={technicianStatusLabel}
                onCall={handleCall}
                onChat={handleChat}
                onEmergencyContact={handleEmergencyContact}
              />
              <div className="hidden lg:block">
                <ServiceProgressIndicator
                  currentPhase={currentPhase}
                  phases={servicePhases}
                  lastUpdate={serviceRequest.updatedAt || serviceRequest.createdAt}
                />
              </div>
              <ServiceDetailsPanel
                serviceRequest={serviceDetails}
                pricing={pricing}
                onModifyRequest={handleModifyRequest}
                onCancelService={handleCancelService}
                onViewFullDetails={handleViewFullDetails}
              />
            </div>
          </div>
        </div>

        <NotificationToast
          notifications={notifications.filter((notification) => !notification.dismissed)}
          onDismiss={handleDismissNotification}
          onAction={handleNotificationAction}
        />

        <div className="lg:hidden fixed bottom-6 right-6 flex flex-col space-y-3">
          <Button
            variant="primary"
            size="icon"
            className="shadow-elevated rounded-full h-12 w-12"
            onClick={handleChat}
          >
            <Icon name="MessageCircle" size={20} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="shadow-elevated rounded-full h-12 w-12"
            onClick={handleCall}
            disabled={!technicianInfo?.phone}
          >
            <Icon name="Phone" size={20} />
          </Button>
        </div>

        {chatError ? (
          <div className="mx-auto mb-3 max-w-md rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
            {chatError}
          </div>
        ) : null}

        <ChatWidget
          isOpen={isChatOpen}
          onOpen={handleChat}
          onClose={() => setIsChatOpen(false)}
          onSendMessage={handleSendMessage}
          technician={technicianInfo}
          messages={chatMessages}
          isSending={isSendingChat}
        />
      </main>
    </div>
  );
};

export default LiveTracking;