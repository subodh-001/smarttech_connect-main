import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { formatTechnicianName } from '../../../utils/formatTechnicianName';

const ConversationHeader = ({ 
  participant, 
  booking, 
  onBackClick, 
  onBookingDetailsClick,
  onProfileClick 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-success';
      case 'away': return 'text-warning';
      default: return 'text-text-secondary';
    }
  };

  const getStatusText = (status, lastSeen) => {
    if (status === 'online') return 'Online';
    if (lastSeen) {
      const now = new Date();
      const lastSeenDate = new Date(lastSeen);
      const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
      
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
      return lastSeenDate?.toLocaleDateString();
    }
    return 'Offline';
  };

  return (
    <div className="bg-surface border-b border-border p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBackClick}
          className="md:hidden"
        >
          <Icon name="ArrowLeft" size={20} />
        </Button>
        
        <div 
          className="flex items-center space-x-3 cursor-pointer"
          onClick={onProfileClick}
        >
          <div className="relative">
            <Image
              src={participant?.avatar}
              alt={participant?.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface ${
              participant?.status === 'online' ? 'bg-success' : 'bg-text-secondary'
            }`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-primary truncate">
              {participant?.role === 'technician' 
                ? formatTechnicianName(participant)
                : participant?.name || 'User'}
            </h3>
            {participant?.email && (
              <p className="text-xs text-text-secondary truncate mt-0.5">
                {participant.email}
              </p>
            )}
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-sm ${getStatusColor(participant?.status)}`}>
                {getStatusText(participant?.status, participant?.lastSeen)}
              </span>
              {participant?.role === 'technician' && participant?.rating && (
                <>
                  <span className="text-text-secondary">•</span>
                  <div className="flex items-center space-x-1">
                    <Icon name="Star" size={12} className="text-warning fill-current" />
                    <span className="text-sm text-text-secondary">
                      {participant?.rating}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {booking && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBookingDetailsClick}
            className="hidden sm:flex"
          >
            <Icon name="FileText" size={16} className="mr-2" />
            Booking #{booking?.id}
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
        >
          <Icon name="Phone" size={18} />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
        >
          <Icon name="MoreVertical" size={18} />
        </Button>
      </div>
    </div>
  );
};

export default ConversationHeader;