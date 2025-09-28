// api/subscription.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
const API = process.env.EXPO_PUBLIC_API_BASE_URL;

// Define the type for a subscription package
export interface SubscriptionPackage {
  _id?: string; 
  name: string;
  rc: string;
  price: string;
  recommended: boolean;
  icon: string;
  description: string;
  isActive: boolean;
}



export async function fetchSubscriptionPackages() {
  const token = await AsyncStorage.getItem("token");
  const res = await axios.get(`${API}/api/packages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

