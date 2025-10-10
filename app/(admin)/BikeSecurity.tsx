import { fetchAllUsersRentBike } from "@/api/rentBike";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import haversine from "haversine-distance";
import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

const GOOGLE_MAPS_API_KEY = "AIzaSyBDLI8FJtPpOWZXhrPshg3Ux00ZPL5FPhc";
const THEME_COLOR = "#083A4C";

const MAX_DEVIATION_METERS = 150; // how far user can be from route (150m)

const BikeSecurity = () => {
  const mapRef = useRef<MapView>(null);
  const [routes, setRoutes] = useState<{ [key: string]: any[] }>({});

  const {
    data: rentedBikeData = [],
    refetch: refetchRentedBikeData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["station-rented-bike-all"],
    queryFn: fetchAllUsersRentBike,
    refetchInterval: 60000,
  });

  // 🚨 Check for deviation from route
  useEffect(() => {
    if (!rentedBikeData || rentedBikeData.length === 0) return;

    rentedBikeData.forEach((rental: any) => {
      const routeCoords = routes[rental._id];
      if (!routeCoords || routeCoords.length < 2) return;

      const userPos = {
        latitude: rental.userLatitude,
        longitude: rental.userLongitude,
      };

      // Find minimum distance from user to any segment of the route
      let minDist = Infinity;
      for (let i = 0; i < routeCoords.length - 1; i++) {
        const a = routeCoords[i];
        const b = routeCoords[i + 1];

        // Approximate by comparing user distance to segment ends
        const distToA = haversine(userPos, a);
        const distToB = haversine(userPos, b);
        minDist = Math.min(minDist, distToA, distToB);
      }

      if (minDist > MAX_DEVIATION_METERS) {
        Alert.alert(
          "⚠️ Off Route Detected",
          `User: ${rental.userId.userName}\nBike: ${rental.bikeId.bikeId}\nDeviation: ${(minDist / 1000).toFixed(2)} km`
        );
      }
    });
  }, [rentedBikeData, routes]);



  return (
    <View style={styles.container}>
      {/* Refresh control / refetch loader */}
      <View style={styles.topBar} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => refetchRentedBikeData()}
          disabled={isFetching}
        >
          <Text style={styles.refreshText}>{isFetching ? "Refreshing..." : "Refresh"}</Text>
        </TouchableOpacity>
      </View>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        initialRegion={{
          latitude: 7.2,
          longitude: 80.6,
          latitudeDelta: 2,
          longitudeDelta: 2,
        }}
      >
        {rentedBikeData.map((rental: any) => {
          const user = rental.userId;
          const station = rental.selectedStationId;

          const userLocation = {
            latitude: rental.userLatitude,
            longitude: rental.userLongitude,
          };
          const stationLocation = {
            latitude: rental.latitude,
            longitude: rental.longitude,
          };

          return (
            <React.Fragment key={rental._id}>
              <Marker coordinate={stationLocation}>
                <View style={[styles.marker, { backgroundColor: "#1E90FF" }]}>
                  <Ionicons name="bicycle" size={18} color="#fff" />
                </View>
              </Marker>

              <Marker coordinate={userLocation}>
                <View style={[styles.marker, { backgroundColor: "#2ECC71" }]}>
                  <Ionicons name="person" size={18} color="#fff" />
                </View>
              </Marker>

              {/* 🚴 Route */}
              <MapViewDirections
                origin={stationLocation}
                destination={userLocation}
                apikey={GOOGLE_MAPS_API_KEY}
                strokeWidth={3}
                strokeColor={THEME_COLOR}
                optimizeWaypoints
                onReady={(result) => {
                  setRoutes((prev) => ({
                    ...prev,
                    [rental._id]: result.coordinates,
                  }));
                }}
                onError={(err) =>
                  console.log("Direction Error for", user.userName, err)
                }
              />
            </React.Fragment>
          );
        })}
      </MapView>
    </View>
  );
};

export default BikeSecurity;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    padding: 6,
    borderRadius: 20,
  },
  topBar: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    zIndex: 100,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  refreshBtn: {
    backgroundColor: "rgba(8,58,76,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  refreshText: {
    color: "#fff",
    fontWeight: "600",
  },
});
