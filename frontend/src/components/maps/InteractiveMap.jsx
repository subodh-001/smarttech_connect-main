import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [12.9716, 77.5946];
const DEFAULT_ZOOM = 13;
const TILE_URL = 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors • Tiles © <a href="https://stadiamaps.com/">Stadia Maps</a>';

const ICON_CACHE = new Map();

const formatName = (value, fallback = '') => {
  if (!value) return fallback;
  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(' ');
};

const createIconHtml = ({
  type,
  label,
  accent = '#2563eb',
  highlight = false,
  heading = 0,
}) => {
  switch (type) {
    case 'user':
      return `
        <div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-4px);">
          <div style="width:34px;height:34px;border-radius:9999px;background:${accent};color:white;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;box-shadow:0 10px 20px rgba(37,99,235,0.35);">
            <span>${label || 'U'}</span>
          </div>
          <div style="margin-top:4px;padding:2px 6px;border-radius:9999px;background:rgba(15,23,42,0.85);color:#e2e8f0;font-size:10px;font-weight:500;">You</div>
        </div>
      `;
    case 'destination':
      return `
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="width:14px;height:14px;border-radius:9999px;background:${accent};box-shadow:0 8px 18px rgba(15,23,42,0.4);"></div>
          <div style="width:8px;height:18px;background:${accent};border-radius:4px 4px 0 0;margin-top:-1px;"></div>
          <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:10px solid ${accent};margin-top:-1px;"></div>
        </div>
      `;
    case 'custom':
      return label || '';
    case 'technician':
    default: {
      const clampedRotation = Number.isFinite(heading) ? heading : 0;
      const baseColor = accent || '#0f172a';
      const glow = highlight ? 'rgba(37,211,102,0.45)' : 'rgba(15,23,42,0.35)';
      return `
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="transform:rotate(${clampedRotation}deg);display:flex;align-items:center;justify-content:center;">
            <div style="width:32px;height:18px;border-radius:8px;background:${baseColor};position:relative;box-shadow:0 12px 25px ${glow};">
              <div style="position:absolute;top:-5px;left:50%;transform:translateX(-50%);width:14px;height:6px;border-radius:4px 4px 2px 2px;background:#e2e8f0;"></div>
              <div style="position:absolute;bottom:-6px;left:6px;width:6px;height:6px;border-radius:50%;background:#1f2937;"></div>
              <div style="position:absolute;bottom:-6px;right:6px;width:6px;height:6px;border-radius:50%;background:#1f2937;"></div>
            </div>
          </div>
          <div style="margin-top:6px;padding:2px 6px;border-radius:9999px;background:rgba(15,23,42,0.92);color:#f8fafc;font-size:10px;font-weight:600;white-space:nowrap;">${formatName(
            label,
            'Technician',
          )}</div>
        </div>
      `;
    }
  }
};

const getMarkerIcon = ({ type, label, accent, highlight, heading }) => {
  const key = `${type || 'technician'}-${label || ''}-${accent || ''}-${highlight ? '1' : '0'}-${
    Number.isFinite(heading) ? heading : 0
  }`;
  if (ICON_CACHE.has(key)) {
    return ICON_CACHE.get(key);
  }

  const icon = L.divIcon({
    className: 'interactive-map-marker',
    html: createIconHtml({ type, label, accent, highlight, heading }),
    iconSize: type === 'user' ? [42, 48] : [40, 44],
    iconAnchor: [20, type === 'user' ? 46 : 40],
    popupAnchor: [0, type === 'user' ? -40 : -32],
  });

  ICON_CACHE.set(key, icon);
  return icon;
};

