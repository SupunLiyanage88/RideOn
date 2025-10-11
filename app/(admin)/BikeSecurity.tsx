import { fetchAllUsersRentBike } from "@/api/rentBike";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import haversine from "haversine-distance";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

const GOOGLE_MAPS_API_KEY = "AIzaSyBDLI8FJtPpOWZXhrPshg3Ux00ZPL5FPhc";
const THEME_COLOR = "#083A4C";
const WARNING_COLOR = "#FF4757";
const SUCCESS_COLOR = "#2ED573";
const SECONDARY_COLOR = "#1E90FF";
const ACCENT_COLOR = "#FF6B81";
const NEUTRAL_COLOR = "#F1F2F6";

const MAX_DEVIATION_METERS = 1000;
const { width, height } = Dimensions.get("window");

interface DeviationInfo {
  userId: string;
  deviation: number;
  timestamp: Date;
}

const BikeSecurity = () => {
  const mapRef = useRef<MapView>(null);
  const [routes, setRoutes] = useState<{ [key: string]: any[] }>({});
  const [deviations, setDeviations] = useState<{
    [key: string]: DeviationInfo;
  }>({});
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [userToContact, setUserToContact] = useState<any>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const {
    data: rentedBikeData = [],
    refetch: refetchRentedBikeData,
    isFetching,
  } = useQuery({
    queryKey: ["station-rented-bike-all"],
    queryFn: fetchAllUsersRentBike,
    refetchInterval: 60000,
  });

  // Animations
  useEffect(() => {
    // Pulse animation for warning markers
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Slide up animation for bottom panel
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Bounce animation for new warnings
    Animated.spring(bounceAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }, []);

  // Deviation Detection
  useEffect(() => {
    if (!rentedBikeData || rentedBikeData.length === 0) return;

    const newDeviations: { [key: string]: DeviationInfo } = {};

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

      if (minDist > MAX_DEVIATION_METERS) {
        newDeviations[rental._id] = {
          userId: rental.userId._id,
          deviation: minDist,
          timestamp: new Date(),
        };

        // Alert only for new deviations
        if (!deviations[rental._id]) {
          // Trigger bounce animation
          bounceAnim.setValue(0);
          Animated.spring(bounceAnim, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
          }).start();

          Alert.alert(
            "🚨 Route Deviation Alert",
            `User ${rental.userId.userName} has deviated ${(minDist / 1000).toFixed(2)} km from the planned route!`,
            [
              {
                text: "Contact User",
                onPress: () => handleContactUser(rental),
                style: "destructive",
              },
              {
                text: "View Details",
                onPress: () => handleUserSelect(rental),
              },
              { text: "Dismiss", style: "cancel" },
            ]
          );
        }
      }
    });

    setDeviations(newDeviations);
  }, [rentedBikeData, routes]);

  const handleUserSelect = (rental: any) => {
    setSelectedUser(rental);
    setShowUsersModal(false);

    // Animate to user location
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: rental.userLatitude,
          longitude: rental.userLongitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        1000
      );
    }
  };

  const handleContactUser = (user: any) => {
    setUserToContact(user);
    setShowContactModal(true);
  };

  const makePhoneCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`).catch((err) =>
      Alert.alert("Error", "Could not make phone call")
    );
  };

  const sendSMS = (phoneNumber: string) => {
    const message =
      "Hello, we've detected that you've deviated from your planned bike route. Please ensure you're following the correct path for your safety.";
    Linking.openURL(
      `sms:${phoneNumber}?body=${encodeURIComponent(message)}`
    ).catch((err) => Alert.alert("Error", "Could not send SMS"));
  };

  const openEmail = (email: string) => {
    const subject = "Route Deviation Alert";
    const body =
      "Dear user,\n\nWe've detected that you have deviated from your planned bike route. This is for your safety and security. Please ensure you're following the correct path.\n\nBest regards,\nBike Security Team";
    Linking.openURL(
      `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    ).catch((err) => Alert.alert("Error", "Could not open email"));
  };

  const renderUserItem = ({ item }: { item: any }) => {
    const isDeviating = deviations[item._id];
    const deviation = deviations[item._id]?.deviation || 0;

    return (
      <TouchableOpacity
        style={[styles.userCard, isDeviating && styles.userCardWarning]}
        onPress={() => handleUserSelect(item)}
        activeOpacity={0.8}
      >
        <View style={styles.userCardLeft}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: isDeviating ? WARNING_COLOR : SUCCESS_COLOR },
            ]}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.userId.userName}</Text>
            <Text style={styles.userEmail}>{item.userId.email}</Text>
            <Text style={styles.bikeId}>Bike: {item.bikeId.bikeId}</Text>
            {isDeviating && (
              <View style={styles.deviationInfo}>
                <MaterialIcons name="warning" size={12} color={WARNING_COLOR} />
                <Text style={styles.deviationInfoText}>
                  {(deviation / 1000).toFixed(2)} km off route
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.userCardRight}>
          {isDeviating ? (
            <View style={styles.warningSection}>
              <View style={styles.warningBadge}>
                <MaterialIcons name="warning" size={14} color="#fff" />
                <Text style={styles.deviationText}>
                  {(deviation / 1000).toFixed(1)} km
                </Text>
              </View>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => {
                  (setUserToContact(item),
                    setShowUsersModal(false),
                    setShowContactModal(true));
                }}
              >
                <FontAwesome name="phone" size={12} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.okBadge}>
              <MaterialIcons
                name="check-circle"
                size={20}
                color={SUCCESS_COLOR}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const warningCount = Object.keys(deviations).length;

  return (
    <View style={styles.container}>
      {/* Map */}
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
          const isDeviating = deviations[rental._id];
          const isSelected = selectedUser?._id === rental._id;

          const fromLocation = {
            latitude: rental.fromLatitude,
            longitude: rental.fromLongitude,
          };

          const stationLocation = {
            latitude: rental.latitude,
            longitude: rental.longitude,
          };

          const userLocation = {
            latitude: rental.userLatitude,
            longitude: rental.userLongitude,
          };

          return (
            <React.Fragment key={rental._id}>
              {/* Station Markers */}
              <Marker coordinate={stationLocation}>
                <View style={[styles.marker, styles.stationMarker]}>
                  <Ionicons name="flag" size={14} color="#fff" />
                </View>
                <Callout style={styles.callout}>
                  <View style={styles.calloutContent}>
                    <Text style={styles.calloutTitle}>Destination Station</Text>
                    <Text style={styles.calloutText}>
                      {rental.selectedStationId?.stationName || "Unknown"}
                    </Text>
                  </View>
                </Callout>
              </Marker>

              <Marker coordinate={fromLocation}>
                <View style={[styles.marker, styles.originMarker]}>
                  <Ionicons name="location" size={14} color="#fff" />
                </View>
                <Callout style={styles.callout}>
                  <View style={styles.calloutContent}>
                    <Text style={styles.calloutTitle}>Start Point</Text>
                    <Text style={styles.calloutText}>
                      {rental.fromLocation || "Starting Location"}
                    </Text>
                  </View>
                </Callout>
              </Marker>

              {/* User Marker with Animation */}
              <Marker coordinate={userLocation}>
                <Animated.View
                  style={[
                    styles.marker,
                    isDeviating ? styles.warningMarker : styles.userMarker,
                    isSelected && styles.selectedMarker,
                    isDeviating && {
                      transform: [{ scale: pulseAnim }],
                    },
                  ]}
                >
                  <Ionicons
                    name={isDeviating ? "warning" : "person"}
                    size={14}
                    color="#fff"
                  />
                </Animated.View>
                <Callout style={styles.callout}>
                  <View style={styles.calloutContent}>
                    <Text style={styles.calloutTitle}>
                      {rental.userId.userName}
                    </Text>
                    <Text style={styles.calloutText}>
                      Bike: {rental.bikeId.bikeId}
                    </Text>
                    <Text style={styles.calloutText}>
                      Phone: {rental.userId.mobile}
                    </Text>
                    {isDeviating && (
                      <View style={styles.calloutWarning}>
                        <Text style={styles.warningText}>
                          ⚠️ Deviation:{" "}
                          {(deviations[rental._id].deviation / 1000).toFixed(2)}{" "}
                          km
                        </Text>
                      </View>
                    )}
                  </View>
                </Callout>
              </Marker>

              {/* Route */}
              <MapViewDirections
                origin={fromLocation}
                destination={stationLocation}
                apikey={GOOGLE_MAPS_API_KEY}
                strokeWidth={isSelected ? 5 : 3}
                strokeColor={isDeviating ? WARNING_COLOR : THEME_COLOR}
                optimizeWaypoints
                onReady={(result) => {
                  setRoutes((prev) => ({
                    ...prev,
                    [rental._id]: result.coordinates,
                  }));
                }}
              />
            </React.Fragment>
          );
        })}
      </MapView>

      {/* Top Controls */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.usersButton}
          onPress={() => setShowUsersModal(true)}
        >
          <Ionicons name="people" size={20} color="#083A4C" />
          <Text style={styles.buttonText}>Users ({rentedBikeData.length})</Text>
          {warningCount > 0 && (
            <Animated.View
              style={[
                styles.warningCount,
                {
                  transform: [
                    {
                      scale: bounceAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.2],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.warningCountText}>{warningCount}</Text>
            </Animated.View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.refreshBtn, isFetching && styles.refreshBtnActive]}
          onPress={() => refetchRentedBikeData()}
          disabled={isFetching}
        >
          <Ionicons
            name="refresh"
            size={18}
            color="#fff"
            style={isFetching ? styles.rotatingIcon : undefined}
          />
        </TouchableOpacity>
      </View>

      {/* Modern Bottom Summary Panel */}
      <Animated.View
        style={[
          styles.bottomPanel,
          {
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.panelHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.panelTitle}>Security Overview</Text>
            <Text style={styles.panelSubtitle}>Real-time monitoring</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.timeIndicator}>
              <Ionicons name="time" size={12} color="#37A77D" />
              <Text style={styles.timeText}>Live</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: THEME_COLOR },
              ]}
            >
              <Ionicons name="bicycle" size={20} color="#fff" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{rentedBikeData.length}</Text>
              <Text style={styles.statLabel}>Active Rides</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: WARNING_COLOR },
              ]}
            >
              <MaterialIcons name="warning" size={18} color="#fff" />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: WARNING_COLOR }]}>
                {warningCount}
              </Text>
              <Text style={styles.statLabel}>Deviations</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: SUCCESS_COLOR },
              ]}
            >
              <MaterialIcons name="check-circle" size={18} color="#fff" />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: SUCCESS_COLOR }]}>
                {rentedBikeData.length - warningCount}
              </Text>
              <Text style={styles.statLabel}>On Track</Text>
            </View>
          </View>
        </View>

        {warningCount > 0 && (
          <View style={styles.alertBanner}>
            <MaterialIcons name="notifications" size={16} color="#fff" />
            <Text style={styles.alertText}>
              {warningCount} user{warningCount > 1 ? "s" : ""} need attention
            </Text>
            <TouchableOpacity
              style={styles.alertButton}
              onPress={() => setShowUsersModal(true)}
            >
              <Text style={styles.alertButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {/* Users Modal */}
      <Modal
        visible={showUsersModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowUsersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Active Users</Text>
                <Text style={styles.modalSubtitle}>
                  {rentedBikeData.length} users, {warningCount} warnings
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowUsersModal(false)}
              >
                <Ionicons name="close" size={24} color={THEME_COLOR} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={rentedBikeData}
              renderItem={renderUserItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.usersList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Contact Modal */}
      <Modal
        visible={showContactModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowContactModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(11, 64, 87, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              width: "100%",
              maxWidth: 400,
              shadowColor: "#0B4057",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: "#f0f0f0",
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: "#0B4057",
                    marginBottom: 4,
                  }}
                >
                  Contact User
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#666",
                  }}
                >
                  {userToContact?.userId.userName}
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  padding: 4,
                  borderRadius: 20,
                  backgroundColor: "#f8f9fa",
                }}
                onPress={() => setShowContactModal(false)}
              >
                <Ionicons name="close" size={24} color="#0B4057" />
              </TouchableOpacity>
            </View>

            {userToContact && (
              <View style={{ padding: 20 }}>
                {/* User Info Card */}
                <View
                  style={{
                    alignItems: "center",
                    marginBottom: 24,
                    padding: 16,
                    backgroundColor: "#f8f9fa",
                    borderRadius: 12,
                  }}
                >
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: "#0B4057",
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 24,
                        fontWeight: "600",
                      }}
                    >
                      {userToContact.userId.userName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      color: "#0B4057",
                      marginBottom: 4,
                    }}
                  >
                    {userToContact.userId.userName}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#666",
                      marginBottom: 8,
                    }}
                  >
                    Bike: {userToContact.bikeId.bikeId}
                  </Text>
                  {deviations[userToContact._id] && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#FFF5F5",
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "#FFE4E4",
                      }}
                    >
                      <MaterialIcons name="warning" size={14} color="#FF6B35" />
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#D32F2F",
                          marginLeft: 6,
                          fontWeight: "500",
                        }}
                      >
                        Deviated{" "}
                        {(
                          deviations[userToContact._id].deviation / 1000
                        ).toFixed(2)}{" "}
                        km from route
                      </Text>
                    </View>
                  )}
                </View>

                {/* Contact Options */}
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 16,
                    borderRadius: 12,
                    backgroundColor: "#fff",
                    borderWidth: 1,
                    borderColor: "#e9ecef",
                    marginBottom: 12,
                  }}
                  onPress={() => makePhoneCall(userToContact.userId.mobile)}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: "#0B4057",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 12,
                      }}
                    >
                      <FontAwesome name="phone" size={18} color="#fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#0B4057",
                          marginBottom: 2,
                        }}
                      >
                        Call
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#666",
                        }}
                      >
                        {userToContact.userId.mobile}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#0B4057" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 16,
                    borderRadius: 12,
                    backgroundColor: "#fff",
                    borderWidth: 1,
                    borderColor: "#e9ecef",
                    marginBottom: 12,
                  }}
                  onPress={() => sendSMS(userToContact.userId.mobile)}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: "#0B4057",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 12,
                      }}
                    >
                      <MaterialIcons name="message" size={18} color="#fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#0B4057",
                          marginBottom: 2,
                        }}
                      >
                        Send SMS
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#666",
                        }}
                      >
                        Quick alert message
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#0B4057" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 16,
                    borderRadius: 12,
                    backgroundColor: "#fff",
                    borderWidth: 1,
                    borderColor: "#e9ecef",
                    marginBottom: 12,
                  }}
                  onPress={() => openEmail(userToContact.userId.email)}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: "#0B4057",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 12,
                      }}
                    >
                      <MaterialIcons name="email" size={18} color="#fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#0B4057",
                          marginBottom: 2,
                        }}
                      >
                        Send Email
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#666",
                        }}
                      >
                        {userToContact.userId.email}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#0B4057" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default BikeSecurity;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  topBar: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    zIndex: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  usersButton: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  refreshBtn: {
    backgroundColor: THEME_COLOR,
    padding: 14,
    borderRadius: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  refreshBtnActive: {
    backgroundColor: SUCCESS_COLOR,
  },
  buttonText: {
    color: THEME_COLOR,
    fontWeight: "600",
    fontSize: 15,
  },
  warningCount: {
    backgroundColor: WARNING_COLOR,
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  warningCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  bottomPanel: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 24,
    padding: 20,
    zIndex: 100,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: 10,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  panelSubtitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  timeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: NEUTRAL_COLOR,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: NEUTRAL_COLOR,
    padding: 12,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME_COLOR,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: WARNING_COLOR,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  alertText: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  alertButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  alertButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  marker: {
    padding: 10,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 5,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  stationMarker: {
    backgroundColor: "#1E90FF",
  },
  originMarker: {
    backgroundColor: "#9b59b6",
  },
  userMarker: {
    backgroundColor: SUCCESS_COLOR,
  },
  warningMarker: {
    backgroundColor: WARNING_COLOR,
  },
  selectedMarker: {
    borderColor: "#FFD700",
    borderWidth: 4,
  },
  callout: {
    minWidth: 220,
  },
  calloutContent: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME_COLOR,
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
  },
  calloutWarning: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  warningText: {
    fontSize: 14,
    color: WARNING_COLOR,
    fontWeight: "600",
    marginBottom: 8,
  },
  calloutContactButton: {
    backgroundColor: WARNING_COLOR,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  calloutContactText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.8,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: THEME_COLOR,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  usersList: {
    padding: 16,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userCardWarning: {
    borderColor: WARNING_COLOR,
    borderWidth: 2,
    backgroundColor: "#fff5f5",
  },
  userCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME_COLOR,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  bikeId: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  deviationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  deviationInfoText: {
    fontSize: 11,
    color: WARNING_COLOR,
    fontWeight: "500",
  },
  userCardRight: {
    alignItems: "flex-end",
  },
  warningSection: {
    alignItems: "center",
    gap: 8,
  },
  warningBadge: {
    backgroundColor: WARNING_COLOR,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  deviationText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  contactButton: {
    backgroundColor: ACCENT_COLOR,
    padding: 8,
    borderRadius: 20,
    elevation: 2,
  },
  okBadge: {
    padding: 4,
  },
  rotatingIcon: {
    transform: [{ rotate: "360deg" }],
  },
  contactOptions: {
    padding: 20,
  },
  userContactInfo: {
    backgroundColor: "#f8f9fa",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME_COLOR,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  contactInfoText: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME_COLOR,
    marginBottom: 4,
  },
  contactInfoSubtext: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  deviationAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff5f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
  },
  deviationAlertText: {
    fontSize: 12,
    color: WARNING_COLOR,
    fontWeight: "500",
  },
  contactOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  phoneOption: {
    backgroundColor: "#4CAF50",
  },
  smsOption: {
    backgroundColor: "#2196F3",
  },
  emailOption: {
    backgroundColor: "#FF9800",
  },
  contactOptionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  contactOptionSubtext: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.9,
    marginTop: 2,
  },
});
