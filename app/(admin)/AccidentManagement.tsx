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
        "Choose an action for this emergency report:",
        [
          {
            text: "📞 Call Reporter",
            onPress: () => handleCall(accident.user?.mobile || "", accidentId),
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
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 pt-6 pb-4 bg-white border-b border-gray-200 shadow-sm">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">
              Accident Reports
            </Text>
            <Text className="text-gray-500 mt-2 text-base">
              {accidentData?.length || 0} reported Accidents
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-[#0B4057] p-4 rounded-2xl shadow-lg"
          >
            <MaterialIcons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {isFetching && (
        <View className="flex-1 justify-center items-center bg-gray-50/80">
          <View className="bg-white p-8 rounded-3xl shadow-lg items-center border border-gray-100">
            <ActivityIndicator size="large" color="#0B4057" />
            <Text className="text-gray-700 mt-4 text-lg font-semibold">
              Loading Emergency Reports
            </Text>
            <Text className="text-gray-500 mt-2 text-center">
              Please wait while we fetch the latest emergency data...
            </Text>
          </View>
        </View>
      )}

      {!isFetching && (!accidentData || accidentData.length === 0) && (
        <View className="flex-1 justify-center items-center px-6 bg-gray-50">
          <View className="bg-white p-10 rounded-3xl shadow-lg items-center border border-gray-100 w-full max-w-sm">
            <View className="bg-green-50 p-4 rounded-full">
              <MaterialIcons name="check-circle" size={64} color="#10B981" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mt-6 text-center">
              All Clear! 
            </Text>
            <Text className="text-gray-500 text-center mt-3 text-base leading-6">
              No active emergency reports at the moment. Everything appears to
              be safe and under control.
            </Text>
          </View>
        </View>
      )}

      {!isFetching && accidentData && accidentData.length > 0 && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 px-5 pt-6"
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          {accidentData.map((accident: Accident, index: number) => (
            <View
              key={accident._id}
              className="bg-white rounded-3xl mb-5 shadow-2xl border border-gray-100 overflow-hidden"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <View className="flex-row justify-between items-center p-5 pb-3">
                <View className="flex-row items-center flex-1">
                  <View className="bg-red-50 p-2 rounded-xl">
                    <MaterialIcons name="warning" size={24} color="#DC2626" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-xl font-bold text-gray-900">
                      {accident.title}
                    </Text>
                    <Text className="text-gray-500 text-sm mt-1">
                      Reported{" "}
                      {format(
                        new Date(accident.createdAt),
                        "MMM dd 'at' hh:mm a"
                      )}
                    </Text>
                  </View>
                </View>
                <View
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: `${getStatusColor(accident.createdAt)}20`,
                  }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: getStatusColor(accident.createdAt) }}
                  >
                    {getStatusText(accident.createdAt)}
                  </Text>
                </View>
              </View>

              <View className="px-5 pb-4">
                <View className="rounded-2xl overflow-hidden border-2 border-gray-100">
                  <MapView
                    style={{ width: "100%", height: 160 }}
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

              <View className="px-5 ">
                <View className="bg-blue-50 rounded-2xl p-4 mb-4 border border-blue-100">
                  <View className="flex-row justify-between items-center ">
                    <View className="flex-row items-center">
                      <MaterialIcons
                        name="calendar-today"
                        size={16}
                        color="#0B4057"
                      />
                      <Text className="ml-2 text-gray-700 text-sm font-semibold">
                        {format(new Date(accident.createdAt), "MMMM dd, yyyy")}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <MaterialIcons
                        name="access-time"
                        size={16}
                        color="#0B4057"
                      />
                      <Text className="ml-2 text-gray-700 text-sm font-medium">
                        {format(new Date(accident.createdAt), "hh:mm a")}
                      </Text>
                    </View>
                  </View>
                </View>
                <View className="flex-row justify-between mb-5">
                  <TouchableOpacity
                    className={`flex-1 py-4 rounded-2xl mr-3 border ${
                      activeButtons[`call-${accident._id}`]
                        ? "bg-green-200 border-green-300"
                        : "bg-green-50 border-green-100"
                    }`}
                    onPress={() =>
                      handleCall(accident.user?.mobile || "", accident._id)
                    }
                  >
                    <View className="flex-row items-center justify-center">
                      <MaterialIcons name="phone" size={20} color="#10B981" />
                      <Text className="ml-2 text-green-700 text-base font-bold">
                        Call Now
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`flex-1 py-4 rounded-2xl ml-3 border ${
                      activeButtons[`action-${accident._id}`]
                        ? "bg-[#0a3045] border-[#0a3045]"
                        : "bg-[#0B4057] border-[#0B4057]"
                    } shadow-lg`}
                    onPress={() => handleTakeAction(accident)}
                    style={{
                      shadowColor: "#0B4057",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                    }}
                  >
                    <View className="flex-row items-center justify-center">
                      <MaterialIcons name="emergency" size={20} color="white" />
                      <Text className="ml-2 text-white text-base font-bold">
                        Actions
                      </Text>
                    </View>
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

export default AccidentManagement;
