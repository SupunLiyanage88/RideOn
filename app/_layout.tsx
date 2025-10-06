import { MaterialIcons } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useSegments } from "expo-router";
import { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import "../api/index";
import "./globals.css";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [chatVisible, setChatVisible] = useState(false);

  const segments = useSegments();
  const hideChatButton =
    segments[0] === "(auth)" ||
    segments[0] === "(admin)" ||
    (segments[0] === "(tabs)" && segments[1] === "admin");

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        {!hideChatButton && (
          <TouchableOpacity
            onPress={() => setChatVisible(true)}
            style={{
              position: "absolute",
              bottom: 80,
              right: 20,
              backgroundColor: "#083A4C",
              borderRadius: 50,
              padding: 16,
              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowOffset: { width: 0, height: 2 },
              zIndex: 100,
            }}
          >
            <MaterialIcons name="support-agent" size={28} color="white" />
          </TouchableOpacity>
        )}
        <Modal visible={chatVisible} animationType="slide">
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
              <TouchableOpacity onPress={() => setChatVisible(false)}>
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
}
