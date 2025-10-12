import "@/api/weather";
import { WeatherData, fetchWeatherByCity, fetchWeatherByCoords } from "@/api/weather";
import UseCurrentUser from "@/hooks/useCurrentUser";
import useLocation from "@/hooks/useLocation";
import { useQuery } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { Animated, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AnimatedSection from "../components/AnimatedSection";
import Directions from "../components/Directions";
import Loader from "../components/Loader";
import QuickActions from "../components/QuickActions";
import QuickStats from "../components/QuickStats";
import RecentBikes from "../components/RecentBikes";
import Weather from "../components/Weather";
import AnimatedHeader from "../components/user/home/AnimatedHeader";

export default function Index() {
  const { user, status } = UseCurrentUser();
  const { location, isLoading: isLocationLoading, error: locationError, refetch: refetchLocation } = useLocation();
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values for content sections
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(30)).current;
  const weatherOpacity = useRef(new Animated.Value(0)).current;
  const weatherTranslateY = useRef(new Animated.Value(40)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const statsTranslateY = useRef(new Animated.Value(40)).current;
  const backgroundScale = useRef(new Animated.Value(1.1)).current;

  const {
    data: weatherData,
    isLoading,
    isError,
    error,
    refetch: refetchWeather,
  } = useQuery<WeatherData, Error>({
    queryKey: ["weather", location?.latitude, location?.longitude],
    queryFn: () => {
      if (location?.latitude && location?.longitude) {
        return fetchWeatherByCoords(location.latitude, location.longitude);
      }
      // Fallback to Malabe if location is not available
      return fetchWeatherByCity("Malabe");
    },
    enabled: !isLocationLoading, // Only run when location is loaded
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchWeather(), refetchLocation()]);
    setRefreshing(false);
  };

  const handleNotificationPress = () => {
    // TODO: Navigate to notifications screen or show notification modal
    console.log("Notification pressed");
  };

  const handleProfilePress = () => {
    // TODO: Navigate to profile screen or show profile modal
    console.log("Profile pressed");
  };

  // Animate content when component mounts and user is loaded
  useEffect(() => {
    if (status === "success") {
      // Staggered animations for different sections
      Animated.sequence([
        Animated.delay(600), // Wait for header animation to complete
        Animated.parallel([
          // Main content fade in
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.spring(contentTranslateY, {
            toValue: 0,
            damping: 12,
            stiffness: 100,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Weather section with delay
      Animated.sequence([
        Animated.delay(800),
        Animated.parallel([
          Animated.timing(weatherOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(weatherTranslateY, {
            toValue: 0,
            damping: 10,
            stiffness: 100,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Stats section with additional delay
      Animated.sequence([
        Animated.delay(1000),
        Animated.parallel([
          Animated.timing(statsOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(statsTranslateY, {
            toValue: 0,
            damping: 10,
            stiffness: 100,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Subtle background scale animation
      Animated.timing(backgroundScale, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }).start();
    }
  }, [status]);

  if (status === "loading") {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F8FAFC",
        }}
      >
        <Loader size="large" itemName="Authentication" />
      </View>
    );
  }

  const locationString =
    weatherData && weatherData.sys
      ? `${weatherData.name}, ${weatherData.sys.country}`
      : location && location.city && location.country
      ? `${location.city}, ${location.country}`
      : "Location Unavailable";

  return (
    <Animated.View 
      style={{ 
        flex: 1, 
        backgroundColor: "#F8FAFC",
        transform: [{ scale: backgroundScale }],
      }}
    >
      <StatusBar style="dark" backgroundColor="#F8FAFC" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Animated Header with Profile Picture and Greeting */}
        <AnimatedHeader 
          onNotificationPress={handleNotificationPress}
          onProfilePress={handleProfilePress}
          notificationCount={3} // You can make this dynamic based on actual notifications
        />
        
        <Animated.ScrollView 
          style={{ 
            flex: 1,
            opacity: contentOpacity,
            marginBottom: 40,
            transform: [{ translateY: contentTranslateY }],
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#37A77D"]}
              tintColor="#37A77D"
            />
          }
        >
          {/* Weather Component */}
          <Animated.View
            style={{
              opacity: weatherOpacity,
              transform: [{ translateY: weatherTranslateY }],
            }}
          >
            {locationError ? (
              <View
                style={{
                  marginHorizontal: 16,
                  marginTop: 10,
                  marginBottom: 20,
                  backgroundColor: "#FEF3C7",
                  borderRadius: 24,
                  padding: 24,
                  borderWidth: 1,
                  borderColor: "#FCD34D",
                }}
              >
                <Text 
                  style={{ 
                    color: "#D97706", 
                    fontSize: 16, 
                    fontWeight: "600",
                    textAlign: "center",
                    marginBottom: 8
                  }}
                >
                  Location Access Needed
                </Text>
                <Text 
                  style={{ 
                    color: "#92400E", 
                    fontSize: 14,
                    textAlign: "center"
                  }}
                >
                  {locationError}. Using default location (Malabe).
                </Text>
              </View>
            ) : isLocationLoading || isLoading ? (
              <View
                style={{
                  marginHorizontal: 16,
                  marginTop: 10,
                  marginBottom: 20,
                  backgroundColor: "#E5E7EB",
                  borderRadius: 24,
                  padding: 24,
                  height: 200,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Loader size="large" itemName="Weather Data" />
              </View>
            ) : isError ? (
              <View
                style={{
                  marginHorizontal: 16,
                  marginTop: 10,
                  marginBottom: 20,
                  backgroundColor: "#FEF2F2",
                  borderRadius: 24,
                  padding: 24,
                  borderWidth: 1,
                  borderColor: "#FECACA",
                }}
              >
                <Text 
                  style={{ 
                    color: "#DC2626", 
                    fontSize: 16, 
                    fontWeight: "600",
                    textAlign: "center",
                    marginBottom: 8
                  }}
                >
                  Weather Unavailable
                </Text>
                <Text 
                  style={{ 
                    color: "#B91C1C", 
                    fontSize: 14,
                    textAlign: "center"
                  }}
                >
                  {(error as Error).message}
                </Text>
              </View>
            ) : (
              <Weather location={locationString} weatherData={weatherData} />
            )}
          </Animated.View>

          {/* Direction Component */}
          <AnimatedSection delay={1600}>
            <View style={{ marginHorizontal: 16, marginVertical: 5 }}>
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 16,
                  overflow: "hidden",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Directions />
              </View>
            </View>
          </AnimatedSection>

          {/* Quick Stats */}
          <Animated.View
            style={{
              opacity: statsOpacity,
              transform: [{ translateY: statsTranslateY }],
            }}
          >
            <QuickStats />
          </Animated.View>
          
          {/* Recent Bikes */}
          <AnimatedSection delay={1200}>
            <RecentBikes />
          </AnimatedSection>

          {/* Quick Actions */}
          <AnimatedSection delay={1400}>
            <QuickActions />
          </AnimatedSection>

          

          {/* Bottom spacing */}
          <View style={{ height: 20 }} />
        </Animated.ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}
