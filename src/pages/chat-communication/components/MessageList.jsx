import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

const MessageList = ({ 
  messages, 
  currentUserId, 
  isLoading = false,
  onLoadMore,
  hasMore = false 
}) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = () => {
    if (messagesContainerRef?.current && hasMore && !isLoading) {
      const { scrollTop } = messagesContainerRef?.current;
      if (scrollTop === 0) {
        onLoadMore?.();
      }
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentGroup = null;
    
    messages?.forEach((message) => {
      const messageDate = new Date(message.timestamp)?.toDateString();
      
      if (!currentGroup || currentGroup?.date !== messageDate) {
        currentGroup = {
          date: messageDate,
          messages: [message]
        };
        groups?.push(currentGroup);
      } else {
        currentGroup?.messages?.push(message);
      }
    });
    
    return groups;
  };

  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday?.setDate(yesterday?.getDate() - 1);
    
    if (date?.toDateString() === today?.toDateString()) {
      return 'Today';
    } else if (date?.toDateString() === yesterday?.toDateString()) {
      return 'Yesterday';
    } else {
      return date?.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: date?.getFullYear() !== today?.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const shouldShowAvatar = (message, nextMessage) => {
    if (!nextMessage) return true;
    return message?.senderId !== nextMessage?.senderId;
  };

  const messageGroups = groupMessagesByDate(messages);

  if (messages?.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
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
            Start the conversation
          </h3>
          <p className="text-text-secondary text-sm">
            Send a message to begin chatting about your service request.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-1"
    >
      {/* Load More Indicator */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="flex items-center space-x-2 text-text-secondary">
            <div className="w-4 h-4 border-2 border-text-secondary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading messages...</span>
          </div>
        </div>
      )}
      {/* Message Groups */}
      {messageGroups?.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-1">
          {/* Date Header */}
          <div className="flex justify-center py-4">
            <span className="bg-muted px-3 py-1 rounded-full text-xs font-medium text-text-secondary">
              {formatDateHeader(group?.date)}
            </span>
          </div>

          {/* Messages */}
          {group?.messages?.map((message, messageIndex) => {
            const nextMessage = group?.messages?.[messageIndex + 1];
            const isOwn = message?.senderId === currentUserId;
            const showAvatar = shouldShowAvatar(message, nextMessage);

            return (
              <MessageBubble
                key={message?.id}
                message={message}
                isOwn={isOwn}
                showAvatar={showAvatar}
              />
            );
          })}
        </div>
      ))}
      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;