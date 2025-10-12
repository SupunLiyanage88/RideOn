import { getBikesByUser } from "@/api/bike";
import { fetchUserRentBike } from "@/api/rentBike";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const StatCard = ({ 
  title, 
  value, 
  icon, 
  color, 
  onPress 
}: { 
  title: string; 
  value: string | number; 
  icon: string; 
  color: string; 
  onPress?: () => void;
}) => (
  <TouchableOpacity
    style={{
      flex: 1,
      backgroundColor: "white",
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    }}
    onPress={onPress}
    disabled={!onPress}
  >
    <View
      style={{
        backgroundColor: `${color}20`,
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
      }}
    >
      <MaterialCommunityIcons 
        name={icon as any} 
        size={24} 
        color={color} 
      />
    </View>
    <Text
      style={{
        fontSize: 24,
        fontWeight: "bold",
        color: "#1F2937",
        marginBottom: 4,
      }}
    >
      {value}
    </Text>
    <Text
      style={{
        fontSize: 12,
        color: "#6B7280",
        fontWeight: "500",
      }}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

const QuickStats = () => {
  const {
    data: userBikes,
    isLoading: bikesLoading,
  } = useQuery({
    queryKey: ["userBikes"],
    queryFn: getBikesByUser,
  });

  const {
    data: userRentals,
    isLoading: rentalsLoading,
  } = useQuery({
    queryKey: ["userRentals"],
    queryFn: fetchUserRentBike,
  });

  if (bikesLoading || rentalsLoading) {
    return (
      <View
        style={{
          marginVertical: 20,
          marginHorizontal: 16,
          height: 120,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#37A77D" />
      </View>
    );
  }

  const totalBikes = userBikes?.length || 0;
  const activeRentals = userRentals?.length || 0;
  const availableBikes = userBikes?.filter((bike: any) => bike.availability)?.length || 0;
  
  // Calculate total distance from user bikes
  const totalDistance = userBikes?.reduce((sum: number, bike: any) => {
    return sum + (parseInt(bike.distance) || 0);
  }, 0) || 0;

  return (
    <View style={{ marginVertical: 20 }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: "#1F2937",
          marginHorizontal: 16,
          marginBottom: 16,
        }}
      >
        Quick Stats
      </Text>
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 12,
        }}
      >
        <StatCard
          title="My Bikes"
          value={totalBikes}
          icon="motorbike"
          color="#083A4C"
          onPress={() => router.push("/(tabs)/me")}
        />
        <StatCard
          title="Active Rentals"
          value={activeRentals}
          icon="bike"
          color="#37A77D"
          onPress={() => router.push("/(tabs)/me")}
        />
        <StatCard
          title="Available"
          value={availableBikes}
          icon="check-circle"
          color="#37A77D"
        />
        <StatCard
          title="Total KM"
          value={totalDistance > 1000 ? `${(totalDistance / 1000).toFixed(1)}k` : totalDistance}
          icon="speedometer"
          color="#083A4C"
        />
      </View>
    </View>
  );
};

export default QuickStats;