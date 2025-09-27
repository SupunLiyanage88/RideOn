import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
} from "react-native";

const SOSButton = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    if (isClicked) {
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
  }, [isClicked, scaleAnim]);

  const handlePress = () => {
    setIsClicked(true); 
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View
        style={[
          styles.button,
          {
            transform: [{ scale: scaleAnim }],
            borderWidth: isClicked ? 0 : 4,
            borderColor: isClicked ? "transparent" : "white",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: isClicked ? 0.3 : 0.6,
            shadowRadius: isClicked ? 4.65 : 10,
            elevation: isClicked ? 8 : 12,
          },
        ]}
      >
        <MaterialIcons name="warning" size={24} color="white" />
        <MaterialIcons name="sos" size={36} color="white" />
        <Text style={styles.text}>EMERGENCY</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
    width: 180,
    height: 180,
    marginTop: 24,
    backgroundColor: "#dc2626",
    borderRadius: 90,
  },
  text: {
    fontWeight: "600",
    color: "white",
  },
});

export default SOSButton;
