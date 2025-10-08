import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

const THEME_COLOR = "#083A4C";
const GOOGLE_MAPS_APIKEY = "YOUR_GOOGLE_MAPS_API_KEY"; // ← Replace this

// --- Fetch bike stations ---
async function fetchBikeStation({ query }: { query?: string }) {
  const response = await fetch(`https://your-api-url.com/stations?query=${query || ""}`);
  return response.json();
}

// --- Distance calculator ---
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const RentUserBike = () => {
  const mapRef = useRef<MapView | null>(null);
  const [location, setLocation] = useState<any>(null);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [distance, setDistance] = useState<number | null>(null);

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
  }, []);

  // --- Fetch stations ---
  const {
    data: bikeStationData,
    isFetching: isBikeStationLoading,
  } = useQuery({
    queryKey: ["station-data"],
    queryFn: ({ queryKey }) => fetchBikeStation({ query: queryKey[1] }),
  });

  // --- Calculate distance when selected ---
  useEffect(() => {
    if (location && selectedStation) {
      const dist = getDistance(
        location.latitude,
        location.longitude,
        selectedStation.latitude,
        selectedStation.longitude
      );
      setDistance(dist / 1000); // convert to km
    }
  }, [selectedStation, location]);

  if (!location) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={THEME_COLOR} />
        <Text>Getting current location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          showsUserLocation={true}
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
                onPress={() => setSelectedStation(station)}
              >
                <View
                  style={[
                    styles.customMarker,
                    selectedStation?._id === station._id && styles.selectedMarker,
                  ]}
                >
                  <Ionicons
                    name="bicycle"
                    size={20}
                    color={selectedStation?._id === station._id ? "#fff" : THEME_COLOR}
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
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={4}
              strokeColor={THEME_COLOR}
              onReady={(result) => {
                mapRef.current?.fitToCoordinates(result.coordinates, {
                  edgePadding: { top: 100, bottom: 100, left: 50, right: 50 },
                  animated: true,
                });
              }}
            />
          )}
        </MapView>

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

      {selectedStation && (
        <View style={styles.infoBox}>
          <Text style={styles.stationName}>{selectedStation.name}</Text>
          <Text style={styles.stationDistance}>
            Distance: {distance?.toFixed(2)} km
          </Text>
        </View>
      )}
    </View>
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
});
