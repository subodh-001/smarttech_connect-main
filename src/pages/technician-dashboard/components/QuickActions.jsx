import React from 'react';
import Icon from '../../../components/AppIcon';


const QuickActions = ({ onEditProfile, onUploadDocuments, onManageServices, onViewAnalytics }) => {
  const actions = [
    {
      id: 'profile',
      title: 'Edit Profile',
      description: 'Update your personal information and contact details',
      icon: 'User',
      color: 'primary',
      onClick: onEditProfile
    },
    {
      id: 'documents',
      title: 'Upload Documents',
      description: 'Add or update your verification documents',
      icon: 'FileText',
      color: 'accent',
      onClick: onUploadDocuments
    },
    {
      id: 'services',
      title: 'Manage Services',
      description: 'Update your service categories and pricing',
      icon: 'Settings',
      color: 'secondary',
      onClick: onManageServices
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      description: 'Check your performance metrics and insights',
      icon: 'BarChart3',
      color: 'success',
      onClick: onViewAnalytics
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      primary: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20',
      accent: 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/20',
      secondary: 'bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20',
      success: 'bg-success/10 text-success border-success/20 hover:bg-success/20'
    };
    return colors?.[color] || colors?.primary;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-subtle">
      <h2 className="text-xl font-semibold text-text-primary mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions?.map((action) => (
          <button
            key={action?.id}
            onClick={action?.onClick}
            className={`p-4 rounded-lg border transition-smooth text-left ${getColorClasses(action?.color)}`}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                action?.color === 'primary' ? 'bg-primary/20' :
                action?.color === 'accent' ? 'bg-accent/20' :
                action?.color === 'secondary'? 'bg-secondary/20' : 'bg-success/20'
              }`}>
                <Icon 
                  name={action?.icon} 
                  size={24} 
                  color={`var(--color-${action?.color})`}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{action?.title}</h3>
                <p className="text-sm opacity-80">{action?.description}</p>
              </div>
              <Icon 
                name="ChevronRight" 
                size={20} 
                className="opacity-60"
              />
            </div>
          </button>
        ))}
      </div>
      {/* Additional Quick Stats */}
      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="font-medium text-text-primary mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Icon name="CheckCircle" size={20} color="var(--color-primary)" />
            </div>
            <p className="text-sm text-text-secondary">Profile</p>
            <p className="font-semibold text-primary">95% Complete</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Icon name="Shield" size={20} color="var(--color-success)" />
            </div>
            <p className="text-sm text-text-secondary">Verification</p>
            <p className="font-semibold text-success">Verified</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Icon name="Star" size={20} color="var(--color-accent)" />
            </div>
            <p className="text-sm text-text-secondary">Rating</p>
            <p className="font-semibold text-accent">4.8/5</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Icon name="TrendingUp" size={20} color="var(--color-warning)" />
            </div>
            <p className="text-sm text-text-secondary">This Month</p>
            <p className="font-semibold text-warning">47 Jobs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;