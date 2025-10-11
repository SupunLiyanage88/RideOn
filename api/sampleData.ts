export const StationData = {
  id: 1,
  stationName: "Malabe Station 01",
  location: "Maalabe, Sri Lanka",
  availability: "Hybrid",
  lattitude: 7.2906,
  longitude: 80.6337,
};

export const WeatherSampleData = {
  base: "stations",
  clouds: {
    all: 5, // a few light clouds
  },
  cod: 200,
  coord: {
    lat: 6.9197,
    lon: 79.9754,
  },
  dt: 1760235000, // afternoon timestamp
  id: 1234378,
  main: {
    feels_like: 305.15, // warmer during afternoon
    grnd_level: 1008,
    humidity: 55,
    pressure: 1011,
    sea_level: 1011,
    temp: 304.15,
    temp_max: 305.15,
    temp_min: 301.15,
  },
  name: "Mulleriyawa",
  sys: {
    country: "LK",
    sunrise: 1760228801,
    sunset: 1760271974,
  },
  timezone: 19800,
  visibility: 10000,
  weather: [
    {
      id: 800,
      main: "Clear",
      description: "sunny afternoon",
      icon: "01d", // 'd' indicates daytime / afternoon
    },
  ],
  wind: {
    deg: 120,
    gust: 4.2,
    speed: 2.8,
  },
};

