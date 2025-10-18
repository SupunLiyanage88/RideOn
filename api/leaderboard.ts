// src/api/leaderboard.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Use your actual API base URL - make sure this is correct
const API = process.env.EXPO_PUBLIC_API_BASE_URL;

export interface LeaderboardEntry {
  userId: string;
  totalRCSpent: number;
  rides: number;
  userName?: string;
  email?: string;
}

export interface LeaderboardResponse {
  page: number;
  limit: number;
  data: LeaderboardEntry[];
  includeRankFor?: {
    userId: string;
    rank: number | null;
    totalRCSpent: number;
  } | null;
}

export interface LeaderboardParams {
  period?: "all" | "month" | "week" | "day";
  page?: number;
  limit?: number;
  includeRankFor?: string;
  _t?: number; // cache-buster
}

async function getAuthHeaders() {
  try {
    const token = await AsyncStorage.getItem("token");
    console.log(" Token from storage:", token ? "Yes" : "No");
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    return headers;
  } catch (error) {
    console.error(" Error getting auth headers:", error);
    return {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
  }
}

/**
 * Fetch leaderboard data
 * GET /api/leaderboard
 */
export async function fetchLeaderboard(
  params: LeaderboardParams = {}
): Promise<LeaderboardResponse> {
  try {
    const headers = await getAuthHeaders();

    if (!params.includeRankFor) {
      // Always include current userId
      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        params.includeRankFor = userId;
      }
    }

    const queryParams: Record<string, any> = {
      period: params.period || "all",
      page: params.page || 1,
      limit: params.limit || 50,
      includeRankFor: params.includeRankFor, // guaranteed to exist
      _t: params._t || Date.now(),
    };

    console.log("Fetching leaderboard with params:", queryParams);

    const response = await axios.get(`${API}/api/leaderboard`, {
      headers,
      params: queryParams,
      timeout: 15000,
      validateStatus: (status) => status < 500,
    });

    console.log("Leaderboard API response:", response.data);

    if (response.status >= 400) {
      throw new Error(
        response.data?.message || `API Error: ${response.status}`
      );
    }

    return response.data;
    
  } catch (error: any) {
    console.error(" Leaderboard API Error:", {
      name: error.name,
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
    });

    // More specific error messages
    if (error.code === 'ECONNREFUSED') {
      throw new Error("Cannot connect to server. Please check if the server is running.");
    } else if (error.code === 'NETWORK_ERROR') {
      throw new Error("Network error. Please check your internet connection.");
    } else if (error.code === 'TIMEOUT') {
      throw new Error("Request timeout. Server is taking too long to respond.");
    } else if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      
      if (status === 401) {
        throw new Error("Authentication failed. Please login again.");
      } else if (status === 403) {
        throw new Error("You don't have permission to access leaderboard.");
      } else if (status === 404) {
        throw new Error("Leaderboard endpoint not found.");
      } else {
        throw new Error(`Server error: ${status} - ${message}`);
      }
    } else if (error.request) {
      // Request was made but no response received
      throw new Error("No response from server. Please try again.");
    } else {
      // Something else happened
      throw new Error("Failed to fetch leaderboard: " + error.message);
    }
  }
}

/**
 * Test API connection
 */
export async function testLeaderboardAPI(): Promise<boolean> {
  try {
    console.log(" Testing API connection...");
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API}/api/leaderboard`, {
      headers,
      params: { period: "all", limit: 1, _t: Date.now() },
      timeout: 10000,
    });
    console.log(" API test successful:", response.status);
    return true;
  } catch (error) {
    console.error(" API test failed:", error);
    return false;
  }
}