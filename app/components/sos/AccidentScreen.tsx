import { Accident, getAllAccident, saveAccident } from "@/api/accident";
import { MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SOSButton from "./SOSButton";
import UserMap from "./UserMap";
const AccidentScreen = () => {
  const queryClient = useQueryClient();

  // Fetch accidents
  const { data: accidentData, isLoading } = useQuery({
    queryKey: ["accident-data"],
    queryFn: getAllAccident,
  });

  const { control, handleSubmit, reset } = useForm<Omit<Accident, "_id">>({
    defaultValues: {
      description: "",
      createdAt: new Date().toISOString(),
    },
  });

  // Save accident mutation
  const { mutate: saveAccidentMutation, isPending } = useMutation({
    mutationFn: saveAccident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accident-data"] });
      alert("Accident saved successfully!");
      reset();
    },
    onError: (err) => {
      console.log(err);
      alert("Failed to save accident");
    },
  });

  const onSubmit = (data: Omit<Accident, "_id">) => {
    saveAccidentMutation(data as Accident);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="red" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <View className="mb-4">
        <Text className="text-2xl font-bold text-center text-red-600">
          SOS Emergency
        </Text>
      </View>

      <View className="bg-orange-100 w-full h-auto rounded-md p-3 border-orange-600 border-r-2">
        <View className="flex-row">
          <MaterialIcons name="warning-amber" size={20} color="orange" />
          <Text className="font-semibold ml-4">Safety First</Text>
        </View>
        <Text className="pt-3 justify-end">
          If you're in immediate danger, move to a safe location before using
          this app. For life-threatening emergencies, call 911 directly.
        </Text>
      </View>

      <View className="justify-center items-center mt-2 px-4">
        <SOSButton />
        <Text className="color-stone-400 mt-2">
          Tap to send emergency alert
        </Text>
      </View>

      <View
        className="mt-4 p-3  rounded-lg "
        style={{
          shadowColor: "33, 37, 41",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.15,
          shadowRadius: 0.84,
          elevation: 3,
        }}
      >
        <Text className="font-bold">Current Location</Text>
        <View className="bg-gray-200 rounded-r-md p-3 mt-2">
          <View className="flex-row mt-2 rounded-md">
            <MaterialIcons name="location-pin" size={30} color="orange" />
            <Text className="ml-2  mt-2 font-semibold">
              Live Location Preview
            </Text>
          </View>

          <View className="h-40 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
            <UserMap
              latitude={6.9271} // replace with live location or station latitude
              longitude={79.9612} // replace with live location or station longitude
              style={{ width: "100%", height: "100%" }}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AccidentScreen;
