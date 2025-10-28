import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const SchedulingOptions = ({ schedule, onScheduleChange }) => {
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');

  const quickOptions = [
    {
      id: 'now',
      label: 'Right Now',
      description: 'Get help immediately',
      icon: 'Clock',
      availability: 'High'
    },
    {
      id: 'within-2h',
      label: 'Within 2 Hours',
      description: 'Flexible timing',
      icon: 'Timer',
      availability: 'High'
    },
    {
      id: 'today',
      label: 'Later Today',
      description: 'Schedule for today',
      icon: 'Calendar',
      availability: 'Medium'
    },
    {
      id: 'custom',
      label: 'Custom Time',
      description: 'Pick specific date & time',
      icon: 'CalendarDays',
      availability: 'Varies'
    }
  ];

  const handleQuickOptionSelect = (option) => {
    if (option?.id === 'custom') {
      onScheduleChange({ ...option, customDate, customTime });
    } else {
      onScheduleChange(option);
    }
  };

  const handleCustomDateTimeChange = () => {
    if (customDate && customTime) {
      onScheduleChange({
        id: 'custom',
        label: 'Custom Time',
        description: `${customDate} at ${customTime}`,
        icon: 'CalendarDays',
        customDate,
        customTime
      });
    }
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'High': return 'text-success';
      case 'Medium': return 'text-warning';
      case 'Low': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today?.toISOString()?.split('T')?.[0];
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now?.getHours()?.toString()?.padStart(2, '0');
    const minutes = now?.getMinutes()?.toString()?.padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">When do you need service?</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickOptions?.map((option) => (
          <button
            key={option?.id}
            onClick={() => handleQuickOptionSelect(option)}
            className={`p-4 rounded-lg border-2 text-left trust-transition ${
              schedule?.id === option?.id
                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  schedule?.id === option?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <Icon name={option?.icon} size={20} />
                </div>
                <div>
                  <p className="font-medium text-foreground">{option?.label}</p>
                  <p className="text-sm text-muted-foreground">{option?.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Availability</p>
                <p className={`text-xs font-medium ${getAvailabilityColor(option?.availability)}`}>
                  {option?.availability}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
      {schedule?.id === 'custom' && (
        <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-foreground">Select Date & Time</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Date</label>
              <input
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e?.target?.value);
                  setTimeout(handleCustomDateTimeChange, 100);
                }}
                min={getTodayDate()}
                className="w-full p-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Time</label>
              <input
                type="time"
                value={customTime}
                onChange={(e) => {
                  setCustomTime(e?.target?.value);
                  setTimeout(handleCustomDateTimeChange, 100);
                }}
                min={customDate === getTodayDate() ? getCurrentTime() : undefined}
                className="w-full p-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          {customDate && customTime && (
            <div className="flex items-center space-x-2 text-sm text-success">
              <Icon name="CheckCircle" size={16} />
              <span>Scheduled for {new Date(customDate)?.toLocaleDateString('en-IN')} at {customTime}</span>
            </div>
          )}
        </div>
      )}
      {schedule && schedule?.id !== 'custom' && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={16} className="text-primary" />
            <span className="text-sm font-medium text-primary">
              Service scheduled: {schedule?.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {schedule?.id === 'now' && 'Technicians will be notified immediately'}
            {schedule?.id === 'within-2h' && 'You\'ll get responses within the next 2 hours'}
            {schedule?.id === 'today' && 'Available technicians for today will respond'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SchedulingOptions;