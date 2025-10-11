import { Bike, getBikesByUser } from "@/api/bike";
import { RentBike, fetchUserRentBike } from "@/api/rentBike";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const getBikeStatusColor = (condition: string, availability: boolean) => {
  if (!availability) return "#EF4444";
  const conditionNum = Number(condition);
  if (conditionNum >= 85) return "#37A77D";
  if (conditionNum >= 70) return "#37A77D";
  if (conditionNum >= 50) return "#083A4C";
  return "#EF4444";
};

const RecentBikeCard = ({ bike }: { bike: Bike }) => {
  const conditionNum = Number(bike.condition);
  const statusColor = getBikeStatusColor(bike.condition, bike.availability);
  
  return (
    <TouchableOpacity
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        marginRight: 12,
        width: 160,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
      onPress={() => router.push(`/(tabs)/search`)}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <MaterialCommunityIcons 
          name="motorbike" 
          size={28} 
          color="#083A4C" 
        />
        <View
          style={{
            backgroundColor: statusColor,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 10,
              fontWeight: "600",
            }}
          >
            {conditionNum >= 85 ? "Excellent" : conditionNum >= 70 ? "Good" : conditionNum >= 50 ? "Fair" : "Poor"}
          </Text>
        </View>
      </View>

      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: "#1F2937",
          marginBottom: 4,
        }}
        numberOfLines={1}
      >
        {bike.bikeModel}
      </Text>

      <Text
        style={{
          fontSize: 12,
          color: "#6B7280",
          marginBottom: 8,
        }}
      >
        ID: {bike.bikeId}
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="speedometer-outline" size={14} color="#6B7280" />
          <Text
            style={{
              fontSize: 12,
              color: "#6B7280",
              marginLeft: 4,
            }}
          >
            {bike.distance} km
          </Text>
        </View>
        
        <View
          style={{
            backgroundColor: bike.availability ? "#DCFCE7" : "#FEE2E2",
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              color: bike.availability ? "#16A34A" : "#DC2626",
              fontWeight: "500",
            }}
          >
            {bike.availability ? "Available" : "In Use"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const RecentRentCard = ({ rent }: { rent: RentBike }) => {
  const duration = Math.round(rent.duration / 60); // Convert to minutes
  
  return (
    <TouchableOpacity
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        marginRight: 12,
        width: 180,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <MaterialCommunityIcons 
          name="bike" 
          size={28} 
          color="#37A77D" 
        />
        <View
          style={{
            backgroundColor: "#DCFCE7",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              color: "#16A34A",
              fontSize: 10,
              fontWeight: "600",
            }}
          >
            Active
          </Text>
        </View>
      </View>

      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: "#1F2937",
          marginBottom: 4,
        }}
        numberOfLines={1}
      >
        {rent.bikeStation?.stationName || "Bike Station"}
      </Text>

      <Text
        style={{
          fontSize: 12,
          color: "#6B7280",
          marginBottom: 8,
        }}
      >
        Bike ID: {rent.bikeId}
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text
            style={{
              fontSize: 12,
              color: "#6B7280",
              marginLeft: 4,
            }}
          >
            {duration}m
          </Text>
        </View>
        
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="card-outline" size={14} color="#6B7280" />
          <Text
            style={{
              fontSize: 12,
              color: "#6B7280",
              marginLeft: 4,
            }}
          >
            ₹{rent.rcPrice}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const RecentBikes = () => {
  const {
    data: userBikes,
    isLoading: bikesLoading,
    isError: bikesError,
  } = useQuery<Bike[]>({
    queryKey: ["userBikes"],
    queryFn: getBikesByUser,
  });

  const {
    data: userRentals,
    isLoading: rentalsLoading,
    isError: rentalsError,
  } = useQuery<RentBike[]>({
    queryKey: ["userRentals"],
    queryFn: fetchUserRentBike,
  });

  const hasUserBikes = userBikes && userBikes.length > 0;
  const hasUserRentals = userRentals && userRentals.length > 0;

  if (bikesLoading || rentalsLoading) {
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
          Recent Activity
        </Text>
        <View
          style={{
            height: 140,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color="#37A77D" />
        </View>
      </View>
    );
  }

  if (!hasUserBikes && !hasUserRentals) {
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
          Get Started
        </Text>
        <View
          style={{
            marginHorizontal: 16,
            backgroundColor: "white",
            borderRadius: 16,
            padding: 24,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <MaterialCommunityIcons 
            name="motorbike" 
            size={48} 
            color="#9CA3AF" 
          />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#6B7280",
              marginTop: 12,
              textAlign: "center",
            }}
          >
            No bikes or rentals yet
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#9CA3AF",
              textAlign: "center",
              marginTop: 4,
            }}
          >
            Start by adding a bike or finding a rental
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "#37A77D",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
              marginTop: 16,
            }}
            onPress={() => router.push("/(tabs)/search")}
          >
            <Text
              style={{
                color: "white",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              Explore Bikes
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ marginVertical: 20 }}>
      {hasUserBikes && (
        <>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginHorizontal: 16,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#1F2937",
              }}
            >
              Your Bikes
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/me")}>
              <Text
                style={{
                  fontSize: 14,
                  color: "#083A4C",
                  fontWeight: "600",
                }}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={userBikes.slice(0, 5)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => <RecentBikeCard bike={item} />}
            keyExtractor={(item) => item._id}
          />
        </>
      )}

      {hasUserRentals && (
        <>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginHorizontal: 16,
              marginBottom: 16,
              marginTop: hasUserBikes ? 24 : 0,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#1F2937",
              }}
            >
              Active Rentals
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/me")}>
              <Text
                style={{
                  fontSize: 14,
                  color: "#083A4C",
                  fontWeight: "600",
                }}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={userRentals.slice(0, 5)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => <RecentRentCard rent={item} />}
            keyExtractor={(item) => item._id}
          />
        </>
      )}
    </View>
  );
};

export default RecentBikes;