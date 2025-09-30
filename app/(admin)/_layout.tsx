import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#083A4C", 
        },
        headerTintColor: "#fff", 
        headerTitleStyle: {
          fontWeight: "bold",
        },
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
