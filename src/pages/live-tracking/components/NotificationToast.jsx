import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const NotificationToast = ({ 
  notifications, 
  onDismiss, 
  onAction 
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    setVisibleNotifications(notifications?.filter(n => !n?.dismissed));
  }, [notifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'arrival':
        return 'MapPin';
      case 'status':
        return 'Clock';
      case 'completion':
        return 'CheckCircle';
      case 'emergency':
        return 'AlertTriangle';
      case 'message':
        return 'MessageCircle';
      default:
        return 'Bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'arrival':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'status':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'completion':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'emergency':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'message':
        return 'border-orange-200 bg-orange-50 text-orange-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp)?.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (visibleNotifications?.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-40 space-y-2 max-w-sm">
      {visibleNotifications?.map((notification) => (
        <div
          key={notification?.id}
          className={`border rounded-lg p-4 trust-shadow-lg animate-slide-in-right ${getNotificationColor(notification?.type)}`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Icon 
                name={getNotificationIcon(notification?.type)} 
                size={20} 
                className="mt-0.5"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold truncate">
                  {notification?.title}
                </h4>
                <span className="text-xs opacity-75 ml-2">
                  {formatTime(notification?.timestamp)}
                </span>
              </div>
              
              <p className="text-sm mt-1 opacity-90">
                {notification?.message}
              </p>
              
              {notification?.actionLabel && (
                <div className="mt-3 flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => onAction(notification)}
                    className="text-xs"
                  >
                    {notification?.actionLabel}
                  </Button>
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDismiss(notification?.id)}
              className="flex-shrink-0 w-6 h-6 -mt-1 -mr-1 opacity-60 hover:opacity-100"
            >
              <Icon name="X" size={12} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;