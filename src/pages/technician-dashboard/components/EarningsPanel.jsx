import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EarningsPanel = ({ earningsData, onWithdraw }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('daily');

  const periods = [
    { key: 'daily', label: 'Today', icon: 'Calendar' },
    { key: 'weekly', label: 'This Week', icon: 'CalendarDays' },
    { key: 'monthly', label: 'This Month', icon: 'CalendarRange' }
  ];

  const currentEarnings = earningsData?.[selectedPeriod];

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-subtle">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Earnings</h2>
        <Button
          variant="success"
          size="sm"
          onClick={onWithdraw}
          iconName="Download"
          iconPosition="left"
        >
          Withdraw
        </Button>
      </div>
      {/* Period Selector */}
      <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
        {periods?.map((period) => (
          <button
            key={period?.key}
            onClick={() => setSelectedPeriod(period?.key)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-smooth ${
              selectedPeriod === period?.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon name={period?.icon} size={16} />
            <span>{period?.label}</span>
          </button>
        ))}
      </div>
      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-success/10 p-4 rounded-lg border border-success/20">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="DollarSign" size={20} color="var(--color-success)" />
            <span className="text-sm font-medium text-success">Total Earned</span>
          </div>
          <p className="text-2xl font-bold text-success">${currentEarnings?.total}</p>
        </div>

        <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Briefcase" size={20} color="var(--color-primary)" />
            <span className="text-sm font-medium text-primary">Jobs Completed</span>
          </div>
          <p className="text-2xl font-bold text-primary">{currentEarnings?.jobsCompleted}</p>
        </div>

        <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="TrendingUp" size={20} color="var(--color-accent)" />
            <span className="text-sm font-medium text-accent">Avg per Job</span>
          </div>
          <p className="text-2xl font-bold text-accent">${currentEarnings?.avgPerJob}</p>
        </div>
      </div>
      {/* Performance Metrics */}
      <div className="space-y-4">
        <h3 className="font-medium text-text-primary">Performance Metrics</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={16} color="var(--color-success)" />
              <span className="text-sm text-text-secondary">Completion Rate</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-24 bg-muted rounded-full h-2">
                <div 
                  className="bg-success h-2 rounded-full" 
                  style={{ width: `${currentEarnings?.completionRate}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-text-primary">{currentEarnings?.completionRate}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="Star" size={16} color="var(--color-accent)" />
              <span className="text-sm text-text-secondary">Customer Satisfaction</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[1, 2, 3, 4, 5]?.map((star) => (
                  <Icon
                    key={star}
                    name="Star"
                    size={14}
                    color={star <= currentEarnings?.rating ? 'var(--color-accent)' : 'var(--color-border)'}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-text-primary">{currentEarnings?.rating}/5</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={16} color="var(--color-primary)" />
              <span className="text-sm text-text-secondary">Response Time</span>
            </div>
            <span className="text-sm font-medium text-text-primary">{currentEarnings?.responseTime}</span>
          </div>
        </div>
      </div>
      {/* Available Balance */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">Available Balance</p>
            <p className="text-lg font-semibold text-text-primary">${earningsData?.availableBalance}</p>
          </div>
          <Icon name="Wallet" size={24} color="var(--color-primary)" />
        </div>
      </div>
    </div>
  );
};

export default EarningsPanel;