import { BikeStation, fetchBikeStation } from "@/api/bikeStation";
import { useDebounce } from "@/utils/useDebounce.utils";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import Loader from "../components/Loader";
import SearchInput from "../components/SearchBarQuery";

const { height } = Dimensions.get("window");
const THEME_COLOR = "#083A4C";

const Search = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<BikeStation | null>(
    null
  );
  const mapRef = useRef<MapView>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const debouncedQuery = useDebounce(searchQuery, 500);
  const cardPositions = useRef<{ [key: string]: number }>({});

  const {
    data: bikeStationData,
    isFetching: isBikeStationLoading,
    refetch: researchBikeStation,
  } = useQuery({
    queryKey: ["station-data", debouncedQuery],
    queryFn: ({ queryKey }) => fetchBikeStation({ query: queryKey[1] }),
  });

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

  useEffect(() => {
    if (location) {
      mapRef.current?.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        800
      );
      return;
    }
  });

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const handleSearch = async (query: string) => {
    console.log("Searching for:", query);
    setSearchQuery(query);
    try {
      await researchBikeStation();
    } catch (error) {
      console.error("Search failed:", error);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="bicycle" size={28} color={THEME_COLOR} />
          <Text style={styles.headerTitle}>Nearby Stations</Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statBadge}>
            <Ionicons name="location" size={16} color={THEME_COLOR} />
            <Text style={[styles.statText, { color: THEME_COLOR }]}>
              500m radius
            </Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: THEME_COLOR }]}>
            <Text style={styles.countText}>{nearbyStations.length}</Text>
            <Text style={[styles.statText, { color: "#fff" }]}>stations</Text>
          </View>
        </View>
      </View>
      <View
        style={{
          marginTop: 5,
          marginBottom: 15,
          paddingHorizontal: 20,
        }}
      >
        <SearchInput
          placeholder="Search Stations..."
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          isSearching={isBikeStationLoading}
        />
      </View>
      {isBikeStationLoading && (
        <View style={{ padding: 24, marginBottom: 15 }}>
          <Loader textStyle={{ fontSize: 20 }} showText={false} />
        </View>
      )}

      <View style={styles.mapContainer}>
        {location ? (
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
              center={{
                latitude: location.latitude,
                longitude: location.longitude,
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
                  if (y !== undefined && scrollViewRef.current) {
                    scrollViewRef.current.scrollTo({ y, animated: true });
                  }
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
          </MapView>
        ) : null}

        <TouchableOpacity
          style={styles.recenterButton}
          onPress={() => {
            mapRef.current?.animateToRegion(
              {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              },
              800
            );
          }}
        >
          <Ionicons name="locate" size={24} color={THEME_COLOR} />
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {nearbyStations.length === 0
            ? null
            : nearbyStations.map((station: any, index: number) => (
                <TouchableOpacity
                  key={station._id}
                  style={[
                    styles.stationCard,
                    selectedStation?._id === station._id && styles.selectedCard,
                  ]}
                  onLayout={(event) => {
                    const { y } = event.nativeEvent.layout;
                    cardPositions.current[station._id] = y;
                  }}
                  onPress={() => {
                    setSelectedStation(station);
                    router.push({
                      pathname: "/station/[id]",
                      params: { id: station._id },
                    });
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardLeft}>
                    <View style={styles.numberBadge}>
                      <Text style={styles.numberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.stationInfo}>
                      <Text style={styles.stationName} numberOfLines={1}>
                        {station.stationName}
                      </Text>
                      <Text style={styles.stationLocation} numberOfLines={1}>
                        <Ionicons
                          name="location-outline"
                          size={12}
                          color="#64748b"
                        />{" "}
                        {station.stationLocation}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardRight}>
                    <View style={styles.distanceBadge}>
                      <Ionicons name="walk" size={14} color={THEME_COLOR} />
                      <Text
                        style={[styles.distanceText, { color: THEME_COLOR }]}
                      >
                        {formatDistance(station.distance)}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#cbd5e1"
                    />
                  </View>
                </TouchableOpacity>
              ))}
          <View style={{ marginBottom: 40 }}></View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    marginLeft: 12,
  },
  statsContainer: { flexDirection: "row", gap: 8 },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statText: { fontSize: 13, fontWeight: "600" },
  countText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  mapContainer: {
    height: height * 0.35,
    position: "relative",
    paddingHorizontal: 20,
  },
  map: { flex: 1 },
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
  listContainer: { flex: 1, backgroundColor: "#f8fafc" },
  listContent: { padding: 16, paddingBottom: 24 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginTop: 16,
  },
  emptySubtitle: { fontSize: 14, color: "#64748b", marginTop: 8 },
  stationCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCard: {
    borderColor: THEME_COLOR,
    backgroundColor: "#e6f2f5",
  },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 12 },
  numberBadge: {
    width: 32,
    height: 32,
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  numberText: { fontSize: 14, fontWeight: "700", color: "#475569" },
  stationInfo: { flex: 1 },
  stationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
  },
  stationLocation: { fontSize: 13, color: "#64748b" },
  cardRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f2f5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  distanceText: { fontSize: 13, fontWeight: "600" },
});

export default Search;
