import React, { useMemo } from 'react';
import InteractiveMap from '../../../components/maps/InteractiveMap';

const buildTechnicianPopup = (technician) => {
  const name = (technician.displayName || technician.name || 'Technician')
    .split(' ')
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(' ');

  return `
    <div style="min-width:180px;padding:8px 4px;font-size:13px;color:#0f172a;">
      <div style="font-weight:600;font-size:14px;color:#111827">${name}</div>
      <div style="margin-top:6px;display:flex;gap:8px;color:#4b5563;">
        <span>⭐ ${technician?.rating || '—'}</span>
        <span>${technician?.distance || '—'}</span>
      </div>
      <div style="margin-top:4px;color:#0f172a;">₹${
        technician?.priceWithSurge ?? technician?.hourlyRate ?? '—'
      } / hr</div>
    </div>
  `;
};

const TechnicianMap = ({
  technicians,
  selectedTechnician,
  onTechnicianSelect,
  userLocation,
  isProfileOpen = false,
}) => {
  // Validate and normalize coordinates
  const isValidCoordinate = (value) => {
    return typeof value === 'number' && 
           !isNaN(value) && 
           isFinite(value) &&
           value >= -180 && 
           value <= 180;
  };

  const isValidLat = (lat) => {
    return isValidCoordinate(lat) && lat >= -90 && lat <= 90;
  };

  const isValidLng = (lng) => {
    return isValidCoordinate(lng);
  };

  const markers = useMemo(() => {
    const items = [];
    
    // Add user location marker if valid
    if (userLocation?.lat && userLocation?.lng) {
      const userLat = Number(userLocation.lat);
      const userLng = Number(userLocation.lng);
      
      if (isValidLat(userLat) && isValidLng(userLng)) {
        items.push({
          id: 'user-location',
          type: 'user',
          position: [userLat, userLng],
          label: 'U',
          accent: '#2563eb',
        });
      }
    }

    // Add technician markers if they have valid locations
    (technicians || [])
      .filter((tech) => {
        if (!tech?.location) return false;
        const lat = Number(tech.location.lat);
        const lng = Number(tech.location.lng);
        return isValidLat(lat) && isValidLng(lng);
      })
      .forEach((tech) => {
        const isSelected = selectedTechnician?.id === tech?.id;
        const lat = Number(tech.location.lat);
        const lng = Number(tech.location.lng);
        
        items.push({
          id: tech?.id || tech?.userId || Math.random().toString(36).slice(2),
          type: 'technician',
          position: [lat, lng],
          label: tech.displayName || tech.name,
          highlight: isSelected,
          accent: tech?.verified ? '#22c55e' : '#0f172a',
          popup: buildTechnicianPopup(tech),
          data: tech,
        });
      });

    return items;
  }, [technicians, userLocation, selectedTechnician]);

  // Calculate center point - prioritize user location, then first technician, then default
  const mapCenter = useMemo(() => {
    if (userLocation?.lat && userLocation?.lng) {
      const userLat = Number(userLocation.lat);
      const userLng = Number(userLocation.lng);
      if (isValidLat(userLat) && isValidLng(userLng)) {
        return [userLat, userLng];
      }
    }
    
    // If user location is invalid, use first technician location
    const firstTech = technicians?.find((tech) => {
      if (!tech?.location) return false;
      const lat = Number(tech.location.lat);
      const lng = Number(tech.location.lng);
      return isValidLat(lat) && isValidLng(lng);
    });
    
    if (firstTech?.location) {
      const lat = Number(firstTech.location.lat);
      const lng = Number(firstTech.location.lng);
      if (isValidLat(lat) && isValidLng(lng)) {
        return [lat, lng];
      }
    }
    
    // Default to Mumbai if no valid locations
    return [19.0760, 72.8777];
  }, [userLocation, technicians]);

  return (
    <div className="h-full w-full">
      <InteractiveMap
        markers={markers}
        center={mapCenter}
        zoom={markers.length > 1 ? 12 : 13}
        fitToMarkers={markers.length > 0}
        dimmed={isProfileOpen}
        onMarkerClick={(marker) => {
          if (marker) {
            onTechnicianSelect?.(marker);
          }
        }}
      />
    </div>
  );
};

export default TechnicianMap;