import "@/api/weather";
import { WeatherData } from "@/api/weather";
import { images } from "@/constants/images";
import UseCurrentUser from "@/hooks/useCurrentUser";
import Entypo from "@expo/vector-icons/Entypo";
import Fontisto from "@expo/vector-icons/Fontisto";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { Image, Text, View } from "react-native";

interface WeatherProps {
  location: string;
  weatherData: WeatherData | null | undefined;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

const getWeatherGradient = (weatherData: WeatherData | null | undefined): [string, string] => {
  if (!weatherData) return ["#083A4C", "#37A77D"];
  
  const weather = weatherData.weather[0].description.toLowerCase();
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour > 18;
  
  if (weather.includes("clear")) {
    return isNight ? ["#083A4C", "#37A77D"] : ["#37A77D", "#083A4C"];
  } else if (weather.includes("rain")) {
    return ["#083A4C", "#37A77D"];
  } else if (weather.includes("cloud")) {
    return ["#37A77D", "#083A4C"];
  } else if (weather.includes("snow")) {
    return ["#083A4C", "#37A77D"];
  }
  return ["#083A4C", "#37A77D"];
};

const Weather: React.FC<WeatherProps> = ({ location, weatherData }) => {
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
  };
  const formattedDate = today.toLocaleDateString(undefined, options);

  const tempCelsius = weatherData
    ? Math.round(weatherData.main.temp - 273.15)
    : null;
  const weatherDescription = weatherData
    ? weatherData.weather[0].description
    : "Perfect day for a ride";
  const humidity = weatherData ? weatherData.main.humidity : "";
  const windSpeed = weatherData ? Math.round(weatherData.wind.speed * 3.6) : ""; // Convert m/s to km/h
  const { user, status } = UseCurrentUser();
  const name = user?.userName || "Rider";
  
  const gradientColors = getWeatherGradient(weatherData);
  
  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        marginTop: 10,
        marginBottom: 20,
        marginHorizontal: 16,
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      <View style={{ padding: 24 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.8)",
                fontWeight: "500",
              }}
            >
              {getGreeting()}
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "white",
                marginTop: 2,
              }}
            >
              {name}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.8)",
              }}
            >
              {formattedDate}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <Entypo name="location-pin" size={14} color="rgba(255,255,255,0.8)" />
              <Text
                style={{
                  marginLeft: 4,
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 14,
                }}
              >
                {location}
              </Text>
            </View>
          </View>
        </View>

        {/* Weather Info */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={
                  weatherData
                    ? {
                        uri: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`,
                      }
                    : images.sun
                }
                style={{ width: 60, height: 60 }}
              />
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text
                  style={{
                    fontSize: 48,
                    fontWeight: "300",
                    color: "white",
                    lineHeight: 52,
                  }}
                >
                  {tempCelsius || "--"}°
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: "rgba(255,255,255,0.9)",
                    textTransform: "capitalize",
                    marginTop: -4,
                  }}
                >
                  {weatherDescription}
                </Text>
              </View>
            </View>

            {/* Weather Details */}
            {weatherData && (
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Fontisto name="blood-drop" size={16} color="rgba(255,255,255,0.8)" />
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: 12,
                      marginTop: 6,
                    }}
                  >
                    Humidity
                  </Text>
                  <Text
                    style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "600",
                      marginTop: 2,
                    }}
                  >
                    {humidity}%
                  </Text>
                </View>
                
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Fontisto name="wind" size={16} color="rgba(255,255,255,0.8)" />
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: 12,
                      marginTop: 6,
                    }}
                  >
                    Wind
                  </Text>
                  <Text
                    style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "600",
                      marginTop: 2,
                    }}
                  >
                    {windSpeed} km/h
                  </Text>
                </View>
                
                <View style={{ flex: 1, alignItems: "center" }}>
                  <MaterialIcons name="thermostat" size={16} color="rgba(255,255,255,0.8)" />
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: 12,
                      marginTop: 6,
                    }}
                  >
                    Feels like
                  </Text>
                  <Text
                    style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "600",
                      marginTop: 2,
                    }}
                  >
                    {weatherData ? Math.round(weatherData.main.feels_like - 273.15) : "--"}°
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

export default Weather;