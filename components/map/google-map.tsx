'use client'

import { useJsApiLoader, GoogleMap, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api'
import { memo, useState, useCallback, useEffect } from 'react'
import { MapPin } from 'lucide-react'

export interface LocationMarker {
  id: string | number;
  lat: number;
  lng: number;
  title?: string;
}

interface CustomGoogleMapProps {
  center: { lat: number, lng: number };
  zoom?: number;
  markers?: LocationMarker[];
  showDirections?: boolean;
  destination?: { lat: number, lng: number };
  onMarkerClick?: (id: string | number) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '400px',
  borderRadius: '0.75rem'
};

function CustomGoogleMapComponent({ 
  center, 
  zoom = 12, 
  markers = [], 
  showDirections = false, 
  destination, 
  onMarkerClick 
}: CustomGoogleMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map)
  }, [])

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null)
  }, [])

  useEffect(() => {
    if (isLoaded && showDirections && destination && map) {
      const directionsService = new google.maps.DirectionsService()
      directionsService.route(
        {
          origin: center,
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirections(result)
          }
        }
      )
    }
  }, [isLoaded, showDirections, destination, center, map])

  if (loadError) {
    return (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-100 rounded-xl text-red-500">
        <MapPin className="w-12 h-12 mb-2 opacity-50" />
        <p>Error loading Google Maps</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-xl animate-pulse">
        <MapPin className="w-12 h-12 mb-2 text-gray-300 animate-bounce" />
        <p className="text-gray-400 font-medium">Loading Map Data...</p>
      </div>
    )
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          {
            featureType: "poi",
            stylers: [{ visibility: "off" }]
          }
        ]
      }}
    >
      {!showDirections && markers.map((marker) => (
        <Marker 
          key={marker.id} 
          position={{ lat: marker.lat, lng: marker.lng }}
          title={marker.title}
          onClick={() => onMarkerClick && onMarkerClick(marker.id)}
        />
      ))}

      {showDirections && directions && (
        <DirectionsRenderer 
          directions={directions}
          options={{
            polylineOptions: {
              strokeColor: "#7C3AED", // Primary Purple
              strokeWeight: 5
            }
          }}
        />
      )}
    </GoogleMap>
  )
}

export const CustomGoogleMap = memo(CustomGoogleMapComponent);
