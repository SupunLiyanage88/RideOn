import { Accident, getAllAccident } from "@/api/accident";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const [activeButtons, setActiveButtons] = useState<{
    [key: string]: boolean;
  }>({});

  const handleCall = (phoneNumber: string, accidentId: string) => {
    setActiveButtons((prev) => ({ ...prev, [`call-${accidentId}`]: true }));
    setTimeout(() => {
      if (!phoneNumber || phoneNumber === "Unknown") {
        Alert.alert("Error", "No phone number available");
        setActiveButtons((prev) => ({
          ...prev,
          [`call-${accidentId}`]: false,
        }));
        return;
      }
      const cleanedNumber = phoneNumber.replace(/[^0-9+]/g, "");
      const phoneUrl = `tel:${cleanedNumber}`;
      Linking.openURL(phoneUrl).catch((err) => {
        Alert.alert("Error", "Failed to make phone call");
        console.error("Error opening phone dialer:", err);
      });
      setActiveButtons((prev) => ({ ...prev, [`call-${accidentId}`]: false }));
    }, 200);
  };

  const handleTakeAction = (accident: Accident) => {
    const accidentId = accident._id;
    setActiveButtons((prev) => ({ ...prev, [`action-${accidentId}`]: true }));
    setTimeout(() => {
      Alert.alert(
        "Emergency Actions",
        "Choose an action for emergency report:",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              setActiveButtons((prev) => ({
                ...prev,
                [`action-${accidentId}`]: false,
              }));
            },
          },
          {
            text: "🗺️ Open in Maps",
            onPress: () => {
              const url = `https://maps.google.com/?q=${accident.latitude},${accident.longitude}`;
              Linking.openURL(url).catch(() => {
                Alert.alert("Error", "Could not open maps app");
              });
            },
          },
          {
            text: "📤 Share Location",
            onPress: () => {
              const message = `🚨 Emergency Alert - ${accident.title}\n\nLocation: https://maps.google.com/?q=${accident.latitude},${accident.longitude}\nTime: ${format(new Date(accident.createdAt), "MMM dd, yyyy 'at' hh:mm a")}\nReporter: ${accident.user?.mobile || "Unknown"}`;

              Alert.alert("Share Emergency Details", "Choose sharing method:", [
                {
                  text: "📧 Email",
                  onPress: () =>
                    Linking.openURL(
                      `mailto:?subject=Emergency Report - ${accident.title}&body=${encodeURIComponent(message)}`
                    ),
                },
                {
                  text: "💬 WhatsApp",
                  onPress: () =>
                    Linking.openURL(
                      `whatsapp://send?text=${encodeURIComponent(message)}`
                    ),
                },
                {
                  text: "📱 SMS",
                  onPress: () =>
                    Linking.openURL(`sms:?body=${encodeURIComponent(message)}`),
                },
                {
                  text: "Cancel",
                  style: "cancel",
                },
              ]);
            },
          },
        ],
        {
          onDismiss: () => {
            setActiveButtons((prev) => ({
              ...prev,
              [`action-${accidentId}`]: false,
            }));
          },
        }
      );
    }, 200);
  };

  const getStatusColor = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return "#DC2626";
    if (diffInHours < 6) return "#F59E0B";
    return "#10B981";
  };

  const getStatusText = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = (now.getTime() - created.getTime()) / (1000 * 60);

    if (diffInMinutes < 60) return "NEW";
    if (diffInMinutes < 360) return "RECENT";
    return "RESOLVED";
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
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

      {isFetching && (<ActivityIndicator size="large" color="#0B4057" />)}

      {!isFetching && (!accidentData || accidentData.length === 0) && (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyContent}>
            <View style={styles.emptyIconContainer}>
              <MaterialIcons name="check-circle" size={44} color="#10B981" />
            </View>
            <Text style={styles.emptySubtitle}>
              No active emergency reports at the moment. Everything appears to be
              safe and under control.
            </Text>
          </View>
        </View>
      )}

      {!isFetching && accidentData && accidentData.length > 0 && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          {accidentData.map((accident: Accident) => {
            const statusColor = getStatusColor(accident.createdAt);
            const statusText = getStatusText(accident.createdAt);
            
            return (
              <View key={accident._id} style={styles.accidentCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.titleContainer}>
                    <View style={styles.iconContainer}>
                      <MaterialIcons name="warning" size={24} color="#DC2626" />
                    </View>
                    <View style={styles.titleTextContainer}>
                      <Text style={styles.accidentTitle}>{accident.title}</Text>
                      <Text style={styles.reportedText}>
                        Reported on {format(new Date(accident.createdAt), "MMM dd 'at' hh:mm a")}
                      </Text>
                    </View>
                  </View>
                  <View 
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${statusColor}20` }
                    ]}
                  >
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {statusText}
                    </Text>
                  </View>
                </View>

                <View style={styles.mapContainer}>
                  <View style={styles.mapWrapper}>
                    <MapView
                      style={styles.map}
                      initialRegion={{
                        latitude: accident.latitude,
                        longitude: accident.longitude,
                        latitudeDelta: 0.004,
                        longitudeDelta: 0.004,
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
                          {format(new Date(accident.createdAt), "MMMM dd, yyyy")}
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
                      style={[
                        styles.actionButton,
                        styles.callButton,
                        activeButtons[`call-${accident._id}`] && styles.callButtonActive
                      ]}
                      onPress={() => handleCall(accident.user?.mobile || "", accident._id)}
                    >
                      <View style={styles.buttonContent}>
                        <MaterialIcons name="phone" size={20} color="#10B981" />
                        <Text style={styles.callButtonText}>Call Now</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        styles.takeActionButton,
                        activeButtons[`action-${accident._id}`] && styles.takeActionButtonActive
                      ]}
                      onPress={() => handleTakeAction(accident)}
                    >
                      <View style={styles.buttonContent}>
                        <MaterialIcons name="emergency" size={20} color="white" />
                        <Text style={styles.takeActionButtonText}>Actions</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
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
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingBottom: 8,
    paddingTop: 8,
    marginLeft: 15,
    marginRight: 15,
    borderRadius: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: 14,
  },
  refreshButton: {
    backgroundColor: "#0B4057",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(249, 250, 251, 0.8)",
  },
  loadingContent: {
    backgroundColor: "white",
    padding: 32,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingText: {
    color: "#374151",
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
  },
  loadingSubtext: {
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#f9fafb",
  },
  emptyContent: {
    backgroundColor: "white",
    padding: 40,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    width: "100%",
    maxWidth: 400,
  },
  emptyIconContainer: {
    backgroundColor: "#ecfdf5",
    padding: 16,
    borderRadius: 9999,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 24,
    textAlign: "center",
  },
  emptySubtitle: {
    color: "#6b7280",
    textAlign: "center",
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
  accidentCard: {
    backgroundColor: "white",
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    overflow: "hidden",
  },
  cardHeader: {
    padding: 15,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  iconContainer: {
    backgroundColor: "#fef2f2",
    padding: 8,
    borderRadius: 12,
  },
  titleTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  accidentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  reportedText: {
    color: "#6b7280",
    fontSize: 14,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    marginLeft: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  mapContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  mapWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#f3f4f6",
  },
  map: {
    width: "100%",
    height: 150,
  },
  cardContent: {
    padding: 16,
    paddingTop: 0,
  },
  dateTimeContainer: {
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  dateTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateTimeText: {
    marginLeft: 8,
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  callButton: {
    backgroundColor: "#f0fdf4",
    marginRight: 12,
    borderColor: "#bbf7d0",
  },
  callButtonActive: {
    backgroundColor: "#dcfce7",
    borderColor: "#86efac",
  },
  takeActionButton: {
    backgroundColor: "#0B4057",
    marginLeft: 12,
    borderColor: "#0B4057",
    shadowColor: "#0B4057",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  takeActionButtonActive: {
    backgroundColor: "#0a3045",
    borderColor: "#0a3045",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  callButtonText: {
    color: "#065f46",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
  },
  takeActionButtonText: {
    color: "white",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AccidentManagement;