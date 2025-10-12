import "@/api/weather";
import { WeatherData } from "@/api/weather";
import { images } from "@/constants/images";
import Entypo from "@expo/vector-icons/Entypo";
import Fontisto from "@expo/vector-icons/Fontisto";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, Image, Text, View } from "react-native";

interface WeatherProps {
  location: string;
  weatherData: WeatherData | null | undefined;
}

const getGreeting = (weatherData: WeatherData | null | undefined) => {
  if (!weatherData) return "Perfect day for a ride!";
  
  const weather = weatherData.weather[0].description.toLowerCase();
  const temp = Math.round(weatherData.main.temp - 273.15);

  console.log(weatherData);
  
  if (weather.includes("rain") || weather.includes("drizzle")) {
    return "It's raining, take an umbrella!";
  } else if (weather.includes("storm") || weather.includes("thunder")) {
    return "Stormy weather, stay safe!";
  } else if (weather.includes("fog") || weather.includes("mist")) {
    return "Foggy conditions, ride with caution!";
  } else if (weather.includes("clear") && temp > 25) {
    return "Perfect sunny day for a ride!";
  } else if (weather.includes("clear") && temp < 10) {
    return "Clear but chilly, dress warm!";
  } else if (weather.includes("cloud")) {
    return "Nice cloudy day for cycling!";
  } else if (temp > 30) {
    return "Hot day ahead, stay hydrated!";
  } else if (temp < 5) {
    return "Bundle up, it's quite cold!";
  } else {
    return "Great weather for a ride!";
  }
};

const getWeatherGradient = (weatherData: WeatherData | null | undefined): [string, string] => {
  if (!weatherData) return ["#4FC3F7", "#29B6F6"]; // Default sky blue
  
  const weather = weatherData.weather[0].description.toLowerCase();
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour > 18;
  const temp = Math.round(weatherData.main.temp - 273.15);
  
  if (weather.includes("clear")) {
    if (isNight) {
      return ["#1A237E", "#3949AB"]; // Night blue
    } else if (temp > 30) {
      return ["#FF6B35", "#F7931E"]; // Hot orange
    } else {
      return ["#42A5F5", "#1E88E5"]; // Bright sunny blue
    }
  } else if (weather.includes("rain") || weather.includes("drizzle")) {
    return ["#546E7A", "#37474F"]; // Rainy grey-blue
  } else if (weather.includes("storm") || weather.includes("thunder")) {
    return ["#424242", "#212121"]; // Dark stormy
  } else if (weather.includes("snow")) {
    return ["#B0BEC5", "#90A4AE"]; // Snowy grey-white
  } else if (weather.includes("fog") || weather.includes("mist")) {
    return ["#78909C", "#607D8B"]; // Misty grey
  } else if (weather.includes("cloud")) {
    if (isNight) {
      return ["#455A64", "#37474F"]; // Night clouds
    } else {
      return ["#81C784", "#66BB6A"]; // Cloudy green
    }
  } else if (temp < 5) {
    return ["#B39DDB", "#9575CD"]; // Cold purple
  }
  
  return ["#4FC3F7", "#29B6F6"]; // Default
};

const getWeatherEffects = (weatherData: WeatherData | null | undefined) => {
  if (!weatherData) return { shadowColor: "#4FC3F7", shadowOpacity: 0.3 };
  
  const weather = weatherData.weather[0].description.toLowerCase();
  
  if (weather.includes("rain") || weather.includes("drizzle")) {
    return { shadowColor: "#546E7A", shadowOpacity: 0.4 };
  } else if (weather.includes("storm") || weather.includes("thunder")) {
    return { shadowColor: "#212121", shadowOpacity: 0.6 };
  } else if (weather.includes("snow")) {
    return { shadowColor: "#B0BEC5", shadowOpacity: 0.2 };
  } else if (weather.includes("clear")) {
    return { shadowColor: "#42A5F5", shadowOpacity: 0.3 };
  } else if (weather.includes("cloud")) {
    return { shadowColor: "#81C784", shadowOpacity: 0.3 };
  }
  
  return { shadowColor: "#4FC3F7", shadowOpacity: 0.3 };
};

