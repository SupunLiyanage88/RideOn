import "@/api/weather";
import { WeatherData } from "@/api/weather";
import { images } from "@/constants/images";
import UseCurrentUser from "@/hooks/useCurrentUser";
import Entypo from "@expo/vector-icons/Entypo";
import Fontisto from "@expo/vector-icons/Fontisto";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image, Text, View } from "react-native";

interface WeatherProps {
  location: string;
  weatherData: WeatherData | null | undefined;
}

const Weather: React.FC<WeatherProps> = ({ location, weatherData }) => {
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = today.toLocaleDateString(undefined, options);

  const tempCelsius = weatherData
    ? Math.round(weatherData.main.temp - 273.15)
    : null;
  const weatherDescription = weatherData
    ? weatherData.weather[0].description
    : "";
  const humidity = weatherData ? weatherData.main.humidity : "";
  const windSpeed = weatherData ? weatherData.wind.speed : "";
  const { user, status } = UseCurrentUser();
  const name = user?.userName;
  return (
    <View className="menu-card mt-5 mb-4 px-5 pb-5 bg-[#D9D9D9] rounded-[2rem] shadow-sm">
      <View className="flex-row justify-between items-center">
        <Text className="text-2xl font-bold my-5">Good Afternoon, {name}</Text>
        <MaterialIcons name="open-in-new" size={20} color="black" />
      </View>

      <View className="flex-row justify-between items-center">
        <View className="flex-row">
          <Image
            source={
              weatherData
                ? {
                    uri: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`,
                  }
                : images.sun
            }
            className="w-16 h-16"
          />
          <View className="ml-3">
            <Text className="text-xl capitalize">
              {weatherDescription || "Life's better on two wheels."}
            </Text>
            <View className="flex-row mt-1 items-center">
              <Entypo name="location-pin" size={15} color="black" />
              <Text className="ml-1">{location}</Text>
            </View>
            <View className="flex-row mt-1 items-center">
              <Fontisto name="date" size={12} color="black" />
              <Text className="text-black ml-2">{formattedDate}</Text>
            </View>
            {weatherData && (
              <View className="flex-row mt-2">
                <View className="flex-row items-center mr-4">
                  <Fontisto name="blood-drop" size={12} color="black" />
                  <Text className="ml-1">{humidity}%</Text>
                </View>
                <View className="flex-row items-center">
                  <Fontisto name="wind" size={12} color="black" />
                  <Text className="ml-1">{windSpeed} m/s</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {weatherData && (
          <View className="items-end">
            <Text className="text-4xl font-bold">{tempCelsius}°C</Text>
            <Text className="text-gray-500 mt-1">
              Feels like {Math.round(weatherData.main.feels_like - 273.15)}°C
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default Weather;
