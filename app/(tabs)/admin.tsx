import React, { useState } from "react";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddOrEditBikeDialog from "../admin/AddOrEditBikeDialog";
import AddOrEditBikeStationDialog from "../admin/AddOrEditBikeStationDialog";

const Admin = () => {
  const [bikeStationModalVisible, setBikeStationModalVisible] = useState(false);
  const [bikeModalVisible, setBikeModalVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1 items-center justify-center">
      <Text className="text-xl font-bold mb-4">Admin</Text>

      <TouchableOpacity
        onPress={() => setBikeStationModalVisible(true)}
        className="bg-red-500 px-4 py-2 rounded-2xl"
      >
        <Text className="text-white font-semibold text-base">
          Add a Bike Station
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setBikeModalVisible(true)}
        className="bg-red-500 px-4 py-2 rounded-2xl mt-5"
      >
        <Text className="text-white font-semibold text-base">Add a Bike</Text>
      </TouchableOpacity>

      <AddOrEditBikeStationDialog
        visible={bikeStationModalVisible}
        onClose={() => setBikeStationModalVisible(false)}
      />

      <AddOrEditBikeDialog
        visible={bikeModalVisible}
        onClose={() => setBikeModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default Admin;
