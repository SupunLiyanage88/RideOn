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
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 8 }}>Checking authentication...</Text>
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
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <SafeAreaView style={{ padding: 8, flex: 1 }}>
        {/* Searchbar */}
        <Searchbar />

        {/* Weather Component */}
        <ScrollView style={{ flex: 1 }}>
          {isLoading ? (
            <View
              style={{
                width: "100%",
                borderRadius: 8,
                backgroundColor: "#fff",
                padding: 16,
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
                elevation: 3,
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                height: 80,
                marginTop: 40,
              }}
            >
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={{ marginTop: 8 }}>Loading weather data...</Text>
            </View>
          ) : isError ? (
            <View
              style={{
                width: "100%",
                borderRadius: 8,
                backgroundColor: "#fff",
                padding: 16,
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
                elevation: 3,
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                marginTop: 40,
              }}
            >
              <Text style={{ color: "red", fontSize: 16 }}>
                Error: {(error as Error).message}
              </Text>
              <Text style={{ marginTop: 8 }}>Please try another location</Text>
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
