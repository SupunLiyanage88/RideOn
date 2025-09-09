import { useRef, useState } from "react";
import { View } from "react-native";
import GooglePlacesTextInput from "react-native-google-places-textinput";
import MapView, { MapPressEvent, Marker } from "react-native-maps";

const MapPicker = ({
  value,
  onChange,
}: {
  value?: { latitude: number; longitude: number };
  onChange: (coords: { latitude: number; longitude: number }) => void;
}) => {
  const [coords, setCoords] = useState(value);
  const mapRef = useRef<MapView>(null);

  const handlePress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setCoords({ latitude, longitude });
    onChange({ latitude, longitude });
  };
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const handlePlaceSelect = async (place: any) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.placeId}&key=${apiKey}`
      );
      const data = await res.json();
      const location = data.result.geometry.location;
      if (location) {
        const newCoords = { latitude: location.lat, longitude: location.lng };
        setCoords(newCoords);
        onChange(newCoords);

        mapRef.current?.animateToRegion(
          {
            ...newCoords,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          500
        );
      }
    } catch (err) {
      console.error("Failed to fetch place details:", err);
    }
  };

  return (
    <View>
      <View className="mb-4">
        <GooglePlacesTextInput
          apiKey={apiKey}
          onPlaceSelect={handlePlaceSelect}
          placeHolderText="Search for a location"
          showLoadingIndicator={true}
        />
      </View>
      <MapView
        ref={mapRef}
        style={{ height: 200, borderRadius: 12 }}
        region={{
          latitude: coords?.latitude || 6.9271,
          longitude: coords?.longitude || 79.8612,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={handlePress}
      >
        {coords && <Marker coordinate={coords} />}
      </MapView>
    </View>
  );
};

export default MapPicker;
