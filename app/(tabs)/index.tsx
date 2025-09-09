import "@/api/weather";
import { WeatherData, fetchWeatherByCity } from "@/api/weather";
import UseCurrentUser from "@/hooks/useCurrentUser";
import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Directions from "../components/Directions";
import Searchbar from "../components/Searchbar";
import Weather from "../components/Weather";

export default function Index() {
  const { user, status } = UseCurrentUser();

if (status === "loading") {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text className="mt-2">Checking authentication...</Text>
    </View>
  );
}
  const city = "Malabe";

  const {
    data: weatherData,
    isLoading,
    isError,
    error,
  } = useQuery<WeatherData, Error>({
    queryKey: ["weather", city],
    queryFn: () => fetchWeatherByCity(city),
  });

  const location =
    weatherData && weatherData.sys
      ? `${weatherData.name}, ${weatherData.sys.country}`
      : "Unknown";

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="p-4">
        {/* Searchbar */}
        <Searchbar />

        {/* Weather Component */}
        <ScrollView className="h-full">
          {isLoading ? (
            <View className=" menu-card flex-1 justify-center items-center mt-10">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="mt-2">Loading weather data...</Text>
            </View>
          ) : isError ? (
            <View className="menu-card flex-1 justify-center items-center mt-10">
              <Text className="text-red-500">
                Error: {(error as Error).message}
              </Text>
              <Text className="mt-2">Please try another location</Text>
            </View>
          ) : (
            <Weather location={location} weatherData={weatherData} />
          )}

          {/* Direction Component */}
          <Directions />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
