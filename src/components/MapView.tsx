import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useReports } from '@/context/ReportsContext';
import { formatDistanceToNow } from 'date-fns';

function createAlertIcon(minutesAgo: number) {
  const opacity = Math.max(0.4, 1 - minutesAgo / 120);
  const size = minutesAgo < 15 ? 36 : minutesAgo < 45 ? 30 : 24;
  const pulseClass = minutesAgo < 15 ? 'animate-pulse-alert' : '';

  return L.divIcon({
    className: 'custom-marker-icon',
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        <div class="animate-ripple" style="position:absolute;inset:0;border-radius:50%;background:hsl(38 92% 55% / 0.2);"></div>
        <div class="${pulseClass}" style="
          width:${size}px;height:${size}px;border-radius:50%;
          background:hsl(38 92% 55% / ${opacity});
          border:2px solid hsl(38 92% 55%);
          display:flex;align-items:center;justify-content:center;
          font-size:${size * 0.45}px;
          box-shadow: 0 0 ${size * 0.6}px hsl(38 92% 55% / 0.4);
        ">🚨</div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

interface MapViewProps {
  onMapClick?: (lat: number, lng: number) => void;
}

const MapView = ({ onMapClick }: MapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const { reports, setUserLocation } = useReports();
  const initializedRef = useRef(false);
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [40.7128, -74.006],
      zoom: 13,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;

    // Map click handler for reporting
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClickRef.current) {
        onMapClickRef.current(e.latlng.lat, e.latlng.lng);
      }
    });

    // Fix sizing after render
    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(containerRef.current);
    setTimeout(() => map.invalidateSize(), 200);

    // Get user location
    if (!initializedRef.current) {
      initializedRef.current = true;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          map.setView([latitude, longitude], 14);
          setUserLocation({ lat: latitude, lng: longitude });
        },
        () => {
          // Default NYC
        }
      );
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [setUserLocation]);

  // Update markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const activeReports = reports.filter((r) => r.expiresAt > Date.now());

    activeReports.forEach((report) => {
      const minutesAgo = (Date.now() - report.timestamp) / 60000;
      const marker = L.marker([report.lat, report.lng], {
        icon: createAlertIcon(minutesAgo),
      }).addTo(map);

      const popupContent = `
        <div style="color:#1a1a2e;min-width:180px;font-family:Inter,sans-serif;">
          <p style="font-weight:bold;font-size:14px;margin:0 0 4px;">🚨 Officer Spotted</p>
          <p style="font-size:11px;opacity:0.7;margin:0;">${formatDistanceToNow(report.timestamp, { addSuffix: true })}</p>
          ${report.officerCount ? `<p style="margin:4px 0 0;font-size:12px;">Officers: ${report.officerCount}</p>` : ''}
          ${report.vehicleType ? `<p style="margin:2px 0 0;font-size:12px;">Vehicle: ${report.vehicleType}</p>` : ''}
          ${report.direction ? `<p style="margin:2px 0 0;font-size:12px;">Direction: ${report.direction}</p>` : ''}
          ${report.details ? `<p style="margin:6px 0 0;font-size:12px;font-style:italic;">"${report.details}"</p>` : ''}
          <p style="margin:8px 0 0;font-size:10px;opacity:0.5;">Expires ${formatDistanceToNow(report.expiresAt, { addSuffix: true })}</p>
        </div>
      `;
      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });
  }, [reports]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default MapView;
