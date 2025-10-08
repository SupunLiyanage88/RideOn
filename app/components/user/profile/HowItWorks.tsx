import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from 'react';
import { Text, View } from 'react-native';

interface StepItem {
  step: string;
  text: string;
  icon: string;
}

interface HowItWorksProps {
  // Optional props for customization
  title?: string;
  subtitle?: string;
  steps?: StepItem[];
  backgroundColor?: string;
  borderColor?: string;
}

const HowItWorks: React.FC<HowItWorksProps> = ({
  title = "How it works",
  subtitle = "Simple 4-step process",
  steps = [
    {
      step: "1",
      text: "Fill out the bike details below",
      icon: "file-document-outline",
    },    
    {
      step: "2",
      text: "Submit for review by our team",
      icon: "send",
    },
    {
      step: "3",
      text: "We'll approve and assign to a station",
      icon: "check-circle",
    },
    {
      step: "4",
      text: "Start earning when others rent your bike!",
      icon: "cash",
    },
  ],
  backgroundColor = "#EBF4FF",
  borderColor = "#D1E7FF",
}) => {
  return (
    <View
      style={{
        backgroundColor: backgroundColor,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: borderColor,
        shadowColor: "#083A4C",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 20,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <View
          style={{
            backgroundColor: "#083A4C",
            padding: 8,
            borderRadius: 12,
            marginRight: 12,
          }}
        >
          <MaterialCommunityIcons name="bike" size={20} color="#ffffff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
              color: "#083A4C",
              letterSpacing: -0.3,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#4B5563",
              marginTop: 2,
            }}
          >
            {subtitle}
          </Text>
        </View>
      </View>

      <View style={{ gap: 8 }}>
        {steps.map((item, index) => (
          <View
            key={index}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 4,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: "#083A4C",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 12,
                  fontWeight: "700",
                }}
              >
                {item.step}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 14,
                color: "#374151",
                flex: 1,
                fontWeight: "500",
              }}
            >
              {item.text}
            </Text>
            <MaterialCommunityIcons
              name={item.icon as any}
              size={16}
              color="#6b7280"
            />
          </View>
        ))}
      </View>
    </View>
  );
};

export default HowItWorks;