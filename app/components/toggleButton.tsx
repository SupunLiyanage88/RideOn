import "@/app/globals"; // Ensure global styles are imported
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type ToggleProps = {
  leftLabel: string;
  rightLabel: string;
  onToggle?: (clickedLogin: boolean, clickedRegister: boolean) => void;
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
  const [clickedLogin, setClickedLogin] = useState(true);
  const [clickedRegister, setClickedRegister] = useState(false);

  const handlePress = (value: string) => {
    if (value === leftLabel) {
      setClickedLogin(true);
      setClickedRegister(false);
      onToggle?.(true, false);
    } else {
      setClickedLogin(false);
      setClickedRegister(true);
      onToggle?.(false, true);
    }
  };
  console.log("Login click01:", click01, "Register click01:", click02);
  return (
    <View className="flex-row items-center justify-center bg-[#E6E6E6] rounded-full py-1 w-[87%] h-16">
      <TouchableOpacity
        onPress={() => handlePress(leftLabel)}
        className="flex-1 items-center"
      >
        <Text className={`${click01 ? "text-[#0B4057] font-bold" : "text-gray-400"}`}>
          {leftLabel}
        </Text>
      </TouchableOpacity>

      <View className="w-[1px] h-5 bg-slate-900 mx-1" />

      <TouchableOpacity
        onPress={() => handlePress(rightLabel)}
        className="flex-1 items-center"
      >
        <Text className={`${click02 ? "text-[#0B4057] font-bold" : "text-gray-400"}`}>
          {rightLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ToggleButton;
