import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import "./index";

const API = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!API) {
  console.warn("EXPO_PUBLIC_API_BASE_URL is not defined. Payment APIs will fail.");
}

export type PayHereSession = {
  success: boolean;
  endpoint: string;
  payload: Record<string, string | boolean | number>;
};

export type PayHereStatus = {
  success: boolean;
  status: string;
};

export type PaymentRecord = {
  _id: string;
  orderId: string;
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  amount: number;
  currency: string;
  userId?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    mobile?: string;
  } | null;
  packageId?: {
    _id: string;
    name?: string;
    price?: number;
  } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PaymentListResponse = {
  success: boolean;
  data: PaymentRecord[];
};

async function withAuthHeaders() {
  const token = await AsyncStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

export async function createPayHereSession(packageId: string) {
  const headers = await withAuthHeaders();
  const res = await axios.post<PayHereSession>(
    `${API}/api/payments/payhere/session`,
    { packageId },
    { headers }
  );
  return res.data;
}

export async function fetchPayHereStatus(orderId: string) {
  const headers = await withAuthHeaders();
  const res = await axios.get<PayHereStatus>(
    `${API}/api/payments/payhere/status/${orderId}`,
    { headers }
  );
  return res.data;
}

export async function fetchPayments() {
  const headers = await withAuthHeaders();
  const res = await axios.get<PaymentListResponse>(`${API}/api/payments`, {
    headers,
  });
  return res.data?.data ?? [];
}

export async function deletePayment(id: string) {
  const headers = await withAuthHeaders();
  const res = await axios.delete(`${API}/api/payments/${id}`, {
    headers,
  });
  return res.data;
}
