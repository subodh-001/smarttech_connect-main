import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const MessageBubble = ({ message, isOwn, showAvatar = true }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp)?.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDeliveryStatusIcon = (status) => {
    switch (status) {
      case 'sent': return 'Check';
      case 'delivered': return 'CheckCheck';
      case 'read': return 'CheckCheck';
      default: return 'Clock';
    }
  };

  const getDeliveryStatusColor = (status) => {
    switch (status) {
      case 'read': return 'text-primary';
      case 'delivered': return 'text-text-secondary';
      case 'sent': return 'text-text-secondary';
      default: return 'text-text-secondary';
    }
  };

  const renderMessageContent = () => {
    switch (message?.type) {
      case 'text':
        return (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message?.content}
          </p>
        );
      
      case 'image':
        return (
          <div className="space-y-2">
            <div className="rounded-lg overflow-hidden max-w-xs">
              <Image
                src={message?.imageUrl}
                alt="Shared image"
                className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
              />
            </div>
            {message?.caption && (
              <p className="text-sm leading-relaxed">
                {message?.caption}
              </p>
            )}
          </div>
        );
      
      case 'location':
        return (
          <div className="space-y-2">
            <div className="bg-muted rounded-lg p-3 max-w-xs">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="MapPin" size={16} className="text-primary" />
                <span className="text-sm font-medium">Location Shared</span>
              </div>
              <p className="text-xs text-text-secondary">
                {message?.locationName || 'Current Location'}
              </p>
            </div>
          </div>
        );
      
      case 'booking_update':
        return (
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 max-w-xs">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Calendar" size={16} className="text-accent" />
              <span className="text-sm font-medium text-accent">
                Booking Update
              </span>
            </div>
            <p className="text-sm text-text-primary">
              {message?.content}
            </p>
          </div>
        );
      
      default:
        return (
          <p className="text-sm leading-relaxed">
            {message?.content}
          </p>
        );
    }
  };

  return (
    <div className={`flex items-end space-x-2 mb-4 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {showAvatar && !isOwn && (
        <Image
          src={message?.senderAvatar}
          alt={message?.senderName}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
      )}
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted text-text-primary rounded-bl-md'
          }`}
        >
          {renderMessageContent()}
        </div>
        
        <div className={`flex items-center space-x-1 mt-1 px-1 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <span className="text-xs text-text-secondary">
            {formatTime(message?.timestamp)}
          </span>
          
          {isOwn && message?.deliveryStatus && (
            <Icon
              name={getDeliveryStatusIcon(message?.deliveryStatus)}
              size={12}
              className={getDeliveryStatusColor(message?.deliveryStatus)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;