const MapEffects = ({
  bounds,
  center,
  zoom,
  fitToBounds,
  onReady,
}) => {
  const map = useMap();
  const initialized = useRef(false);
  const resizeObserverRef = useRef(null);

  React.useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      if (typeof onReady === 'function') {
        onReady(map);
      }
      // Invalidate size after a short delay to ensure container is rendered
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
      
      // Ensure Leaflet controls stay below header (z-index 1000)
      const container = map.getContainer();
      if (container) {
        const controls = container.querySelectorAll('.leaflet-control-container, .leaflet-control');
        controls.forEach((control) => {
          if (control instanceof HTMLElement) {
            control.style.zIndex = '999';
          }
        });
      }
    }
  }, [map, onReady]);

  React.useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);

  React.useEffect(() => {
    if (fitToBounds && bounds) {
      // If bounds are too small (same point or very close), zoom in more
      const boundsSize = bounds.getNorthEast().distanceTo(bounds.getSouthWest());
      const minZoom = boundsSize < 0.01 ? 15 : 12; // Zoom level 15 for very close points, 12 for wider area
      map.fitBounds(bounds, { 
        padding: [36, 36], 
        maxZoom: 16,
        minZoom: minZoom
      });
    }
  }, [bounds, fitToBounds, map]);

  React.useEffect(() => {
    // Handle window resize
    const handleResize = () => {
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    // Observe container size changes
    const container = map.getContainer();
    if (container && typeof ResizeObserver !== 'undefined') {
      resizeObserverRef.current = new ResizeObserver(() => {
        setTimeout(() => {
          map.invalidateSize();
        }, 50);
      });
      resizeObserverRef.current.observe(container);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [map]);

  return null;
};

const normalizeMarkers = (markers) => {
  return (markers || [])
    .map((marker) => {
      if (!marker) return null;
      const [lat, lng] = Array.isArray(marker.position)
        ? marker.position
        : [marker.lat, marker.lng];

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
      }

      return {
        id: marker.id || `${lat}-${lng}`,
        lat,
        lng,
        type: marker.type || 'technician',
        label: marker.label || marker.name || null,
        popup: marker.popup || null,
        accent: marker.accent,
        highlight: Boolean(marker.highlight),
        heading: marker.heading,
        data: marker,
      };
    })
    .filter(Boolean);
};

const buildBoundsFromMarkers = (markers) => {
  if (!markers.length) return null;
  const latLngs = markers.map((marker) => [marker.lat, marker.lng]);
  return L.latLngBounds(latLngs);
};

const InteractiveMap = forwardRef(
  (
    {
      markers = [],
      center = null,
      zoom = DEFAULT_ZOOM,
      className,
      dimmed = false,
      polylines = [],
      fitToMarkers = true,
      onReady,
      onMarkerClick,
      tileUrl = TILE_URL,
      tileAttribution = TILE_ATTRIBUTION,
    },
    ref,
  ) => {
    const mapRef = useRef(null);
    const normalizedMarkers = useMemo(() => normalizeMarkers(markers), [markers]);
    const bounds = useMemo(() => {
      if (!fitToMarkers) return null;
      return buildBoundsFromMarkers(normalizedMarkers);
    }, [normalizedMarkers, fitToMarkers]);

    const derivedCenter = useMemo(() => {
      if (center && Array.isArray(center) && center.length === 2) {
        return center;
      }
      if (normalizedMarkers.length) {
        return [normalizedMarkers[0].lat, normalizedMarkers[0].lng];
      }
      return DEFAULT_CENTER;
    }, [center, normalizedMarkers]);

    useImperativeHandle(ref, () => ({
      getLeafletMap: () => mapRef.current,
      flyTo: (latLng, nextZoom = 15) => {
        if (mapRef.current && latLng) {
          const target = Array.isArray(latLng) ? latLng : [latLng.lat, latLng.lng];
          mapRef.current.flyTo(target, nextZoom);
        }
      },
      fitToMarkers: () => {
        if (mapRef.current && bounds) {
          mapRef.current.fitBounds(bounds, { padding: [36, 36], maxZoom: 16 });
        }
      },
    }));

    const handleMarkerClick = (marker) => {
      if (typeof onMarkerClick === 'function') {
        onMarkerClick(marker.data || marker);
      }
    };

    const handleMapReady = (mapInstance) => {
      mapRef.current = mapInstance;
      if (typeof onReady === 'function') {
        onReady(mapInstance);
      }
    };

    return (
      <div
        className={clsx(
          'interactive-map relative h-full w-full overflow-hidden rounded-xl z-0',
          dimmed && 'pointer-events-none scale-[0.99] opacity-60 blur-[0.5px] transition-all duration-200 ease-out',
          className,
        )}
        style={{ zIndex: 0 }}
      >
        <MapContainer
          center={derivedCenter}
          zoom={zoom}
          className="h-full w-full"
          scrollWheelZoom
          preferCanvas
        >
          <TileLayer attribution={tileAttribution} url={tileUrl} />
          <MapEffects
            bounds={bounds}
            center={center}
            zoom={zoom}
            fitToBounds={fitToMarkers}
            onReady={handleMapReady}
          />

          {normalizedMarkers.map((marker) => (
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={getMarkerIcon(marker)}
              eventHandlers={{ click: () => handleMarkerClick(marker) }}
            >
              {marker.popup ? (
                <Popup closeButton={false} autoPan={false} className="interactive-map-popup">
                  <div dangerouslySetInnerHTML={{ __html: marker.popup }} />
                </Popup>
              ) : null}
            </Marker>
          ))}

          {polylines.map((polyline) => {
            if (!Array.isArray(polyline?.positions) || polyline.positions.length < 2) {
              return null;
            }
            const positions = polyline.positions.map((pos) =>
              Array.isArray(pos) ? pos : [pos.lat, pos.lng],
            );
            return (
              <Polyline
                key={polyline.id || `poly-${positions.length}`}
                positions={positions}
                pathOptions={{
                  color: polyline.color || '#38bdf8',
                  weight: polyline.weight || 4,
                  dashArray: polyline.dashArray || null,
                  opacity: polyline.opacity ?? 0.8,
                }}
              />
            );
          })}
        </MapContainer>
      </div>
    );
  },
);

InteractiveMap.displayName = 'InteractiveMap';

InteractiveMap.propTypes = {
  markers: PropTypes.arrayOf(PropTypes.object),
  center: PropTypes.arrayOf(PropTypes.number),
  zoom: PropTypes.number,
  className: PropTypes.string,
  dimmed: PropTypes.bool,
  polylines: PropTypes.arrayOf(PropTypes.object),
  fitToMarkers: PropTypes.bool,
  onReady: PropTypes.func,
  onMarkerClick: PropTypes.func,
  tileUrl: PropTypes.string,
  tileAttribution: PropTypes.string,
};

export default InteractiveMap;
