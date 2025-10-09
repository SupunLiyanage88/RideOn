import { logout } from "@/api/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ModernMenuItem from "../components/user/profile/ModernMenuItem";
import ProfileHeader from "../components/user/profile/ProfileHeader";
import QuickActionCard from "../components/user/profile/QuickActionCard";


const LogoutButton = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: logoutMutation, isPending } = useMutation({
    mutationFn: logout,
    onSuccess: async (data) => {
      // Clear all relevant AsyncStorage data
      await AsyncStorage.multiRemove(["token", "hasSeenBikeTerms"]);
      
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      queryClient.clear(); // Optional: Clear all query cache
      
      console.log("Logout successful:", data);
      router.replace("/(auth)/registerScreen");
    },
    onError: (data) => {
      alert("Logout Failed. Please try again.");
      console.log(data);
    },
  });

  const handleLogout = async () => {
    logoutMutation();
  };

  return (
    <TouchableOpacity
      onPress={handleLogout}
      disabled={isPending}
      activeOpacity={0.8}
      style={{
        backgroundColor: "#083A4C",
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: "center",
        marginTop: 8,
        opacity: isPending ? 0.7 : 1,
        shadowColor: "#083A4C",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <Text
        style={{
          color: "white",
          fontWeight: "800",
          fontSize: 17,
          letterSpacing: 0.5,
        }}
      >
        {isPending ? "LOGGING OUT..." : "LOG OUT"}
      </Text>
    </TouchableOpacity>
  );
};

const Me = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFB" }}>
      <ScrollView 
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader />

        {/* Quick Actions */}
        <View style={{ 
          flexDirection: "row", 
          gap: 12,
          marginBottom: 32
        }}>
          <QuickActionCard
            icon="bicycle"
            title="My Bikes"
            color="#37A77D"
            onPress={() => router.push("/components/user/profile/UserBikes")}
          />          
          <QuickActionCard
            icon="plus"
            title="Add Bike"
            color="#083A4C"
            onPress={() => router.push("/components/user/profile/AddUserBikes")}
          />
        </View>

        {/* Account Section */}
        <Text style={{
          fontSize: 12,
          fontWeight: "800",
          color: "#083A4C",
          marginBottom: 16,
          marginLeft: 4,
          textTransform: "uppercase",
          letterSpacing: 1.2,
          opacity: 0.6,
        }}>
          ACCOUNT SETTINGS
        </Text>
        
        <ModernMenuItem
          icon="✏️"
          title="Edit Profile"
          subtitle="Update your personal information"
          onPress={() => console.log("Edit Profile")}
        />
        <ModernMenuItem
          icon="🔒"
          title="Change Password"
          subtitle="Update your security credentials"
          onPress={() => console.log("Change Password")}
        />
        <ModernMenuItem
          icon="🔔"
          title="Notifications"
          subtitle="Manage your preferences"
          onPress={() => console.log("Notifications")}
        />

        {/* Support */}
        <Text style={{
          fontSize: 12,
          fontWeight: "800",
          color: "#083A4C",
          marginBottom: 16,
          marginTop: 24,
          marginLeft: 4,
          textTransform: "uppercase",
          letterSpacing: 1.2,
          opacity: 0.6,
        }}>
          SUPPORT
        </Text>
        
        <ModernMenuItem
          icon="❓"
          title="Help Center"
          subtitle="Get help and support"
          onPress={() => console.log("Help")}
        />

        <View style={{ marginTop: 16 }}>
          <LogoutButton />
        </View>

        <Text
          style={{
            textAlign: "center",
            color: "#9ca3af",
            fontSize: 13,
            marginTop: 32,
            marginBottom: 16,
            fontWeight: "600",
            letterSpacing: 0.5,
          }}
        >
          VERSION 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Me;