import { StationData } from "@/api/sampleData";
import { images } from "@/constants/images";
import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
const Directions = () => {
  const station = StationData;

  return (
    <LinearGradient
      colors={["#737373", "#37A77D"]}
      start={{ x: 0.5, y: 1 }}
      end={{ x: 0.5, y: 0 }}
      style={{
        borderRadius: 32,
        padding: 12,
      }}
    >
      <View className="flex-row">
        <View className="flex-row">
          <View className="w-14 h-14 rounded-full bg-white justify-center items-center shadow-md">
            <Image
              source={images.parkBike}
              className="w-8 h-8"
              resizeMode="contain"
            />
          </View>

          <View className="ml-3">
            <Text className="text-white font-bold text-lg">
              {station?.stationName}
            </Text>
            <Text className="text-gray-200 text-sm">
              {station?.location}
            </Text>
          </View>
        </View>

        <View className="w-[40%] h-44 rounded-[2rem] overflow-hidden ml-3 shadow-md">
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

      <View className="absolute top-28">
        <Image
          source={images.rideBike}
          className="w-56 h-36"
          resizeMode="contain"
        />
      </View>

      <View className="bg-secondary h-20 rounded-full flex-row justify-between items-center pl-6 pr-4 py-2 mt-14">
        <View>
          <Text className="text-gray-400 font-light text-sm">Distance</Text>
          <Text className="text-white font-semibold text-lg">500m away</Text>
        </View>
        <View>
          <Text className="text-gray-400 font-light text-sm">ETA</Text>
          <Text className="text-white font-semibold text-lg">2 min</Text>
        </View>
        <View>
          <Text className="text-gray-400 font-light text-sm">Availabilty</Text>
          <Text className="text-white font-semibold text-lg">
            {station.availability}
          </Text>
        </View>

        <View className="bg-white h-14 w-14 rounded-full items-center justify-center">
          <Text className="text-white font-semibold ">
            <Feather name="arrow-up-right" size={24} color="black" />
          </Text>
        </View>
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
