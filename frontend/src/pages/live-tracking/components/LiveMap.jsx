import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LiveMap = ({
  userLocation,
  technicianLocation,
  serviceLocation,
  route,
  onRecenterMap,
  onToggleTraffic,
  showTraffic = false,
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  const generateMapUrl = () => {
    const points = [userLocation, technicianLocation, serviceLocation].filter(
      (point) => point?.lat && point?.lng,
    );

    if (!points.length) return '';

    const centerLat = points.reduce((sum, point) => sum + point.lat, 0) / points.length;
    const centerLng = points.reduce((sum, point) => sum + point.lng, 0) / points.length;

    return `https://www.google.com/maps?q=${centerLat},${centerLng}&z=13&output=embed`;
  };

  return (
    <div className={`relative bg-muted rounded-lg overflow-hidden ${
      isFullscreen ? 'fixed inset-0 z-50' : 'h-96 lg:h-[500px]'
    }`}>
      {/* Map Loading State */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Loading live map...</p>
          </div>
        </div>
      )}
      {/* Google Maps Iframe */}
      {mapLoaded && (
        <iframe
          width="100%"
          height="100%"
          loading="lazy"
          title="Live Tracking Map"
          referrerPolicy="no-referrer-when-downgrade"
          src={generateMapUrl()}
          className="border-0"
        />
      )}
      {/* Map Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={onRecenterMap}
          className="trust-shadow-md"
          title="Recenter Map"
        >
          <Icon name="Navigation" size={16} />
        </Button>
        
        <Button
          variant={showTraffic ? "default" : "secondary"}
          size="icon"
          onClick={onToggleTraffic}
          className="trust-shadow-md"
          title="Toggle Traffic"
        >
          <Icon name="Car" size={16} />
        </Button>
        
        <Button
          variant="secondary"
          size="icon"
          onClick={handleFullscreenToggle}
          className="trust-shadow-md"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          <Icon name={isFullscreen ? "Minimize2" : "Maximize2"} size={16} />
        </Button>
      </div>
      {/* Location Indicators */}
      <div className="absolute bottom-4 left-4 space-y-2">
        {/* User Location */}
        <div className="flex items-center space-x-2 bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg trust-shadow">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-medium text-foreground">Your Location</span>
        </div>
        
        {/* Technician Location */}
        <div className="flex items-center space-x-2 bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg trust-shadow">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-foreground">Technician</span>
        </div>
        {serviceLocation ? (
          <div className="flex items-center space-x-2 bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg trust-shadow">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-sm font-medium text-foreground">Service Address</span>
          </div>
        ) : null}
      </div>
      {/* Route Information */}
      {route && (
        <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm p-3 rounded-lg trust-shadow max-w-48">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Distance</span>
              <span className="text-sm font-medium text-foreground">{route?.distance}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Duration</span>
              <span className="text-sm font-medium text-foreground">{route?.duration}</span>
            </div>
            {route?.trafficDelay && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Traffic Delay</span>
                <span className="text-sm font-medium text-orange-600">+{route?.trafficDelay}</span>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Fullscreen Close Button */}
      {isFullscreen && (
        <Button
          variant="secondary"
          size="icon"
          onClick={handleFullscreenToggle}
          className="absolute top-4 left-4 trust-shadow-md"
        >
          <Icon name="X" size={16} />
        </Button>
      )}
    </div>
  );
};

export default LiveMap;