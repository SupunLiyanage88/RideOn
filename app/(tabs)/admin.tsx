import React, { useState } from "react";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddOrEditBikeStationDialog from "../admin/AddOrEditBikeStationDialog";



const Admin = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1 items-center justify-center">
      <Text className="text-xl font-bold mb-4">Admin</Text>

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="bg-red-500 px-4 py-2 rounded-2xl"
      >
        <Text className="text-white font-semibold text-base">
          Add a Bike Station
        </Text>
      </TouchableOpacity>

      <AddOrEditBikeStationDialog
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default Admin;
