import { fetchUserRentBike } from "@/api/rentBike";
import { StationData } from "@/api/sampleData";
import { images } from "@/constants/images";
import Feather from "@expo/vector-icons/Feather";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import RentUserBike from "./user/station/RentUserBike";

const Directions = () => {
  const [openUserMapNavigation, setOpenUserMapNavigation] = useState(false);
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
    <LinearGradient
      colors={["#737373", "#37A77D"]}
      start={{ x: 0.5, y: 1 }}
      end={{ x: 0.5, y: 0 }}
      style={{ borderRadius: 32, padding: 12 }}
    >
      {/* Top Row: Station info + Map */}
      <View style={{ flexDirection: "row" }}>
        {/* Station Info */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "flex-start",
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: "white",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              elevation: 3,
            }}
          >
            <Image
              source={images.parkBike}
              style={{ width: 32, height: 32 }}
              resizeMode="contain"
            />
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={{ color: "white", fontWeight: "700", fontSize: 18 }}>
              {station?.stationName}
            </Text>
            <Text style={{ color: "#E5E5E5", fontSize: 14 }}>
              {station?.location}
            </Text>
          </View>
        </View>

        {/* Map */}
        <View
          style={{
            width: "40%",
            height: 176,
            borderRadius: 32,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          }}
        >
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: station?.lattitude,
              longitude: station?.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            zoomEnabled={true}
            scrollEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: station?.lattitude,
                longitude: station?.longitude,
              }}
            />
          </MapView>
        </View>
      </View>

      {/* Overlay Bike Image */}
      <View
        style={{
          position: "absolute",
          top: 72,
          left: 0,
          right: 0,
        }}
      >
        <Image
          source={images.rideBike}
          style={{ width: 224, height: 144 }}
          resizeMode="contain"
        />
      </View>

      {/* Info Footer */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#00A99D", // bg-secondary
          borderRadius: 50,
          paddingHorizontal: 16,
          paddingVertical: 8,
          marginTop: 15,
        }}
      >
        <View style={{ alignItems: "flex-start" }}>
          <Text style={{ color: "#A3A3A3", fontSize: 12, fontWeight: "300" }}>
            Distance
          </Text>
          <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
            500m away
          </Text>
        </View>
        <View style={{ alignItems: "flex-start" }}>
          <Text style={{ color: "#A3A3A3", fontSize: 12, fontWeight: "300" }}>
            ETA
          </Text>
          <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
            2 min
          </Text>
        </View>
        <View style={{ alignItems: "flex-start" }}>
          <Text style={{ color: "#A3A3A3", fontSize: 12, fontWeight: "300" }}>
            Availability
          </Text>
          <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
            {station.availability}
          </Text>
        </View>

        {rentedBikeData && (
          <TouchableOpacity
            onPress={() => setOpenUserMapNavigation(true)}
            style={{
              backgroundColor: "white",
              width: 56,
              height: 56,
              borderRadius: 28,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Feather name="arrow-up-right" size={24} color="black" />
          </TouchableOpacity>
        )}

        <RentUserBike
          visible={openUserMapNavigation}
          onClose={() => setOpenUserMapNavigation(false)}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
});

export default Directions;
