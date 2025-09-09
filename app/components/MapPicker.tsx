import { useRef, useState } from "react";
import { View } from "react-native";
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

  return (
    <View>
      <View className="mb-4"></View>
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
