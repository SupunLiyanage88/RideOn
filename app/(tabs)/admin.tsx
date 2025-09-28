import { fetchBikeStation } from "@/api/bikeStation";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ManagementCard from "../components/ManagementCard";
type StatCardProps = {
  title: string;
  value: string | number;
};
type ButtonProps = {
  title: string;
  icon: any;
};
const StatCard = ({ title, value }: StatCardProps) => {
  return (
    <View className="bg-gray-300 p-5 rounded-lg flex-1 m-3">
      <Text className="text-start">{title}</Text>
      <Text className="text-3xl text-start font-semibold mt-2">{value}</Text>
    </View>
  );
};

const ButtonCard = ({ icon, title }: ButtonProps) => {
  return (
    <View className="bg-gray-300 p-5 rounded-lg flex-1 m-3">
      <Ionicons name={icon} size={28} />
      <Text className="text-start">{title}</Text>
      <MaterialCommunityIcons name="chevron-right" size={24} color="black" />
    </View>
  );
};

const Admin = () => {
  const [bikeStationModalVisible, setBikeStationModalVisible] = useState(false);
  const [bikeModalVisible, setBikeModalVisible] = useState(false);
  const router = useRouter();
  const { data: bikeStationData, isFetching: isBikeStationLoading } = useQuery({
    queryKey: ["station-data"],
    queryFn: fetchBikeStation,
  });
  return (
    <SafeAreaView>
      <Text className="text-xl font-bold my-4 mx-auto">Ride On Admin</Text>
      <View className="p-3">
        <View className="flex-row flex-wrap justify-center">
          <StatCard title="Total Stations" value={bikeStationData.length} />
          <StatCard title="Total Bikes" value={12} />
        </View>
        <View className="flex-row flex-wrap justify-center">
          <StatCard title="Ongoing Emergency" value={2} />
          <StatCard title="Monthly Payments" value={13} />
        </View>
      </View>
      <View className="px-5">
        <ScrollView showsVerticalScrollIndicator={false}>
          <ManagementCard
            title="Station Management"
            icon="location"
            color="#083A4C"
            onPress={() => router.push("/(admin)/StationManagement")}
          />
          <ManagementCard
            title="Bike Management"
            icon="bike"
            color="#37A77D"
            onPress={() => console.log("Bike Management pressed")}
          />
          <ManagementCard
            title="Emergency Management"
            icon="alert"
            color="#B83434"
            onPress={() => console.log("Emergency Management pressed")}
          />
          <ManagementCard
            title="Payment Management"
            icon="cash"
            color="#348AB8"
            onPress={() => console.log("Payment Management pressed")}
          />
          <ManagementCard
            title="Package Management"
            icon="cube-outline"
            color="#083A4C"
            onPress={() => console.log("Package Management pressed")}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Admin;
