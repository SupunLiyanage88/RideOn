import { getUserIncident, Incident } from "@/api/incident";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddBtn from "../../AddBtn";
import IncidentScreenDialog from "./AddOrEditIncidentScreenDialog";

const IncidentScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIncident, setEditingIncident] = useState<any | null>(
    null
  );

  const {
    data: incidentData,
    isFetching: isIncidentDataFetching,
    error,
  } = useQuery({
    queryKey: ["incident-data"],
    queryFn: getUserIncident,
  });

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={{
        flex: 1,
        marginBottom: 15
      }}
    >
      <Pressable
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

      {isIncidentDataFetching && (
        <View style={{ margin: 8 }}>
          <ActivityIndicator size="large" color="#0B4057" />
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {incidentData?.map((incident: Incident) => {
        const canEdit = (() => {
          if (!incident.createdAt) return false;
          const createdAt = new Date(incident.createdAt).getTime();
          const now = Date.now();
          return now - createdAt <= 20 * 60 * 1000;
        })();

        return (
          <View
            key={incident._id}
            style={{
              backgroundColor: "white",
              padding: 24,
              borderRadius: 16,
              marginBottom: 10,
              marginTop: 15,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 1,
              borderWidth: 1,
              borderColor: "#f3f4f6",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  backgroundColor: "#0B4057",
                  paddingHorizontal: 24,
                  paddingVertical: 8,
                  borderRadius: 9999,
                }}
              >
                <Text
                  style={{ color: "white", fontWeight: "600", fontSize: 14 }}
                >
                  {incident.incidentType}
                </Text>
              </View>

            {canEdit && (
              <TouchableOpacity
                style={{
                  padding: 8,
                  borderRadius: 9999,
                  backgroundColor: "#f9fafb",
                }}
                onPressIn={() => {
                  setEditingIncident(incident);
                  setModalVisible(true);
                }}
              >
                <MaterialIcons name="edit" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
            </View>

            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 9999,
                    marginRight: 8,
                    backgroundColor: incident.howSerious
                      ?.toLowerCase()
                      .includes("critical")
                      ? "#ef4444"
                      : incident.howSerious
                          ?.toLowerCase()
                          .includes("high")
                        ? "#fb923c"
                        : incident.howSerious
                            ?.toLowerCase()
                            .includes("medium")
                          ? "#eab308"
                          : "#22c55e",
                  }}
                />

                <Text style={{ color: "#374151" }}>
                  <Text style={{ fontWeight: "600", color: "#111827" }}>
                    Severity:{" "}
                  </Text>
                  {incident.howSerious}
                </Text>
              </View>

              <View>
                <Text style={{ color: "#4b5563", lineHeight: 20 }}>
                  {incident.description}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  backgroundColor: "#f9fafb",
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MaterialIcons
                    name="calendar-today"
                    size={16}
                    color="#6B7280"
                  />
                  <Text
                    style={{ color: "#374151", marginLeft: 8, fontSize: 14 }}
                  >
                    {format(new Date(incident?.date), "MMM dd, yyyy")}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MaterialIcons name="access-time" size={16} color="#6B7280" />
                  <Text
                    style={{ color: "#374151", marginLeft: 8, fontSize: 14 }}
                  >
                    {incident?.time
                      ? (() => {
                          try {
                            let timeDate;
                            if (incident.time.includes("T")) {
                              timeDate = new Date(incident.time);
                            } else {
                              timeDate = parse(
                                incident.time,
                                "HH:mm",
                                new Date()
                              );
                            }
                            return format(timeDate, "hh:mm a");
                          } catch (err) {
                            return "Invalid time";
                          }
                        })()
                      : "N/A"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );
      })}
        <View style={{ marginBottom: 50 }} />
      </ScrollView>
      
      <IncidentScreenDialog
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        defaultValues={editingIncident}
      />
    </SafeAreaView>
  );
};

export default IncidentScreen;