import { Link } from "expo-router";
import { Text, View } from "react-native";
import '../globals.css';

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to RideOn!
      </Text>
      <Link href="/(tabs)/search" className="mt-4 text-blue-500">Search Button</Link>
    </View>
  );
}
