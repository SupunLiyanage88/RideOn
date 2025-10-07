import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

// Define the interface for the component props
interface DialogHeaderProps {
  // Main props
  title: string;
  subtitle?: string;
  onClose?: () => void;
  
  // Icon props
  iconName?: string;
  iconComponent?: React.ComponentType<any>;
  closeIconName?: string;
  closeIconComponent?: React.ComponentType<any>;
  
  // Styling props
  backgroundColor?: string;
  iconBackgroundColor?: string;
  iconColor?: string;
  closeIconColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  borderColor?: string;
  
  // Layout props
  showBorder?: boolean;
  iconSize?: number;
  closeIconSize?: number;
  containerPadding?: {
    horizontal: number;
    top: number;
    bottom: number;
  };
  iconContainerSize?: number;
  
  // Press state
  closePressBackgroundColor?: string;
}

const DialogHeader = ({
  // Main props
  title,
  subtitle = "Enter details below",
  onClose,
  
  // Icon props
  iconName = "bike",
  iconComponent: IconComponent = MaterialCommunityIcons,
  closeIconName = "close",
  closeIconComponent: CloseIconComponent = Ionicons,
  
  // Styling props
  backgroundColor = "transparent",
  iconBackgroundColor = "rgba(11, 64, 87, 0.1)",
  iconColor = "#0B4057",
  closeIconColor = "#6b7280",
  titleColor = "#111827",
  subtitleColor = "#6b7280",
  borderColor = "#f3f4f6",
  
  // Layout props
  showBorder = true,
  iconSize = 24,
  closeIconSize = 24,
  containerPadding = { horizontal: 24, top: 20, bottom: 16 },
  iconContainerSize = 44,
  
  // Press state
  closePressBackgroundColor = "#f3f4f6",
}: DialogHeaderProps) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: containerPadding.horizontal,
        paddingTop: containerPadding.top,
        paddingBottom: containerPadding.bottom,
        borderBottomWidth: showBorder ? 1 : 0,
        borderBottomColor: borderColor,
        backgroundColor,
      }}
    >
      {/* Left Section with Icon and Text */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: iconContainerSize,
            height: iconContainerSize,
            borderRadius: iconContainerSize / 2,
            backgroundColor: iconBackgroundColor,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <IconComponent
            name={iconName}
            size={iconSize}
            color={iconColor}
          />
        </View>
        <View>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: titleColor,
              letterSpacing: -0.5,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: subtitleColor,
              marginTop: 2,
            }}
          >
            {subtitle}
          </Text>
        </View>
      </View>

      {/* Close Button */}
      {onClose && (
        <Pressable
          onPress={onClose}
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: pressed ? closePressBackgroundColor : "transparent",
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <CloseIconComponent 
            name={closeIconName} 
            size={closeIconSize} 
            color={closeIconColor} 
          />
        </Pressable>
      )}
    </View>
  );
};

export default DialogHeader;