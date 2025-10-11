import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const ActionButton = ({ 
  title, 
  subtitle, 
  icon, 
  color, 
  onPress 
}: { 
  title: string; 
  subtitle: string; 
  icon: string; 
  color: string; 
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={{
      backgroundColor: "white",
      borderRadius: 16,
      padding: 20,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      flexDirection: "row",
      alignItems: "center",
    }}
    onPress={onPress}
  >
    <View
      style={{
        backgroundColor: `${color}20`,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
      }}
    >
      <MaterialCommunityIcons 
        name={icon as any} 
        size={28} 
        color={color} 
      />
    </View>
    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: "#1F2937",
          marginBottom: 4,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: "#6B7280",
        }}
      >
        {subtitle}
      </Text>
    </View>
    <Ionicons 
      name="chevron-forward" 
      size={20} 
      color="#9CA3AF" 
    />
  </TouchableOpacity>
);

const QuickActions = () => {
  return (
    <View style={{ marginVertical: 20, marginHorizontal: 16 }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: "#1F2937",
          marginBottom: 16,
        }}
      >
        Quick Actions
      </Text>
      
      <ActionButton
        title="Find & Rent Bikes"
        subtitle="Discover bikes near your location"
        icon="map-search"
        color="#37A77D"
        onPress={() => router.push("/(tabs)/search")}
      />
      
      <ActionButton
        title="Emergency SOS"
        subtitle="Get help in case of emergency"
        icon="alert-circle"
        color="#EF4444"
        onPress={() => router.push("/(tabs)/sos")}
      />
      
      <ActionButton
        title="Rewards & Points"
        subtitle="Check your earned rewards"
        icon="star-circle"
        color="#37A77D"
        onPress={() => router.push("/(tabs)/reward")}
      />
      
      <ActionButton
        title="My Profile"
        subtitle="Manage account and settings"
        icon="account-circle"
        color="#083A4C"
        onPress={() => router.push("/(tabs)/me")}
      />
    </View>
  );
};

export default QuickActions;