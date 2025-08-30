const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
function getBaseUrl(): string {
  return API_KEY || "";
}
export interface WeatherData {
  name: string;
  sys: {
    country: string;
  };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
}

export const fetchWeatherByCity = async (
  city: string
): Promise<WeatherData> => {
  try {
    console.log("key",getBaseUrl())
    const response = await fetch(`${BASE_URL}?q=${city}&appid=${API_KEY}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("City not found");
      } else if (response.status === 401) {
        throw new Error("Invalid API key");
      } else {
        throw new Error("Failed to fetch weather data");
      }
    }

    const data: WeatherData = await response.json();
    return data;
  } catch (error) {
    throw new Error((error as Error).message || "Failed to fetch weather data");
  }
};

export const fetchWeatherByCoords = async (
  lat: number,
  lon: number
): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Location not found");
    }

    const data: WeatherData = await response.json();
    return data;
  } catch (error) {
    throw new Error((error as Error).message || "Failed to fetch weather data");
  }
};
