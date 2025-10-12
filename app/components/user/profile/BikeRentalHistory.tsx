import { fetchUserRentBikeHistory, type RentalHistoryItem } from "@/api/rentBike";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Loader from "../../Loader";

const BikeRentalHistory = () => {
  const router = useRouter();
  const { bikeId } = useLocalSearchParams<{ bikeId: string }>();
  
  const { 
    data: allRentalHistory, 
    isFetching: isLoading, 
    refetch 
  } = useQuery<RentalHistoryItem[]>({
    queryKey: ["rental-history"],
    queryFn: fetchUserRentBikeHistory,
  });

  // Filter rental history for this specific bike
  const bikeRentalHistory = React.useMemo(() => {
    if (!allRentalHistory || !bikeId) return [];
    return allRentalHistory.filter(rental => rental.bikeId.bikeId === bikeId);
  }, [allRentalHistory, bikeId]);

  const handleRefresh = () => {
    refetch();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getBikeTypeIcon = (fuelType: string) => {
    switch (fuelType.toLowerCase()) {
      case 'electric':
        return 'flash';
      case 'pedal':
        return 'bicycle';
      default:
        return 'bicycle-outline';
    }
  };

  const getBikeTypeColor = (fuelType: string) => {
    switch (fuelType.toLowerCase()) {
      case 'electric':
        return '#10B981';
      case 'pedal':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const renderRentalCard = (item: RentalHistoryItem) => (
    <TouchableOpacity
      key={item._id}
      style={{
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: "#F3F4F6",
      }}
      onPress={() => {
        // Navigate to individual rental detail
        router.push(`/components/user/profile/RentalDetail?rentalId=${item._id}`);
      }}
      activeOpacity={0.8}
    >
      {/* Header with Status */}
      <View style={{ 
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: 16 
      }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="time-outline" size={20} color="#6B7280" />
          <Text style={{
            fontSize: 14,
            color: "#6B7280",
            marginLeft: 8,
            fontWeight: "500",
          }}>
            {formatDate(item.createdAt)}
          </Text>
        </View>

        <View style={{
          backgroundColor: item.isRented ? "#DCFCE7" : "#FEF3C7",
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
        }}>
          <Text style={{
            fontSize: 10,
            fontWeight: "700",
            color: item.isRented ? "#16A34A" : "#D97706",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}>
            {item.isRented ? "Active" : "Completed"}
          </Text>
        </View>
      </View>

      {/* Trip Summary */}
      <View style={{
        flexDirection: "row",
        backgroundColor: "#FAFAFA",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
      }}>
        <View style={{ flex: 1, alignItems: "center" }}>
          <View style={{
            width: 32,
            height: 32,
            backgroundColor: "#3B82F6",
            borderRadius: 16,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 8,
          }}>
            <MaterialCommunityIcons name="map-marker-distance" size={16} color="white" />
          </View>
          <Text style={{ fontSize: 11, color: "#6B7280", fontWeight: "500", marginBottom: 2 }}>
            Distance
          </Text>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#0B4057" }}>
            {item.distance.toFixed(2)} km
          </Text>
        </View>

        <View style={{ width: 1, backgroundColor: "#E5E7EB", marginHorizontal: 16 }} />

        <View style={{ flex: 1, alignItems: "center" }}>
          <View style={{
            width: 32,
            height: 32,
            backgroundColor: "#10B981",
            borderRadius: 16,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 8,
          }}>
            <Ionicons name="time" size={16} color="white" />
          </View>
          <Text style={{ fontSize: 11, color: "#6B7280", fontWeight: "500", marginBottom: 2 }}>
            Duration
          </Text>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#0B4057" }}>
            {formatDuration(item.duration)}
          </Text>
        </View>

        <View style={{ width: 1, backgroundColor: "#E5E7EB", marginHorizontal: 16 }} />

        <View style={{ flex: 1, alignItems: "center" }}>
          <View style={{
            width: 32,
            height: 32,
            backgroundColor: "#F59E0B",
            borderRadius: 16,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 8,
          }}>
            <Ionicons name="card" size={16} color="white" />
          </View>
          <Text style={{ fontSize: 11, color: "#6B7280", fontWeight: "500", marginBottom: 2 }}>
            Cost
          </Text>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#0B4057" }}>
            {item.rcPrice} RC
          </Text>
        </View>
      </View>

      {/* Station Information */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFB",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
      }}>
        <Ionicons name="location" size={20} color="#6B7280" />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 2 }}>
            {item.selectedStationId.stationName}
          </Text>
          <Text style={{ fontSize: 12, color: "#6B7280" }}>
            {item.selectedStationId.stationLocation} • {item.selectedStationId.stationId}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  const bikeName = bikeRentalHistory.length > 0 ? bikeRentalHistory[0].bikeId.bikeModel : "Bike";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFB" }}>
      {/* Header */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",          
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "transparent",          
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginRight: 16,
            padding: 8,
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#083A4C" />
        </TouchableOpacity>
        <Text style={{
          fontSize: 20,
          fontWeight: "700",
          color: "#083A4C",
          flex: 1,
        }}>
          {bikeName} History
        </Text>
        <TouchableOpacity
          onPress={handleRefresh}
          disabled={isLoading}
          style={{
            padding: 8,
          }}
        >
          <Ionicons
            name="refresh"
            size={24}
            color={isLoading ? "#9CA3AF" : "#083A4C"}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={["#083A4C"]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 100,
          }}>
            <Loader size="large" showText={false} />
          </View>
        ) : bikeRentalHistory && bikeRentalHistory.length > 0 ? (
          <>
            {/* Bike Summary */}
            <View style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}>
              <View style={{ 
                flexDirection: "row", 
                alignItems: "center", 
                marginBottom: 16 
              }}>
                <View style={{
                  width: 48,
                  height: 48,
                  backgroundColor: getBikeTypeColor(bikeRentalHistory[0].bikeId.fuelType) + '20',
                  borderRadius: 24,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                  borderWidth: 2,
                  borderColor: getBikeTypeColor(bikeRentalHistory[0].bikeId.fuelType) + '40',
                }}>
                  <Ionicons 
                    name={getBikeTypeIcon(bikeRentalHistory[0].bikeId.fuelType)} 
                    size={24} 
                    color={getBikeTypeColor(bikeRentalHistory[0].bikeId.fuelType)} 
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: "#083A4C",
                    marginBottom: 2,
                  }}>
                    {bikeRentalHistory[0].bikeId.bikeModel}
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: "#6B7280",
                    fontWeight: "500",
                  }}>
                    ID: {bikeRentalHistory[0].bikeId.bikeId} • {bikeRentalHistory[0].bikeId.fuelType}
                  </Text>
                </View>
              </View>

              <View style={{
                flexDirection: "row",
                justifyContent: "space-around",
              }}>
                <View style={{ alignItems: "center" }}>
                  <Text style={{
                    fontSize: 24,
                    fontWeight: "800",
                    color: "#083A4C",
                  }}>
                    {bikeRentalHistory.length}
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: "#6B7280",
                    marginTop: 4,
                  }}>
                    Total Trips
                  </Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{
                    fontSize: 24,
                    fontWeight: "800",
                    color: "#10B981",
                  }}>
                    {bikeRentalHistory.reduce((sum, item) => sum + item.distance, 0).toFixed(1)}
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: "#6B7280",
                    marginTop: 4,
                  }}>
                    Total KM
                  </Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{
                    fontSize: 24,
                    fontWeight: "800",
                    color: "#F59E0B",
                  }}>
                    {bikeRentalHistory.reduce((sum, item) => sum + item.rcPrice, 0)}
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: "#6B7280",
                    marginTop: 4,
                  }}>
                    Total RC
                  </Text>
                </View>
              </View>
            </View>

            {/* Trip History List */}
            <Text style={{
              fontSize: 18,
              fontWeight: "700",
              color: "#083A4C",
              marginBottom: 16,
            }}>
              Trip History
            </Text>
            {bikeRentalHistory.map(renderRentalCard)}
          </>
        ) : (
          <View style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 100,
          }}>
            <Ionicons name="time-outline" size={80} color="#D1D5DB" />
            <Text style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#6B7280",
              marginTop: 16,
              textAlign: "center",
            }}>
              No Rental History
            </Text>
            <Text style={{
              fontSize: 14,
              color: "#9CA3AF",
              marginTop: 8,
              textAlign: "center",
              paddingHorizontal: 40,
            }}>
              This bike hasn't been rented yet. Start exploring and rent this bike!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default BikeRentalHistory;