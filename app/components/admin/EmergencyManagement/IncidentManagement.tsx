import { deleteIncident, getAllIncident, Incident } from "@/api/incident";
import { MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import React, { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DeleteConfirmationModal from "../../DeleteConfirmationModal";

const IncidentManagement = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<Incident | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: incidentData,
    isFetching: isIncidentDataFetching,
    error,
    refetch,
  } = useQuery({
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
    },
    onError: (error) => {
      alert("Failed to delete incident");
      console.error("Delete error:", error);
    },
  });

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getSeverityColor = (severity?: string) => {
    const severityLower = severity?.toLowerCase();
    if (severityLower?.includes("critical")) return "#DC2626";
    if (severityLower?.includes("high")) return "#EA580C";
    if (severityLower?.includes("medium")) return "#D97706";
    return "#16A34A";
  };

  const getSeverityBgColor = (severity?: string) => {
    const severityLower = severity?.toLowerCase();
    if (severityLower?.includes("critical")) return "#FEE2E2"; 
    if (severityLower?.includes("high")) return "#FFEDD5";
    if (severityLower?.includes("medium")) return "#FEF3C7"; 
    return "#DCFCE7"; 
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

  return (
    <SafeAreaView edges={["left", "right"]} style={{ flex: 1,marginTop: 20 }} >
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Incident Management</Text>
          <Text style={styles.headerSubtitle}>
            {incidentData?.length || 0} incident(s) reported
          </Text>
        </View>
        <View style={styles.headerIconContainer}>
          <MaterialIcons name="warning" size={20} color="white" />
        </View>
      </View>

      {isIncidentDataFetching && !refreshing && (
        <View >
          <ActivityIndicator size="large" color="#0B4057" />
        </View>
      )}

      {!isIncidentDataFetching && (!incidentData || incidentData.length === 0) && (
        <View style={styles.centeredContentFlex1}>
          <MaterialIcons name="inbox" size={80} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Incidents Found</Text>
          <Text style={styles.emptyText}>
            All incidents are resolved or no incidents have been reported yet.
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0B4057"]}
            tintColor="#0B4057"
          />
        }
      >
        {incidentData?.map((incident: Incident) => (
          <View key={incident._id} style={styles.card}>
            <View
              style={[
                styles.cardHeader,
                { backgroundColor: getSeverityBgColor(incident.howSerious) },
              ]}
            >
              <View style={styles.cardHeaderLeft}>
                <View style={styles.incidentTypeBadge}>
                  <Text style={styles.incidentTypeText}>
                  {incident.incidentType}
                </Text>
              </View>
            </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  setSelectedData(incident);
                  setDeleteDialogOpen(true);
                }}
              >
                <MaterialIcons name="delete-outline" size={22} color="#EF4444" />
              </TouchableOpacity>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.rowSpaced}>
                <View style={styles.flex1}>
                  <Text style={styles.label}>Severity Level</Text>
                  <View style={styles.row}>
                    <View
                      style={[
                        styles.severityDot,
                        { backgroundColor: getSeverityColor(incident.howSerious) },
                      ]}
                    />
                    <Text style={styles.severityText}>{incident.howSerious}</Text>
                  </View>
                </View>
              </View>

              <View style={{ marginVertical: 16 }}>
                <Text style={styles.label}>Description</Text>
                <Text style={styles.descriptionText}>
                  {incident.description || "No description provided."}
                </Text>
              </View>

              <View style={styles.dateTimeContainer}>
                <View style={styles.row}>
                  <MaterialIcons name="event" size={18} color="#6B7280" />
                  <Text style={styles.dateTimeText}>
                    {format(new Date(incident?.date), "MMM dd, yyyy")}
                  </Text>
                </View>

                <View style={styles.row}>
                  <MaterialIcons name="schedule" size={18} color="#6B7280" />
                  <Text style={styles.dateTimeText}>
                    {formatTime(incident?.time)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
        <View style={{ height: 16 }} />
      </ScrollView>

      <DeleteConfirmationModal
        open={deleteDialogOpen}
        title="Delete Incident"
        content={
          <View style={styles.modalContentContainer}>
            <View style={styles.modalRow}>
              <MaterialIcons name="warning" size={24} color="#D97706" />
              <View style={styles.modalTextContainer}>
                <Text style={styles.modalTitle}>Confirm Deletion</Text>
                <Text style={styles.modalText}>
                  Are you sure you want to delete this incident? This action
                  cannot be undone and the incident data will be permanently
                  removed from the system.
                </Text>
              </View>
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
  flex1: { flex: 1 },
  flex1_bgGray50: { flex: 1, backgroundColor: "#F9FAFB" },
  row: { flexDirection: "row", alignItems: "center" },
  rowSpaced: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  centeredContent: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  centeredContentFlex1: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#0B4057",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: { color: "white", fontWeight: "600" },
  loadingText: { color: "#4B5563", marginTop: 12 },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: { color: "#4B5563", textAlign: "center", lineHeight: 20 },
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
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#111827" },
  headerSubtitle: { color: "#4B5563", marginTop: 4 },
  headerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0B4057",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center" },
  incidentTypeBadge: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  incidentTypeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
    textTransform: "capitalize",
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { padding: 16 },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  severityDot: { width: 9, height: 9, borderRadius: 5, marginRight: 8 },
  severityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textTransform: "capitalize",
  },
  descriptionText: { color: "#374151", lineHeight: 22, fontSize: 15 },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
  },
  dateTimeText: {
    color: "#374151",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  modalContentContainer: {
    backgroundColor: "#FFFBEB",
    width: "100%",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  modalRow: { flexDirection: "row", alignItems: "flex-start" },
  modalTextContainer: { marginLeft: 12, flex: 1 },
  modalTitle: { color: "#92400E", fontWeight: "600", marginBottom: 4 },
  modalText: { color: "#B45309", fontSize: 14, lineHeight: 20 },
});

export default IncidentManagement;
