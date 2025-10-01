import { Accident, getAllAccident, saveAccident } from "@/api/accident";
import { MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SOSButton from "./SOSButton";
import UserMap from "./UserMap";

const AccidentScreen = () => {
  const queryClient = useQueryClient();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [alertActive, setAlertActive] = useState(false);

  const { isLoading } = useQuery({
    queryKey: ["accident-data"],
    queryFn: getAllAccident,
  });

  const { mutate: saveAccidentMutation, isPending } = useMutation({
    mutationFn: saveAccident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accident-data"] });
      alert("🚨 Emergency alert sent successfully!");
    },
    onError: (err) => {
      console.log(err);
      alert("❌ Failed to send emergency alert");
    },
  });

  useEffect(() => {
    let subscriber: Location.LocationSubscription;

    const getLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      const currentLoc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLoc.coords.latitude,
        longitude: currentLoc.coords.longitude,
      });

      subscriber = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 1 },
        (loc) => {
          setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        }
      );
    };

    getLocation();
    return () => subscriber?.remove();
  }, []);

  const handleActivate = () => {
    if (!location) {
      alert("⚠️ Location not available yet");
      return;
    }
    setAlertActive(true);
    saveAccidentMutation(location as Accident);
  };

  const handleCancel = () => {
    Alert.alert("Cancel Alert", "Do you want to cancel the alert?", [
      { text: "No", style: "cancel" },
      { text: "Yes", onPress: () => setAlertActive(false) },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 8 }}>
      <ScrollView>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", color: "red" }}>
            SOS Emergency
          </Text>
        </View>

        <View style={{
          backgroundColor: "#FFEDD5",
          width: "100%",
          borderRadius: 8,
          padding: 12,
          borderColor: "#F97316",
          borderWidth: 1,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons name="warning-amber" size={20} color="orange" />
            <Text style={{ fontWeight: "600", marginLeft: 8 }}>Safety First</Text>
          </View>
          <Text style={{ paddingTop: 12, textAlign: "justify" }}>
            If you're in immediate danger, move to a safe location before using this app. For life-threatening emergencies, call 911 directly.
          </Text>
        </View>

        <View style={{ justifyContent: "center", alignItems: "center", marginTop: 8, paddingHorizontal: 16 }}>
          <SOSButton
            isActive={alertActive}
            onActivate={handleActivate}
            onCancel={handleCancel}
            isLocationLoading={!location}
          />
          <Text style={{ color: alertActive ? "green" : "#A1A1AA", marginTop: 28 }}>
            {alertActive ? "🚨 Tap To cancel Alert !" : "Tap to send emergency alert"}
          </Text>
        </View>

        <View style={{ marginTop: 16, padding: 12, borderRadius: 8 }}>
          <View style={{ backgroundColor: "#E5E7EB", borderRadius: 8, marginTop: 8 }}>
            <View style={{
              height: 208,
              borderRadius: 8,
              borderStyle: "dashed",
              borderWidth: 2,
              borderColor: "#D1D5DB",
              justifyContent: "center",
              alignItems: "center",
            }}>
              {location ? (
                <UserMap
                  latitude={location.latitude}
                  longitude={location.longitude}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <ActivityIndicator size="large" color="#0B4057" />
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccidentScreen;
