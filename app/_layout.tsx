import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useSegments } from "expo-router";
import { FC } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import "../api/index";
import "./globals.css";

const queryClient = new QueryClient();

const RootLayout: FC = () => {
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

        {/* {!hideChatButton && <ChatBotIcon />} */}
      </SafeAreaView>
    </QueryClientProvider>
  );
};

export default RootLayout;
