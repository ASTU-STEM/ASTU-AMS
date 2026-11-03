import React from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CITY_COORDINATES } from './types';

export interface LocationMapProps {
  locations: Array<{ name: string; value: number; count: number; fill: string }>;
  className?: string;
}

export default function LocationMap({
  locations,
  className = 'h-full w-full min-h-[310px]',
}: LocationMapProps) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<L.Map | null>(null);

  React.useEffect(() => {
    if (!mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current, {
      center: [8.6, 38.9],
      zoom: 6,
      zoomControl: true,
    });

    const streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    });

    const satelliteMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 18,
    });

    streetMap.addTo(map);

    const baseMaps = {
      'Map View': streetMap,
      'Satellite View': satelliteMap,
    };

    L.control.layers(baseMaps, undefined, { position: 'topright' }).addTo(map);

    mapInstanceRef.current = map;

    const timer1 = setTimeout(() => map.invalidateSize(), 100);
    const timer2 = setTimeout(() => map.invalidateSize(), 300);
    const timer3 = setTimeout(() => map.invalidateSize(), 600);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapRef.current);
    }

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    // Add markers for database locations
    locations.forEach((loc) => {
      const key = loc.name.toLowerCase().trim();
      const coords = CITY_COORDINATES[key] || [8.9806 + (Math.random() - 0.5) * 1.5, 38.7578 + (Math.random() - 0.5) * 1.5];

      const marker = L.circleMarker(coords, {
        radius: Math.max(9, Math.min(24, 9 + loc.value * 0.35)),
        fillColor: loc.fill || '#003580',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 130px;">
          <strong style="font-size: 13px; color: #0f172a; display: block; margin-bottom: 2px;">${loc.name}</strong>
          <div style="font-size: 11px; color: #475569;">Alumni Share: <strong style="color: #003580;">${loc.value}%</strong></div>
          <div style="font-size: 10px; color: #64748b;">${loc.count || 1} alumni recorded</div>
        </div>
      `);
    });

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [locations]);

  return <div ref={mapRef} className={`rounded-[10px] overflow-hidden border border-slate-200 dark:border-slate-800 ${className}`} />;
}
