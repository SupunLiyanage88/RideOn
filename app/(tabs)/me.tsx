import { logout } from "@/api/auth";
import queryClient from "@/state/queryClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Logoutbtn = () => {
  const router = useRouter();

  const { mutate: logoutMutation, isPending } = useMutation({
    mutationFn: logout,
    onSuccess: async (data) => {
      await AsyncStorage.removeItem("token");
      queryClient.invalidateQueries({ queryKey: ["current-user"] });

      alert("Logout Success.");
      console.log("Logout successful:", data);
      router.replace("/(auth)/registerScreen");
    },
    onError: (data) => {
      alert("Logout Failed. Please check your credentials.");
      console.log(data);
    },
  });

  const handleLogout = async () => {
    logoutMutation();
  };
  return (
    <TouchableOpacity
      onPress={handleLogout}
      className="bg-red-500 px-4 py-2 rounded-2xl"
    >
      <Text className="text-white font-semibold text-base">
        {isPending ? "Logging out" : "Log out"}
      </Text>
    </TouchableOpacity>
  );
};

const me = () => {
  return (
    <SafeAreaView>
      <Text>me</Text>
      <Logoutbtn />
    </SafeAreaView>
  );
};

export default me;
