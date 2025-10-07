import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ModernMenuItemProps {
  icon: string | React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  gradient?: boolean;
}

const ModernMenuItem: React.FC<ModernMenuItemProps> = ({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  gradient = false 
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        padding: 18,
        borderRadius: 20,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: gradient ? "#37A77D" : "transparent",
      }}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          backgroundColor: gradient ? "#37A77D" : "#E8F5F0",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 16,
        }}
      >
        <Text style={{ fontSize: 24 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ 
          fontSize: 17, 
          fontWeight: "700", 
          color: "#083A4C",
          letterSpacing: -0.3
        }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ 
            fontSize: 13, 
            color: "#6b7280", 
            marginTop: 3,
            fontWeight: "500"
          }}>
            {subtitle}
          </Text>
        )}
      </View>
      <View style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Text style={{ fontSize: 16, color: "#37A77D", fontWeight: "700" }}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ModernMenuItem;