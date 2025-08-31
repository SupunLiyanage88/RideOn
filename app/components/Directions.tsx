import { StationData } from "@/api/sampleData";
import { images } from "@/constants/images";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Text, View } from "react-native";

export default function DirectionsComponent() {
  const station = StationData[0]; // since it's an array

  return (
    <View className="w-full h-44 rounded-2xl overflow-hidden shadow-lg">
      <LinearGradient
        colors={["#737373", "#37A77D"]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        className="w-full h-full"
      >
        <View className="flex flex-row items-center p-4 space-x-4">
          {/* Icon Circle */}
          <View className="rounded-full bg-white justify-center items-center w-16 h-16 shadow-md">
            <Image source={images.parkBike} className="w-10 h-10" resizeMode="contain" />
          </View>

          {/* Station Info */}
          <View className="flex-1">
            <Text className="text-white font-bold text-lg">{station.stationName}</Text>
            <Text className="text-gray-200 text-sm">{station.location}</Text>
            <Text className="text-xs text-gray-300 mt-1">Type: {station.availability}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
