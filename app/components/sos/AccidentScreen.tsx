import { Accident, getAllAccident, saveAccident } from "@/api/accident";
import { MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SOSButton from "./SOSButton";
import UserMap from "./UserMap";

const AccidentScreen = () => {
  const queryClient = useQueryClient();
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
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
        setLoading(false);
        return;
      }

      const currentLoc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLoc.coords.latitude,
        longitude: currentLoc.coords.longitude,
      });
      setLoading(false);

      subscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 1,
        },
        (loc) => {
          setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      );
    };

    getLocation();

    return () => {
      if (subscriber) subscriber.remove();
    };
  }, []);

  const handleActivate = () => {
    if (!location) {
      alert("⚠️ Location not available yet");
      return;
    }

    setAlertActive(true);
    console.log(location.latitude, location.longitude);
    const payload = {
      latitude: location.latitude,
      longitude: location.longitude,
    };
    saveAccidentMutation(payload as Accident);
  };

  const handleCancel = () => {
    Alert.alert("Cancel Alert", "Do you want to cancel the alert?", [
      { text: "No", style: "cancel" },
      { text: "Yes", onPress: () => setAlertActive(false) },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 px-2">
      <ScrollView>
        <View className="mb-4">
          <Text className="text-2xl font-bold text-center text-red-600">
            SOS Emergency
          </Text>
        </View>

        <View className="bg-orange-100 w-full h-auto rounded-md p-3 border-orange-600 border">
          <View className="flex-row">
            <MaterialIcons name="warning-amber" size={20} color="orange" />
            <Text className="font-semibold ml-4">Safety First</Text>
          </View>
          <Text className="pt-3 text-justify ">
            If you're in immediate danger, move to a safe location before using
            this app. For life-threatening emergencies, call 911 directly.
          </Text>
        </View>

        <View className="justify-center items-center mt-2 px-4">
          <SOSButton
            isActive={alertActive}
            onActivate={handleActivate}
            onCancel={handleCancel}
            isLocationLoading={!location}
          />
          <Text
            style={{ color: alertActive ? "green" : "#A1A1AA", marginTop: 28 }}
          >
            {alertActive
              ? "🚨 Tap To cancel Alert !"
              : "Tap to send emergency alert"}
          </Text>
        </View>
        <View className="mt-4 p-3 rounded-lg">
          <View className="bg-gray-200 rounded-r-md mt-2">
            <View className="h-52 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
              {location ? (
                <UserMap
                  latitude={location.latitude}
                  longitude={location.longitude}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <View className="m-2">
                  <ActivityIndicator size="large" color="#0B4057" />
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AccidentScreen;
