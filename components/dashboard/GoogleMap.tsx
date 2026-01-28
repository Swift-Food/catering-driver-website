"use client";

import { useEffect, useRef, useState, useMemo } from "react";
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

interface GoogleMapProps {
  latitude: number;
  longitude: number;
  className?: string;
}

export default function GoogleMap({
  latitude,
  longitude,
  className = "",
}: GoogleMapProps) {
  const { isDarkMode } = useTheme();
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const hasValidCoordinates = useMemo(() => {
    const lat = Number(latitude);
    const lng = Number(longitude);
    return !isNaN(lat) && !isNaN(lng) && !(lat === 0 && lng === 0);
  }, [latitude, longitude]);

  useEffect(() => {
    if (!hasValidCoordinates) {
      setIsLoading(false);
      return;
    }

    const initMap = async () => {
      try {
        await loadGoogleMapsScript();
        await new Promise((resolve) => setTimeout(resolve, 100));
        if (!mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          styles: isDarkMode ? DARK_STYLES : LIGHT_STYLES,
        });
        mapInstanceRef.current = map;

        const marker = new google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map,
          animation: google.maps.Animation.DROP,
        });
        markerRef.current = marker;

        setIsLoading(false);
      } catch {
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      if (markerRef.current) markerRef.current.setMap(null);
    };
  }, [latitude, longitude, hasValidCoordinates, isDarkMode]);

  const handleClick = () => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
      "_blank"
    );
  };

  if (!hasValidCoordinates) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-xl cursor-pointer group ${className}`}
      onClick={handleClick}
      title="Open in Google Maps"
    >
      <div ref={mapRef} className="h-full w-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-variant">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      <div className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-1 text-[9px] font-bold text-white uppercase tracking-widest opacity-0 transition-opacity group-hover:opacity-100">
        Open in Maps
      </div>
    </div>
  );
}
