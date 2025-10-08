import { Bike } from "@/api/bike";
import { fetchBikeStationById } from "@/api/bikeStation";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import DialogHeader from "../../DialogHeader";
import Loader from "../../Loader";
import RentUserBike from "./RentUserBike";

export default function StationDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [modalVisible, setModalVisible] = useState(false);
  const [bikeId, setBikeId] = useState<String | null>(null);

  const {
    data: stationData,
    refetch: refetchStationData,
    isLoading,
    error,
    isRefetching,
  } = useQuery({
    queryKey: ["station", id],
    queryFn: () => fetchBikeStationById(id),
    enabled: !!id,
  });

  const getConditionColor = (condition: number) => {
    if (condition >= 80) return "#10b981";
    if (condition >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const getConditionLabel = (condition: number) => {
    if (condition >= 80) return "Excellent";
    if (condition >= 50) return "Good";
    return "Fair";
  };

  const getFuelIcon = (fuelType: string) => {
    switch (fuelType.toLowerCase()) {
      case "pedal":
        return "bicycle";
      case "electric":
        return "flash";
      case "hybrid":
        return "hardware-chip";
      default:
        return "bicycle";
    }
  };

  if (error || !stationData || isLoading) {
    return (
      <View style={{ padding: 24, marginTop: 40 }}>
        <Loader textStyle={{ fontSize: 20 }} showText={false} />
      </View>
    );
  }
  const pedalCount =
    stationData.bikes?.filter((b: any) => b.fuelType === "pedal").length || 0;
  const electricCount =
    stationData.bikes?.filter((b: any) => b.fuelType === "electric").length ||
    0;
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <DialogHeader
        title={`Available Bikes ${stationData?.stationName}`}
        subtitle="Pick Your Ride On Station"
      />
      <View style={styles.header}>
        <View style={styles.headerContainer}>
          <View style={styles.headerTextBox}>
            <Text style={styles.stationName}>{stationData.stationName}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color="red" />
              <Text style={styles.locationText}>
                {stationData.stationLocation}
              </Text>
            </View>
            <Text style={styles.stationId}>{stationData.stationId}</Text>
          </View>

          <MapView
            style={styles.miniMap}
            initialRegion={{
              latitude: stationData.latitude,
              longitude: stationData.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            pointerEvents="none"
          >
            <Marker
              coordinate={{
                latitude: stationData.latitude,
                longitude: stationData.longitude,
              }}
            />
          </MapView>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="event-available" size={22} color="#2563eb" />
            <Text style={styles.statValue}>{pedalCount + electricCount}</Text>

            <Text style={styles.statLabel}>Total Bikes</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="bicycle-outline" size={22} color="#f59e0b" />
            <Text style={styles.statValue}>{electricCount}</Text>
            <Text style={styles.statLabel}>Pedal Bikes</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flash" size={22} color="#10b981" />
            <Text style={styles.statValue}>{pedalCount}</Text>
            <Text style={styles.statLabel}>Electric Bikes</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetchStationData}
          />
        }
      >
        <Text style={styles.sectionTitle}>Available Bikes</Text>

        {stationData.bikes?.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bicycle-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No bikes available right now</Text>
          </View>
        ) : (
          stationData.bikes.map((bike: Bike) => (
            <View key={bike._id} style={styles.bikeCard}>
              <View style={styles.bikeHeader}>
                <View style={styles.bikeInfo}>
                  <View
                    style={[
                      styles.iconBox,
                      {
                        backgroundColor:
                          getConditionColor(Number(bike.condition)) + "20",
                      },
                    ]}
                  >
                    <Ionicons
                      name={getFuelIcon(bike.fuelType)}
                      size={22}
                      color={getConditionColor(Number(bike.condition))}
                    />
                  </View>
                  <View>
                    <Text style={styles.bikeModel}>{bike.bikeModel}</Text>
                    <Text style={styles.bikeId}>{bike.bikeId}</Text>
                  </View>
                </View>
                <View style={styles.availableTag}>
                  <Ionicons name="checkmark" color="#fff" size={14} />
                  <Text style={styles.availableText}>Available</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons
                    name="speedometer-outline"
                    size={18}
                    color="#64748b"
                  />
                  <Text style={styles.detailLabel}>Distance</Text>
                  <Text style={styles.detailValue}>{bike.distance} km</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={18}
                    color="#64748b"
                  />
                  <Text style={styles.detailLabel}>Condition</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: getConditionColor(Number(bike.condition)) },
                    ]}
                  >
                    {getConditionLabel(Number(bike.condition))}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons
                    name={getFuelIcon(bike.fuelType)}
                    size={18}
                    color="#64748b"
                  />
                  <Text style={styles.detailLabel}>Type</Text>
                  <Text style={styles.detailValue}>{bike.fuelType}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.rentButton}
                onPress={() => {
                  setModalVisible(true);
                  setBikeId(bike._id);
                }}
              >
                <Text style={styles.rentButtonText}>Rent This Bike</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
      <RentUserBike
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        defaultBikeId={bikeId || undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#64748b", fontSize: 15 },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 8,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#2563eb",
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryButtonText: { color: "#fff", fontWeight: "600" },

  header: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    padding: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderColor: "#083A4C",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  headerTextBox: {
    flex: 1,
    marginRight: 10,
  },
  stationName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  locationText: {
    marginLeft: 4,
    color: "#555",
    fontSize: 14,
    flexShrink: 1,
  },
  stationId: {
    fontSize: 13,
    color: "#888",
  },
  miniMap: {
    width: "50%",
    height: 100,
    borderRadius: 12,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#000",
    borderColor: "#083A4C",
    borderWidth: 1,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 6,
  },
  statLabel: { color: "#64748b", fontSize: 12 },
  scrollContainer: { padding: 20, paddingBottom: 80 },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },
  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyText: { marginTop: 12, fontSize: 15, color: "#64748b" },
  bikeCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    borderColor: "#083A4C",
    borderWidth: 0.5,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  bikeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bikeInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  bikeModel: { fontSize: 17, fontWeight: "700", color: "#1e293b" },
  bikeId: { fontSize: 13, color: "#64748b" },
  availableTag: {
    backgroundColor: "#083A4C",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  availableText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    borderTopWidth: 1,
    borderColor: "#e2e8f0",
    paddingTop: 12,
  },
  detailItem: { alignItems: "center" },
  detailLabel: { fontSize: 12, color: "#94a3b8", marginTop: 4 },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 2,
  },
  rentButton: {
    backgroundColor: "#083A4C",
    borderRadius: 24,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
  },
  rentButtonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
