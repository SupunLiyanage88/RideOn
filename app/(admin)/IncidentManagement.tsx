import { getAllIncident, Incident } from "@/api/incident";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const IncidentManagement = () => {
  const {
    data: incidentData,
    isFetching: isIncidentDataFetching,
    error,
  } = useQuery({
    queryKey: ["incident-data"],
    queryFn: getAllIncident,
  });
  return (
    <SafeAreaView className="px-4 pb-4 mb">
      {isIncidentDataFetching && (
        <View className="m-1">
          <ActivityIndicator size="large" color="#0B4057" />
        </View>
      )}

      <View className=" mb-4 items-center">
        <Text className="text-xl font-bold">All Incidents</Text>
      </View>

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
    </SafeAreaView>
  );
};

export default IncidentManagement;
