import { getUserIncident, Incident } from "@/api/incident";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import React, { useState } from "react";
import {
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddBtn from "../../AddBtn";
import Loader from "../../Loader";
import IncidentScreenDialog from "./AddOrEditIncidentScreenDialog";

const IncidentScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

  const {
    data: incidentData,
    isFetching: isIncidentDataFetching,
    error,
    refetch,
  } = useQuery<Incident[]>({
    queryKey: ["incident-user-data"],
    queryFn: getUserIncident,
  });

  const queryClient = useQueryClient();

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
        pulse: true,
      };
    if (severityLower?.includes("high"))
      return {
        color: "#FF9500",
        bgColor: "rgba(255, 149, 0, 0.1)",
        pulse: false,
      };
    if (severityLower?.includes("medium"))
      return {
        color: "#FFCC00",
        bgColor: "rgba(255, 204, 0, 0.1)",
        pulse: false,
      };
    return {
      color: "#34C759",
      bgColor: "rgba(52, 199, 89, 0.1)",
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
        <Pressable
          style={{ marginBottom: 16 }}
          onPress={() => {
            setEditingIncident(null);
            setModalVisible(true);
          }}
        >
          <AddBtn
            title="Add a Incident"
            backgroundColor="#083A4C"
            textColor="#FFFFFF"
            iconColor="#FFFFFF"
            iconSize={25}
            onPress={() => {
              setModalVisible(true);
            }}
          />
        </Pressable>

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
              <Text style={styles.emptyTitle}>No Reports Found</Text>
              <Text style={styles.emptyText}>
                You haven't reported any incidents yet. Tap the '+' button to
                add a new report.
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

            const canEdit = (() => {
              if (!incident.createdAt) return false;
              const createdAt = new Date(incident.createdAt).getTime();
              const now = Date.now();
              return now - createdAt <= 20 * 60 * 1000;
            })();

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

                    {canEdit && (
                      <TouchableOpacity
                        style={styles.editButton}
                        onPressIn={() => {
                          setEditingIncident(incident);
                          setModalVisible(true);
                        }}
                      >
                        <Feather name="edit-2" size={18} color="#4338CA" />
                      </TouchableOpacity>
                    )}
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

      <IncidentScreenDialog
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        defaultValues={editingIncident || undefined}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
  },
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
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: "#1C1C1E",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 4,
  },
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
  loaderContainer: { marginVertical: 40 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: -50,
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
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
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
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(67, 56, 202, 0.1)",
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
});

export default IncidentScreen;
