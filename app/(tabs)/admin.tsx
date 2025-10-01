import { fetchBikeStation } from "@/api/bikeStation";
import { getAllIncident } from "@/api/incident";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ManagementCard from "../components/ManagementCard";

import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
type StatCardProps = {
  title: string;
  value: string | number;
  isLoading: boolean;
};

const StatCard = ({ title, value, isLoading }: StatCardProps) => {
  return (
    <View className="bg-gray-300 p-5 rounded-2xl flex-1 m-3 justify-center items-center">
      <Text className="text-start">{title}</Text>
      {isLoading ? (
        <ActivityIndicator size="small" className="mt-2" />
      ) : (
        <Text className="text-3xl text-start font-semibold mt-2">
          {value ?? 0}
        </Text>
      )}
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
  const { data: incidentData, isFetching: isIncidentLoading } = useQuery({
    queryKey: ["incident-data"],
    queryFn: getAllIncident,
  });
  return (
    <SafeAreaView>
      <Text className="text-xl font-bold my-4 mx-auto">Ride On Admin</Text>
      <View className="p-3">
        <View className="flex-row flex-wrap justify-center">
          <StatCard
            title="Total Stations"
            value={bikeStationData?.length}
            isLoading={isBikeStationLoading}
          />
          <StatCard
            title="Total Bikes"
            value={12}
            isLoading={isBikeStationLoading}
          />
        </View>
        <View className="flex-row flex-wrap justify-center">
          <StatCard
            title="Ongoing Emergency"
            value={incidentData?.length}
            isLoading={isIncidentLoading}
          />
          <StatCard
            title="Monthly Payments"
            value={13}
            isLoading={isBikeStationLoading}
          />
        </View>
      </View>
      <View className="px-5">
        <ScrollView showsVerticalScrollIndicator={false}>
          <ManagementCard
            title="Station Management"
            icon={
              <FontAwesome5 name="broadcast-tower" size={18} color="white" />
            }
            color="#083A4C"
            onPress={() => router.push("/(admin)/StationManagement")}
          />
          <ManagementCard
            title="Bike Management"
            icon={<Ionicons name="bicycle" size={26} color="white" />}
            color="#37A77D"
            onPress={() => router.push("/(admin)/BikeManagement")}
          />
          <ManagementCard
            title="Emergency Management"
            icon={<AntDesign name="alert" size={24} color="white" />}
            color="#B83434"
            onPress={() => router.push("/(admin)/EmergencyManagement")}
          />
          <ManagementCard
            title="Payment Management"
            icon={<MaterialIcons name="payment" size={24} color="white" />}
            color="#348AB8"
            onPress={() => console.log("Payment Management pressed")}
          />
          <ManagementCard
            title="Package Management"
            icon={<Feather name="package" size={24} color="white" />}
            color="#083A4C"
            onPress={() => console.log("Package Management pressed")}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Admin;
