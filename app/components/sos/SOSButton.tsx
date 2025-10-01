import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, TouchableWithoutFeedback } from "react-native";

type SOSButtonProps = {
  isActive?: boolean;
  onActivate?: () => void;
  onCancel?: () => void;
  isLocationLoading?: boolean;
};

const SOSButton: React.FC<SOSButtonProps> = ({
  isActive,
  onActivate,
  onCancel,
  isLocationLoading,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    if (isActive) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();

      return () => loop.stop();
    } else {
      scaleAnim.stopAnimation();
      scaleAnim.setValue(1);
    }
  }, [isActive]);

  const handlePress = () => {
    if (!isActive) {
      onActivate && onActivate();
    } else {
      onCancel && onCancel();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress} disabled={isLocationLoading}>
      <Animated.View
        style={{
          justifyContent: "center",
          alignItems: "center",
          width: 170,
          height: 170,
          marginTop: 24,
          borderRadius: 90,
          transform: [{ scale: scaleAnim }],
          borderWidth: isClicked ? 0 : 4,
          borderColor: isClicked ? "transparent" : "white",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isClicked ? 0.3 : 0.6,
          shadowRadius: isClicked ? 4.65 : 10,
          backgroundColor: isLocationLoading ? "gray" : "#dc2626",
          elevation: isClicked ? 8 : 12,
        }}
      >
        <MaterialIcons name="warning" size={24} color="white" />
        <MaterialIcons name="sos" size={36} color="white" />
        <Text style={{ fontWeight: "600", color: "white" }}>EMERGENCY</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default SOSButton;
