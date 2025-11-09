import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const NotificationCenter = ({ notifications, onMarkAsRead, onMarkAllAsRead }) => {
  const [filter, setFilter] = useState('all');

  const getNotificationIcon = (type) => {
    const icons = {
      'job-alert': 'Briefcase',
      'message': 'MessageCircle',
      'payment': 'DollarSign',
      'system': 'Settings',
      'rating': 'Star',
      'booking': 'Calendar'
    };
    return icons?.[type] || 'Bell';
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return 'text-error';
    if (priority === 'medium') return 'text-warning';
    
    switch (type) {
      case 'job-alert': return 'text-primary';
      case 'message': return 'text-accent';
      case 'payment': return 'text-success';
      case 'rating': return 'text-warning';
      default: return 'text-text-secondary';
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      'high': 'bg-error/10 text-error border-error/20',
      'medium': 'bg-warning/10 text-warning border-warning/20',
      'low': 'bg-success/10 text-success border-success/20'
    };
    return colors?.[priority] || '';
  };

  const filteredNotifications = notifications?.filter(notification => {
    if (filter === 'unread') return !notification?.read;
    if (filter === 'priority') return notification?.priority === 'high';
    return true;
  });

  const unreadCount = notifications?.filter(n => !n?.read)?.length;

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-subtle">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold text-text-primary">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-error text-error-foreground text-xs font-medium px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onMarkAllAsRead}
          iconName="CheckCheck"
          iconPosition="left"
        >
          Mark All Read
        </Button>
      </div>
      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
        {[
          { key: 'all', label: 'All', count: notifications?.length },
          { key: 'unread', label: 'Unread', count: unreadCount },
          { key: 'priority', label: 'Priority', count: notifications?.filter(n => n?.priority === 'high')?.length }
        ]?.map((tab) => (
          <button
            key={tab?.key}
            onClick={() => setFilter(tab?.key)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-smooth ${
              filter === tab?.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>{tab?.label}</span>
            {tab?.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                filter === tab?.key ? 'bg-primary-foreground/20' : 'bg-muted'
              }`}>
                {tab?.count}
              </span>
            )}
          </button>
        ))}
      </div>
      {/* Notifications List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredNotifications?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Bell" size={48} color="var(--color-text-secondary)" className="mx-auto mb-4" />
            <p className="text-text-secondary">No notifications to show</p>
          </div>
        ) : (
          filteredNotifications?.map((notification) => (
            <div
              key={notification?.id}
              className={`p-4 rounded-lg border transition-smooth cursor-pointer hover:shadow-subtle ${
                notification?.read 
                  ? 'bg-muted/50 border-border' :'bg-card border-primary/20 shadow-sm'
              }`}
              onClick={() => onMarkAsRead(notification?.id)}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  notification?.read ? 'bg-muted' : 'bg-primary/10'
                }`}>
                  <Icon 
                    name={getNotificationIcon(notification?.type)} 
                    size={20} 
                    color={getNotificationColor(notification?.type, notification?.priority)}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className={`font-medium ${
                      notification?.read ? 'text-text-secondary' : 'text-text-primary'
                    }`}>
                      {notification?.title}
                    </h4>
                    <div className="flex items-center space-x-2 ml-2">
                      {notification?.priority === 'high' && (
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(notification?.priority)}`}>
                          HIGH
                        </div>
                      )}
                      {!notification?.read && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                  </div>

                  <p className={`text-sm mb-2 ${
                    notification?.read ? 'text-text-secondary' : 'text-text-primary'
                  }`}>
                    {notification?.message}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">
                      {notification?.timeAgo}
                    </span>
                    {notification?.actionRequired && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        Take Action
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;