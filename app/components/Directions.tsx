import { BikeStation, fetchBikeStation } from "@/api/bikeStation";
import { fetchUserRentBike } from "@/api/rentBike";
import { StationData } from "@/api/sampleData";
import { useDebounce } from "@/utils/useDebounce.utils";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import RentUserBike from "./user/station/RentUserBike";
const THEME_COLOR = "#083A4C";

const { width } = Dimensions.get("window");

const Directions = () => {
  const mapRef = useRef<MapView>(null);
  const cardPositions = useRef<{ [key: string]: number }>({});

  const [openUserMapNavigation, setOpenUserMapNavigation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState<any>(null);
  const debouncedQuery = useDebounce(searchQuery, 500);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const router = useRouter();
  const {
    data: rentedBikeData,
    refetch: refetchRentedBikeData,
    isLoading: rentedBikeLoading,
  } = useQuery({
    queryKey: ["station-rented-bike"],
    queryFn: fetchUserRentBike,
  });
  const {
    data: bikeStationData,
    isFetching: isBikeStationLoading,
    refetch: researchBikeStation,
  } = useQuery({
    queryKey: ["station-data", debouncedQuery],
    queryFn: ({ queryKey }) => fetchBikeStation({ query: queryKey[1] }),
  });
  const station = StationData;
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        Alert.alert(
          "Permission denied",
          "Please enable location access in settings."
        );
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);
  const getDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const nearbyStations = useMemo(() => {
    if (!location || !bikeStationData) return [];
    return bikeStationData
      .map((station: any) => {
        const dist = getDistance(
          location.latitude,
          location.longitude,
          station.latitude,
          station.longitude
        );
        return { ...station, distance: dist };
      })
      .filter((station: any) => station.distance <= 500)
      .sort((a: any, b: any) => a.distance - b.distance);
  }, [location, bikeStationData]);

  const [selectedStation, setSelectedStation] = useState<BikeStation | null>(
    null
  );

  // Center behavior:
  // - If user hasn't rented a bike (rentedBikeData is null/undefined), center on nearest station
  // - If user has a rental, center on user's current location
  useEffect(() => {
    if (!location || !bikeStationData) return;

    if (!rentedBikeData) {
      const withDistance = bikeStationData
        .map((s: any) => ({
          ...s,
          distance: getDistance(
            location.latitude,
            location.longitude,
            s.latitude,
            s.longitude
          ),
        }))
        .sort((a: any, b: any) => a.distance - b.distance);

      const nearest = withDistance[0];
      if (nearest) {
        const { distance, ...rest } = nearest;
        setSelectedStation(rest as BikeStation);
        mapRef.current?.animateToRegion(
          {
            latitude: nearest.latitude,
            longitude: nearest.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          800
        );
      }
    } else {
      mapRef.current?.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        800
      );
    }
  }, [location, bikeStationData, rentedBikeData]);

  const selectedDistance = useMemo(() => {
    if (!selectedStation || !location) return null;
    return getDistance(
      location.latitude,
      location.longitude,
      selectedStation.latitude,
      selectedStation.longitude
    );
  }, [location, selectedStation]);

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <View style={{ padding: 0 }}>
      {/* Header Section */}
      <LinearGradient
        colors={["#083A4C", "#37A77D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          padding: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            Nearest Station
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/search")}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              View All
            </Text>
          </TouchableOpacity>
        </View>

        {/* Station Info Card */}
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 16,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "white",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 16,
            }}
          >
            <MaterialCommunityIcons
              name="map-marker"
              size={24}
              color="#37A77D"
            />
          </View>

          {selectedStation && (
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  fontWeight: "600",
                  marginBottom: 4,
                }}
              >
                {selectedStation?.stationName}
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 14,
                }}
              >
                {selectedStation?.stationLocation}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => {
              if (!rentedBikeData) {
                router.push("/(tabs)/search");
              } else {
                setOpenUserMapNavigation(true);
              }
            }}
            style={{
              backgroundColor: "#37A77D",
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Map Section */}
      <View
        style={{
          height: 200,
          backgroundColor: "#F8FAFC",
        }}
      >
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          showsUserLocation={true}
          showsMyLocationButton={false}
          initialRegion={{
            latitude: location?.latitude,
            longitude: location?.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Circle
            center={{
              latitude: location?.latitude,
              longitude: location?.longitude,
            }}
            radius={500}
            strokeWidth={2}
            strokeColor={THEME_COLOR}
            fillColor="rgba(8, 58, 76, 0.15)"
          />

          {nearbyStations.map((station: any) => (
            <Marker
              key={station._id}
              coordinate={{
                latitude: station.latitude,
                longitude: station.longitude,
              }}
              onPress={() => {
                setSelectedStation(station);
                const y = cardPositions.current[station._id];
              }}
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
                  color={
                    selectedStation?._id === station._id ? "#fff" : THEME_COLOR
                  }
                />
              </View>
            </Marker>
          ))}
        </MapView>
      </View>

      {/* Stats Footer */}
      <View
        style={{
          backgroundColor: "white",
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          paddingHorizontal: 20,
          paddingVertical: 16,
          flexDirection: "row",
          justifyContent: "space-around",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <View style={{ alignItems: "center", flex: 1 }}>
          <View
            style={{
              backgroundColor: "#37A77D20",
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons name="location-outline" size={20} color="#37A77D" />
          </View>
          <Text
            style={{
              fontSize: 12,
              color: "#6B7280",
              fontWeight: "500",
              marginBottom: 2,
            }}
          >
            Distance
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#083A4C",
              fontWeight: "bold",
            }}
          >
            {selectedDistance !== null ? formatDistance(selectedDistance) : "--"}
          </Text>
        </View>

        <View style={{ alignItems: "center", flex: 1 }}>
          <View
            style={{
              backgroundColor: "#083A4C20",
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons name="time-outline" size={20} color="#083A4C" />
          </View>
          <Text
            style={{
              fontSize: 12,
              color: "#6B7280",
              fontWeight: "500",
              marginBottom: 2,
            }}
          >
            ETA
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#083A4C",
              fontWeight: "bold",
            }}
          >
            2 min
          </Text>
        </View>

        <View style={{ alignItems: "center", flex: 1 }}>
          <View
            style={{
              backgroundColor: "#37A77D20",
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <MaterialCommunityIcons
              name="motorbike"
              size={20}
              color="#37A77D"
            />
          </View>
          <Text
            style={{
              fontSize: 12,
              color: "#6B7280",
              fontWeight: "500",
              marginBottom: 2,
            }}
          >
            Available
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#083A4C",
              fontWeight: "bold",
            }}
          >
            {station?.availability || "12"}
          </Text>
        </View>

        <View style={{ alignItems: "center", flex: 1 }}>
          <TouchableOpacity
            onPress={() => {
              if (!rentedBikeData) {
                router.push("/(tabs)/search");
              } else {
                setOpenUserMapNavigation(true);
              }
            }}
            style={{
              backgroundColor: "#37A77D",
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons name="navigate" size={20} color="white" />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 12,
              color: "#6B7280",
              fontWeight: "500",
              marginBottom: 2,
            }}
          >
            Navigate
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: "#37A77D",
              fontWeight: "600",
            }}
          >
            Go
          </Text>
        </View>
      </View>

      <RentUserBike
        visible={openUserMapNavigation}
        onClose={() => setOpenUserMapNavigation(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
  customMarker: {
    width: 30,
    height: 30,
    backgroundColor: "#fff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: THEME_COLOR,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedMarker: {
    backgroundColor: THEME_COLOR,
  },
  recenterButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    backgroundColor: "#fff",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default Directions;
