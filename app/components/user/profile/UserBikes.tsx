import { getBikesByUser, type Bike } from "@/api/bike";
import { Ionicons } from "@expo/vector-icons";
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
import UserBikeCard from "../../UserBikeCard";

const UserBikes = () => {
  const router = useRouter();
  const { data: bikeStatData, isFetching: isBikeStatLoading, refetch } = useQuery({
    queryKey: ["bike-stat-user-data"],
    queryFn: getBikesByUser,
  });

  const handleRefresh = () => {
    refetch();
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFB" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: "white",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginRight: 16,
            padding: 8,
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#083A4C" />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: "#083A4C",
            flex: 1,
          }}
        >
          My Bikes
        </Text>
        <TouchableOpacity
          onPress={handleRefresh}
          disabled={isBikeStatLoading}
          style={{
            padding: 8,
          }}
        >
          <Ionicons
            name="refresh"
            size={24}
            color={isBikeStatLoading ? "#9CA3AF" : "#083A4C"}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={isBikeStatLoading}
            onRefresh={handleRefresh}
            colors={["#083A4C"]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {isBikeStatLoading ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 100,
            }}
          >
            <Loader size="large" showText={false} />
          </View>
        ) : bikeStatData && bikeStatData.length > 0 ? (
          <>
            {/* Summary */}
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                padding: 20,
                marginBottom: 24,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#083A4C",
                  marginBottom: 16,
                }}
              >
                Summary
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                }}
              >
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "800",
                      color: "#083A4C",
                    }}
                  >
                    {bikeStatData.length}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#6B7280",
                      marginTop: 4,
                    }}
                  >
                    Total Bikes
                  </Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "800",
                      color: "#10B981",
                    }}
                  >
                    {bikeStatData.filter((bike: Bike) => bike.availability).length}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#6B7280",
                      marginTop: 4,
                    }}
                  >
                    Available
                  </Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "800",
                      color: "#F59E0B",
                    }}
                  >
                    {bikeStatData.filter((bike: Bike) => bike.assigned).length}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#6B7280",
                      marginTop: 4,
                    }}
                  >
                    Assigned
                  </Text>
                </View>
              </View>
            </View>

            {/* Bikes List */}
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#083A4C",
                marginBottom: 16,
              }}
            >
              Your Bikes
            </Text>
            {bikeStatData.map((bike: Bike) => (
              <UserBikeCard key={bike._id} bike={bike} />
            ))}
          </>
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 100,
            }}
          >
            <Ionicons name="bicycle-outline" size={80} color="#D1D5DB" />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#6B7280",
                marginTop: 16,
                textAlign: "center",
              }}
            >
              No Bikes Found
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#9CA3AF",
                marginTop: 8,
                textAlign: "center",
                paddingHorizontal: 40,
              }}
            >
              You don't have any bikes registered yet. Contact support to add bikes to your account.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserBikes;