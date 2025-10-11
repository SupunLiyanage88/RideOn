import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export interface UseLocationReturn {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if location services are enabled
      const isLocationServiceEnabled = await Location.hasServicesEnabledAsync();
      if (!isLocationServiceEnabled) {
        setError('Location services are disabled. Please enable location services in your device settings.');
        setIsLoading(false);
        return;
      }

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Location permission not granted. Please allow location access to show local weather.');
        setIsLoading(false);
        return;
      }

      // Get current position with timeout
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        mayShowUserSettingsDialog: true,
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode to get city and country
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (reverseGeocode.length > 0) {
          const place = reverseGeocode[0];
          setLocation({
            latitude,
            longitude,
            city: place.city || place.subregion || place.region || 'Unknown',
            country: place.country || 'Unknown',
          });
        } else {
          setLocation({
            latitude,
            longitude,
            city: 'Unknown',
            country: 'Unknown',
          });
        }
      } catch (geocodeError) {
        // If reverse geocoding fails, still provide coordinates
        setLocation({
          latitude,
          longitude,
          city: 'Unknown',
          country: 'Unknown',
        });
      }
    } catch (locationError) {
      console.error('Location error:', locationError);
      setError('Failed to get location');
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async (): Promise<void> => {
    await getCurrentLocation();
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return {
    location,
    isLoading,
    error,
    refetch,
  };
};

export default useLocation;