import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosRequestHeaders } from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
function getBaseUrl(): string {
  return API_URL || "";
}

axios.interceptors.request.use(
  async function (config) {
    config.baseURL = getBaseUrl();

    try {
      const storedToken = await AsyncStorage.getItem("token");
      const token = storedToken ? `Bearer ${storedToken}` : "";

      if (!config.headers) {
        config.headers = {} as AxiosRequestHeaders;
      }

      if (token) {
        config.headers.Authorization = token;
        console.log(getBaseUrl());
        console.log("Authorization header set:", token);
      }

      config.validateStatus = (status: number) => status >= 200 && status < 300;
    } catch (error) {
      console.error(
        "Error setting Authorization header or validateStatus:",
        error
      );
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  function (error) {
    return Promise.reject(error?.response ?? error);
  }
);
