import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AddOrEditBikeDialog from "../admin/AddOrEditBikeDialog";
import AddOrEditBikeStationDialog from "../admin/AddOrEditBikeStationDialog";
import AddOrEditSubscriptionPackageDialog from "../admin/AddOrEditSubscriptionPackageDialog";

type StatCardProps = {
  title: string;
  value: string | number;
};

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <View className="bg-gray-200 rounded-lg flex-1 m-2 p-4 h-24 items-center justify-center">
      <Text className="text-sm font-medium text-gray-700">{title}</Text>
      <Text className="text-2xl font-bold text-black mt-2">{value}</Text>
    </View>
  );
};

const Admin = () => {
  const [bikeStationModalVisible, setBikeStationModalVisible] = useState(false);
  const [bikeModalVisible, setBikeModalVisible] = useState(false);
  const [subscriptionModalVisible, setSubscriptionModalVisible] =
    useState(false);

  return (
    <SafeAreaView className="flex-1 p-4">
      <Text className="text-xl font-bold my-4 text-center">Ride On Admin</Text>

      {/* Example Stat Cards */}
      <View className="flex-row">
        <StatCard title="Total Stations" value={2} />
        <StatCard title="Total Bikes" value={10} />
      </View>

      {/* Add Bike Station */}
      <TouchableOpacity
        onPress={() => setBikeStationModalVisible(true)}
        className="bg-red-500 px-4 py-2 rounded-2xl mt-5"
      >
        <Text className="text-white font-semibold text-base">
          Add a Bike Station
        </Text>
      </TouchableOpacity>
      <AddOrEditBikeStationDialog
        visible={bikeStationModalVisible}
        onClose={() => setBikeStationModalVisible(false)}
      />

      {/* Add Bike */}
      <TouchableOpacity
        onPress={() => setBikeModalVisible(true)}
        className="bg-red-500 px-4 py-2 rounded-2xl mt-5"
      >
        <Text className="text-white font-semibold text-base">Add a Bike</Text>
      </TouchableOpacity>
      <AddOrEditBikeDialog
        visible={bikeModalVisible}
        onClose={() => setBikeModalVisible(false)}
      />

      {/* Add Subscription Package */}
      <TouchableOpacity
        onPress={() => setSubscriptionModalVisible(true)}
        className="bg-red-500 px-4 py-2 rounded-2xl mt-5"
      >
        <Text className="text-white font-semibold text-base">
          Add a Subscription Package
        </Text>
      </TouchableOpacity>
      <AddOrEditSubscriptionPackageDialog
        visible={subscriptionModalVisible}
        onClose={() => setSubscriptionModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default Admin;
