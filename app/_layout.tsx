import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useSegments } from "expo-router";
import "../api/index";
import { ChatIconModal } from "./components/ChatBotIcon";
import "./globals.css";
const queryClient = new QueryClient();

export default function RootLayout() {
  const segments = useSegments();

  const hideChatButton =
    segments[0] === "(auth)" ||
    segments[0] === "(admin)" ||
    (segments[0] === "(tabs)" && segments[1] === "admin");
  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      {!hideChatButton && <ChatIconModal />}
    </QueryClientProvider>
  );
}
