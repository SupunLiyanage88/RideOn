import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type ManagementCardProps = {
  title: string;
  icon: React.ReactNode;
  color: string;
  onPress?: () => void;
};

const ManagementCard = ({
  title,
  icon,
  color,
  onPress,
}: ManagementCardProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between rounded-3xl p-5 mb-3"
      style={{ backgroundColor: color }}
    >
      <View className="flex-row items-center">
        <View className="w-6 h-6 justify-center items-center">{icon}</View>
        <Text className="ml-3 text-white font-bold text-base">{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color="#fff" />
    </TouchableOpacity>
  );
};

export default ManagementCard;
