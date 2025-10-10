import { fetchBikeStation } from "@/api/bikeStation";
import { fetchUserRentBike, saveRentBike } from "@/api/rentBike";
import UseCurrentUser from "@/hooks/useCurrentUser";
import { getRouteDistance } from "@/utils/distance.matrix.utils";
import { useDebounce } from "@/utils/useDebounce.utils";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { SafeAreaView } from "react-native-safe-area-context";
import ConfirmationModal from "../../ConfirmationModal";
import DialogHeader from "../../DialogHeader";
import SearchInput from "../../SearchBarQuery";

const THEME_COLOR = "#083A4C";
const RC_FEE_VALUE = 10;
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

type DialogProps = {
  visible: boolean;
  onClose: () => void;
  defaultBikeId?: String;
};

interface Coordinate {
  latitude: number;
  longitude: number;
}

const RentUserBike = ({ visible, onClose, defaultBikeId }: DialogProps) => {
  const mapRef = useRef<MapView | null>(null);
  const { user } = UseCurrentUser();
  const [location, setLocation] = useState<Coordinate | null>(null);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [distance, setDistance] = useState<any | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [navigationSet, setNavigationSet] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 500);

  const queryClient = useQueryClient();
  const { mutate: saveRentBikeMutation, isPending: savingRentBike } =
    useMutation({
      mutationFn: saveRentBike,

      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["current-user"] });
        queryClient.invalidateQueries({ queryKey: ["station-rented-bike"] });
        startNavigation();
        setDeleteDialogOpen(false);
      },
      onError: (data) => {
        alert("Bike Rent failed");
      },
    });
  const {
    data: rentedBikeData,
    refetch: refetchRentedBikeData,
    isLoading: rentedBikeLoading,
  } = useQuery({
    queryKey: ["station-rented-bike"],
    queryFn: fetchUserRentBike,
  });
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

  const {
    data: bikeStationData,
    isFetching: isBikeStationLoading,
    refetch: researchBikeStation,
  } = useQuery({
    queryKey: ["station-data", debouncedQuery],
    queryFn: ({ queryKey }) => fetchBikeStation({ query: queryKey[1] }),
  });

  console.log("Rented Bike Data:", rentedBikeData);
  useEffect(() => {
    const fetchDistance = async () => {
      if (location && (selectedStation || rentedBikeData)) {
        try {
          const destination = selectedStation
            ? {
                latitude: selectedStation.latitude,
                longitude: selectedStation.longitude,
              }
            : {
                latitude: rentedBikeData.latitude,
                longitude: rentedBikeData.longitude,
              };
          const dist = await getRouteDistance(
            {
              latitude: location.latitude,
              longitude: location.longitude,
            },
            destination
          );
          setDistance(dist);
        } catch (error) {
          console.error("Error fetching distance:", error);
        }
      }
    };
    fetchDistance();
  }, [selectedStation, location, rentedBikeData]);

  useEffect(() => {
    if (!selectedStation && location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        500
      );
    }
  }, [selectedStation, location]);

  const startNavigation = async () => {
    try {
      setDeleteDialogOpen(true);
      setIsNavigating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Location permission required for navigation");
        return;
      }

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
    if (isNavigating) {
      setSelectedStation(null);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleStationSelect = (station: any) => {
    setSelectedStation(station);
    setIsNavigating(false);
    stopNavigation();
  };

  const getInitialRegion = () => {
    if (location) {
      return {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    return {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    try {
      await researchBikeStation();
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const fitAllStations = () => {
    if (bikeStationData?.length > 0 && mapRef.current && !selectedStation) {
      const coordinates = bikeStationData.map((station: any) => ({
        latitude: station.latitude,
        longitude: station.longitude,
      }));

      if (location) {
        coordinates.push({
          latitude: location.latitude,
          longitude: location.longitude,
        });
      }

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, bottom: 100, left: 50, right: 50 },
        animated: true,
      });
    }
  };

  useEffect(() => {
    if (bikeStationData?.length > 0 && !selectedStation) {
      setTimeout(() => {
        fitAllStations();
      }, 500);
    }
  }, [bikeStationData, selectedStation]);

  const RC_FEE_ROUTE = Math.round(distance?.distanceKm * RC_FEE_VALUE);
  const shouldShowButton = RC_FEE_ROUTE > (user?.rc || 0);

  function saveBike(data: any) {
    const submitData = {
      ...data,
      bikeId: defaultBikeId,
      selectedStationId: data._id,
      expiresAt: distance?.durationSeconds,
      distance: distance?.distanceKm,
      duration: distance?.durationSeconds,
      latitude: data?.latitude,
      longitude: data?.longitude,
      rcPrice: RC_FEE_ROUTE,
    };
    saveRentBikeMutation(submitData);
    setNavigationSet(false);
    setSelectedStation(null);
  }
  const destination = selectedStation
    ? {
        latitude: selectedStation.latitude,
        longitude: selectedStation.longitude,
      }
    : rentedBikeData
      ? {
          latitude: rentedBikeData.latitude,
          longitude: rentedBikeData.longitude,
        }
      : undefined;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <SafeAreaView
        edges={["left", "right"]}
        style={{ flex: 1, marginTop: Platform.OS === "ios" ? 40 : 0 }}
      >
        <View style={styles.container}>
          <View style={{ marginTop: 15 }}>
            <DialogHeader
              title={"Pick Station"}
              onClose={handleClose}
              subtitle="Pick Your Ride On Station"
            />
          </View>

          {(selectedStation || !rentedBikeData) && (
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
          )}

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
                  onMapReady={() => {
                    if (!selectedStation) {
                      setTimeout(() => {
                        fitAllStations();
                      }, 1000);
                    }
                  }}
                >
                  {!isBikeStationLoading &&
                    bikeStationData?.map((station: any) => (
                      <Marker
                        key={station._id}
                        coordinate={{
                          latitude: station.latitude,
                          longitude: station.longitude,
                        }}
                        onPress={() => {
                          if (!isNavigating && !rentedBikeData) {
                            handleStationSelect(station);
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

                  {destination && location && (
                    <MapViewDirections
                      origin={location}
                      destination={destination}
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

                <TouchableOpacity
                  style={styles.fitAllButton}
                  onPress={fitAllStations}
                >
                  <Ionicons name="expand" size={20} color={THEME_COLOR} />
                  <Text style={styles.fitAllText}>Show All Stations</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {(selectedStation || rentedBikeData) && (
            <View style={styles.infoBox}>
              <View style={styles.stationCard}>
                <View>
                  {((!rentedBikeData && navigationSet) || selectedStation) && (
                    <View style={styles.coinDetailItem}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <View style={styles.iconContainer}>
                          <Text>🪙</Text>
                        </View>
                        <Text style={styles.detailLabel}>Available RC</Text>
                      </View>
                      <Text style={styles.basicChip}>{user?.rc} RC</Text>
                    </View>
                  )}
                  {((!rentedBikeData && navigationSet) || selectedStation) && (
                    <View style={styles.coinDetailItem}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <View style={styles.iconContainer}>
                          <Text>🪙</Text>
                        </View>
                        <Text style={styles.detailLabel}>RC Fee</Text>
                      </View>
                      <Text style={styles.basicChip}>
                        {RC_FEE_ROUTE || 0} RC
                      </Text>
                    </View>
                  )}
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
                          {distance
                            ? `${distance.ConvertedHours || 0}h ${distance.ConvertedMinutes || 0}min`
                            : "Calculating..."}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {rentedBikeData ? (
                <View style={{ marginBottom: 40 }}>
                  <TouchableOpacity
                    style={[
                      styles.navigateButtonWithoutStretch,
                      {
                        backgroundColor:
                          distance?.distanceKm < 3 ? "#D9534F" : "gray",
                      },
                    ]}
                    disabled={distance?.distanceKm > 3}
                    onPress={stopNavigation}
                  >
                    <Ionicons name="compass" size={18} color="#fff" />
                    <Text style={styles.navigateText}>Stop Navigation</Text>
                  </TouchableOpacity>
                  {rentedBikeData && (
                    <TouchableOpacity
                      style={[styles.navigateButtonWithoutStretch]}
                    >
                      <Ionicons name="warning" size={18} color="#fff" />
                      <Text style={styles.navigateText}>Add Obstacle</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : !isNavigating ? (
                !user?.rc || user.rc === 0 || shouldShowButton ? (
                  <View style={{ marginBottom: 40 }}>
                    <TouchableOpacity
                      style={[
                        styles.navigateButtonWithoutStretch,
                        { backgroundColor: "#D9534F" },
                      ]}
                    >
                      <Ionicons name="compass" size={18} color="#fff" />
                      <Text style={styles.navigateText}>Buy RC</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View
                    style={{
                      marginBottom: 40,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <TouchableOpacity
                      style={styles.navigateButton}
                      onPress={() => {
                        (setDeleteDialogOpen(true), setNavigationSet(true));
                      }}
                    >
                      <Ionicons name="navigate" size={18} color="#fff" />
                      <Text style={styles.navigateText}>Start Navigation</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.navigateButtonClose}
                      onPress={() => setSelectedStation(null)}
                    >
                      <Ionicons name="close" size={18} color="#fff" />
                      <Text style={styles.navigateText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )
              ) : null}
            </View>
          )}
        </View>

        {deleteDialogOpen && (
          <ConfirmationModal
            open={deleteDialogOpen}
            values={RC_FEE_ROUTE}
            title="Rent Bike Confirmation"
            content={
              <View
                style={{
                  backgroundColor: "#FFEDD5",
                  width: "100%",
                  borderRadius: 8,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: "#DC2626",
                }}
              >
                <Text style={{ color: "#4B5563" }}>
                  Are you sure you want to Rent This Bike?{"\n"}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MaterialIcons
                    name="warning-amber"
                    size={20}
                    color="orange"
                  />
                  <Text style={{ color: "#EF4444", fontWeight: "500" }}>
                    This action is not reversible.
                  </Text>
                </View>
              </View>
            }
            handleClose={() => setDeleteDialogOpen(false)}
            deleteFunc={async () => {
              saveBike(selectedStation);
            }}
            onSuccess={() => {}}
            handleReject={() => {}}
          />
        )}
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
    position: "relative",
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
  fitAllButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    elevation: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  fitAllText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "600",
    color: THEME_COLOR,
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
    flex: 1,
    alignSelf: "stretch",
  },
  navigateButtonClose: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "gray",
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 10,
    flex: 1,
    alignSelf: "stretch",
  },
  navigateButtonWithoutStretch: {
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
    marginTop: 4,
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
  basicChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 14,
    fontWeight: "700",
    color: "#2e7d32",
    backgroundColor: "#e8f5e9",
    borderWidth: 1,
    borderColor: "#c8e6c9",
    alignSelf: "flex-start",
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
    margin: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME_COLOR,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    margin: 16,
  },
});
