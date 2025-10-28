import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const JobRequestCard = ({ job, onAccept, onDecline }) => {
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return 'text-error bg-error/10 border-error/20';
      case 'high': return 'text-warning bg-warning/10 border-warning/20';
      case 'medium': return 'text-accent bg-accent/10 border-accent/20';
      default: return 'text-success bg-success/10 border-success/20';
    }
  };

  const getServiceIcon = (category) => {
    const icons = {
      'plumbing': 'Wrench',
      'electrical': 'Zap',
      'ac-repair': 'Wind',
      'computer': 'Monitor',
      'mobile': 'Smartphone',
      'appliance': 'Home',
      'carpentry': 'Hammer'
    };
    return icons?.[category] || 'Tool';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-subtle hover:shadow-elevated transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name={getServiceIcon(job?.category)} size={24} color="var(--color-primary)" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">{job?.title}</h3>
            <p className="text-sm text-text-secondary">{job?.category}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(job?.urgency)}`}>
          {job?.urgency?.toUpperCase()}
        </div>
      </div>
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="MapPin" size={16} color="var(--color-text-secondary)" />
          <span className="text-sm text-text-secondary">{job?.location}</span>
          <span className="text-xs text-text-secondary">• {job?.distance}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Icon name="DollarSign" size={16} color="var(--color-success)" />
          <span className="text-sm font-medium text-success">${job?.budget}</span>
          <span className="text-xs text-text-secondary">Budget</span>
        </div>

        <div className="flex items-center space-x-2">
          <Icon name="Star" size={16} color="var(--color-accent)" />
          <span className="text-sm text-text-secondary">Customer Rating: {job?.customerRating}/5</span>
        </div>

        <div className="flex items-center space-x-2">
          <Icon name="Clock" size={16} color="var(--color-text-secondary)" />
          <span className="text-sm text-text-secondary">Preferred: {job?.preferredTime}</span>
        </div>
      </div>
      <div className="bg-muted p-3 rounded-lg mb-4">
        <p className="text-sm text-text-primary">{job?.description}</p>
      </div>
      <div className="flex items-center space-x-3">
        <Button
          variant="success"
          onClick={() => onAccept(job?.id)}
          className="flex-1"
          iconName="Check"
          iconPosition="left"
        >
          Accept Job
        </Button>
        <Button
          variant="outline"
          onClick={() => onDecline(job?.id)}
          className="flex-1"
          iconName="X"
          iconPosition="left"
        >
          Decline
        </Button>
      </div>
      <div className="mt-3 text-xs text-text-secondary text-center">
        Posted {job?.timeAgo} • {job?.applicants} technicians interested
      </div>
    </div>
  );
};

export default JobRequestCard;