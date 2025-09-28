import { fetchBikeStation } from "@/api/bikeStation";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

const Me = () => {
  const [bikeStationModalVisible, setBikeStationModalVisible] = useState(false);
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
      </SafeAreaView>
    );
  }

  

  return (
    <SafeAreaView className="flex-1">

      

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {bikeStationData.map((station: any) => (
          <View
            key={station._id}
            className="bg-white p-4 rounded-2xl mb-4 shadow"
          >
            <Text className="text-lg font-bold text-gray-800">
              {station.stationName}
            </Text>
            <Text className="text-gray-600 mb-2">
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

            <Text className="mt-2 text-sm text-gray-500">
              Lat: {station.latitude}, Lng: {station.longitude}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Me;
