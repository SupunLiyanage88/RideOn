import { Accident, getAllAccident } from "@/api/accident";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;

const AccidentManagement = () => {
  const {
    data: accidentData,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["accident-data"],
    queryFn: getAllAccident,
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 pt-6 pb-4 bg-white border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-900">
              Accident Reports
            </Text>
            <Text className="text-gray-500 mt-1">
              {accidentData?.length || 0} reported Accidents
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-[#0B4057] p-3 rounded-xl"
          >
            <MaterialIcons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {isFetching && (
        <View className="flex-1 justify-center items-center">
          <View className="p-6 rounded-2xl items-center">
            <ActivityIndicator size="large" color="#0B4057" />
            <Text className="text-gray-600 mt-3 font-medium">
              Loading Accident Report...
            </Text>
          </View>
        </View>
      )}

      {!isFetching && (!accidentData || accidentData.length === 0) && (
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white p-8 rounded-2xl shadow-sm items-center">
            <MaterialIcons name="warning" size={48} color="#9CA3AF" />
            <Text className="text-xl font-bold text-gray-700 mt-4">
              No Accidents Reported
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              All clear! No accident reports have been submitted yet.
            </Text>
          </View>
        </View>
      )}

      {!isFetching && accidentData && accidentData.length > 0 && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 px-4 pt-4"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {accidentData.map((accident: Accident) => (
            <View
              key={accident._id}
              className="bg-white rounded-2xl mb-4 shadow-lg border border-gray-100 overflow-hidden"
            >
              <View className="p-4 pb-3">
                <View className="flex-row items-center">
                  <MaterialIcons name="warning" size={20} color="#DC2626" />
                  <Text className="text-lg font-bold text-gray-900 ml-2">
                    {accident.title}
                  </Text>
                </View>
              </View>

              <View className="px-4">
                <MapView
                  className="rounded-xl"
                  style={{ width: "100%", height: 140 }}
                  initialRegion={{
                    latitude: accident.latitude,
                    longitude: accident.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  pitchEnabled={false}
                  rotateEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude: accident.latitude,
                      longitude: accident.longitude,
                    }}
                    title={accident.title}
                  >
                    <MaterialIcons
                      name="location-pin"
                      size={32}
                      color="#DC2626"
                    />
                  </Marker>
                </MapView>
              </View>

              <View className="p-4">
                <View className="bg-gray-50 rounded-xl p-3 mb-3">
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center">
                      <MaterialIcons
                        name="calendar-today"
                        size={16}
                        color="#0B4057"
                      />
                      <Text className="ml-2 text-gray-700 text-sm font-medium">
                        {format(new Date(accident.createdAt), "MMM dd, yyyy")}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <MaterialIcons
                        name="access-time"
                        size={16}
                        color="#0B4057"
                      />
                      <Text className="ml-2 text-gray-700 text-sm font-medium">
                        {format(new Date(accident.createdAt), "hh:mm a")}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="flex-row justify-between mt-2">
                  <TouchableOpacity className="flex-1 bg-gray-100 py-2 rounded-lg mr-2">
                    <Text className="text-gray-700 text-center font-semibold">
                      View Details
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 bg-[#0B4057] py-2 rounded-lg ml-2">
                    <Text className="text-white text-center font-semibold">
                      Take Action
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default AccidentManagement;
