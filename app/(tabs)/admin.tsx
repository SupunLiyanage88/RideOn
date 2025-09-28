import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddOrEditBikeStationDialog from "../admin/AddOrEditBikeStationDialog";
import AddOrEditSubscriptionPackageDialog from "../admin/AddOrEditSubscriptionPackageDialog";


const Admin = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSubscriptionVisible, setModalSubscriptionVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1">
  <View className="items-center justify-center mb-4">
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
  </View>

  <View className="items-center justify-center">
    
    <TouchableOpacity
      onPress={() => setModalSubscriptionVisible(true)}
      className="bg-red-500 px-4 py-2 rounded-2xl"
    >
      <Text className="text-white font-semibold text-base">
        Add a Subscription Package
      </Text>
    </TouchableOpacity>

    <AddOrEditSubscriptionPackageDialog
      visible={modalSubscriptionVisible}
      onClose={() => setModalSubscriptionVisible(false)}
    />
  </View>
</SafeAreaView>
  );
};

export default Admin;
