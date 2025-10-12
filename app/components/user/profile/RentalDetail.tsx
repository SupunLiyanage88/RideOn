import { fetchUserRentBikeHistory, type RentalHistoryItem } from "@/api/rentBike";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Loader from "../../Loader";

const RentalDetail = () => {
  const router = useRouter();
  const { rentalId } = useLocalSearchParams<{ rentalId: string }>();
  
  const { 
    data: allRentalHistory, 
    isFetching: isLoading, 
  } = useQuery<RentalHistoryItem[]>({
    queryKey: ["rental-history"],
    queryFn: fetchUserRentBikeHistory,
  });

  // Find specific rental by ID
  const rental = React.useMemo(() => {
    if (!allRentalHistory || !rentalId) return null;
    return allRentalHistory.find(r => r._id === rentalId) || null;
  }, [allRentalHistory, rentalId]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFB" }}>
        <View style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}>
          <Loader size="large" showText={false} />
        </View>
      </SafeAreaView>
    );
  }

  if (!rental) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFB" }}>
        <View style={{ padding: 20 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginBottom: 20 }}
          >
            <Ionicons name="arrow-back" size={24} color="#083A4C" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, color: "#6B7280", textAlign: "center" }}>
            Rental not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
          Trip Details
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Header */}
        <View style={{
          backgroundColor: "white",
          borderRadius: 20,
          padding: 20,
          marginBottom: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 5,
          borderWidth: 1,
          borderColor: "#F3F4F6",
        }}>
          <View style={{ 
            flexDirection: "row", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: 16 
          }}>
            <Text style={{
              fontSize: 24,
              fontWeight: "800",
              color: "#083A4C",
            }}>
              {rental.bikeId.bikeModel}
            </Text>
            <View style={{
              backgroundColor: rental.isRented ? "#DCFCE7" : "#FEF3C7",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
            }}>
              <Text style={{
                fontSize: 12,
                fontWeight: "700",
                color: rental.isRented ? "#16A34A" : "#D97706",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}>
                {rental.isRented ? "Active Trip" : "Completed"}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{
              width: 40,
              height: 40,
              backgroundColor: getBikeTypeColor(rental.bikeId.fuelType) + '20',
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
              borderWidth: 2,
              borderColor: getBikeTypeColor(rental.bikeId.fuelType) + '40',
            }}>
              <Ionicons 
                name={getBikeTypeIcon(rental.bikeId.fuelType)} 
                size={20} 
                color={getBikeTypeColor(rental.bikeId.fuelType)} 
              />
            </View>
            <View>
              <Text style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#374151",
              }}>
                {rental.bikeId.bikeId} • {rental.bikeId.fuelType}
              </Text>
              <Text style={{
                fontSize: 12,
                color: "#6B7280",
              }}>
                Condition: {rental.bikeId.condition}% • Distance: {rental.bikeId.distance}km
              </Text>
            </View>
          </View>
        </View>

        {/* Trip Metrics */}
        <View style={{
          backgroundColor: "white",
          borderRadius: 20,
          padding: 20,
          marginBottom: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 5,
          borderWidth: 1,
          borderColor: "#F3F4F6",
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: "700",
            color: "#083A4C",
            marginBottom: 16,
          }}>
            Trip Metrics
          </Text>

          <View style={{
            flexDirection: "row",
            backgroundColor: "#FAFAFA",
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: "#E5E7EB",
          }}>
            <View style={{ flex: 1, alignItems: "center" }}>
              <View style={{
                width: 40,
                height: 40,
                backgroundColor: "#3B82F6",
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 8,
              }}>
                <MaterialCommunityIcons name="map-marker-distance" size={20} color="white" />
              </View>
              <Text style={{ fontSize: 12, color: "#6B7280", fontWeight: "500", marginBottom: 4 }}>
                Distance
              </Text>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#0B4057" }}>
                {rental.distance.toFixed(2)} km
              </Text>
            </View>

            <View style={{ width: 1, backgroundColor: "#E5E7EB", marginHorizontal: 16 }} />

            <View style={{ flex: 1, alignItems: "center" }}>
              <View style={{
                width: 40,
                height: 40,
                backgroundColor: "#10B981",
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 8,
              }}>
                <Ionicons name="time" size={20} color="white" />
              </View>
              <Text style={{ fontSize: 12, color: "#6B7280", fontWeight: "500", marginBottom: 4 }}>
                Duration
              </Text>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#0B4057" }}>
                {formatDuration(rental.duration)}
              </Text>
            </View>

            <View style={{ width: 1, backgroundColor: "#E5E7EB", marginHorizontal: 16 }} />

            <View style={{ flex: 1, alignItems: "center" }}>
              <View style={{
                width: 40,
                height: 40,
                backgroundColor: "#F59E0B",
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 8,
              }}>
                <Ionicons name="card" size={20} color="white" />
              </View>
              <Text style={{ fontSize: 12, color: "#6B7280", fontWeight: "500", marginBottom: 4 }}>
                Total Cost
              </Text>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#0B4057" }}>
                {rental.rcPrice} RC
              </Text>
            </View>
          </View>
        </View>

        {/* Station & Location Details */}
        <View style={{
          backgroundColor: "white",
          borderRadius: 20,
          padding: 20,
          marginBottom: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 5,
          borderWidth: 1,
          borderColor: "#F3F4F6",
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: "700",
            color: "#083A4C",
            marginBottom: 16,
          }}>
            Location Details
          </Text>

          {/* Station Information */}
          <View style={{
            backgroundColor: "#F8FAFB",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#E5E7EB",
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Ionicons name="location" size={20} color="#3B82F6" />
              <Text style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#374151",
                marginLeft: 8,
              }}>
                Station Details
              </Text>
            </View>
            
            <View style={{ marginLeft: 28 }}>
              <Text style={{
                fontSize: 15,
                fontWeight: "600",
                color: "#374151",
                marginBottom: 4,
              }}>
                {rental.selectedStationId?.stationName}
              </Text>
              <Text style={{
                fontSize: 13,
                color: "#6B7280",
                marginBottom: 2,
              }}>
                {rental.selectedStationId?.stationLocation}
              </Text>
              <Text style={{
                fontSize: 12,
                color: "#9CA3AF",
              }}>
                Station ID: {rental.selectedStationId?.stationId} • {rental.selectedStationId?.bikeCount} bikes available
              </Text>
            </View>
          </View>

          {/* Coordinates */}
          <View style={{
            backgroundColor: "#F8FAFB",
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: "#E5E7EB",
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Ionicons name="navigate" size={20} color="#10B981" />
              <Text style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#374151",
                marginLeft: 8,
              }}>
                Trip Coordinates
              </Text>
            </View>
            
            <View style={{ marginLeft: 28 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ fontSize: 13, color: "#6B7280", fontWeight: "500" }}>
                  Start Location:
                </Text>
                <Text style={{ fontSize: 13, color: "#374151" }}>
                  {rental.fromLatitude.toFixed(6)}, {rental.fromLongitude.toFixed(6)}
                </Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ fontSize: 13, color: "#6B7280", fontWeight: "500" }}>
                  End Location:
                </Text>
                <Text style={{ fontSize: 13, color: "#374151" }}>
                  {rental.latitude.toFixed(6)}, {rental.longitude.toFixed(6)}
                </Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: "#6B7280", fontWeight: "500" }}>
                  User Location:
                </Text>
                <Text style={{ fontSize: 13, color: "#374151" }}>
                  {rental.userLatitude.toFixed(6)}, {rental.userLongitude.toFixed(6)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Timeline */}
        <View style={{
          backgroundColor: "white",
          borderRadius: 20,
          padding: 20,
          marginBottom: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 5,
          borderWidth: 1,
          borderColor: "#F3F4F6",
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: "700",
            color: "#083A4C",
            marginBottom: 16,
          }}>
            Timeline
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <View style={{
              width: 40,
              height: 40,
              backgroundColor: "#DCFCE7",
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 16,
            }}>
              <Ionicons name="play" size={20} color="#16A34A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 15,
                fontWeight: "600",
                color: "#374151",
                marginBottom: 2,
              }}>
                Trip Started
              </Text>
              <Text style={{
                fontSize: 13,
                color: "#6B7280",
              }}>
                {formatDate(rental.createdAt)}
              </Text>
            </View>
          </View>

          {!rental.isRented && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{
                width: 40,
                height: 40,
                backgroundColor: "#FEF3C7",
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}>
                <Ionicons name="checkmark" size={20} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: 2,
                }}>
                  Trip Completed
                </Text>
                <Text style={{
                  fontSize: 13,
                  color: "#6B7280",
                }}>
                  {formatDate(rental.updatedAt)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* User Information */}
        <View style={{
          backgroundColor: "white",
          borderRadius: 20,
          padding: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 5,
          borderWidth: 1,
          borderColor: "#F3F4F6",
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: "700",
            color: "#083A4C",
            marginBottom: 16,
          }}>
            Trip Information
          </Text>

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: "#6B7280", fontWeight: "500" }}>
              Rider:
            </Text>
            <Text style={{ fontSize: 14, color: "#374151", fontWeight: "600" }}>
              {rental.userId.userName}
            </Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: "#6B7280", fontWeight: "500" }}>
              Email:
            </Text>
            <Text style={{ fontSize: 14, color: "#374151", fontWeight: "600" }}>
              {rental.userId.email}
            </Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: "#6B7280", fontWeight: "500" }}>
              Available RC:
            </Text>
            <Text style={{ fontSize: 14, color: "#374151", fontWeight: "600" }}>
              {rental.userId.rc} RC
            </Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 14, color: "#6B7280", fontWeight: "500" }}>
              Trip ID:
            </Text>
            <Text style={{ fontSize: 14, color: "#374151", fontWeight: "600" }}>
              {rental._id.slice(-8)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RentalDetail;