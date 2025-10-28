import React from 'react';
import Icon from '../../../components/AppIcon';

const StatsOverview = ({ stats }) => {
  const statItems = [
    {
      label: 'Total Bookings',
      value: stats?.totalBookings,
      icon: 'Calendar',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Completed Services',
      value: stats?.completedServices,
      icon: 'CheckCircle',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Money Saved',
      value: `₹${stats?.moneySaved}`,
      icon: 'IndianRupee',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Avg Rating Given',
      value: stats?.avgRating,
      icon: 'Star',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statItems?.map((item, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-4 trust-shadow">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item?.bgColor}`}>
              <Icon name={item?.icon} size={20} className={item?.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{item?.value}</p>
              <p className="text-sm text-muted-foreground">{item?.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;