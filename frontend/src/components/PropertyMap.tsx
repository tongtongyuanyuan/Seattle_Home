'use client';

import { useEffect, useRef, useState } from 'react';
import { OpenHouse } from '@/lib/api';

interface PropertyMapProps {
  openHouses: OpenHouse[];
  onSelectProperty?: (openHouse: OpenHouse) => void;
}

declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

export default function PropertyMap({ openHouses, onSelectProperty }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Load Google Maps script
  useEffect(() => {
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') return;

    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Cleanup markers on unmount
      markersRef.current.forEach(marker => marker.setMap(null));
    };
  }, [apiKey]);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google) return;

    const newMap = new window.google.maps.Map(mapRef.current, {
      center: { lat: 47.6062, lng: -122.3321 }, // Seattle center
      zoom: 10,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    setMap(newMap);
  }, [isLoaded]);

  // Add markers for properties
  useEffect(() => {
    if (!map || !window.google || openHouses.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const geocoder = new window.google.maps.Geocoder();
    const bounds = new window.google.maps.LatLngBounds();

    openHouses.forEach((house) => {
      geocoder.geocode({ address: house.address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          bounds.extend(location);

          const marker = new window.google.maps.Marker({
            map,
            position: location,
            title: house.address,
            icon: {
              url: 'data:image/svg+xml,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
                  <path fill="#2563eb" d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z"/>
                  <circle fill="white" cx="16" cy="16" r="8"/>
                  <text x="16" y="20" text-anchor="middle" fill="#2563eb" font-size="12" font-weight="bold">${house.id}</text>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(32, 40),
            },
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; max-width: 250px;">
                <h3 style="font-weight: bold; margin-bottom: 4px; font-size: 14px;">${house.address}</h3>
                <p style="color: #16a34a; font-weight: bold; margin-bottom: 4px;">$${house.price?.toLocaleString() || 'Price TBD'}</p>
                <p style="color: #666; font-size: 12px; margin-bottom: 4px;">${house.open_house_time}</p>
                <p style="color: #666; font-size: 12px;">${house.notes}</p>
              </div>
            `,
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
            if (onSelectProperty) {
              onSelectProperty(house);
            }
          });

          markersRef.current.push(marker);

          // Fit bounds after all markers are added
          if (markersRef.current.length === openHouses.length) {
            map.fitBounds(bounds);
            // Don't zoom in too much
            const listener = window.google.maps.event.addListener(map, 'idle', () => {
              if (map.getZoom()! > 14) map.setZoom(14);
              window.google.maps.event.removeListener(listener);
            });
          }
        }
      });
    });
  }, [map, openHouses, onSelectProperty]);

  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-500">
          Map requires Google Maps API key.
          <br />
          <span className="text-sm">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local</span>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div ref={mapRef} className="w-full h-96" />
    </div>
  );
}
