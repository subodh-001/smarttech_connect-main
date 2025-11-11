import React, { useMemo, useRef, useState } from 'react';
import InteractiveMap from '../../../components/maps/InteractiveMap';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DEFAULT_CENTER = [12.9716, 77.5946];
const LIGHT_TILE = 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png';
const DARK_TILE = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';

const LiveMap = ({
  userLocation,
  technicianLocation,
  serviceLocation,
  route,
  onRecenterMap,
  onToggleTraffic,
  showTraffic = false,
}) => {
  const mapRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const markers = useMemo(() => {
    const items = [];

    if (userLocation?.lat && userLocation?.lng) {
      items.push({
        id: 'map-user',
        type: 'user',
        position: [userLocation.lat, userLocation.lng],
        label: 'U',
        accent: '#2563eb',
      });
    }

    if (technicianLocation?.lat && technicianLocation?.lng) {
      items.push({
        id: 'map-technician',
        type: 'technician',
        position: [technicianLocation.lat, technicianLocation.lng],
        label: 'Technician',
        highlight: true,
        accent: '#0f172a',
      });
    }

    if (serviceLocation?.lat && serviceLocation?.lng) {
      items.push({
        id: 'map-destination',
        type: 'destination',
        position: [serviceLocation.lat, serviceLocation.lng],
        accent: '#f97316',
      });
    }

    if (!items.length) {
      items.push({ id: 'fallback', type: 'destination', position: DEFAULT_CENTER, accent: '#64748b' });
    }

    return items;
  }, [userLocation, technicianLocation, serviceLocation]);

  const handleRecenter = () => {
    if (mapRef.current?.fitToMarkers) {
      mapRef.current.fitToMarkers();
    }
    onRecenterMap?.();
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen((prev) => !prev);
  };

  return (
    <div
      className={`relative rounded-lg border border-border bg-card/60 backdrop-blur ${
        isFullscreen ? 'fixed inset-0 z-50' : 'h-96 lg:h-[500px]'
      }`}
    >
      <InteractiveMap
        ref={mapRef}
        markers={markers}
        fitToMarkers
        className="h-full"
        tileUrl={showTraffic ? DARK_TILE : LIGHT_TILE}
      />

      <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-border/40"></div>

      <div className="absolute top-4 right-4 space-y-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleRecenter}
          className="trust-shadow-md"
          title="Recenter Map"
        >
          <Icon name="Navigation" size={16} />
        </Button>

        <Button
          variant={showTraffic ? 'default' : 'secondary'}
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
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          <Icon name={isFullscreen ? 'Minimize2' : 'Maximize2'} size={16} />
        </Button>
      </div>

      <div className="absolute bottom-4 left-4 space-y-2">
        <div className="flex items-center space-x-2 rounded-lg bg-card/90 px-3 py-2 trust-shadow">
          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
          <span className="text-sm font-medium text-foreground">Your Location</span>
        </div>
        <div className="flex items-center space-x-2 rounded-lg bg-card/90 px-3 py-2 trust-shadow">
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-sm font-medium text-foreground">Technician</span>
        </div>
        {serviceLocation ? (
          <div className="flex items-center space-x-2 rounded-lg bg-card/90 px-3 py-2 trust-shadow">
            <div className="h-3 w-3 rounded-full bg-primary"></div>
            <span className="text-sm font-medium text-foreground">Service Address</span>
          </div>
        ) : null}
      </div>

      {route && (
        <div className="absolute bottom-4 right-4 max-w-48 rounded-lg bg-card/90 p-3 trust-shadow">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Distance</span>
              <span className="text-sm font-medium text-foreground">{route?.distance}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Duration</span>
              <span className="text-sm font-medium text-foreground">{route?.duration}</span>
            </div>
            {route?.trafficDelay ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Traffic Delay</span>
                <span className="text-sm font-medium text-orange-500">+{route?.trafficDelay}</span>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {isFullscreen && (
        <Button
          variant="secondary"
          size="icon"
          onClick={handleFullscreenToggle}
          className="absolute left-4 top-4 trust-shadow-md"
        >
          <Icon name="X" size={16} />
        </Button>
      )}
    </div>
  );
};

export default LiveMap;