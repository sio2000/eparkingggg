import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useParkingStore } from '../store/parkingStore';
import { icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../utils/translations';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

const DEFAULT_CENTER = { lat: 51.505, lng: -0.09 };
const DEFAULT_ZOOM = 13;

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Custom marker icons
const redMarkerIcon = icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const blueMarkerIcon = icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function LocationMarker() {
  const userLocation = useParkingStore((state) => state.userLocation);
  const map = useMap();

  React.useEffect(() => {
    if (userLocation) {
      map.flyTo(
        [userLocation.latitude, userLocation.longitude],
        map.getZoom()
      );
    }
  }, [userLocation, map]);

  return userLocation ? (
    <Marker
      position={[userLocation.latitude, userLocation.longitude]}
      icon={blueMarkerIcon}
    >
      <Popup>You are here</Popup>
    </Marker>
  ) : null;
}

export function Map() {
  const { user } = useAuthStore();
  const spots = useParkingStore((state) => state.spots);
  const userLocation = useParkingStore((state) => state.userLocation);
  const selectedDistance = useParkingStore((state) => state.selectedDistance);
  const setSelectedSpot = useParkingStore((state) => state.setSelectedSpot);
  const setUserLocation = useParkingStore((state) => state.setUserLocation);
  const { language } = useLanguageStore();
  const t = translations[language];
  const [sharedSpots, setSharedSpots] = React.useState([]);

  // Initialize user location and fetch shared spots
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(location);
          
          // Fetch nearby spots when location is available
          await fetchNearbySpots(location);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [setUserLocation]);

  // Function to fetch nearby spots
  const fetchNearbySpots = async (location) => {
    try {
      const { data, error } = await supabase
        .from('parking_spots')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      // Filter spots by distance
      const nearbySpots = data.filter(spot => {
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          spot.latitude,
          spot.longitude
        );
        return distance <= selectedDistance;
      });

      setSharedSpots(nearbySpots);
    } catch (err) {
      console.error('Error fetching spots:', err);
    }
  };

  // Function to share location
  const handleShareLocation = async () => {
    if (!userLocation || !user) return;

    try {
      const { error } = await supabase
        .from('parking_spots')
        .insert({
          user_id: user.id,
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          user_email: user.email,
          is_active: true
        });

      if (error) throw error;

      // Refresh spots after sharing
      await fetchNearbySpots(userLocation);
    } catch (err) {
      console.error('Error sharing location:', err);
    }
  };

  const handleSpotClick = (spot: ParkingSpot) => {
    setSelectedSpot(spot);
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${spot.latitude},${spot.longitude}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Watermark */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 
        bg-black/60 backdrop-blur-sm rounded-lg shadow-lg
        transition-all duration-300 hover:bg-black/70 group"
      >
        <div className="flex items-center gap-2">
          <span className="text-white/90 text-base font-medium whitespace-nowrap
            transition-all duration-300 group-hover:text-white"
          >
            {t.mapWatermark}
          </span>
        </div>
      </div>

      <MapContainer
        center={[userLocation?.latitude || DEFAULT_CENTER.lat, userLocation?.longitude || DEFAULT_CENTER.lng]}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
        
        {/* Render shared spots */}
        {sharedSpots.map((spot) => (
          <Marker
            key={spot.id}
            position={[spot.latitude, spot.longitude]}
            icon={redMarkerIcon}
            eventHandlers={{
              click: () => handleSpotClick(spot),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">
                  {spot.user_email ? `${spot.user_email}'s Spot` : `Spot ${spot.id.slice(-6)}`}
                </h3>
                {userLocation && (
                  <p className="text-sm text-gray-600 mt-1">
                    Distance: {calculateDistance(
                      userLocation.latitude,
                      userLocation.longitude,
                      spot.latitude,
                      spot.longitude
                    ).toFixed(1)} km
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <button
        onClick={handleShareLocation}
        className="absolute bottom-4 right-4 z-[1000] bg-blue-600 text-white px-4 py-2 rounded-lg
          hover:bg-blue-700 transition-colors duration-200 shadow-lg"
      >
        {t.shareLocation}
      </button>
    </div>
  );
}