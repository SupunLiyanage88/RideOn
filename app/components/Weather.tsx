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
    <View
      style={{
        marginTop: 20,
        marginBottom: 16,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 20,
        backgroundColor: "#D9D9D9",
        borderRadius: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginVertical: 20,
          }}
        >
          Good Afternoon, {name}
        </Text>
        <MaterialIcons name="open-in-new" size={20} color="black" />
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <Image
            source={
              weatherData
                ? {
                    uri: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`,
                  }
                : images.sun
            }
            style={{ width: 64, height: 64 }}
          />
          <View style={{ marginLeft: 12 }}>
            <Text
              style={{
                fontSize: 20,
                textTransform: "capitalize",
              }}
            >
              {weatherDescription || "Life's better on two wheels."}
            </Text>
            <View
              style={{
                flexDirection: "row",
                marginTop: 4,
                alignItems: "center",
              }}
            >
              <Entypo name="location-pin" size={15} color="black" />
              <Text style={{ marginLeft: 4 }}>{location}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                marginTop: 4,
                alignItems: "center",
              }}
            >
              <Fontisto name="date" size={12} color="black" />
              <Text style={{ color: "black", marginLeft: 8 }}>
                {formattedDate}
              </Text>
            </View>
            {weatherData && (
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginRight: 16,
                  }}
                >
                  <Fontisto name="blood-drop" size={12} color="black" />
                  <Text style={{ marginLeft: 4 }}>{humidity}%</Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Fontisto name="wind" size={12} color="black" />
                  <Text style={{ marginLeft: 4 }}>{windSpeed} m/s</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {weatherData && (
          <View style={{ alignItems: "flex-end" }}>
            <Text
              style={{
                fontSize: 36,
                fontWeight: "bold",
              }}
            >
              {tempCelsius}°C
            </Text>
            <Text
              style={{
                color: "#6B7280",
                marginTop: 4,
              }}
            >
              Feels like {Math.round(weatherData.main.feels_like - 273.15)}°C
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default Weather;