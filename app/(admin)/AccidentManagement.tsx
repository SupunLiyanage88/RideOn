import { Accident, getAllAccident } from "@/api/accident";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import Loader from "../components/Loader";

const screenWidth = Dimensions.get("window").width;

const AccidentManagement = () => {
  const {
    data: accidentData,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["accident-data"],
    queryFn: getAllAccident,
  });

  return (
    <SafeAreaView style={styles.container}>
      {isFetching && (
        <View style={{ paddingBottom: 24, margin: 8 }}>
          <Loader textStyle={{ fontSize: 20 }} />
        </View>
      )}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Accident Reports</Text>
            <Text style={styles.subtitle}>
              {accidentData?.length || 0} reported Accidents
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => refetch()}
            style={styles.refreshButton}
          >
            <MaterialIcons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {accidentData && accidentData.length > 0 && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          {accidentData.map((accident: Accident) => (
            <View key={accident._id} style={styles.accidentCard}>
              <View style={styles.cardHeader}>
                <View style={styles.titleContainer}>
                  <MaterialIcons name="warning" size={20} color="#DC2626" />
                  <Text style={styles.accidentTitle}>{accident.title}</Text>
                </View>
              </View>

              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: accident.latitude,
                    longitude: accident.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  pitchEnabled={false}
                  rotateEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude: accident.latitude,
                      longitude: accident.longitude,
                    }}
                    title={accident.title}
                  >
                    <MaterialIcons
                      name="location-pin"
                      size={32}
                      color="#DC2626"
                    />
                  </Marker>
                </MapView>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.dateTimeContainer}>
                  <View style={styles.dateTimeRow}>
                    <View style={styles.dateTimeItem}>
                      <MaterialIcons
                        name="calendar-today"
                        size={16}
                        color="#0B4057"
                      />
                      <Text style={styles.dateTimeText}>
                        {format(new Date(accident.createdAt), "MMM dd, yyyy")}
                      </Text>
                    </View>
                    <View style={styles.dateTimeItem}>
                      <MaterialIcons
                        name="access-time"
                        size={16}
                        color="#0B4057"
                      />
                      <Text style={styles.dateTimeText}>
                        {format(new Date(accident.createdAt), "hh:mm a")}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.viewButton]}
                  >
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.takeActionButton]}
                  >
                    <Text style={styles.takeActionButtonText}>Take Action</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb", 
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    color: "#6b7280",
    marginTop: 4,
  },
  refreshButton: {
    backgroundColor: "#0B4057",
    padding: 12,
    borderRadius: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  loadingText: {
    color: "#6b7280",
    marginTop: 12,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyContent: {
    backgroundColor: "white",
    padding: 32,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 16,
  },
  emptySubtitle: {
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  accidentCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    overflow: "hidden",
  },
  cardHeader: {
    padding: 16,
    paddingBottom: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  accidentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginLeft: 8,
  },
  mapContainer: {
    paddingHorizontal: 16,
  },
  map: {
    width: "100%",
    height: 140,
    borderRadius: 12,
  },
  cardContent: {
    padding: 16,
  },
  dateTimeContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  dateTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateTimeText: {
    marginLeft: 8,
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButton: {
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },
  takeActionButton: {
    backgroundColor: "#0B4057",
    marginLeft: 8,
  },
  viewButtonText: {
    color: "#374151",
    textAlign: "center",
    fontWeight: "600",
  },
  takeActionButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
});

export default AccidentManagement;
