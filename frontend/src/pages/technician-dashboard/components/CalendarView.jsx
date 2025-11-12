import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CalendarView = ({ appointments, onBlockTime, onManageAppointment }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewFilter, setViewFilter] = useState('all'); // 'all', 'upcoming', 'completed'

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
    let filtered = appointments?.filter(apt => {
      if (!apt?.date) return false;
      const aptDate = apt.date instanceof Date ? apt.date : new Date(apt.date);
      return aptDate?.toDateString() === dateStr;
    }) || [];
    
    // Apply view filter
    if (viewFilter === 'upcoming') {
      filtered = filtered.filter(apt => 
        apt.status === 'pending' || apt.status === 'confirmed' || 
        apt.status === 'in_progress' || apt.status === 'in-progress'
      );
    } else if (viewFilter === 'completed') {
      filtered = filtered.filter(apt => apt.status === 'completed');
    }
    
    return filtered;
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
  
  // Calculate useful statistics - use actual current date
  const now = new Date();
  const actualToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  actualToday.setHours(0, 0, 0, 0);
  
  // Calculate current week boundaries (Monday to Sunday) for "This Week"
  const todayDayOfWeek = actualToday.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const mondayOffset = todayDayOfWeek === 0 ? -6 : 1 - todayDayOfWeek; // Adjust to get Monday
  const weekStart = new Date(actualToday);
  weekStart.setDate(actualToday.getDate() + mondayOffset);
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  weekEnd.setHours(0, 0, 0, 0);
  
  // Use selected date for month calculations to show relevant stats
  const referenceDate = selectedDate || actualToday;
  const refDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  refDate.setHours(0, 0, 0, 0);
  
  // Month boundaries for selected date (so "This Month" shows month of selected date)
  const monthStart = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
  monthStart.setHours(0, 0, 0, 0);
  const monthEnd = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0);
  monthEnd.setHours(23, 59, 59, 999);
  
  // Helper function to normalize appointment date
  const normalizeAppointmentDate = (apt) => {
    if (!apt?.date) return null;
    try {
      let aptDate;
      if (apt.date instanceof Date) {
        aptDate = new Date(apt.date);
      } else if (typeof apt.date === 'string') {
        aptDate = new Date(apt.date);
      } else {
        aptDate = new Date(apt.date);
      }
      
      if (isNaN(aptDate.getTime())) return null; // Invalid date
      
      // Normalize to local date (remove time component)
      aptDate = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate());
      aptDate.setHours(0, 0, 0, 0);
      return aptDate;
    } catch (e) {
      console.warn('Error normalizing appointment date:', apt, e);
      return null;
    }
  };
  
  // Today's jobs - all jobs for actual today (not selected date)
  const todayAppointments = useMemo(() => {
    return (appointments || []).filter(apt => {
      const aptDate = normalizeAppointmentDate(apt);
      if (!aptDate) return false;
      return aptDate.getTime() === actualToday.getTime();
    });
  }, [appointments, actualToday]);
  
  // This week's jobs - all jobs in the week containing the selected date (Monday to Sunday)
  const weekAppointments = useMemo(() => {
    return (appointments || []).filter(apt => {
      const aptDate = normalizeAppointmentDate(apt);
      if (!aptDate) return false;
      return aptDate >= weekStart && aptDate < weekEnd;
    });
  }, [appointments, weekStart, weekEnd]);
  
  // This month's jobs - all jobs in the month containing the selected date
  const monthAppointments = useMemo(() => {
    return (appointments || []).filter(apt => {
      const aptDate = normalizeAppointmentDate(apt);
      if (!aptDate) return false;
      return aptDate >= monthStart && aptDate <= monthEnd;
    });
  }, [appointments, monthStart, monthEnd]);
  
  // Calculate earnings for selected date
  const selectedDateEarnings = selectedDateAppointments
    .filter(apt => apt.status === 'completed')
    .reduce((sum, apt) => sum + (apt.amount || 0), 0);
  
  // Get upcoming appointments (next 7 days) - only active ones
  const upcomingAppointments = weekAppointments
    .filter(apt => apt.status === 'confirmed' || apt.status === 'pending' || apt.status === 'in_progress' || apt.status === 'in-progress')
    .sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateA - dateB;
    })
    .slice(0, 5) || [];

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-subtle">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Schedule</h2>
          <p className="text-sm text-text-secondary mt-1">
            Plan your work, track jobs, and manage your time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewFilter('all')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                viewFilter === 'all' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setViewFilter('upcoming')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                viewFilter === 'upcoming' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setViewFilter('completed')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                viewFilter === 'completed' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Completed
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedDate(new Date());
              setCurrentDate(new Date());
            }}
            iconName="Calendar"
            iconPosition="left"
          >
            Today
          </Button>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
          <div className="text-xs text-text-secondary mb-1">Today</div>
          <div className="text-lg font-bold text-primary">{todayAppointments.length}</div>
          <div className="text-xs text-text-secondary">jobs</div>
        </div>
        <div className="bg-accent/5 rounded-lg p-3 border border-accent/20">
          <div className="text-xs text-text-secondary mb-1">This Week</div>
          <div className="text-lg font-bold text-accent">{weekAppointments.length}</div>
          <div className="text-xs text-text-secondary">jobs</div>
        </div>
        <div className="bg-success/5 rounded-lg p-3 border border-success/20">
          <div className="text-xs text-text-secondary mb-1">This Month</div>
          <div className="text-lg font-bold text-success">{monthAppointments.length}</div>
          <div className="text-xs text-text-secondary">jobs</div>
        </div>
      </div>

      {/* Upcoming Appointments Summary */}
      {upcomingAppointments.length > 0 && (
        <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
            <Icon name="Clock" size={16} />
            Upcoming This Week ({upcomingAppointments.length})
          </h3>
          <div className="space-y-2">
            {upcomingAppointments.map((apt) => {
              const aptDate = apt.date instanceof Date ? apt.date : new Date(apt.date);
              const isToday = aptDate.toDateString() === today.toDateString();
              return (
                <div 
                  key={apt.id}
                  className="flex items-center justify-between text-sm p-2 rounded hover:bg-primary/10 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedDate(aptDate);
                    setCurrentDate(aptDate);
                  }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      apt.status === 'in_progress' || apt.status === 'in-progress' ? 'bg-accent' :
                      apt.status === 'confirmed' ? 'bg-primary' :
                      'bg-warning'
                    }`}></span>
                    <span className="font-medium text-text-primary truncate">{apt.title}</span>
                  </div>
                  <div className="text-text-secondary text-xs flex-shrink-0 ml-2">
                    {isToday ? 'Today' : aptDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {apt.time && apt.time !== '—' && ` • ${apt.time}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
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
              
              // Determine appointment status for color coding
              const hasInProgress = dayAppointments.some(apt => apt.status === 'in_progress' || apt.status === 'in-progress');
              const hasConfirmed = dayAppointments.some(apt => apt.status === 'confirmed');
              const hasCompleted = dayAppointments.some(apt => apt.status === 'completed');
              
              // Get indicator color based on highest priority status
              const indicatorColor = hasInProgress ? 'bg-accent' : 
                                   hasConfirmed ? 'bg-primary' : 
                                   hasCompleted ? 'bg-success' : 
                                   'bg-warning';
              
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
                    ${hasAppointments && !isToday(date) && !isSelected(date) ? 'bg-accent/5' : ''}
                  `}
                  title={hasAppointments ? `${dayAppointments.length} job${dayAppointments.length > 1 ? 's' : ''} scheduled` : ''}
                >
                  {date?.getDate()}
                  {hasAppointments && (
                    <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 ${indicatorColor} rounded-full`}></div>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-center gap-4 text-xs text-text-secondary">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-accent"></div>
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span>Confirmed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-warning"></div>
                <span>Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Date Appointments */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">
              {selectedDate?.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            {selectedDateAppointments.length > 0 && (
              <div className="text-sm text-text-secondary">
                {selectedDateAppointments.length} job{selectedDateAppointments.length > 1 ? 's' : ''}
                {selectedDateEarnings > 0 && (
                  <span className="ml-2 text-success font-medium">
                    • ₹{selectedDateEarnings.toLocaleString('en-IN')} earned
                  </span>
                )}
              </div>
            )}
          </div>

          {selectedDateAppointments?.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="Calendar" size={48} color="var(--color-text-secondary)" className="mx-auto mb-4" />
              <p className="text-text-secondary">No appointments scheduled</p>
              <p className="text-xs text-text-secondary mt-2">
                {isToday(selectedDate) 
                  ? "You have no jobs scheduled for today" 
                  : "No jobs scheduled for this date"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateAppointments
                .sort((a, b) => {
                  // Sort by time if available, otherwise by status priority
                  if (a.time && b.time && a.time !== '—' && b.time !== '—') {
                    return a.time.localeCompare(b.time);
                  }
                  // Priority: in_progress > confirmed > completed > pending
                  const statusPriority = { 'in_progress': 1, 'confirmed': 2, 'completed': 3, 'pending': 4 };
                  return (statusPriority[a.status] || 5) - (statusPriority[b.status] || 5);
                })
                .map((appointment) => {
                  const getStatusColor = (status) => {
                    switch (status) {
                      case 'in_progress':
                      case 'in-progress':
                        return 'text-accent bg-accent/10 border-accent/20';
                      case 'confirmed':
                        return 'text-primary bg-primary/10 border-primary/20';
                      case 'completed':
                        return 'text-success bg-success/10 border-success/20';
                      case 'pending':
                        return 'text-warning bg-warning/10 border-warning/20';
                      default:
                        return 'text-text-secondary bg-muted border-border';
                    }
                  };

                  const formatStatus = (status) => {
                    if (!status) return 'PENDING';
                    return status.replace(/_/g, ' ').toUpperCase();
                  };

                  return (
                    <div
                      key={appointment?.id}
                      className="p-4 bg-muted rounded-lg border border-border hover:shadow-subtle transition-smooth"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-text-primary">{appointment?.title}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(appointment?.status)}`}>
                              {formatStatus(appointment?.status)}
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary">{appointment?.customerName}</p>
                          {appointment?.category && (
                            <p className="text-xs text-text-secondary mt-1">Category: {appointment.category}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-text-primary">{appointment?.time}</p>
                          {appointment?.duration && appointment.duration !== '—' && (
                            <p className="text-xs text-text-secondary">{appointment?.duration}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-text-secondary mb-3">
                        {appointment?.location && (
                          <div className="flex items-center space-x-1">
                            <Icon name="MapPin" size={14} />
                            <span className="truncate max-w-[200px]">{appointment?.location}</span>
                          </div>
                        )}
                        {appointment?.amount > 0 && (
                          <div className="flex items-center space-x-1">
                            <Icon name="DollarSign" size={14} />
                            <span>
                              ₹
                              {Number.isFinite(appointment?.amount)
                                ? appointment.amount.toLocaleString('en-IN')
                                : appointment?.amount}
                            </span>
                          </div>
                        )}
                      </div>

                      {(appointment?.status === 'confirmed' || appointment?.status === 'pending') && (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onManageAppointment(appointment?.id, 'view')}
                            className="flex-1"
                            iconName="Eye"
                            iconPosition="left"
                          >
                            View Details
                          </Button>
                          {appointment?.status === 'confirmed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onManageAppointment(appointment?.id, 'reschedule')}
                              className="flex-1"
                              iconName="Calendar"
                              iconPosition="left"
                            >
                              Reschedule
                            </Button>
                          )}
                        </div>
                      )}
                      {appointment?.status === 'in_progress' || appointment?.status === 'in-progress' ? (
                        <div className="flex space-x-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onManageAppointment(appointment?.id, 'view')}
                            className="flex-1"
                            iconName="ArrowRight"
                            iconPosition="left"
                          >
                            Go to Job
                          </Button>
                        </div>
                      ) : null}
                      {appointment?.status === 'completed' && (
                        <div className="text-xs text-success font-medium">
                          ✓ Job completed
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;