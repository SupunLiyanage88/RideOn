import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function Layout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#083A4C" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
        headerLeft: () => (
          <TouchableOpacity
            style={{
              paddingHorizontal: 12, // adds tap area
              paddingVertical: 8, // centers it nicely
            }}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="StationManagement"
        options={{ title: "Station Management" }}
      />
      <Stack.Screen
        name="BikeManagement"
        options={{ title: "Bike Management" }}
      />
      <Stack.Screen
        name="EmergencyManagement"
        options={{ title: "Emergency Management" }}
      />
      <Stack.Screen
        name="PackageManagement"
        options={{ title: "Package Management" }}
      />      
    </Stack>
  );
}
