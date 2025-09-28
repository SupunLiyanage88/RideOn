import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import MapView, { MapPressEvent, Marker } from "react-native-maps";

const MapPicker = ({
  value,
  onChange,
}: {
  value?: { latitude: number; longitude: number };
  onChange: (coords: { latitude: number; longitude: number }) => void;
}) => {
  const [coords, setCoords] = useState(value);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission denied", "Location access is required.");
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setCoords({ latitude, longitude });
        onChange({ latitude, longitude });

        mapRef.current?.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handlePress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setCoords({ latitude, longitude });
    onChange({ latitude, longitude });
  };

  return (
    <View>
      <View className="mb-4" />
      <View style={{ height: 200 }}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFillObject}
            region={{
              latitude: coords?.latitude || 6.9271,
              longitude: coords?.longitude || 79.8612,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onPress={handlePress}
            showsUserLocation={true}
          >
            {coords && <Marker coordinate={coords} />}
          </MapView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 12,
  },
});

export default MapPicker;
