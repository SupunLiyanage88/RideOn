import { getUserIncident, Incident } from "@/api/incident";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
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

  return (
    <SafeAreaView className="flex-1 px-2">
      <Pressable
        onPress={() => {
          setEditingIncident(null);
          setModalVisible(true);
        }}
        className="bg-[#0B4057] rounded-full px-7 py-3 mb-4 w-auto self-end"
      >
        <Text className="text-white font-extrabold text-base">
          + Add a Incident
        </Text>
      </Pressable>

      {isIncidentDataFetching && (
        <View className="m-2">
          <ActivityIndicator size="large" color="#0B4057" />
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {incidentData?.map((incident: Incident) => (
          <View
            key={incident._id}
            className="bg-white p-6 rounded-2xl mb-4 shadow-sm border border-gray-100"
          >
            <View className="flex-row justify-between items-center mb-4">
              <View className="bg-[#0B4057] px-6 py-2 rounded-3xl">
                <Text className="text-white font-semibold text-sm">
                  {incident.incidentType}
                </Text>
              </View>

              <TouchableOpacity
                className="p-2 rounded-full bg-gray-50 active:bg-gray-100"
                onPress={() => {
                  setEditingIncident(incident);
                  setModalVisible(true);
                }}
              >
                <MaterialIcons name="edit" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="space-y-3">
              <View className="flex-row items-center">
                <View
                  className={`w-3 h-3 rounded-full mr-2 ${
                    incident.howSerious?.toLowerCase().includes("critical")
                      ? "bg-red-500"
                      : incident.howSerious?.toLowerCase().includes("high")
                        ? "bg-orange-400"
                        : incident.howSerious?.toLowerCase().includes("medium")
                          ? "bg-yellow-500"
                          : "bg-green-500"
                  }`}
                />

                <Text className="text-gray-700">
                  <Text className="font-semibold text-gray-900">
                    Severity:{" "}
                  </Text>
                  {incident.howSerious}
                </Text>
              </View>

              <View>
                <Text className="text-gray-600 leading-5">
                  {incident.description}
                </Text>
              </View>

              <View className="flex-row justify-between bg-gray-50 rounded-lg p-3">
                <View className="flex-row items-center">
                  <MaterialIcons
                    name="calendar-today"
                    size={16}
                    color="#6B7280"
                  />
                  <Text className="text-gray-700 ml-2 text-sm">
                    {format(new Date(incident?.date), "MMM dd, yyyy")}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <MaterialIcons name="access-time" size={16} color="#6B7280" />
                  <Text className="text-gray-700 ml-2 text-sm">
                    {incident?.time
                      ? (() => {
                          try {
                            let timeDate;
                            if (incident.time.includes("T")) {
                              timeDate = new Date(incident.time);
                            } else {
                              timeDate = parse(
                                incident.time,
                                "HH:mm",
                                new Date()
                              );
                            }
                            return format(timeDate, "hh:mm a");
                          } catch (err) {
                            return "Invalid time";
                          }
                        })()
                      : "N/A"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      <View className="mb-32" />
      <IncidentScreenDialog
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        defaultValues={editingIncident}
      />
    </SafeAreaView>
  );
};

export default IncidentScreen;
