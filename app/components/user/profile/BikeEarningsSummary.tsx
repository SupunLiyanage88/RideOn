import { fetchUserRentBikeHistory, type RentalHistoryItem } from "@/api/rentBike";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Text, View } from "react-native";

interface BikeEarningsProps {
  bikeId: string;
}

const BikeEarningsSummary = ({ bikeId }: BikeEarningsProps) => {
  const { 
    data: allRentalHistory, 
    isLoading 
  } = useQuery<RentalHistoryItem[]>({
    queryKey: ["all-rental-history"],
    queryFn: fetchUserRentBikeHistory,
  });
  console.log("All Rental History:", allRentalHistory);

  // Calculate earnings for this specific bike
  const bikeEarnings = React.useMemo(() => {
    if (!allRentalHistory || !bikeId) return { earnings: 0, trips: 0, totalRevenue: 0 };
    
    // Filter rentals where the current user is the bike owner
    const bikeRentals = allRentalHistory.filter(rental => 
      rental.bikeId.bikeId === bikeId &&
      rental.bikeId.createdBy && // Ensure createdBy exists - current user owns this bike
      rental.bikeId.createdBy._id // This should match the current user's ID
    );
    
    const totalRevenue = bikeRentals.reduce((sum, rental) => sum + rental.rcPrice, 0);
    const earnings = Math.round(totalRevenue * 0.1); // 10% profit for owner
    const trips = bikeRentals.length;
    
    return { earnings, trips, totalRevenue };
  }, [allRentalHistory, bikeId]);

  if (isLoading) {
    return (
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 8,
      }}>
        <Ionicons name="cash-outline" size={12} color="#6B7280" />
        <Text style={{
          fontSize: 11,
          color: "#6B7280",
          marginLeft: 4,
          fontWeight: "500",
        }}>
          Loading earnings...
        </Text>
      </View>
    );
  }

  if (bikeEarnings.earnings === 0) {
    return (
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FEF3C7",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 8,
      }}>
        <Ionicons name="time-outline" size={12} color="#D97706" />
        <Text style={{
          fontSize: 11,
          color: "#D97706",
          marginLeft: 4,
          fontWeight: "600",
        }}>
          No rentals yet
        </Text>
      </View>
    );
  }

  return (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#DCFCE7",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      marginTop: 8,
    }}>
      <Ionicons name="cash" size={12} color="#16A34A" />
      <Text style={{
        fontSize: 11,
        color: "#16A34A",
        marginLeft: 4,
        fontWeight: "700",
      }}>
        +{bikeEarnings.earnings} RC earned • {bikeEarnings.trips} trips
      </Text>
    </View>
  );
};

export default BikeEarningsSummary;