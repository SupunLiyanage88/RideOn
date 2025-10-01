import { logout } from "@/api/auth";
import { fetchBikeStation } from "@/api/bikeStation";
import queryClient from "@/state/queryClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
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
      className="bg-red-500 px-4 py-2 rounded-2xl"
    >
      <Text className="text-white font-semibold text-base">
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
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="blue" />
      </SafeAreaView>
    );
  }

  if (!bikeStationData || bikeStationData.length === 0) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>No bike stations found</Text>
        <LogoutButton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1">
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: bikeStationData[0].latitude,
            longitude: bikeStationData[0].longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {bikeStationData.map((station: any) => (
            <Marker
              key={station._id}
              coordinate={{
                latitude: station.latitude,
                longitude: station.longitude,
              }}
              title={station.stationName}
              description={station.stationLocation}
            />
          ))}
        </MapView>
      </View>
      <View className="p-4">
        <LogoutButton />
      </View>
    </SafeAreaView>
  );
};

export default Me;
