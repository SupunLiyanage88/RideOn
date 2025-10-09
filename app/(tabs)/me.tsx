import { logout } from "@/api/auth";
import { getUnreadCount } from "@/utils/notifications";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ModernMenuItem from "../components/user/profile/ModernMenuItem";
import NotificationModal from "../components/user/profile/NotificationModal";
import ProfileHeader from "../components/user/profile/ProfileHeader";
import QuickActionCard from "../components/user/profile/QuickActionCard";


const NotificationIcon = ({ 
  notificationCount, 
  onPress 
}: { 
  notificationCount: number; 
  onPress: () => void; 
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        position: "relative",
        backgroundColor: "#FFFFFF",
        borderRadius: 50,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <Ionicons name="notifications-outline" size={24} color="#083A4C" />
      
      {/* Dynamic notification badge */}
      {notificationCount > 0 && (
        <View
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "#EF4444",
            borderRadius: 10,
            minWidth: 20,
            height: 20,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: "#FFFFFF",
            paddingHorizontal: 4,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 10,
              fontWeight: "700",
            }}
          >
            {notificationCount > 99 ? '99+' : notificationCount.toString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

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
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Load notification count when screen is focused
  const loadNotificationCount = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setNotificationCount(count);
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotificationCount();
    }, [loadNotificationCount])
  );

  const handleNotificationPress = () => {
    setShowNotificationModal(true);
  };

  const handleNotificationModalClose = () => {
    setShowNotificationModal(false);
  };

  const handleNotificationCountChange = (count: number) => {
    setNotificationCount(count);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFB" }}>
      {/* Header with notification icon */}
      <View style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 5,
      }}>
        <Text style={{
          fontSize: 28,
          fontWeight: "800",
          color: "#083A4C",
          letterSpacing: -0.5,
        }}>
          Profile
        </Text>
        <NotificationIcon 
          notificationCount={notificationCount}
          onPress={handleNotificationPress}
        />
      </View>

      {/* Notification Modal */}
      <NotificationModal
        visible={showNotificationModal}
        onClose={handleNotificationModalClose}
        onNotificationCountChange={handleNotificationCountChange}
      />

      <ScrollView 
        contentContainerStyle={{ padding: 20, paddingTop: 10 }}
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

        {/* Test Notifications (for development) */}
        {__DEV__ && (
          <>
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
              TESTING (DEV ONLY)
            </Text>
            
            <ModernMenuItem
              icon="🧪"
              title="Add Test Notifications"
              subtitle="Test notification system"
              onPress={async () => {
                const { addTestNotifications } = await import("@/utils/testNotifications");
                await addTestNotifications();
                await loadNotificationCount();
              }}
            />
          </>
        )}

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