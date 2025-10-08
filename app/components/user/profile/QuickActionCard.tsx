import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface QuickActionCardProps {
  icon: string;
  title: string;
  color: string;
  onPress: () => void;
}

const QuickActionCard = ({
  icon,
  title,
  color,
  onPress,
}: QuickActionCardProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.container,
        {
          backgroundColor: color,
          shadowColor: color,
        },
      ]}
    >
      <View style={{ marginBottom: 10 }}>
        <FontAwesome5 name={icon} size={35} color="white" />
      </View>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    minHeight: 120,
    justifyContent: "center",
  },
  icon: {
    fontSize: 60,
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    letterSpacing: -0.2,
  },
});

export default QuickActionCard;
