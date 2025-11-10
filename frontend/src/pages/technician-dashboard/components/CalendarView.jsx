import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CalendarView = ({ appointments, onBlockTime, onManageAppointment }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date?.getFullYear();
    const month = date?.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay?.getDate();
    const startingDayOfWeek = firstDay?.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days?.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days?.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getAppointmentsForDate = (date) => {
    if (!date) return [];
    const dateStr = date?.toDateString();
    return appointments?.filter(apt => new Date(apt.date)?.toDateString() === dateStr);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate?.setMonth(currentDate?.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const isToday = (date) => {
    if (!date) return false;
    return date?.toDateString() === new Date()?.toDateString();
  };

  const isSelected = (date) => {
    if (!date) return false;
    return date?.toDateString() === selectedDate?.toDateString();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const selectedDateAppointments = getAppointmentsForDate(selectedDate);

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-subtle">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Schedule</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onBlockTime(selectedDate)}
          iconName="Plus"
          iconPosition="left"
        >
          Block Time
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <div>
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth(-1)}
            >
              <Icon name="ChevronLeft" size={20} />
            </Button>
            <h3 className="text-lg font-semibold text-text-primary">
              {monthNames?.[currentDate?.getMonth()]} {currentDate?.getFullYear()}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth(1)}
            >
              <Icon name="ChevronRight" size={20} />
            </Button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames?.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-text-secondary">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentDate)?.map((date, index) => {
              const dayAppointments = getAppointmentsForDate(date);
              const hasAppointments = dayAppointments?.length > 0;
              
              return (
                <button
                  key={index}
                  onClick={() => date && setSelectedDate(date)}
                  disabled={!date}
                  className={`
                    p-2 h-10 text-sm rounded-md transition-smooth relative
                    ${!date ? 'invisible' : ''}
                    ${isToday(date) ? 'bg-primary text-primary-foreground font-semibold' : ''}
                    ${isSelected(date) && !isToday(date) ? 'bg-primary/10 text-primary border border-primary/20' : ''}
                    ${!isToday(date) && !isSelected(date) ? 'hover:bg-muted text-text-primary' : ''}
                    ${hasAppointments && !isToday(date) && !isSelected(date) ? 'bg-accent/10 text-accent' : ''}
                  `}
                >
                  {date?.getDate()}
                  {hasAppointments && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Appointments */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            {selectedDate?.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>

          {selectedDateAppointments?.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="Calendar" size={48} color="var(--color-text-secondary)" className="mx-auto mb-4" />
              <p className="text-text-secondary">No appointments scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateAppointments?.map((appointment) => (
                <div
                  key={appointment?.id}
                  className="p-4 bg-muted rounded-lg border border-border hover:shadow-subtle transition-smooth"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-text-primary">{appointment?.title}</h4>
                      <p className="text-sm text-text-secondary">{appointment?.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-text-primary">{appointment?.time}</p>
                      <p className="text-xs text-text-secondary">{appointment?.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-text-secondary mb-3">
                    <div className="flex items-center space-x-1">
                      <Icon name="MapPin" size={14} />
                      <span>{appointment?.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="DollarSign" size={14} />
              <span>
                ₹
                {Number.isFinite(appointment?.amount)
                  ? appointment.amount.toLocaleString('en-IN')
                  : appointment?.amount}
              </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onManageAppointment(appointment?.id, 'reschedule')}
                      className="flex-1"
                    >
                      Reschedule
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onManageAppointment(appointment?.id, 'cancel')}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;