import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const WalletSidebar = ({ walletData }) => {
  return (
    <div className="space-y-6">
      {/* Wallet Balance */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Wallet Balance</h3>
          <Icon name="Wallet" size={24} />
        </div>
        <div className="text-3xl font-bold mb-2">₹{walletData?.balance}</div>
        <div className="flex items-center space-x-2 text-sm opacity-90">
          <Icon name="TrendingUp" size={16} />
          <span>+₹{walletData?.earned} earned this month</span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          iconName="Plus"
          iconPosition="left"
          className="mt-3"
          fullWidth
        >
          Add Money
        </Button>
      </div>
      {/* Points & Rewards */}
      <div className="bg-card border border-border rounded-lg p-4 trust-shadow">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-foreground">Reward Points</h4>
          <Icon name="Gift" size={20} className="text-accent" />
        </div>
        <div className="text-2xl font-bold text-accent mb-2">{walletData?.points}</div>
        <p className="text-sm text-muted-foreground mb-3">
          Earn points on every booking and redeem for discounts
        </p>
        <Button variant="outline" size="sm" fullWidth>
          Redeem Points
        </Button>
      </div>
      {/* Pending Reviews */}
      <div className="bg-card border border-border rounded-lg p-4 trust-shadow">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-foreground">Pending Reviews</h4>
          <span className="bg-warning text-warning-foreground text-xs px-2 py-1 rounded-full">
            {walletData?.pendingReviews}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Help others by reviewing your recent services
        </p>
        <Button variant="outline" size="sm" fullWidth>
          Write Reviews
        </Button>
      </div>
      {/* Service Recommendations */}
      <div className="bg-card border border-border rounded-lg p-4 trust-shadow">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-foreground">Recommended</h4>
          <Icon name="Sparkles" size={20} className="text-primary" />
        </div>
        <div className="space-y-3">
          {walletData?.recommendations?.map((service, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted trust-transition">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${service?.bgColor}`}>
                <Icon name={service?.icon} size={16} className={service?.iconColor} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{service?.name}</p>
                <p className="text-xs text-muted-foreground">Starting ₹{service?.price}</p>
              </div>
            </div>
          ))}
        </div>
        <Link to="/technician-selection">
          <Button variant="ghost" size="sm" fullWidth className="mt-3">
            View All Services
          </Button>
        </Link>
      </div>
      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-4 trust-shadow">
        <h4 className="font-semibold text-foreground mb-3">Quick Actions</h4>
        <div className="space-y-2">
          <Link to="/service-request-creation">
            <Button variant="ghost" size="sm" iconName="Plus" iconPosition="left" fullWidth>
              New Service Request
            </Button>
          </Link>
          <Button variant="ghost" size="sm" iconName="History" iconPosition="left" fullWidth>
            View All History
          </Button>
          <Button variant="ghost" size="sm" iconName="Settings" iconPosition="left" fullWidth>
            Manage Profile
          </Button>
          <Button variant="ghost" size="sm" iconName="HelpCircle" iconPosition="left" fullWidth>
            Help & Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WalletSidebar;