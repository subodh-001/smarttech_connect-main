import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const WalletSidebar = ({ walletData }) => {
  const navigate = useNavigate();

  const handleWriteReviews = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    
    // Navigate to booking management page with completed tab active
    // This will show all completed services that need reviews
    navigate('/booking-management', {
      state: { 
        activeTab: 'completed',
        showPendingReviews: true 
      }
    });
  };

  const handleFeedback = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    
    // Navigate to booking management page with completed tab active for feedback
    navigate('/booking-management', {
      state: { 
        activeTab: 'completed',
        showPendingReviews: true 
      }
    });
  };

  const pendingReviewsCount = walletData?.pendingReviews ?? 0;

  return (
    <div className="space-y-6">
      {/* Pending Reviews */}
      <div className="bg-card border border-border rounded-lg p-4 trust-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon name="Star" size={18} className="text-warning" />
            <h4 className="font-semibold text-foreground">Pending Reviews</h4>
          </div>
          {pendingReviewsCount > 0 ? (
            <span className="bg-warning text-warning-foreground text-xs px-2 py-1 rounded-full font-semibold">
              {pendingReviewsCount}
            </span>
          ) : (
            <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full font-semibold">
              0
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Help others by reviewing your recent services
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleFeedback}
            type="button"
            iconName="MessageSquare"
            iconPosition="left"
          >
            Feedback
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            onClick={handleWriteReviews}
            type="button"
            iconName="Star"
            iconPosition="left"
          >
            Write Reviews
          </Button>
        </div>
      </div>
      {/* Service Recommendations */}
      <div className="bg-card border border-border rounded-lg p-4 trust-shadow">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-foreground">Recommended</h4>
          <Icon name="Sparkles" size={20} className="text-primary" />
        </div>
        <div className="space-y-3">
          {walletData?.recommendations?.map((service, index) => (
            <Link 
              key={index} 
              to="/service-request-creation"
              state={{ category: service?.category || service?.name }}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted trust-transition"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${service?.bgColor}`}>
                <Icon name={service?.icon} size={16} className={service?.iconColor} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{service?.name}</p>
                <p className="text-xs text-muted-foreground">Starting ₹{service?.price}</p>
              </div>
            </Link>
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
          <Button 
            variant="ghost" 
            size="sm" 
            iconName="History" 
            iconPosition="left" 
            fullWidth
            onClick={() => navigate('/booking-management')}
            type="button"
          >
            View All History
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            iconName="Settings" 
            iconPosition="left" 
            fullWidth
            onClick={() => navigate('/account')}
            type="button"
          >
            Manage Profile
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            iconName="HelpCircle" 
            iconPosition="left" 
            fullWidth
            onClick={() => navigate('/help-center')}
            type="button"
          >
            Help & Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WalletSidebar;