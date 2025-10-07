import React from "react";
import { Text, View } from "react-native";

const ProfileHeader = () => {
  return (
    <View style={{ alignItems: "center", paddingTop: 8, paddingBottom: 32 }}>
      <View
        style={{
          width: 110,
          height: 110,
          borderRadius: 55,
          backgroundColor: "#37A77D",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
          shadowColor: "#37A77D",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <Text style={{ fontSize: 44, color: "white" }}>👤</Text>
      </View>
      <Text
        style={{
          fontSize: 28,
          fontWeight: "800",
          color: "#083A4C",
          letterSpacing: -0.5,
        }}
      >
        John Doe
      </Text>
      <Text
        style={{
          fontSize: 15,
          color: "#6b7280",
          marginTop: 6,
          fontWeight: "500",
        }}
      >
        john.doe@example.com
      </Text>
      <View
        style={{
          flexDirection: "row",
          marginTop: 20,
          gap: 16,
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              color: "#37A77D",
              textAlign: "center",
            }}
          >
            12
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: "#6b7280",
              marginTop: 2,
              fontWeight: "600",
            }}
          >
            Bikes
          </Text>
        </View>
        <View
          style={{
            backgroundColor: "white",
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              color: "#37A77D",
              textAlign: "center",
            }}
          >
            48
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: "#6b7280",
              marginTop: 2,
              fontWeight: "600",
            }}
          >
            Rentals
          </Text>
        </View>
      </View>
    </View>
  );
};
export default ProfileHeader;
