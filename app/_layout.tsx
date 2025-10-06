// src/app/_layout.tsx

import { MaterialIcons } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useSegments } from "expo-router";
import { FC, useRef, useState } from "react";
import {
  Animated,
  // Gesture handlers are no longer needed
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import "../api/index";
import "./globals.css";

const queryClient = new QueryClient();

const ICON_SIZE = 34;
const ICON_PADDING = 16;
const ICON_CONTAINER_SIZE = ICON_SIZE + ICON_PADDING * 2;
const VISIBLE_PART_WIDTH = 25;
const HIDDEN_TRANSLATE_X = ICON_CONTAINER_SIZE - VISIBLE_PART_WIDTH;
const ANIMATION_DURATION = 250;

const RootLayout: FC = () => {
  const [chatVisible, setChatVisible] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const segments = useSegments();
  const hideChatButton =
    segments[0] === "(auth)" ||
    segments[0] === "(admin)" ||
    (segments[0] === "(tabs)" && segments[1] === "admin");

  const slideAnim = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    const newIsExpanded = !isExpanded;
    const toValue = newIsExpanded ? 1 : 0;

    setIsExpanded(newIsExpanded);
    Animated.timing(slideAnim, {
      toValue,
      duration: ANIMATION_DURATION,
      useNativeDriver: false,
    }).start();
  };
  
  const handleIconPress = () => {
    if (isExpanded) {
      setChatVisible(true);
    } else {
      toggleExpand();
    }
  };

  const handleCloseChat = () => {
    setChatVisible(false);
    if (isExpanded) {
      setIsExpanded(false);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      }).start();
    }
  };

  const slideTranslateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [HIDDEN_TRANSLATE_X, 0],
  });

  const mainIconOpacity = slideAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const arrowOpacity = slideAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>

        {!hideChatButton && (
          <Animated.View
            style={{
              transform: [{ translateX: slideTranslateX }],
              position: "absolute",
              bottom: 100,
              right: 20,
              zIndex: 100,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleIconPress}
              style={{
                width: ICON_CONTAINER_SIZE,
                height: ICON_CONTAINER_SIZE,
                backgroundColor: isExpanded ? "#083A4C" : "#083A4C40",
                borderRadius: 50,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOpacity: 0.3,
                right:isExpanded ? 0 : -12,
                shadowOffset: { width: 0, height: 2 },
              }}
            >
              <Animated.View style={{ opacity: arrowOpacity, position: "absolute",left:12 }}>
                <MaterialIcons
                  name="arrow-back-ios"
                  size={20}
                  color="white"
                  style={{ marginLeft: 5 }}
                />
              </Animated.View>

              <Animated.View style={{ opacity: mainIconOpacity, position: "absolute" }}>
                <MaterialIcons name="support-agent" size={ICON_SIZE} color="white" />
              </Animated.View>
            </TouchableOpacity>

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
                  borderRadius: 50,
                  padding: 2,
                  elevation: 6,
                }}
              >
                <MaterialIcons name="close" size={18} color="#333" />
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        )}

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
      </SafeAreaView>
    </QueryClientProvider>
  );
};

export default RootLayout;