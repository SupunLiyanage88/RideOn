// src/api/rewards.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API = process.env.EXPO_PUBLIC_API_BASE_URL;

export interface MonthlyReward {
  _id: string;
  month: string;
  userId: string;
  rank: number | null;
  rewardRC: number;
  createdAt: string;
  updatedAt?: string;
}

export interface MyRewardsResponse {
  success: boolean;
  count: number;
  data: MonthlyReward[];
}

async function getAuthHeaders() {
  try {
    const token = await AsyncStorage.getItem("token");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  } catch (error) {
    console.error(" MyRewards getAuthHeaders error:", error);
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }
}

/**
 * Fetch the authenticated rider's monthly rewards history.
 */
export async function fetchMyRewards(): Promise<MyRewardsResponse> {
  try {
    const headers = await getAuthHeaders();

    const response = await axios.get(`${API}/api/rewards`, {
      headers,
      timeout: 15000,
      validateStatus: (status) => status < 500,
    });

    if (response.status >= 400) {
      const message =
        response.data?.message || `Rewards API error: ${response.status}`;
      throw new Error(message);
    }

    const payload = response.data as MyRewardsResponse | undefined;

    if (!payload || !Array.isArray(payload.data)) {
      throw new Error("Unexpected response from rewards API");
    }

    return payload;
  } catch (error: any) {
    console.error(" MyRewards API error:", {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      status: error?.response?.status,
      response: error?.response?.data,
    });

    if (error.code === "ECONNREFUSED") {
      throw new Error(
        "Cannot connect to server. Please check if the server is running."
      );
    }

    if (error.code === "NETWORK_ERROR") {
      throw new Error("Network error. Please check your internet connection.");
    }

    if (error.code === "TIMEOUT" || error.code === "ECONNABORTED") {
      throw new Error("Request timeout. Server is taking too long to respond.");
    }

    if (error.response) {
      const status = error.response.status;
      const message =
        error.response.data?.message || error.response.statusText || "";

      if (status === 401) {
        throw new Error("Authentication failed. Please login again.");
      }

      if (status === 403) {
        throw new Error("You do not have permission to view rewards.");
      }

      if (status === 404) {
        throw new Error("Rewards endpoint not found.");
      }

      throw new Error(`Server error: ${status}${message ? ` - ${message}` : ""}`);
    }

    if (error.request) {
      throw new Error("No response from server. Please try again.");
    }

    throw new Error(
      "Failed to load monthly rewards. " + (error?.message || "Please try again.")
    );
  }
}
