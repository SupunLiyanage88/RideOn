import { getAllBikeStations } from "@/api/bikeStation";
import { getAllIncident } from "@/api/incident";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ManagementCard from "../components/ManagementCard";

import { getAllBikes } from "@/api/bike";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import StatCard from "../components/StatCard";

const Admin = () => {
  const [bikeStationModalVisible, setBikeStationModalVisible] = useState(false);
  const [bikeModalVisible, setBikeModalVisible] = useState(false);
  const router = useRouter();

  const { data: bikeStationData, isFetching: isBikeStationLoading } = useQuery({
    queryKey: ["station-data"],
    queryFn: getAllBikeStations,
  });

  const { data: incidentData, isFetching: isIncidentLoading } = useQuery({
    queryKey: ["incident-data"],
    queryFn: getAllIncident,
  });
  const { data: bikeData, isFetching: isbikeDataLoading } = useQuery({
    queryKey: ["bike-data"],
    queryFn: getAllBikes,
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.title}>Ride On Admin</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <StatCard
            title="Total Stations"
            value={bikeStationData?.length}
            isLoading={isBikeStationLoading}
          />
          <StatCard
            title="Total Bikes"
            value={bikeData?.length}
            isLoading={isbikeDataLoading}
          />
        </View>
        <View style={styles.statsRow}>
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

      <ScrollView
        style={styles.cardsScroll}
        contentContainerStyle={styles.cardsContent}
        showsVerticalScrollIndicator={false}
      >
        <ManagementCard
          title="Bike Security Management"
          icon={<MaterialIcons name="security" size={24} color="white" />}
          color="black"
          onPress={() => router.push("/(admin)/BikeSecurity")}
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
          title="Station Management"
          icon={<FontAwesome5 name="broadcast-tower" size={18} color="white" />}
          color="#083A4C"
          onPress={() => router.push("/(admin)/StationManagement")}
        />

        <ManagementCard
          title="Payment Management"
          icon={<MaterialIcons name="payment" size={24} color="white" />}
          color="#348AB8"
          onPress={() => router.push("/(admin)/PaymentManagement")}
        />
        <ManagementCard
          title="Package Management"
          icon={<Feather name="package" size={24} color="white" />}
          color="#F79F1B"
          onPress={() => router.push("/(admin)/PackageManagement")}
        />

        <View style={{ marginBottom: 45 }}></View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 16,
    textAlign: "center",
  },
  statsContainer: {
    padding: 12,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  cardsScroll: {
    flex: 1,
  },
  cardsContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

export default Admin;
