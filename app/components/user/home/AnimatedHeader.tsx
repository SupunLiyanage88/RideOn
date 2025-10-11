import UseCurrentUser from "@/hooks/useCurrentUser";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface AnimatedHeaderProps {
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  notificationCount?: number;
}

const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
  onNotificationPress,
  onProfilePress,
  notificationCount = 0,
}) => {
  const { user } = UseCurrentUser();
  
  // Animation values using React Native Animated
  const profileScale = useRef(new Animated.Value(0)).current;
  const profileOpacity = useRef(new Animated.Value(0)).current;
  const profilePulse = useRef(new Animated.Value(1)).current;
  const greetingTranslateY = useRef(new Animated.Value(30)).current;
  const greetingOpacity = useRef(new Animated.Value(0)).current;
  const notificationScale = useRef(new Animated.Value(0)).current;
  const notificationOpacity = useRef(new Animated.Value(0)).current;

  // Generate avatar URL
  const username = user?.userName || "Guest";
  const avatarUrl = `https://api.dicebear.com/9.x/adventurer/png?seed=${encodeURIComponent(
    username
  )}`;

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Start animations when component mounts
  useEffect(() => {
    // Profile picture animation
    Animated.parallel([
      Animated.spring(profileScale, {
        toValue: 1,
        damping: 15,
        stiffness: 100,
        useNativeDriver: true,
      }),
      Animated.timing(profileOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Greeting animation with delay
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(greetingTranslateY, {
          toValue: 0,
          damping: 12,
          stiffness: 100,
          useNativeDriver: true,
        }),
        Animated.timing(greetingOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Notification button animation with delay
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.spring(notificationScale, {
          toValue: 1,
          damping: 15,
          stiffness: 100,
          useNativeDriver: true,
        }),
        Animated.timing(notificationOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Start subtle pulse animation for profile picture
    const startPulseAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(profilePulse, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(profilePulse, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    // Start pulse after initial animation completes
    setTimeout(startPulseAnimation, 1000);
  }, []);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
        backgroundColor: "#F8FAFC",
      }}
    >
      {/* Profile and Greeting Section */}
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        {/* Animated Profile Picture */}
        <TouchableOpacity
          onPress={onProfilePress}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              {
                width: 56,
                height: 56,
                borderRadius: 28,
                borderWidth: 2.5,
                borderColor: "#37A77D",
                backgroundColor: "#E5F3F0",
                overflow: "hidden",
                shadowColor: "#37A77D",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 6,
              },
              {
                transform: [
                  { scale: Animated.multiply(profileScale, profilePulse) }
                ],
                opacity: profileOpacity,
              },
            ]}
          >
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </Animated.View>
        </TouchableOpacity>

        {/* Animated Greeting Section */}
        <Animated.View
          style={[
            { marginLeft: 16, flex: 1 },
            {
              transform: [{ translateY: greetingTranslateY }],
              opacity: greetingOpacity,
            },
          ]}
        >
          <Text
            style={{
              fontSize: 16,
              color: "#6B7280",
              fontWeight: "500",
              marginBottom: 2,
            }}
          >
            {getGreeting()}
          </Text>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: "#083A4C",
              letterSpacing: -0.3,
            }}
            numberOfLines={1}
          >
            {username}
          </Text>
        </Animated.View>
      </View>

      {/* Animated Notification Button */}
      <Animated.View
        style={{
          transform: [{ scale: notificationScale }],
          opacity: notificationOpacity,
        }}
      >
        <TouchableOpacity
          onPress={onNotificationPress}
          activeOpacity={0.7}
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 28,
            padding: 14,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 6,
            elevation: 4,
            position: "relative",
          }}
        >
          <Ionicons name="notifications-outline" size={24} color="#083A4C" />
          
          {/* Notification Badge */}
          {notificationCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                backgroundColor: "#EF4444",
                borderRadius: 10,
                minWidth: 20,
                height: 20,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: "#FFFFFF",
                paddingHorizontal: 4,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 10,
                  fontWeight: "700",
                }}
              >
                {notificationCount > 99 ? "99+" : notificationCount.toString()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default AnimatedHeader;