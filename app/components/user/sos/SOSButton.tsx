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
  isActive = false,
  onActivate,
  onCancel,
  isLocationLoading,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isClicked, setIsClicked] = useState(false);
  const [internalActive, setInternalActive] = useState(isActive);

  // Sync with external isActive prop
  useEffect(() => {
    setInternalActive(isActive);
  }, [isActive]);

  useEffect(() => {
    if (internalActive) {
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
      // Reset animation when not active
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [internalActive, scaleAnim]);

  const handlePressIn = () => {
    setIsClicked(true);
  };

  const handlePressOut = () => {
    setIsClicked(false);
  };

  const handlePress = () => {
    if (isLocationLoading) return;
    
    if (!internalActive) {
      setInternalActive(true);
      onActivate && onActivate();
    } else {
      setInternalActive(false);
      onCancel && onCancel();
    }
  };

  return (
    <TouchableWithoutFeedback 
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isLocationLoading}
    >
      <Animated.View
        style={{
          justifyContent: "center",
          alignItems: "center",
          width: 170,
          height: 170,
          marginTop: 24,
          borderRadius: 85, // Half of width/height for perfect circle
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