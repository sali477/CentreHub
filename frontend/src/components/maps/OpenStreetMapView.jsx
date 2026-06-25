import { useEffect, useRef, useState } from 'react';

const DEFAULT_CENTER = { lat: 33.5731, lng: -7.5898 };
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

let leafletPromise = null;

const loadLeaflet = () => {
  if (window.L) return Promise.resolve(window.L);

  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-leaflet-css]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS;
      link.dataset.leafletCss = 'true';
      document.head.appendChild(link);
    }

    const existing = document.querySelector('script[data-leaflet-js]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.L));
      existing.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.src = LEAFLET_JS;
    script.async = true;
    script.defer = true;
    script.dataset.leafletJs = 'true';
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return leafletPromise;
};

const fixLeafletIcons = (L) => {
  if (L.Icon.Default.prototype._centreHubPatched) return;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
  L.Icon.Default.prototype._centreHubPatched = true;
};

const OpenStreetMapView = ({
  centers = [],
  center,
  userLocation = null,
  height = '400px',
  zoom = 12,
  onCenterClick,
  className = '',
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapRef.current) return undefined;

    let cancelled = false;

    const initMap = async () => {
      try {
        const L = await loadLeaflet();
        if (cancelled || !mapRef.current) return;

        fixLeafletIcons(L);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const defaultCenter = center?.location?.coordinates
          ? { lat: center.location.coordinates[1], lng: center.location.coordinates[0] }
          : userLocation || DEFAULT_CENTER;

        const map = L.map(mapRef.current, {
          center: [defaultCenter.lat, defaultCenter.lng],
          zoom: center ? 15 : zoom,
          scrollWheelZoom: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
        markersLayerRef.current = L.layerGroup().addTo(map);

        const items = center ? [center] : centers;
        const bounds = L.latLngBounds([]);

        items.forEach((c) => {
          if (!c.location?.coordinates) return;

          const lat = c.location.coordinates[1];
          const lng = c.location.coordinates[0];
          bounds.extend([lat, lng]);

          const marker = L.marker([lat, lng]);
          const popupHtml = `
            <div style="padding:4px;max-width:220px">
              <strong>${c.name || 'Center'}</strong>
              <p style="margin:4px 0;font-size:12px;color:#666">${c.address?.city || 'Morocco'}</p>
              ${c.rating ? `<p style="font-size:12px">★ ${Number(c.rating).toFixed(1)}</p>` : ''}
              <a href="/centers/${c._id}" style="font-size:12px;color:#5BA4E6">View center →</a>
            </div>
          `;
          marker.bindPopup(popupHtml);
          marker.on('click', () => onCenterClick?.(c));
          markersLayerRef.current.addLayer(marker);
        });

        if (userLocation && !center) {
          bounds.extend([userLocation.lat, userLocation.lng]);
          L.circleMarker([userLocation.lat, userLocation.lng], {
            radius: 8,
            color: '#fff',
            weight: 2,
            fillColor: '#5BA4E6',
            fillOpacity: 1,
          })
            .bindPopup('Your location')
            .addTo(markersLayerRef.current);
        }

        if (items.length > 1 && bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }

        if (!cancelled) setLoading(false);
      } catch {
        if (!cancelled) {
          setError('Failed to load map');
          setLoading(false);
        }
      }
    };

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [centers, center, userLocation, zoom, onCenterClick]);

  if (error) {
    return (
      <div
        className={`bg-muted rounded-xl flex items-center justify-center text-muted-foreground text-sm ${className}`}
        style={{ height }}
      >
        {error}
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`} style={{ height }}>
      {loading && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center z-10">
          <span className="text-muted-foreground text-sm">Loading map...</span>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full z-0" />
    </div>
  );
};

export default OpenStreetMapView;
