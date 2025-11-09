import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const SecuritySection = ({ securitySettings, onUpdateSecurity }) => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(securitySettings?.twoFactorEnabled);

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
    // Mock API call
    setTimeout(() => {
      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
      setIsLoading(false);
      // Show success message (in real app)
    }, 2000);
  };

  const handleTwoFactorToggle = async (enabled) => {
    setIsLoading(true);
    // Mock API call
    setTimeout(() => {
      setTwoFactorEnabled(enabled);
      onUpdateSecurity({ ...securitySettings, twoFactorEnabled: enabled });
      setIsLoading(false);
    }, 1500);
  };

  const securityItems = [
    {
      icon: 'Shield',
      title: 'Password',
      description: 'Last changed 3 months ago',
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
      description: 'Last login: Today at 2:30 PM',
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

  const recentActivity = [
    {
      id: 1,
      action: 'Password changed',
      timestamp: '2024-06-15 14:30:00',
      location: 'New York, NY',
      device: 'Chrome on Windows'
    },
    {
      id: 2,
      action: 'Login successful',
      timestamp: '2024-09-07 14:30:00',
      location: 'New York, NY',
      device: 'Chrome on Windows'
    },
    {
      id: 3,
      action: 'Profile updated',
      timestamp: '2024-09-05 10:15:00',
      location: 'New York, NY',
      device: 'Safari on iPhone'
    }
  ];

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
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordForm?.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e?.target?.value)}
                  error={passwordErrors?.currentPassword}
                  required
                />
                
                <Input
                  label="New Password"
                  type="password"
                  value={passwordForm?.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e?.target?.value)}
                  error={passwordErrors?.newPassword}
                  description="Must be at least 8 characters with uppercase, lowercase, and number"
                  required
                />
                
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordForm?.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e?.target?.value)}
                  error={passwordErrors?.confirmPassword}
                  required
                />

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
          <div className="space-y-3">
            {recentActivity?.map((activity) => (
              <div key={activity?.id} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name="Activity" size={16} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{activity?.action}</p>
                  <p className="text-xs text-text-secondary">
                    {new Date(activity.timestamp)?.toLocaleString()} • {activity?.location} • {activity?.device}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;