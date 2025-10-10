import { fetchAllUsersRentBike } from "@/api/rentBike";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import haversine from "haversine-distance";
import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

const GOOGLE_MAPS_API_KEY = "AIzaSyBDLI8FJtPpOWZXhrPshg3Ux00ZPL5FPhc";
const THEME_COLOR = "#083A4C";

// 🚨 Set maximum deviation to 1 km
const MAX_DEVIATION_METERS = 300;

const BikeSecurity = () => {
  const mapRef = useRef<MapView>(null);
  const [routes, setRoutes] = useState<{ [key: string]: any[] }>({});
  const alertedBikes = useRef<Set<string>>(new Set()); // prevent repeated alerts

  const {
    data: rentedBikeData = [],
    refetch: refetchRentedBikeData,
    isFetching,
  } = useQuery({
    queryKey: ["station-rented-bike-all"],
    queryFn: fetchAllUsersRentBike,
    refetchInterval: 60000, // every 60s
  });

  console.log("Rented Bikes Data:", rentedBikeData);

  // 🚨 Detect deviation from route
  useEffect(() => {
    if (!rentedBikeData || rentedBikeData.length === 0) return;

    rentedBikeData.forEach((rental: any) => {
      const routeCoords = routes[rental._id];
      if (!routeCoords || routeCoords.length < 2) return;

      const userPos = {
        latitude: rental.userLatitude,
        longitude: rental.userLongitude,
      };

      let minDist = Infinity;
      for (let i = 0; i < routeCoords.length - 1; i++) {
        const start = routeCoords[i];
        const end = routeCoords[i + 1];
        const mid = {
          latitude: (start.latitude + end.latitude) / 2,
          longitude: (start.longitude + end.longitude) / 2,
        };
        const dist = haversine(userPos, mid);
        if (dist < minDist) minDist = dist;
      }

      // 🚨 If user is >1km away from route
      if (minDist > MAX_DEVIATION_METERS && !alertedBikes.current.has(rental._id)) {
        alertedBikes.current.add(rental._id);
        Alert.alert(
          "🚨 Theft Alert",
          `User: ${rental.userId.userName}\nBike: ${rental.bikeId.bikeId}\nDeviation: ${(minDist / 1000).toFixed(2)} km`
        );
      }
    });
  }, [rentedBikeData, routes]);

  return (
    <View style={styles.container}>
      {/* 🔄 Refresh Button */}
      <View style={styles.topBar} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => refetchRentedBikeData()}
          disabled={isFetching}
        >
          <Text style={styles.refreshText}>
            {isFetching ? "Refreshing..." : "Refresh"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 🗺️ Map View */}
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

          // From where the bike started
          const fromLocation = {
            latitude: rental.fromLatitude,
            longitude: rental.fromLongitude,
          };

          // Station assigned to the user
          const stationLocation = {
            latitude: rental.latitude,
            longitude: rental.longitude,
          };

          // Current user position
          const userLocation = {
            latitude: rental.userLatitude,
            longitude: rental.userLongitude,
          };

          return (
            <React.Fragment key={rental._id}>
              {/* 📍 Station Marker */}
              <Marker coordinate={stationLocation}>
                <View style={[styles.marker, { backgroundColor: "#1E90FF" }]}>
                  <Ionicons name="bicycle" size={18} color="#fff" />
                </View>
                <Callout style={styles.callout}>
                  <View style={styles.calloutContent}>
                    <Text style={styles.calloutTitle}>Station Details</Text>
                    <Text style={styles.calloutText}>
                      <Text style={styles.calloutLabel}>Station ID: </Text>
                      {station?.stationId || "N/A"}
                    </Text>
                    <Text style={styles.calloutText}>
                      <Text style={styles.calloutLabel}>Name: </Text>
                      {station?.stationName || "Unknown Station"}
                    </Text>
                    <Text style={styles.calloutText}>
                      <Text style={styles.calloutLabel}>Location: </Text>
                      {station?.stationLocation || "N/A"}
                    </Text>
                  </View>
                </Callout>
              </Marker>

              <Marker coordinate={fromLocation}>
                <View style={[styles.marker, { backgroundColor: "#1E90FF" }]}>
                  <Ionicons name="bicycle" size={18} color="#fff" />
                </View>
                <Callout style={styles.callout}>
                  <View style={styles.calloutContent}>
                    <Text style={styles.calloutTitle}>Station Details</Text>
                    <Text style={styles.calloutText}>
                      <Text style={styles.calloutLabel}>Station ID: </Text>
                      {station?.stationId || "N/A"}
                    </Text>
                    <Text style={styles.calloutText}>
                      <Text style={styles.calloutLabel}>Name: </Text>
                      {station?.stationName || "Unknown Station"}
                    </Text>
                    <Text style={styles.calloutText}>
                      <Text style={styles.calloutLabel}>Location: </Text>
                      {station?.fromLocation || "N/A"}
                    </Text>
                  </View>
                </Callout>
              </Marker>

              {/* 👤 User Marker */}
              <Marker coordinate={userLocation}>
                <View style={[styles.marker, { backgroundColor: "#2ECC71" }]}>
                  <Ionicons name="person" size={18} color="#fff" />
                </View>
                <Callout style={styles.callout}>
                  <View style={styles.calloutContent}>
                    <Text style={styles.calloutTitle}>User Details</Text>
                    <Text style={styles.calloutText}>
                      <Text style={styles.calloutLabel}>Name: </Text>
                      {user.userName}
                    </Text>
                    <Text style={styles.calloutText}>
                      <Text style={styles.calloutLabel}>Email: </Text>
                      {user.email}
                    </Text>
                    <Text style={styles.calloutText}>
                      <Text style={styles.calloutLabel}>Bike ID: </Text>
                      {rental.bikeId.bikeId}
                    </Text>
                    <Text style={styles.calloutText}>
                      <Text style={styles.calloutLabel}>Station: </Text>
                      {station?.stationName || "Unknown"}
                    </Text>
                  </View>
                </Callout>
              </Marker>

              {/* 🛣️ Route Path */}
              <MapViewDirections
                origin={fromLocation}
                destination={stationLocation}
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
  callout: {
    minWidth: 250,
    padding: 0,
  },
  calloutContent: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: THEME_COLOR,
    marginBottom: 8,
    textAlign: "center",
  },
  calloutText: {
    fontSize: 12,
    color: "#333",
    marginBottom: 4,
    lineHeight: 16,
  },
  calloutLabel: {
    fontWeight: "600",
    color: THEME_COLOR,
  },
});
