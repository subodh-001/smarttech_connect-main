import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const NotificationSettings = ({ settings, onUpdateSettings }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
    setHasChanges(false);
  }, [settings]);

  const handleSettingChange = (category, setting, value) => {
    const updatedSettings = {
      ...localSettings,
      [category]: {
        ...localSettings?.[category],
        [setting]: value
      }
    };
    setLocalSettings(updatedSettings);
    setHasChanges(true);
    setError(null);
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Prepare data for backend
      const delivery = localSettings?.deliveryMethods || {};
      const payload = {
        notificationsEnabled: Boolean(delivery.push || delivery.email || delivery.sms),
        emailNotifications: delivery.email ?? true,
        smsNotifications: delivery.sms ?? false,
        pushNotifications: delivery.push ?? true,
        deliveryMethods: localSettings?.deliveryMethods || {},
        bookings: localSettings?.bookings || {},
        technician: localSettings?.technician || {},
        payments: localSettings?.payments || {},
        marketing: localSettings?.marketing || {}
      };

      // Call backend API
      const { data } = await axios.put('/api/users/me/settings', payload);
      
      // Update parent component
      if (onUpdateSettings) {
        onUpdateSettings(localSettings);
      }
      
      setHasChanges(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save notification settings:', err);
      setError(err.response?.data?.error || 'Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  const notificationCategories = [
    {
      id: 'bookings',
      title: 'Booking Notifications',
      description: 'Notifications about your service bookings',
      icon: 'Calendar',
      settings: [
        { key: 'newBooking', label: 'New booking confirmations' },
        { key: 'statusUpdates', label: 'Booking status updates' },
        { key: 'reminders', label: 'Upcoming service reminders' },
        { key: 'cancellations', label: 'Booking cancellations' }
      ]
    },
    {
      id: 'technician',
      title: 'Technician Updates',
      description: 'Updates about assigned technicians',
      icon: 'User',
      settings: [
        { key: 'assignment', label: 'Technician assignment' },
        { key: 'location', label: 'Technician location updates' },
        { key: 'arrival', label: 'Technician arrival notifications' },
        { key: 'completion', label: 'Service completion updates' }
      ]
    },
    {
      id: 'payments',
      title: 'Payment Notifications',
      description: 'Payment and billing related notifications',
      icon: 'CreditCard',
      settings: [
        { key: 'invoices', label: 'New invoices' },
        { key: 'payments', label: 'Payment confirmations' },
        { key: 'refunds', label: 'Refund notifications' },
        { key: 'failures', label: 'Payment failures' }
      ]
    },
    {
      id: 'marketing',
      title: 'Marketing & Promotions',
      description: 'Promotional offers and updates',
      icon: 'Megaphone',
      settings: [
        { key: 'offers', label: 'Special offers and discounts' },
        { key: 'newsletter', label: 'Weekly newsletter' },
        { key: 'tips', label: 'Service tips and advice' },
        { key: 'surveys', label: 'Feedback surveys' }
      ]
    }
  ];

  const deliveryMethods = [
    { key: 'push', label: 'Push Notifications', icon: 'Smartphone' },
    { key: 'email', label: 'Email Notifications', icon: 'Mail' },
    { key: 'sms', label: 'SMS Notifications', icon: 'MessageSquare' }
  ];

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Notification Settings</h2>
          <p className="text-text-secondary text-sm mt-1">
            Manage how you receive notifications
          </p>
        </div>
        {hasChanges && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetSettings}
              disabled={isLoading}
            >
              Reset
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveSettings}
              loading={isLoading}
              iconName="Save"
              iconPosition="left"
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center space-x-2">
          <Icon name="CheckCircle" size={16} className="text-emerald-600" />
          <span>Notification settings saved successfully!</span>
        </div>
      )}
      <div className="space-y-8">
        {/* Delivery Methods */}
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4">Delivery Methods</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {deliveryMethods?.map((method) => (
              <div key={method?.key} className="border border-border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Icon name={method?.icon} size={20} className="text-primary" />
                  <div className="flex-1">
                    <Checkbox
                      label={method?.label}
                      checked={localSettings?.deliveryMethods?.[method?.key] || false}
                      onChange={(e) => handleSettingChange('deliveryMethods', method?.key, e?.target?.checked)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Categories */}
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4">Notification Categories</h3>
          <div className="space-y-6">
            {notificationCategories?.map((category) => (
              <div key={category?.id} className="border border-border rounded-lg p-4">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name={category?.icon} size={20} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-text-primary">{category?.title}</h4>
                    <p className="text-sm text-text-secondary mt-1">{category?.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-13">
                  {category?.settings?.map((setting) => (
                    <Checkbox
                      key={setting?.key}
                      label={setting?.label}
                      checked={localSettings?.[category?.id]?.[setting?.key] || false}
                      onChange={(e) => handleSettingChange(category?.id, setting?.key, e?.target?.checked)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-t border-border pt-6">
          <h3 className="text-lg font-medium text-text-primary mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => {
                const allEnabled = {};
                notificationCategories?.forEach(category => {
                  allEnabled[category.id] = {};
                  category?.settings?.forEach(setting => {
                    allEnabled[category.id][setting.key] = true;
                  });
                });
                allEnabled.deliveryMethods = {
                  push: true,
                  email: true,
                  sms: true
                };
                setLocalSettings(allEnabled);
                setHasChanges(true);
              }}
              iconName="Bell"
              iconPosition="left"
            >
              Enable All
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                const allDisabled = {};
                notificationCategories?.forEach(category => {
                  allDisabled[category.id] = {};
                  category?.settings?.forEach(setting => {
                    allDisabled[category.id][setting.key] = false;
                  });
                });
                allDisabled.deliveryMethods = {
                  push: false,
                  email: false,
                  sms: false
                };
                setLocalSettings(allDisabled);
                setHasChanges(true);
              }}
              iconName="BellOff"
              iconPosition="left"
            >
              Disable All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;