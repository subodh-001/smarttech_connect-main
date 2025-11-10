import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ComparisonModal = ({ technicians, onClose, onBookTechnician, onViewProfile }) => {
  if (technicians?.length === 0) return null;

  const getAvailabilityColor = (status) => {
    switch (status) {
      case 'available': return 'text-success';
      case 'busy': return 'text-warning';
      case 'offline': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getAvailabilityText = (status) => {
    switch (status) {
      case 'available': return 'Available Now';
      case 'busy': return 'Busy';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden trust-shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <Icon name="GitCompare" size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Compare Technicians</h2>
            <span className="text-sm text-muted-foreground">({technicians?.length} selected)</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} iconName="X" />
        </div>

        {/* Comparison Content */}
        <div className="overflow-auto max-h-[calc(90vh-80px)]">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {technicians?.map((technician) => (
                <div key={technician?.id} className="bg-muted/30 border border-border rounded-lg p-4">
                  {/* Profile Header */}
                  <div className="text-center mb-4">
                    <div className="relative inline-block mb-2">
                      <Image
                        src={technician?.avatar}
                        alt={technician?.name}
                        className="w-16 h-16 rounded-full object-cover mx-auto"
                      />
                      {technician?.isVerified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                          <Icon name="Check" size={10} color="white" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground">{technician?.name}</h3>
                    <div className="flex items-center justify-center space-x-1 mt-1">
                      <Icon name="Star" size={14} className="text-warning fill-current" />
                      <span className="text-sm font-medium">{technician?.rating}</span>
                      <span className="text-xs text-muted-foreground">({technician?.reviewCount})</span>
                    </div>
                  </div>

                  {/* Comparison Metrics */}
                  <div className="space-y-3">
                    {/* Availability */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Availability:</span>
                      <div className={`flex items-center space-x-1 text-sm ${getAvailabilityColor(technician?.availability)}`}>
                        <div className={`w-2 h-2 rounded-full ${
                          technician?.availability === 'available' ? 'bg-success' : 
                          technician?.availability === 'busy' ? 'bg-warning' : 'bg-muted-foreground'
                        }`}></div>
                        <span>{getAvailabilityText(technician?.availability)}</span>
                      </div>
                    </div>

                    {/* Distance */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Distance:</span>
                      <span className="text-sm font-medium text-foreground">{technician?.distance}</span>
                    </div>

                    {/* ETA */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">ETA:</span>
                      <span className="text-sm font-medium text-foreground">{technician?.eta}</span>
                    </div>

                    {/* Hourly Rate */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Rate:</span>
                      <span className="text-sm font-semibold text-foreground">
                        ₹
                        {Number.isFinite(technician?.priceWithSurge)
                          ? technician.priceWithSurge.toLocaleString('en-IN')
                          : Number.isFinite(technician?.hourlyRate)
                          ? technician.hourlyRate.toLocaleString('en-IN')
                          : technician?.hourlyRate}
                        /hr
                      </span>
                    </div>

                    {/* Experience */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Experience:</span>
                      <span className="text-sm font-medium text-foreground">{technician?.experience}</span>
                    </div>

                    {/* Response Time */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Response:</span>
                      <span className="text-sm font-medium text-foreground">{technician?.responseTime}</span>
                    </div>

                    {/* Specializations */}
                    <div>
                      <span className="text-sm text-muted-foreground mb-2 block">Specializations:</span>
                      <div className="flex flex-wrap gap-1">
                        {technician?.specializations?.slice(0, 3)?.map((spec, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-primary/10 text-primary">
                            {spec}
                          </span>
                        ))}
                        {technician?.specializations?.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-muted text-muted-foreground">
                            +{technician?.specializations?.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Badges */}
                    {technician?.badges?.length > 0 && (
                      <div>
                        <span className="text-sm text-muted-foreground mb-2 block">Badges:</span>
                        <div className="flex flex-wrap gap-1">
                          {technician?.badges?.map((badge, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-success/10 text-success">
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Review */}
                    {technician?.recentReview && (
                      <div>
                        <span className="text-sm text-muted-foreground mb-2 block">Recent Review:</span>
                        <div className="p-2 bg-muted/50 rounded text-xs">
                          <div className="flex items-center space-x-1 mb-1">
                            {[...Array(5)]?.map((_, i) => (
                              <Icon
                                key={i}
                                name="Star"
                                size={8}
                                className={i < technician?.recentReview?.rating ? 'text-warning fill-current' : 'text-muted-foreground'}
                              />
                            ))}
                            <span className="text-muted-foreground">by {technician?.recentReview?.customerName}</span>
                          </div>
                          <p className="text-muted-foreground line-clamp-2">{technician?.recentReview?.comment}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewProfile(technician)}
                      className="w-full"
                    >
                      View Full Profile
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onBookTechnician(technician)}
                      disabled={technician?.availability !== 'available'}
                      className="w-full"
                    >
                      {technician?.availability === 'available' ? 'Request Booking' : 'Unavailable'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;