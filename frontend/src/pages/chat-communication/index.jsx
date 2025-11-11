import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import ConversationList from './components/ConversationList';
import ConversationHeader from './components/ConversationHeader';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import BookingContextPanel from './components/BookingContextPanel';
import { useAuth } from '../../contexts/NewAuthContext';

const fallbackAvatar = (name = 'User') =>
  `https://ui-avatars.com/api/?background=6366F1&color=fff&name=${encodeURIComponent(name)}`;

const formatCurrencyINR = (amount) => {
  if (amount == null) return null;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  } catch (_) {
    return `₹${amount}`;
  }
};

const ChatCommunication = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [conversationError, setConversationError] = useState(null);

  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageError, setMessageError] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isBookingPanelExpanded, setIsBookingPanelExpanded] = useState(false);
  const [isMobileView, setIsMobileView] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  const role = user?.role || userProfile?.role || 'user';
  const currentUserId =
    user?.id ||
    user?._id ||
    userProfile?.id ||
    userProfile?._id ||
    userProfile?.user_id ||
    null;

  const currentUser = useMemo(
    () => ({
      id: currentUserId,
      name:
        userProfile?.full_name ||
        userProfile?.fullName ||
        user?.fullName ||
        user?.name ||
        user?.email ||
        'You',
      avatar:
        userProfile?.avatar_url ||
        user?.avatarUrl ||
        fallbackAvatar(
          userProfile?.full_name ||
            userProfile?.fullName ||
            user?.fullName ||
            user?.email ||
            'You'
        ),
    }),
    [currentUserId, user, userProfile]
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mapMessageFromApi = useCallback((message) => {
    if (!message) return null;
    const sender = message.sender || {};
    const metadata = message.metadata || {};
    return {
      id: message.id,
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatar || fallbackAvatar(sender.name),
      type: message.type || 'text',
      content: message.content || '',
      metadata,
      imageUrl: metadata.imageUrl,
      caption: metadata.caption,
      locationName:
        metadata.label || metadata.address || metadata.locationName || metadata.name,
      timestamp: message.createdAt || message.timestamp,
      deliveryStatus: message.deliveryStatus || 'delivered',
    };
  }, []);

  const loadConversations = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoadingConversations(true);
        setConversationError(null);
      }
      try {
        const { data } = await axios.get('/api/service-requests/conversations');
        setConversations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load conversations:', error);
        if (!silent) {
          setConversationError(
            error?.response?.data?.error || 'Unable to load conversations right now.'
          );
          setConversations([]);
        }
      } finally {
        if (!silent) setLoadingConversations(false);
      }
    },
    []
  );

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadConversations(true);
    }, 20000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  const fetchMessages = useCallback(
    async (conversationId, { silent = false } = {}) => {
      if (!conversationId) return;
      if (!silent) {
        setLoadingMessages(true);
        setMessageError(null);
      }
      try {
        const { data } = await axios.get(`/api/service-requests/${conversationId}/messages`);
        const rawMessages = Array.isArray(data?.messages) ? data.messages : [];
        const mappedMessages = rawMessages.map(mapMessageFromApi).filter(Boolean);

        setMessages(mappedMessages);

        const latestMessage = mappedMessages.length
          ? mappedMessages[mappedMessages.length - 1]
          : null;

        if (latestMessage) {
          setConversations((prev) =>
            prev.map((conversation) =>
              conversation.id === conversationId
                ? {
                    ...conversation,
                    lastMessage: {
                      id: latestMessage.id,
                      senderId: latestMessage.senderId,
                      senderName: latestMessage.senderName,
                      content: latestMessage.content,
                      type: latestMessage.type,
                      metadata: latestMessage.metadata,
                      timestamp: latestMessage.timestamp,
                      deliveryStatus: latestMessage.deliveryStatus,
                    },
                    unreadCount: 0,
                  }
                : conversation
            )
          );
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
        if (!silent) {
          setMessageError(error?.response?.data?.error || 'Unable to load messages right now.');
          setMessages([]);
        }
      } finally {
        if (!silent) setLoadingMessages(false);
      }
    },
    [mapMessageFromApi]
  );

  useEffect(() => {
    if (loadingConversations) return;
    const params = new URLSearchParams(location.search);
    const conversationIdFromUrl = params.get('conversation');
    const conversationIdFromState =
      location.state?.conversationId ||
      location.state?.serviceRequestId ||
      location.state?.serviceRequest?.id ||
      location.state?.bookingId;

    const targetConversationId = conversationIdFromUrl || conversationIdFromState;

    if (
      targetConversationId &&
      conversations.some((conversation) => conversation.id === targetConversationId)
    ) {
      setSelectedConversationId(targetConversationId);
    } else if (!isMobileView && !selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [
    location.search,
    location.state,
    conversations,
    loadingConversations,
    isMobileView,
    selectedConversationId,
  ]);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }
    setIsBookingPanelExpanded(false);
    fetchMessages(selectedConversationId);
  }, [selectedConversationId, fetchMessages]);

  useEffect(() => {
    if (!selectedConversationId) return;
    const interval = setInterval(() => {
      fetchMessages(selectedConversationId, { silent: true });
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedConversationId, fetchMessages]);

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
    navigate(`/chat-communication?conversation=${conversationId}`);
  };

  const handleBackToList = () => {
    setSelectedConversationId(null);
    navigate('/chat-communication');
  };

  const appendMessageToConversation = useCallback((conversationId, message) => {
    setMessages((prev) => [...prev, message]);
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              lastMessage: {
                id: message.id,
                senderId: message.senderId,
                senderName: message.senderName,
                content: message.content,
                type: message.type,
                metadata: message.metadata,
                timestamp: message.timestamp,
                deliveryStatus: message.deliveryStatus,
              },
              updatedAt: message.timestamp,
              unreadCount: 0,
            }
          : conversation
      )
    );
  }, []);

  const sendMessage = useCallback(
    async ({ type = 'text', content = '', metadata = {} }) => {
      if (!selectedConversationId) return;
      setSendingMessage(true);
      setMessageError(null);
      try {
        const payload = { type, content, metadata };
        const { data } = await axios.post(
          `/api/service-requests/${selectedConversationId}/messages`,
          payload
        );
        const mapped = mapMessageFromApi(data?.message);
        if (mapped) {
          appendMessageToConversation(selectedConversationId, mapped);
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        setMessageError(error?.response?.data?.error || 'Unable to send message.');
      } finally {
        setSendingMessage(false);
      }
    },
    [appendMessageToConversation, mapMessageFromApi, selectedConversationId]
  );

  const handleSendMessage = async (messageData) => {
    if (!selectedConversationId || sendingMessage) return;
    await sendMessage({
      type: messageData?.type || 'text',
      content: messageData?.content || '',
      metadata: messageData?.metadata || {},
    });
  };

  const handleSendImage = async (file) => {
    if (!selectedConversationId || !file || sendingMessage) return;
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.readAsDataURL(file);
      });

      await sendMessage({
        type: 'image',
        content: '',
        metadata: {
          imageUrl: dataUrl,
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
        },
      });
    } catch (error) {
      console.error('Failed to share image:', error);
      setMessageError('Unable to share the selected image.');
    }
  };

  const handleSendLocation = async ({ latitude, longitude }) => {
    if (!selectedConversationId || latitude == null || longitude == null || sendingMessage) return;
    const label = `${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}`;
    await sendMessage({
      type: 'location',
      content: '',
      metadata: {
        latitude,
        longitude,
        label,
        mapUrl: `https://www.google.com/maps?q=${latitude},${longitude}`,
      },
    });
  };

  const enrichedSelectedConversation = useMemo(() => {
    if (!conversations || conversations.length === 0) return null;
    const active = conversations.find((conversation) => conversation.id === selectedConversationId);
    if (!active) return null;
    const booking = active.booking
      ? {
          ...active.booking,
          formattedBudget: formatCurrencyINR(active.booking.budget),
        }
      : null;
    return {
      ...active,
      booking,
    };
  }, [conversations, selectedConversationId]);

  const unreadTotal = useMemo(
    () => conversations.reduce((sum, conversation) => sum + (conversation.unreadCount || 0), 0),
    [conversations]
  );

  return (
    <div className="min-h-screen bg-background">
      <Header user={currentUser} messageBadgeCount={unreadTotal} />
      <main className="pt-16 h-[calc(100vh-4rem)] flex">
        <div
          className={`border-r border-border ${
            selectedConversationId && isMobileView ? 'hidden md:flex' : 'flex'
          } w-full md:w-80 flex-col`}
        >
          {conversationError ? (
            <div className="p-4 text-sm text-error bg-error/10 border-b border-error/20">
              {conversationError}
            </div>
          ) : null}
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            currentUserId={currentUserId}
            loading={loadingConversations}
          />
        </div>

        <div className="flex-1 flex flex-col bg-muted/30">
          {enrichedSelectedConversation ? (
            <>
              <ConversationHeader
                participant={enrichedSelectedConversation.participant}
                booking={enrichedSelectedConversation.booking}
                onBackClick={handleBackToList}
                onBookingDetailsClick={() =>
                  setIsBookingPanelExpanded((prev) => !prev)
                }
                onProfileClick={() => {}}
              />

              <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 flex flex-col">
                  {messageError ? (
                    <div className="px-4 py-2 text-xs text-error bg-error/10 border-b border-error/20">
                      {messageError}
                    </div>
                  ) : null}
                  <MessageList
                    messages={messages}
                    currentUserId={currentUserId}
                    isLoading={loadingMessages}
                    hasMore={false}
                  />
                  <MessageInput
                    onSendMessage={handleSendMessage}
                    onSendImage={handleSendImage}
                    onSendLocation={handleSendLocation}
                    isTyping={false}
                    disabled={sendingMessage}
                  />
                </div>

                <div className="hidden xl:flex xl:w-80 border-l border-border flex-col">
                  <BookingContextPanel
                    booking={enrichedSelectedConversation.booking}
                    isExpanded={isBookingPanelExpanded}
                    onToggle={() => setIsBookingPanelExpanded((prev) => !prev)}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              {loadingConversations ? (
                <div className="text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-text-secondary">Loading conversations...</p>
                </div>
              ) : (
                <div className="text-center max-w-sm">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-text-secondary"
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
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-text-secondary text-sm">
                    Choose a booking or start a conversation with your technician to share updates.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ChatCommunication;