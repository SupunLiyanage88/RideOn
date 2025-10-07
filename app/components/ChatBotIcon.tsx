// ChatIconModal.tsx
import { MaterialIcons } from "@expo/vector-icons";
import { FC, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const ICON_SIZE = 34;
const ICON_PADDING = 16;
const ICON_CONTAINER_SIZE = ICON_SIZE + ICON_PADDING * 2;
const VISIBLE_PART_WIDTH = 25;
const HIDDEN_TRANSLATE_X = ICON_CONTAINER_SIZE - VISIBLE_PART_WIDTH;
const ANIMATION_DURATION = 250;

interface ChatIconModalProps {
  hideChatButton?: boolean;
}

export const ChatIconModal: FC<ChatIconModalProps> = ({ hideChatButton = false }) => {
  const [chatVisible, setChatVisible] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    const newIsExpanded = !isExpanded;
    setIsExpanded(newIsExpanded);
    
    Animated.timing(slideAnim, {
      toValue: newIsExpanded ? 1 : 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
  };

  const handleCollapsedIconPress = () => {
    toggleExpand();
  };

  const handleExpandedIconPress = () => {
    setChatVisible(true);
  };

  const handleCloseChat = () => {
    setChatVisible(false);
    if (isExpanded) {
      toggleExpand();
    }
  };

  const slideTranslateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [HIDDEN_TRANSLATE_X, 0],
  });

  const mainIconOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const arrowOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  if (hideChatButton) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Icon */}
      <Animated.View
        style={{
          transform: [{ translateX: slideTranslateX }],
          position: "absolute",
          bottom: 100,
          right: !isExpanded ? 10 : 20,
          zIndex: 100,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={isExpanded ? handleExpandedIconPress : handleCollapsedIconPress}
          style={{
            width: ICON_CONTAINER_SIZE,
            height: ICON_CONTAINER_SIZE,
            backgroundColor: isExpanded ? "#083A4C" : "#A3C5CF",
            borderRadius: ICON_CONTAINER_SIZE / 2,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 3,
            elevation: 4,
          }}
        >
          {/* Back Arrow Icon (visible when collapsed) */}
          <Animated.View 
            style={{ 
              opacity: arrowOpacity, 
              position: "absolute", 
              left: 16
            }}
          >
            <MaterialIcons
              name="arrow-back-ios"
              size={20}
              color="white"
            />
          </Animated.View>

          {/* Chat Icon (visible when expanded) */}
          <Animated.View 
            style={{ 
              opacity: mainIconOpacity, 
              position: "absolute" 
            }}
          >
            <MaterialIcons name="support-agent" size={ICON_SIZE} color="white" />
          </Animated.View>
        </TouchableOpacity>

        {/* Close Button (visible when expanded) */}
        <Animated.View
          style={{
            position: "absolute",
            top: -5,
            right: -5,
            opacity: mainIconOpacity,
          }}
        >
          <TouchableOpacity
            onPress={toggleExpand}
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 4,
              elevation: 6,
              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 3,
            }}
          >
            <MaterialIcons name="close" size={16} color="#333" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Chat Modal */}
      <Modal
        visible={chatVisible}
        animationType="slide"
        onRequestClose={handleCloseChat}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 15,
              borderBottomWidth: 1,
              borderColor: "#ddd",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600" }}>RideBot</Text>
            <TouchableOpacity onPress={handleCloseChat}>
              <MaterialIcons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>
          <WebView
            source={{
              uri: "https://www.chatbase.co/chatbot-iframe/3xUsKuoERPBSltavUSoYE",
            }}
            style={{ flex: 1 }}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
};