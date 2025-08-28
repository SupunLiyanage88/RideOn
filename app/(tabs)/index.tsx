import { Ionicons } from "@expo/vector-icons"; // ✅ import the icon set you want
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-row items-center p-4">
        
        <Ionicons name="search" size={24} color="black" style={{ marginRight: 8 }} />

        <Text className="text-lg font-medium">Search</Text>
      </SafeAreaView>
    </View>
  );
}