const getWeatherIcon = (weatherData: WeatherData | null | undefined) => {
  if (!weatherData) return "🌤️";
  
  const weather = weatherData.weather[0].description.toLowerCase();
  
  if (weather.includes("rain")) return "🌧️";
  if (weather.includes("drizzle")) return "🌦️";
  if (weather.includes("storm") || weather.includes("thunder")) return "⛈️";
  if (weather.includes("snow")) return "❄️";
  if (weather.includes("fog") || weather.includes("mist")) return "🌫️";
  if (weather.includes("clear")) return "☀️";
  if (weather.includes("cloud")) return "☁️";
  
  return "🌤️";
};

// Animated Cloud Component
const AnimatedCloud: React.FC<{ delay?: number; size?: number; opacity?: number }> = ({ 
  delay = 0, 
  size = 60, 
  opacity = 0.3 
}) => {
  const cloudAnim = useRef(new Animated.Value(-100)).current;
  const { width } = Dimensions.get('window');

  useEffect(() => {
    const animateCloud = () => {
      cloudAnim.setValue(-100);
      Animated.timing(cloudAnim, {
        toValue: width + 100,
        duration: 20000 + delay * 2000,
        useNativeDriver: true,
      }).start(() => animateCloud());
    };

    const timeout = setTimeout(animateCloud, delay);
    return () => clearTimeout(timeout);
  }, [cloudAnim, delay, width]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: Math.random() * 40,
        transform: [{ translateX: cloudAnim }],
        opacity,
      }}
    >
      <Text style={{ fontSize: size, color: 'rgba(255,255,255,0.4)' }}>☁️</Text>
    </Animated.View>
  );
};

// Animated Rain Drop Component
const AnimatedRainDrop: React.FC<{ delay?: number; left?: number }> = ({ 
  delay = 0, 
  left = Math.random() * 300 
}) => {
  const rainAnim = useRef(new Animated.Value(-10)).current;
  const { height } = Dimensions.get('window');

  useEffect(() => {
    const animateRain = () => {
      rainAnim.setValue(-10);
      Animated.timing(rainAnim, {
        toValue: 200,
        duration: 1000 + Math.random() * 500,
        useNativeDriver: true,
      }).start(() => animateRain());
    };

    const timeout = setTimeout(animateRain, delay);
    return () => clearTimeout(timeout);
  }, [rainAnim, delay]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left,
        transform: [{ translateY: rainAnim }],
        opacity: 0.6,
      }}
    >
      <View
        style={{
          width: 2,
          height: 10,
          backgroundColor: 'rgba(255,255,255,0.5)',
          borderRadius: 1,
        }}
      />
    </Animated.View>
  );
};

