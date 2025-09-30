import { deleteIncident, getAllIncident, Incident } from "@/api/incident";
import queryClient from "@/state/queryClient";
import { MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import React, { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

const IncidentManagement = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<Incident | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: incidentData,
    isFetching: isIncidentDataFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["incident-data"],
    queryFn: getAllIncident,
  });

  const { mutate: deleteIncidentMutation, isPending: isDeleting } = useMutation(
    {
      mutationFn: deleteIncident,
      onSuccess: () => {
        alert("Incident deleted successfully");
        setDeleteDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ["incident-data"] });
      },
      onError: (error) => {
        alert("Failed to delete incident");
        console.error("Delete error:", error);
      },
    }
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getSeverityColor = (severity: string) => {
    const severityLower = severity?.toLowerCase();
    if (severityLower?.includes("critical")) return "#DC2626";
    if (severityLower?.includes("high")) return "#EA580C";
    if (severityLower?.includes("medium")) return "#D97706";
    if (severityLower?.includes("low")) return "#16A34A";
    return "#6B7280";
  };

  const getSeverityBgColor = (severity: string) => {
    const severityLower = severity?.toLowerCase();
    if (severityLower?.includes("critical")) return "#FEE2E2";
    if (severityLower?.includes("high")) return "#FFEDD5";
    if (severityLower?.includes("medium")) return "#FEF3C7";
    if (severityLower?.includes("low")) return "#DCFCE7";
    return "#F3F4F6";
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "N/A";

    try {
      let timeDate;
      if (timeString.includes("T")) {
        timeDate = new Date(timeString);
      } else {
        timeDate = parse(timeString, "HH:mm", new Date());
      }
      return format(timeDate, "hh:mm a");
    } catch (err) {
      return "Invalid time";
    }
  };

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white px-6">
        <View className="flex-1 justify-center items-center">
          <MaterialIcons name="error-outline" size={64} color="#DC2626" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 mb-2">
            Failed to Load Incidents
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            Unable to fetch incident data. Please check your connection and try
            again.
          </Text>
          <TouchableOpacity
            className="bg-[#0B4057] px-6 py-3 rounded-lg"
            onPress={() => refetch()}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-6 pb-4 pt-2 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">
              Incident Management
            </Text>
            <Text className="text-gray-600 mt-1">
              {incidentData?.length || 0} incident(s) reported
            </Text>
          </View>
          <View className="w-8 h-8 rounded-full bg-[#0B4057] items-center justify-center">
            <MaterialIcons name="warning" size={20} color="white" />
          </View>
        </View>
      </View>

      {isIncidentDataFetching && !refreshing && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0B4057" />
          <Text className="text-gray-600 mt-3">Loading incidents...</Text>
        </View>
      )}

      {!isIncidentDataFetching &&
        (!incidentData || incidentData.length === 0) && (
          <View className="flex-1 justify-center items-center px-6">
            <MaterialIcons name="inbox" size={80} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-900 mt-4 mb-2">
              No Incidents Found
            </Text>
            <Text className="text-gray-600 text-center">
              All incidents are resolved or no incidents have been reported yet.
            </Text>
          </View>
        )}

      <ScrollView
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0B4057"]}
            tintColor="#0B4057"
          />
        }
      >
        {incidentData?.map((incident: Incident) => (
          <View
            key={incident._id}
            className="bg-white rounded-2xl mb-4 shadow-lg shadow-black/5 border border-gray-100 overflow-hidden"
          >
            <View
              className="flex-row justify-between items-center p-4 border-b border-gray-100"
              style={{
                backgroundColor: getSeverityBgColor(incident.howSerious),
              }}
            >
              <View className="flex-row items-center">
                <View
                  className="w-3 h-3 rounded-full mr-2"
                  style={{
                    backgroundColor: getSeverityColor(incident.howSerious),
                  }}
                />
                <View className="bg-white px-3 py-1 rounded-full shadow-sm">
                  <Text className="text-xs font-semibold text-gray-900 capitalize">
                    {incident.incidentType}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                className="w-10 h-10 rounded-full bg-white/80 items-center justify-center shadow-sm active:bg-white"
                onPress={() => {
                  setSelectedData(incident);
                  setDeleteDialogOpen(true);
                }}
              >
                <MaterialIcons
                  name="delete-outline"
                  size={20}
                  color="#EF4444"
                />
              </TouchableOpacity>
            </View>

            <View className="p-4">
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1">
                  <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Severity Level
                  </Text>
                  <View className="flex-row items-center">
                    <View
                      className="w-2 h-2 rounded-full mr-2"
                      style={{
                        backgroundColor: getSeverityColor(incident.howSerious),
                      }}
                    />
                    <Text className="text-base font-semibold text-gray-900 capitalize">
                      {incident.howSerious}
                    </Text>
                  </View>
                </View>

                <View className="flex-1 items-end">
                  <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Reported By
                  </Text>
                  <Text
                    className="text-sm text-gray-900 text-right"
                    numberOfLines={1}
                  >
                    {incident.user?.email || "Unknown"}
                  </Text>
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Description
                </Text>
                <Text className="text-gray-700 leading-5 text-base">
                  {incident.description || "No description provided."}
                </Text>
              </View>

              <View className="flex-row justify-between items-center bg-gray-50 rounded-xl p-3">
                <View className="flex-row items-center">
                  <MaterialIcons name="event" size={18} color="#6B7280" />
                  <Text className="text-gray-700 ml-2 font-medium">
                    {format(new Date(incident?.date), "MMM dd, yyyy")}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <MaterialIcons name="schedule" size={18} color="#6B7280" />
                  <Text className="text-gray-700 ml-2 font-medium">
                    {formatTime(incident?.time)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}

        <View className="h-4" />
      </ScrollView>

      <DeleteConfirmationModal
        open={deleteDialogOpen}
        title="Delete Incident"
        content={
          <View className="bg-amber-50 w-full rounded-xl p-4 border border-amber-200">
            <View className="flex-row items-start">
              <MaterialIcons name="warning" size={24} color="#D97706" />
              <View className="ml-3 flex-1">
                <Text className="text-amber-800 font-semibold mb-1">
                  Confirm Deletion
                </Text>
                <Text className="text-amber-700 text-sm">
                  Are you sure you want to delete this incident? This action
                  cannot be undone and the incident data will be permanently
                  removed from the system.
                </Text>
              </View>
            </View>
          </View>
        }
        handleClose={() => setDeleteDialogOpen(false)}
        deleteFunc={async () => {
          if (selectedData?._id) {
            deleteIncidentMutation(selectedData._id);
          }
        }}
        onSuccess={() => {}}
        handleReject={() => {}}
      />
    </SafeAreaView>
  );
};

export default IncidentManagement;
