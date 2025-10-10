import AntDesign from '@expo/vector-icons/AntDesign';
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface PendingBtnProps {
  title?: string;
  onPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
  iconColor?: string;
  iconSize?: number;
}

const PendingBtnProps = ({ 
  title = "Add New Bike", 
  onPress,
  backgroundColor = "#083A4C",
  textColor = "white",
  iconColor = "white",
  iconSize = 45
}: PendingBtnProps) => {
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
        backgroundColor 
      }}
      onPress={onPress}
    >
      <View style={{ 
        alignItems: "center", 
        justifyContent: "center" 
      }}>
        <AntDesign name="file-done" size={24} color={iconColor} />
        <Text style={{ 
          fontWeight: "600", 
          fontSize: 18, 
          marginTop: 8,
          color: textColor 
        }}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default PendingBtnProps;