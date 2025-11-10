import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../../../components/AppIcon';

const TechnicianMap = ({ technicians, selectedTechnician, onTechnicianSelect, userLocation }) => {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMapLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const bounds = useMemo(() => {
    const points = [];
    if (userLocation?.lat && userLocation?.lng) {
      points.push({ lat: userLocation.lat, lng: userLocation.lng });
    }
    (technicians || []).forEach((tech) => {
      if (tech?.location?.lat && tech?.location?.lng) {
        points.push({ lat: tech.location.lat, lng: tech.location.lng });
      }
    });

    if (points.length === 0) return null;

    const lats = points.map((point) => point.lat);
    const lngs = points.map((point) => point.lng);

    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };
  }, [technicians, userLocation]);

  const getMarkerPosition = (lat, lng) => {
    if (!bounds) {
      return { left: '50%', top: '50%' };
    }
    const latRange = bounds.maxLat - bounds.minLat || 0.01;
    const lngRange = bounds.maxLng - bounds.minLng || 0.01;

    const leftPercent = ((lng - bounds.minLng) / lngRange) * 80 + 10;
    const topPercent = ((bounds.maxLat - lat) / latRange) * 80 + 10;

    return {
      left: `${Math.min(90, Math.max(10, leftPercent))}%`,
      top: `${Math.min(90, Math.max(10, topPercent))}%`,
    };
  };

  const handleMarkerClick = (technician) => {
    if (onTechnicianSelect) {
      onTechnicianSelect(technician);
    }
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
      <iframe
        width="100%"
        height="100%"
        loading="lazy"
        title="Technician Locations"
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps?q=${userLocation?.lat ?? 12.9716},${userLocation?.lng ?? 77.5946}&z=13&output=embed`}
        className="w-full h-full"
      />

      {userLocation?.lat && userLocation?.lng && (
        <div
          className="absolute pointer-events-none"
          style={getMarkerPosition(userLocation.lat, userLocation.lng)}
        >
          <div className="pointer-events-auto flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center trust-shadow">
              <Icon name="Navigation" size={16} />
            </div>
            <span className="mt-1 text-[10px] px-2 py-0.5 bg-card border border-border rounded-full text-muted-foreground">
              You
            </span>
          </div>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none">
        {(technicians || [])
          .filter((technician) => technician?.location?.lat && technician?.location?.lng)
          .map((technician) => {
            const position = getMarkerPosition(
              technician.location.lat,
              technician.location.lng
            );
            const isSelected = selectedTechnician?.id === technician?.id;
            const isAvailable = technician?.isAvailable ?? technician?.availability === 'available';

            return (
              <div
                key={technician?.id}
                className="absolute pointer-events-auto cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                style={position}
                onClick={() => handleMarkerClick(technician)}
              >
                <div className={`relative ${isSelected ? 'z-20' : 'z-10'}`}>
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center trust-shadow-md ${
                      isAvailable ? 'bg-success border-success-foreground' : 'bg-muted border-border'
                    }`}
                  >
                    <Icon
                      name="User"
                      size={16}
                      color={isAvailable ? 'white' : 'var(--color-muted-foreground)'}
                    />
                  </div>
                  <div
                    className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white ${
                      isAvailable ? 'bg-success' : 'bg-muted-foreground'
                    }`}
                  ></div>

                  {isSelected && (
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
                          <span>{technician?.distance || '—'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Icon name="Clock" size={10} />
                          <span>ETA: {technician?.eta || '—'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Icon name="IndianRupee" size={10} />
                          <span>₹{technician?.hourlyRate}/hr</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button className="w-10 h-10 bg-card border border-border rounded-md flex items-center justify-center hover:bg-muted trust-transition trust-shadow">
          <Icon name="Plus" size={16} />
        </button>
        <button className="w-10 h-10 bg-card border border-border rounded-md flex items-center justify-center hover:bg-muted trust-transition trust-shadow">
          <Icon name="Minus" size={16} />
        </button>
      </div>
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