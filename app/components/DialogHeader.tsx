import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type DialogHeaderProps = {
  title: string;
  onClose: () => void;
};

const DialogHeader = ({ title, onClose }: DialogHeaderProps) => {
  return (
    <View
      style={{
        flexDirection: "row", // flex-row
        alignItems: "center", // items-center
        justifyContent: "space-between", // justify-between
        marginBottom: 16, // mb-4
      }}
    >
      <Text
        style={{
          fontSize: 18, // text-lg
          fontWeight: "700", // font-bold
        }}
      >
        {title}
      </Text>

      <TouchableOpacity
        onPress={onClose}
        style={{
          borderRadius: 9999, // rounded-full
          height: 40, // h-10
          width: 40, // w-10
          alignItems: "center", // items-center
          justifyContent: "center", // justify-center
        }}
      >
        <AntDesign name="close" size={20} color="gray" />
      </TouchableOpacity>
    </View>
  );
};

export default DialogHeader;
