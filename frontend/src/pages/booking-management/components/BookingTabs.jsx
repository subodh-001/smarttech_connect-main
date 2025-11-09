import React from 'react';
import Icon from '../../../components/AppIcon';

const BookingTabs = ({ activeTab, onTabChange, bookingCounts }) => {
  const tabs = [
    {
      id: 'active',
      label: 'Active',
      icon: 'Activity',
      count: bookingCounts?.active || 0,
      color: 'text-success'
    },
    {
      id: 'upcoming',
      label: 'Upcoming',
      icon: 'Clock',
      count: bookingCounts?.upcoming || 0,
      color: 'text-primary'
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: 'CheckCircle',
      count: bookingCounts?.completed || 0,
      color: 'text-muted-foreground'
    },
    {
      id: 'cancelled',
      label: 'Cancelled',
      icon: 'XCircle',
      count: bookingCounts?.cancelled || 0,
      color: 'text-error'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-1 mb-6">
      <div className="flex overflow-x-auto">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => onTabChange(tab?.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-smooth whitespace-nowrap min-w-0 flex-1 lg:flex-none ${
              activeTab === tab?.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-muted'
            }`}
          >
            <Icon 
              name={tab?.icon} 
              size={16} 
              className={activeTab === tab?.id ? 'text-primary-foreground' : tab?.color}
            />
            <span className="truncate">{tab?.label}</span>
            {tab?.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                activeTab === tab?.id
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-muted text-text-secondary'
              }`}>
                {tab?.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BookingTabs;