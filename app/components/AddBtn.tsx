import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface AddBtnProps {
  title?: string;
  onPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
  iconColor?: string;
  iconSize?: number;
}

const AddBtn = ({
  title = "Add New Bike",
  onPress,
  backgroundColor = "#083A4C",
  textColor = "white",
  iconColor = "white",
  iconSize = 25,
}: AddBtnProps) => {
  return (
    <TouchableOpacity
      style={{
        borderRadius: 24,
        paddingVertical: 16,
        marginVertical: 8,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        marginHorizontal: "auto",
        backgroundColor,
      }}
      onPress={onPress}
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
        }}
      >
        <MaterialIcons
          name="add-circle-outline"
          size={iconSize}
          color={iconColor}
        />
        <Text
          style={{
            fontWeight: "600",
            fontSize: 18,
            color: textColor,
          }}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default AddBtn;
