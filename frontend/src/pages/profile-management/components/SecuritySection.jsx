import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/NewAuthContext';

const SecuritySection = ({ securitySettings, onUpdateSecurity }) => {
  const { userProfile, fetchUserProfile } = useAuth();
  const [passwordChangedDate, setPasswordChangedDate] = useState(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(securitySettings?.twoFactorEnabled);
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  // Update password changed date from userProfile
  useEffect(() => {
    if (userProfile?.password_changed_at) {
      setPasswordChangedDate(userProfile.password_changed_at);
    } else {
      // Fallback: fetch from API if not in userProfile
      const fetchPasswordDate = async () => {
        try {
          const { data } = await axios.get('/api/users/me');
          if (data?.passwordChangedAt) {
            setPasswordChangedDate(data.passwordChangedAt);
          }
        } catch (error) {
          console.error('Failed to fetch password date:', error);
        }
      };
      fetchPasswordDate();
    }
  }, [userProfile]);

  // Format password changed date
  const formatPasswordDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffMonths = Math.floor(diffDays / 30);
      const diffYears = Math.floor(diffDays / 365);

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
      return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
    } catch (error) {
      return 'Unknown';
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    if (passwordErrors?.[field]) {
      setPasswordErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordForm?.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordForm?.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm?.newPassword?.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/?.test(passwordForm?.newPassword)) {
      errors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!passwordForm?.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordForm?.newPassword !== passwordForm?.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors)?.length === 0;
  };

  const handlePasswordSubmit = async () => {
    if (!validatePasswordForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.put('/api/users/me/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (response.data?.message) {
        // Update password changed date
        if (response.data?.passwordChangedAt) {
          setPasswordChangedDate(response.data.passwordChangedAt);
        }
        
        // Refresh user profile to get updated passwordChangedAt
        if (fetchUserProfile) {
          await fetchUserProfile();
        }
        
        // Reset form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswords({
          currentPassword: false,
          newPassword: false,
          confirmPassword: false
        });
        setIsChangingPassword(false);
        setPasswordErrors({});
        
        // Show success message
        alert('Password updated successfully!');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to change password. Please try again.';
      setPasswordErrors({ submit: errorMessage });
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorToggle = async (enabled) => {
    setIsLoading(true);
    try {
      // TODO: Implement actual 2FA API endpoint when available
      // For now, just update local state
      setTwoFactorEnabled(enabled);
      onUpdateSecurity({ ...securitySettings, twoFactorEnabled: enabled });
    } catch (error) {
      console.error('Failed to toggle 2FA:', error);
      alert('Failed to update two-factor authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const securityItems = [
    {
      icon: 'Shield',
      title: 'Password',
      description: `Last changed ${formatPasswordDate(passwordChangedDate || userProfile?.password_changed_at)}`,
      action: 'Change Password',
      status: 'secure'
    },
    {
      icon: 'Smartphone',
      title: 'Two-Factor Authentication',
      description: twoFactorEnabled ? 'Enabled via SMS' : 'Not enabled',
      status: twoFactorEnabled ? 'secure' : 'warning'
    },
    {
      icon: 'Activity',
      title: 'Login Activity',
      description: 'View your recent login history',
      action: 'View Activity',
      status: 'info'
    },
    {
      icon: 'Key',
      title: 'API Access',
      description: 'No active API keys',
      action: 'Manage Keys',
      status: 'info'
    }
  ];

  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Fetch recent security activity from API
  useEffect(() => {
    const fetchActivity = async () => {
      setLoadingActivity(true);
      try {
        // TODO: Replace with actual API endpoint when available
        // const { data } = await axios.get('/api/users/me/security-activity');
        // setRecentActivity(data || []);
        setRecentActivity([]); // Empty until API is implemented
      } catch (error) {
        console.error('Failed to fetch security activity:', error);
        setRecentActivity([]);
      } finally {
        setLoadingActivity(false);
      }
    };
    fetchActivity();
  }, []);

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Security Settings</h2>
          <p className="text-text-secondary text-sm mt-1">
            Manage your account security and privacy
          </p>
        </div>
      </div>
      <div className="space-y-8">
        {/* Security Overview */}
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4">Security Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {securityItems?.map((item, index) => (
              <div key={index} className="border border-border rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    item?.status === 'secure' ? 'bg-success/10' :
                    item?.status === 'warning' ? 'bg-warning/10' : 'bg-primary/10'
                  }`}>
                    <Icon 
                      name={item?.icon} 
                      size={20} 
                      className={
                        item?.status === 'secure' ? 'text-success' :
                        item?.status === 'warning' ? 'text-warning' : 'text-primary'
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-text-primary">{item?.title}</h4>
                    <p className="text-sm text-text-secondary mt-1">{item?.description}</p>
                    {item?.action && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 p-0 h-auto text-primary hover:text-primary/80"
                        onClick={() => {
                          if (item?.action === 'Change Password') {
                            setIsChangingPassword(true);
                          }
                        }}
                      >
                        {item?.action}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="border-t border-border pt-6">
          <h3 className="text-lg font-medium text-text-primary mb-4">Two-Factor Authentication</h3>
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-text-primary">SMS Authentication</h4>
                <p className="text-sm text-text-secondary mt-1">
                  Receive verification codes via SMS
                </p>
              </div>
              <Checkbox
                checked={twoFactorEnabled}
                onChange={(e) => handleTwoFactorToggle(e?.target?.checked)}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        {isChangingPassword && (
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-medium text-text-primary mb-4">Change Password</h3>
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="space-y-4">
                {/* Current Password with Show/Hide Toggle */}
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none text-foreground">
                    Current Password
                    <span className="text-destructive ml-1">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.currentPassword ? "text" : "password"}
                      value={passwordForm?.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e?.target?.value)}
                      error={passwordErrors?.currentPassword}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, currentPassword: !prev.currentPassword }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      <Icon 
                        name={showPasswords.currentPassword ? "EyeOff" : "Eye"} 
                        size={18} 
                      />
                    </button>
                  </div>
                  {passwordErrors?.currentPassword && (
                    <p className="text-sm text-destructive">{passwordErrors.currentPassword}</p>
                  )}
                </div>
                
                {/* New Password with Show/Hide Toggle */}
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none text-foreground">
                    New Password
                    <span className="text-destructive ml-1">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.newPassword ? "text" : "password"}
                      value={passwordForm?.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e?.target?.value)}
                      error={passwordErrors?.newPassword}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, newPassword: !prev.newPassword }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      <Icon 
                        name={showPasswords.newPassword ? "EyeOff" : "Eye"} 
                        size={18} 
                      />
                    </button>
                  </div>
                  {!passwordErrors?.newPassword && (
                    <p className="text-sm text-muted-foreground">
                      Must be at least 8 characters with uppercase, lowercase, and number
                    </p>
                  )}
                  {passwordErrors?.newPassword && (
                    <p className="text-sm text-destructive">{passwordErrors.newPassword}</p>
                  )}
                </div>
                
                {/* Confirm New Password with Show/Hide Toggle */}
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none text-foreground">
                    Confirm New Password
                    <span className="text-destructive ml-1">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.confirmPassword ? "text" : "password"}
                      value={passwordForm?.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e?.target?.value)}
                      error={passwordErrors?.confirmPassword}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      <Icon 
                        name={showPasswords.confirmPassword ? "EyeOff" : "Eye"} 
                        size={18} 
                      />
                    </button>
                  </div>
                  {passwordErrors?.confirmPassword && (
                    <p className="text-sm text-destructive">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    variant="default"
                    onClick={handlePasswordSubmit}
                    loading={isLoading}
                    iconName="Save"
                    iconPosition="left"
                  >
                    Update Password
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordForm({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                      setPasswordErrors({});
                      setShowPasswords({
                        currentPassword: false,
                        newPassword: false,
                        confirmPassword: false
                      });
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="border-t border-border pt-6">
          <h3 className="text-lg font-medium text-text-primary mb-4">Recent Security Activity</h3>
          {loadingActivity ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
            </div>
          ) : recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity?.id || activity?._id} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="Activity" size={16} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">{activity?.action || activity?.type}</p>
                    <p className="text-xs text-text-secondary">
                      {activity?.timestamp ? new Date(activity.timestamp).toLocaleString() : ''}
                      {activity?.location && ` • ${activity.location}`}
                      {activity?.device && ` • ${activity.device}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-text-secondary">
              <Icon name="Activity" size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
              <p className="text-xs mt-1">Security activity will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;