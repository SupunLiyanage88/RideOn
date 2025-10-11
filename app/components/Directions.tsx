import { fetchUserRentBike } from "@/api/rentBike";
import { StationData } from "@/api/sampleData";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import RentUserBike from "./user/station/RentUserBike";

const { width } = Dimensions.get("window");

const Directions = () => {
  const [openUserMapNavigation, setOpenUserMapNavigation] = useState(false);
  const router = useRouter();
  const {
    data: rentedBikeData,
    refetch: refetchRentedBikeData,
    isLoading: rentedBikeLoading,
  } = useQuery({
    queryKey: ["station-rented-bike"],
    queryFn: fetchUserRentBike,
  });
  const station = StationData;

  return (
    <View style={{ padding: 0 }}>
      {/* Header Section */}
      <LinearGradient
        colors={["#083A4C", "#37A77D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          padding: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            Nearest Station
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/search")}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              View All
            </Text>
          </TouchableOpacity>
        </View>

        {/* Station Info Card */}
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 16,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "white",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 16,
            }}
          >
            <MaterialCommunityIcons name="map-marker" size={24} color="#37A77D" />
          </View>
          
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 4,
              }}
            >
              {station?.stationName}
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 14,
              }}
            >
              {station?.location}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              if (!rentedBikeData) {
                router.push("/(tabs)/search");
              } else {
                setOpenUserMapNavigation(true);
              }
            }}
            style={{
              backgroundColor: "#37A77D",
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Map Section */}
      <View
        style={{
          height: 200,
          backgroundColor: "#F8FAFC",
        }}
      >
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: station?.lattitude || 6.9147,
            longitude: station?.longitude || 79.9731,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          zoomEnabled={true}
          scrollEnabled={true}
          pitchEnabled={false}
          rotateEnabled={false}
        >
          <Marker
            coordinate={{
              latitude: station?.lattitude || 6.9147,
              longitude: station?.longitude || 79.9731,
            }}
            pinColor="#37A77D"
          />
        </MapView>
      </View>

      {/* Stats Footer */}
      <View
        style={{
          backgroundColor: "white",
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          paddingHorizontal: 20,
          paddingVertical: 16,
          flexDirection: "row",
          justifyContent: "space-around",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <View style={{ alignItems: "center", flex: 1 }}>
          <View
            style={{
              backgroundColor: "#37A77D20",
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons name="location-outline" size={20} color="#37A77D" />
          </View>
          <Text
            style={{
              fontSize: 12,
              color: "#6B7280",
              fontWeight: "500",
              marginBottom: 2,
            }}
          >
            Distance
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#083A4C",
              fontWeight: "bold",
            }}
          >
            500m
          </Text>
        </View>

        <View style={{ alignItems: "center", flex: 1 }}>
          <View
            style={{
              backgroundColor: "#083A4C20",
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons name="time-outline" size={20} color="#083A4C" />
          </View>
          <Text
            style={{
              fontSize: 12,
              color: "#6B7280",
              fontWeight: "500",
              marginBottom: 2,
            }}
          >
            ETA
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#083A4C",
              fontWeight: "bold",
            }}
          >
            2 min
          </Text>
        </View>

        <View style={{ alignItems: "center", flex: 1 }}>
          <View
            style={{
              backgroundColor: "#37A77D20",
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <MaterialCommunityIcons name="motorbike" size={20} color="#37A77D" />
          </View>
          <Text
            style={{
              fontSize: 12,
              color: "#6B7280",
              fontWeight: "500",
              marginBottom: 2,
            }}
          >
            Available
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#083A4C",
              fontWeight: "bold",
            }}
          >
            {station?.availability || "12"}
          </Text>
        </View>

        <View style={{ alignItems: "center", flex: 1 }}>
          <TouchableOpacity
            onPress={() => {
              if (!rentedBikeData) {
                router.push("/(tabs)/search");
              } else {
                setOpenUserMapNavigation(true);
              }
            }}
            style={{
              backgroundColor: "#37A77D",
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons name="navigate" size={20} color="white" />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 12,
              color: "#6B7280",
              fontWeight: "500",
              marginBottom: 2,
            }}
          >
            Navigate
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: "#37A77D",
              fontWeight: "600",
            }}
          >
            Go
          </Text>
        </View>
      </View>

      <RentUserBike
        visible={openUserMapNavigation}
        onClose={() => setOpenUserMapNavigation(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
});

export default Directions;
