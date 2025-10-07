import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const ChatBotIcon = () => {
  const [chatVisible, setChatVisible] = useState(false);

  const handleOpenChat = () => setChatVisible(true);
  const handleCloseChat = () => setChatVisible(false);

  return (
    <>
      {/* Chat Icon */}
      <View
        style={{
          position: "absolute",
          bottom: 100,
          right: 20,
          zIndex: 100,
        }}
      >
        <TouchableOpacity
          onPress={handleOpenChat}
          activeOpacity={0.8}
          style={{
            width: 66,
            height: 66,
            borderRadius: 50,
            backgroundColor: "#083A4C",
            justifyContent: "center",
            alignItems: "center",
            elevation: 6,
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <MaterialIcons name="support-agent" size={32} color="white" />
        </TouchableOpacity>
      </View>

      {/* Chat Modal */}
      <Modal visible={chatVisible} animationType="slide" onRequestClose={handleCloseChat}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 12,
              paddingHorizontal: 16,
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

export default ChatBotIcon;
