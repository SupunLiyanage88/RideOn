import { Bike, getBikesByUser } from "@/api/bike";
import UseCurrentUser from "@/hooks/useCurrentUser";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { Image, Text, View } from "react-native";
import Loader from "../../Loader";

const ProfileHeader = () => {
  const [selectedData, setSelectedData] = useState<Bike | null>(null);
  const { data: bikeStatData, isFetching: isBikeStatLoading } = useQuery({
    queryKey: ["bike-stat-user-data"],
    queryFn: getBikesByUser,
  });
  const { user } = UseCurrentUser();

  const username = user?.userName || "Guest";
  const avatarUrl = `https://api.dicebear.com/9.x/adventurer/png?seed=${encodeURIComponent(
    username
  )}`;

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

      <View style={{ flexDirection: "row", marginTop: 20, gap: 16 }}>
        {/* Bikes Card */}
        <View
          style={{
            backgroundColor: "white",
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          {isBikeStatLoading ? (
            <View style={{margin: 8 }}>
              <Loader size={"small"} showText={false} />
            </View>
          ) : (
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "800",
                  color: "#37A77D",
                  textAlign: "center",
                }}
              >
                {bikeStatData ? bikeStatData.length : 0}
              </Text>

              <Text
                style={{
                  fontSize: 11,
                  color: "#6b7280",
                  marginTop: 2,
                  fontWeight: "600",
                }}
              >
                Your Bikes
              </Text>
            </View>
          )}
        </View>

        {/* Rentals Card */}
        <View
          style={{
            backgroundColor: "white",
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              color: "#37A77D",
              textAlign: "center",
            }}
          >
            48
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: "#6b7280",
              marginTop: 2,
              fontWeight: "600",
            }}
          >
            Total Rentals
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ProfileHeader;
