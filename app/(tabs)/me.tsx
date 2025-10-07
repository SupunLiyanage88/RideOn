import { logout } from "@/api/auth";
import { fetchBikeStation } from "@/api/bikeStation";
import queryClient from "@/state/queryClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

const LogoutButton = () => {
  const router = useRouter();

  const { mutate: logoutMutation, isPending } = useMutation({
    mutationFn: logout,
    onSuccess: async (data) => {
      await AsyncStorage.removeItem("token");
      queryClient.invalidateQueries({ queryKey: ["current-user"] });

      alert("Logout Success.");
      console.log("Logout successful:", data);
      router.replace("/(auth)/registerScreen");
    },
    onError: (data) => {
      alert("Logout Failed. Please check your credentials.");
      console.log(data);
    },
  });

  const handleLogout = async () => {
    logoutMutation();
  };

  return (
    <TouchableOpacity
      onPress={handleLogout}
      style={{
        backgroundColor: "#ef4444",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
      }}
    >
      <Text style={{
        color: "white",
        fontWeight: "600",
        fontSize: 16,
      }}>
        {isPending ? "Logging out" : "Log out"}
      </Text>
    </TouchableOpacity>
  );
};

const Me = () => {
  const { data: bikeStationData, isFetching: isBikeStationLoading } = useQuery({
    queryKey: ["station-data"],
    queryFn: fetchBikeStation,
  });

  if (isBikeStationLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="blue" />
      </SafeAreaView>
    );
  }

  if (!bikeStationData || bikeStationData.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No bike stations found</Text>
        <LogoutButton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {bikeStationData.map((station: any) => (
          <View
            key={station._id}
            style={{
              backgroundColor: "white",
              padding: 16,
              borderRadius: 16,
              marginBottom: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <Text style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#1f2937",
            }}>
              {station.stationName}
            </Text>
            <Text style={{
              color: "#4b5563",
              marginBottom: 8,
            }}>
              {station.stationLocation}
            </Text>

            {/* Mini Map */}
            <MapView
              style={{ height: 150, borderRadius: 12 }}
              initialRegion={{
                latitude: station.latitude,
                longitude: station.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: station.latitude,
                  longitude: station.longitude,
                }}
                title={station.stationName}
              />
            </MapView>

            <Text style={{
              marginTop: 8,
              fontSize: 14,
              color: "#6b7280",
            }}>
              Lat: {station.latitude}, Lng: {station.longitude}
            </Text>
          </View>
        ))}

        <View style={{ marginTop: 16 }}>
          <LogoutButton />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Me;