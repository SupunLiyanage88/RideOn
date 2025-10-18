import { getBikesByUser, type Bike } from "@/api/bike";
import { fetchUserRentBikeHistory, type RentalHistoryItem } from "@/api/rentBike";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
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

const BikeOwnerEarnings = () => {
  const router = useRouter();
  const { bikeId } = useLocalSearchParams<{ bikeId: string }>();
  
  const { 
    data: userBikes, 
    isFetching: isBikesLoading, 
    refetch: refetchBikes 
  } = useQuery<Bike[]>({
    queryKey: ["bike-stat-user-data"],
    queryFn: getBikesByUser,
  });

  const { 
    data: allRentalHistory, 
    isFetching: isRentalLoading, 
    refetch: refetchRentals 
  } = useQuery<RentalHistoryItem[]>({
    queryKey: ["all-rental-history"],
    queryFn: fetchUserRentBikeHistory,
  });

  console.log("All Rental History:", allRentalHistory);

  const handleRefresh = () => {
    refetchBikes();
    refetchRentals();
  };

  // Find the specific bike
  const selectedBike = React.useMemo(() => {
    if (!userBikes || !bikeId) return null;
    return userBikes.find(bike => bike.bikeId === bikeId) || null;
  }, [userBikes, bikeId]);

  // Filter rentals for bikes owned by this user (where others rented their bikes)
  const ownerRentals = React.useMemo(() => {
    if (!allRentalHistory) return [];
    
    // Filter rentals where the current user is the bike owner (createdBy)
    return allRentalHistory.filter(rental => 
      rental.bikeId.createdBy && 
      rental.bikeId.createdBy._id // This should match the current user's ID
    );
  }, [allRentalHistory]);

  // Filter rentals for specific bike if bikeId is provided
  const bikeSpecificRentals = React.useMemo(() => {
    if (!bikeId) return ownerRentals;
    return ownerRentals.filter(rental => rental.bikeId.bikeId === bikeId);
  }, [ownerRentals, bikeId]);

  // Calculate earnings and statistics with bike grouping logic
  const earnings = React.useMemo(() => {
    const rentalsToAnalyze = bikeId ? bikeSpecificRentals : ownerRentals;
    
    // Group rentals by bikeId to handle multiple rentals of same bike
    const bikeGroups = rentalsToAnalyze.reduce((acc, rental) => {
      const bikeIdKey = rental.bikeId.bikeId;
      if (!acc[bikeIdKey]) {
        acc[bikeIdKey] = {
          bikeInfo: rental.bikeId,
          rentals: [],
          totalDistance: 0,
          lowestCondition: rental.bikeId.condition,
          totalRcPrice: 0,
        };
      }
      
      acc[bikeIdKey].rentals.push(rental);
      acc[bikeIdKey].totalDistance += rental.bikeId.distance; // Add bike's individual distance
      acc[bikeIdKey].lowestCondition = Math.min(acc[bikeIdKey].lowestCondition, rental.bikeId.condition);
      acc[bikeIdKey].totalRcPrice += rental.rcPrice;
      
      return acc;
    }, {} as Record<string, any>);

    // Calculate totals
    const totalRcRevenue = rentalsToAnalyze.reduce((sum, rental) => sum + rental.rcPrice, 0);
    const totalOwnerEarnings = Math.round(totalRcRevenue * 0.1); // 10% profit for owner
    const totalTrips = rentalsToAnalyze.length;
    const activeRentals = rentalsToAnalyze.filter(rental => rental.isRented).length;
    const completedTrips = rentalsToAnalyze.filter(rental => !rental.isRented).length;
    const totalRentalDistance = rentalsToAnalyze.reduce((sum, rental) => sum + rental.distance, 0);
    
    // Group by renter with 10% earnings calculation
    const renterStats = rentalsToAnalyze.reduce((acc, rental) => {
      const renterId = rental.userId._id;
      if (!acc[renterId]) {
        acc[renterId] = {
          user: rental.userId,
          trips: 0,
          earnings: 0, // This will be 10% of their total rcPrice
          totalDistance: 0,
          lastRental: rental.createdAt,
        };
      }
      acc[renterId].trips += 1;
      acc[renterId].earnings += Math.round(rental.rcPrice * 0.1); // 10% profit
      acc[renterId].totalDistance += rental.distance;
      
      // Update last rental if this one is more recent
      if (new Date(rental.createdAt) > new Date(acc[renterId].lastRental)) {
        acc[renterId].lastRental = rental.createdAt;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return {
      totalEarnings: totalOwnerEarnings, // 10% of total RC revenue
      totalRcRevenue, // Total RC paid by renters
      totalTrips,
      activeRentals,
      completedTrips,
      totalRentalDistance, // Distance covered in rentals
      bikeGroups: Object.values(bikeGroups), // Grouped bike information
      renterStats: Object.values(renterStats),
      recentRentals: rentalsToAnalyze
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10),
    };
  }, [bikeSpecificRentals, ownerRentals, bikeId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
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

  const isLoading = isBikesLoading || isRentalLoading;

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
          {bikeId ? `${selectedBike?.bikeModel || 'Bike'} Earnings` : 'My Bike Earnings'}
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
        ) : earnings.totalTrips > 0 ? (
          <>
            {/* Earnings Summary */}
            <View style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: 20,
              marginBottom: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
            }}>
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}>
                <View style={{
                  width: 48,
                  height: 48,
                  backgroundColor: "#10B981" + '20',
                  borderRadius: 24,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}>
                  <Ionicons name="cash" size={24} color="#10B981" />
                </View>
                <View>
                  <Text style={{
                    fontSize: 24,
                    fontWeight: "800",
                    color: "#10B981",
                  }}>
                    {earnings.totalEarnings} RC
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: "#6B7280",
                    marginTop: 2,
                  }}>
                    Your Profit (10%)
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: "#9CA3AF",
                    marginTop: 1,
                  }}>
                    From {earnings.totalRcRevenue} RC total revenue
                  </Text>
                </View>
              </View>

              <View style={{
                flexDirection: "row",
                justifyContent: "space-around",
                backgroundColor: "#F8FAFB",
                borderRadius: 12,
                padding: 16,
              }}>
                <View style={{ alignItems: "center" }}>
                  <Text style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "#083A4C",
                  }}>
                    {earnings.totalTrips}
                  </Text>
                  <Text style={{
                    fontSize: 11,
                    color: "#6B7280",
                    marginTop: 4,
                  }}>
                    Total Trips
                  </Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "#3B82F6",
                  }}>
                    {earnings.activeRentals}
                  </Text>
                  <Text style={{
                    fontSize: 11,
                    color: "#6B7280",
                    marginTop: 4,
                  }}>
                    Active Now
                  </Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "#F59E0B",
                  }}>
                    {earnings.totalRentalDistance.toFixed(0)}
                  </Text>
                  <Text style={{
                    fontSize: 11,
                    color: "#6B7280",
                    marginTop: 4,
                  }}>
                    Total KM
                  </Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "#8B5CF6",
                  }}>
                    {earnings.renterStats.length}
                  </Text>
                  <Text style={{
                    fontSize: 11,
                    color: "#6B7280",
                    marginTop: 4,
                  }}>
                    Customers
                  </Text>
                </View>
              </View>
            </View>

            {/* Key Insights */}
            <View style={{
              backgroundColor: "#F0F9FF",
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: "#BFDBFE",
            }}>
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}>
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <Text style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#1E40AF",
                  marginLeft: 8,
                }}>
                  Rental Insights
                </Text>
              </View>
              <Text style={{
                fontSize: 14,
                color: "#1E40AF",
                lineHeight: 20,
              }}>
                You earn 10% commission from each rental. Total revenue generated by your bikes: {earnings.totalRcRevenue} RC.
                {earnings.bikeGroups.length > 1 && ` You have ${earnings.bikeGroups.length} different bikes being rented.`}
                {earnings.activeRentals > 0 && ` Currently ${earnings.activeRentals} bike${earnings.activeRentals > 1 ? 's are' : ' is'} being rented.`}
              </Text>
            </View>

            {/* Bike Performance */}
            {earnings.bikeGroups.length > 0 && (
              <View style={{
                backgroundColor: "white",
                borderRadius: 20,
                padding: 20,
                marginBottom: 24,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 5,
              }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#083A4C",
                  marginBottom: 16,
                }}>
                  Bike Performance
                </Text>

                {earnings.bikeGroups
                  .sort((a, b) => b.totalRcPrice - a.totalRcPrice)
                  .map((bikeGroup, index) => (
                  <View
                    key={bikeGroup.bikeInfo.bikeId}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 12,
                      borderBottomWidth: index < earnings.bikeGroups.length - 1 ? 1 : 0,
                      borderBottomColor: "#F3F4F6",
                    }}
                  >
                    <View style={{
                      width: 40,
                      height: 40,
                      backgroundColor: getBikeTypeColor(bikeGroup.bikeInfo.fuelType) + '20',
                      borderRadius: 20,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}>
                      <Ionicons 
                        name={getBikeTypeIcon(bikeGroup.bikeInfo.fuelType)} 
                        size={18} 
                        color={getBikeTypeColor(bikeGroup.bikeInfo.fuelType)} 
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: "#374151",
                        marginBottom: 2,
                      }}>
                        {bikeGroup.bikeInfo.bikeModel} ({bikeGroup.bikeInfo.bikeId})
                      </Text>
                      <Text style={{
                        fontSize: 12,
                        color: "#6B7280",
                      }}>
                        {bikeGroup.rentals.length} rentals • Total distance: {bikeGroup.totalDistance} km • Condition: {bikeGroup.lowestCondition}%
                      </Text>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: "#10B981",
                      }}>
                        {Math.round(bikeGroup.totalRcPrice * 0.1)} RC
                      </Text>
                      <Text style={{
                        fontSize: 11,
                        color: "#6B7280",
                      }}>
                        From {bikeGroup.totalRcPrice} RC
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Top Customers */}
            {earnings.renterStats.length > 0 && (
              <View style={{
                backgroundColor: "white",
                borderRadius: 20,
                padding: 20,
                marginBottom: 24,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 5,
              }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#083A4C",
                  marginBottom: 16,
                }}>
                  Top Customers
                </Text>

                {earnings.renterStats
                  .sort((a, b) => b.earnings - a.earnings)
                  .slice(0, 5)
                  .map((renter, index) => (
                  <View
                    key={renter.user._id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 12,
                      borderBottomWidth: index < 4 ? 1 : 0,
                      borderBottomColor: "#F3F4F6",
                    }}
                  >
                    <View style={{
                      width: 40,
                      height: 40,
                      backgroundColor: "#F3F4F6",
                      borderRadius: 20,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: "#083A4C",
                      }}>
                        {renter.user.userName.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: "#374151",
                        marginBottom: 2,
                      }}>
                        {renter.user.userName}
                      </Text>
                      <Text style={{
                        fontSize: 12,
                        color: "#6B7280",
                      }}>
                        {renter.trips} trips • {renter.totalDistance.toFixed(1)} km
                      </Text>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: "#10B981",
                      }}>
                        {renter.earnings} RC
                      </Text>
                      <Text style={{
                        fontSize: 11,
                        color: "#6B7280",
                      }}>
                        Last: {formatDate(renter.lastRental)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Recent Rentals */}
            <View style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: 20,
              marginBottom: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 5,
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#083A4C",
                marginBottom: 16,
              }}>
                Recent Rentals
              </Text>

              {earnings.recentRentals.map((rental, index) => (
                <TouchableOpacity
                  key={rental._id}
                  style={{
                    paddingVertical: 16,
                    borderBottomWidth: index < earnings.recentRentals.length - 1 ? 1 : 0,
                    borderBottomColor: "#F3F4F6",
                  }}
                  onPress={() => {
                    router.push(`/components/user/profile/RentalDetail?rentalId=${rental._id}`);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}>
                    <View style={{
                      width: 36,
                      height: 36,
                      backgroundColor: getBikeTypeColor(rental.bikeId.fuelType) + '20',
                      borderRadius: 18,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}>
                      <Ionicons 
                        name={getBikeTypeIcon(rental.bikeId.fuelType)} 
                        size={18} 
                        color={getBikeTypeColor(rental.bikeId.fuelType)} 
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 4,
                      }}>
                        <Text style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: "#374151",
                        }}>
                          {rental.userId.userName}
                        </Text>
                        <View style={{
                          backgroundColor: rental.isRented ? "#DCFCE7" : "#FEF3C7",
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 10,
                        }}>
                          <Text style={{
                            fontSize: 9,
                            fontWeight: "700",
                            color: rental.isRented ? "#16A34A" : "#D97706",
                            textTransform: "uppercase",
                          }}>
                            {rental.isRented ? "Active" : "Completed"}
                          </Text>
                        </View>
                      </View>

                      <Text style={{
                        fontSize: 13,
                        color: "#6B7280",
                        marginBottom: 4,
                      }}>
                        {rental.bikeId.bikeModel} • {rental.distance.toFixed(1)} km • {formatDuration(rental.duration)}
                      </Text>

                      <View style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}>
                        <Text style={{
                          fontSize: 12,
                          color: "#9CA3AF",
                        }}>
                          {formatDate(rental.createdAt)}
                        </Text>
                        <View style={{ alignItems: "flex-end" }}>
                          <Text style={{
                            fontSize: 14,
                            fontWeight: "700",
                            color: "#10B981",
                          }}>
                            +{Math.round(rental.rcPrice * 0.1)} RC
                          </Text>
                          <Text style={{
                            fontSize: 10,
                            color: "#6B7280",
                          }}>
                            (10% of {rental.rcPrice})
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Ionicons name="chevron-forward" size={16} color="#9CA3AF" style={{ marginLeft: 8 }} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <View style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 100,
          }}>
            <Ionicons name="cash-outline" size={80} color="#D1D5DB" />
            <Text style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#6B7280",
              marginTop: 16,
              textAlign: "center",
            }}>
              No Earnings Yet
            </Text>
            <Text style={{
              fontSize: 14,
              color: "#9CA3AF",
              marginTop: 8,
              textAlign: "center",
              paddingHorizontal: 40,
            }}>
              {bikeId 
                ? "This bike hasn't been rented by others yet. Make sure it's available for rental and properly listed!" 
                : "None of your bikes have been rented by others yet. Make sure they're available for rental and properly listed!"
              }
            </Text>
            
            <TouchableOpacity
              style={{
                backgroundColor: "#083A4C",
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 12,
                marginTop: 20,
              }}
              onPress={() => router.push("/(tabs)/search")}
            >
              <Text style={{
                color: "white",
                fontSize: 14,
                fontWeight: "600",
              }}>
                Explore Rental Options
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default BikeOwnerEarnings;