import { MaterialCommunityIcons } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type ManagementCardProps = {
  title: string;
  icon: any;
  color: string; // background color
  onPress?: () => void;
};

const ManagementCard = ({ title, icon, color, onPress }: ManagementCardProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between rounded-lg p-5 mb-3"
      style={{ backgroundColor: color }}
    >
      <View className="flex-row items-center">
        <MaterialCommunityIcons name={icon} size={28} color="#fff" />
        <Text className="ml-3 text-white font-bold text-base">
          {title}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color="#fff" />
    </TouchableOpacity>
  );
};

export default ManagementCard;
