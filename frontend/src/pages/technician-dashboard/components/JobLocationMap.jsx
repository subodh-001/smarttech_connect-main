import React, { useMemo } from 'react';
import Icon from '../../../components/AppIcon';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const buildBounds = (jobLocation, technicianLocation) => {
  const points = [];
  if (jobLocation?.lat && jobLocation?.lng) {
    points.push({ lat: jobLocation.lat, lng: jobLocation.lng });
  }
  if (technicianLocation?.lat && technicianLocation?.lng) {
    points.push({ lat: technicianLocation.lat, lng: technicianLocation.lng });
  }
  if (points.length === 0) return null;
  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return {
    minLat,
    maxLat,
    minLng,
    maxLng,
    latRange: Math.max(maxLat - minLat, 0.01),
    lngRange: Math.max(maxLng - minLng, 0.01),
  };
};

const getMarkerPosition = (bounds, lat, lng) => {
  if (!bounds) {
    return { left: '50%', top: '50%' };
  }
  const leftPercent = ((lng - bounds.minLng) / bounds.lngRange) * 80 + 10;
  const topPercent = ((bounds.maxLat - lat) / bounds.latRange) * 80 + 10;

  return {
    left: `${clamp(leftPercent, 10, 90)}%`,
    top: `${clamp(topPercent, 10, 90)}%`,
  };
};

const Marker = ({ type, position }) => (
  <div
    className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
    style={position}
  >
    <div className="flex flex-col items-center pointer-events-auto">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border ${
          type === 'job'
            ? 'bg-accent text-accent-foreground border-accent/40'
            : 'bg-primary text-primary-foreground border-primary/40'
        }`}
      >
        <Icon name={type === 'job' ? 'MapPin' : 'Navigation'} size={16} />
      </div>
      <span className="mt-1 text-[10px] px-2 py-0.5 bg-card border border-border rounded-full text-muted-foreground">
        {type === 'job' ? 'Job' : 'You'}
      </span>
    </div>
  </div>
);

const JobLocationMap = ({ jobLocation, technicianLocation, height = 200 }) => {
  if (!jobLocation?.lat || !jobLocation?.lng) {
    return (
      <div
        className="w-full rounded-lg border border-border bg-muted/40 flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-xs text-muted-foreground flex items-center space-x-2">
          <Icon name="MapPin" size={14} />
          <span>Job location not available yet.</span>
        </div>
      </div>
    );
  }

  const bounds = useMemo(
    () => buildBounds(jobLocation, technicianLocation),
    [jobLocation, technicianLocation]
  );

  const jobMarkerPosition = useMemo(
    () => getMarkerPosition(bounds, jobLocation.lat, jobLocation.lng),
    [bounds, jobLocation.lat, jobLocation.lng]
  );

  const technicianMarkerPosition = useMemo(() => {
    if (!technicianLocation?.lat || !technicianLocation?.lng) return null;
    return getMarkerPosition(bounds, technicianLocation.lat, technicianLocation.lng);
  }, [bounds, technicianLocation]);

  const mapSrc = `https://www.google.com/maps?q=${jobLocation.lat},${jobLocation.lng}&z=14&output=embed`;

  return (
    <div
      className="relative w-full rounded-lg border border-border overflow-hidden bg-muted"
      style={{ height }}
    >
      <iframe
        width="100%"
        height="100%"
        loading="lazy"
        title="Job Location"
        referrerPolicy="no-referrer-when-downgrade"
        src={mapSrc}
        className="w-full h-full"
      />
      <div className="absolute inset-0 pointer-events-none">
        <Marker type="job" position={jobMarkerPosition} />
        {technicianMarkerPosition ? (
          <Marker type="technician" position={technicianMarkerPosition} />
        ) : null}
      </div>
    </div>
  );
};

export default JobLocationMap;

