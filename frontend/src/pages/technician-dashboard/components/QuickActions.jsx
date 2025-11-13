import React, { useMemo } from 'react';
import Icon from '../../../components/AppIcon';


const QuickActions = ({ 
  onEditProfile, 
  onUploadDocuments, 
  onManageServices, 
  onViewAnalytics,
  kycInfo,
  earningsData,
  completedJobs,
  userProfile,
  technicianProfile
}) => {
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

  // Calculate profile completion percentage
  const profileCompletion = useMemo(() => {
    if (!userProfile && !technicianProfile) return 0;
    
    const fields = [
      userProfile?.full_name || userProfile?.fullName,
      userProfile?.phone,
      userProfile?.avatar_url || userProfile?.avatarUrl,
      technicianProfile?.bio,
      technicianProfile?.specialties?.length > 0,
      technicianProfile?.hourlyRate > 0,
      technicianProfile?.yearsOfExperience > 0,
      technicianProfile?.serviceRadius > 0,
    ];
    
    const filledFields = fields.filter(Boolean).length;
    const totalFields = fields.length;
    return Math.round((filledFields / totalFields) * 100);
  }, [userProfile, technicianProfile]);

  // Get verification status
  const verificationStatus = useMemo(() => {
    if (!kycInfo) return 'Not Verified';
    const status = kycInfo?.status || 'not_submitted';
    switch (status) {
      case 'approved':
        return 'Verified';
      case 'under_review':
        return 'Under Review';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Not Verified';
    }
  }, [kycInfo]);

  const isVerified = verificationStatus === 'Verified';

  // Get average rating
  const averageRating = useMemo(() => {
    if (earningsData?.rating && earningsData.rating !== '—') {
      return earningsData.rating;
    }
    if (technicianProfile?.averageRating) {
      return technicianProfile.averageRating.toFixed(1);
    }
    // Calculate from completed jobs if available
    if (completedJobs && completedJobs.length > 0) {
      const ratings = completedJobs
        .map(job => job.reviewRating)
        .filter(rating => rating && typeof rating === 'number');
      if (ratings.length > 0) {
        const sum = ratings.reduce((acc, rating) => acc + rating, 0);
        return (sum / ratings.length).toFixed(1);
      }
    }
    return '0.0';
  }, [earningsData, technicianProfile, completedJobs]);

  // Calculate jobs this month
  const jobsThisMonth = useMemo(() => {
    if (!completedJobs || completedJobs.length === 0) return 0;
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return completedJobs.filter(job => {
      const completionDate = job.completionDate 
        ? new Date(job.completionDate)
        : (job.updatedAt ? new Date(job.updatedAt) : null);
      
      if (!completionDate) return false;
      return completionDate >= startOfMonth && job.status === 'completed';
    }).length;
  }, [completedJobs]);

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
            <p className="font-semibold text-primary">{profileCompletion}% Complete</p>
          </div>
          
          <div className="text-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2 ${
              isVerified ? 'bg-success/10' : 'bg-muted'
            }`}>
              <Icon 
                name="Shield" 
                size={20} 
                color={isVerified ? "var(--color-success)" : "var(--color-text-secondary)"} 
              />
            </div>
            <p className="text-sm text-text-secondary">Verification</p>
            <p className={`font-semibold ${
              isVerified ? 'text-success' : 
              verificationStatus === 'Under Review' ? 'text-warning' :
              verificationStatus === 'Rejected' ? 'text-error' :
              'text-text-secondary'
            }`}>
              {verificationStatus}
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Icon name="Star" size={20} color="var(--color-accent)" />
            </div>
            <p className="text-sm text-text-secondary">Rating</p>
            <p className="font-semibold text-accent">{averageRating}/5</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Icon name="TrendingUp" size={20} color="var(--color-warning)" />
            </div>
            <p className="text-sm text-text-secondary">This Month</p>
            <p className="font-semibold text-warning">{jobsThisMonth} {jobsThisMonth === 1 ? 'Job' : 'Jobs'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;