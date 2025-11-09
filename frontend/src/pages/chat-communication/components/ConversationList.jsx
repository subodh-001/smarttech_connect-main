import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ConversationList = ({ 
  conversations, 
  selectedConversationId, 
  onSelectConversation,
  searchQuery,
  onSearchChange 
}) => {
  const formatLastMessageTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    
    const diffInDays = Math.floor(diffInMinutes / 1440);
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return messageTime?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getLastMessagePreview = (message) => {
    switch (message?.type) {
      case 'image':
        return '📷 Photo';
      case 'location':
        return '📍 Location';
      case 'booking_update':
        return '📅 Booking update';
      default:
        return message?.content?.length > 50 
          ? `${message?.content?.substring(0, 50)}...` 
          : message?.content;
    }
  };

  const filteredConversations = conversations?.filter(conversation =>
    conversation?.participant?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    conversation?.lastMessage?.content?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-surface">
      {/* Search Header */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Icon 
            name="Search" 
            size={18} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e?.target?.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
        </div>
      </div>
      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Icon name="MessageCircle" size={24} className="text-text-secondary" />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </h3>
            <p className="text-text-secondary text-sm max-w-xs">
              {searchQuery 
                ? 'Try adjusting your search terms' :'Start a conversation with a technician or user'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredConversations?.map((conversation) => (
              <div
                key={conversation?.id}
                onClick={() => onSelectConversation(conversation?.id)}
                className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedConversationId === conversation?.id 
                    ? 'bg-primary/5 border-r-2 border-primary' :''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar with Status */}
                  <div className="relative flex-shrink-0">
                    <Image
                      src={conversation?.participant?.avatar}
                      alt={conversation?.participant?.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-surface ${
                      conversation?.participant?.status === 'online' ? 'bg-success' : 'bg-text-secondary'
                    }`} />
                  </div>

                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-text-primary truncate">
                        {conversation?.participant?.name}
                      </h4>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-xs text-text-secondary">
                          {formatLastMessageTime(conversation?.lastMessage?.timestamp)}
                        </span>
                        {conversation?.unreadCount > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                            {conversation?.unreadCount > 99 ? '99+' : conversation?.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${
                        conversation?.unreadCount > 0 
                          ? 'text-text-primary font-medium' :'text-text-secondary'
                      }`}>
                        {conversation?.lastMessage?.senderId === 'current_user' && (
                          <span className="mr-1">
                            <Icon name="Check" size={12} className="inline" />
                          </span>
                        )}
                        {getLastMessagePreview(conversation?.lastMessage)}
                      </p>
                      
                      {/* Booking Badge */}
                      {conversation?.booking && (
                        <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                          <Icon name="Calendar" size={12} className="text-primary" />
                          <span className="text-xs text-primary font-medium">
                            #{conversation?.booking?.id}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Technician Rating */}
                    {conversation?.participant?.role === 'technician' && conversation?.participant?.rating && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Icon name="Star" size={12} className="text-warning fill-current" />
                        <span className="text-xs text-text-secondary">
                          {conversation?.participant?.rating} • {conversation?.participant?.completedJobs} jobs
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;