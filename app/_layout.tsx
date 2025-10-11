import UseCurrentUser from "@/hooks/useCurrentUser";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useSegments } from "expo-router";
import { StatusBar } from "react-native";
import "../api/index";
import { ChatIconModal } from "./components/ChatBotIcon";
import "./globals.css";

const queryClient = new QueryClient();

function RootContent() {
  const segments = useSegments();
  const { user } = UseCurrentUser();

  const hideChatButton =
    segments[0] === "(auth)" ||
    segments[0] === "(admin)" ||
    (segments[0] === "(tabs)" && segments[1] === "admin") ||
    !user;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      {!hideChatButton && <ChatIconModal />}
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootContent />
      <StatusBar barStyle="dark-content" />
    </QueryClientProvider>
  );
}
