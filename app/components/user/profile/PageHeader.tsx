import { Ionicons } from '@expo/vector-icons'; // or your icon library
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  progressPercentage?: number;
  onBackPress: () => void;
  showBackButton?: boolean;
  backgroundColor?: string;
  pressedBackgroundColor?: string;
  borderColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  progressColor?: string;
  progressTextColor?: string;
}

const PageHeader = ({
  title = "Add Your Bike",
  subtitle,
  progressPercentage = 0,
  onBackPress,
  showBackButton = true,
  backgroundColor = "#f9fafb",
  pressedBackgroundColor = "#f3f4f6",
  borderColor = "#e5e7eb",
  titleColor = "#083A4C",
  subtitleColor = "#6b7280",
  progressColor = "#083A4C",
  progressTextColor = "#ffffff",
}: HeaderProps) => {
  return (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    }}>
      {/* Back Button */}
      {showBackButton && (
        <Pressable
          onPress={onBackPress}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: pressed ? pressedBackgroundColor : backgroundColor,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: borderColor,
          })}
        >
          <Ionicons name="arrow-back" size={24} color={titleColor} />
        </Pressable>
      )}

      {/* Title and Subtitle */}
      <View style={{ 
        alignItems: "center", 
        flex: 1, 
        marginHorizontal: 16,
        marginLeft: showBackButton ? 16 : 0, // Adjust margin when back button is hidden
      }}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "800",
            color: titleColor,
            letterSpacing: -0.5,
            textAlign: "center",
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontSize: 14,
              color: subtitleColor,
              marginTop: 2,
              textAlign: "center",
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {/* Progress Percentage */}
      <View style={{ 
        backgroundColor: progressColor, 
        paddingHorizontal: 12, 
        paddingVertical: 6,
        borderRadius: 20,
        minWidth: 44, // Match back button width for balance
        alignItems: 'center',
      }}>
        <Text style={{ 
          color: progressTextColor, 
          fontSize: 12, 
          fontWeight: "700" 
        }}>
          {Math.round(progressPercentage)}%
        </Text>
      </View>
    </View>
  );
};

export default PageHeader;