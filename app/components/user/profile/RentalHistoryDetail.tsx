import { fetchUserRentBikeHistory, type RentalHistoryItem } from "@/api/rentBike";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Loader from "../../Loader";

const RentalHistoryDetail = () => {
  const router = useRouter();
  const { 
    data: rentalHistory, 
    isFetching: isLoading, 
    refetch 
  } = useQuery<RentalHistoryItem[]>({
    queryKey: ["rental-history"],
    queryFn: fetchUserRentBikeHistory,
  });

  console.log("Fetched rental history:", rentalHistory);

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
    <View
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
    >
      {/* Header with Bike Info */}
      <View style={{ 
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: 16 
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <View style={{
            width: 48,
            height: 48,
            backgroundColor: getBikeTypeColor(item.bikeId.fuelType) + '20',
            borderRadius: 24,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
            borderWidth: 2,
            borderColor: getBikeTypeColor(item.bikeId.fuelType) + '40',
          }}>
            <Ionicons 
              name={getBikeTypeIcon(item.bikeId.fuelType)} 
              size={24} 
              color={getBikeTypeColor(item.bikeId.fuelType)} 
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 18,
              fontWeight: "700",
              color: "#0B4057",
              marginBottom: 2,
            }}>
              {item.bikeId.bikeModel}
            </Text>
            <Text style={{
              fontSize: 12,
              color: "#6B7280",
              fontWeight: "500",
            }}>
              ID: {item.bikeId.bikeId}
            </Text>
          </View>
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

      {/* Trip Details */}
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
        backgroundColor: "#F8FAFB",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
      }}>
        <Text style={{
          fontSize: 14,
          fontWeight: "700",
          color: "#374151",
          marginBottom: 12,
        }}>
          Station Details
        </Text>
        
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <Ionicons name="location" size={16} color="#6B7280" />
          <Text style={{ fontSize: 13, color: "#6B7280", marginLeft: 8, flex: 1 }}>
            <Text style={{ fontWeight: "600", color: "#374151" }}>
              {item.selectedStationId?.stationName}
            </Text>
            {" • "}{item.selectedStationId?.stationLocation}
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="bicycle" size={16} color="#6B7280" />
          <Text style={{ fontSize: 13, color: "#6B7280", marginLeft: 8 }}>
            Station ID: <Text style={{ fontWeight: "600", color: "#374151" }}>
              {item.selectedStationId?.stationId}
            </Text>
            {" • "}{item.selectedStationId?.bikeCount} bikes available
          </Text>
        </View>
      </View>

      {/* Timestamp */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
          <Text style={{ fontSize: 12, color: "#9CA3AF", marginLeft: 4 }}>
            Started: {formatDate(item.createdAt)}
          </Text>
        </View>
        
        {!item.isRented && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            <Text style={{ fontSize: 12, color: "#10B981", marginLeft: 4 }}>
              Completed: {formatDate(item.updatedAt)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

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
          Rental History
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
        ) : rentalHistory && rentalHistory.length > 0 ? (
          <>
            {/* Summary */}
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
              <Text style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#083A4C",
                marginBottom: 16,
              }}>
                Summary
              </Text>
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
                    {rentalHistory.length}
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
                    {rentalHistory.filter(item => item.isRented).length}
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: "#6B7280",
                    marginTop: 4,
                  }}>
                    Active
                  </Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{
                    fontSize: 24,
                    fontWeight: "800",
                    color: "#F59E0B",
                  }}>
                    {rentalHistory.reduce((sum, item) => sum + item.rcPrice, 0).toFixed(2)}
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

            {/* Rental History List */}
            <Text style={{
              fontSize: 18,
              fontWeight: "700",
              color: "#083A4C",
              marginBottom: 16,
            }}>
              Recent Trips
            </Text>
            {rentalHistory.map(renderRentalCard)}
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
              You haven't rented any bikes yet. Start exploring and rent your first bike!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RentalHistoryDetail;