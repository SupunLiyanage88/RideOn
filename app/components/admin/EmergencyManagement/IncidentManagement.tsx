import { deleteIncident, getAllIncident, Incident } from "@/api/incident";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import React, { useState } from "react";
import {
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DeleteConfirmationModal from "../../DeleteConfirmationModal";
import Loader from "../../Loader";

// const { width } = Dimensions.get("window");

const IncidentManagement = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<Incident | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

  const {
    data: incidentData,
    isFetching: isIncidentDataFetching,
    error,
    refetch,
  } = useQuery<Incident[]>({
    queryKey: ["incident-data"],
    queryFn: getAllIncident,
  });

  const queryClient = useQueryClient();
  const { mutate: deleteIncidentMutation } = useMutation({
    mutationFn: deleteIncident,
    onSuccess: () => {
      alert("Incident deleted successfully");
      setDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["incident-data"] });
      queryClient.invalidateQueries({ queryKey: ["incident-user-data"] });
    },
    onError: (error) => {
      alert("Failed to delete incident");
      console.error("Delete error:", error);
    },
  });

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getSeverityConfig = (severity?: string) => {
    const severityLower = severity?.toLowerCase();
    if (severityLower?.includes("critical"))
      return {
        color: "#FF3B30",
        bgColor: "rgba(255, 59, 48, 0.1)",
        icon: "alert-circle",
        pulse: true,
      };
    if (severityLower?.includes("high"))
      return {
        color: "#FF9500",
        bgColor: "rgba(255, 149, 0, 0.1)",
        icon: "alert-triangle",
        pulse: false,
      };
    if (severityLower?.includes("medium"))
      return {
        color: "#FFCC00",
        bgColor: "rgba(255, 204, 0, 0.1)",
        icon: "info",
        pulse: false,
      };
    return {
      color: "#34C759",
      bgColor: "rgba(52, 199, 89, 0.1)",
      icon: "check-circle",
      pulse: false,
    };
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "N/A";
    try {
      const timeDate = timeString.includes("T")
        ? new Date(timeString)
        : parse(timeString, "HH:mm", new Date());
      return format(timeDate, "hh:mm a");
    } catch (err) {
      console.error("Time parsing error:", err);
      return "Invalid time";
    }
  };

  const getIncidentIcon = (type?: string) => {
    const typeLower = type?.toLowerCase();
    if (typeLower?.includes("fire")) return "flame";
    if (typeLower?.includes("security")) return "shield";
    if (typeLower?.includes("medical")) return "medkit";
    if (typeLower?.includes("technical")) return "settings";
    if (typeLower?.includes("safety")) return "warning";
    return "alert-circle";
  };

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.container}>
      <View style={styles.mainBackground}>
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Incidents</Text>
              <View style={styles.statsContainer}>
                <View style={styles.statBadge}>
                  <View style={styles.statDot} />
                  <Text style={styles.statText}>
                    {incidentData?.length || 0} Active
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.quickStats}>
            {["Critical", "High", "Medium", "Low"].map((level) => {
              const count =
                incidentData?.filter((i: Incident) =>
                  i.howSerious?.toLowerCase().includes(level.toLowerCase())
                ).length || 0;
              const config = getSeverityConfig(level);

              return (
                <View key={level} style={styles.quickStatItem}>
                  <View
                    style={[
                      styles.quickStatGradient,
                      { backgroundColor: config.color },
                    ]}
                  >
                    <Text style={styles.quickStatCount}>{count}</Text>
                  </View>
                  <Text style={styles.quickStatLabel}>{level}</Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {isIncidentDataFetching && !refreshing && (
          <View style={styles.loaderContainer}>
            <Loader showText={false} />
          </View>
        )}

        {!isIncidentDataFetching &&
          (!incidentData || incidentData.length === 0) && (
            <Animated.View
              style={[styles.emptyContainer, { opacity: fadeAnim }]}
            >
              <View style={styles.emptyIconContainer}>
                <View style={styles.emptyIconGradient}>
                  <Ionicons name="shield-checkmark" size={60} color="#667EEA" />
                </View>
              </View>
              <Text style={styles.emptyTitle}>All Clear!</Text>
              <Text style={styles.emptyText}>
                No active incidents reported. Your system is running smoothly.
              </Text>
            </Animated.View>
          )}

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#667EEA"]}
              tintColor="#667EEA"
              progressBackgroundColor="#FFFFFF"
            />
          }
        >
          {incidentData?.map((incident: Incident, index: number) => {
            const severityConfig = getSeverityConfig(incident.howSerious);
            const slideAnim = new Animated.Value(0);

            Animated.timing(slideAnim, {
              toValue: 1,
              duration: 400,
              delay: index * 100,
              useNativeDriver: true,
            }).start();

            return (
              <Animated.View
                key={incident._id}
                style={[
                  styles.card,
                  {
                    opacity: slideAnim,
                    transform: [
                      {
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View
                        style={[
                          styles.iconContainer,
                          { backgroundColor: severityConfig.bgColor },
                        ]}
                      >
                        <Ionicons
                          name={getIncidentIcon(incident.incidentType) as any}
                          size={20}
                          color={severityConfig.color}
                        />
                      </View>
                      <View style={styles.headerInfo}>
                        <Text style={styles.incidentType}>
                          {incident.incidentType}
                        </Text>
                        <View style={styles.severityBadge}>
                          {severityConfig.pulse && (
                            <View
                              style={[
                                styles.pulseDot,
                                { backgroundColor: severityConfig.color },
                              ]}
                            />
                          )}
                          <View
                            style={[
                              styles.severityIndicator,
                              { backgroundColor: severityConfig.color },
                            ]}
                          />
                          <Text
                            style={[
                              styles.severityText,
                              { color: severityConfig.color },
                            ]}
                          >
                            {incident.howSerious}
                          </Text>
                        </View>
                      </View>
                    </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        setSelectedData(incident);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Feather name="trash-2" size={18} color="#FF3B30" />
                    </TouchableOpacity>

                    {incident.stopRide && (
                      <Text style={styles.rideStoppedText}>Ride Stopped</Text>
                    )}
                  </View>
                  </View>

                  <View style={styles.descriptionContainer}>
                    <Text style={styles.description}>
                      {incident.description || "No description provided."}
                    </Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={styles.metaItem}>
                      <Feather name="calendar" size={14} color="#6B7280" />
                      <Text style={styles.metaText}>
                        {format(new Date(incident?.date), "MMM dd, yyyy")}
                      </Text>
                    </View>
                    <View style={styles.metaDivider} />
                    <View style={styles.metaItem}>
                      <Feather name="clock" size={14} color="#6B7280" />
                      <Text style={styles.metaText}>
                        {formatTime(incident?.time)}
                      </Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            );
          })}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      <DeleteConfirmationModal
        open={deleteDialogOpen}
        title="Delete Incident"
        content={
          <View style={styles.modalContent}>
            <View style={styles.modalGradient}>
              <Ionicons name="warning" size={32} color="#FF3B30" />
              <Text style={styles.modalTitle}>Confirm Deletion</Text>
              <Text style={styles.modalText}>
                This action cannot be undone. The incident data will be
                permanently removed.
              </Text>
            </View>
          </View>
        }
        handleClose={() => setDeleteDialogOpen(false)}
        deleteFunc={async () => {
          if (selectedData?._id) {
            deleteIncidentMutation(selectedData._id);
          }
        }}
        onSuccess={() => {}}
        handleReject={() => {}}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 20, paddingLeft: 25, paddingRight: 25 },
  mainBackground: { flex: 1, backgroundColor: "#F0F2F5" },
  header: {
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: "white",
    borderRadius: 24,
    marginBottom: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
  },

  headerTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: "#1C1C1E",
    letterSpacing: -0.5,
  },
  statsContainer: { flexDirection: "row", marginTop: 8 },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF2FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34C759",
    marginRight: 6,
  },
  statText: { color: "#4338CA", fontSize: 13, fontWeight: "600" },
  headerButton: { marginLeft: 16 },
  gradientButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#667EEA",
    shadowColor: "#667EEA",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  quickStats: { flexDirection: "row", justifyContent: "space-between" },
  quickStatItem: { alignItems: "center", flex: 1 },
  quickStatGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickStatCount: { fontSize: 20, fontWeight: "700", color: "#FFFFFF" },
  quickStatLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  loaderContainer: { marginVertical: 40 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconContainer: { marginBottom: 24 },
  emptyIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E0E7FF",
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
  scrollView: { flex: 1 },
  card: {
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#171717",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardContent: { padding: 20 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cardHeaderLeft: { flexDirection: "row", flex: 1 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerInfo: { flex: 1 },
  incidentType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
    textTransform: "capitalize",
  },
  severityBadge: { flexDirection: "row", alignItems: "center" },
  pulseDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.4,
  },
  severityIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  severityText: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  descriptionContainer: { marginBottom: 16 },
  description: { fontSize: 14, color: "#4B5563", lineHeight: 21 },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  metaItem: { flexDirection: "row", alignItems: "center" },
  metaDivider: {
    width: 1,
    height: 16,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 12,
  },
  metaText: {
    color: "#4B5563",
    fontSize: 13,
    marginLeft: 6,
    fontWeight: "500",
  },
  modalContent: { width: "100%" },
  modalGradient: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "#FEF2F2",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#B91C1C",
    marginTop: 16,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: "#DC2626",
    textAlign: "center",
    lineHeight: 20,
  },
  rideStoppedText: {
    marginTop: 6,
    fontSize: 12,
    color: "#FF3B30",
    fontWeight: "700",
  },
});

export default IncidentManagement;
