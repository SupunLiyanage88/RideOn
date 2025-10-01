import {
  BikeStation,
  deleteBikeStation,
  fetchBikeStation,
} from "@/api/bikeStation";
import { MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import AddOrEditBikeStationDialog from "../admin/AddOrEditBikeStationDialog";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

const StationManagement = () => {
  const [bikeStationModalVisible, setBikeStationModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState<BikeStation | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { data: bikeStationData, isFetching: isBikeStationLoading } = useQuery({
    queryKey: ["station-data"],
    queryFn: fetchBikeStation,
  });
  const queryClient = useQueryClient();
  const { mutate: deleteBikeStationMutation, isPending: isDeleting } =
    useMutation({
      mutationFn: deleteBikeStation,
      onSuccess: () => {
        alert("Bike Station Delete Successful");
        setDeleteDialogOpen(false);
        queryClient.invalidateQueries({
          queryKey: ["station-data"],
        });
      },
      onError: (data) => {
        alert("Bike Station Delete Failed");
        console.log(data);
      },
    });

  return (
    <SafeAreaView className="flex-1 px-6">
      <Pressable
        onPress={() => {
          setBikeStationModalVisible(true);
        }}
        className="bg-[#0B4057] rounded-full px-7 py-3 mb-4 w-auto self-end"
      >
        <Text className="text-white font-extrabold text-base">
          + Add a Bike Station
        </Text>
      </Pressable>

      {isBikeStationLoading && (
        <View className="m-2">
          <ActivityIndicator size="large" color="#0B4057" />
        </View>
      )}

      <ScrollView>
        {bikeStationData?.map((station: any) => (
          <View
            key={station._id}
            className="bg-white p-5 rounded-2xl mb-6 shadow-lg"
          >
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xl font-semibold text-gray-900">
                Name: {station.stationName}
              </Text>
              <View className="flex-row">
                <TouchableOpacity
                  className="p-4 rounded-full bg-gray-50 active:bg-gray-100"
                  onPress={() => {
                    setSelectedData(station);
                    setBikeStationModalVisible(true);
                  }}
                >
                  <MaterialIcons name="edit" size={22} color="#3B82F6" />
                </TouchableOpacity>
                <View className="m-2"></View>
                <TouchableOpacity
                  className="p-4 rounded-full bg-gray-50 active:bg-gray-100"
                  onPress={() => {
                    setSelectedData(station);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <MaterialIcons
                    name="delete-outline"
                    size={22}
                    color="#EF4444"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Text className="text-sm text-gray-500 mb-1">
              ID:{" "}
              <Text className="font-medium text-gray-700">
                {station.stationId}
              </Text>
            </Text>

            <Text className="text-sm text-gray-500 mb-3">
              {station.stationLocation}
            </Text>

            <View className="overflow-hidden rounded-xl border border-gray-200">
              <MapView
                style={{ height: 150 }}
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
            </View>

            <Text className="mt-3 text-xs text-gray-500">
              📍 Lat: {station.latitude}, Lng: {station.longitude}
            </Text>
          </View>
        ))}
      </ScrollView>
      <AddOrEditBikeStationDialog
        visible={bikeStationModalVisible}
        onClose={() => {
          setBikeStationModalVisible(false);
          setSelectedData(null);
        }}
        defaultValues={selectedData ?? undefined}
      />

      {deleteDialogOpen && (
        <DeleteConfirmationModal
          open={deleteDialogOpen}
          title="Remove Bike Station Confirmation"
          content={
            <View className="bg-orange-100 w-full h-auto rounded-md p-3 border-orange-600 border">
              <Text className="text-gray-600">
                Are you sure you want to remove this Bike Station?{"\n"}
              </Text>
              <View className="flex-row">
                <MaterialIcons name="warning-amber" size={20} color="orange" />
                <Text className="text-red-500 font-medium">
                  This action is not reversible.
                </Text>
              </View>
            </View>
          }
          handleClose={() => setDeleteDialogOpen(false)}
          deleteFunc={async () => {
            deleteBikeStationMutation(selectedData?._id);
            setDeleteDialogOpen(false);
          }}
          onSuccess={() => {}}
          handleReject={() => {}}
        />
      )}
    </SafeAreaView>
  );
};

export default StationManagement;
