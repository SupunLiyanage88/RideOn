import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddOrEditBikeDialog from "../admin/AddOrEditBikeDialog";
import AddOrEditBikeStationDialog from "../admin/AddOrEditBikeStationDialog";

type StatCardProps = {
  title: string;
  value: string | number;
};

const Admin = () => {
  const [bikeStationModalVisible, setBikeStationModalVisible] = useState(false);
  const [bikeModalVisible, setBikeModalVisible] = useState(false);

  const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
    return (
      <View className="bg-gray-200 rounded-lg flex-1 m-2 p-4 h-24 items-center justify-center">
        <Text className="text-sm font-medium text-gray-700">{title}</Text>
        <Text className="text-2xl font-bold text-black mt-2">{value}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView>
      <Text className="text-xl font-bold my-4 mx-auto">Ride On Admin</Text>

      <StatCard title={"Total Stations"} value={2}></StatCard>
      <StatCard title={"Total Stations"} value={2}></StatCard>

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