import { getUserIncident } from "@/api/incident";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import IncidentScreenDialog from "./AddOrEditIncidentScreenDialog";
const IncidentScreen = () => {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editingIncident, setEditingIncident] = React.useState<any | null>(
    null
  );

  const {
    data: incidentData,
    isFetching: isIncidentDataFetching,
    error,
  } = useQuery({
    queryKey: ["incident-data"],
    queryFn: getUserIncident,
  });
  console.log("data", incidentData);
  if (isIncidentDataFetching) {
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
    <SafeAreaView className="flex-1 bg-white ">
      {/* Header */}
      <View>
        <Text className="text-2xl font-bold text-center text-gray-800">
          Incident Dashboard
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          setEditingIncident(null);
          setModalVisible(true);
        }}
        className="bg-red-500 px-6 py-2 rounded-xl my-4 w-auto self-end"
      >
        <Text className="text-white font-extrabold text-base">
          + Add a Incident
        </Text>
      </TouchableOpacity>

      {/* Incident list */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {incidentData?.map((incident: any) => (
          <View
            key={incident._id}
            className="mb-4 p-4 rounded-2xl bg-white shadow"
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="font-bold text-lg text-gray-800">
                {incident.incidentType}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setEditingIncident(incident);
                  setModalVisible(true);
                }}
              >
                <MaterialIcons name="edit" size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <Text className="text-gray-600">
              How Serious: {incident.howSerious}
            </Text>
            <Text className="text-gray-600">
              Description: {incident.description}
            </Text>
            <Text className="text-gray-600">
              Date: {format(new Date(incident?.date), "yyyy-MM-dd")}
            </Text>
            <Text>
              Time:{" "}
              {incident?.time
                ? (() => {
                    try {
                      let timeDate;
                      if (incident.time.includes("T")) {
                        timeDate = new Date(incident.time);
                      } else {
                        timeDate = parse(incident.time, "HH:mm", new Date());
                      }
                      return format(timeDate, "HH:mm");
                    } catch (err) {
                      return "Invalid time";
                    }
                  })()
                : "N/A"}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View className="absolute bottom-6 right-6 z-10">
        <TouchableOpacity
          onPress={() => {
            setEditingIncident(null);
            setModalVisible(true);
          }}
        ></TouchableOpacity>
      </View>

      {/* Add Incident Dialog */}
      <IncidentScreenDialog
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        defaultValues={editingIncident}
      />
    </SafeAreaView>
  );
};

export default IncidentScreen;
