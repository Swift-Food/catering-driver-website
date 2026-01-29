"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMapsScript } from "@/lib/google-maps-loader";
import { useTheme } from "@/lib/theme";

const DARK_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: "all", elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { featureType: "all", elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#283d6a" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
];

const LIGHT_STYLES: google.maps.MapTypeStyle[] = [];

export interface MapPin {
  latitude: number;
  longitude: number;
  label?: string;
  address?: string;
  color: "red" | "green" | "blue" | "pink" | "purple" | "orange";
}

interface GoogleMapProps {
  pins: MapPin[];
  className?: string;
}

const PIN_URLS: Record<MapPin["color"], string> = {
  red: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  green: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  blue: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  pink: "https://maps.google.com/mapfiles/ms/icons/pink-dot.png",
  purple: "https://maps.google.com/mapfiles/ms/icons/purple-dot.png",
  orange: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png",
};

export default function GoogleMap({ pins, className = "" }: GoogleMapProps) {
  const { isDarkMode } = useTheme();
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const validPins = pins.filter((p) => {
    const lat = Number(p.latitude);
    const lng = Number(p.longitude);
    return !isNaN(lat) && !isNaN(lng) && !(lat === 0 && lng === 0);
  });

  useEffect(() => {
    if (validPins.length === 0) {
      setIsLoading(false);
      return;
    }

    const initMap = async () => {
      try {
        await loadGoogleMapsScript();
        await new Promise((resolve) => setTimeout(resolve, 100));
        if (!mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: validPins[0].latitude, lng: validPins[0].longitude },
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          gestureHandling: "cooperative",
          styles: isDarkMode ? DARK_STYLES : LIGHT_STYLES,
        });
        mapInstanceRef.current = map;

        const bounds = new google.maps.LatLngBounds();
        const infoWindow = new google.maps.InfoWindow();

        const newMarkers = validPins.map((pin) => {
          const position = { lat: pin.latitude, lng: pin.longitude };
          bounds.extend(position);

          const marker = new google.maps.Marker({
            position,
            map,
            icon: PIN_URLS[pin.color],
            animation: google.maps.Animation.DROP,
          });

          if (pin.label || pin.address) {
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${pin.latitude},${pin.longitude}`;
            const content = `
              <div style="padding:4px 2px;min-width:140px;">
                ${pin.label ? `<div style="font-weight:700;font-size:12px;color:#111;margin-bottom:2px;">${pin.label}</div>` : ""}
                ${pin.address ? `<div style="font-size:11px;color:#666;margin-bottom:6px;">${pin.address}</div>` : ""}
                <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;font-size:11px;font-weight:600;color:#1a73e8;text-decoration:none;">Open in Google Maps &rarr;</a>
              </div>
            `;

            marker.addListener("click", () => {
              infoWindow.setContent(content);
              infoWindow.open(map, marker);
            });
          }

          return marker;
        });


        markersRef.current = newMarkers;

        if (validPins.length > 1) {
          map.fitBounds(bounds, 100);
        }

        setIsLoading(false);
      } catch {
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, [validPins.length, isDarkMode]);

  if (validPins.length === 0) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-xl group ${className}`}
    >
      <div ref={mapRef} className="h-full w-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-variant">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
}
