import React, { useEffect, useState } from "react";
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
  click01 = true, // default left active
  click02 = false,
}) => {
  const [activeLeft, setActiveLeft] = useState(click01);
  const [activeRight, setActiveRight] = useState(click02);

  // sync props if parent updates
  useEffect(() => {
    setActiveLeft(click01);
    setActiveRight(click02);
  }, [click01, click02]);

  const handlePress = (value: string) => {
    if (value === leftLabel) {
      setActiveLeft(true);
      setActiveRight(false);
      onToggle?.(true, false);
    } else {
      setActiveLeft(false);
      setActiveRight(true);
      onToggle?.(false, true);
    }
  };

  return (
    <View className="flex-row bg-[#E6E6E6] rounded-full w-[87%] h-14 p-1">
      <TouchableOpacity
        onPress={() => handlePress(leftLabel)}
        className={`flex-1 justify-center items-center rounded-full ${
          activeLeft ? "bg-white" : "bg-transparent"
        }`}
      >
        <Text
          className={`${
            activeLeft ? "text-[#0B4057] font-bold" : "text-gray-500"
          }`}
        >
          {leftLabel}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handlePress(rightLabel)}
        className={`flex-1 justify-center items-center rounded-full ${
          activeRight ? "bg-white" : "bg-transparent"
        }`}
      >
        <Text
          className={`${
            activeRight ? "text-[#0B4057] font-bold" : "text-gray-500"
          }`}
        >
          {rightLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ToggleButton;
