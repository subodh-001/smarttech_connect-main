import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ServiceDetailsPanel = ({ 
  serviceRequest, 
  pricing, 
  onModifyRequest, 
  onCancelService,
  onViewFullDetails 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })?.format(amount);
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime)?.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'plumbing':
        return 'Droplets';
      case 'electrical':
        return 'Zap';
      case 'ac repair':
        return 'Wind';
      case 'computer repair':
        return 'Monitor';
      case 'carpentry':
        return 'Hammer';
      default:
        return 'Wrench';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg trust-shadow">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon 
                name={getCategoryIcon(serviceRequest?.category)} 
                size={20} 
                className="text-primary" 
              />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{serviceRequest?.title}</h3>
              <p className="text-sm text-muted-foreground">
                Booking ID: #{serviceRequest?.id}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Less' : 'More'}
          </Button>
        </div>
      </div>
      {/* Basic Info */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-muted-foreground">Category</span>
            <p className="font-medium text-foreground">{serviceRequest?.category}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Priority</span>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                serviceRequest?.priority === 'High' ? 'bg-red-500' :
                serviceRequest?.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
              <span className="font-medium text-foreground">{serviceRequest?.priority}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-muted-foreground">Scheduled Time</span>
            <p className="font-medium text-foreground">
              {formatDateTime(serviceRequest?.scheduledTime)}
            </p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Estimated Cost</span>
            <p className="font-medium text-primary text-lg">
              {formatCurrency(pricing?.estimatedCost)}
            </p>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div>
              <span className="text-sm text-muted-foreground">Description</span>
              <p className="text-foreground mt-1">{serviceRequest?.description}</p>
            </div>

            <div>
              <span className="text-sm text-muted-foreground">Service Address</span>
              <div className="flex items-start space-x-2 mt-1">
                <Icon name="MapPin" size={16} className="text-muted-foreground mt-1" />
                <p className="text-foreground">{serviceRequest?.address}</p>
              </div>
            </div>

            {serviceRequest?.specialInstructions && (
              <div>
                <span className="text-sm text-muted-foreground">Special Instructions</span>
                <p className="text-foreground mt-1 bg-muted p-3 rounded-lg">
                  {serviceRequest?.specialInstructions}
                </p>
              </div>
            )}

            {/* Pricing Breakdown */}
            <div>
              <span className="text-sm text-muted-foreground">Pricing Details</span>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Base Service Charge</span>
                  <span>{formatCurrency(pricing?.baseCharge)}</span>
                </div>
                {pricing?.materialCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Material Cost (Est.)</span>
                    <span>{formatCurrency(pricing?.materialCost)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Service Fee</span>
                  <span>{formatCurrency(pricing?.serviceFee)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-medium">
                  <span>Total Estimated</span>
                  <span className="text-primary">{formatCurrency(pricing?.estimatedCost)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                iconName="Edit"
                iconPosition="left"
                onClick={onModifyRequest}
              >
                Modify Request
              </Button>
              <Button
                variant="destructive"
                size="sm"
                iconName="X"
                iconPosition="left"
                onClick={onCancelService}
              >
                Cancel Service
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              iconName="ExternalLink"
              iconPosition="left"
              onClick={onViewFullDetails}
              className="w-full"
            >
              View Full Details
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetailsPanel;