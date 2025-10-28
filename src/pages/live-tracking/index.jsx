import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import TechnicianInfoPanel from './components/TechnicianInfoPanel';
import ServiceProgressIndicator from './components/ServiceProgressIndicator';
import ServiceDetailsPanel from './components/ServiceDetailsPanel';
import LiveMap from './components/LiveMap';
import NotificationToast from './components/NotificationToast';
import ChatWidget from './components/ChatWidget';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const LiveTracking = () => {
  const navigate = useNavigate();
  const [showTraffic, setShowTraffic] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Mock user data
  const user = {
    name: "Rajesh Kumar",
    email: "rajesh.kumar@email.com"
  };

  // Current location (resolved from geolocation/cache)
  const [currentLocation, setCurrentLocation] = useState("Koramangala, Bangalore");

  // Mock technician data
  const technician = {
    id: "tech_001",
    name: "Amit Sharma",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 4.8,
    reviewCount: 127,
    phone: "+91 98765 43210",
    vehicle: "Honda Activa",
    vehicleNumber: "KA 01 AB 1234",
    distance: "2.3 km",
    specialization: "Electrical Repair"
  };

  // Mock service request data
  const serviceRequest = {
    id: "SR001234",
    title: "Electrical Wiring Issue",
    category: "Electrical",
    description: "Main switch board is sparking and some lights are not working. Need immediate attention as it might be a safety hazard.",
    priority: "High",
    scheduledTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    address: "Flat 204, Green Valley Apartments, 5th Cross, Koramangala 4th Block, Bangalore - 560034",
    specialInstructions: "Please bring electrical testing equipment. Building security will guide you to the flat."
  };

  // Mock pricing data
  const pricing = {
    baseCharge: 300,
    materialCost: 150,
    serviceFee: 50,
    estimatedCost: 500
  };

  // User live location (updates from geolocation)
  const [userLocation, setUserLocation] = useState({ lat: 12.9352, lng: 77.6245 });

  const technicianLocation = {
    lat: 12.9298,
    lng: 77.6205
  };

  // Mock route data
  const route = {
    distance: "2.3 km",
    duration: "8 mins",
    trafficDelay: "2 mins"
  };

  // Mock service phases
  const [servicePhases, setServicePhases] = useState([
    {
      name: "Traveling",
      description: "Technician is on the way to your location",
      completedAt: new Date(Date.now() - 10 * 60 * 1000),
      notes: "Started from Indiranagar workshop"
    },
    {
      name: "Assessing",
      description: "Inspecting the problem and determining solution",
      completedAt: null,
      notes: null
    },
    {
      name: "Working",
      description: "Performing the repair work",
      completedAt: null,
      notes: null
    },
    {
      name: "Testing",
      description: "Testing the repair and ensuring everything works",
      completedAt: null,
      notes: null
    },
    {
      name: "Completed",
      description: "Service completed successfully",
      completedAt: null,
      notes: null
    }
  ]);

  const [currentPhase, setCurrentPhase] = useState("Assessing");
  const [estimatedArrival, setEstimatedArrival] = useState(480); // 8 minutes in seconds

  // Mock chat messages
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "technician",
      content: "Hi! I\'m on my way to your location. Should reach in about 8 minutes.",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: true
    },
    {
      id: 2,
      sender: "user",
      content: "Great! I'll be waiting. Do you need any specific materials for the electrical work?",
      timestamp: new Date(Date.now() - 4 * 60 * 1000),
      read: true
    },
    {
      id: 3,
      sender: "technician",
      content: "I have most common electrical components with me. Will assess and let you know if anything specific is needed.",
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      read: true
    }
  ]);

  // Initialize notifications
  useEffect(() => {
    // Initialize from cache
    try {
      const cachedLabel = localStorage.getItem('user_location_label');
      if (cachedLabel) setCurrentLocation(cachedLabel);
      const cachedCoords = localStorage.getItem('user_location_coords');
      if (cachedCoords) {
        const { latitude, longitude } = JSON.parse(cachedCoords);
        if (latitude && longitude) setUserLocation({ lat: latitude, lng: longitude });
      }
    } catch (_) {}

    // Request fresh location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          const label = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setCurrentLocation(label);
          try {
            localStorage.setItem('user_location_label', label);
            localStorage.setItem('user_location_coords', JSON.stringify({ latitude, longitude }));
          } catch (_) {}
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 60000, timeout: 10000 }
      );
    }

    const initialNotifications = [
      {
        id: 1,
        type: "status",
        title: "Technician Assigned",
        message: "Amit Sharma has been assigned to your service request",
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        dismissed: false,
        actionLabel: "View Profile"
      },
      {
        id: 2,
        type: "arrival",
        title: "Technician En Route",
        message: "Your technician is on the way and will arrive in approximately 8 minutes",
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        dismissed: false,
        actionLabel: "Track Live"
      }
    ];
    setNotifications(initialNotifications);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setEstimatedArrival(prev => Math.max(0, prev - 30));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleCall = () => {
    window.open(`tel:${technician?.phone}`, '_self');
  };

  const handleChat = () => {
    setIsChatOpen(true);
  };

  const handleEmergencyContact = () => {
    const newNotification = {
      id: Date.now(),
      type: "emergency",
      title: "Emergency Contact Initiated",
      message: "Your emergency request has been sent to our support team",
      timestamp: new Date(),
      dismissed: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleRecenterMap = () => {
    console.log('Recentering map to show both locations');
  };

  const handleToggleTraffic = () => {
    setShowTraffic(!showTraffic);
  };

  const handleModifyRequest = () => {
    navigate('/service-request-creation', { 
      state: { editMode: true, serviceRequest } 
    });
  };

  const handleCancelService = () => {
    if (window.confirm('Are you sure you want to cancel this service? This action cannot be undone.')) {
      navigate('/user-dashboard');
    }
  };

  const handleViewFullDetails = () => {
    console.log('Opening full service details modal');
  };

  const handleSendMessage = (message) => {
    const newMessage = {
      id: Date.now(),
      sender: "user",
      content: message,
      timestamp: new Date(),
      read: true
    };
    setChatMessages(prev => [...prev, newMessage]);

    // Simulate technician response
    setTimeout(() => {
      const responses = [
        "Got it! I\'ll keep that in mind.",
        "Thanks for letting me know.",
        "I\'ll be there shortly.",
        "No problem, I understand.",
        "I\'ll call you when I arrive."
      ];
      const randomResponse = responses?.[Math.floor(Math.random() * responses?.length)];
      
      const techResponse = {
        id: Date.now() + 1,
        sender: "technician",
        content: randomResponse,
        timestamp: new Date(),
        read: false
      };
      setChatMessages(prev => [...prev, techResponse]);
    }, 2000);
  };

  const handleDismissNotification = (notificationId) => {
    setNotifications(prev => 
      prev?.map(n => 
        n?.id === notificationId ? { ...n, dismissed: true } : n
      )
    );
  };

  const handleNotificationAction = (notification) => {
    console.log('Notification action:', notification?.actionLabel);
    handleDismissNotification(notification?.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user} 
        location={currentLocation}
        activeService={true}
      />
      <main className="pt-16">
        {/* Mobile Header */}
        <div className="lg:hidden bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/user-dashboard')}
            >
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="font-semibold text-foreground">Live Tracking</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsChatOpen(true)}
            >
              <Icon name="MessageCircle" size={20} />
              {chatMessages?.some(m => !m?.read && m?.sender !== 'user') && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              )}
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Desktop Header */}
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
                {chatMessages?.some(m => !m?.read && m?.sender !== 'user') && (
                  <div className="ml-2 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Map */}
            <div className="lg:col-span-2 space-y-6">
              <LiveMap
                userLocation={userLocation}
                technicianLocation={technicianLocation}
                route={route}
                onRecenterMap={handleRecenterMap}
                onToggleTraffic={handleToggleTraffic}
                showTraffic={showTraffic}
              />

              {/* Mobile Service Progress */}
              <div className="lg:hidden">
                <ServiceProgressIndicator
                  currentPhase={currentPhase}
                  phases={servicePhases}
                  lastUpdate={new Date()}
                />
              </div>
            </div>

            {/* Right Column - Information Panels */}
            <div className="space-y-6">
              <TechnicianInfoPanel
                technician={technician}
                estimatedArrival={estimatedArrival}
                currentStatus="En Route"
                onCall={handleCall}
                onChat={handleChat}
                onEmergencyContact={handleEmergencyContact}
              />

              {/* Desktop Service Progress */}
              <div className="hidden lg:block">
                <ServiceProgressIndicator
                  currentPhase={currentPhase}
                  phases={servicePhases}
                  lastUpdate={new Date()}
                />
              </div>

              <ServiceDetailsPanel
                serviceRequest={serviceRequest}
                pricing={pricing}
                onModifyRequest={handleModifyRequest}
                onCancelService={handleCancelService}
                onViewFullDetails={handleViewFullDetails}
              />
            </div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="lg:hidden fixed bottom-4 left-4 right-4 flex space-x-3">
            <Button
              variant="outline"
              iconName="Phone"
              iconPosition="left"
              onClick={handleCall}
              className="flex-1"
            >
              Call
            </Button>
            <Button
              variant="outline"
              iconName="MessageCircle"
              iconPosition="left"
              onClick={handleChat}
              className="flex-1"
            >
              Chat
              {chatMessages?.some(m => !m?.read && m?.sender !== 'user') && (
                <div className="ml-2 w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </Button>
            <Button
              variant="destructive"
              iconName="AlertTriangle"
              onClick={handleEmergencyContact}
              size="icon"
            >
            </Button>
          </div>
        </div>
      </main>
      {/* Notifications */}
      <NotificationToast
        notifications={notifications}
        onDismiss={handleDismissNotification}
        onAction={handleNotificationAction}
      />
      {/* Chat Widget */}
      <ChatWidget
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        technician={technician}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default LiveTracking;