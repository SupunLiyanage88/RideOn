import { fetchBikeStation } from "@/api/bikeStation";
import { getRouteDistance } from "@/utils/distance.matrix.utils";
import { useDebounce } from "@/utils/useDebounce.utils";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import DialogHeader from "../../DialogHeader";

const THEME_COLOR = "#083A4C";
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

type DialogProps = {
  visible: boolean;
  onClose: () => void;
};

const RentUserBike = ({ visible, onClose }: DialogProps) => {
  const mapRef = useRef<MapView | null>(null);
  const [location, setLocation] = useState<any>(null);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const debouncedQuery = useDebounce(searchQuery, 500);

  // --- Fetch current location ---
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const current = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
    })();

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  // --- Fetch stations ---
  const {
    data: bikeStationData,
    isFetching: isBikeStationLoading,
  } = useQuery({
    queryKey: ["station-data", debouncedQuery],
    queryFn: ({ queryKey }) => fetchBikeStation({ query: queryKey[1] }),
  });

  // --- Calculate distance when station selected ---
  useEffect(() => {
    const fetchDistance = async () => {
      if (location && selectedStation) {
        const dist = await getRouteDistance(
          { latitude: location.latitude, longitude: location.longitude },
          {
            latitude: selectedStation.latitude,
            longitude: selectedStation.longitude,
          }
        );
        setDistance(dist);
      }
    };
    fetchDistance();
  }, [selectedStation, location]);

  // --- Start Navigation (real-time location tracking) ---
  const startNavigation = async () => {
    setIsNavigating(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Highest,
        distanceInterval: 5, // Update every 5 meters
      },
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });

        // Keep map camera following the user smoothly
        mapRef.current?.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          },
          1000
        );
      }
    );
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  };

  if (!location) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={THEME_COLOR} />
        <Text>Getting current location...</Text>
      </View>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        <DialogHeader title={"Route Pick"} onClose={onClose} />

        {/* --- MAP VIEW --- */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            showsUserLocation={true}
            followsUserLocation={isNavigating}
            showsMyLocationButton={false}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Circle
              center={location}
              radius={500}
              strokeWidth={2}
              strokeColor={THEME_COLOR}
              fillColor="rgba(8, 58, 76, 0.15)"
            />

            {!isBikeStationLoading &&
              bikeStationData?.map((station: any) => (
                <Marker
                  key={station._id}
                  coordinate={{
                    latitude: station.latitude,
                    longitude: station.longitude,
                  }}
                  onPress={() => {
                    setSelectedStation(station);
                    setIsNavigating(false);
                    stopNavigation();
                  }}
                >
                  <View
                    style={[
                      styles.customMarker,
                      selectedStation?._id === station._id &&
                        styles.selectedMarker,
                    ]}
                  >
                    <Ionicons
                      name="bicycle"
                      size={20}
                      color={
                        selectedStation?._id === station._id
                          ? "#fff"
                          : THEME_COLOR
                      }
                    />
                  </View>
                </Marker>
              ))}

            {selectedStation && (
              <MapViewDirections
                origin={location}
                destination={{
                  latitude: selectedStation.latitude,
                  longitude: selectedStation.longitude,
                }}
                apikey={GOOGLE_MAPS_API_KEY}
                strokeWidth={4}
                strokeColor={THEME_COLOR}
                optimizeWaypoints={true}
                onReady={(result) => {
                  mapRef.current?.fitToCoordinates(result.coordinates, {
                    edgePadding: {
                      top: 100,
                      bottom: 100,
                      left: 50,
                      right: 50,
                    },
                    animated: true,
                  });
                }}
              />
            )}
          </MapView>

          {/* --- Recenter --- */}
          <TouchableOpacity
            style={styles.recenterButton}
            onPress={() =>
              mapRef.current?.animateToRegion(
                {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                },
                800
              )
            }
          >
            <Ionicons name="locate" size={24} color={THEME_COLOR} />
          </TouchableOpacity>
        </View>

        {/* --- Station Info + Navigation Buttons --- */}
        {selectedStation && (
          <View style={styles.infoBox}>
            <Text style={styles.stationName}>{selectedStation.name}</Text>
            <Text style={styles.stationDistance}>
              Distance: {distance?.toFixed(2)} km
            </Text>

            {!isNavigating ? (
              <TouchableOpacity
                style={styles.navigateButton}
                onPress={startNavigation}
              >
                <Ionicons name="navigate" size={18} color="#fff" />
                <Text style={styles.navigateText}>Start Navigation</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.navigateButton, { backgroundColor: "#D9534F" }]}
                onPress={stopNavigation}
              >
                <Ionicons name="stop-circle" size={18} color="#fff" />
                <Text style={styles.navigateText}>Stop Navigation</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
};

export default RentUserBike;

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  recenterButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 10,
    elevation: 5,
  },
  customMarker: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: THEME_COLOR,
    borderRadius: 20,
    padding: 6,
  },
  selectedMarker: {
    backgroundColor: THEME_COLOR,
  },
  infoBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  stationName: {
    fontSize: 16,
    fontWeight: "bold",
    color: THEME_COLOR,
  },
  stationDistance: {
    fontSize: 14,
    color: "#555",
  },
  navigateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME_COLOR,
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 10,
  },
  navigateText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
  },
});
