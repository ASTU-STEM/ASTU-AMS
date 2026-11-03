import React from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CITY_COORDINATES: Record<string, [number, number]> = {
  'addis ababa': [8.9806, 38.7578],
  'adama': [8.5400, 39.2700],
  'nazret': [8.5400, 39.2700],
  'oromya/nekemte': [9.0833, 36.5500],
  'nekemte': [9.0833, 36.5500],
  'oromiya': [8.5400, 39.2700],
  'hawassa': [7.0500, 38.4667],
  'dire dawa': [9.6000, 41.8667],
  'bahir dar': [11.5833, 37.3833],
  'gondar': [12.6000, 37.4667],
  'mekelle': [13.4967, 39.4769],
  'jimma': [7.6667, 36.8333],
  'bishoftu': [8.7500, 38.9833],
  'ethiopian': [9.0000, 38.7500],
  'ethiopia': [9.0000, 38.7500],
  'remote': [8.9806, 38.7578],
};

export default function LocationMap({
  locations,
  className = 'h-full w-full min-h-[310px]',
}: {
  locations: Array<{ name: string; value: number; count: number; fill: string }>;
  className?: string;
}) {
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

  return <div ref={mapRef} className={`rounded-[10px] overflow-hidden border border-slate-200 ${className}`} />;
}


