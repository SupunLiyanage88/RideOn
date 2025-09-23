import { getUserIncident } from "@/api/incident";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import IncidentScreenDialog from "./IncidentScreenDialog";

const IncidentScreen = () => {
  const [modalVisible, setModalVisible] = React.useState(false);

  const {
    data: incidentData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["incident-data"],
    queryFn: getUserIncident,
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="red" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-500 font-semibold">
          Failed to load incidents
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 relative">
      {/* Header */}
      <View className="p-4 border-b border-gray-300 bg-white">
        <Text className="text-2xl font-bold text-center text-gray-800">
          Incident Dashboard
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="bg-red-500 px-4 py-2 rounded-2xl"
      >
        <Text className="text-white font-semibold text-base">
          Add a Incident
        </Text>
      </TouchableOpacity>

      {/* Incident list */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }} // extra bottom padding so button doesn’t overlap last item
        showsVerticalScrollIndicator={false}
      >
        {incidentData?.map((incident: any) => (
          <View
            key={incident._id}
            className="mb-4 p-4 rounded-2xl bg-white shadow"
          >
            <Text className="font-bold text-lg text-gray-800">
              {incident.incidentType}
            </Text>
            <Text className="text-gray-600">
              How Serious: {incident.howSerious}
            </Text>
            <Text className="text-gray-600">
              Description: {incident.description}
            </Text>
            <Text className="text-gray-600">
              Date: {new Date(incident.date).toLocaleDateString()}
            </Text>
            <Text className="text-gray-600">
              Time: {new Date(incident.time).toLocaleTimeString()}
            </Text>
            <Text className="text-gray-600">
              User Email: {incident.user.email}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Floating button */}
      <View className="absolute bottom-6 right-6 z-10">
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="bg-red-500 px-6 py-3 rounded-full shadow-lg"
        >
          <Text className="text-white font-semibold text-base">+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Add Incident Dialog */}
      <IncidentScreenDialog
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default IncidentScreen;
