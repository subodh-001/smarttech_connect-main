import React from 'react';
import Icon from '../../../components/AppIcon';

const ServiceProgressIndicator = ({ currentPhase, phases, lastUpdate }) => {
  const getPhaseIcon = (phase) => {
    switch (phase) {
      case 'Traveling':
        return 'Car';
      case 'Assessing':
        return 'Search';
      case 'Working':
        return 'Wrench';
      case 'Testing':
        return 'CheckCircle';
      case 'Completed':
        return 'Check';
      default:
        return 'Clock';
    }
  };

  const getPhaseColor = (phase, isActive, isCompleted) => {
    if (isCompleted) return 'text-green-600 bg-green-100';
    if (isActive) return 'text-primary bg-primary/10';
    return 'text-muted-foreground bg-muted';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp)?.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const phaseList = Array.isArray(phases) ? phases : [];
  const completedCount = phaseList.filter((phase) => phase?.completedAt).length;
  const progressPercent = phaseList.length
    ? Math.round((completedCount / phaseList.length) * 100)
    : 0;

  return (
    <div className="bg-card border border-border rounded-lg trust-shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Service Progress</h3>
        {lastUpdate && (
          <span className="text-sm text-muted-foreground">
            Last updated: {formatTime(lastUpdate)}
          </span>
        )}
      </div>
      <div className="space-y-3">
        {phaseList.map((phase, index) => {
          const isActive = phase?.name === currentPhase;
          const isCompleted = phase?.completedAt !== null;
          const isPending = !isCompleted && !isActive;

          return (
            <div key={phase?.name} className="flex items-center space-x-3">
              {/* Phase Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getPhaseColor(phase?.name, isActive, isCompleted)}`}>
                <Icon 
                  name={getPhaseIcon(phase?.name)} 
                  size={20} 
                  className={isCompleted ? 'text-green-600' : isActive ? 'text-primary' : 'text-muted-foreground'}
                />
              </div>
              {/* Phase Details */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {phase?.name}
                  </span>
                  {isCompleted && (
                    <span className="text-sm text-muted-foreground">
                      {formatTime(phase?.completedAt)}
                    </span>
                  )}
                  {isActive && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <span className="text-sm text-primary">In Progress</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {phase?.description}
                </p>
                {phase?.notes && (
                  <p className="text-sm text-foreground mt-1 bg-muted p-2 rounded">
                    {phase?.notes}
                  </p>
                )}
              </div>
              {/* Status Indicator */}
              <div className="flex flex-col items-center">
                {isCompleted && (
                  <Icon name="CheckCircle" size={16} className="text-green-600" />
                )}
                {isActive && (
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                )}
                {isPending && (
                  <div className="w-3 h-3 bg-muted rounded-full"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full trust-transition"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ServiceProgressIndicator;