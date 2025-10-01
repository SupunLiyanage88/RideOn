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
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "#E6E6E6",
        borderRadius: 9999,
        width: "87%",
        height: 56, // h-14 ~ 56px
        padding: 4, // p-1 ~ 4px
      }}
    >
      {/* Left Button */}
      <TouchableOpacity
        onPress={() => handlePress(leftLabel)}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 9999,
          backgroundColor: activeLeft ? "#FFFFFF" : "transparent",
        }}
      >
        <Text
          style={{
            color: activeLeft ? "#0B4057" : "#6B7280", // text-gray-500
            fontWeight: activeLeft ? "700" : "400",
          }}
        >
          {leftLabel}
        </Text>
      </TouchableOpacity>

      {/* Right Button */}
      <TouchableOpacity
        onPress={() => handlePress(rightLabel)}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 9999,
          backgroundColor: activeRight ? "#FFFFFF" : "transparent",
        }}
      >
        <Text
          style={{
            color: activeRight ? "#0B4057" : "#6B7280", // text-gray-500
            fontWeight: activeRight ? "700" : "400",
          }}
        >
          {rightLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ToggleButton;
