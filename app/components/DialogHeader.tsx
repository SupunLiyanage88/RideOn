import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type DialogHeaderProps = {
  title: string;
  onClose: () => void;
};

const DialogHeader = ({ title, onClose }: DialogHeaderProps) => {
  return (
    <View className="flex-row items-center justify-between mb-4">
      <Text className="text-lg font-bold">{title}</Text>

      <TouchableOpacity
        onPress={onClose}
        className="rounded-full h-10 w-10 items-center justify-center"
      >
        <AntDesign name="close" size={20} color="gray" />
      </TouchableOpacity>
    </View>
  );
};

export default DialogHeader;
