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
  View
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { SafeAreaView } from "react-native-safe-area-context";
import DialogHeader from "../../DialogHeader";

const THEME_COLOR = "#083A4C";
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

type DialogProps = {
  visible: boolean;
  onClose: () => void;
};

// Add proper type for location
interface Coordinate {
  latitude: number;
  longitude: number;
}

const RentUserBike = ({ visible, onClose }: DialogProps) => {
  const mapRef = useRef<MapView | null>(null);
  const [location, setLocation] = useState<Coordinate | null>(null);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [distance, setDistance] = useState<any | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null
  );

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationError("Location permission denied");
          return;
        }
        
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        if (isMounted) {
          setLocation({
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
          });
          setLocationError(null);
        }
      } catch (error) {
        console.error("Error getting location:", error);
        if (isMounted) {
          setLocationError("Failed to get location");
        }
      }
    })();

    return () => {
      isMounted = false;
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
    };
  }, []);

  const { data: bikeStationData, isFetching: isBikeStationLoading } = useQuery({
    queryKey: ["station-data", debouncedQuery],
    queryFn: ({ queryKey }) => fetchBikeStation({ query: queryKey[1] }),
    enabled: visible, // Only fetch when modal is visible
  });

  useEffect(() => {
    const fetchDistance = async () => {
      if (location && selectedStation) {
        try {
          const dist = await getRouteDistance(
            { latitude: location.latitude, longitude: location.longitude },
            {
              latitude: selectedStation.latitude,
              longitude: selectedStation.longitude,
            }
          );
          setDistance(dist);
        } catch (error) {
          console.error("Error fetching distance:", error);
        }
      }
    };
    fetchDistance();
  }, [selectedStation, location]);

  const startNavigation = async () => {
    try {
      setIsNavigating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Location permission required for navigation");
        return;
      }

      // Stop any existing subscription
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 5,
          timeInterval: 1000,
        },
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ latitude, longitude });

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
    } catch (error) {
      console.error("Error starting navigation:", error);
      setIsNavigating(false);
    }
  };

  const stopNavigation = async () => {
    setIsNavigating(false);
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  };

  const handleClose = () => {
    stopNavigation();
    setSelectedStation(null);
    setDistance(null);
    onClose();
  };

  const handleStationSelect = (station: any) => {
    setSelectedStation(station);
    setIsNavigating(false);
    stopNavigation();
  };

  // Safe region for initial map render
  const getInitialRegion = () => {
    if (location) {
      return {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }
    
    // Fallback to a default location if user location not available
    return {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  };

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="slide"
      onRequestClose={handleClose}
    >
      <SafeAreaView edges={["left", "right"]} style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={{ marginTop: 15 }}>
            <DialogHeader
              title={"Route Pick"}
              onClose={handleClose}
              subtitle="Pick Your Ride On Station"
            />
          </View>

          <View style={styles.mapContainer}>
            {locationError ? (
              <View style={styles.centered}>
                <Text style={styles.errorText}>{locationError}</Text>
              </View>
            ) : !location ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color={THEME_COLOR} />
                <Text>Getting your location...</Text>
              </View>
            ) : (
              <>
                <MapView
                  ref={mapRef}
                  style={styles.map}
                  provider={PROVIDER_GOOGLE}
                  showsUserLocation={true}
                  followsUserLocation={isNavigating}
                  showsMyLocationButton={false}
                  initialRegion={getInitialRegion()}
                  onMapReady={() => console.log("Map ready")}
                >
                  {!isBikeStationLoading &&
                    bikeStationData?.map((station: any) => (
                      <Marker
                        key={station._id}
                        coordinate={{
                          latitude: station.latitude,
                          longitude: station.longitude,
                        }}
                        onPress={() => handleStationSelect(station)}
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

                  {selectedStation && location && (
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
                      onError={(errorMessage) => {
                        console.error("Directions error:", errorMessage);
                      }}
                    />
                  )}
                </MapView>

                <TouchableOpacity
                  style={styles.recenterButton}
                  onPress={() => {
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
                    }
                  }}
                >
                  <Ionicons name="locate" size={24} color={THEME_COLOR} />
                </TouchableOpacity>
              </>
            )}
          </View>

          {selectedStation && (
            <View style={styles.infoBox}>
              <View style={styles.stationCard}>
                <View>
                  <View style={styles.stationInfoDetails}>
                    <Text style={styles.stationName}>
                      {selectedStation.stationId}
                    </Text>
                    <Text style={styles.stationName}>
                      {selectedStation.stationName}
                    </Text>
                  </View>

                  <View style={styles.coinDetailItem}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Text>📍</Text>
                      <Text style={styles.detailLabel}>Available RC</Text>
                    </View>

                    <Text style={styles.detailValue}>
                      {distance?.distanceKm?.toFixed(2) || "0.00"} km
                    </Text>
                  </View>
                  <View style={styles.stationDetails}>
                    <View style={styles.detailItem}>
                      <View style={styles.iconContainer}>
                        <Text>📍</Text>
                      </View>
                      <View>
                        <Text style={styles.detailLabel}>Distance</Text>
                        <Text style={styles.detailValue}>
                          {distance?.distanceKm?.toFixed(2) || "0.00"} km
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailItem}>
                      <View style={styles.iconContainer}>
                        <Text>⏱️</Text>
                      </View>
                      <View>
                        <Text style={styles.detailLabel}>Duration</Text>
                        <Text style={styles.detailValue}>
                          {distance ? 
                            `${distance.ConvertedHours}h ${distance.ConvertedMinutes}min` : 
                            "Calculating..."
                          }
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {!isNavigating ? (
                <View style={{ marginBottom: 40 }}>
                  <TouchableOpacity
                    style={styles.navigateButton}
                    onPress={startNavigation}
                  >
                    <Ionicons name="navigate" size={18} color="#fff" />
                    <Text style={styles.navigateText}>Start Navigation</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.navigateButton,
                    { backgroundColor: "#D9534F" },
                  ]}
                  onPress={stopNavigation}
                >
                  <Ionicons name="compass" size={18} color="#fff" />
                  <Text style={styles.navigateText}>Stop Navigation</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default RentUserBike;

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
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#ddd",
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
  stationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingTop: 10,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 4,
    shadowColor: "#1a237e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  stationDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stationInfoDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0B4057",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: THEME_COLOR,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginRight: 6,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2e7d32",
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e8f5e8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  coinDetailItem: {
    margin: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: THEME_COLOR,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    margin: 16,
  },
});