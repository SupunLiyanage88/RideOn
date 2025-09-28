import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="StationManagement"
        options={{ title: "Station Management" }}
      />
      <Stack.Screen
        name="PackageManagement"
        options={{ title: "Package Management" }}
      />
    </Stack>
  );
}
