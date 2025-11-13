import React, { useMemo } from 'react';
import InteractiveMap from '../../../components/maps/InteractiveMap';
import Icon from '../../../components/AppIcon';

const JobLocationMap = ({ jobLocation, technicianLocation, height = 200 }) => {
  if (!jobLocation?.lat || !jobLocation?.lng) {
    return (
      <div
        className="flex w-full items-center justify-center rounded-lg border border-border bg-muted/40"
        style={{ height }}
      >
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Icon name="MapPin" size={14} />
          <span>Job location not available yet.</span>
        </div>
      </div>
    );
  }

  const markers = useMemo(() => {
    // Only show the user's service location (job location), not technician location
    const items = [
      {
        id: 'job-location',
        type: 'destination',
        position: [jobLocation.lat, jobLocation.lng],
        accent: '#f97316',
        label: 'Service Location',
      },
    ];

    // Removed technician location marker - only show user's service location

    return items;
  }, [jobLocation]);

  return (
    <div className="relative overflow-hidden rounded-lg border border-border" style={{ height }}>
      <InteractiveMap markers={markers} fitToMarkers className="h-full" />
    </div>
  );
};

export default JobLocationMap;

