import {
  BikeStation,
  deleteBikeStation,
  fetchBikeStation,
} from "@/api/bikeStation";
import { MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import AddOrEditBikeStationDialog from "../components/admin/StationManagement/AddOrEditBikeStationDialog";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import Loader from "../components/Loader";

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
    <SafeAreaView edges={["left", "right"]} style={styles.safeArea}>
      <View style={{ paddingHorizontal: 12 }}>
        <Pressable
          onPress={() => {
            setBikeStationModalVisible(true);
          }}
          style={{
            backgroundColor: "#0B4057",
            borderRadius: 9999,
            paddingLeft: 28,
            paddingRight: 28,
            paddingTop: 12,
            paddingBottom: 12,
            marginBottom: 16,
            marginTop: 30,
            alignSelf: "flex-end",
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "800", fontSize: 16 }}>
            + Add a Bike Station
          </Text>
        </Pressable>

        {isBikeStationLoading && (
          <View style={{ paddingBottom: 24, margin: 8 }}>
            <Loader textStyle={{ fontSize: 20 }} />
          </View>
        )}

        <ScrollView>
          {bikeStationData?.map((station: any) => (
            <View
              key={station._id}
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                borderRadius: 16,
                marginBottom: 24,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "600",
                    color: "#111827", // text-gray-900
                  }}
                >
                  {station.stationName}
                </Text>
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    style={{
                      padding: 16,
                      borderRadius: 9999,
                      backgroundColor: "#F9FAFB", // gray-50
                    }}
                    onPress={() => {
                      setSelectedData(station);
                      setBikeStationModalVisible(true);
                    }}
                  >
                    <MaterialIcons name="edit" size={22} color="#3B82F6" />
                  </TouchableOpacity>

                  <View style={{ margin: 8 }} />

                  <TouchableOpacity
                    style={{
                      padding: 16,
                      borderRadius: 9999,
                      backgroundColor: "#F9FAFB",
                    }}
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

              <Text
                style={{
                  fontSize: 14,
                  color: "#6B7280", // gray-500
                  marginBottom: 4,
                }}
              >
                ID:{" "}
                <Text style={{ fontWeight: "500", color: "#374151" }}>
                  {station.stationId}
                </Text>
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                  marginBottom: 12,
                }}
              >
                {station.stationLocation}
              </Text>

              <View
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: "#E5E7EB", // gray-200
                }}
              >
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

              <Text
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  color: "#6B7280",
                }}
              >
                📍 Lat: {station.latitude}, Lng: {station.longitude}
              </Text>
            </View>
          ))}
          <View style={{ marginBottom: 140 }} />
        </ScrollView>

        {bikeStationModalVisible && (
          <AddOrEditBikeStationDialog
            visible={bikeStationModalVisible}
            onClose={() => {
              setSelectedData(null);
              setBikeStationModalVisible(false);
            }}
            defaultValues={selectedData ?? undefined}
          />
        )}

        {deleteDialogOpen && (
          <DeleteConfirmationModal
            open={deleteDialogOpen}
            title="Remove Bike Station Confirmation"
            content={
              <View
                style={{
                  backgroundColor: "#FFEDD5", // orange-100
                  width: "100%",
                  borderRadius: 8,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: "#DC2626", // red-600
                }}
              >
                <Text style={{ color: "#4B5563" }}>
                  Are you sure you want to remove this Bike Station?{"\n"}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MaterialIcons
                    name="warning-amber"
                    size={20}
                    color="orange"
                  />
                  <Text style={{ color: "#EF4444", fontWeight: "500" }}>
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
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollView: {
    height: "100%",
  },
  container: {
    justifyContent: "center",
    paddingHorizontal: 10,
    marginTop: 12,
  },
});

export default StationManagement;
