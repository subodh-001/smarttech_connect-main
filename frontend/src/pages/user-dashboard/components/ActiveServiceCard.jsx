import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ActiveServiceCard = ({ service }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'on-the-way':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'assigned':
        return 'UserCheck';
      case 'in-progress':
        return 'Wrench';
      case 'on-the-way':
        return 'Car';
      default:
        return 'Clock';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 trust-shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <Image
              src={service?.technician?.avatar}
              alt={service?.technician?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{service?.technician?.name}</h3>
            <p className="text-sm text-muted-foreground">{service?.category}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service?.status)}`}>
          <div className="flex items-center space-x-1">
            <Icon name={getStatusIcon(service?.status)} size={12} />
            <span>{service?.status?.replace('-', ' ')?.toUpperCase()}</span>
          </div>
        </div>
      </div>
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="MapPin" size={16} />
          <span>{service?.location}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Clock" size={16} />
          <span>ETA: {service?.eta}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="IndianRupee" size={16} />
          <span>₹{service?.budget}</span>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          iconName="Phone"
          iconPosition="left"
          className="flex-1"
        >
          Call
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="MessageCircle"
          iconPosition="left"
          className="flex-1"
        >
          Chat
        </Button>
        <Link to="/live-tracking" className="flex-1">
          <Button
            variant="default"
            size="sm"
            iconName="MapPin"
            iconPosition="left"
            fullWidth
          >
            Track
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ActiveServiceCard;