// Animated Snow Flake Component
const AnimatedSnowFlake: React.FC<{ delay?: number; left?: number }> = ({ 
  delay = 0, 
  left = Math.random() * 300 
}) => {
  const snowAnim = useRef(new Animated.Value(-10)).current;
  const swayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateSnow = () => {
      snowAnim.setValue(-10);
      swayAnim.setValue(0);
      
      Animated.parallel([
        Animated.timing(snowAnim, {
          toValue: 200,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(swayAnim, {
              toValue: 10,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(swayAnim, {
              toValue: -10,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start(() => animateSnow());
    };

    const timeout = setTimeout(animateSnow, delay);
    return () => clearTimeout(timeout);
  }, [snowAnim, swayAnim, delay]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left,
        transform: [
          { translateY: snowAnim },
          { translateX: swayAnim }
        ],
        opacity: 0.8,
      }}
    >
      <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>❄️</Text>
    </Animated.View>
  );
};

// Weather Background Animation Component
const WeatherBackgroundAnimation: React.FC<{ weatherData: WeatherData | null | undefined }> = ({ weatherData }) => {
  if (!weatherData) return null;

  const weather = weatherData.weather[0].description.toLowerCase();

  if (weather.includes("cloud")) {
    return (
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
        {[...Array(3)].map((_, index) => (
          <AnimatedCloud
            key={index}
            delay={index * 3000}
            size={40 + index * 10}
            opacity={0.2 + index * 0.1}
          />
        ))}
      </View>
    );
  }

  if (weather.includes("rain") || weather.includes("drizzle")) {
    return (
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
        {[...Array(15)].map((_, index) => (
          <AnimatedRainDrop
            key={index}
            delay={index * 200}
            left={Math.random() * 300}
          />
        ))}
      </View>
    );
  }

  if (weather.includes("snow")) {
    return (
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
        {[...Array(10)].map((_, index) => (
          <AnimatedSnowFlake
            key={index}
            delay={index * 500}
            left={Math.random() * 300}
          />
        ))}
      </View>
    );
  }

  return null;
};

const Weather: React.FC<WeatherProps> = ({ location, weatherData }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, slideAnim]);

  const tempCelsius = weatherData
    ? Math.round(weatherData.main.temp - 273.15)
    : null;
  const weatherDescription = weatherData
    ? weatherData.weather[0].description
    : "Perfect day for a ride";
  const humidity = weatherData ? weatherData.main.humidity : "";
  const windSpeed = weatherData ? Math.round(weatherData.wind.speed * 3.6) : ""; // Convert m/s to km/h
  
  const gradientColors = getWeatherGradient(weatherData);
  const weatherEffects = getWeatherEffects(weatherData);
  const weatherEmoji = getWeatherIcon(weatherData);
  
  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          { scale: scaleAnim },
          { translateY: slideAnim }
        ],
      }}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          marginTop: 8,
          marginBottom: 8,
          marginHorizontal: 16,
          borderRadius: 16,
          shadowColor: weatherEffects.shadowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: weatherEffects.shadowOpacity,
          shadowRadius: 10,
          elevation: 8,
          overflow: 'hidden',
        }}
      >
        {/* Animated Weather Background */}
        <WeatherBackgroundAnimation weatherData={weatherData} />
        
        <View style={{ padding: 16, position: 'relative', zIndex: 1 }}>
          {/* Compact Header with location and greeting */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 16, marginRight: 6 }}>{weatherEmoji}</Text>
            <Text
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.9)",
                fontWeight: "600",
                flex: 1,
              }}
            >
              {getGreeting(weatherData)}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Entypo name="location-pin" size={12} color="rgba(255,255,255,0.8)" />
              <Text
                style={{
                  marginLeft: 2,
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 12,
                }}
              >
                {location}
              </Text>
            </View>
          </View>

          {/* Compact Weather Info */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Temperature and Icon */}
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: 12,
                padding: 6,
                marginRight: 12,
              }}>
                <Image
                  source={
                    weatherData
                      ? {
                          uri: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`,
                        }
                      : images.sun
                  }
                  style={{ width: 40, height: 40 }}
                />
              </View>
              <View>
                <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                  <Text
                    style={{
                      fontSize: 36,
                      fontWeight: "200",
                      color: "white",
                      lineHeight: 40,
                    }}
                  >
                    {tempCelsius || "--"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "300",
                      color: "rgba(255,255,255,0.8)",
                      marginLeft: 2,
                    }}
                  >
                    °C
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.9)",
                    textTransform: "capitalize",
                    fontWeight: "500",
                  }}
                >
                  {weatherDescription}
                </Text>
              </View>
            </View>

            {/* Compact Weather Details */}
            {weatherData && (
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  borderRadius: 12,
                  padding: 8,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              >
                <View style={{ alignItems: "center", marginHorizontal: 8 }}>
                  <Fontisto name="blood-drop" size={12} color="rgba(255,255,255,0.8)" />
                  <Text
                    style={{
                      color: "white",
                      fontSize: 12,
                      fontWeight: "600",
                      marginTop: 2,
                    }}
                  >
                    {humidity}%
                  </Text>
                </View>
                
                <View style={{ alignItems: "center", marginHorizontal: 8 }}>
                  <Fontisto name="wind" size={12} color="rgba(255,255,255,0.8)" />
                  <Text
                    style={{
                      color: "white",
                      fontSize: 12,
                      fontWeight: "600",
                      marginTop: 2,
                    }}
                  >
                    {windSpeed}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export default Weather;