import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ActiveJobsSection = ({ activeJobs, onNavigate, onContactCustomer, onUpdateStatus }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'in-progress': return 'text-primary bg-primary/10 border-primary/20';
      case 'on-way': return 'text-accent bg-accent/10 border-accent/20';
      case 'completed': return 'text-success bg-success/10 border-success/20';
      default: return 'text-text-secondary bg-muted border-border';
    }
  };

  if (activeJobs?.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <Icon name="Calendar" size={48} color="var(--color-text-secondary)" className="mx-auto mb-4" />
        <h3 className="text-lg font-medium text-text-primary mb-2">No Active Jobs</h3>
        <p className="text-text-secondary">You don't have any active jobs at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeJobs?.map((job) => (
        <div key={job?.id} className="bg-card rounded-lg border border-border p-6 shadow-subtle">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-text-primary mb-1">{job?.title}</h3>
              <p className="text-sm text-text-secondary">{job?.customerName}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(job?.status)}`}>
              {job?.status?.replace('-', ' ')?.toUpperCase()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Icon name="MapPin" size={16} color="var(--color-text-secondary)" />
                <span className="text-sm text-text-secondary">{job?.address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Clock" size={16} color="var(--color-text-secondary)" />
                <span className="text-sm text-text-secondary">Started: {job?.startTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="DollarSign" size={16} color="var(--color-success)" />
                <span className="text-sm font-medium text-success">${job?.amount}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Icon name="Phone" size={16} color="var(--color-text-secondary)" />
                <span className="text-sm text-text-secondary">{job?.customerPhone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Navigation" size={16} color="var(--color-primary)" />
                <span className="text-sm text-primary">ETA: {job?.eta}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Star" size={16} color="var(--color-accent)" />
                <span className="text-sm text-text-secondary">Customer: {job?.customerRating}/5</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate(job?.id)}
              iconName="Navigation"
              iconPosition="left"
            >
              Navigate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onContactCustomer(job?.id)}
              iconName="Phone"
              iconPosition="left"
            >
              Call Customer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onContactCustomer(job?.id, 'message')}
              iconName="MessageCircle"
              iconPosition="left"
            >
              Message
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onUpdateStatus(job?.id)}
              iconName="RefreshCw"
              iconPosition="left"
            >
              Update Status
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActiveJobsSection;