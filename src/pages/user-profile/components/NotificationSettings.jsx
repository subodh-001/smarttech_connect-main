import React from 'react';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const NotificationSettings = ({ settings, onSettingsChange, onSave, isSaving }) => {
  const notificationOptions = [
    {
      id: 'notifications_enabled',
      label: 'Enable All Notifications',
      description: 'Receive all types of notifications',
      icon: Bell
    },
    {
      id: 'email_notifications',
      label: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: Mail
    },
    {
      id: 'sms_notifications',
      label: 'SMS Notifications',
      description: 'Receive important updates via SMS',
      icon: MessageSquare
    },
    {
      id: 'push_notifications',
      label: 'Push Notifications',
      description: 'Receive real-time push notifications',
      icon: Smartphone
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2>
      </div>
      <div className="space-y-6">
        {notificationOptions?.map((option) => {
          const IconComponent = option?.icon;
          return (
            <div key={option?.id} className="flex items-start space-x-4 p-4 border rounded-lg">
              <div className="flex-shrink-0 mt-1">
                <IconComponent className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {option?.label}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {option?.description}
                    </p>
                  </div>
                  <Checkbox
                    checked={settings?.[option?.id] ?? false}
                    onChange={(checked) => onSettingsChange?.(option?.id, checked)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          Notification Types You'll Receive:
        </h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Service request updates and status changes</li>
          <li>• New messages from technicians/customers</li>
          <li>• Payment confirmations and receipts</li>
          <li>• Appointment reminders and scheduling updates</li>
          <li>• Platform updates and maintenance notifications</li>
        </ul>
      </div>
      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Notification Settings'}
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettings;