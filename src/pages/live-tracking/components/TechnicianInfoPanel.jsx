import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const TechnicianInfoPanel = ({ 
  technician, 
  estimatedArrival, 
  currentStatus, 
  onCall, 
  onChat, 
  onEmergencyContact 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'En Route':
        return 'bg-blue-100 text-blue-800';
      case 'Arrived':
        return 'bg-green-100 text-green-800';
      case 'Working':
        return 'bg-orange-100 text-orange-800';
      case 'Completed':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatETA = (eta) => {
    if (!eta) return 'Calculating...';
    const minutes = Math.ceil(eta / 60);
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <div className="bg-card border border-border rounded-lg trust-shadow-md p-4 space-y-4">
      {/* Technician Header */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Image
            src={technician?.avatar}
            alt={technician?.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{technician?.name}</h3>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {[...Array(5)]?.map((_, i) => (
                <Icon
                  key={i}
                  name="Star"
                  size={12}
                  className={i < Math.floor(technician?.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {technician?.rating} ({technician?.reviewCount} reviews)
            </span>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentStatus)}`}>
          {currentStatus}
        </div>
      </div>
      {/* ETA and Distance */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-primary">{formatETA(estimatedArrival)}</div>
          <div className="text-sm text-muted-foreground">ETA</div>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-primary">{technician?.distance}</div>
          <div className="text-sm text-muted-foreground">Away</div>
        </div>
      </div>
      {/* Contact Information */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Phone" size={16} />
          <span>{technician?.phone}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Car" size={16} />
          <span>{technician?.vehicle} - {technician?.vehicleNumber}</span>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          iconName="Phone"
          iconPosition="left"
          onClick={onCall}
          className="w-full"
        >
          Call
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="MessageCircle"
          iconPosition="left"
          onClick={onChat}
          className="w-full"
        >
          Chat
        </Button>
      </div>
      {/* Emergency Contact */}
      <Button
        variant="destructive"
        size="sm"
        iconName="AlertTriangle"
        iconPosition="left"
        onClick={onEmergencyContact}
        className="w-full"
      >
        Emergency Contact
      </Button>
    </div>
  );
};

export default TechnicianInfoPanel;