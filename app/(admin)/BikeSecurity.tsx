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

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

// Enhanced color palette for better UX
const THEME_COLOR = "#083A4C";
const WARNING_COLOR = "#FF6B35";
const SUCCESS_COLOR = "#37A77D";
const SECONDARY_COLOR = "#4A90E2";
const ACCENT_COLOR = "#7B68EE";
const NEUTRAL_COLOR = "#F8F9FA";
const LIGHT_GRAY = "#E9ECEF";
const DARK_GRAY = "#495057";
const SHADOW_COLOR = "#000";

const MAX_DEVIATION_METERS = 1000;
const { width, height } = Dimensions.get("window");

// Map styles for different themes
const mapStyles = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f5' }]
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }]
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#616161' }]
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#f5f5f5' }]
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#bdbdbd' }]
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#eeeeee' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#e5e5e5' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9e9e9e' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }]
  },
  {
    featureType: 'road.arterial',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#dadada' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#616161' }]
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9e9e9e' }]
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [{ color: '#e5e5e5' }]
  },
  {
    featureType: 'transit.station',
    elementType: 'geometry',
    stylers: [{ color: '#eeeeee' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#c9c9c9' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9e9e9e' }]
  }
];

interface DeviationInfo {
  userId: string;
  deviation: number;
  timestamp: Date;
}

interface Coordinate {
  latitude: number;
  longitude: number;
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
  const [location, setLocation] = useState<Coordinate | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'warnings' | 'safe'>('all');
  const [showRoutes, setShowRoutes] = useState(true);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');

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

  const fitAllStations = () => {
    if (rentedBikeData?.length > 0 && mapRef.current) {
      const coordinates = rentedBikeData.map((station: any) => ({
        latitude: station.userLatitude,
        longitude: station.userLongitude,
      }));
      if (location && mapRef.current) {
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
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, bottom: 100, left: 50, right: 50 },
        animated: true,
      });
    }
  };

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
      {/* Enhanced Map with custom styling */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={mapStyles}
        mapType={mapType}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={true}
        showsTraffic={false}
        loadingEnabled={true}
        loadingIndicatorColor={THEME_COLOR}
        loadingBackgroundColor={NEUTRAL_COLOR}
        moveOnMarkerPress={false}
        showsPointsOfInterest={false}
        initialRegion={{
          latitude: 7.2,
          longitude: 80.6,
          latitudeDelta: 2,
          longitudeDelta: 2,
        }}
        onMapReady={() => {
          // Fit to coordinates when map is ready
          setTimeout(() => {
            fitAllStations();
          }, 1000);
        }}
      >
        {rentedBikeData
          .filter((rental: any) => {
            const isDeviating = deviations[rental._id];
            if (filterMode === 'warnings') return isDeviating;
            if (filterMode === 'safe') return !isDeviating;
            return true; // 'all' mode
          })
          .map((rental: any) => {
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
              {/* Enhanced Station Markers */}
              <Marker coordinate={stationLocation} identifier={`station-${rental._id}`}>
                <View style={[styles.marker, styles.stationMarker, isSelected && styles.selectedMarkerBorder]}>
                  <View style={styles.markerInner}>
                    <Ionicons name="flag" size={16} color="#fff" />
                  </View>
                  {isSelected && <View style={styles.markerPulse} />}
                </View>
                <Callout style={styles.enhancedCallout}>
                  <View style={styles.calloutContent}>
                    <View style={styles.calloutHeader}>
                      <MaterialIcons name="place" size={20} color={SECONDARY_COLOR} />
                      <Text style={styles.calloutTitle}>Destination</Text>
                    </View>
                    <Text style={styles.calloutText}>
                      {rental.selectedStationId?.stationName || "Bike Station"}
                    </Text>
                    <Text style={styles.calloutSubtext}>Drop-off location</Text>
                  </View>
                </Callout>
              </Marker>

              <Marker coordinate={fromLocation} identifier={`origin-${rental._id}`}>
                <View style={[styles.marker, styles.originMarker, isSelected && styles.selectedMarkerBorder]}>
                  <View style={styles.markerInner}>
                    <MaterialIcons name="my-location" size={16} color="#fff" />
                  </View>
                  {isSelected && <View style={styles.markerPulse} />}
                </View>
                <Callout style={styles.enhancedCallout}>
                  <View style={styles.calloutContent}>
                    <View style={styles.calloutHeader}>
                      <MaterialIcons name="location-on" size={20} color="#9b59b6" />
                      <Text style={styles.calloutTitle}>Start Point</Text>
                    </View>
                    <Text style={styles.calloutText}>
                      {rental.fromLocation || "Pick-up Location"}
                    </Text>
                    <Text style={styles.calloutSubtext}>Journey started here</Text>
                  </View>
                </Callout>
              </Marker>

              {/* Enhanced User Marker with Animation */}
              <Marker coordinate={userLocation} identifier={`user-${rental._id}`}>
                <Animated.View
                  style={[
                    styles.marker,
                    styles.userMarkerContainer,
                    isDeviating ? styles.warningMarker : styles.userMarker,
                    isSelected && styles.selectedMarkerBorder,
                    isDeviating && {
                      transform: [{ scale: pulseAnim }],
                    },
                  ]}
                >
                  <View style={styles.markerInner}>
                    <View style={[styles.userAvatar, isDeviating && styles.userAvatarWarning]}>
                      <Text style={styles.userAvatarText}>
                        {rental.userId.userName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    {isDeviating && (
                      <View style={styles.warningIndicator}>
                        <MaterialIcons name="warning" size={12} color="#fff" />
                      </View>
                    )}
                  </View>
                  {isSelected && <View style={styles.markerPulse} />}
                  {isDeviating && (
                    <Animated.View 
                      style={[
                        styles.warningPulse,
                        {
                          transform: [{ scale: pulseAnim }],
                          opacity: pulseAnim.interpolate({
                            inputRange: [1, 1.3],
                            outputRange: [0.3, 0.1],
                          }),
                        },
                      ]}
                    />
                  )}
                </Animated.View>
                <Callout style={styles.enhancedCallout}>
                  <View style={styles.calloutContent}>
                    <View style={styles.calloutHeader}>
                      <View style={[styles.userAvatar, { width: 24, height: 24, borderRadius: 12 }, isDeviating && styles.userAvatarWarning]}>
                        <Text style={[styles.userAvatarText, { fontSize: 10 }]}>
                          {rental.userId.userName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.calloutTitle}>
                        {rental.userId.userName}
                      </Text>
                      {isDeviating && (
                        <View style={styles.calloutStatusBadge}>
                          <MaterialIcons name="warning" size={12} color="#fff" />
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.calloutInfo}>
                      <View style={styles.calloutInfoRow}>
                        <MaterialIcons name="directions-bike" size={16} color={THEME_COLOR} />
                        <Text style={styles.calloutText}>Bike: {rental.bikeId.bikeId}</Text>
                      </View>
                      <View style={styles.calloutInfoRow}>
                        <MaterialIcons name="phone" size={16} color={THEME_COLOR} />
                        <Text style={styles.calloutText}>{rental.userId.mobile}</Text>
                      </View>
                      <View style={styles.calloutInfoRow}>
                        <MaterialIcons name="email" size={16} color={THEME_COLOR} />
                        <Text style={styles.calloutText}>{rental.userId.email}</Text>
                      </View>
                    </View>

                    {isDeviating && (
                      <View style={styles.calloutWarning}>
                        <View style={styles.calloutWarningHeader}>
                          <MaterialIcons name="warning" size={16} color={WARNING_COLOR} />
                          <Text style={styles.warningText}>Route Deviation</Text>
                        </View>
                        <Text style={styles.warningSubtext}>
                          {(deviations[rental._id].deviation / 1000).toFixed(2)} km off planned route
                        </Text>
                        <TouchableOpacity
                          style={styles.calloutContactButton}
                          onPress={() => {
                            setUserToContact(rental);
                            setShowContactModal(true);
                          }}
                        >
                          <MaterialIcons name="phone" size={14} color="#fff" />
                          <Text style={styles.calloutContactText}>Contact</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </Callout>
              </Marker>

              {/* Enhanced Route with conditional rendering */}
              {showRoutes && (
                <MapViewDirections
                  origin={fromLocation}
                  destination={stationLocation}
                  apikey={GOOGLE_MAPS_API_KEY}
                  strokeWidth={isSelected ? 6 : isDeviating ? 4 : 3}
                  strokeColor={isSelected ? ACCENT_COLOR : isDeviating ? WARNING_COLOR : THEME_COLOR}
                  optimizeWaypoints
                  precision="high"
                  mode="DRIVING"
                  onReady={(result) => {
                    setRoutes((prev) => ({
                      ...prev,
                      [rental._id]: result.coordinates,
                    }));
                  }}
                  onError={(errorMessage) => {
                    console.log('Route error:', errorMessage);
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </MapView>

      {/* Enhanced Top Controls */}
      <View style={styles.topControlsContainer}>
        {/* Main Controls Row */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.usersButton}
            onPress={() => setShowUsersModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="people" size={20} color={THEME_COLOR} />
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

          <View style={styles.rightControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={fitAllStations}
              activeOpacity={0.8}
            >
              <Ionicons name="scan" size={18} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, isFetching && styles.controlButtonActive]}
              onPress={() => refetchRentedBikeData()}
              disabled={isFetching}
              activeOpacity={0.8}
            >
              <Animated.View
                style={isFetching ? { transform: [{ rotate: '360deg' }] } : {}}
              >
                <Ionicons name="refresh" size={18} color="#fff" />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Controls */}
        <View style={styles.filterControls}>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, filterMode === 'all' && styles.filterButtonActive]}
              onPress={() => setFilterMode('all')}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterButtonText, filterMode === 'all' && styles.filterButtonTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterMode === 'warnings' && styles.filterButtonActive]}
              onPress={() => setFilterMode('warnings')}
              activeOpacity={0.8}
            >
              <MaterialIcons 
                name="warning" 
                size={14} 
                color={filterMode === 'warnings' ? '#fff' : WARNING_COLOR} 
              />
              <Text style={[styles.filterButtonText, filterMode === 'warnings' && styles.filterButtonTextActive]}>
                Alerts ({warningCount})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterMode === 'safe' && styles.filterButtonActive]}
              onPress={() => setFilterMode('safe')}
              activeOpacity={0.8}
            >
              <MaterialIcons 
                name="check-circle" 
                size={14} 
                color={filterMode === 'safe' ? '#fff' : SUCCESS_COLOR} 
              />
              <Text style={[styles.filterButtonText, filterMode === 'safe' && styles.filterButtonTextActive]}>
                Safe ({rentedBikeData.length - warningCount})
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mapControls}>
            <TouchableOpacity
              style={[styles.mapControlButton, showRoutes && styles.mapControlButtonActive]}
              onPress={() => setShowRoutes(!showRoutes)}
              activeOpacity={0.8}
            >
              <MaterialIcons name="route" size={16} color={showRoutes ? '#fff' : THEME_COLOR} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mapControlButton}
              onPress={() => {
                const types: ('standard' | 'satellite' | 'hybrid')[] = ['standard', 'satellite', 'hybrid'];
                const currentIndex = types.indexOf(mapType);
                const nextIndex = (currentIndex + 1) % types.length;
                setMapType(types[nextIndex]);
              }}
              activeOpacity={0.8}
            >
              <MaterialIcons name="layers" size={16} color={THEME_COLOR} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Enhanced Collapsible Bottom Panel */}
      <Animated.View
        style={[
          styles.bottomPanel,
          {
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.panelHeader}
          onPress={() => setIsPanelCollapsed(!isPanelCollapsed)}
          activeOpacity={0.8}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.panelTitle}>Security Overview</Text>
            <Text style={styles.panelSubtitle}>
              {isFetching ? 'Updating...' : 'Real-time monitoring'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.timeIndicator}>
              <View style={[styles.liveIndicator, isFetching && styles.liveIndicatorActive]} />
              <Text style={styles.timeText}>Live</Text>
            </View>
            <Ionicons 
              name={isPanelCollapsed ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={THEME_COLOR}
              style={{ marginLeft: 8 }}
            />
          </View>
        </TouchableOpacity>

        {!isPanelCollapsed && (
          <View style={styles.panelContent}>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    zIndex: 100,
    elevation: 12,
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(20px)",
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
    padding: 8,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 8,
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    justifyContent: "center",
    alignItems: "center",
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
  fitAllButton: {
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
  // New enhanced UI styles
  topControlsContainer: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    zIndex: 100,
  },
  rightControls: {
    flexDirection: "row",
    gap: 8,
  },
  controlButton: {
    backgroundColor: THEME_COLOR,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  controlButtonActive: {
    backgroundColor: SUCCESS_COLOR,
  },
  filterControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 4,
  },
  filterButtons: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 4,
    flex: 1,
    marginRight: 12,
    elevation: 6,
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
  },
  filterButtonActive: {
    backgroundColor: THEME_COLOR,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: DARK_GRAY,
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  mapControls: {
    flexDirection: "row",
    gap: 6,
  },
  mapControlButton: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  mapControlButtonActive: {
    backgroundColor: THEME_COLOR,
  },
  panelContent: {
    marginTop: 16,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SUCCESS_COLOR,
    marginRight: 6,
  },
  liveIndicatorActive: {
    backgroundColor: WARNING_COLOR,
  },
  // Enhanced marker styles
  selectedMarkerBorder: {
    borderColor: "#FFD700",
    borderWidth: 3,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 15,
  },
  markerInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  markerPulse: {
    position: "absolute",
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#FFD700",
    backgroundColor: "rgba(255, 215, 0, 0.2)",
  },
  // Enhanced callout styles
  enhancedCallout: {
    minWidth: 250,
    maxWidth: 300,
  },
  calloutHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  calloutSubtext: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
    marginTop: 4,
  },
  // Enhanced user marker styles
  userMarkerContainer: {
    position: "relative",
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: SUCCESS_COLOR,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  userAvatarWarning: {
    backgroundColor: WARNING_COLOR,
  },
  userAvatarText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  warningIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: WARNING_COLOR,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  warningPulse: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 35,
    backgroundColor: WARNING_COLOR,
  },
  // Enhanced callout info styles
  calloutStatusBadge: {
    backgroundColor: WARNING_COLOR,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "auto",
  },
  calloutInfo: {
    marginTop: 12,
    gap: 8,
  },
  calloutInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  calloutWarningHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  warningSubtext: {
    fontSize: 12,
    color: WARNING_COLOR,
    fontWeight: "500",
    marginBottom: 8,
  },
});
