import { useEffect, useRef, useState } from 'react';
import { getGoogleMapsApiKey, isGoogleMapsConfigured } from '../../utils/googleMaps';
import OpenStreetMapView from './OpenStreetMapView';

let mapsScriptPromise = null;

const loadGoogleMaps = (apiKey) => {
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (mapsScriptPromise) return mapsScriptPromise;

  mapsScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return mapsScriptPromise;
};

const GoogleMapImpl = ({
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
  const markersRef = useRef([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiKey = getGoogleMapsApiKey();
  const mapId = import.meta.env.VITE_GOOGLE_MAP_ID;

  useEffect(() => {
    let cancelled = false;

    const initMap = async () => {
      try {
        const maps = await loadGoogleMaps(apiKey);
        if (cancelled || !mapRef.current) return;

        const defaultCenter = center?.location?.coordinates
          ? { lat: center.location.coordinates[1], lng: center.location.coordinates[0] }
          : userLocation || { lat: 33.5731, lng: -7.5898 };

        const mapOptions = {
          center: defaultCenter,
          zoom: center ? 15 : zoom,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: true,
          fullscreenControl: true,
        };

        if (mapId?.trim()) {
          mapOptions.mapId = mapId.trim();
        }

        const map = new maps.Map(mapRef.current, mapOptions);
        mapInstanceRef.current = map;

        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        const items = center ? [center] : centers;

        items.forEach((c) => {
          if (!c.location?.coordinates) return;

          const position = {
            lat: c.location.coordinates[1],
            lng: c.location.coordinates[0],
          };

          const marker = new maps.Marker({
            map,
            position,
            title: c.name,
            animation: maps.Animation.DROP,
          });

          const infoContent = `
            <div style="padding:8px;max-width:220px">
              <strong>${c.name}</strong>
              <p style="margin:4px 0;font-size:12px;color:#666">${c.address?.city || 'Morocco'}</p>
              ${c.rating ? `<p style="font-size:12px">★ ${c.rating.toFixed(1)}</p>` : ''}
              <a href="/centers/${c._id}" style="font-size:12px;color:#5BA4E6">View center →</a>
            </div>
          `;

          const infoWindow = new maps.InfoWindow({ content: infoContent });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
            onCenterClick?.(c);
          });

          markersRef.current.push(marker);
        });

        if (userLocation && !center) {
          const userMarker = new maps.Marker({
            map,
            position: userLocation,
            title: 'Your location',
            icon: {
              path: maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#5BA4E6',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2,
            },
          });
          markersRef.current.push(userMarker);
        }

        if (items.length > 1 && items.some((c) => c.location?.coordinates)) {
          const bounds = new maps.LatLngBounds();
          items.forEach((c) => {
            if (c.location?.coordinates) {
              bounds.extend({
                lat: c.location.coordinates[1],
                lng: c.location.coordinates[0],
              });
            }
          });
          if (userLocation) bounds.extend(userLocation);
          map.fitBounds(bounds, { padding: 50 });
        }

        setLoading(false);
      } catch {
        if (!cancelled) {
          setError('Failed to load Google Maps');
          setLoading(false);
        }
      }
    };

    initMap();

    return () => {
      cancelled = true;
    };
  }, [apiKey, mapId, centers, center, userLocation, zoom, onCenterClick]);

  if (error) {
    return (
      <OpenStreetMapView
        centers={centers}
        center={center}
        userLocation={userLocation}
        height={height}
        zoom={zoom}
        onCenterClick={onCenterClick}
        className={className}
      />
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`} style={{ height }}>
      {loading && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center z-10">
          <span className="text-muted-foreground text-sm">Loading map...</span>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

const GoogleMapView = (props) => {
  if (!isGoogleMapsConfigured()) {
    return <OpenStreetMapView {...props} />;
  }

  return <GoogleMapImpl {...props} />;
};

export default GoogleMapView;
