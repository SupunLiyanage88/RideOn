import { Role } from "@/api/auth";
import { Bike, getBikesByUser } from "@/api/bike";
import { fetchUserRentBikeHistory, type RentalHistoryItem } from "@/api/rentBike";
import UseCurrentUser from "@/hooks/useCurrentUser";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { Image, Text, View } from "react-native";
import Loader from "../../Loader";

const ProfileHeader = () => {
  const [selectedData, setSelectedData] = useState<Bike | null>(null);
  const { data: bikeStatData, isFetching: isBikeStatLoading } = useQuery({
    queryKey: ["bike-stat-user-data"],
    queryFn: getBikesByUser,
  });
  
  const { data: rentalHistory, isFetching: isRentalHistoryLoading } = useQuery<RentalHistoryItem[]>({
    queryKey: ["rental-history-stats"],
    queryFn: fetchUserRentBikeHistory,
  });
  
  const { user } = UseCurrentUser();

  const username = user?.userName || "Guest";
  const avatarUrl = `https://api.dicebear.com/9.x/adventurer/png?seed=${encodeURIComponent(
    username
  )}`;

  // Calculate rental statistics
  const rentalStats = useMemo(() => {
    if (!rentalHistory) return { totalRentals: 0, activeRentals: 0, totalSpent: 0, totalDistance: 0 };
    
    const totalRentals = rentalHistory.length;
    const activeRentals = rentalHistory.filter(rental => rental.isRented).length;
    const totalSpent = rentalHistory.reduce((sum, rental) => sum + rental.rcPrice, 0);
    const totalDistance = rentalHistory.reduce((sum, rental) => sum + rental.distance, 0);
    
    return {
      totalRentals,
      activeRentals,
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      totalDistance: parseFloat((totalDistance / 1000).toFixed(1)) // Convert to kilometers
    };
  }, [rentalHistory]);

  // Calculate bike availability statistics
  const bikeStats = useMemo(() => {
    if (!bikeStatData) return { availableBikes: 0, totalBikes: 0 };
    
    const totalBikes = bikeStatData.length;
    const availableBikes = bikeStatData.filter((bike: Bike) => bike.availability && !bike.assigned).length;
    
    return {
      availableBikes,
      totalBikes
    };
  }, [bikeStatData]);

  return (
    <View style={{ alignItems: "center", paddingTop: 8, paddingBottom: 32 }}>
      <View
        style={{
          width: 110,
          height: 110,
          borderRadius: 55,
          borderWidth: 3, // 👈 add this line
          borderColor: "#37A77D",
          backgroundColor: "##e0e7ff",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
          shadowColor: "#37A77D",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
          overflow: "hidden",
        }}
      >
        <Image
          source={{ uri: avatarUrl }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      </View>

      <Text
        style={{
          fontSize: 28,
          fontWeight: "800",
          color: "#083A4C",
          letterSpacing: -0.5,
        }}
      >
        {username}
      </Text>

      <Text
        style={{
          fontSize: 15,
          color: "#6b7280",
          marginTop: 6,
          fontWeight: "500",
        }}
      >
        {user?.email || "No email provided"}
      </Text>

      {/* User Status and Role */}
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 12 }}>
        {user?.role && (
          <View
            style={{
              backgroundColor: user.role === Role.ADMIN ? "#DC2626" : "#37A77D",
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: "white",
                fontWeight: "600",
                textTransform: "capitalize",
              }}
            >
              {user.role}
            </Text>
          </View>
        )}
        
        <View
          style={{
            backgroundColor: "#F3F4F6",
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: "#374151",
              fontWeight: "500",
            }}
          >
            Member since {new Date().getFullYear()}
          </Text>
        </View>
      </View>

      {/* First Row of Stats */}
      <View style={{ flexDirection: "row", marginTop: 20, gap: 12, justifyContent: "center" }}>
        {/* Bikes Card */}
        <View
          style={{
            backgroundColor: "white",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
            minWidth: 85,
          }}
        >
          {isBikeStatLoading ? (
            <View style={{ margin: 8 }}>
              <Loader size={"small"} showText={false} />
            </View>
          ) : (
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: "#37A77D",
                  textAlign: "center",
                }}
              >
                {bikeStatData ? bikeStatData.length : 0}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: "#6b7280",
                  marginTop: 2,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                Your Bikes
              </Text>
            </View>
          )}          
        </View>

        {/* Available RC Card */}
        <View
          style={{
            backgroundColor: "white",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
            minWidth: 85,
          }}
        >
          {isBikeStatLoading ? (
            <View style={{ margin: 8 }}>
              <Loader size={"small"} showText={false} />
            </View>
          ) : (
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: "#F59E0B",
                  textAlign: "center",
                }}
              >
                {user?.rc ? user.rc.toFixed(2) : "0.00"}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: "#6b7280",
                  marginTop: 2,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                Available RC
              </Text>
            </View>
          )}          
        </View>

        {/* Total Rentals Card */}
        <View
          style={{
            backgroundColor: "white",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
            minWidth: 85,
          }}
        >
          {isRentalHistoryLoading ? (
            <View style={{ margin: 8 }}>
              <Loader size={"small"} showText={false} />
            </View>
          ) : (
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: "#3B82F6",
                  textAlign: "center",
                }}
              >
                {rentalStats.totalRentals}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: "#6b7280",
                  marginTop: 2,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                Total Trips
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Second Row of Stats */}
      <View style={{ flexDirection: "row", marginTop: 12, gap: 12, justifyContent: "center" }}>
        {/* Active Rentals Card */}
        <View
          style={{
            backgroundColor: "white",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
            minWidth: 85,
          }}
        >
          {isRentalHistoryLoading ? (
            <View style={{ margin: 8 }}>
              <Loader size={"small"} showText={false} />
            </View>
          ) : (
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: "#10B981",
                  textAlign: "center",
                }}
              >
                {rentalStats.activeRentals}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: "#6b7280",
                  marginTop: 2,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                Active Now
              </Text>
            </View>
          )}
        </View>

        {/* Total Spent Card */}
        <View
          style={{
            backgroundColor: "white",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
            minWidth: 85,
          }}
        >
          {isRentalHistoryLoading ? (
            <View style={{ margin: 8 }}>
              <Loader size={"small"} showText={false} />
            </View>
          ) : (
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: "#EF4444",
                  textAlign: "center",
                }}
              >
                {rentalStats.totalSpent}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: "#6b7280",
                  marginTop: 2,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                Total Spent
              </Text>
            </View>
          )}
        </View>

        {/* Distance Traveled Card */}
        <View
          style={{
            backgroundColor: "white",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
            minWidth: 85,
          }}
        >
          {isRentalHistoryLoading ? (
            <View style={{ margin: 8 }}>
              <Loader size={"small"} showText={false} />
            </View>
          ) : (
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: "#8B5CF6",
                  textAlign: "center",
                }}
              >
                {rentalStats.totalDistance}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: "#6b7280",
                  marginTop: 2,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                Distance (km)
              </Text>
            </View>
          )}
        </View>
      </View>

      
    </View>
  );
};

export default ProfileHeader;
