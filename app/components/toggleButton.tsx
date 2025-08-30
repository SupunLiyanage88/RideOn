import "@/app/globals";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type ToggleProps = {
  leftLabel: string;
  rightLabel: string;
  onToggle?: (clickedLeft: boolean, clickedRight: boolean) => void;
  click01?: boolean;
  click02?: boolean;
};

const ToggleButton: React.FC<ToggleProps> = ({
  leftLabel,
  rightLabel,
  onToggle,
  click01,
  click02,
}) => {
  const handlePress = (value: string) => {
    if (value === leftLabel) {
      onToggle?.(true, false);
    } else {
      onToggle?.(false, true);
    }
  };

  return (
    <View className="flex-row bg-[#E6E6E6] rounded-full w-[87%] h-14 p-1">
      <TouchableOpacity
        onPress={() => handlePress(leftLabel)}
        className={`flex-1 justify-center items-center rounded-full ${
          click01 ? "bg-white" : "bg-transparent"
        }`}
      >
        <Text
          className={`${
            click01 ? "text-[#0B4057] font-bold" : "text-gray-500"
          }`}
        >
          {leftLabel}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handlePress(rightLabel)}
        className={`flex-1 justify-center items-center rounded-full ${
          click02 ? "bg-white" : "bg-transparent"
        }`}
      >
        <Text
          className={`${
            click02 ? "text-[#0B4057] font-bold" : "text-gray-500"
          }`}
        >
          {rightLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ToggleButton;
