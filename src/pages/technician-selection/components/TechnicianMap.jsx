import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const TechnicianMap = ({ technicians, selectedTechnician, onTechnicianSelect, userLocation }) => {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => setMapLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleMarkerClick = (technician) => {
    onTechnicianSelect(technician);
  };

  if (!mapLoaded) {
    return (
      <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-muted rounded-lg overflow-hidden">
      {/* Google Maps Iframe */}
      <iframe
        width="100%"
        height="100%"
        loading="lazy"
        title="Technician Locations"
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps?q=${userLocation?.lat},${userLocation?.lng}&z=14&output=embed`}
        className="w-full h-full"
      />
      {/* Map Overlay with Technician Markers */}
      <div className="absolute inset-0 pointer-events-none">
        {technicians?.map((technician, index) => (
          <div
            key={technician?.id}
            className="absolute pointer-events-auto cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${20 + (index % 3) * 30}%`,
              top: `${25 + Math.floor(index / 3) * 25}%`
            }}
            onClick={() => handleMarkerClick(technician)}
          >
            {/* Custom Marker */}
            <div className={`relative ${selectedTechnician?.id === technician?.id ? 'z-20' : 'z-10'}`}>
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center trust-shadow-md ${
                technician?.isAvailable 
                  ? 'bg-success border-success-foreground' 
                  : 'bg-muted border-border'
              }`}>
                <Icon 
                  name="User" 
                  size={16} 
                  color={technician?.isAvailable ? 'white' : 'var(--color-muted-foreground)'} 
                />
              </div>
              
              {/* Availability Indicator */}
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white ${
                technician?.isAvailable ? 'bg-success' : 'bg-muted-foreground'
              }`}></div>
              
              {/* Quick Info Card */}
              {selectedTechnician?.id === technician?.id && (
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-48 bg-card border border-border rounded-lg trust-shadow-lg p-3 z-30">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                      {technician?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{technician?.name}</p>
                      <div className="flex items-center space-x-1">
                        <Icon name="Star" size={12} className="text-warning fill-current" />
                        <span className="text-xs text-muted-foreground">{technician?.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Icon name="MapPin" size={10} />
                      <span>{technician?.distance} away</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Clock" size={10} />
                      <span>ETA: {technician?.eta}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="IndianRupee" size={10} />
                      <span>₹{technician?.hourlyRate}/hr</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border">
                    <button className="w-full text-xs text-primary hover:text-primary/80 font-medium">
                      View Full Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button className="w-10 h-10 bg-card border border-border rounded-md flex items-center justify-center hover:bg-muted trust-transition trust-shadow">
          <Icon name="Plus" size={16} />
        </button>
        <button className="w-10 h-10 bg-card border border-border rounded-md flex items-center justify-center hover:bg-muted trust-transition trust-shadow">
          <Icon name="Minus" size={16} />
        </button>
        <button className="w-10 h-10 bg-card border border-border rounded-md flex items-center justify-center hover:bg-muted trust-transition trust-shadow">
          <Icon name="Navigation" size={16} />
        </button>
      </div>
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card border border-border rounded-md p-2 trust-shadow">
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span className="text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
            <span className="text-muted-foreground">Busy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianMap;