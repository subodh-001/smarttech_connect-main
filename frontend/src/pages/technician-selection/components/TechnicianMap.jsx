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
  const markers = useMemo(() => {
    const items = [];
    if (userLocation?.lat && userLocation?.lng) {
      items.push({
        id: 'user-location',
        type: 'user',
        position: [userLocation.lat, userLocation.lng],
        label: 'U',
        accent: '#2563eb',
      });
    }

    (technicians || [])
      .filter((tech) => tech?.location?.lat && tech?.location?.lng)
      .forEach((tech) => {
        const isSelected = selectedTechnician?.id === tech?.id;
        items.push({
          id: tech?.id || tech?.userId || Math.random().toString(36).slice(2),
          type: 'technician',
          position: [tech.location.lat, tech.location.lng],
          label: tech.displayName || tech.name,
          highlight: isSelected,
          accent: tech?.verified ? '#22c55e' : '#0f172a',
          popup: buildTechnicianPopup(tech),
          data: tech,
        });
      });

    return items;
  }, [technicians, userLocation, selectedTechnician]);

  return (
    <InteractiveMap
      markers={markers}
      dimmed={isProfileOpen}
      onMarkerClick={(marker) => {
        if (marker) {
          onTechnicianSelect?.(marker);
        }
      }}
    />
  );
};

export default TechnicianMap;