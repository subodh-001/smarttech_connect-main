import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import ConversationList from './components/ConversationList';
import ConversationHeader from './components/ConversationHeader';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import BookingContextPanel from './components/BookingContextPanel';

const ChatCommunication = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBookingPanelExpanded, setIsBookingPanelExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // Mock current user data
  const currentUser = {
    id: "user_123",
    role: "user",
    name: "John Smith",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  };

  // Mock conversations data
  const [conversations] = useState([
    {
      id: "conv_1",
      participant: {
        id: "tech_456",
        name: "Mike Rodriguez",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        role: "technician",
        status: "online",
        rating: 4.8,
        completedJobs: 127,
        lastSeen: null
      },
      booking: {
        id: "BK001",
        serviceType: "Plumbing Repair",
        category: "Plumbing",
        status: "in_progress",
        scheduledDate: "2025-01-08",
        scheduledTime: "14:00",
        budget: 150,
        priority: "high",
        description: `Kitchen sink is completely blocked and water is backing up into the dishwasher. This started yesterday evening after we ran the garbage disposal. We've tried using a plunger and drain cleaner but nothing is working. The water level keeps rising and we're worried about overflow damage to the kitchen floor.`,
        location: {
          address: "1234 Oak Street, Apt 2B",
          city: "San Francisco",
          state: "CA",
          zipCode: "94102"
        }
      },
      lastMessage: {
        id: "msg_15",
        senderId: "tech_456",
        content: "I'm about 5 minutes away from your location. I have all the necessary tools to fix the blockage.",
        timestamp: new Date(Date.now() - 300000),
        type: "text",
        deliveryStatus: "read"
      },
      unreadCount: 2
    },
    {
      id: "conv_2",
      participant: {
        id: "tech_789",
        name: "Sarah Chen",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        role: "technician",
        status: "away",
        rating: 4.9,
        completedJobs: 89,
        lastSeen: new Date(Date.now() - 1800000)
      },
      booking: {
        id: "BK002",
        serviceType: "AC Repair",
        category: "HVAC",
        status: "completed",
        scheduledDate: "2025-01-07",
        scheduledTime: "10:00",
        budget: 200,
        priority: "normal",
        description: "Air conditioning unit not cooling properly. Temperature stays around 78°F even when set to 68°F.",
        location: {
          address: "5678 Pine Avenue",
          city: "San Francisco",
          state: "CA",
          zipCode: "94103"
        }
      },
      lastMessage: {
        id: "msg_28",
        senderId: "user_123",
        content: "Thank you so much! The AC is working perfectly now. Great service!",
        timestamp: new Date(Date.now() - 86400000),
        type: "text",
        deliveryStatus: "read"
      },
      unreadCount: 0
    },
    {
      id: "conv_3",
      participant: {
        id: "tech_321",
        name: "David Wilson",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
        role: "technician",
        status: "offline",
        rating: 4.7,
        completedJobs: 156,
        lastSeen: new Date(Date.now() - 7200000)
      },
      booking: {
        id: "BK003",
        serviceType: "Electrical Wiring",
        category: "Electrical",
        status: "confirmed",
        scheduledDate: "2025-01-09",
        scheduledTime: "09:00",
        budget: 300,
        priority: "urgent",
        description: "Multiple outlets in the living room stopped working suddenly. Need urgent electrical inspection.",
        location: {
          address: "9012 Elm Street",
          city: "San Francisco",
          state: "CA",
          zipCode: "94104"
        }
      },
      lastMessage: {
        id: "msg_42",
        senderId: "tech_321",
        content: "I'll be there first thing tomorrow morning. Please don't use any electrical appliances in that room until I check the wiring.",
        timestamp: new Date(Date.now() - 3600000),
        type: "text",
        deliveryStatus: "delivered"
      },
      unreadCount: 0
    }
  ]);

  // Mock messages data
  const [messages, setMessages] = useState([
    {
      id: "msg_1",
      senderId: "user_123",
      senderName: "John Smith",
      senderAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content: "Hi Mike, I have a plumbing emergency. My kitchen sink is completely blocked.",
      timestamp: new Date(Date.now() - 7200000),
      type: "text",
      deliveryStatus: "read"
    },
    {
      id: "msg_2",
      senderId: "tech_456",
      senderName: "Mike Rodriguez",
      senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content: "Hello John! I can help you with that. Can you describe the issue in more detail?",
      timestamp: new Date(Date.now() - 7000000),
      type: "text",
      deliveryStatus: "read"
    },
    {
      id: "msg_3",
      senderId: "user_123",
      senderName: "John Smith",
      senderAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content: "The water is backing up into the dishwasher and I'm worried about overflow. I tried using a plunger but it didn't work.",
      timestamp: new Date(Date.now() - 6800000),
      type: "text",
      deliveryStatus: "read"
    },
    {
      id: "msg_4",
      senderId: "tech_456",
      senderName: "Mike Rodriguez",
      senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content: "That sounds like a serious blockage in the main drain line. I can be there within 30 minutes. My rate is $120/hour plus parts.",
      timestamp: new Date(Date.now() - 6600000),
      type: "text",
      deliveryStatus: "read"
    },
    {
      id: "msg_5",
      senderId: "user_123",
      senderName: "John Smith",
      senderAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content: "Perfect! That works within my budget. Please come as soon as possible.",
      timestamp: new Date(Date.now() - 6400000),
      type: "text",
      deliveryStatus: "read"
    },
    {
      id: "msg_6",
      senderId: "tech_456",
      senderName: "Mike Rodriguez",
      senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content: "Great! I'm gathering my tools now. Can you share your exact location?",
      timestamp: new Date(Date.now() - 6200000),
      type: "text",
      deliveryStatus: "read"
    },
    {
      id: "msg_7",
      senderId: "user_123",
      senderName: "John Smith",
      senderAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content: "",
      timestamp: new Date(Date.now() - 6000000),
      type: "location",
      locationName: "1234 Oak Street, Apt 2B, San Francisco, CA",
      deliveryStatus: "read"
    },
    {
      id: "msg_8",
      senderId: "tech_456",
      senderName: "Mike Rodriguez",
      senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content: "Booking confirmed for emergency plumbing repair at 1234 Oak Street, Apt 2B. Estimated arrival: 2:30 PM",
      timestamp: new Date(Date.now() - 5800000),
      type: "booking_update",
      deliveryStatus: "read"
    },
    {
      id: "msg_9",
      senderId: "user_123",
      senderName: "John Smith",
      senderAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content: "Here's a photo of the current situation",
      timestamp: new Date(Date.now() - 5600000),
      type: "image",
      imageUrl: "https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?w=400&h=300&fit=crop",
      caption: "Water backing up in kitchen sink",
      deliveryStatus: "read"
    },
    {
      id: "msg_10",
      senderId: "tech_456",
      senderName: "Mike Rodriguez",
      senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content: "I can see the issue clearly. This looks like a grease buildup in the main line. I'll bring the drain snake and high-pressure jetter.",
      timestamp: new Date(Date.now() - 5400000),
      type: "text",
      deliveryStatus: "read"
    },
    {
      id: "msg_11",
      senderId: "tech_456",
      senderName: "Mike Rodriguez",
      senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content: "I'm on my way now. ETA 15 minutes.",
      timestamp: new Date(Date.now() - 1800000),
      type: "text",
      deliveryStatus: "read"
    },
    {
      id: "msg_12",
      senderId: "user_123",
      senderName: "John Smith",
      senderAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content: "Thank you! I'll be waiting. The building entrance is on Oak Street.",
      timestamp: new Date(Date.now() - 1200000),
      type: "text",
      deliveryStatus: "read"
    },
    {
      id: "msg_13",
      senderId: "tech_456",
      senderName: "Mike Rodriguez",
      senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content: "Perfect! I can see the building now. Just parking.",
      timestamp: new Date(Date.now() - 600000),
      type: "text",
      deliveryStatus: "read"
    },
    {
      id: "msg_14",
      senderId: "user_123",
      senderName: "John Smith",
      senderAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content: "Great! I'll buzz you in. Apartment 2B on the second floor.",
      timestamp: new Date(Date.now() - 480000),
      type: "text",
      deliveryStatus: "read"
    },
    {
      id: "msg_15",
      senderId: "tech_456",
      senderName: "Mike Rodriguez",
      senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content: "I'm about 5 minutes away from your location. I have all the necessary tools to fix the blockage.",
      timestamp: new Date(Date.now() - 300000),
      type: "text",
      deliveryStatus: "delivered"
    }
  ]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set initial conversation from URL params or default to first conversation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const conversationId = params?.get('conversation');
    
    if (conversationId && conversations?.find(c => c?.id === conversationId)) {
      setSelectedConversationId(conversationId);
    } else if (conversations?.length > 0 && !isMobileView) {
      setSelectedConversationId(conversations?.[0]?.id);
    }
  }, [location?.search, conversations, isMobileView]);

  const selectedConversation = conversations?.find(c => c?.id === selectedConversationId);

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
    navigate(`/chat-communication?conversation=${conversationId}`);
  };

  const handleBackToList = () => {
    setSelectedConversationId(null);
    navigate('/chat-communication');
  };

  const handleSendMessage = (messageData) => {
    const newMessage = {
      id: `msg_${Date.now()}`,
      senderId: currentUser?.id,
      senderName: currentUser?.name,
      senderAvatar: currentUser?.avatar,
      content: messageData?.content,
      timestamp: messageData?.timestamp,
      type: messageData?.type,
      deliveryStatus: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      // Simulate auto-response for demo
      if (selectedConversation) {
        const autoResponse = {
          id: `msg_${Date.now() + 1}`,
          senderId: selectedConversation?.participant?.id,
          senderName: selectedConversation?.participant?.name,
          senderAvatar: selectedConversation?.participant?.avatar,
          content: "Thanks for the update! I'll respond shortly.",
          timestamp: new Date(),
          type: 'text',
          deliveryStatus: 'delivered'
        };
        setMessages(prev => [...prev, autoResponse]);
      }
    }, 2000);
  };

  const handleSendImage = (file) => {
    // In a real app, you would upload the file and get a URL
    const imageUrl = URL.createObjectURL(file);
    
    const newMessage = {
      id: `msg_${Date.now()}`,
      senderId: currentUser?.id,
      senderName: currentUser?.name,
      senderAvatar: currentUser?.avatar,
      content: '',
      timestamp: new Date(),
      type: 'image',
      imageUrl: imageUrl,
      caption: '',
      deliveryStatus: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendLocation = (locationData) => {
    const newMessage = {
      id: `msg_${Date.now()}`,
      senderId: currentUser?.id,
      senderName: currentUser?.name,
      senderAvatar: currentUser?.avatar,
      content: '',
      timestamp: locationData?.timestamp,
      type: 'location',
      locationName: 'Current Location',
      deliveryStatus: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const handleProfileClick = () => {
    navigate('/profile-management');
  };

  const handleBookingDetailsClick = () => {
    navigate('/booking-management');
  };

  // Mobile view - show conversation list or selected conversation
  if (isMobileView) {
    if (!selectedConversationId) {
      return (
          <div className="min-h-screen bg-background">
            <Header />
            <div className="h-screen pt-16 pb-14">
              <ConversationList
                conversations={conversations}
                selectedConversationId={selectedConversationId}
                onSelectConversation={handleSelectConversation}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
          </div>
        
      );
    }

    return (
        <div className="min-h-screen bg-background">
          <div className="h-screen flex flex-col">
            <ConversationHeader
              participant={selectedConversation?.participant}
              booking={selectedConversation?.booking}
              onBackClick={handleBackToList}
              onBookingDetailsClick={handleBookingDetailsClick}
              onProfileClick={handleProfileClick}
            />
            
            <BookingContextPanel
              booking={selectedConversation?.booking}
              isExpanded={isBookingPanelExpanded}
              onToggle={() => setIsBookingPanelExpanded(!isBookingPanelExpanded)}
            />
            
            <MessageList
              messages={messages}
              currentUserId={currentUser?.id}
              isLoading={false}
              onLoadMore={() => {}}
            />
            
            <MessageInput
              onSendMessage={handleSendMessage}
              onSendImage={handleSendImage}
              onSendLocation={handleSendLocation}
              isTyping={isTyping}
            />
          </div>
        </div>
    );
  }

  // Desktop view - show both panels
  return (
      <div className="min-h-screen bg-background">
        <Header onToggleSidebar={() => {}} />
        <div className="h-screen pt-16 flex">
          {/* Conversations Sidebar */}
          <div className="w-80 border-r border-border flex-shrink-0">
            <ConversationList
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              onSelectConversation={handleSelectConversation}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                <ConversationHeader
                  participant={selectedConversation?.participant}
                  booking={selectedConversation?.booking}
                  onBackClick={handleBackToList}
                  onBookingDetailsClick={handleBookingDetailsClick}
                  onProfileClick={handleProfileClick}
                />
                
                <BookingContextPanel
                  booking={selectedConversation?.booking}
                  isExpanded={isBookingPanelExpanded}
                  onToggle={() => setIsBookingPanelExpanded(!isBookingPanelExpanded)}
                />
                
                <MessageList
                  messages={messages}
                  currentUserId={currentUser?.id}
                  isLoading={false}
                  onLoadMore={() => {}}
                />
                
                <MessageInput
                  onSendMessage={handleSendMessage}
                  onSendImage={handleSendImage}
                  onSendLocation={handleSendLocation}
                  isTyping={isTyping}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-muted/30">
                <div className="text-center max-w-sm">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-10 h-10 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">
                    Select a conversation
                  </h3>
                  <p className="text-text-secondary">
                    Choose a conversation from the sidebar to start chatting with technicians or users.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default ChatCommunication;